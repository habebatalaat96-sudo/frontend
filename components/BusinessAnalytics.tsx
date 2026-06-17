import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Calendar, Users, DollarSign, Star,
  ArrowUp, ArrowDown, Repeat, Target, Clock, XCircle, Award, Activity, Lightbulb, RefreshCw, AlertCircle, CreditCard, Banknote, TrendingUp
} from 'lucide-react';
import { API_URL } from "../config/api";
interface BusinessAnalyticsProps {
  onBookingsClick: () => void;
}

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ onBookingsClick }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = localStorage.getItem("business_token");
      const res = await fetch(`${API_URL}/business/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAnalyticsData(data.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    </div>
  );

  if (error || !analyticsData) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Failed to load analytics</p>
        <button
          onClick={fetchAnalytics}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-[18px] flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />Retry
        </button>
      </div>
    </div>
  );

  const {
    kpis,
    dailyData,
    monthlyBookingsData,
    monthlyRevenueData,
    peakHoursData,
    customerTypeData,
    topPerformingServices,
    categoryDistribution,
    bookingStatusBreakdown,
    paymentMethods,
  } = analyticsData;

  const busiestHour = peakHoursData?.length
    ? peakHoursData.reduce((max: any, h: any) => h.bookings > max.bookings ? h : max, peakHoursData[0])
    : null;

  const busiestDay = dailyData?.length
    ? dailyData.reduce((max: any, d: any) => d.bookings > max.bookings ? d : max, dailyData[0])
    : null;

  const topService = topPerformingServices?.length
    ? topPerformingServices.reduce((max: any, s: any) => s.bookings > max.bookings ? s : max, topPerformingServices[0])
    : null;

  const revenueGrowthNum = parseFloat(kpis.revenueGrowth ?? "0");
  const totalRevenue6M = kpis.totalRevenue6Months ?? 0;
  const totalBookings6M = monthlyBookingsData?.reduce((s: number, m: any) => s + m.bookings, 0) ?? 0;

  // ✅ FIX #4 — Overall Growth حساب من أول شهر غير صفري
  const nonZeroMonths = monthlyRevenueData?.filter((m: any) => m.revenue > 0) ?? [];
  const firstNonZero = nonZeroMonths[0]?.revenue ?? 0;
  const lastNonZero = nonZeroMonths[nonZeroMonths.length - 1]?.revenue ?? 0;
  const overallRevenueGrowth = firstNonZero > 0 && nonZeroMonths.length > 1
    ? (((lastNonZero - firstNonZero) / firstNonZero) * 100).toFixed(0)
    : nonZeroMonths.length === 1
    ? "100"
    : "0";

  // ✅ حساب payment methods
  const totalPayments = paymentMethods?.reduce((s: number, p: any) => s + p.value, 0) ?? 0;
  const cashMethod = paymentMethods?.find((p: any) => p.name === 'cash');
  const instapayMethod = paymentMethods?.find((p: any) => p.name === 'instapay');

  // ✅ أعلى revenue في الـ top services
  const topServiceByRevenue = topPerformingServices?.length
    ? topPerformingServices.reduce((max: any, s: any) => {
        const rev = parseInt(s.revenue.replace(/[^0-9]/g, ''));
        const maxRev = parseInt(max.revenue.replace(/[^0-9]/g, ''));
        return rev > maxRev ? s : max;
      }, topPerformingServices[0])
    : null;

  // ✅ cancellation insight
  const cancellationNum = parseFloat(kpis.cancellationRate ?? "0");

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-1">{analyticsData.businessName || "My Business Dashboard"}</h2>
          <p className="text-gray-400 text-sm">Overview of your business performance and activity</p>
        </div>
 <button
  onClick={fetchAnalytics}
  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-[18px] flex items-center gap-2 transition-all duration-300 shadow-lg shadow-cyan-500/20"
>
  <RefreshCw className="w-4 h-4" />
  <span className="text-sm">Refresh</span>
</button>
      </div>

      {/* Stats Grid — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          onClick={onBookingsClick}
          className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-xl hover:border-purple-500/50 hover:scale-105 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl text-white mb-1">{kpis.totalBookings.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Bookings</div>
          <div className="text-xs text-cyan-400 mt-1 group-hover:underline">Click to manage →</div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-green-500/30 shadow-xl hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <Star className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl text-white mb-1">{kpis.completedBookings.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Completed Bookings</div>
          <div className="text-xs text-gray-500 mt-1">
            {kpis.totalBookings > 0 ? Math.round((kpis.completedBookings / kpis.totalBookings) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-xl hover:border-cyan-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl text-white mb-1">{kpis.totalCustomers.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Customers</div>
          <div className="text-xs text-gray-500 mt-1">{kpis.newCustomers} new · {kpis.returningCustomers} returning</div>
        </div>

      </div>

      {/* Stats Grid — Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-xl hover:border-cyan-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <Repeat className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl text-white mb-1">{kpis.repeatCustomerRate}</div>
          <div className="text-sm text-gray-400">Repeat Customers</div>
          <div className="text-xs text-gray-500 mt-1">{kpis.returningCustomers} out of {kpis.totalCustomers}</div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-red-500/30 shadow-xl hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl text-white mb-1">{kpis.cancellationRate}</div>
          <div className="text-sm text-gray-400">Cancellation Rate</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>

        
        {/* ✅ FIX #1 — Revenue This Month: Last month subtitle صح */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-yellow-500/30 shadow-xl hover:border-yellow-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <div className={`flex items-center gap-1 text-xs ${revenueGrowthNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {revenueGrowthNum >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{kpis.revenueGrowth}</span>
            </div>
          </div>
          <div className="text-3xl text-white mb-1">EGP {kpis.revenueThisMonth.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Revenue This Month</div>
    
        </div>

      </div>

      {/* ✅ FIX #3 — Revenue Summary: شيلنا السعر والنسبة من جنب العنوان */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-purple-500/30 shadow-xl">
        <div className="mb-4">
          <h3 className="text-xl text-white mb-1">Revenue Summary</h3>
          <p className="text-gray-400 text-sm">Last 6 months performance</p>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div>
            <p className="text-gray-400 text-xs mb-1">6-Month Total</p>
            <p className="text-white text-lg">EGP {totalRevenue6M.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">6-Month Bookings</p>
            <p className="text-white text-lg">{totalBookings6M}</p>
          </div>
          {/* ✅ FIX #4 — Overall Growth صح */}
          <div>
            <p className="text-gray-400 text-xs mb-1">Overall Growth</p>
            <p className={`text-lg ${Number(overallRevenueGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(overallRevenueGrowth) >= 0 ? '+' : ''}{overallRevenueGrowth}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-xl">
          <h4 className="text-white mb-4 text-lg">Daily Bookings (Last 7 Days)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              <Line type="monotone" dataKey="bookings" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          {busiestDay && busiestDay.bookings > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Busiest day: <span className="text-cyan-400">{busiestDay.day}</span> with {busiestDay.bookings} bookings
            </p>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-xl">
          <h4 className="text-white mb-4 text-lg">Monthly Bookings Trend</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyBookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <Bar dataKey="bookings" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Total: <span className="text-purple-400">{totalBookings6M}</span> bookings in 6 months
          </p>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30 shadow-xl">
          <h4 className="text-white mb-4 text-lg">Revenue Growth</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                formatter={(value: number) => [`EGP ${value.toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-xl">
          <h4 className="text-white mb-4 text-lg">Booking Status</h4>
          {bookingStatusBreakdown?.some((s: any) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={bookingStatusBreakdown.filter((s: any) => s.value > 0)}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {bookingStatusBreakdown.filter((s: any) => s.value > 0).map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-gray-500 text-sm">No booking data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours + New vs Returning */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ✅ FIX #5 — Peak Hours: الوقت هيتصلح من الـ backend (timezone Cairo) */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-yellow-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white text-lg">Peak Booking Hours</h4>
          </div>
          {peakHoursData?.some((h: any) => h.bookings > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #f59e0b', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-gray-500 text-sm">No data yet</p>
            </div>
          )}
          {busiestHour && busiestHour.bookings > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Busiest time: <span className="text-yellow-400">{busiestHour.hour}</span> with {busiestHour.bookings} bookings
            </p>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-green-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h4 className="text-white text-lg">New vs Returning Customers</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={customerTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              <Legend />
              <Area type="monotone" dataKey="new" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} name="New Customers" />
              <Area type="monotone" dataKey="returning" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Returning Customers" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">
            Returning customer share: <span className="text-green-400">{kpis.repeatCustomerRate}</span> of total
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      {paymentMethods?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
          <h4 className="text-white mb-5 text-lg">Payment Methods</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 rounded-xl p-5 border border-green-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">Cash</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-white">{cashMethod?.value ?? 0}</span>
                  <span className="text-green-400 text-sm">
                    {totalPayments > 0 ? Math.round(((cashMethod?.value ?? 0) / totalPayments) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalPayments > 0 ? Math.round(((cashMethod?.value ?? 0) / totalPayments) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-5 border border-cyan-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-1">InstaPay</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-white">{instapayMethod?.value ?? 0}</span>
                  <span className="text-cyan-400 text-sm">
                    {totalPayments > 0 ? Math.round(((instapayMethod?.value ?? 0) / totalPayments) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalPayments > 0 ? Math.round(((instapayMethod?.value ?? 0) / totalPayments) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Total transactions: {totalPayments}</p>
        </div>
      )}

      {/* Category Distribution */}
      {categoryDistribution?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-xl">
          <h4 className="text-white mb-4 text-lg">Service Category Distribution</h4>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {categoryDistribution.map((c: any, i: number) => {
                const total = categoryDistribution.reduce((s: number, x: any) => s + x.value, 0);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-300 text-sm capitalize">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-sm">{c.value}</span>
                      <span className="text-gray-500 text-xs ml-2">({total > 0 ? Math.round((c.value / total) * 100) : 0}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Services */}
      {topPerformingServices?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-cyan-400" />
            <h4 className="text-white text-lg">Top Performing Services</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 text-sm">Service</th>
                  <th className="text-right py-3 px-4 text-gray-400 text-sm">Bookings</th>
                  <th className="text-right py-3 px-4 text-gray-400 text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-400 text-sm">Cancellation</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingServices.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white">{item.service}</td>
                    <td className="py-4 px-4 text-gray-300 text-right">{item.bookings}</td>
                    <td className="py-4 px-4 text-green-400 text-right">{item.revenue}</td>
                    <td className="py-4 px-4 text-right">
                      <span className={Number(item.cancellationRate?.replace('%', '')) > 20 ? 'text-red-400' : 'text-gray-300'}>
                        {item.cancellationRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h4 className="text-white text-lg">Quick Insights</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-3">

          {busiestDay && busiestDay.bookings > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm">
                📅 <span className="text-cyan-400">{busiestDay.day}</span> is your busiest day this week with{' '}
                <span className="text-white">{busiestDay.bookings}</span> bookings.
              </p>
            </div>
          )}

          {/* ✅ FIX #6 — busiestHour بيجي من backend بعد تصحيح timezone */}
          {busiestHour && busiestHour.bookings > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm">
                ⏰ Most bookings happen around <span className="text-yellow-400">{busiestHour.hour}</span> — consider adding more slots then.
              </p>
            </div>
          )}

          {topService && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm">
                🏆 <span className="text-purple-400">{topService.service}</span> is your top service with{' '}
                <span className="text-white">{topService.bookings}</span> bookings.
              </p>
            </div>
          )}

          {topServiceByRevenue && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm">
                💰 Highest revenue from <span className="text-green-400">{topServiceByRevenue.service}</span> generating{' '}
                <span className="text-white">{topServiceByRevenue.revenue}</span>.
              </p>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-gray-300 text-sm">
              🔄 <span className="text-green-400">{kpis.repeatCustomerRate}</span> of your customers are returning —
              {parseFloat(kpis.repeatCustomerRate) >= 30
                ? ' great loyalty! Keep rewarding them.'
                : ' consider adding loyalty offers to boost retention.'}
            </p>
          </div>

          {cancellationNum > 20 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/20">
              <p className="text-gray-300 text-sm">
                ⚠️ Cancellation rate is <span className="text-red-400">{kpis.cancellationRate}</span> in the last 30 days —
                consider sending reminders before booking dates.
              </p>
            </div>
          )}

          {instapayMethod && cashMethod && totalPayments > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm">
                💳 <span className="text-cyan-400">{Math.round((instapayMethod.value / totalPayments) * 100)}%</span> of customers pay via InstaPay,{' '}
                <span className="text-green-400">{Math.round((cashMethod.value / totalPayments) * 100)}%</span> pay cash.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};