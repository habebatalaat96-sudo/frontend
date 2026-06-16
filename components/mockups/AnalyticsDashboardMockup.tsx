import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, Calendar, Users } from 'lucide-react';

const viewsData = [
  { day: 'Mon', views: 145 },
  { day: 'Tue', views: 189 },
  { day: 'Wed', views: 234 },
  { day: 'Thu', views: 198 },
  { day: 'Fri', views: 276 },
  { day: 'Sat', views: 312 },
  { day: 'Sun', views: 289 }
];

const bookingsData = [
  { month: 'Jan', bookings: 45 },
  { month: 'Feb', bookings: 52 },
  { month: 'Mar', bookings: 68 },
  { month: 'Apr', bookings: 71 },
  { month: 'May', bookings: 89 },
  { month: 'Jun', bookings: 94 }
];

export const AnalyticsDashboardMockup: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-2xl max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl text-white mb-1">Analytics Dashboard</h3>
        <p className="text-gray-400 text-sm">Last 7 days performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl p-3 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-xl text-white">1,643</div>
          <div className="text-xs text-gray-400">Profile Views</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-xl text-white">419</div>
          <div className="text-xs text-gray-400">Total Bookings</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl p-3 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-xl text-white">2.4k</div>
          <div className="text-xs text-gray-400">Unique Visitors</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-green-400">+23%</span>
          </div>
          <div className="text-xl text-white">4.8</div>
          <div className="text-xs text-gray-400">Avg. Rating</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Views Chart */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-white/10">
          <h4 className="text-white mb-3 text-sm">Daily Profile Views</h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #06b6d4',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Chart */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-white/10">
          <h4 className="text-white mb-3 text-sm">Monthly Bookings</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #a855f7',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Bar 
                dataKey="bookings" 
                fill="url(#colorGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
