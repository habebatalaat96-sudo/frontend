import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Settings, Heart, LogOut, Bell, MapPin, Award, TrendingUp, Gift, Star, Trophy, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { UserPreferences } from './UserPreferences';
import { toast } from 'sonner';
import { API_URL } from "../config/api";

interface AccountProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;

  user: {
    userName: string;
    email: string;
    profilePicture?: string;
    loyaltyPoints: number;
    walletBalance: number;
    tier: string;
    createdAt: string;
  };

  userPreferences: UserPreferences;
  bookingsCount?: number;
}


export const Account: React.FC<AccountProps> = ({ 
  onNavigate, 
  onLogout,
  user,
  userPreferences,
  bookingsCount = 0
}) => {

  const [showActivity, setShowActivity] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

 const loyaltyData = {
    currentPoints: user.loyaltyPoints || 0,
    tier: user.tier || "Bronze",
    nextTier:
      user.tier === "Bronze"
        ? "Silver"
        : user.tier === "Silver"
        ? "Gold"
        : user.tier === "Gold"
        ? "Platinum"
        : "Platinum",

    pointsToNextTier:
      user.tier === "Bronze"
        ? 1000 - (user.loyaltyPoints || 0)
        : user.tier === "Silver"
        ? 2500 - (user.loyaltyPoints || 0)
        : user.tier === "Gold"
        ? 4500 - (user.loyaltyPoints || 0)
        : Math.max(7000 - (user.loyaltyPoints || 0), 0),

    memberSince: new Date(user.createdAt).toLocaleDateString()
  };

  const tierStyles: Record<string, string> = {
    Bronze: "from-amber-700 to-amber-900",
    Silver: "from-gray-400 to-gray-600",
    Gold: "from-yellow-400 to-yellow-600",
    Platinum: "from-cyan-300 to-indigo-500",
  };

  const currentTierGradient =
    tierStyles[loyaltyData.tier] || tierStyles.Bronze;

  const fetchRecentActivity = async () => {
    setActivityLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/recent-activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setRecentActivity(data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleToggleActivity = () => {
    if (!showActivity && recentActivity.length === 0) {
      fetchRecentActivity();
    }
    setShowActivity(!showActivity);
  };

  const accountCards = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Update your personal information and account details',
      icon: User,
      gradient: 'from-cyan-500 to-purple-600',
      page: 'profile-settings'
    },
    {
      id: 'bookings',
      title: 'My Bookings',
      description: `upcoming appointment${bookingsCount !== 1 ? 's' : ''}`,
      icon: Calendar,
      gradient: 'from-indigo-500 to-purple-600',
      page: 'bookings',
      badge: bookingsCount > 0 ? bookingsCount : undefined
    },
    {
      id: 'saved',
      title: 'Saved Places',
      description: 'View your favorite gyms, cafes, and services',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-600',
      page: 'saved-places'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Manage your service preferences and interests',
      icon: Settings,
      gradient: 'from-purple-500 to-pink-600',
      page: 'preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control your notification settings and preferences',
      icon: Bell,
      gradient: 'from-orange-500 to-red-600',
      page: 'notification-settings'
    }
  ];

  const handleCardClick = (page: string) => {
    if (page === 'preferences') {
      onNavigate('preferences');
    } else {
      onNavigate(page as any);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      onLogout();
      toast.success('logout successfully!');
    } catch (error) {
      console.error(error);
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-2xl overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold">
                  {user.userName?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <Badge className={`bg-gradient-to-r ${currentTierGradient} text-white border-none px-4 py-1 shadow-lg`}>
                <Trophy className="w-3 h-3 mr-1" />
                {loyaltyData.tier}
              </Badge>
            </div>
          </div>
          <h1 className="text-5xl mb-2 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            {user.userName}
          </h1>
          <p className="text-lg text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">Member since {loyaltyData.memberSince}</p>
        </div>

        {/* Loyalty Points Section */}
        <Card className="p-6 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 border-none shadow-2xl mb-8 overflow-hidden relative rounded-[18px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-24 -translate-y-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">SPOT Loyalty Points</h2>
              </div>
              <Badge className={`bg-gradient-to-r ${currentTierGradient} text-white border-none px-3 py-1`}>
                {loyaltyData.tier} Member
              </Badge>
            </div>

            {/* Points Display - Current Points only */}
            <div className="mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-[18px] p-6 border border-white/20 w-full md:w-1/2">
                <p className="text-white/80 text-sm mb-2">Current Points</p>
                <p className="text-4xl font-bold text-white flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  {loyaltyData.currentPoints.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="bg-white/10 backdrop-blur-sm rounded-[18px] p-4 border border-white/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-sm">Progress to {loyaltyData.nextTier}</p>
                <p className="text-white text-xs">{loyaltyData.pointsToNextTier} points to go</p>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-gradient-to-r from-yellow-300 to-white h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(loyaltyData.currentPoints / (loyaltyData.currentPoints + loyaltyData.pointsToNextTier)) * 100}%` }}
                ></div>
              </div>
              <p className="text-white/80 text-xs">
                {loyaltyData.currentPoints} / {loyaltyData.currentPoints + loyaltyData.pointsToNextTier} points
              </p>
            </div>

            {/* Recent Activity - Collapsible */}
            <div className="bg-white/10 backdrop-blur-sm rounded-[18px] p-4 border border-white/20">
              <button
                onClick={handleToggleActivity}
                className="w-full flex items-center justify-between text-white font-bold text-sm hover:text-white/90 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Activity
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showActivity ? 'rotate-180' : ''}`} />
              </button>
              
              {showActivity && (
                <div className="space-y-2 mt-3">
                  {activityLoading ? (
                    <p className="text-white/60 text-sm text-center py-2">Loading...</p>
                  ) : recentActivity.length === 0 ? (
                    <p className="text-white/60 text-sm text-center py-2">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-[12px] p-3 border border-white/20 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-sm">{activity.service || activity.businessName}</p>
                          <p className="text-white/60 text-xs">
                            {new Date(activity.date || activity.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className={`font-bold ${activity.type === 'earned' ? 'text-emerald-200' : 'text-rose-200'}`}>
                          {activity.type === 'earned' ? '+' : ''}{activity.points} pts
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Options Grid */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Account Settings
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Card 
                  key={card.id}
                  onClick={() => handleCardClick(card.page)}
                  className="p-6 bg-white border-2 border-cyan-100 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1 rounded-[18px] group relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-r ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {card.badge !== undefined && card.badge > 0 && (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0 rounded-full">
                          {card.badge}
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {card.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 rounded-[18px]"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};