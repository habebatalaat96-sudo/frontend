import React, { useState } from 'react';
import { Building2, Upload, FileText, Lock, KeyRound,CheckCircle, LogIn, UserPlus, Award, Mail,ArrowLeft  } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { BusinessDashboard } from './BusinessDashboard';
import { z } from "zod";
import { businessEnum } from './businessEnum';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
interface BusinessOwnerPortalProps {
  onNavigate: any;
  // onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'businesses' | 'business-portal', section?: string, tab?: 'list' | 'claim' | 'login') => void;
  defaultTab?: 'list' | 'claim' | 'login';
  onPasswordChanged: () => void;

}

export const CATEGORY = {
  gyms: "gyms",
  carservices: "carservices",
  restaurants: "restaurants",
  coworking: "coworking",
} as const;

// // Mock email service - simulates sending an email
// const sendEmail = async (to: string, subject: string, message: string) => {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 1000));

//   // Log to console (in production, this would be an actual email service)
//   console.log('📧 Email sent to:', to);
//   console.log('Subject:', subject);
//   console.log('Message:', message);

//   return { success: true };
// };

export const listBusinessSchema = z.object({
  businessName: z.string().min(3, " is required & at least number of character is 3"),
  ownerName: z.string().min(3, " is required & at least number of character is 3"),
  taxNumber: z.string().max(14, "taxNumber max 14 characters"),
  ownerId: z.string().max(14, "ownerId max  14 characters"),
  businessCode: z.string().max(14, "businessCode max  14 characters"),
  email: z.string(),
  address: z.string().min(1),
  phone: z.string()
    .min(10, "phone must be at least 11 digits")
    .max(15).regex(/^(0020|0|\+20)1[0125][0-9]{8}$/),
  notes: z.string().optional(),
  category: z.enum(businessEnum),
});

export const claimBusinessSchema = z.object({
  businessName: z.string().min(3, " is required & at least number of character is 3"),
  taxNumber: z.string({ error: "businessCode is required & must be 14 characters" }).length(14),

  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  phone: z.string().min(10).max(15).regex(/^(0020|0|\+20)1[0125][0-9]{8}$/),
  reason: z.string().optional(),
  ownerId: z.string({ error: "ownerId is required & must be 14 characters" }).length(14),
  ownerName: z.string({ error: "ownerName is required & at least number of character is 3" }),
  businessCode: z.string({ error: "businessCode is required & must be 14 characters" }).length(14),
})

