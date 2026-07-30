import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Smartphone,
  Mail,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Zap,
  Filter,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import { FeeRecord, Exam, NotificationLog, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NotificationTriggerHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'fee' | 'exam' | 'logs' | 'auto';
}

export const NotificationTriggerHub: React.FC<NotificationTriggerHubProps> = ({
  isOpen,
  onClose,
  defaultTab = 'fee'
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'fee' | 'exam' | 'logs' | 'auto'>(defaultTab);

  // Data states
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggerSuccessMsg, setTriggerSuccessMsg] = useState<string | null>(null);

  // Trigger form state
  const [selectedChannel, setSelectedChannel] = useState<'SMS_AND_EMAIL' | 'SMS' | 'EMAIL'>('SMS_AND_EMAIL');
  const [customMsgOverride, setCustomMsgOverride] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Automated Schedule Rules
  const [autoFeeReminderDays, setAutoFeeReminderDays] = useState(3);
  const [isAutoFeeEnabled, setIsAutoFeeEnabled] = useState(true);
  const [autoExamReminderDays, setAutoExamReminderDays] = useState(5);
  const [isAutoExamEnabled, setIsAutoExamEnabled] = useState(true);

  // Search & Filter for logs
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [feeData, examData, logData, userData] = await Promise.all([
        api.getFees(),
        api.getExams(),
        api.getNotificationLogs(),
        api.getUsers('parent')
      ]);
      setFees(feeData);
      setExams(examData);
      setLogs(logData);
      setParents(userData);
    } catch (err) {
      console.error('Failed to load notification trigger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerFeeReminders = async (feeId?: string) => {
    setLoading(true);
    try {
      const res = await api.triggerFeeReminders({
        channel: selectedChannel,
        triggeredBy: `${user?.name || 'Administrator'} (${user?.role || 'admin'})`,
        feeId
      });
      setTriggerSuccessMsg(`Successfully triggered ${res.count} automated fee reminder notification(s) via ${selectedChannel.replace('_', ' ')}!`);
      const updatedLogs = await api.getNotificationLogs();
      setLogs(updatedLogs);
      setTimeout(() => setTriggerSuccessMsg(null), 5000);
    } catch (err) {
      alert('Failed to trigger fee reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerExamReminders = async (examId?: string) => {
    setLoading(true);
    try {
      const res = await api.triggerExamReminders({
        channel: selectedChannel,
        triggeredBy: `${user?.name || 'Administrator'} (${user?.role || 'admin'})`,
        examId
      });
      setTriggerSuccessMsg(`Successfully dispatched ${res.count} exam schedule notification(s) to parents via ${selectedChannel.replace('_', ' ')}!`);
      const updatedLogs = await api.getNotificationLogs();
      setLogs(updatedLogs);
      setTimeout(() => setTriggerSuccessMsg(null), 5000);
    } catch (err) {
      alert('Failed to dispatch exam schedule notifications');
    } finally {
      setLoading(false);
    }
  };

  const generateAiCustomCopy = async (type: 'fee' | 'exam') => {
    setIsGeneratingAi(true);
    try {
      if (type === 'fee') {
        const res = await api.aiFeeReminder('Parent Name', 'Student Name', 1250, '2026-08-10', 'Term 1 Tuition Fee');
        setCustomMsgOverride(res.reminderText);
      } else {
        const res = await api.aiNoticeGenerator('Midterm Mathematics Examination', 'Class 10 Parents', 'Starts Aug 15 at 9:00 AM, 90 mins duration, bring geometry sets');
        setCustomMsgOverride(res.noticeText);
      }
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'partial');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipientName.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.studentName && log.studentName.toLowerCase().includes(logSearch.toLowerCase())) ||
      log.title.toLowerCase().includes(logSearch.toLowerCase());
    const matchesType = logTypeFilter === 'all' || log.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Service & Automated Reminders Trigger" maxWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Banner Alert */}
        {triggerSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{triggerSuccessMsg}</span>
            </div>
            <button onClick={() => setTriggerSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Channel Selector Header */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Automated Notification Delivery Engine</h3>
              <p className="text-xs text-slate-400">Multi-channel gateway for instant SMS & Email parent communication</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-medium text-slate-400 px-2">Channel:</span>
            <button
              onClick={() => setSelectedChannel('SMS_AND_EMAIL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedChannel === 'SMS_AND_EMAIL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <Mail className="w-3.5 h-3.5" />
              <span>SMS + Email</span>
            </button>
            <button
              onClick={() => setSelectedChannel('SMS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedChannel === 'SMS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS Only</span>
            </button>
            <button
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedChannel === 'EMAIL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Only</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('fee')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'fee' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Deadline Reminders ({pendingFees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'exam' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Exam Schedule Alerts ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auto')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'auto' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Scheduled Rules (Cron)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Delivery Receipts Log ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: FEE DEADLINE REMINDERS */}
        {activeTab === 'fee' && (
          <div className="space-y-4">
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Pending Parent Fee Deadlines ({pendingFees.length} Pending Records)</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Triggering will format and dispatch personalized SMS/Email alerts to all registered parents with student name, outstanding amount, due date, and payment portal link.
                </p>
              </div>

              <button
                onClick={() => handleTriggerFeeReminders()}
                disabled={loading || pendingFees.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>Trigger All Fee Reminders ({pendingFees.length})</span>
              </button>
            </div>

            {/* AI Copy Preview Accordion */}
            <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Copy Refiner (Gemini 3.6 Flash)</span>
                </span>
                <button
                  onClick={() => generateAiCustomCopy('fee')}
                  disabled={isGeneratingAi}
                  className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs"
                >
                  {isGeneratingAi ? 'Drafting...' : 'Generate AI Reminder Template'}
                </button>
              </div>
              {customMsgOverride && (
                <div className="bg-white p-3 rounded-lg border border-indigo-200 text-xs font-mono text-slate-700 whitespace-pre-wrap">
                  {customMsgOverride}
                </div>
              )}
            </div>

            {/* Pending Fee Records Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Student & Parent</th>
                    <th className="p-3">Fee Title</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Amount Due</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingFees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No pending fee records requiring reminders! All tuition fees are up-to-date.
                      </td>
                    </tr>
                  ) : (
                    pendingFees.map((fee) => {
                      const parent = parents.find((p) => p.childStudentId === fee.studentId || (p.childName && p.childName.toLowerCase() === fee.studentName.toLowerCase()));
                      const parentName = parent ? parent.name : 'Parent/Guardian';
                      const parentPhone = parent?.phone || '+91 63040 45279';

                      return (
                        <tr key={fee.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{fee.studentName}</p>
                            <p className="text-[11px] text-slate-500">Parent: {parentName} ({parentPhone})</p>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{fee.title}</td>
                          <td className="p-3 font-semibold text-rose-600">{fee.dueDate}</td>
                          <td className="p-3 font-bold text-slate-900">${(fee.totalAmount - fee.paidAmount).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleTriggerFeeReminders(fee.id)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] border border-indigo-200 transition flex items-center gap-1.5 ml-auto"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send SMS/Email</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EXAM SCHEDULE ALERTS */}
        {activeTab === 'exam' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Upcoming Exam Schedules ({exams.length} Scheduled Exams)</span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  Broadcasts exam dates, timing, duration, syllabus notes, and preparation instructions directly to parent mobile phones & email inboxes.
                </p>
              </div>

              <button
                onClick={() => handleTriggerExamReminders()}
                disabled={loading || exams.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast All Exam Schedules ({exams.length})</span>
              </button>
            </div>

            {/* AI Notice Preview */}
            <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Exam Announcement Generator</span>
                </span>
                <button
                  onClick={() => generateAiCustomCopy('exam')}
                  disabled={isGeneratingAi}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-xs"
                >
                  {isGeneratingAi ? 'Drafting...' : 'Generate Exam Circular'}
                </button>
              </div>
              {customMsgOverride && (
                <div className="bg-white p-3 rounded-lg border border-purple-200 text-xs font-mono text-slate-700 whitespace-pre-wrap">
                  {customMsgOverride}
                </div>
              )}
            </div>

            {/* Exams Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Exam Title</th>
                    <th className="p-3">Class & Subject</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Duration & Marks</th>
                    <th className="p-3 text-right">Trigger Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No upcoming exams scheduled. Create an exam in the Exam Manager to schedule alerts.
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-semibold text-slate-800">
                          {exam.title}
                          <span className="ml-2 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                            {exam.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {exam.className} • {exam.subjectName}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {exam.date} at {exam.startTime}
                        </td>
                        <td className="p-3 text-slate-600">
                          {exam.durationMinutes} mins ({exam.totalMarks} Marks)
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleTriggerExamReminders(exam.id)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-[11px] border border-indigo-200 transition flex items-center gap-1.5 ml-auto"
                          >
                            <Send className="w-3 h-3" />
                            <span>Notify Parents</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULED RULES (CRON) */}
        {activeTab === 'auto' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fee Reminder Rule Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Automated Fee Due Reminders</h4>
                      <p className="text-[11px] text-slate-500">Triggers cron scan for pending tuition & activity fees</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAutoFeeEnabled(!isAutoFeeEnabled)}
                    className={`p-1 rounded-full transition ${isAutoFeeEnabled ? 'text-indigo-600' : 'text-slate-300'}`}
                  >
                    {isAutoFeeEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-600 font-medium block">Send SMS & Email reminder:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={autoFeeReminderDays}
                      onChange={(e) => setAutoFeeReminderDays(Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-slate-800"
                    />
                    <span className="text-slate-600 font-medium">days before the due date</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">Next Scheduled Trigger Check:</p>
                  <p className="text-slate-500">Tomorrow at 08:00 AM (Automated Cron Daemon)</p>
                </div>
              </div>

              {/* Exam Reminder Rule Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Automated Exam Alerts</h4>
                      <p className="text-[11px] text-slate-500">Dispatches exam timetables to parents ahead of tests</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAutoExamEnabled(!isAutoExamEnabled)}
                    className={`p-1 rounded-full transition ${isAutoExamEnabled ? 'text-indigo-600' : 'text-slate-300'}`}
                  >
                    {isAutoExamEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-600 font-medium block">Dispatch exam alerts:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={autoExamReminderDays}
                      onChange={(e) => setAutoExamReminderDays(Number(e.target.value))}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-slate-800"
                    />
                    <span className="text-slate-600 font-medium">days prior to exam date</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">Next Scheduled Trigger Check:</p>
                  <p className="text-slate-500">Tomorrow at 09:00 AM (Automated Cron Daemon)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY RECEIPT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search recipient name, student name, or title..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logTypeFilter}
                  onChange={(e) => setLogTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="fee_reminder">Fee Reminders</option>
                  <option value="exam_schedule">Exam Schedules</option>
                  <option value="general_notice">General Notices</option>
                </select>

                <button
                  onClick={loadAllData}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition"
                  title="Refresh logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Recipient & Contact</th>
                    <th className="p-3">Type & Channel</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Sent At</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No notification logs found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{log.recipientName}</p>
                          <p className="text-[11px] text-slate-500">
                            Student: {log.studentName || 'N/A'} • {log.recipientPhone}
                          </p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.type === 'fee_reminder'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {log.type === 'fee_reminder' ? 'Fee Deadline' : 'Exam Schedule'}
                          </span>
                          <p className="text-[10px] font-semibold text-slate-500 mt-1">{log.channel.replace('_', ' ')}</p>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{log.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{log.message}</p>
                        </td>
                        <td className="p-3 text-[11px] font-medium text-slate-600 whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{log.status.toUpperCase()}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
