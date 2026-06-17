import React, { useState } from 'react';
import {
  Building2,
  Home,
  Settings,
  Star,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';

import { toast } from 'sonner';

import { Button } from './ui/button';
import { BusinessAnalytics } from './BusinessAnalytics';
import { BusinessProfile } from './BusinessProfile';
import { BusinessReviews } from './BusinessReviews';
import { BusinessAlerts } from './BusinessAlerts';
import { BusinessBookings } from './BusinessBookings';
import { API_URL } from "../config/api";

// ✅ في BusinessDashboard props interface — أضف
interface BusinessDashboardProps {
  businessEmail: string;
  onLogout: () => void;
  onNavigateToPreview: (serviceData: any) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  businessEmail,
  onLogout,
    onNavigateToPreview, 
}) => {
const business = JSON.parse(localStorage.getItem('business') || '{}');
const businessId = business?.business || business?._id; 

  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'reviews' | 'alerts' | 'bookings'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [businessLogo, setBusinessLogo] = useState<string>(() => {
  const b = JSON.parse(localStorage.getItem('business') || '{}');
  return Array.isArray(b.photo_url) && b.photo_url.length > 0 
    ? b.photo_url[0] 
    : '';
});
  // Mock business data (in production, this would come from API)
const storedBusiness = JSON.parse(localStorage.getItem('business') || '{}');
const businessData = {
  name: storedBusiness.businessName || storedBusiness.name || 'My Business',
  category: storedBusiness.category || '',
  email: businessEmail,
};

  const navItems = [
    { id: 'home' as const, label: 'My Business', icon: Home },
    { id: 'profile' as const, label: 'Manage Profile', icon: Settings },
    { id: 'reviews' as const, label: 'Reviews', icon: Star },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell }
  ];

  const handleBookingsClick = () => {
    setCurrentPage('bookings');
  };

  const handleLogoUpdate = (logoUrl: string) => {
    setBusinessLogo(logoUrl);
  };


const handleOwnerLogout = async () => {
  console.log("LOGOUT CLICKED");

  try {
    const token = localStorage.getItem("business_token");

    await fetch(`${API_URL}/OwnerCliam/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
  } finally {
    // ✅ امسح الـ localStorage في كل الحالات
    localStorage.removeItem("business_token");
    localStorage.removeItem("business");
    localStorage.removeItem("businessId");

    toast.success("Logged out successfully");

    // ✅ استدعي الـ onLogout عشان الـ App يعرف
    onLogout();
  }
};
  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Business Name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {businessLogo ? (
                    <img src={businessLogo} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-white">{businessData.name}</p>
                  <p className="text-xs text-gray-400">{businessData.category}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Desktop Navigation & Logout */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[18px] transition-all duration-300 ${currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}

  <button
  onClick={handleOwnerLogout}
  className="flex items-center gap-2 px-4 py-2 rounded-[18px] transition-all duration-300 text-gray-300 hover:bg-white/10"
>
  <LogOut className="w-4 h-4" />
  <span>Logout</span>
</button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-3 rounded-[18px] transition-all duration-300 ${currentPage === item.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <Button
  onClick={handleOwnerLogout}
  className="flex items-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
>
  <LogOut className="w-4 h-4" />
  Logout
</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl text-white mb-2">
              {/* {currentPage === 'home' && 'My Business Dashboard'} */}
              {currentPage === 'profile' && 'Manage Profile'}
                {/* {currentPage === 'reviews' && 'Customer Reviews'} */}
              {currentPage === 'alerts' && 'Notifications & Alerts'}
              {currentPage === 'bookings' && 'Manage Bookings'}
            </h1>
            <p className="text-gray-400">
              {/* {currentPage === 'home' && 'Overview of your business performance and activity'} */}
              {currentPage === 'profile' && 'Update your business information in real-time'}
              {/* {currentPage === 'reviews' && 'Engage with customer feedback and build relationships'} */}
              {currentPage === 'alerts' && 'Stay informed about important business updates'}
              {currentPage === 'bookings' && 'Manage customer bookings and send alerts'}
            </p>
          </div>

          {/* Page Content */}
          {currentPage === 'home' && (
            <BusinessAnalytics onBookingsClick={handleBookingsClick} />
          )}

{currentPage === 'profile' && (
  <BusinessProfile
    businessEmail={businessEmail}
    onLogoUpdate={handleLogoUpdate}
    businessId={businessId}
    onNavigate={(page, data) => {
      if (page === 'service-details') {
        const business = JSON.parse(localStorage.getItem('business') || '{}');
        onNavigateToPreview({
          id: data?.businessId || business._id,
          name: business.businessName || business.name,
          category: business.category || 'Gyms',
          rating: business.average_rating || 0,
          reviews: 0,
          location: business.location || '',
          address: business.location || '',
          phone: business.phone_number || '',
          description: business.description || '',
          images: business.photo_url?.length > 0
            ? business.photo_url
            : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
          amenities: business.amenities || [],
          price: '',
            businessLogo: business.businessLogo || '',  // ✅ أضف دي

          maps: business.location_url_on_maps || '',
          hours: (business.working_hours || []).map((h: string) => {
            const [dayPart, timePart] = h.split(':');
            const [open, close] = (timePart || '').split('–').map((t: string) => t.trim());
            return { day: dayPart?.trim(), open: open || '', close: close || '', isOpen: true };
          }),
          services: business.services || [],
        });
      }
    }}
  />
)}
          {currentPage === 'reviews' && (
<BusinessReviews businessId={businessId} />
          )}

          {currentPage === 'alerts' && (
            <BusinessAlerts />
          )}

          {currentPage === 'bookings' && (
            <BusinessBookings />
          )}
        </div>
      </div>
    </div>
  );
};