export const BusinessOwnerPortal: React.FC<BusinessOwnerPortalProps> = ({ onNavigate, defaultTab = 'list', onPasswordChanged }) => {
  const navigate = useNavigate();

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [tab, setTab] = useState("login");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
  const [claimUploadedDocs, setClaimUploadedDocs] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedBusinessEmail, setSubmittedBusinessEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // List Business Form State
  const [listFormData, setListFormData] = useState({
    businessName: '',
    businessCode: '',
    category: '',
    ownerName: '',
    ownerId: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    notes: ''
  });
  const [loginMode, setLoginMode] = useState<"otp" | "password">("otp");
  // Claim Business Form State
  const [claimFormData, setClaimFormData] = useState({
    businessName: "",
    businessCode: '',
    ownerName: '',
    ownerId: '',
    email: '',
    phone: '',
    reason: '',
    taxNumber: ""
  });

  const [otp, setOtp] = useState("");

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "", // ✅ أضف دي
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInEmail('');
    toast.success('Logged out successfully');
  };

  const handleClaimBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = claimBusinessSchema.safeParse(claimFormData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    if (!claimUploadedDocs) {
      toast.error("Please upload ownership verification document");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const data = validation.data;

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      formData.append("claimDocument", claimUploadedDocs);

      const token = localStorage.getItem("user_token"); // 👈 مهم لو عندك auth

      const res = await fetch("http://localhost:5000/OwnerCliam/claim", {
        method: "POST",
        body: formData,
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        credentials: "include",
      });

      const dataRes = await res.json();

      if (!res.ok) {
        toast.error(dataRes?.message || "Failed to submit claim");
        return;
      }

      toast.success("Claim submitted successfully! Waiting for admin approval");

      setSubmittedBusinessEmail(data.email);
      setShowSuccessMessage(true);

      setClaimFormData({
        businessName: "",
        businessCode: "",
        ownerName: "",
        ownerId: "",
        email: "",
        phone: "",
        reason: "",
        taxNumber: ""
      });

      setClaimUploadedDocs(null);

    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClaimFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setClaimUploadedDocs(file);
    }
  };


  const handleLoginWithPassword = async () => {
    if (!loginFormData.email || !loginFormData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/OwnerCliam/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginFormData.email.trim().toLowerCase(),
          password: loginFormData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Login failed");
        return;
      }

      localStorage.setItem("business_token", data.data.token);
      localStorage.setItem("business", JSON.stringify(data.data.business));
localStorage.setItem(
  "businessId", 
  data.data.business?.business || data.data.business?._id
);
      toast.success("Login successful!");
      onPasswordChanged(); // أو الـ function اللي بتودي على الـ dashboard

    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginFormData.email) {
      toast.error("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/OwnerCliam/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginFormData.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Login failed");
        return;
      }

      toast.success("OTP sent from admin");

      // 👇 مهم جداً عشان نكمل flow
      localStorage.setItem("otp_email", loginFormData.email);

      setTab("otp");

    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email =
      loginFormData.email || localStorage.getItem("otp_email");

    if (!otp || !email) {
      toast.error("OTP and email are required");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/OwnerCliam/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Invalid OTP");
        return;
      }

      localStorage.setItem("temp_token", data.data.temp_token);
      localStorage.removeItem("otp_email");

      toast.success("OTP verified successfully");

      setTab("changePassword");

    } catch {
      toast.error("Verification failed");
    }
  };

