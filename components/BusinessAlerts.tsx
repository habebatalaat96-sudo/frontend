import React, { useState, useEffect } from 'react';
import {
  Bell,
  TrendingUp,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Clock,
  Settings,
  X,
  ChevronDown,
  BellOff,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw   
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import axios from "axios";


interface Alert {
  _id: string;

  type: string;

  priority: "high" | "medium" | "low";

  title: string;

  message: string;

  read: boolean;

  actionable: boolean;

  createdAt: string;
}

export const BusinessAlerts: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([]);


useEffect(() => {
  fetchAlerts();
  fetchNotificationSettings();

  const saved =
    localStorage.getItem(
      "alert_settings"
    );

  if (saved) {
    const settings =
      JSON.parse(saved);

    setBookingAlerts(
      settings.bookingAlerts ?? true
    );

    setBookingAlerts(
      settings.systemAlerts ?? true
    );

    setPaymentAlerts(
      settings.paymentAlerts ?? true
    );

    setReviewAlerts(
      settings.reviewAlerts ?? true
    );

    setEmailNotifications(
      settings.emailNotifications ?? true
    );

    setPushNotifications(
      settings.pushNotifications ?? true
    );

    setWeeklyDigest(
      settings.weeklyDigest ?? true
    );

    setSoundEnabled(
      settings.soundEnabled ?? false
    );
  }
}, []);

 const fetchAlerts = async () => {
  try {
    const token = localStorage.getItem("business_token");

    console.log("TOKEN:", token);

    const res = await axios.get(
      "http://localhost:5000/business/alerts",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  console.log(res.data.data);

    setAlerts(res.data.data);
  } catch (error: any) {
    console.log("FULL ERROR:", error);

    console.log(
      "BACKEND RESPONSE:",
      error.response?.data
    );

    console.log(
      "STATUS:",
      error.response?.status
    );

    toast.error("Failed to load alerts");
  }
};

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);

      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };


