import React from 'react';
import { Bell, Star, Eye, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

const notifications = [
  {
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    title: '10+ New Reviews!',
    message: 'Your business received 12 new reviews in the last 24 hours',
    time: '5 min ago',
    unread: true
  },
  {
    icon: Eye,
    color: 'from-cyan-500 to-blue-500',
    title: 'Profile Views Spike',
    message: 'Your profile views increased by 45% this week!',
    time: '1 hour ago',
    unread: true
  },
  {
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    title: 'New Booking',
    message: 'Sarah Johnson booked a session for tomorrow at 10:00 AM',
    time: '2 hours ago',
    unread: true
  },
  {
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    title: 'Revenue Milestone',
    message: 'You\'ve reached $5,000 in bookings this month',
    time: '5 hours ago',
    unread: false
  }
];

export const NotificationMockup: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-2xl max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl text-white mb-1">Notifications</h3>
          <p className="text-gray-400 text-sm">Stay updated in real-time</p>
        </div>
        <div className="relative">
          <Bell className="w-6 h-6 text-cyan-400" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {notifications.map((notification, index) => (
          <div 
            key={index}
            className={`relative bg-slate-800/50 rounded-xl p-4 border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
              notification.unread 
                ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-purple-600/5' 
                : 'border-white/10'
            }`}
          >
            {notification.unread && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-400 rounded-full" />
            )}
            
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${notification.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <notification.icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-white text-sm">{notification.title}</h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="mt-4 pt-4 border-t border-white/10 text-center flex-shrink-0">
        <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
          View All Notifications →
        </button>
      </div>
    </div>
  );
};
