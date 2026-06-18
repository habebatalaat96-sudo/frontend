import React, { useEffect, useState } from 'react';
import {
  Shield, Users, Building2, Star, Settings, LogOut, Search,
  Filter, MoreVertical, Edit, Trash2, Ban, CheckCircle, XCircle,
  Eye, TrendingUp, DollarSign, Calendar, AlertCircle, Mail, Phone,
  MapPin, Clock, Plus, Download, Upload, RefreshCw, Database,
  BarChart3, FileText, Bell, MessageSquare, Save, X, Smartphone,
  Globe, Lock, Zap, User, ArrowLeft
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { socket } from "./socket.context";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { API_URL } from "../config/api";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'suspended' | 'inactive';
  bookings: number;
  totalSpent: number;
  loyaltyPoints: number; // ✅ جديد
  tier: string;          // ✅ جديد
}

interface PendingUpdate {
  _id: string;

  business_number: number;

  // بيانات البزنس الحالية
  name: string;
  businessName?: string;

  location: string;

  photo_url?: string[];

  pending_update: {
    status: 'pending' | 'approved' | 'rejected';

    requested_at: string;

    admin_note?: string;

    requested_by: {
      name: string;
      email: string;
    };

    data: {
      // بيانات التعديل الجديدة
      name?: string;

      businessName?: string;

      description?: string;

      phone_number?: string;

      location?: string;

      location_url_on_maps?: string;

      amenities?: string[];

      working_hours?: string[];

      photo_url?: string[];

      businessLogo?: string;

      services?: {
        name?: string;

        description?: string;

        duration?: string;

        service_category?: string;

        price_type?: 'fixed' | 'range';

        price?: number;

        min_price?: number;

        max_price?: number;

        offer?: string;

        price_after?: number;
      }[];
    };
  };
}

interface Business {
  id: string;
  name: string;
  category: string;
  owner: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  rating: number;
  reviews: number;
  revenue: number;
  joinDate: string;
  businessCode: string;
}

interface Review {
  _id: string;
  businessName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
  images?: string[];
}

interface Booking {
  _id: string;
  businessName: string;
  businessImage: string;
  userId: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | string;
  bookingDate: string;
  status: "upcoming" | "completed" | "cancelled" | "no_show";

  // ✅ أضف الحقول دي
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected' | null;
  instapayScreenshot?: string;
  bookingAmount?: number;
  selectedService?: {
    name?: string;
    price?: number;
  };
}
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<'user-analytics' | 'revenue' | 'activity-logs' | null>(null);
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'users' | 'businesses' | 'reviews' | 'businessUpdates' | 'bookings' | 'reports' | 'settings'|"tickets"
  >('overview');

  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddBusinessDialog, setShowAddBusinessDialog] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);
  const [pendingUpdates, setPendingUpdates] = React.useState<PendingUpdate[]>([]);
  const [reviewNote, setReviewNote] = React.useState('');
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveBusinessUpdates, setAutoApproveBusinessUpdates] = useState(false);
  const [autoApproveReviews, setAutoApproveReviews] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '' });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    category: 'gyms',
    phone: '',
    address: '',
    description: '',
    location_url_on_maps: '',
    amenities: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);  // ✅ من الـ DB
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allowUserRegistration, setAllowUserRegistration] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null)
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  type ExportTarget = { type: 'all' } | { type: 'collection'; name: string } | null;

  const [exportTarget, setExportTarget] = useState<ExportTarget>(null);

  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [templatesData, setTemplatesData] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<{
    name: string;
    key: string;
    subject: string;
    heading: string;
    body: string;
    footer: string;
  } | null>(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const getLevelStyles = (level: 'success' | 'warning' | 'error' | 'info') => {
    const map = {
      success: {
        dot: { backgroundColor: '#4ade80' },
        badge: { backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' },
      },
      warning: {
        dot: { backgroundColor: '#facc15' },
        badge: { backgroundColor: 'rgba(234,179,8,0.2)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)' },
      },
      error: {
        dot: { backgroundColor: '#f87171' },
        badge: { backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
      },
      info: {
        dot: { backgroundColor: '#60a5fa' },
        badge: { backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' },
      },
    };
    return map[level];
  };

  const TEMPLATE_KEYS: Record<string, string> = {
    "Welcome Email": "welcome",
    "Business Approval": "businessApproval",
    "Booking Confirmation": "bookingConfirmation",
    "Review Request": "reviewRequest",
    "Password Reset": "otp",
    "Payment Receipt": "paymentReceipt",
    "Review Rejection": "reviewRejection",
    "Business Rejection": "businessRejection",
    "Payment Rejected": "paymentRejected",
    "Account Suspended": "accountSuspended",
  };
  const [downloadMenuOpen, setDownloadMenuOpen] = useState<string | null>(null);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalBusinesses: businesses.length + claims.length,
    activeBusinesses: businesses.filter(b => b.status === 'active').length,
    pendingBusinesses: businesses.filter(b => b.status === 'pending').length + claims.filter(c => c.status === 'pending').length,
    totalReviews: reviews.length,
    pendingReviews: reviews.filter(r => r.status === 'pending').length,
    totalRevenue: businesses.reduce((sum, b) => sum + b.revenue, 0),
    pendingUpdates: pendingUpdates.length, 
    totalbookings: bookings.length,
    completeBookings: bookings.filter(u => u.status === 'completed').length
  };

  const fetchTickets = async () => {
    try {
      const token =
        localStorage.getItem("adminToken");

      const res = await axios.get(
        `${API_URL}/admin/support`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchAnalytics = async () => {

    try {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const res =
        await axios.get(
          `${API_URL}/admin/analytics`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setAnalytics(
        res.data.data
      );

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!showEmailTemplates) return;
    const token = localStorage.getItem("adminToken");
    fetch(`${API_URL}/admin/email-templates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        console.log("templates loaded:", res.data) // ✅ شوف إيه اللي بييجي
        if (res.data) setTemplatesData(res.data)
      })
      .catch(() => toast.error("Failed to load templates"));
  }, [showEmailTemplates]);

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        `${API_URL}/admin/email-templates/${selectedTemplate.key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: selectedTemplate.subject,
            heading: selectedTemplate.heading,
            body: selectedTemplate.body,
            footer: selectedTemplate.footer ?? "",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to save template"); return; }

      toast.success(`${selectedTemplate.name} updated successfully!`);

      setTemplatesData((prev) => ({
        ...prev,
        [selectedTemplate.key]: {
          subject: selectedTemplate.subject,
          heading: selectedTemplate.heading,
          body: selectedTemplate.body,
          footer: selectedTemplate.footer ?? "",
          _customized: true,  // ✅
        },
      }));

      setShowEditTemplate(false);
    } catch (err) {
      console.error("Save error:", err)
      toast.error("Network error");
    }
  };

  const handleDownloadFile = async (url: string, fileName = "business-proof.pdf") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleResetTemplate = async () => {
    if (!selectedTemplate) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        `${API_URL}/admin/email-templates/${selectedTemplate.key}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) { toast.error("Failed to reset template"); return; }
      toast.success(`${selectedTemplate.name} reset to default`);
      setTemplatesData((prev) => {
        const next = { ...prev };
        delete next[selectedTemplate.key];
        return next;
      });
      setShowEditTemplate(false);
    } catch {
      toast.error("Network error");
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!reply.trim()) {
      toast.error("Please write a reply before sending.");
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/admin/support/${ticketId}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Reply sent successfully! User has been notified via email.");
      setReply("");
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.log(err);
      toast.error("Failed to send reply. Please try again.");
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {

      const token =
        localStorage.getItem("adminToken");

      const response = await fetch(
        `${API_URL}/admin/support/${ticketId}/close`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      fetchTickets();

    } catch (err) {
      console.log(err);
    }
  };





  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/get-settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
        if (res.status === 401) { toast.error("Session expired"); return; }
        const json = await res.json();
        const d = json.data;

        setMaintenanceMode(d.maintenanceMode);
        setAutoApproveBusinessUpdates(d.autoApproveBusinessUpdates);
        setAutoApproveReviews(d.autoApproveReviews);
        setNotifSettings({
          emailNotifications: d.emailNotifications ?? true,
        });
        setAllowUserRegistration(d.allowUserRegistration ?? true);
      } catch { toast.error("Failed to load settings"); }
    };
    fetchAllSettings();
  }, []); // ← مرة واحدة بس


  const [activityLogs, setActivityLogs] = useState<{
    id: number;
    timestamp: string;
    user: string;
    action: string;
    target: string;
    level: 'success' | 'warning' | 'error' | 'info';
  }[]>([]);

  const addActivityLog = async (
    action: string,
    target: string,
    level: 'success' | 'warning' | 'error' | 'info'
  ) => {
    const token = localStorage.getItem("adminToken");
    let adminName = localStorage.getItem("adminName") || '';

    if (!adminName) {
      try {
        const payload = JSON.parse(atob(token!.split('.')[1]));
        adminName = payload?.name || payload?.firstName || payload?.email || '';
      } catch {
        adminName = '';
      }
    }

    setActivityLogs(prev => [{
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      user: adminName,
      action,
      target,
      level,
    }, ...prev]);

    try {
      await fetch(`${API_URL}/admin/activity-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, target, level }),
      });
    } catch (err) {
      console.error("Failed to save activity log:", err);
    }
  };

  const handleSaveSettings = async (settingType: string) => {
    console.log("Saving settings:", {
      maintenanceMode,
      autoApproveBusinessUpdates,
      autoApproveReviews,
    });
    try {
      const res = await fetch(`${API_URL}/settings/update-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`, // ✅
        },
        body: JSON.stringify({
          maintenanceMode,
          autoApproveBusinessUpdates,
          autoApproveReviews,
          allowUserRegistration
        }),
      });

      if (res.status === 401) {
        toast.error("Session expired, please login again");
        return;
      }

      if (!res.ok) throw new Error();

      toast.success(`${settingType} settings saved!`);
      addActivityLog('Settings updated', `${settingType} Settings`, 'info');

    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch users");
        return;
      }
      setUsers(
        data.data.map((u: any) => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          phone: u.phone || "",
          joinDate: u.createdAt?.split("T")[0],
          status: u.status || "active",
          bookings: u.totalBookings || 0,
          totalSpent: u.walletBalance || 0,
          loyaltyPoints: u.loyaltyPoints || 0, // ✅ جديد
          tier: u.tier || "Bronze",            // ✅ جديد
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("FIRST BOOKING:", JSON.stringify(data.data[0], null, 2)); // ✅ أضف السطر ده
    setBookings(data.data);
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to fetch reviews"); return; }
      setReviews(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching reviews");
    }
  };

  const handleSaveNotificationSettings = async () => {
    setNotifSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings/update-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(notifSettings),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to save"); return; }
      toast.success("Notification settings saved!");
      addActivityLog("Settings updated", "Notification Settings", "info");
      setShowNotificationSettings(false);
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setNotifSaving(false);
    }
  };

  const [collections, setCollections] = useState<string[]>([]);

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCollections(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    fetchCollections(); // ✅
  }, []);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { toast.error("Unauthorized: No admin token found"); return; }
      const res = await fetch(`${API_URL}/admin/businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to fetch businesses"); return; }
      const formattedBusinesses = data.data.map((business: any) => ({
        id: business._id,
        name: business.businessName,
        owner: business.ownerName,
        email: business.email,
        phone: business.phone,
        category: business.category,
        status: business.status,
        rating: 0,
        reviews: 0,
        revenue: 0,
        joinDate: business.createdAt ? business.createdAt.split("T")[0] : "",
      }));
      setBusinesses(formattedBusinesses);
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching businesses");
    }
  };

  const fetchPendingUpdates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/pending-updates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed to fetch pending updates'); return; }

      console.log('🔍 Pending Updates Data:', JSON.stringify(data.data, null, 2)); // ✅ أضف السطر ده

      setPendingUpdates(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Network error while fetching pending updates');
    }
  };

  const handleReviewUpdate = async (businessId: string, action: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/businesses/${businessId}/review-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, admin_note: reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Action failed'); return; }
      toast.success(data.message);
      if (action === 'approved') addActivityLog('Business update approved', pendingUpdates.find(p => p._id === businessId)?.name ?? '', 'success');
      if (action === 'rejected') addActivityLog('Business update rejected', pendingUpdates.find(p => p._id === businessId)?.name ?? '', 'warning');

      setReviewingId(null);
      setReviewNote('');
      fetchPendingUpdates();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch logs");
        return;
      }
      setActivityLogs(data.data);
      // ❌ امسح السطر ده
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching activity logs");
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchActivityLogs(); // ✅ أضف السطر ده
  }, []);


  useEffect(() => {
    fetchPendingUpdates();

    const handler = () => fetchPendingUpdates();
    const logHandler = () => fetchActivityLogs(); // ✅ جديد

    socket.on("pending_update_reviewed", handler);
    socket.on("pending_update_deleted", handler);
    socket.on("new_pending_update", handler); // ✅ أضف ده
    socket.on("activity_log_created", logHandler); // ✅ جديد

    return () => {
      socket.off("pending_update_reviewed", handler);
      socket.off("pending_update_deleted", handler);
      socket.off("new_pending_update", handler); // ✅ أضف ده
      socket.off("activity_log_created", logHandler); // ✅ جديد

    };
  }, []);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) { toast.error("Unauthorized: No admin token found"); return; }
      const res = await fetch(`${API_URL}/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to fetch claims"); return; }
      const formattedClaims = data.data.map((claim: any) => ({
        id: claim._id,
        businessId: claim.business?._id,
        businessName: claim.businessName,
        businessCode: claim.business?.businessCode,
        ownerName: claim.ownerName,
        ownerId: claim.ownerId,
        email: claim.email,
        phone: claim.phone,
        taxNumber: claim.taxNumber,
        reason: claim.reason,
        status: claim.status,
        createdAt: claim.createdAt ? claim.createdAt.split("T")[0] : "",
      }));
      setClaims(formattedClaims);
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching claims");
    }
  };

  useEffect(() => {
    fetchBusinesses();
    const handler = (data: any) => { fetchBusinesses(); };
    socket.on("business_updated", handler);
    return () => { socket.off("business_updated", handler); };
  }, []);

  useEffect(() => {
    fetchClaims();
    const handler = (data: any) => { fetchClaims(); };
    socket.on("claim_created", handler);
    socket.on("claim_updated", handler);
    return () => {
      socket.off("claim_created", handler);
      socket.off("claim_updated", handler);
    };
  }, []);