const handleForgotPassword = async () => {
  if (!loginFormData.email) { toast.error("Email is required"); return; }
  setIsSubmitting(true);
  try {
    const res = await fetch("http://localhost:5000/OwnerCliam/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginFormData.email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data?.message || "Failed"); return; }
    toast.success("OTP sent to your email!");
    localStorage.setItem("otp_email", loginFormData.email);
    setTab("otp"); // ✅ روح OTP tab
  } catch {
    toast.error("Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("temp_token");

    if (!token) {
      toast.error("Session expired. Please verify OTP again.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch(
        "http://localhost:5000/OwnerCliam/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");

      // ✅ business login token
      localStorage.setItem("business_token", data.data.token);

      // ✅ business data
      localStorage.setItem("business", JSON.stringify(data.data.business));

      // cleanup
      localStorage.removeItem("temp_token");

      onPasswordChanged();

    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("temp_token");

    if (!token) {
      navigate("/business/login");
    }
  }, [navigate]);




  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setUploadedDoc(file);
    }
  };

  const handleListBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = listBusinessSchema.safeParse(listFormData);

    if (!result.success) {
      result.error.issues.forEach((err) => {
        toast.error(`${err.path.join(".")}: ${err.message}`);
      });
      return;
    }

    if (!uploadedDoc) {
      toast.error("Please upload proof document");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const data = result.data;

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      formData.append("proof", uploadedDoc);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/OwnerCliam/list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const dataRes = await res.json();

      if (!res.ok) {
        toast.error(dataRes?.message || "Request failed");
        return;
      }

      toast.success("Business submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };



  // Show Business Dashboard if logged in
if (isLoggedIn) {
  return (
    <BusinessDashboard
      businessEmail={loggedInEmail}
      onLogout={handleLogout}
      onNavigateToPreview={(serviceData) => {
        // هنا تعمل اللي محتاجه لما الـ owner يضغط preview
        // مثلاً لو عندك navigate أو setCurrentPage
        console.log("Navigate to preview:", serviceData);
      }}
    />
  );
}

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h1 className="text-3xl md:text-4xl text-white mb-4">
              Request Submitted Successfully!
            </h1>

            <p className="text-xl text-gray-300 mb-6">
              Check your email for further updates
            </p>

            <div className="bg-slate-700/30 border border-cyan-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-cyan-400" />
                <p className="text-white text-lg">Confirmation sent to:</p>
              </div>
              <p className="text-cyan-400 font-mono">{submittedBusinessEmail}</p>
            </div>

            <div className="bg-slate-700/20 border border-white/10 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg text-white mb-3">What's Next?</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Our team will review your submission within 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an email update once the review is complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>If approved, you'll get access to your business dashboard</span>
                </li>
              </ul>
            </div>

<div className="flex justify-center">
  <Button
    onClick={() => onNavigate('home')}
    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-3 rounded-[18px]"
  >
    Return to Home
  </Button>
</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-full mb-6 backdrop-blur-sm">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm">Business Owner Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl text-white mb-4">
            Manage Your Business on SPOT
          </h1>
          <p className="text-xl text-gray-300">
            Add your business, claim existing listings, or access your dashboard
          </p>
        </div>




        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-white/10 p-1 rounded-xl mb-8">
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-[rgb(255,255,255)]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Business & owner
            </TabsTrigger>
            <TabsTrigger
              value="claim"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-[rgb(255,255,255)]"
            >
              <Award className="w-4 h-4 mr-2" />
              Claim Business
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-[rgb(255,255,255)]"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </TabsTrigger>
          </TabsList>



          {/* List Business Tab */}
          <TabsContent value="list">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl text-white mb-2">Add Your Business</h2>
                <p className="text-gray-400">Register your business on SPOT and start reaching more customers</p>
              </div>
              <form onSubmit={handleListBusinessSubmit} className="space-y-6">
                {/* Business Name */}
                <div>
                  <Label htmlFor="business-name" className="text-white mb-2 block">Business Name *</Label>
                  <Input
                    id="business-name"
                    type="text"
                    placeholder="Enter your business name"
                    value={listFormData.businessName}
                    onChange={(e) => setListFormData({ ...listFormData, businessName: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                    required
                  />
                </div>

                {/* Business ID Number */}
                <div>
                  <Label htmlFor="business-id" className="text-white mb-2 block">Business ID Number *</Label>
                  <Input
                    id="business-id"
                    type="text"
                    placeholder="Enter 14-digit business ID"
                    maxLength={14}
                    value={listFormData.businessCode}
                    onChange={(e) => setListFormData({ ...listFormData, businessCode: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">14-digit unique business identification number</p>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-white mb-2 block">Business Category *</Label>
                  <select
                    id="category"
                    value={listFormData.category}
                    onChange={(e) => setListFormData({ ...listFormData, category: e.target.value })}
                    className="w-full bg-slate-700/50 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value={CATEGORY.gyms}>Gyms & Fitness</option>
                    <option value={CATEGORY.carservices}>Car Services</option>
                    <option value={CATEGORY.restaurants}>Restaurants & Cafes</option>
                    <option value={CATEGORY.coworking}>Co-working Spaces</option>
                  </select>
                </div>

                {/* Owner Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="owner-name" className="text-white mb-2 block">Owner Full Name *</Label>
                    <Input
                      id="owner-name"
                      type="text"
                      placeholder="Your full name"
                      value={listFormData.ownerName}
                      onChange={(e) => setListFormData({ ...listFormData, ownerName: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner-id" className="text-white mb-2 block">Owner National Id *</Label>
                    <Input
                      id="owner-id"
                      type="text"
                      placeholder="Your national ID number is 14 digits"
                      maxLength={14}
                      value={listFormData.ownerId}
                      onChange={(e) => setListFormData({ ...listFormData, ownerId: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">Owner Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="business@example.com"
                      value={listFormData.email}
                      onChange={(e) => setListFormData({ ...listFormData, email: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white mb-2 block">Business Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+20 123 456 7890 | 0 123 456 7890"
                      maxLength={15}
                      value={listFormData.phone}
                      onChange={(e) => setListFormData({ ...listFormData, phone: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Business Address */}
                <div>
                  <Label htmlFor="address" className="text-white mb-2 block">Business Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete business address"
                    rows={3}
                    value={listFormData.address}
                    onChange={(e) => setListFormData({ ...listFormData, address: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 resize-none"
                    required
                  />
                </div>
                {/* Tax Registration Number */}
                <div>
                  <Label htmlFor="tax-number" className="text-white mb-2 block">Tax Registration Number</Label>
                  <Input
                    id="tax-number"
                    type="text"
                    placeholder="max Tax registration number is 14-digit"
                    maxLength={14}
                    value={listFormData.taxNumber}
                    onChange={(e) => setListFormData({ ...listFormData, taxNumber: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                  />
                </div>

                {/* Proof of Ownership */}
                <div>
                  <Label className="text-white mb-3 block">Proof of Ownership *</Label>
                  <div className="bg-slate-700/30 border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-all cursor-pointer">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Upload Documents</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Business license, registration certificate, tax documents, or any proof of ownership
                      </p>
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                      <p className="text-xs text-gray-500 mt-3">PDF , JPG , PNG , JPEG(1 max. 10MB each)</p>
                    </label>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedDoc && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3 bg-slate-700/50 border border-white/10 rounded-lg p-3">
                        <FileText className="w-5 h-5 text-purple-400" />

                        <span className="text-white text-sm flex-1">
                          {uploadedDoc.name}
                        </span>

                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes" className="text-white mb-2 block">Additional Information</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details about your business ownership..."
                    rows={4}
                    value={listFormData.notes}
                    onChange={(e) => setListFormData({ ...listFormData, notes: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 text-lg rounded-[18px]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>




          {/* Claim Business Tab */}
          <TabsContent value="claim">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl text-white mb-2">Claim Your Business</h2>
                <p className="text-gray-400">Already listed on SPOT? Claim ownership to manage your profile</p>
              </div>

              <form onSubmit={handleClaimBusinessSubmit} className="space-y-6">
                {/* Search Business */}
                <div>
                  <Label htmlFor="search-business" className="text-white mb-2 block">Your Business Name *</Label>
                  <Input
                    id="search-business"
                    type="text"
                    placeholder="Enter business name"
                    value={claimFormData.businessName}
                    onChange={(e) => setClaimFormData({ ...claimFormData, businessName: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll help you find your business in our directory</p>
                </div>

                {/* Business ID */}
                <div>
                  <Label htmlFor="claim-business-id" className="text-white mb-2 block">your Business Id *</Label>
                  <Input
                    id="claim-business-id"
                    type="text"
                    placeholder="Enter 14-digit business code"
                    maxLength={14}
                    name="businessCode"
                    value={claimFormData.businessCode}
                    onChange={(e) => setClaimFormData({ ...claimFormData, businessCode: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tax-number" className="text-white mb-2 block">Tax Registration Number</Label>
                  <Input
                    id="tax-number"
                    type="text"
                    placeholder="max Tax registration number is 14-digit"
                    maxLength={14}
                    value={claimFormData.taxNumber}
                    onChange={(e) =>
                      setClaimFormData({
                        ...claimFormData,
                        taxNumber: e.target.value,
                      })
                    }
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                  />
                </div>


                {/* Owner Verification */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claim-owner-name" className="text-white mb-2 block">Your Full Name *</Label>
                    <Input
                      id="claim-owner-name"
                      type="text"
                      placeholder="Owner's full name"
                      value={claimFormData.ownerName}
                      onChange={(e) => setClaimFormData({ ...claimFormData, ownerName: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="claim-owner-id" className="text-white mb-2 block">Your National ID Number *</Label>
                    <Input
                      id="claim-owner-id"
                      type="text"
                      placeholder="Your National ID number"
                      value={claimFormData.ownerId}
                      onChange={(e) => setClaimFormData({ ...claimFormData, ownerId: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Contact for Verification */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claim-email" className="text-white mb-2 block">your Email Address *</Label>
                    <Input
                      id="claim-email"
                      type="email"
                      placeholder="your@email.com"
                      value={claimFormData.email}
                      onChange={(e) => setClaimFormData({ ...claimFormData, email: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="claim-phone" className="text-white mb-2 block">your Phone Number *</Label>
                    <Input
                      id="claim-phone"
                      type="tel"
                      placeholder="+20 123 456 7890"
                      value={claimFormData.phone}
                      onChange={(e) => setClaimFormData({ ...claimFormData, phone: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Ownership Documents */}
                <div>
                  <Label className="text-white mb-3 block">Ownership Verification Documents *</Label>
                  <div className="bg-slate-700/30 border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-all cursor-pointer">
                    <input
                      type="file"
                      id="claim-file-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleClaimFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="claim-file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Upload Proof of Ownership</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Business license, ID, utility bills, or official documents
                      </p>
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white rounded-[18px]"
                        onClick={() => document.getElementById('claim-file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                      <p className="text-xs text-gray-500 mt-3">PDF , JPG , PNG , JPEG (1 max. 10MB each)</p>
                    </label>
                  </div>

                  {/* Uploaded Files */}
                  {claimUploadedDocs && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3 bg-slate-700/50 border border-white/10 rounded-lg p-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="text-white text-sm flex-1">
                          {claimUploadedDocs.name}
                        </span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Reason for Claim */}
                <div>
                  <Label htmlFor="claim-reason" className="text-white mb-2 block">Why are you claiming this business?</Label>
                  <Textarea
                    id="claim-reason"
                    placeholder="Please provide details about your ownership..."
                    rows={4}
                    value={claimFormData.reason}
                    onChange={(e) => setClaimFormData({ ...claimFormData, reason: e.target.value })}
                    className="bg-slate-700/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white py-6 text-lg rounded-[18px]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* login Tab */}
          <TabsContent value="login">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl text-white mb-2">Business Owner Login</h2>
                <p className="text-gray-400">Enter your credentials to login</p>
              </div>

              {/* ✅ اختار نوع الـ login */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setLoginMode("otp")}
                  className={`flex-1 py-2 rounded-lg text-sm transition ${loginMode === "otp"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-700/50 text-gray-400 border border-white/10"
                    }`}
                >
                  First Time (OTP)
                </button>
                <button
                  onClick={() => setLoginMode("password")}
                  className={`flex-1 py-2 rounded-lg text-sm transition ${loginMode === "password"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-slate-700/50 text-gray-400 border border-white/10"
                    }`}
                >
                  Login with Password
                </button>
              </div>

              {/* OTP Login */}
              {loginMode === "otp" && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <Label className="text-white mb-2 block">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="business@example.com"
                      value={loginFormData.email}
                      onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px]"
                  >
                    {isSubmitting ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              )}

              {/* Password Login */}
              {loginMode === "password" && (
                <div className="space-y-5">

                  <div>
                    <Label className="text-white mb-2 block text-sm font-medium">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="business@example.com"
                      value={loginFormData.email}
                      onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={loginFormData.password || ""}
                      onChange={(e) => setLoginFormData({ ...loginFormData, password: e.target.value })}
                      className="bg-slate-700/50 border-white/10 text-white"
                    />
                    {/* ✅ Forgot Password */}
                    <div className="text-right mt-2">
                      <span
                        onClick={() => setTab("forgotPassword")}
                        className="text-cyan-400 text-sm cursor-pointer hover:text-cyan-300 transition"
                      >
                        Forgot Password?
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleLoginWithPassword}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px]"
                  >
                    Login
                  </Button>

                </div>
              )}

            </div>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="changePassword">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">

              {/* HEADER */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  <Lock className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Set Your Password</h2>
                <p className="text-gray-400 text-sm">Create a strong password to secure your account</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5">

                {/* New Password */}
                <div>
                  <Label className="text-white mb-2 block text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter at least 8 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={`bg-slate-700/50 border text-white pr-10 transition-all ${passwordForm.newPassword.length === 0
                          ? "border-white/10"
                          : passwordForm.newPassword.length >= 8
                            ? "border-green-500/50 focus:border-green-500"
                            : "border-red-500/50 focus:border-red-500"
                        }`}
                    />
                    {passwordForm.newPassword.length > 0 && (
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${passwordForm.newPassword.length >= 8
                          ? "border-green-400 bg-green-400/20"
                          : "border-red-400 bg-red-400/20"
                        }`}>
                        {passwordForm.newPassword.length >= 8 ? (
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Strength Bar */}
                  {passwordForm.newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordForm.newPassword.length >= i * 3
                                ? passwordForm.newPassword.length >= 12
                                  ? "bg-green-400"
                                  : passwordForm.newPassword.length >= 8
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                : "bg-slate-600"
                              }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordForm.newPassword.length >= 12
                          ? "text-green-400"
                          : passwordForm.newPassword.length >= 8
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                        {passwordForm.newPassword.length >= 12
                          ? "Strong password"
                          : passwordForm.newPassword.length >= 8
                            ? "Good password"
                            : "Too short"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label className="text-white mb-2 block text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Re-enter your password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={`bg-slate-700/50 border text-white pr-10 transition-all ${passwordForm.confirmPassword.length === 0
                          ? "border-white/10"
                          : passwordForm.confirmPassword === passwordForm.newPassword && passwordForm.newPassword.length >= 8
                            ? "border-green-500/50 focus:border-green-500"
                            : "border-red-500/50 focus:border-red-500"
                        }`}
                    />
                    {passwordForm.confirmPassword.length > 0 && (
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${passwordForm.confirmPassword === passwordForm.newPassword && passwordForm.newPassword.length >= 8
                          ? "border-green-400 bg-green-400/20"
                          : "border-red-400 bg-red-400/20"
                        }`}>
                        {passwordForm.confirmPassword === passwordForm.newPassword && passwordForm.newPassword.length >= 8 ? (
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {passwordForm.confirmPassword.length > 0 && passwordForm.confirmPassword !== passwordForm.newPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={
                    isChangingPassword ||
                    passwordForm.newPassword.length < 8 ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 text-lg rounded-[18px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Changing...
                    </span>
                  ) : (
                    "Set Password"
                  )}
                </Button>

              </form>
            </div>
          </TabsContent>

          {/* Forgot Password Tab */}
<TabsContent value="forgotPassword">
  <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">

    <TabsContent value="otp">
      <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">

        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
          <p className="text-gray-400 text-sm">Enter the OTP sent to your email</p>
        </div>

        <div className="space-y-5">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-slate-700/50 border-white/10 text-white text-center text-lg tracking-widest"
          />

          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px]"
          >
            Verify OTP
          </Button>

          {/* ✅ التعديل هنا */}
          <Button
            onClick={() => setTab("login")}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px] flex items-center justify-center gap-2"
          >
            Back to Login
          </Button>

        </div>
      </div>
    </TabsContent>

    {/* HEADER */}
    <div className="mb-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
        <KeyRound className="w-8 h-8 text-cyan-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
      <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset OTP</p>
    </div>

    <div className="space-y-5">
      <div>
        <Label className="text-white mb-2 block text-sm font-medium">Email Address</Label>
        <Input
          type="email"
          placeholder="business@example.com"
          value={loginFormData.email}
          onChange={(e) => setLoginFormData({ ...loginFormData, email: e.target.value })}
          className="bg-slate-700/50 border-white/10 text-white"
        />
      </div>

      <Button
        onClick={handleForgotPassword}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px]"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending...
          </span>
        ) : "Send Reset OTP"}
      </Button>

      {/* ✅ التعديل هنا */}
      <Button
        onClick={() => setTab("login")}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 text-lg rounded-[18px] flex items-center justify-center gap-2"
      >
        Back to Login
      </Button>

    </div>
  </div>
</TabsContent>
          {/* OTP Tab */}
          <TabsContent value="otp">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl text-white mb-2">Verify OTP</h2>
                <p className="text-gray-400">Enter OTP sent by admin</p>
              </div>
              <div className="space-y-6">
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-slate-700/50 border-white/10 text-white"
                />
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600"
                >
                  Verify OTP
                </Button>
                <button onClick={() => setTab("login")} className="text-gray-400 text-sm">
                  ← Back
                </button>
              </div>
            </div>
          </TabsContent>


        </Tabs>





        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-3">
            Need help? Our team is here to assist you with the verification process.
          </p>
          <Button
            onClick={() => onNavigate('contact-us')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};
