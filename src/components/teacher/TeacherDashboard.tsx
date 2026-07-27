import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { StatCard } from '../common/StatCard';
import {
  CalendarCheck,
  FileText,
  FolderDown,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Homework, ClassRoom } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<Props> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const [hwData, classData] = await Promise.all([
          api.getHomework(),
          api.getClasses()
        ]);
        setHomeworkList(hwData);
        setClasses(classData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadTeacherData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-md text-[11px] font-semibold uppercase tracking-wider">
            Faculty Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Welcome back, {user?.name || 'Professor'}!
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Assigned: <span className="font-semibold text-white">{user?.className || 'Class 10-A'}</span> • {user?.subject || 'Mathematics & Physics'}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-xs transition shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Quiz Builder</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Class Attendance"
          value="96%"
          subtitle="Class 10-A Today"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Active Homework"
          value={homeworkList.length}
          subtitle="Pending grading"
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Students Under Charge"
          value="32"
          subtitle="Class 10-A roster"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Upcoming Exams"
          value="2"
          subtitle="Midterm & Unit Tests"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Quick Teacher Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Classroom Management Actions</h3>
            <span className="text-[11px] text-slate-400">Class 10-A Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Mark Daily Attendance</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Bulk mark present, absent, or late for today's session.</p>
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 transition text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Create & Grade Homework</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Assign problem sets and evaluate student submissions.</p>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 transition text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Parent & Student Messaging</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Send secure 1-on-1 updates, attachments & AI messages to parents.</p>
            </button>

            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 transition text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs">AI Quiz & Comment Suite</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Generate instant MCQ quizzes & personalized report remarks.</p>
            </button>
          </div>
        </div>

        {/* Assigned Homework List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Assigned Homework</h3>
            <button
              onClick={() => setActiveTab('homework')}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2.5">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="font-bold text-slate-900">{hw.title}</div>
                <div className="text-slate-500 text-[11px] mt-1 flex items-center justify-between">
                  <span>Due: {hw.dueDate}</span>
                  <span className="font-semibold text-indigo-600">{hw.totalMarks} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
