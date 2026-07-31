import React, { useEffect, useState } from 'react';
import schoolBannerImg from '../../assets/images/school-banner.png';
import {
  GraduationCap,
  UserCheck,
  CalendarCheck,
  DollarSign,
  Sparkles,
  Plus,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Bell,
  Building2
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { api } from '../../lib/api';
import { DashboardStats, Notice } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
  onOpenRegisterSchool: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ setActiveTab, onOpenRegisterSchool }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, noticesData] = await Promise.all([
          api.getStats(),
          api.getNotices()
        ]);
        setStats(statsData);
        setNotices(noticesData.slice(0, 4));
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
        Loading High-Density Enterprise Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animated Official Campus Banner Header Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl group">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={schoolBannerImg}
            alt="BN Academy Campus Banner"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-1000 filter saturate-[1.15] opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none animate-shimmer-sweep" />
        </div>

        <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/20 border border-blue-400/30 text-blue-300 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>BN International Academy • Enterprise Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Institutional Admin Workspace
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time campus analytics, automated ID card issuance, faculty attendance matrix, and smart student management system active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('idcards')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ID Card Studio</span>
            </button>
            <button
              onClick={onOpenRegisterSchool}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition backdrop-blur-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New School</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards in High Density Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 1284}
          subtitle="+12% vs last month"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats?.avgAttendanceRate || 94.2}%`}
          subtitle="Optimal Range"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Revenue (MTD)"
          value={`$${(stats?.totalFeeCollected || 142500).toLocaleString()}`}
          subtitle={`Goal: $150k`}
          icon={DollarSign}
          color="amber"
        />
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm ring-2 ring-blue-500/10">
          <div className="text-[10px] text-blue-600 uppercase font-bold mb-1">AI Insights Today</div>
          <div className="text-2xl font-bold text-slate-900">128</div>
          <div className="text-[10px] text-slate-500">Processed Queries & Circulars</div>
        </div>
      </div>

      {/* Main Grid: Student Matrix + Right Cards (AI Queue & Dark Notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Student Performance Matrix */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recent Student Performance Matrix
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('reports')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Printer className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                  <th className="p-3 font-semibold">Student Name</th>
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Class</th>
                  <th className="p-3 font-semibold">Attendance</th>
                  <th className="p-3 font-semibold">G.P.A</th>
                  <th className="p-3 font-semibold">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">Alexandria Rivers</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">STU-2026-001</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">12A (Sci)</td>
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">98%</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">3.92</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold uppercase">
                      Paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">Julian Vancer</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">STU-2026-042</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">10B (Comm)</td>
                  <td className="p-3 font-mono font-semibold text-amber-600 dark:text-amber-400">82%</td>
                  <td className="p-3 font-semibold text-rose-500 dark:text-rose-400">2.45</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-bold uppercase">
                      Partial
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">Sarah McKellan</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">STU-2026-118</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">11C (Arts)</td>
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">100%</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">4.00</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold uppercase">
                      Paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">Marcus Thorne</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">STU-2026-089</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">09A (Gen)</td>
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">91%</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">3.10</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full text-[10px] font-bold uppercase">
                      Overdue
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">Elena Petrova</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">STU-2026-205</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">12B (Sci)</td>
                  <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">94%</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">3.78</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold uppercase">
                      Paid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-right font-medium">
            Showing 1-5 of 1,284 records
          </div>
        </div>

        {/* Right Sidebar Column: AI Assistant Queue & System Notifications Dark Card */}
        <div className="flex flex-col gap-6">
          {/* AI Assistant Queue */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Assistant Queue
              </h2>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                5 Running
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-700">Report Card Comments</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Generating 42 summaries for Grade 12A...</div>
                <div className="w-full h-1 bg-slate-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%]"></div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-700">Notice Generator</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Drafting Annual Sport Meet notice...</div>
                <div className="w-full h-1 bg-slate-200 rounded mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Notifications Dark Card */}
          <div className="bg-[#0F172A] text-white p-4 rounded-xl shadow-lg flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> System Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">Database Backup Success</div>
                  <div className="text-[10px] text-slate-400">Cloud Storage synchronized at 04:00 AM</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">Fee Reminders Sent</div>
                  <div className="text-[10px] text-slate-400">AI automatically emailed 128 parents</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">Staff Login Anomaly</div>
                  <div className="text-[10px] text-slate-400">Unknown IP address detected (Teacher-21)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

