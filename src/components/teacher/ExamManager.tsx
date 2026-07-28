import React, { useEffect, useState } from 'react';
import { Exam, ExamResult, ClassRoom } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { Award, Plus, Sparkles, CheckCircle2, Send, Bell } from 'lucide-react';

export const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const [examForm, setExamForm] = useState({
    title: '',
    type: 'Midterm' as 'Quiz' | 'Unit Test' | 'Midterm' | 'Final Exam',
    classId: '',
    subjectName: 'Mathematics',
    date: '2026-08-15',
    totalMarks: 100,
    passingMarks: 40
  });

  const [resultForm, setResultForm] = useState({
    examId: '',
    studentName: 'Alex Johnson',
    marksObtained: 92,
    totalMarks: 100,
    grade: 'A+',
    subjectName: 'Mathematics'
  });

  const [aiCommentGenerating, setAiCommentGenerating] = useState(false);
  const [generatedComment, setGeneratedComment] = useState('');
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  const handleNotifyParents = async (examId: string, examTitle: string) => {
    try {
      const res = await api.triggerExamReminders({
        channel: 'SMS_AND_EMAIL',
        triggeredBy: 'Teacher Exam Manager Trigger',
        examId
      });
      setNotifSuccess(`Dispatched SMS & Email exam schedule alerts for ${examTitle} to parents!`);
      setTimeout(() => setNotifSuccess(null), 4000);
    } catch (e) {
      alert('Failed to send exam schedule notification');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [examList, resList, classList] = await Promise.all([
        api.getExams(),
        api.getExamResults(),
        api.getClasses()
      ]);
      setExams(examList);
      setResults(resList);
      setClasses(classList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === examForm.classId);
    await api.createExam({
      ...examForm,
      className: cls ? `${cls.name}-${cls.section}` : 'Class 10-A',
      subjectId: 'sub-1',
      startTime: '09:00 AM',
      durationMinutes: 90
    });
    setIsExamModalOpen(false);
    setExamForm({ title: '', type: 'Midterm', classId: '', subjectName: 'Mathematics', date: '2026-08-15', totalMarks: 100, passingMarks: 40 });
    await loadData();
  };

  const handleGenerateAIComment = async () => {
    setAiCommentGenerating(true);
    try {
      const res = await api.aiReportComment(
        resultForm.studentName,
        resultForm.subjectName,
        resultForm.marksObtained,
        resultForm.totalMarks,
        96
      );
      setGeneratedComment(res.comment);
    } catch (e) {
      console.error(e);
    } finally {
      setAiCommentGenerating(false);
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const exam = exams.find(ex => ex.id === resultForm.examId);
    await api.createExamResult({
      ...resultForm,
      examTitle: exam ? exam.title : 'Midterm Exam',
      studentId: 'u-student1',
      remarks: 'Excellent performance',
      aiComment: generatedComment || 'Strong grasp of mathematical principles.'
    });
    setIsResultModalOpen(false);
    setGeneratedComment('');
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" /> Examination & Result Portal
          </h2>
          <p className="text-xs text-slate-500">Schedule midterms, publish grades, and generate AI report remarks.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResultModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Results</span>
          </button>
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        </div>
      </div>

      {notifSuccess && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold">{notifSuccess}</span>
          </div>
          <button onClick={() => setNotifSuccess(null)} className="text-indigo-700 font-bold text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Scheduled Examinations ({exams.length})
          </h3>

          <div className="space-y-3">
            {exams.map((ex) => (
              <div key={ex.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ex.title}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                    {ex.type}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Subject: <span className="text-slate-800 font-medium">{ex.subjectName}</span> • Class: {ex.className}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Date: {ex.date}</span>
                  <span>Max Marks: {ex.totalMarks}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleNotifyParents(ex.id, ex.title)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-lg border border-indigo-200 transition"
                  >
                    <Send className="w-3 h-3 text-indigo-600" />
                    <span>Notify Parents (SMS/Email)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Published Results & AI Remarks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Published Report Cards & AI Remarks ({results.length})
          </h3>

          <div className="space-y-3">
            {results.map((res) => (
              <div key={res.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{res.studentName}</span>
                    <p className="text-[10px] text-slate-400">{res.examTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-600">{res.marksObtained}/{res.totalMarks}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {res.grade}
                    </span>
                  </div>
                </div>

                {res.aiComment && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-emerald-700">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Report Remark:
                    </div>
                    <p>{res.aiComment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Exam Modal */}
      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Schedule New Examination">
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Exam Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Physics Midterm"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Exam Type</label>
              <select
                value={examForm.type}
                onChange={(e) => setExamForm({ ...examForm, type: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
              >
                <option value="Quiz">Quiz</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Midterm">Midterm</option>
                <option value="Final Exam">Final Exam</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
              <select
                required
                value={examForm.classId}
                onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}-{c.section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={examForm.date}
                onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={examForm.totalMarks}
                onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Publish Exam Schedule
          </button>
        </form>
      </Modal>

      {/* Publish Results Modal */}
      <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title="Publish Exam Result & AI Remark">
        <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Exam *</label>
            <select
              required
              value={resultForm.examId}
              onChange={(e) => setResultForm({ ...resultForm, examId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.className})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={resultForm.studentName}
                onChange={(e) => setResultForm({ ...resultForm, studentName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Marks Obtained</label>
              <input
                type="number"
                value={resultForm.marksObtained}
                onChange={(e) => setResultForm({ ...resultForm, marksObtained: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* AI Generator Button */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Gemini AI Report Remark Generator
              </span>
              <button
                type="button"
                onClick={handleGenerateAIComment}
                disabled={aiCommentGenerating}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs transition"
              >
                {aiCommentGenerating ? 'Generating...' : 'Auto-Generate Remark'}
              </button>
            </div>
            {generatedComment && (
              <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-emerald-200">
                "{generatedComment}"
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs"
          >
            Save Result & Publish
          </button>
        </form>
      </Modal>
    </div>
  );
};
