import React, { useState  ,useEffect} from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Bell, Mail, Smartphone, Gift, MapPin, Star, TrendingUp, Sparkles, ChevronLeft } from 'lucide-react';
import axios from "axios";
import { toast } from 'sonner';

interface NotificationSettingsProps {
  onNavigate: (page: string) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onNavigate }) => {
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Specific notification types
  const [dealAlerts, setDealAlerts] = useState(true);
  const [loyaltyUpdates, setLoyaltyUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(true);

  const handleSaveSettings = async () => {

  try {

    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/notification/update-settings",
      {
        emailNotifications,

        dealAlerts,
        loyaltyUpdates,
        weeklyDigest,
        specialOffers
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onNavigate("account");
      toast.success("save updates");

  } catch (error) {

    console.log(error);
  }
};

  const notificationChannels = [
    {
      id: 'email',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      enabled: emailNotifications,
      onChange: setEmailNotifications,
      gradient: 'from-blue-500 to-cyan-600'
    },
   
   
  ];

  const notificationTypes = [
  
   
    {
      id: 'loyalty',
      icon: Star,
      title: 'Loyalty Points Updates',
      description: 'Track your points and tier progress',
      enabled: loyaltyUpdates,
      onChange: setLoyaltyUpdates
    },
    {
      id: 'digest',
      icon: TrendingUp,
      title: 'Weekly Digest',
      description: 'Summary of new services and trending places',
      enabled: weeklyDigest,
      onChange: setWeeklyDigest
    },
    {
      id: 'special',
      icon: Gift,
      title: 'Special Offers',
      description: 'Exclusive deals and limited-time promotions',
      enabled: specialOffers,
      onChange: setSpecialOffers
    }
  ];

  useEffect(() => {

  const getSettings = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/notification/get-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data.data;

      setEmailNotifications(data.emailNotifications);

      setDealAlerts(data.dealAlerts);
      setLoyaltyUpdates(data.loyaltyUpdates);
      setWeeklyDigest(data.weeklyDigest);
      setSpecialOffers(data.specialOffers);

    } catch (error) {

      console.log(error);
    }
  };

  getSettings();

}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => onNavigate('account')}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-cyan-600 -ml-2"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Account
          </Button>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mb-6">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Notification Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage how you receive updates from SPOT
          </p>
        </div>

        {/* Notification Channels */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl mb-6 rounded-[18px]">
          <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Notification Channels
          </h2>
          <div className="space-y-6">
            {notificationChannels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={channel.id}
                  className="flex items-start justify-between p-4 rounded-[12px] border-2 border-gray-100 hover:border-cyan-200 transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-r ${channel.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={channel.id} className="text-lg text-gray-800 cursor-pointer">
                        {channel.title}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={channel.id}
                    checked={channel.enabled}
                    onCheckedChange={channel.onChange}
                    className="flex-shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notification Types */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl mb-6 rounded-[18px]">
          <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            What You Want to Hear About
          </h2>
          <div className="grid md:grid-cols-1 gap-4">
            {notificationTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className="flex items-start justify-between p-4 rounded-[12px] border-2 border-gray-100 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={type.id} className="text-gray-800 cursor-pointer">
                        {type.title}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={type.id}
                    checked={type.enabled}
                    onCheckedChange={type.onChange}
                    className="flex-shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-r from-cyan-50 to-purple-50 border-2 border-cyan-100 shadow-lg mb-6 rounded-[18px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600">
                We'll only send you notifications about things you care about. You can change these settings anytime.
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 rounded-[18px] text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Save Updates
          </Button>
        </div>
      </div>
    </div>
  );
};
