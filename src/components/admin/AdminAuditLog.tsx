import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Settings,
  User,
  GraduationCap,
  DollarSign,
  BookOpen,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Plus,
  Clock,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Activity,
  HardDrive,
  Eye,
  Terminal,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { AuditLogEntry, UserRole } from '../../types';

export const AdminAuditLog: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  // Detail Modal & Create Modal
  const [inspectLog, setInspectLog] = useState<AuditLogEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  // New Log Form State
  const [newLog, setNewLog] = useState<Partial<AuditLogEntry>>({
    action: 'SETTING_CHANGED',
    category: 'settings',
    userName: user?.name || 'Dr. Balu Naik, B. Tech',
    userRole: (user?.role as UserRole) || 'admin',
    details: 'Modified system security policy settings',
    targetEntity: 'School Settings Configuration',
    status: 'info'
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.action || !newLog.details) return;

    try {
      const created = await api.createAuditLog({
        ...newLog,
        userId: user?.id || 'u-admin',
        userName: newLog.userName || user?.name || 'Administrator',
        userRole: newLog.userRole || user?.role || 'admin',
        timestamp: new Date().toISOString()
      });
      setLogs(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewLog({
        action: 'USER_LOGIN',
        category: 'auth',
        userName: user?.name || 'Dr. Balu Naik, B. Tech',
        userRole: (user?.role as UserRole) || 'admin',
        details: '',
        targetEntity: '',
        status: 'info'
      });
    } catch (err) {
      console.error('Failed to create manual audit log entry:', err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.clearAuditLogs();
      setLogs([]);
      setIsClearModalOpen(false);
    } catch (err) {
      console.error('Failed to clear audit logs:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Action', 'Category', 'User Name', 'Role', 'IP Address', 'Status', 'Target Entity', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.action}"`,
      l.category,
      `"${l.userName}"`,
      l.userRole,
      l.ipAddress || '',
      l.status,
      `"${l.targetEntity || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bn_academy_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `bn_academy_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || log.userRole === selectedRole;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      log.action.toLowerCase().includes(query) ||
      log.userName.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      (log.targetEntity && log.targetEntity.toLowerCase().includes(query)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(query));

    // Time horizon filtering
    let matchesTime = true;
    if (timeRange !== 'all') {
      const logTime = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeRange === 'today') {
        matchesTime = now - logTime <= oneDay;
      } else if (timeRange === '7days') {
        matchesTime = now - logTime <= 7 * oneDay;
      } else if (timeRange === '30days') {
        matchesTime = now - logTime <= 30 * oneDay;
      }
    }

    return matchesCategory && matchesStatus && matchesRole && matchesSearch && matchesTime;
  });

  // Calculate Overview Stats
  const totalCount = logs.length;
  const authEventsCount = logs.filter(l => l.category === 'auth').length;
  const settingsCount = logs.filter(l => l.category === 'settings').length;
  const studentUpdatesCount = logs.filter(l => l.category === 'student').length;
  const warningsErrorsCount = logs.filter(l => l.status === 'warning' || l.status === 'error').length;

  // Helper formatting for timestamps
  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return {
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        relative: getRelativeTime(date)
      };
    } catch {
      return { dateStr: ts, timeStr: '', relative: '' };
    }
  };

  const getRelativeTime = (d: Date) => {
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Status Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Success
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            Info
          </span>
        );
    }
  };

  // Category Icon & Badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'auth':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            Auth / Security
          </span>
        );
      case 'settings':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <Settings className="w-3.5 h-3.5 text-amber-500" />
            System Settings
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
            Student Records
          </span>
        );
      case 'finance':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
            Financials
          </span>
        );
      case 'academic':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            Academic
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            System Core
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#0F172A] p-5 rounded-2xl text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Administrative Governance & Compliance
          </div>
          <h2 className="text-xl font-bold tracking-tight">System Audit & Activity Logs</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Immutable tracking of user logins, setting changes, student record updates, and security events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className={`p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition ${
              refreshing ? 'animate-spin' : ''
            }`}
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Entry</span>
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 rounded-xl text-xs font-semibold border border-slate-700 transition"
            title="Clear Audit History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Logged</div>
            <div className="text-xl font-extrabold text-slate-900">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auth & Security</div>
            <div className="text-xl font-extrabold text-slate-900">{authEventsCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Updates</div>
            <div className="text-xl font-extrabold text-slate-900">{studentUpdatesCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Warnings / Errors</div>
            <div className="text-xl font-extrabold text-slate-900">{warningsErrorsCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by user, action, IP, target entity, or details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Logs' },
              { id: 'auth', label: 'Auth & Login' },
              { id: 'settings', label: 'Settings' },
              { id: 'student', label: 'Student Records' },
              { id: 'finance', label: 'Financials' },
              { id: 'academic', label: 'Academic' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Role Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Role:</span>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            {/* Time Horizon */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Time:</span>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="all">All History</option>
                <option value="today">Past 24 Hours</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Showing <b>{filteredLogs.length}</b> of <b>{logs.length}</b> audit records
          </div>
        </div>
      </div>

      {/* Main Audit Log Table / Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading audit log events...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No audit log records found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No activity logs match your current search queries or filter selections.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action & Category</th>
                    <th className="py-3 px-4">Actor / Performed By</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {filteredLogs.map(log => {
                    const { dateStr, timeStr, relative } = formatTime(log.timestamp);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{dateStr}</div>
                          <div className="text-[11px] font-mono text-slate-400">{timeStr} ({relative})</div>
                        </td>

                        {/* Action & Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 text-[11px]">
                            {log.action}
                          </div>
                          <div className="mt-0.5">{getCategoryBadge(log.category)}</div>
                        </td>

                        {/* Actor */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {log.userName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span className="capitalize px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-semibold">
                              {log.userRole}
                            </span>
                            <span>• {log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </td>

                        {/* Target Entity */}
                        <td className="py-3 px-4 max-w-[180px] truncate font-semibold text-slate-700">
                          {log.targetEntity || 'System Resource'}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 max-w-[280px] truncate text-slate-600">
                          {log.details}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {getStatusBadge(log.status)}
                        </td>

                        {/* Inspect Button */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setInspectLog(log)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const { dateStr, timeStr, relative } = formatTime(log.timestamp);
                return (
                  <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50/60 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">
                          {log.action}
                        </span>
                        <div className="mt-1">{getCategoryBadge(log.category)}</div>
                      </div>
                      <div>{getStatusBadge(log.status)}</div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {log.details}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.userName} ({log.userRole})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{dateStr} {timeStr}</span>
                        <button
                          onClick={() => setInspectLog(log)}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LOG INSPECTION MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Audit Entry ID: {inspectLog.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {inspectLog.action}
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Timestamp</span>
                  <span className="font-semibold text-slate-900">{formatTime(inspectLog.timestamp).dateStr} {formatTime(inspectLog.timestamp).timeStr}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                  <div className="mt-0.5">{getStatusBadge(inspectLog.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">User / Actor</span>
                  <span className="font-bold text-slate-900">{inspectLog.userName} ({inspectLog.userRole})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">IP Address</span>
                  <span className="font-mono text-slate-800 font-medium">{inspectLog.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Target Entity</span>
                <div className="p-2.5 bg-slate-100 font-medium text-slate-800 rounded-xl border border-slate-200">
                  {inspectLog.targetEntity || 'System Governance Framework'}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Full Activity Summary</span>
                <div className="p-3 bg-blue-50/60 text-slate-800 rounded-xl border border-blue-100 leading-relaxed font-medium">
                  {inspectLog.details}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Raw JSON Payload</span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(inspectLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL AUDIT ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Log Custom Audit Action
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANUAL_POLICY_UPDATE or BACKUP_RESTORED"
                  value={newLog.action}
                  onChange={e => setNewLog({ ...newLog, action: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newLog.category}
                    onChange={e => setNewLog({ ...newLog, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="auth">Auth / Security</option>
                    <option value="settings">System Settings</option>
                    <option value="student">Student Records</option>
                    <option value="finance">Financials</option>
                    <option value="academic">Academic</option>
                    <option value="system">System Core</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Level</label>
                  <select
                    value={newLog.status}
                    onChange={e => setNewLog({ ...newLog, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="success">Success</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Entity / Resource</label>
                <input
                  type="text"
                  placeholder="e.g. Student Database / Payment Gateway Settings"
                  value={newLog.targetEntity}
                  onChange={e => setNewLog({ ...newLog, targetEntity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what action was taken, reasons, or modifications..."
                  value={newLog.details}
                  onChange={e => setNewLog({ ...newLog, details: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-2xs"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLEAR LOGS CONFIRMATION MODAL */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Clear Audit Trail?</h3>
              <p className="text-xs text-slate-500">
                This will purge all current activity logs from the database store. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-2xs"
              >
                Purge All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
