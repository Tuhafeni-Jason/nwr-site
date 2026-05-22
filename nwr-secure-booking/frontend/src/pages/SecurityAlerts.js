import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  ShieldAlert,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Filter,
  Search,
  RefreshCw,
  Bug,
  Lock,
  Eye
} from 'lucide-react';

const SecurityAlerts = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ severity: '', eventType: '' });
  const [honeypotStatus, setHoneypotStatus] = useState('active');
  const [honeypotResult, setHoneypotResult] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filter]);

  const fetchLogs = async () => {
    try {
      let url = `/api/security-logs?page=${page}&limit=15`;
      if (filter.severity) url += `&severity=${filter.severity}`;
      if (filter.eventType) url += `&eventType=${filter.eventType}`;

      const res = await api.get(url);
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/security-logs/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching security stats:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/api/security-logs/${id}/resolve`);
      fetchLogs();
      fetchStats();
    } catch (error) {
      console.error('Error resolving log:', error);
    }
  };

  const triggerHoneypot = async () => {
    try {
      setHoneypotStatus('checking');
      const res = await api.get('/api/security-logs/honeypot');
      setHoneypotResult(res.data);
      setHoneypotStatus('triggered');
      fetchLogs();
      fetchStats();
      setTimeout(() => setHoneypotStatus('active'), 3000);
    } catch (error) {
      setHoneypotStatus('active');
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'high': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return classes[severity] || 'bg-slate-700 text-slate-300';
  };

  const getEventIcon = (eventType) => {
    if (eventType.includes('honeypot')) return <Bug className="w-4 h-4" />;
    if (eventType.includes('login')) return <Lock className="w-4 h-4" />;
    if (eventType.includes('unauthorized')) return <Eye className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
          <p className="text-slate-400 mt-1">Monitor threats and security events</p>
        </div>
        <button
          onClick={() => { fetchLogs(); fetchStats(); }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Security Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Events</p>
                <h3 className="text-2xl font-bold text-red-400">{stats.criticalEvents}</h3>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400/50" />
            </div>
          </div>
          <div className="card border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">High Severity</p>
                <h3 className="text-2xl font-bold text-amber-400">{stats.highEvents}</h3>
              </div>
              <ShieldAlert className="w-8 h-8 text-amber-400/50" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unresolved</p>
                <h3 className="text-2xl font-bold text-white">{stats.unresolvedEvents}</h3>
              </div>
              <Clock className="w-8 h-8 text-slate-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Events</p>
                <h3 className="text-2xl font-bold text-white">{stats.totalEvents}</h3>
              </div>
              <Shield className="w-8 h-8 text-slate-500" />
            </div>
          </div>
        </div>
      )}

      {/* Honeypot Demo */}
      <div className="card border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${honeypotStatus === 'active' ? 'bg-emerald-500/20' : honeypotStatus === 'triggered' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
              <Bug className={`w-6 h-6 ${honeypotStatus === 'active' ? 'text-emerald-400' : honeypotStatus === 'triggered' ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Honeypot Endpoint</h3>
              <p className="text-sm text-slate-400">
                {honeypotStatus === 'active' ? 'Monitoring for unauthorized access attempts' : 
                 honeypotStatus === 'triggered' ? '⚠️ Honeypot triggered! Security event logged.' :
                 'Checking honeypot status...'}
              </p>
            </div>
          </div>
          <button
            onClick={triggerHoneypot}
            disabled={honeypotStatus !== 'active'}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              honeypotStatus === 'active' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : honeypotStatus === 'triggered'
                ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                : 'bg-amber-500/20 text-amber-400 cursor-not-allowed'
            }`}
          >
            {honeypotStatus === 'active' ? 'Test Honeypot' : honeypotStatus === 'triggered' ? 'Triggered!' : 'Checking...'}
          </button>
        </div>
        {honeypotResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <p className="text-sm text-slate-300 font-mono">Response: {JSON.stringify(honeypotResult, null, 2)}</p>
          </div>
        )}
      </div>

      {/* Threat Level Indicator */}
      {stats && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Threat Level</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              stats.threatLevel === 'critical' ? 'bg-red-500/20 text-red-400 threat-pulse' :
              stats.threatLevel === 'high' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {stats.threatLevel}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                stats.threatLevel === 'critical' ? 'bg-red-500 w-full' :
                stats.threatLevel === 'high' ? 'bg-amber-500 w-3/4' :
                stats.threatLevel === 'medium' ? 'bg-yellow-500 w-1/2' :
                'bg-emerald-500 w-1/4'
              }`}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filter.severity}
          onChange={(e) => setFilter({...filter, severity: e.target.value})}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filter.eventType}
          onChange={(e) => setFilter({...filter, eventType: e.target.value})}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Events</option>
          <option value="honeypot_triggered">Honeypot</option>
          <option value="login_failure">Login Failure</option>
          <option value="unauthorized_access">Unauthorized Access</option>
          <option value="brute_force_detected">Brute Force</option>
        </select>
      </div>

      {/* Security Logs Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Event</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Severity</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">IP Address</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Location</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Threat Score</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No security events found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getEventIcon(log.eventType)}
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {log.eventType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-slate-300 font-mono">{log.ipAddress}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300">
                          {log.location?.city || 'Unknown'}, {log.location?.country || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              log.threatScore > 70 ? 'bg-red-500' :
                              log.threatScore > 40 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${log.threatScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-400">{log.threatScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.resolved ? (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="badge badge-warning flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Open
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!log.resolved && (
                        <button
                          onClick={() => handleResolve(log._id)}
                          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;
