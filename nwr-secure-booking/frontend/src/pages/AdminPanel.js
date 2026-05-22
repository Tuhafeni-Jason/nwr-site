import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Users,
  Shield,
  CalendarCheck,
  DollarSign,
  UserCheck,
  UserX,
  Crown,
  ShieldAlert,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/admin/dashboard');
      setDashboardData(res.data.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/status`);
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role) => {
    const classes = {
      superadmin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      user: 'bg-slate-700/50 text-slate-400 border-slate-600'
    };
    return classes[role] || classes.user;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 mt-1">System administration and monitoring</p>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <h3 className="text-2xl font-bold text-white">{dashboardData.stats.totalUsers}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Users</p>
                <h3 className="text-2xl font-bold text-white">{dashboardData.stats.activeUsers}</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold text-white">{dashboardData.stats.totalBookings}</h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <CalendarCheck className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-white">
                  ${dashboardData.stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'security', label: 'Security Events', icon: ShieldAlert }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-emerald-400 border-emerald-500'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
            <div className="space-y-3">
              {dashboardData.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{u.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`badge ${getRoleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {dashboardData.recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div>
                    <p className="text-sm font-medium text-white">{booking.guestName}</p>
                    <p className="text-xs text-slate-400">{booking.resort}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">${booking.totalAmount}</p>
                    <p className="text-xs text-slate-400">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="card lg:col-span-2 border-red-500/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
            <div className="space-y-2">
              {dashboardData.recentSecurityEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`w-4 h-4 ${
                      event.severity === 'critical' ? 'text-red-400' :
                      event.severity === 'high' ? 'text-amber-400' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <p className="text-sm text-white capitalize">{event.eventType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">{event.ipAddress} • {new Date(event.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    event.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    event.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {event.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Last Login</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{u.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        <span className={`badge ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        {user.role === 'superadmin' && u._id !== user._id && (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Security Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
              <div>
                <p className="text-sm font-medium text-white">Rate Limiting</p>
                <p className="text-xs text-slate-400">100 requests per 15 minutes</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
              <div>
                <p className="text-sm font-medium text-white">Login Protection</p>
                <p className="text-xs text-slate-400">5 attempts per 15 minutes, 30min lockout</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
              <div>
                <p className="text-sm font-medium text-white">Input Sanitization</p>
                <p className="text-xs text-slate-400">SQL Injection & XSS protection</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
              <div>
                <p className="text-sm font-medium text-white">Honeypot Detection</p>
                <p className="text-xs text-slate-400">Fake admin endpoint monitoring</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
              <div>
                <p className="text-sm font-medium text-white">Security Headers</p>
                <p className="text-xs text-slate-400">Helmet.js protection enabled</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
