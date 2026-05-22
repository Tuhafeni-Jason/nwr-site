import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import {
  Users,
  CalendarCheck,
  DollarSign,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

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

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, revenueRes, securityRes] = await Promise.all([
        api.get('/api/bookings/stats/overview'),
        api.get('/api/revenue/dashboard'),
        api.get('/api/security-logs/stats')
      ]);

      setStats(bookingsRes.data.data);
      setRevenue(revenueRes.data.data);
      setSecurity(securityRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="card group hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  // Chart data preparation
  const revenueChartData = {
    labels: (revenue?.monthlyRevenue || []).map(d => d._id?.slice(5) || ''),
    datasets: [{
      label: 'Revenue ($)',
      data: (revenue?.monthlyRevenue || []).map(d => d.revenue),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#10b981',
      pointRadius: 4,
    }]
  };

  const pieData = {
    labels: ['Confirmed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [
        stats?.confirmedBookings || 0,
        stats?.pendingBookings || 0,
        stats?.cancelledBookings || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderColor: '#1e293b',
      borderWidth: 2,
    }]
  };

  const resortChartData = {
    labels: (stats?.resortStats || []).map(r => r._id?.split(' ').slice(0, 2).join(' ') || ''),
    datasets: [
      {
        label: 'Revenue ($)',
        data: (stats?.resortStats || []).map(r => r.revenue),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Bookings',
        data: (stats?.resortStats || []).map(r => r.bookings),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      }
    ]
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            security?.threatLevel === 'critical' ? 'bg-red-500/20 text-red-400 threat-pulse' :
            security?.threatLevel === 'high' ? 'bg-amber-500/20 text-amber-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            Threat Level: {security?.threatLevel?.toUpperCase() || 'LOW'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={CalendarCheck}
          trend="up"
          trendValue="+12%"
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+8.5%"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={stats?.confirmedBookings || 0}
          icon={Users}
          trend="up"
          trendValue="+5%"
          color="bg-amber-500"
        />
        <StatCard
          title="Security Events"
          value={security?.criticalEvents || 0}
          icon={ShieldAlert}
          trend="down"
          trendValue="Critical"
          color="bg-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-300">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-72">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Booking Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Booking Status Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Resort Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Resort Performance</h3>
        <div className="h-64">
          <Bar data={resortChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Security Events */}
      {isAdmin() && security?.eventsByType?.length > 0 && (
        <div className="card border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
          </div>
          <div className="space-y-3">
            {security.eventsByType.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event._id.includes('critical') ? 'bg-red-500' :
                    event._id.includes('high') ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-sm text-slate-300 capitalize">{event._id.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-sm font-medium text-slate-400">{event.count} events</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