const fetchNotificationSettings = async () => {
  try {

    const token =
      localStorage.getItem("business_token");

    const res = await axios.get(
      "http://localhost:5000/business/notification-settings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const settings = res.data.data;

    setEmailNotifications(
      settings.emailNotifications
    );

    setPushNotifications(
      settings.pushNotifications
    );

    setSoundEnabled(
      settings.soundEnabled
    );

    setBookingAlerts(
      settings.bookingAlerts
    );

    setPaymentAlerts(
      settings.paymentAlerts
    );

    setReviewAlerts(
      settings.reviewAlerts
    );

    setSystemAlerts(
      settings.systemAlerts
    );

    setWeeklyDigest(
      settings.weeklyDigest
    );

  } catch (error) {

    console.log(error);

  }
};

  const handleMarkAsRead = async (
    alertId: string
  ) => {
    try {
        console.log("ALERT ID:", alertId);

      const token =
        localStorage.getItem("business_token");

      await axios.patch(
        `http://localhost:5000/business/alerts/${alertId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === alertId
            ? { ...alert, read: true }
            : alert
        )
      );

      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed");
    }
  };

 const handleMarkAllAsRead = async () => {
  try {

    const token =
      localStorage.getItem(
        "business_token"
      );

    await axios.patch(
      "http://localhost:5000/business/alerts/read-all",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setAlerts((prev) =>
      prev.map((alert) => ({
        ...alert,
        read: true,
      }))
    );

    toast.success(
      "All alerts marked as read"
    );

  } catch (error) {
    toast.error("Failed");
  }
};

  const handleDeleteAlert = async (
    alertId: string
  ) => {
    try {
      const token =
        localStorage.getItem("business_token");

      await axios.delete(
        `http://localhost:5000/business/alerts/${alertId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlerts((prev) =>
        prev.filter(
          (alert) => alert._id !== alertId
        )
      );

      toast.success("Alert deleted");
    } catch (error) {
      toast.error("Failed");
    }
  };

  const handleSaveSettings = async () => {
  try {

    const token =
      localStorage.getItem("business_token");

    await axios.patch(
      "http://localhost:5000/business/notification-settings",
      {
        emailNotifications,
        pushNotifications,
        soundEnabled,

        bookingAlerts,
        paymentAlerts,
        reviewAlerts,
        systemAlerts,

        weeklyDigest,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(
      "Notification settings saved"
    );

    setShowSettings(false);

  } catch (error) {

    toast.error(
      "Failed to save settings"
    );

  }
};

const filteredAlerts = alerts.filter(
  (alert) => {

    if (
      alert.type === "booking" &&
      !bookingAlerts
    ) {
      return false;
    }

    if (
      alert.type === "payment" &&
      !paymentAlerts
    ) {
      return false;
    }

    if (
      alert.type === "review" &&
      !reviewAlerts
    ) {
      return false;
    }
  
    if (
      alert.type === "system" &&
      !systemAlerts
    ) {
      return false;
    }

    if (
      filterType === "unread" &&
      alert.read
    ) {
      return false;
    }

    if (
      filterType === "high" &&
      alert.priority !== "high"
    ) {
      return false;
    }

    if (
      filterCategory !== "all" &&
      alert.type !== filterCategory
    ) {
      return false;
    }

    return true;
  }
);

  const stats = {
    total: alerts.length,

    unread: alerts.filter(
      (a) => !a.read
    ).length,

    high: alerts.filter(
      (a) => a.priority === "high"
    ).length,

    actionable: alerts.filter(
      (a) => a.actionable && !a.read
    ).length,
  };

useEffect(() => {
  localStorage.setItem(
    "alert_settings",
    JSON.stringify({
      bookingAlerts,
      paymentAlerts,
      reviewAlerts,
      systemAlerts,
      emailNotifications,
      pushNotifications,
      weeklyDigest,
      soundEnabled,
    })
  );
}, [
  bookingAlerts,
  paymentAlerts,
  reviewAlerts,
  systemAlerts,
  emailNotifications,
  pushNotifications,
  weeklyDigest,
  soundEnabled,
]);

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'system': return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority: string, type: string) => {
    if (priority === 'high') {
      return {
        bg: 'bg-red-900/30',
        border: 'border-red-500/30',
        icon: 'text-red-400'
      };
    }
    if (type === 'recommendation') {
      return {
        bg: 'bg-purple-900/30',
        border: 'border-purple-500/30',
        icon: 'text-purple-400'
      };
    }
    if (type === 'update') {
      return {
        bg: 'bg-cyan-900/30',
        border: 'border-cyan-500/30',
        icon: 'text-cyan-400'
      };
    }
    return {
      bg: 'bg-slate-900',
      border: 'border-white/10',
      icon: 'text-gray-400'
    };
  };

  if (showSettings) {
    return (
      <div className="space-y-6 pb-8">
        {/* Settings Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl text-white mb-2">Notification Settings</h2>
            <p className="text-gray-400">Manage how you receive alerts and updates</p>
          </div>

           <button
            onClick={() => setShowSettings(false)}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-[18px] flex items-center gap-2 transition-all duration-300 shadow-lg shadow-cyan-500/20"
          >
            <X className="w-4 h-4 mr-2" />
            <span className="text-sm">Close</span>
          </button>
        </div>

        {/* Notification Channels */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive alerts via email</p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white">Push Notifications</p>
                  <p className="text-sm text-gray-400">Receive instant push alerts</p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white">Sound Effects</p>
                  <p className="text-sm text-gray-400">Play sound for new notifications</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>
        </div>

        {/* Alert Categories */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-4">Alert Categories</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white">Booking Alerts</p>
                  <p className="text-sm text-gray-400">New bookings and cancellations</p>
                </div>
              </div>
              <Switch
                checked={bookingAlerts}
                onCheckedChange={setBookingAlerts}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white">Payment Alerts</p>
                  <p className="text-sm text-gray-400">Payment received and failed transactions</p>
                </div>
              </div>
              <Switch
                checked={paymentAlerts}
                onCheckedChange={setPaymentAlerts}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white">Review Alerts</p>
                  <p className="text-sm text-gray-400">New reviews and ratings</p>
                </div>
              </div>
              <Switch
                checked={reviewAlerts}
                onCheckedChange={setReviewAlerts}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white">System Alert</p>
                  <p className="text-sm text-gray-400">Marketing tips and updates</p>
                </div>
              </div>
              <Switch
                checked={systemAlerts}
                onCheckedChange={setSystemAlerts}
              />
            </div>
          </div>
        </div>

        {/* Digest Settings */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-4">Email Digest</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white">Weekly Summary</p>
                  <p className="text-sm text-gray-400">Receive a weekly performance summary</p>
                </div>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-3 rounded-[18px]"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
{/* Header */}
<div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
  {/* <div>
    <h2 className="text-3xl text-white mb-2">Alerts & Notifications</h2>
    <p className="text-gray-400">Stay updated with your business activities</p>
  </div> */}
  <div className="flex items-center gap-2">

    <Button
      onClick={() => setShowSettings(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white transition-all duration-300"
    >
      <Settings className="w-4 h-4" />
      <span>Settings</span>
    </Button>
  </div>
</div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Alerts</span>
            <Bell className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl text-white">{stats.total}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Unread</span>
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl text-white">{stats.unread}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">High Priority</span>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl text-white">{stats.high}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Action Needed</span>
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl text-white">{stats.actionable}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-white text-sm mb-2 block">Filter by Status</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="all">All Alerts</option>
                <option value="unread">Unread Only</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-white text-sm mb-2 block">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="booking">Bookings</option>
                <option value="payment">Payments</option>
                <option value="review">Reviews</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Quick Action */}
            <div className="flex items-end">
              <Button
                onClick={handleMarkAllAsRead}
                disabled={stats.unread === 0}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-[18px] border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <BellOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const colors = getAlertColor(alert.priority, alert.type);
            return (
              <div
                key={alert._id}
                className={`${colors.bg} rounded-2xl p-5 border ${colors.border} ${!alert.read ? 'shadow-lg' : 'opacity-75'
                  } transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${colors.icon} mt-1 flex-shrink-0`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white">{alert.title}</h4>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        )}
                        {alert.priority === 'high' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            High Priority
                          </Badge>
                        )}
                        {alert.actionable && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            Action Needed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.read && (
                          <button
                            onClick={() => handleMarkAsRead(alert._id)}
                            className="text-cyan-400 hover:text-cyan-300 text-xs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAlert(alert._id)}
                          className="text-gray-400 hover:text-red-400 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(alert.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
