import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, DollarSign, Calendar, Users, Hotel } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BookingAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [revenueRes, bookingsRes] = await Promise.all([
        api.get('/api/revenue/dashboard'),
        api.get('/api/bookings/stats/overview')
      ]);

      setData({
        revenue: revenueRes.data.data,
        bookings: bookingsRes.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const revenueData = data?.revenue?.monthlyRevenue || [];
  const roomTypeData = data?.revenue?.roomTypeRevenue || [];
  const sourceData = data?.revenue?.sourceRevenue || [];
  const resortData = data?.bookings?.resortStats || [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
    }
  };

  const revenueChartData = {
    labels: revenueData.map(d => d._id?.slice(5) || ''),
    datasets: [{
      label: 'Revenue ($)',
      data: revenueData.map(d => d.revenue),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointRadius: 4,
    }, {
      label: 'Bookings',
      data: revenueData.map(d => d.bookings),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
    }]
  };

  const roomTypeChartData = {
    labels: roomTypeData.map(d => d._id || ''),
    datasets: [{
      data: roomTypeData.map(d => d.revenue),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      borderColor: '#1e293b',
      borderWidth: 2,
    }]
  };

  const sourceChartData = {
    labels: sourceData.map(d => d._id || ''),
    datasets: [{
      label: 'Bookings',
      data: sourceData.map(d => d.bookings),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }, {
      label: 'Revenue ($)',
      data: sourceData.map(d => d.revenue),
      backgroundColor: '#10b981',
      borderRadius: 4,
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Analytics</h1>
          <p className="text-slate-400 mt-1">Deep insights into your booking performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${(data?.revenue?.todayRevenue || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Bookings</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {(data?.bookings?.totalBookings || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg. Booking Value</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${data?.bookings?.totalBookings > 0 
                  ? Math.round((data?.bookings?.totalRevenue || 0) / data?.bookings?.totalBookings).toLocaleString() 
                  : 0}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {data?.bookings?.totalBookings > 0
                  ? Math.round((data?.bookings?.confirmedBookings / data?.bookings?.totalBookings) * 100)
                  : 0}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
        <div className="h-80">
          <Line data={revenueChartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Type Revenue */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue by Room Type</h3>
          <div className="h-72 flex items-center justify-center">
            <Pie data={roomTypeChartData} options={pieOptions} />
          </div>
        </div>

        {/* Booking Source */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Bookings by Source</h3>
          <div className="h-72">
            <Bar data={sourceChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Resort Performance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Resort Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Resort</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Bookings</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Avg. Value</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {resortData.map((resort, index) => (
                <tr key={index} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Hotel className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-white">{resort._id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{resort.bookings}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400">${resort.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    ${resort.bookings > 0 ? Math.round(resort.revenue / resort.bookings) : 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (resort.revenue / 50000) * 100)}%` }}
                      />
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
};

export default BookingAnalytics;
