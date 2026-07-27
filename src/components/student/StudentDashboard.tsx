import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  FileText,
  CreditCard,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Homework, FeeRecord, ExamResult } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<Props> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [hwList, feeList, resList] = await Promise.all([
          api.getHomework(),
          api.getFees('u-student1'),
          api.getExamResults(undefined, 'u-student1')
        ]);
        setHomework(hwList);
        setFees(feeList);
        setResults(resList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  const pendingFee = fees.find(f => f.status !== 'paid');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-md text-[11px] font-semibold uppercase tracking-wider">
            Student Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Hi, {user?.name || 'Student'}!
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Class: <span className="font-semibold text-white">{user?.className || 'Class 10-A'}</span> • Roll No: {user?.rollNo || '101'}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl text-xs transition shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Tutor</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Attendance"
          value="98%"
          subtitle="Present 28 / 29 Days"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Pending Homework"
          value={homework.length}
          subtitle="Due this week"
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Fee Status"
          value={pendingFee ? `$${pendingFee.totalAmount - pendingFee.paidAmount} Due` : 'Paid'}
          subtitle={pendingFee ? pendingFee.title : 'All fees clear'}
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Latest Grade"
          value="A+"
          subtitle="Physics Motion Test"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Main Student Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework due */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Assigned Homework & Worksheets</h3>
            <button
              onClick={() => setActiveTab('homework')}
              className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Submit Work <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {homework.map((hw) => (
              <div key={hw.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{hw.title}</div>
                  <p className="text-slate-600">{hw.description}</p>
                  <div className="text-[11px] text-slate-400">Subject: {hw.subjectName} • Max Marks: {hw.totalMarks}</div>
                </div>
                <button
                  onClick={() => setActiveTab('homework')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shrink-0 transition"
                >
                  Submit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tutor Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Gemini AI Homework Assistant</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Stuck on a tricky math equation or science concept? Get instant step-by-step guidance without giving away direct answers!
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-semibold rounded-xl text-xs transition shadow-sm text-center"
          >
            Launch AI Tutor
          </button>
        </div>
      </div>
    </div>
  );
};