// بعد ✅
useEffect(() => {
  fetchBookings(); // فيتشها من أول ما الكومبوننت يتحمل
}, []);

useEffect(() => {
  if (activeTab === "bookings") {
    fetchBookings(); // وكمان لما بتدخل الـ tab عشان تجيب الأحدث
  }
}, [activeTab]);
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add user");
        return;
      }

      toast.success("User added successfully!");

      setShowAddUserDialog(false);
      setNewUser({ name: "", email: "", phone: "", password: "" });

      fetchUsers(); // 👈 refresh from DB
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const generatePDFAsJSON = (reportName: string, data: any) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 4.2;

    const text = JSON.stringify(data, null, 2);
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);

    const lines = pdf.splitTextToSize(text, maxLineWidth);
    let y = margin;
    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += lineHeight;
    });

    pdf.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generatePDFFromData = (reportName: string, data: any) => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const records = Array.isArray(data) ? data : [data];
    if (records.length === 0) { pdf.save(`${reportName}.pdf`); return; }

    const headers = Object.keys(records[0]).filter(h => h !== '_id' && h !== '__v');
    const colWidth = Math.min((pageWidth - margin * 2) / headers.length, 60);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(reportName, margin, margin + 5);

    let y = margin + 18;

    const drawHeader = () => {
      pdf.setFillColor(41, 128, 185);
      pdf.rect(margin, y, pageWidth - margin * 2, 9, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      headers.forEach((h, i) => {
        pdf.text(h.toUpperCase(), margin + i * colWidth + 2, y + 6, { maxWidth: colWidth - 3 });
      });
      y += 9;
    };

    drawHeader();

    records.forEach((row, rowIndex) => {
      if (y + 9 > pageHeight - margin) { pdf.addPage(); y = margin; drawHeader(); }
      rowIndex % 2 === 0 ? pdf.setFillColor(235, 245, 255) : pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y, pageWidth - margin * 2, 9, 'F');
      pdf.setDrawColor(200, 210, 220);
      pdf.rect(margin, y, pageWidth - margin * 2, 9, 'S');
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      headers.forEach((h, i) => {
        const val = row[h];
        const text = val === null || val === undefined ? '—'
          : typeof val === 'object' ? JSON.stringify(val).slice(0, 30)
            : String(val).slice(0, 30);
        pdf.text(text, margin + i * colWidth + 2, y + 6, { maxWidth: colWidth - 3 });
      });
      y += 9;
    });

    pdf.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportData = async (format: 'json' | 'pdf' = 'json') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (format === 'json') {
        const dataStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SmartLocalService-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        generatePDFAsJSON('SmartLocalService-export', data.data);
      }

      toast.success(`All data exported as ${format.toUpperCase()}!`);
      addActivityLog('Data exported', `All Data (${format.toUpperCase()})`, 'info');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const handleExportCollection = async (collectionName: string, format: 'json' | 'pdf' = 'json') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/export/${collectionName}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (format === 'json') {
        const dataStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${collectionName}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        generatePDFFromData(collectionName, data.data);
      }

      toast.success(`${collectionName} exported as ${format.toUpperCase()}!`);
      addActivityLog('Data exported', `${collectionName} (${format.toUpperCase()})`, 'info');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const handleSyncData = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      const loadingToast = toast.loading('Syncing data...');

      await fetch(`${API_URL}/admin/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      await Promise.all([
        fetchBusinesses(),
        fetchClaims(),
        fetchReviews(),
        fetchPendingUpdates(),
      ]);

      toast.dismiss(loadingToast);
      toast.success('Data synced successfully!');
      await addActivityLog('Data synced', 'All platform data', 'info');

    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleClearCache = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/clear-cache`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.success(data.message);
      await addActivityLog('Cache cleared', 'Redis Cache', 'info'); // ✅

    } catch (err) {
      toast.error('Clear cache failed');
    }
  };

  const categoryMap: Record<string, number> = {
    gyms: 1,
    coworking: 2,
    restaurants: 3,
    carservices: 4,
  };

  const handleAddBusiness = async () => {
    if (!newBusiness.name || !newBusiness.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();

      formData.append("category_code", String(categoryMap[newBusiness.category] ?? 1));
      formData.append("category", newBusiness.category);
      formData.append("businessName", newBusiness.name);
      formData.append("phone", newBusiness.phone);
      formData.append("location", newBusiness.address);
      formData.append("description", newBusiness.description);
      formData.append("location_url_on_maps", newBusiness.location_url_on_maps);
      formData.append("amenities", newBusiness.amenities);

      photoFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await fetch(`${API_URL}/admin/add-business`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to add business");
        return;
      }

      toast.success("Business added successfully!");
      addActivityLog('Business created', newBusiness.name, 'success');
      setShowAddBusinessDialog(false);
      setPhotoFiles([]);
      fetchBusinesses();
    } catch (err) {
      toast.error("Network error");
    }
  };
  // PDF download (الطريقة الجديدة)
  const handleDownloadReportPDF = async (reportName: string) => {
    setDownloadMenuOpen(null);
    const reportElement = document.getElementById('report-content');
    if (!reportElement) {
      toast.error('Report content not found');
      return;
    }

    const loadingToast = toast.loading('Generating PDF...');
    const controls = reportElement.querySelectorAll('.no-print');

    try {
      // اخفي أزرار التحكم وقت التصوير
      controls.forEach((el) => ((el as HTMLElement).style.display = 'none'));

      await new Promise((r) => setTimeout(r, 300)); // وقت كافي للرسومات تترسم

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        onclone: (clonedDoc) => {
          // ✅ يثبّت ألوان الحدود بصيغة rgba واضحة عشان مايحصلش أي خطوط/أرتيفاكت غريبة
          const target = clonedDoc.getElementById('report-content');
          if (target) {
            const all = target.querySelectorAll<HTMLElement>('*');
            all.forEach((el) => {
              el.style.borderColor = 'rgba(255,255,255,0.08)';
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportName}-${new Date().toISOString().split('T')[0]}.pdf`);

      toast.dismiss(loadingToast);
      toast.success('Report downloaded successfully!');
      addActivityLog('Data exported', reportName, 'info');
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      controls.forEach((el) => ((el as HTMLElement).style.display = ''));
    }
  };

  const handleGenerateReport = (type: 'user-analytics' | 'revenue' | 'activity-logs') => {
    setActiveReport(type);
    setActiveTab('reports');
    toast.success('Report generated successfully!');
  };

  const handleUserAction = async (
    userId: string,
    action: 'suspend' | 'activate' | 'delete'
  ) => {
    try {
      const userName = users.find(u => u.id === userId)?.name ?? '';
      const token = localStorage.getItem("adminToken");

      if (action === 'delete') {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message || "Failed to delete user"); return; }
        toast.success("User deleted successfully");
        await addActivityLog('User deleted', userName, 'error');
        setUsers(prev => prev.filter(u => u.id !== userId));
        return;
      }

      const status = action === "suspend" ? "suspended" : "active";

      const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to update status"); return; }

      toast.success(`User ${action === "suspend" ? "suspended" : "activated"} successfully`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));

      if (action === 'suspend') await addActivityLog('User suspended', userName, 'warning');
      if (action === 'activate') await addActivityLog('User activated', userName, 'success');

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchUsers();

    socket.on("user_deleted", (deletedId: string) => {
      setUsers(prev => prev.filter(u => u.id !== deletedId));
    });

    return () => {
      socket.off("user_updated");
      socket.off("user_deleted");
    };
  }, []);

  const handleViewDetails = async (id: string, type: "business" | "claim") => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/view-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message); return; }
      if (type === "business") { setSelectedBusiness(data.data); setShowBusinessModal(true); }
      else { setSelectedClaim(data.data); setShowClaimModal(true); }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const handleBusinessAction = async (businessId: string, action: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = action === "approve" ? `${API_URL}/admin/business/approve`
        : action === "reject" ? `${API_URL}/admin/business/reject`
          : `${API_URL}/admin/business/delete`;
      const options = action === "delete"
        ? { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ businessId }) }
        : { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ businessId }) };
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Action failed"); return; }
      toast.success(data.message);
      const businessName = businesses.find(b => b.id === businessId)?.name ?? '';
      if (action === 'approve') addActivityLog('Business approved', businessName, 'success');
      if (action === 'reject') addActivityLog('Business rejected', businessName, 'warning');
      if (action === 'delete') addActivityLog('Business deleted', businessName, 'error');
      fetchBusinesses();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleBookingStatus = async (bookingId: string, status: string) => {
    const token = localStorage.getItem("adminToken");
    const bookingName = bookings.find(b => b._id === bookingId)?.businessName ?? '';

    const res = await fetch(
      `${API_URL}/admin/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Booking updated");
    await addActivityLog(`Booking ${status}`, bookingName,
      status === 'completed' ? 'success' :
        status === 'cancelled' ? 'error' : 'warning'
    );
    fetchBookings();
  };
  const handleSendTierEmail = async (userId: string, userName: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/users/${userId}/send-tier-reward`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to send email"); return; }
      toast.success(`Reward email sent to ${userName}!`);
      addActivityLog("Tier reward email sent", userName, "success");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleClaimAction = async (id: string, action: string) => {
    const token = localStorage.getItem("adminToken");
    const claimName = claims.find(c => c.id === id)?.businessName ?? ''; // ✅ جيبه قبل الـ fetch
    let url = "";
    let options: RequestInit = { headers: { Authorization: `Bearer ${token}` } };
    if (action === "approve") {
      url = `${API_URL}/admin/claim/approve/${id}`;
      options = { method: "PATCH", headers: { Authorization: `Bearer ${token}` } };
    } else if (action === "reject") {
      url = `${API_URL}/admin/claim/reject/${id}`;
      options = { method: "PATCH", headers: { Authorization: `Bearer ${token}` } };
    } else if (action === "delete") {
      url = `${API_URL}/admin/claim/${id}`;
      options = { method: "DELETE", headers: { Authorization: `Bearer ${token}` } };
    }
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Action failed"); return; }
      toast.success(data.message);
      if (action === 'approve') await addActivityLog('Claim approved', claimName, 'success');
      if (action === 'reject') await addActivityLog('Claim rejected', claimName, 'warning');
      if (action === 'delete') await addActivityLog('Claim deleted', claimName, 'error');
      await fetchClaims();
      await fetchBusinesses();
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAdmin(!!token);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin]);

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = action === 'approve'
        ? `${API_URL}/admin/${reviewId}/approve`
        : action === 'reject'
          ? `${API_URL}/admin/${reviewId}/reject`
          : `${API_URL}/admin/${reviewId}`;
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Action failed"); return; }
      toast.success(data.message);
      const businessName = reviews.find(r => r._id === reviewId)?.businessName ?? '';
      if (action === 'approve') addActivityLog('Review approved', businessName, 'success');
      if (action === 'reject') addActivityLog('Review rejected', businessName, 'warning');
      if (action === 'delete') addActivityLog('Review deleted', businessName, 'error');
      fetchReviews(); // ✅ refresh
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleAdminLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("BEFORE TOKEN:", localStorage.getItem("adminToken"));

      localStorage.removeItem("adminToken");
      console.log("AFTER TOKEN:", localStorage.getItem("adminToken"));
      setIsAdmin(false);
      navigate("/");
      onLogout();
      toast.success("Logged out successfully");

      // window.location.href = "/";
    } catch (error) {
      console.error(error);

      localStorage.removeItem("adminToken");
      navigate("/"); // حتى لو حصل error
      onLogout();

      // window.location.href = "/";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{stats.activeUsers} Active</Badge>
          </div>
          <p className="text-3xl text-white mb-1">{stats.totalUsers}</p>
          <p className="text-gray-400 text-sm">Total Users</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-8 h-8 text-purple-400" />
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{stats.pendingBusinesses} Pending</Badge>
          </div>
          <p className="text-3xl text-white mb-1">{stats.totalBusinesses}</p>
          <p className="text-gray-400 text-sm">Total Businesses</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pending</Badge>
          </div>
          <p className="text-3xl text-white mb-1">{stats.pendingUpdates}</p>
          <p className="text-gray-400 text-sm">Total Business Update</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{stats.pendingReviews} Pending</Badge>
          </div>
          <p className="text-3xl text-white mb-1">{stats.totalReviews}</p>
          <p className="text-gray-400 text-sm">Total Reviews</p>
        </div>

<div className="bg-slate-900 rounded-2xl p-6 border border-blue-500/30">
  <div className="flex items-center justify-between mb-3">
    <Calendar className="w-8 h-8 text-blue-400" />
    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
      {stats.completeBookings} Completed
    </Badge>
  </div>
  
  <p className="text-3xl text-white mb-1">{stats.totalbookings}</p>
  <p className="text-gray-400 text-sm">Total Bookings</p>
</div>

<div className="bg-slate-900 rounded-2xl p-6 border border-pink-500/30">
  <div className="flex items-center justify-between mb-3">
    <MessageSquare className="w-8 h-8 text-pink-400" />
    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
      {tickets.filter((t: any) => t.status === 'open').length} Pending
    </Badge>
  </div>
  <p className="text-3xl text-white mb-1">{tickets.length}</p>
  <p className="text-gray-400 text-sm">Total Tickets</p>
</div>

      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => setShowAddUserDialog(true)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2">
            <Plus className="w-4 h-4" />Add User
          </Button>
          <Button onClick={() => setShowAddBusinessDialog(true)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2">
            <Building2 className="w-4 h-4" />Add Business
          </Button>
          <Button onClick={handleExportData} className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2">
            <Download className="w-4 h-4" />Export Data
          </Button>
          <Button onClick={handleSyncData} className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Sync Data
          </Button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityLogs.slice(0, 5).map((log) => {
            const styles = getLevelStyles(log.level);
            return (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <div className="w-2 h-2 rounded-full shrink-0" style={styles.dot} />  {/* ← هنا */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{log.action} — {log.target}</p>
                  <p className="text-gray-500 text-xs">{log.timestamp}</p>
                </div>
                <Badge className="shrink-0 text-xs" style={styles.badge}>  {/* ← وهنا */}
                  {log.level}
                </Badge>
              </div>
            );
          })}
          {activityLogs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  const tierBadgeStyle = (tier: string) => {
    switch (tier) {
      case "Platinum": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "Gold": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Silver": return "bg-slate-400/20 text-slate-300 border-slate-400/30";
      default: return "bg-orange-900/20 text-orange-400 border-orange-900/30";
    }
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/50 border-white/10 text-white pl-11"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/50">
                <th className="text-left py-4 px-6 text-gray-400 text-sm">User</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Contact</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Join Date</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Bookings</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Spent</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Points</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Tier</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Status</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) =>
                  filterStatus === "all" ? true : u.status === filterStatus
                )
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => {
                  const points = user.loyaltyPoints ?? 0;
                  const isEligible = points >= 1000;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {/* User */}
                      <td className="py-4 px-6">
                        <p className="text-white">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 text-gray-300">{user.phone}</td>

                      {/* Join Date */}
                      <td className="py-4 px-6 text-gray-300">{user.joinDate}</td>

                      {/* Bookings */}
                      <td className="py-4 px-6 text-gray-300">{user.bookings}</td>

                      {/* Spent */}
                      <td className="py-4 px-6 text-gray-300">
                        EGP {user.totalSpent}
                      </td>

                      {/* Points — مع progress bar وبادج لو eligible */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-sm ${isEligible ? "text-amber-400" : "text-yellow-400"
                                }`}
                            >
                              {points.toLocaleString()} pts
                            </span>
                            {isEligible && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
                                🔥 Ready
                              </span>
                            )}
                          </div>
                          {/* Progress bar نحو الـ 1000 */}
                          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isEligible
                                ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                                : "bg-gradient-to-r from-cyan-500 to-purple-500"
                                }`}
                              style={{
                                width: `${Math.min((points / 1000) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          {!isEligible && (
                            <span className="text-[10px] text-gray-500">
                              {(1000 - points).toLocaleString()} pts to reward
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-4 px-6">
                        <Badge className={tierBadgeStyle(user.tier)}>
                          {user.tier || "Bronze"}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge
                          className={
                            user.status === "active"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : user.status === "suspended"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* Suspend / Activate */}
                          {user.status === "active" ? (
                            <button
                              onClick={() => handleUserAction(user.id, "suspend")}
                              className="text-orange-400 hover:text-orange-300"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, "activate")}
                              className="text-green-400 hover:text-green-300"
                              title="Activate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Send Tier Reward — يظهر بس لو eligible */}
                          {isEligible ? (
                            <button
                              onClick={() => handleSendTierEmail(user.id, user.name)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 
                                       border border-amber-500/30 hover:bg-amber-500/30 transition text-xs"
                              title="Send Tier Reward Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Reward
                            </button>
                          ) : (
                            <button
                              disabled
                              className="text-gray-600 cursor-not-allowed"
                              title={`Need ${1000 - points} more pts`}
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleUserAction(user.id, "delete")}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-800/50 border-white/10 text-white pl-11" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/50">
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Type</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Name</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Owner</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Email</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Status</th>
                <th className="text-left py-4 px-6 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-cyan-400">Business</td>
                  <td className="py-4 px-6"><p className="text-white">{business.name}</p><p className="text-gray-400 text-sm">{business.category}</p></td>
                  <td className="py-4 px-6 text-gray-300">{business.owner}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{business.email}</td>
                  <td className="py-4 px-6"><Badge>{business.status}</Badge></td>
                  <td className="py-4 px-6">
                    <div className="flex gap-3">
                      <Eye className="w-4 h-4 text-cyan-400 cursor-pointer" onClick={() => handleViewDetails(business.id, "business")} />
                      {business.status === "pending" && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400 cursor-pointer" onClick={() => handleBusinessAction(business.id, "approve")} />
                          <XCircle className="w-4 h-4 text-red-400 cursor-pointer" onClick={() => handleBusinessAction(business.id, "reject")} />
                        </>
                      )}
                      <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => handleBusinessAction(business.id, "delete")} />
                    </div>
                  </td>
                </tr>
              ))}
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-purple-400">Claim</td>
                  <td className="py-4 px-6 text-white">{claim.businessName}</td>
                  <td className="py-4 px-6 text-gray-300">{claim.ownerName}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{claim.email}</td>
                  <td className="py-4 px-6"><Badge>{claim.status}</Badge></td>
                  <td className="py-4 px-6">
                    <div className="flex gap-3">
                      <Eye className="w-4 h-4 text-cyan-400 cursor-pointer" onClick={() => handleViewDetails(claim.id, "claim")} />
                      {claim.status === "pending" && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400 cursor-pointer" onClick={() => handleClaimAction(claim.id, "approve")} />
                          <XCircle className="w-4 h-4 text-red-400 cursor-pointer" onClick={() => handleClaimAction(claim.id, "reject")} />
                        </>
                      )}
                      <Trash2 className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => handleClaimAction(claim.id, "delete")} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white">
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="space-y-4">
        {reviews
          .filter(r => filterStatus === 'all' || r.status === filterStatus)
          .map((review) => (
            <div key={review._id} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white">{review.userName}</p>
                    <span className="text-gray-400">→</span>
                    <p className="text-cyan-400">{review.businessName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                    <span className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={
                  review.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    review.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                }>
                  {review.status}
                </Badge>
              </div>

              <p className="text-gray-300 mb-3">{review.comment}</p>

              {/* ✅ Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Review ${idx + 1}`} className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">

                {/* ✅ pending فقط → يظهر Approve و Reject */}
                {review.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleReviewAction(review._id, 'approve')}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-[18px] text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />Approve
                    </Button>
                    <Button
                      onClick={() => handleReviewAction(review._id, 'reject')}
                      className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-[18px] text-sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                  </>
                )}

              </div>
            </div>
          ))}

        {reviews.filter(r => filterStatus === 'all' || r.status === filterStatus).length === 0 && (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );

  const fetchUserAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/analytics/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAnalyticsData(data.data);
      else toast.error("Failed to load analytics");
    } catch {
      toast.error("Network error loading analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const renderReports = () => {
    const revenueData =
      analytics?.monthlyBreakdown?.map((item: any) => ({
        month: `${item.month}/${item.year}`,
        revenue: item.revenue,
        expenses: item.expenses,
        netProfit: item.netProfit,
        profitMargin: item.profitMargin,
      })) || [];


    if (!activeReport) return (
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 text-center">
          <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl text-white mb-2">Select a Report</h3>
          <p className="text-gray-400 mb-8">Choose a report type to view detailed analytics</p>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <button onClick={() => handleGenerateReport('user-analytics')}
              className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-white/10 transition-all group">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white mb-2">User Analytics</h4>
              <p className="text-sm text-gray-400">Growth trends and user behavior</p>
            </button>
            <button onClick={() => handleGenerateReport('revenue')}
              className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-white/10 transition-all group">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white mb-2">Revenue Reports</h4>
              <p className="text-sm text-gray-400">Financial performance analysis</p>
            </button>
            <button onClick={() => handleGenerateReport('activity-logs')}
              className="bg-slate-800 hover:bg-slate-700 p-6 rounded-2xl border border-white/10 transition-all group">
              <FileText className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="text-white mb-2">Activity Logs</h4>
              <p className="text-sm text-gray-400">System activity and changes</p>
            </button>
          </div>
        </div>
      </div>
    );

    // ─── USER ANALYTICS (بيانات حقيقية من الـ API) ───
    if (activeReport === 'user-analytics') {
      if (analyticsLoading) return (
        <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
          <RefreshCw className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      );

      if (!analyticsData) return (
        <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Failed to load analytics</p>
          <Button onClick={fetchUserAnalytics}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-[18px]">
            <RefreshCw className="w-4 h-4 mr-2" />Retry
          </Button>
        </div>
      );

      const { kpis, tierDistribution, userGrowthData, topUsers,
        bookingStatusBreakdown, bookingHealthStats,
        noShowWarningList, retention, reviewsInsights,
        categoryDistribution } = analyticsData;

      return (
        <div id="report-content" className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div>
              <h3 className="text-2xl text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-cyan-400" />User Analytics Report
              </h3>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Button onClick={() => setActiveReport(null)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button onClick={fetchUserAnalytics}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </Button>
              <Button onClick={() => handleDownloadReportPDF('user-analytics-report')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <Download className="w-4 h-4 mr-2" />Download Report
              </Button>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <p className="text-3xl text-white">{kpis.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-green-500/30">
              <p className="text-gray-400 text-sm mb-2">Active (30d)</p>
              <p className="text-3xl text-white">{kpis.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-purple-500/30">
              <p className="text-gray-400 text-sm mb-2">6-Month Growth</p>
              <p className="text-3xl text-white">{kpis.overallGrowthRate}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-yellow-500/30">
              <p className="text-gray-400 text-sm mb-2">New This Month</p>
              <p className="text-3xl text-white">{kpis.newUsersThisMonth}</p>
              <p className={`text-sm mt-1 ${parseFloat(kpis.newUsersGrowthRate) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {kpis.newUsersGrowthRate} vs last month
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/30">
              <p className="text-gray-400 text-sm mb-2">Suspended</p>
              <p className="text-3xl text-white">{kpis.suspendedUsers}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-blue-500/30">
              <p className="text-gray-400 text-sm mb-2">Avg Loyalty Points</p>
              <p className="text-3xl text-white">{kpis.avgLoyaltyPoints.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-yellow-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Loyalty Points</p>
              <p className="text-3xl text-white">{kpis.totalLoyaltyPoints.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-pink-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl text-white">{kpis.totalBookingsSum.toLocaleString()}</p>
            </div>
          </div>

          {/* ── Growth Trend ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">User Growth Trend (Last 6 Months)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }} />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} name="Total Users" />
                <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} name="Active Users" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Tier Distribution ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">User Tier Distribution</h4>
            <div className="space-y-4">
              {tierDistribution.map((tier: any) => (
                <div key={tier.name} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-400">{tier.name}</div>
                  <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: kpis.totalUsers ? `${Math.round((tier.value / kpis.totalUsers) * 100)}%` : '0%',
                        backgroundColor: tier.color,
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-white text-sm font-medium">{tier.value}</div>
                  <div className="w-12 text-right text-gray-400 text-xs">
                    {kpis.totalUsers ? Math.round((tier.value / kpis.totalUsers) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Booking Status + Category ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Booking Status */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl text-white mb-2">Booking Status</h4>
              <div className="flex flex-wrap gap-3 mb-4">
                {bookingStatusBreakdown.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name} ({entry.percentage}%)</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mb-4 text-sm">
                <span className="text-gray-400">Total: <span className="text-white">{bookingHealthStats.totalBookings}</span></span>
                <span className="text-gray-400">Cancel: <span className="text-red-400">{bookingHealthStats.cancellationRate}</span></span>
                <span className="text-gray-400">No-show: <span className="text-yellow-400">{bookingHealthStats.noShowRate}</span></span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingStatusBreakdown}
                    cx="50%" cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={false}
                  >
                    {bookingStatusBreakdown.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value: any, name: any) => [value + ' bookings', name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bookings by Category */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl text-white mb-2">Bookings by Category</h4>
              {(() => {
                const filtered = categoryDistribution.filter((e: any) => e.value > 0);
                return !filtered.length ? (
                  <p className="text-gray-500 text-sm text-center py-16">No category data available</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {filtered.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name} ({entry.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={filtered}
                          cx="50%" cy="50%"
                          outerRadius={85}
                          dataKey="value"
                          label={({ name, index }) => `${name} ${filtered[index]?.percentage ?? 0}%`}
                          labelLine={false}
                        >
                          {filtered.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          formatter={(value: any, name: any, props: any) => [
                            `${props.payload?.percentage ?? 0}% (${value} bookings)`, name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ── Retention + Reviews ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Retention */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />Retention
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">With ≥1 booking</span>
                  <span className="text-white">{retention.usersWithAtLeastOneBooking}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">With ≥2 bookings</span>
                  <span className="text-white">{retention.usersWithMultipleBookings}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Retention Rate</span>
                  <span className="text-green-400 font-medium">{retention.retentionRate}</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />Reviews
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">{reviewsInsights.totalReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Approved</span>
                  <span className="text-green-400">{reviewsInsights.approvedReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Rating</span>
                  <span className="text-yellow-400">⭐ {reviewsInsights.avgRating}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Participation</span>
                  <span className="text-cyan-400">{reviewsInsights.reviewParticipationRate}</span>
                </div>
              </div>
            </div>

          </div>
          {/* ── Top Users ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">Top 10 Users by Bookings</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">#</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">User</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Bookings</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Loyalty Pts</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Wallet</th>
                    <th className="text-center py-3 px-4 text-gray-400 text-sm">Tier</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">No-Shows</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u: any, i: number) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-4">
                        <p className="text-white">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </td>
                      <td className="py-3 px-4 text-cyan-400 text-right">{u.totalBookings}</td>
                      <td className="py-3 px-4 text-yellow-400 text-right">{u.loyaltyPoints.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-400 text-right">EGP {u.walletBalance}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={
                          u.tier === 'Platinum' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                            u.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              u.tier === 'Silver' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                                'bg-orange-900/20 text-orange-400 border-orange-900/30'
                        }>
                          {u.tier}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right ${u.noShowCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {u.noShowCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Booking Growth Trend ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">Booking Growth (Last 6 Months)</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData.bookingGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }} />
                <Bar dataKey="bookings" fill="#8b5cf6" name="Bookings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Booking Health Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-blue-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl text-white">{bookingHealthStats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-green-500/30">
              <p className="text-gray-400 text-sm mb-2">Completed</p>
              <p className="text-3xl text-white">{bookingHealthStats.completedBookings}</p>
              <p className="text-green-400 text-sm mt-1">{bookingHealthStats.completionRate}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/30">
              <p className="text-gray-400 text-sm mb-2">Cancelled</p>
              <p className="text-3xl text-white">{bookingHealthStats.cancelledBookings}</p>
              <p className="text-red-400 text-sm mt-1">{bookingHealthStats.cancellationRate}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-yellow-500/30">
              <p className="text-gray-400 text-sm mb-2">No Shows</p>
              <p className="text-3xl text-white">{bookingHealthStats.noShowBookings}</p>
              <p className="text-yellow-400 text-sm mt-1">{bookingHealthStats.noShowRate}</p>
            </div>
          </div>

          {/* ── Top Businesses ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />Top 5 Businesses by Bookings
            </h4>
            <div className="space-y-3">
              {analyticsData.topBusinesses.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 text-gray-400 text-sm text-center">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{b._id || 'Unknown'}</span>
                      <span className="text-purple-400 text-sm font-medium">{b.bookings}</span>
                    </div>
                    <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width: analyticsData.topBusinesses[0]?.bookings
                            ? `${Math.round((b.bookings / analyticsData.topBusinesses[0].bookings) * 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {analyticsData.topBusinesses.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* ── Top Rated Businesses ── */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />Top 5 Rated Businesses
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">#</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">Business</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Avg Rating</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topRatedBusinesses.map((b: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-4 text-white">{b._id || 'Unknown'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-yellow-400">⭐ {Number(b.avgRating).toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-right">{b.reviews}</td>
                    </tr>
                  ))}
                  {analyticsData.topRatedBusinesses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500 text-sm">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Payment Analytics + Reviews Health ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Payment Methods */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />Payment Methods
              </h4>
              {(() => {
                const filtered = analyticsData.paymentAnalytics.filter((p: any) => p._id);
                const total = filtered.reduce((s: number, x: any) => s + x.count, 0);
                const colors = ['border-cyan-500/30 text-cyan-400', 'border-purple-500/30 text-purple-400', 'border-green-500/30 text-green-400', 'border-orange-500/30 text-orange-400'];
                return filtered.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No payment data available</p>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((p: any, i: number) => {
                      const colorClass = colors[i % colors.length];
                      return (
                        <div key={i} className={`bg-slate-800/50 rounded-xl p-4 border ${colorClass.split(' ')[0]} flex items-center justify-between`}>
                          <p className="text-gray-300 text-sm capitalize">{p._id}</p>
                          <div className="text-right">
                            <p className={`text-xl font-medium ${colorClass.split(' ')[1]}`}>{p.count}</p>
                            <p className="text-gray-500 text-xs">{total > 0 ? Math.round((p.count / total) * 100) : 0}% of total</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Reviews Health */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />Reviews Health
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Reviews</span>
                  <span className="text-white">{reviewsInsights.totalReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Approved</span>
                  <span className="text-green-400">{reviewsInsights.approvedReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Approval Rate</span>
                  <span className="text-cyan-400">{reviewsInsights.reviewApprovalRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Rating</span>
                  <span className="text-yellow-400">⭐ {reviewsInsights.avgRating}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">Participation Rate</span>
                  <span className="text-purple-400">{reviewsInsights.reviewParticipationRate}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── No-Show Warning List ── */}
          {noShowWarningList.length > 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/20">
              <h4 className="text-xl text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />No-Show Warning List
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">User</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm">No-Shows</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm">Total Bookings</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm">No-Show Rate</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noShowWarningList.map((u: any) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <p className="text-white">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </td>
                        <td className="py-3 px-4 text-red-400 text-right font-medium">{u.noShowCount}</td>
                        <td className="py-3 px-4 text-gray-300 text-right">{u.totalBookings}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${parseFloat(u.noShowRatio) > 30 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {u.noShowRatio}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={u.status === 'suspended'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-green-500/20 text-green-400 border-green-500/30'}>
                            {u.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>
      );
    }

    // ─── REVENUE (بيانات static لسه) ───
    if (activeReport === 'revenue') {
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
      const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
      const profit = totalRevenue - totalExpenses;
      const profitMargin = ((profit / totalRevenue) * 100).toFixed(1);
      return (
        <div id="report-content" className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveReport(null)}
                className="text-gray-400 hover:text-white transition-colors no-print">← Back</button>
              <div>
                <h3 className="text-2xl text-white flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-400" />Revenue Analysis Report
                </h3>
                <p className="text-gray-400 text-sm mt-1">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <Button onClick={() => handleDownloadReportPDF('revenue-report')}
              className="no-print bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
              <Download className="w-4 h-4 mr-2" />Download Report
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-green-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
              <p className="text-white">
                EGP {analytics?.totalRevenue || 0}
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/30">
              <p className="text-gray-400 text-sm mb-2">Total Expenses</p>
              <p className="text-white">
                EGP {analytics?.totalExpenses || 0}
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30">
              <p className="text-gray-400 text-sm mb-2">Net Profit</p>
              <p className="text-white">
                EGP {analytics?.netProfit || 0}
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-purple-500/30">
              <p className="text-gray-400 text-sm mb-2">Profit Margin</p>
              <p className="text-white">
                {analytics?.profitMargin?.toFixed(2) || 0}%
              </p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">Revenue & Expenses Comparison</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">
              Monthly Breakdown
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm">
                      Month
                    </th>

                    <th className="text-right py-3 px-4 text-gray-400 text-sm">
                      Revenue
                    </th>

                    <th className="text-right py-3 px-4 text-gray-400 text-sm">
                      Expenses
                    </th>

                    <th className="text-right py-3 px-4 text-gray-400 text-sm">
                      Profit
                    </th>

                    <th className="text-right py-3 px-4 text-gray-400 text-sm">
                      Margin
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics?.monthlyBreakdown?.map(
                    (item: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-3 px-4 text-white">
                          {item.month}/{item.year}
                        </td>

                        <td className="py-3 px-4 text-green-400 text-right">
                          EGP {item.revenue.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-red-400 text-right">
                          EGP {item.expenses.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-cyan-400 text-right">
                          EGP {item.netProfit.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-purple-400 text-right">
                          {
                            item.revenue > 0
                              ? (
                                (item.netProfit / item.revenue) *
                                100
                              ).toFixed(1)
                              : "0.0"
                          }%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }


    // ─── ACTIVITY LOGS ───
    if (activeReport === 'activity-logs') {
      return (
        <div id="report-content" className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div>
              <h3 className="text-2xl text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-400" />Activity Logs Report
              </h3>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Button onClick={() => setActiveReport(null)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button onClick={async () => { await fetchActivityLogs(); toast.success("Logs refreshed!"); }}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </Button>
              <Button onClick={() => handleDownloadReportPDF('activity-logs-report')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
                <Download className="w-4 h-4 mr-2" />Download Report
              </Button>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Activities Logged</p>
                <p className="text-4xl text-white">{activityLogs.length}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {(['success', 'warning', 'error', 'info'] as const).map((level) => (
                  <Badge key={level} style={getLevelStyles(level).badge}>
                    {activityLogs.filter(log => log.level === level).length}{' '}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl text-white mb-6">All Activities</h4>
            <div className="space-y-3">
              {activityLogs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No activities logged</p>
              ) : (
                activityLogs.map((log) => {
                  const styles = getLevelStyles(log.level);
                  return (
                    <div key={log.id}
                      className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={styles.dot} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white truncate">{log.action}</p>
                          <Badge className="shrink-0 ml-2" style={styles.badge}>{log.level}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                          <span>Target: {log.target}</span>
                          <span>•</span>
                          <span>By: {log.user}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const handlePaymentAction = async (bookingId: string, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/payment-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.message); return; }
    toast.success(`Payment ${action} successfully!`);
    fetchBookings();
  };

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportingCollection, setExportingCollection] = useState<string | null>(null);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [showCollectionsDialog, setShowCollectionsDialog] = useState(false);

  const renderSettings = () => (
    <div className="space-y-6">
      {/* امسح الـ grid div واديها col-span كامل */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10 w-full">
        <h3 className="text-xl text-white mb-4">System Settings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={() => setShowExportDialog(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2 justify-start">
            <Database className="w-4 h-4" />Database Management
          </Button>
          <Button onClick={() => setShowNotificationSettings(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2 justify-start">
            <Bell className="w-4 h-4" />Notification Settings
          </Button>
          <Button onClick={() => setShowEmailTemplates(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2 justify-start">
            <Mail className="w-4 h-4" />Email Templates
          </Button>
          <Button onClick={() => setShowPlatformSettings(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] flex items-center gap-2 justify-start">
            <Settings className="w-4 h-4" />Platform Settings
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPendingUpdates = () => {
    return (
      <div className="space-y-6">

        {/* Empty State */}
        {pendingUpdates.length === 0 && (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>

            <p className="text-white text-lg mb-2">
              All caught up!
            </p>

            <p className="text-gray-400 text-sm">
              No pending update requests at the moment.
            </p>
          </div>
        )}

        {/* Cards */}
        {pendingUpdates.map((item) => {

          const update = item.pending_update?.data;

          // ✅ Avatar (LOGO + PHOTO + FALLBACK)
          const avatar =
            update?.businessLogo ||     // لوجو جديد في الطلب
            // item.currentLogo! ||         // ✅ لوجو البزنس الحالي
            item.photo_url?.[0] ||      // أول صورة حالية
            null;
          return (
            <div
              key={item._id}
              className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden"
            >

              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">

                <div className="flex items-center gap-4">

                  {/* AVATAR */}
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center text-white text-lg font-semibold">
                      {item.name?.charAt(0)}
                    </div>
                  )}

                  {/* INFO */}
                  <div>
                    <p className="text-white font-medium">
                      {item.name}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {item.location}
                    </p>
                    {/* 
                  <p className="text-gray-500 text-xs mt-1">
                    #{item.business_number} · Requested by{" "}
                    <span className="text-cyan-400">
                      {item.pending_update?.requested_by?.name}
                    </span>{" "}
                    ({item.pending_update?.requested_by?.email})
                  </p> */}
                  </div>

                </div>

                {/* TIME */}
                <div className="text-right">
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs">
                    Pending
                  </span>


                </div>

              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h5 className="text-gray-400 text-sm mb-4 uppercase tracking-wide">
                  Requested Changes
                </h5>

                <div className="grid md:grid-cols-2 gap-4">

                  {update?.name && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-500 mb-1">Business Name</p>
                      <p className="text-white">{update.name}</p>
                    </div>
                  )}

                  {update?.phone_number && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-white">{update.phone_number}</p>
                    </div>
                  )}

                  {update?.location && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-white">{update.location}</p>
                    </div>
                  )}

                  {update?.description && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-gray-300 text-sm">
                        {update.description}
                      </p>
                    </div>
                  )}


                  {/* Amenities */}
                  {update?.amenities?.length! > 0 && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-2">Amenities</p>

                      <div className="flex flex-wrap gap-2">
                        {update.amenities!.map((a: string, i: number) => (
                          <span
                            key={i}
                            className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full text-xs"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {update?.working_hours?.length! > 0 && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">

                      <p className="text-xs text-gray-500 mb-3">
                        Working Hours
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        {update.working_hours!.map((h: string, i: number) => {

                          // ✅ split ONLY first ":"
                          const splitIndex = h.indexOf(":");

                          const day = splitIndex !== -1
                            ? h.slice(0, splitIndex).trim()
                            : h;

                          const time = splitIndex !== -1
                            ? h.slice(splitIndex + 1).trim()
                            : "";

                          const isClosed = time.toLowerCase().includes("closed");
                          const isOpen24 = time.toLowerCase().includes("24");

                          const isRange =
                            time.includes("AM") ||
                            time.includes("PM") ||
                            time.includes("-");

                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-slate-700/40 rounded-lg px-3 py-2"
                            >

                              <span className="text-gray-300 text-xs font-medium">
                                {day}
                              </span>

                              {isClosed ? (
                                <span className="text-red-400 text-xs">Closed</span>

                              ) : isOpen24 ? (
                                <span className="text-green-400 text-xs">Open 24h</span>

                              ) : isRange ? (
                                <span className="text-cyan-400 text-xs">
                                  {time}
                                </span>

                              ) : (
                                <span className="text-cyan-400 text-xs">
                                  {time}
                                </span>
                              )}

                            </div>
                          );
                        })}

                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {(update?.photo_url?.length! > 0 || item.photo_url?.length! > 0) && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-3">
                        Photos ({(update?.photo_url || item.photo_url)?.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(update?.photo_url || item.photo_url)?.map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            className="w-full h-28 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {update?.services?.length! > 0 && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-3">
                        Services ({update.services!.length})
                      </p>
                      <div className="space-y-3">
                        {update.services!.map((service: any, i: number) => {
                          const hasOffer = service.offer && service.offer !== '0%';
                          return (
                            <div key={i} className="bg-slate-700/40 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white text-sm font-medium">{service.name}</p>
                                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">
                                      {service.service_category}
                                    </span>
                                  </div>
                                  {service.duration && (
                                    <p className="text-gray-400 text-xs">⏱ {service.duration}</p>
                                  )}
                                  {service.description && (
                                    <p className="text-gray-400 text-xs mt-1">{service.description}</p>
                                  )}
                                </div>

                                <div className="text-right flex-shrink-0">
                                  {service.price_type === 'fixed' ? (
                                    <>
                                      {hasOffer && (
                                        <p className="text-gray-500 text-xs line-through">
                                          EGP {service.price?.toLocaleString()}
                                        </p>
                                      )}
                                      <p className="text-cyan-400 text-sm font-medium">
                                        EGP {(service.price_after || service.price)?.toLocaleString()}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      {hasOffer && (
                                        <p className="text-gray-500 text-xs line-through">
                                          EGP {service.min_price?.toLocaleString()} – {service.max_price?.toLocaleString()}
                                        </p>
                                      )}
                                      <p className="text-cyan-400 text-sm font-medium">
                                        EGP {(service.min_price_after || service.min_price)?.toLocaleString()} – {(service.max_price_after || service.max_price)?.toLocaleString()}
                                      </p>
                                    </>
                                  )}
                                  {hasOffer && (
                                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                                      {service.offer} OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3 mt-6">
                  {item.pending_update?.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleReviewUpdate(item._id, "approved")}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-5 py-2 rounded-xl text-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReviewUpdate(item._id, "rejected")}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 px-5 py-2 rounded-xl text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}


                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBookings = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-white text-xl font-bold mb-4">Bookings Management</h2>

        {bookings.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No bookings found</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="flex items-stretch">

                {/* LEFT IMAGE */}
                <div className="w-64 flex-shrink-0">                 <img
                  src={booking.businessImage}
                  alt={booking.businessName}
                  className="w-full h-full object-cover"
                />
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex-1 p-5 flex flex-col gap-4">

                  {/* TOP: Info + Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {booking.businessName}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          {booking.userId && typeof booking.userId === "object"
                            ? `${booking.userId.firstName ?? ''} ${booking.userId.lastName ?? ''}`.trim() || 'Unknown User'
                            : booking.userId ?? 'Unknown User'}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(booking.bookingDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs border ${booking.status === "completed"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : booking.status === "cancelled"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : booking.status === "no_show"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* INSTAPAY SCREENSHOT */}
                  {(booking as any).paymentMethod === 'instapay' && (
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />InstaPay Screenshot
                      </p>
                      {(booking as any).instapayScreenshot &&
                        !(booking as any).instapayScreenshot.includes('storage.example.com') ? (
                        <img
                          src={(booking as any).instapayScreenshot}
                          alt="Payment proof"
                          className="w-full h-40 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open((booking as any).instapayScreenshot, '_blank')}
                        />
                      ) : (
                        <p className="text-gray-500 text-xs">No screenshot uploaded</p>
                      )}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2">

                    {/* Payment Row */}
                    {(booking as any).paymentMethod === 'instapay' &&
                      (booking as any).paymentStatus === 'pending' && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs w-16">Payment:</span>
                          <button
                            onClick={() => handlePaymentAction(booking._id, 'approved')}
                            className="px-4 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePaymentAction(booking._id, 'rejected')}
                            className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                    {/* Booking Row */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-16">Booking:</span>
                      <button
                        onClick={() => handleBookingStatus(booking._id, "completed")}
                        className="px-4 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleBookingStatus(booking._id, "no_show")}
                        className="px-4 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm"
                      >
                        No Show
                      </button>
                      <button
                        onClick={() => handleBookingStatus(booking._id, "cancelled")}
                        className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

 const renderTickets = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-white text-2xl font-bold">
          Support Tickets
        </h2>

        {tickets.length === 0 ? (
          <p className="text-gray-400">No tickets found</p>
        ) : (
          tickets.map((ticket: any) => (
            <div
              key={ticket._id}
              className="bg-slate-900 border border-white/10 rounded-xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">{ticket.userName}</h3>
                  <p className="text-gray-500 text-sm">{ticket.userEmail}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === "open"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : ticket.status === "replied"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="mt-4 text-gray-300">{ticket.message}</div>

              {ticket.reply && (
                <div className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  <p className="text-cyan-400 text-sm mb-2">Support Reply</p>
                  <p className="text-white">{ticket.reply}</p>
                </div>
              )}

              {ticket.status !== "closed" && (
                <div className="mt-4 space-y-3 red">
                  {!ticket.reply && (
                    <textarea
                      value={selectedTicket?._id === ticket._id ? reply : ""}
                      onChange={(e) => {
                        setSelectedTicket(ticket);
                        setReply(e.target.value);
                      }}
                      placeholder="Write reply..."
                      className="w-full bg-slate-800 text-white p-3 rounded-lg border border-white/10 focus:border-cyan-500/50 outline-none resize-none"
                      rows={3}
                    />
                  )}
                  <div className="flex gap-2 red">
                    {!ticket.reply && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          handleReplyTicket(ticket._id);
                        }}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white transition"
                      >
                        <Mail className="w-4 h-4" />
                        Send Reply
                      </button>
                    )}
                    <button
                      onClick={() => handleCloseTicket(ticket._id)}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white border border-white/10 transition"
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                      Close Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-white">SPOT Admin</h1>
                <p className="text-xs text-gray-400">System Control Panel</p>
              </div>
            </div>
            <Button onClick={handleAdminLogout} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-2 rounded-[18px] flex items-center gap-2">
              <LogOut className="w-4 h-4" />Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'businesses', label: 'Businesses', icon: Building2 },
                                { id: 'businessUpdates', label: `Business Updates${pendingUpdates.length > 0 ? ` (${pendingUpdates.length})` : ''}`, icon: AlertCircle },

                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'tickets', label: 'Tickets', icon: Calendar },
                { id: 'bookings', label: 'Bookings', icon: Calendar },

                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-3 rounded-[18px] transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'businesses' && renderBusinesses()}
          {showBusinessModal && selectedBusiness && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-slate-900 p-6 rounded-xl w-[520px] text-white space-y-3">
                <h2 className="text-xl font-bold">{selectedBusiness.businessName}</h2>
                <p><b>Business Code:</b> {selectedBusiness.businessCode}</p>
                <p><b>Owner:</b> {selectedBusiness.ownerName}</p>
                <p><b>Email:</b> {selectedBusiness.email}</p>
                <p><b>Phone:</b> {selectedBusiness.phone}</p>
                <p><b>Category:</b> {selectedBusiness.category}</p>
                <p><b>Address:</b> {selectedBusiness.address}</p>
                <p><b>Tax Number:</b> {selectedBusiness.taxNumber}</p>
                <p><b>Status:</b> {selectedBusiness.status}</p>
                {selectedBusiness.notes && <p><b>Notes:</b> {selectedBusiness.notes}</p>}
                {selectedBusiness.proof?.secure_url && (
                  <div className="mt-4 flex items-center gap-3">
                    <a href={selectedBusiness.proof.secure_url} target="_blank" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg transition">Open</a>
                    <button onClick={() => handleDownloadFile(selectedBusiness.proof.secure_url, `${selectedBusiness.businessName}-proof`)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition">Download</button>
                  </div>
                )}
                <button onClick={() => setShowBusinessModal(false)} className="mt-5 bg-red-500 px-4 py-2 rounded w-full">Close</button>
              </div>
            </div>
          )}
          {showClaimModal && selectedClaim && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-slate-900 p-6 rounded-xl w-[520px] text-white space-y-3">
                <h2 className="text-xl font-bold">{selectedClaim.businessName}</h2>
                <p><b>Business Code:</b> {selectedClaim.businessCode}</p>
                <p><b>Owner Name:</b> {selectedClaim.ownerName}</p>
                <p><b>Owner ID:</b> {selectedClaim.ownerId}</p>
                <p><b>Email:</b> {selectedClaim.email}</p>
                <p><b>Tax Number:</b> {selectedClaim.taxNumber || "—"}</p>
                <p><b>Reason:</b> {selectedClaim.reason || "—"}</p>
                {selectedClaim.proof?.secure_url && (
                  <div className="mt-4 flex items-center gap-3">
                    <a href={selectedClaim.proof.secure_url} target="_blank" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg transition">Open</a>
                    <button onClick={() => handleDownloadFile(selectedClaim.proof.secure_url, `${selectedClaim.businessName}-proof`)} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition">Download</button>
                  </div>
                )}
                <button onClick={() => setShowClaimModal(false)} className="mt-5 bg-red-500 px-4 py-2 rounded w-full">Close</button>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'businessUpdates' && renderPendingUpdates()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'tickets' && renderTickets()}

        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2"><Plus className="w-5 h-5 text-cyan-400" />Add New User</DialogTitle>
            <DialogDescription className="text-gray-400">Create a new user account with the information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label className="text-white">Full Name</Label><Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Enter full name" className="bg-slate-800/50 border-white/10 text-white mt-2" /></div>
            <div><Label className="text-white">Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@email.com" className="bg-slate-800/50 border-white/10 text-white mt-2" /></div>
            <div><Label className="text-white">Phone</Label><Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="+20 123 456 7890" className="bg-slate-800/50 border-white/10 text-white mt-2" /></div>
            <div><Label className="text-white">Password</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Enter password" className="bg-slate-800/50 border-white/10 text-white mt-2" /></div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddUser} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"><Save className="w-4 h-4 mr-2" />Add User</Button>
              <Button onClick={() => setShowAddUserDialog(false)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px]">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddBusinessDialog} onOpenChange={setShowAddBusinessDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />Add New Business
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Register a new business on the SPOT platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
              <h4 className="text-sm text-cyan-400 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />Business Information
              </h4>
              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <Label className="text-white">Business Name *</Label>
                  <Input
                    value={newBusiness.name}
                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                    placeholder="Enter business name"
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                  />
                </div>

                <div>
                  <Label className="text-white">Category *</Label>
                  <select
                    value={newBusiness.category}
                    onChange={(e) => setNewBusiness({ ...newBusiness, category: e.target.value })}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white mt-2"
                  >
                    <option value="gyms">Gym</option>
                    <option value="carservices">Car Service</option>
                    <option value="restaurants">Restaurant</option>
                    <option value="coworking">Co-working Space</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Business Phone *</Label>
                  <Input
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                    placeholder="+20 123 456 7890"
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Address *</Label>
                  <Input
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                    placeholder="Enter business address"
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Location URL on Maps</Label>
                  <Input
                    value={newBusiness.location_url_on_maps}
                    onChange={(e) => setNewBusiness({ ...newBusiness, location_url_on_maps: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                  />
                </div>

                {/* Photos Upload */}
                <div className="md:col-span-2">
                  <Label className="text-white">Business Photos</Label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group mt-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <Upload className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      {photoFiles.length > 0 ? (
                        <p className="text-sm text-cyan-400 font-medium">{photoFiles.length} photo(s) selected</p>
                      ) : (
                        <p className="text-sm text-gray-400">Click to upload photos</p>
                      )}
                      <p className="text-xs text-gray-600">up to 10 files</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                    />
                  </label>

                  {photoFiles.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {photoFiles.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${i}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Amenities</Label>
                  <Input
                    value={newBusiness.amenities}
                    onChange={(e) => setNewBusiness({ ...newBusiness, amenities: e.target.value })}
                    placeholder="WiFi, Parking, AC..."
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newBusiness.description}
                    onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                    placeholder="Enter business description"
                    className="bg-slate-800/50 border-white/10 text-white mt-2"
                    rows={3}
                  />
                </div>

              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddBusiness}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
              >
                <Save className="w-4 h-4 mr-2" />Add Business
              </Button>
              <Button
                onClick={() => setShowAddBusinessDialog(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Database Settings Dialog */}
      <Dialog open={showDatabaseSettings} onOpenChange={setShowDatabaseSettings}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2"><Database className="w-5 h-5 text-cyan-400" />Database Management</DialogTitle>
            <DialogDescription className="text-gray-400">Manage database backups, restores, and optimization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-800/50 rounded-xl p-4"><p className="text-white mb-2">Database Status</p><Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected - Running</Badge></div>
            <div className="space-y-3">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] justify-start"><RefreshCw className="w-4 h-4 mr-2" />Backup Database</Button>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] justify-start"><Upload className="w-4 h-4 mr-2" />Restore from Backup</Button>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] justify-start"><Database className="w-4 h-4 mr-2" />Optimize Database</Button>
            </div>
            <Button onClick={() => { setShowDatabaseSettings(false); handleSaveSettings('Database'); }} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notification Settings
            </DialogTitle>

            <DialogDescription className="text-gray-400">
              Configure how you receive admin notifications and alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {[
              {
                key: "emailNotifications" as const,
                label: "Email Notifications",
                desc: "Send alerts via email",
                Icon: Mail,
                color: "text-cyan-400",
              },
              
             
            ].map(({ key, label, desc, Icon, color }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="text-white">{label}</p>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                </div>

                <Switch
                  checked={notifSettings[key]}
                  onCheckedChange={(checked) =>
                    setNotifSettings((prev) => ({
                      ...prev,
                      [key]: checked,
                    }))
                  }
                  disabled={notifSaving}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-600"
                />
              </div>
            ))}

            <Button
              onClick={handleSaveNotificationSettings}
              disabled={notifSaving}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
            >
              {notifSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailTemplates} onOpenChange={setShowEmailTemplates}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />Email Templates
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage email templates sent to users and businesses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
            {[
              { name: "Welcome Email", icon: "👋", color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/5" },
              { name: "Business Approval", icon: "✅", color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/5" },
              { name: "Business Rejection", icon: "❌", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
              { name: "Booking Confirmation", icon: "📅", color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
              { name: "Review Request", icon: "⭐", color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
              { name: "Review Rejection", icon: "🚫", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
              { name: "Password Reset", icon: "🔐", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
              { name: "Payment Receipt", icon: "💳", color: "text-pink-400", border: "border-pink-500/20", bg: "bg-pink-500/5" },
              { name: "Payment Rejected", icon: "❌", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
              { name: "Account Suspended", icon: "🚫", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5" },
              { name: "Tier Upgrade Reward", icon: "🏆", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" }, // ✅ جديد
            ].map((template) => {
              const key = TEMPLATE_KEYS[template.name];
              const isCustomized = templatesData?.[key]?._customized === true;

              return (
                <div
                  key={template.name}
                  className={`flex items-center justify-between p-4 rounded-xl border ${template.border} ${template.bg} hover:bg-white/5 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
                      {template.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${template.color}`}>{template.name}</p>
                        {isCustomized && (
                          <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                            Customized
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {templatesData?.[key]?.subject ?? "Default template"}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      const current = templatesData?.[key];
                      setSelectedTemplate({
                        name: template.name,
                        key,
                        subject: current?.subject ?? "",
                        heading: current?.heading ?? "",
                        body: current?.body ?? "",
                        footer: current?.footer ?? "",
                      });
                      setShowEditTemplate(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px] text-xs px-3 py-1.5 h-auto border border-white/10 shrink-0"
                  >
                    <Edit className="w-3 h-3 mr-1.5" />Edit
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => setShowEmailTemplates(false)}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] mt-4"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* ✅ Edit Template Dialog */}
      <Dialog open={showEditTemplate} onOpenChange={setShowEditTemplate}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-cyan-400" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Edit text content only — styling and layout stay unchanged.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email subject</label>
              <Input
                className="bg-slate-800/50 border-white/10 text-white"
                value={selectedTemplate?.subject ?? ""}
                onChange={(e) =>
                  setSelectedTemplate((p) => p && { ...p, subject: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Heading</label>
              <Input
                className="bg-slate-800/50 border-white/10 text-white"
                value={selectedTemplate?.heading ?? ""}
                onChange={(e) =>
                  setSelectedTemplate((p) => p && { ...p, heading: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">
                Body
                <span className="ml-2 text-slate-500 font-normal">
                  — placeholders: {"{userName}"} {"{businessName}"}
                </span>
              </label>
              <Textarea
                rows={5}
                className="bg-slate-800/50 border-white/10 text-white resize-none"
                value={selectedTemplate?.body ?? ""}
                onChange={(e) =>
                  setSelectedTemplate((p) => p && { ...p, body: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Sign-off</label>
              <Input
                className="bg-slate-800/50 border-white/10 text-white"
                value={selectedTemplate?.footer ?? ""}
                onChange={(e) =>
                  setSelectedTemplate((p) => p && { ...p, footer: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleResetTemplate}
              className="bg-slate-800 hover:bg-slate-700 text-gray-400 rounded-[18px] border border-white/10 text-sm"
            >
              Reset to default
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
            >
              <Save className="w-4 h-4 mr-2" />Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Platform Settings Dialog */}
      <Dialog open={showPlatformSettings} onOpenChange={setShowPlatformSettings}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Platform Settings
            </DialogTitle>

            <DialogDescription className="text-gray-400">
              Control platform-wide settings and automation rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">Disable user access</p>
                </div>
              </div>

              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-600"
              />
            </div>


            {/* Auto Approve Business Updates */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white">Auto-Approve Business Updates</p>
                  <p className="text-sm text-gray-400">
                    Publish updates without review
                  </p>
                </div>
              </div>

              <Switch
                checked={autoApproveBusinessUpdates}
                onCheckedChange={setAutoApproveBusinessUpdates}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-600"
              />
            </div>

            {/* Allow User Registration */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white">Allow User Registration</p>
                  <p className="text-sm text-gray-400">
                    Let new users sign up
                  </p>
                </div>
              </div>

              <Switch
                checked={allowUserRegistration}
                onCheckedChange={setAllowUserRegistration}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-600"
              />
            </div>

            {/* Auto Approve Reviews */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white">Auto-Approve Reviews</p>
                  <p className="text-sm text-gray-400">
                    Publish reviews instantly
                  </p>
                </div>
              </div>

              <Switch
                checked={autoApproveReviews}
                onCheckedChange={setAutoApproveReviews}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-600"
              />
            </div>

            <Button
              onClick={async () => {
                await handleSaveSettings("Platform");
                setShowPlatformSettings(false);
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearCacheConfirm} onOpenChange={setShowClearCacheConfirm}>
        <DialogContent className="bg-slate-900 border-red-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Clear Cache
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-red-400 font-medium">Warning</p>
                <p className="text-gray-300 text-sm">This will permanently delete:</p>
                <ul className="text-gray-400 text-sm space-y-1 mt-2">
                  <li>• All active OTP codes</li>
                  <li>• All cached sessions</li>
                  <li>• All temporary data in Redis</li>
                </ul>
                <p className="text-gray-400 text-sm mt-2">
                  Users with pending email confirmations will need to request a new OTP.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={async () => {
                await handleClearCache();
                setShowClearCacheConfirm(false);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-[18px] flex items-center gap-2 justify-center"
            >
              <Trash2 className="w-4 h-4" />Yes, Clear Cache
            </Button>
            <Button
              onClick={() => setShowClearCacheConfirm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-[18px]"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Database Management
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage <span className="text-cyan-400">SmartLocalService</span> database
            </DialogDescription>
          </DialogHeader>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 text-center">
              <p className="text-2xl text-white">{collections.length}</p>
              <p className="text-xs text-gray-400 mt-1">Collections</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 text-center">
              <p className="text-2xl text-cyan-400">JSON</p>
              <p className="text-xs text-gray-400 mt-1">Format</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-green-400 text-sm">Live</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Status</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 mt-4">

            {/* Export All */}
            <button
              onClick={() => { setExportTarget({ type: 'all' }); setShowFormatDialog(true); }}
              className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm">Export All Data</p>
                  <p className="text-gray-400 text-xs">Download entire database as JSON</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
            </button>

            {/* Export by Collection — button يفتح dialog */}
            <button
              onClick={() => setShowCollectionsDialog(true)}
              className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm">Export by Collection</p>
                  <p className="text-gray-400 text-xs">{collections.length} collections available</p>
                </div>
              </div>
              <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">
                {collections.length}
              </span>
            </button>

            {/* Sync */}
            <button
              onClick={async () => { await handleSyncData(); }}
              className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm">Sync Database</p>
                  <p className="text-gray-400 text-xs">Refresh all data from database</p>
                </div>
              </div>
              <RefreshCw className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition" />
            </button>

            {/* Clear Cache */}
            <button
              onClick={() => { setShowExportDialog(false); setShowClearCacheConfirm(true); }}
              className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 px-4 py-3 rounded-xl border border-red-500/20 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-red-400 text-sm">Clear Cache</p>
                  <p className="text-gray-400 text-xs">Delete all Redis cached data</p>
                </div>
              </div>
              <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-400 transition" />
            </button>

          </div>
        </DialogContent>
      </Dialog>

      {/* Collections Dialog */}
      <Dialog open={showCollectionsDialog} onOpenChange={setShowCollectionsDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Export by Collection
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {collections.length} collections available
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4 max-h-96 overflow-y-auto pr-1">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-600 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm">Loading collections...</p>
              </div>
            ) : (
              collections.map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    setExportTarget({ type: 'collection', name: col });
                    setShowFormatDialog(true);
                  }}
                  className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white text-sm">{col}</span>
                  </div>
                  {exportingCollection === col ? (
                    <div className="flex items-center gap-1.5 text-cyan-400 text-xs">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Exporting...
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-purple-500/10 flex items-center justify-center transition">
                      <Download className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCollectionsDialog} onOpenChange={setShowCollectionsDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Export by Collection
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {collections.length} collections available
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4 max-h-96 overflow-y-auto pr-1">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-600 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm">Loading collections...</p>
              </div>
            ) : (
              collections.map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    setExportTarget({ type: 'collection', name: col });
                    setShowCollectionsDialog(false);
                    setShowFormatDialog(true);
                  }}
                  className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white text-sm">{col}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-purple-500/10 flex items-center justify-center transition">
                    <Download className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition" />
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Choose Export Format Dialog */}
      <Dialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Choose Export Format
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* JSON */}
            <button
              onClick={async () => {
                if (!exportTarget) return;
                setExportingCollection('format');
                if (exportTarget.type === 'all') await handleExportData('json');
                else await handleExportCollection(exportTarget.name, 'json');
                setExportingCollection(null);
                setShowFormatDialog(false);
              }}
              disabled={exportingCollection === 'format'}
              className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm">JSON</p>
                  <p className="text-gray-400 text-xs">Raw structured data</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition" />
            </button>

            {/* PDF */}
            <button
              onClick={async () => {
                if (!exportTarget) return;
                setExportingCollection('format');
                if (exportTarget.type === 'all') await handleExportData('pdf');
                else await handleExportCollection(exportTarget.name, 'pdf');
                setExportingCollection(null);
                setShowFormatDialog(false);
              }}
              disabled={exportingCollection === 'format'}
              className="w-full flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 px-4 py-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm">PDF</p>
                  <p className="text-gray-400 text-xs">Printable document</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition" />
            </button>
          </div>

          {exportingCollection === 'format' && (
            <p className="text-center text-cyan-400 text-sm mt-3 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />Exporting...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};