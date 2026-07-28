import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  CreditCard,
  FileText,
  Award,
  Sparkles,
  DollarSign,
  Heart,
  MessageSquare,
  Bell,
  Smartphone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { FeeRecord, Homework, ExamResult, NotificationLog } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ParentDashboard: React.FC<Props> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  useEffect(() => {
    const loadParentData = async () => {
      try {
        const [feeList, hwList, resList, notifList] = await Promise.all([
          api.getFees('u-student1'),
          api.getHomework(),
          api.getExamResults(undefined, 'u-student1'),
          api.getNotificationLogs()
        ]);
        setFees(feeList);
        setHomework(hwList);
        setResults(resList);
        setNotifications(notifList.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    };
    loadParentData();
  }, []);

  const pendingFee = fees.find(f => f.status !== 'paid');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-md text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Heart className="w-3.5 h-3.5 text-purple-300" /> Parent Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Welcome, {user?.name || 'Mr. David Johnson'}!
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Child: <span className="font-semibold text-white">{user?.childName || 'Alex Johnson'}</span> (Class 10-A • Roll No. 101)
          </p>
        </div>

        <button
          onClick={() => setActiveTab('fees')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition shadow-md shrink-0"
        >
          <DollarSign className="w-4 h-4" />
          <span>Pay School Dues</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Child's Attendance"
          value="98%"
          subtitle="28 / 29 Days Present"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Outstanding Fee"
          value={pendingFee ? `$${pendingFee.totalAmount - pendingFee.paidAmount}` : '$0'}
          subtitle={pendingFee ? pendingFee.title : 'All Clear'}
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Homework Assigned"
          value={homework.length}
          subtitle="Active study tasks"
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Recent Academic Grade"
          value="A+"
          subtitle="Physics Midterm"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Teacher Messaging Quick Action Banner */}
      <div className="bg-blue-900 text-white p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Direct Teacher Communication Portal</h3>
            <p className="text-xs text-blue-200">
              Message Prof. Robert Langdon or Ms. Sarah Jenkins directly about Alex's academic progress.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('chat')}
          className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-lg text-xs transition shrink-0"
        >
          Open Chat Portal
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Report Card Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Academic Performance & Report Cards
          </h3>

          <div className="space-y-3">
            {results.map((res) => (
              <div key={res.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{res.examTitle} ({res.subjectName})</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Grade: {res.grade} ({res.marksObtained}/{res.totalMarks})
                  </span>
                </div>
                {res.aiComment && (
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{res.aiComment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fee Payment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Fee Statement & Dues</h3>
            <button
              onClick={() => setActiveTab('fees')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Fee Portal
            </button>
          </div>

          <div className="space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{f.title}</div>
                  <div className="text-[11px] text-slate-400">Due Date: {f.dueDate}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">${f.totalAmount}</span>
                  <span className={`text-[10px] font-semibold capitalize ${f.status === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Parent Notifications & SMS/Email Alerts Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Automated SMS & Email Reminders Received</h3>
              <p className="text-[11px] text-slate-500">Live feed of fee deadline alerts & exam schedule notifications sent to your registered mobile/email</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <Mail className="w-3 h-3" />
            <span>Active Sync</span>
          </span>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No automated notification alerts sent yet.</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{notif.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      notif.type === 'fee_reminder' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {notif.type === 'fee_reminder' ? 'Fee Deadline Alert' : 'Exam Schedule Alert'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{notif.message}</p>
                  <p className="text-[10px] text-slate-400">
                    Channel: {notif.channel.replace('_', ' ')} • Sent on {new Date(notif.sentAt).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-md border border-emerald-200 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Delivered</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
