import React, { useEffect, useState } from 'react';
import { Homework, HomeworkSubmission, ClassRoom, Subject } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { FileText, Plus, CheckCircle2, Award, ExternalLink } from 'lucide-react';

export const HomeworkManager: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<HomeworkSubmission | null>(null);

  const [hwForm, setHwForm] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '2026-08-01',
    totalMarks: 20
  });

  const [gradeForm, setGradeForm] = useState({
    marksObtained: 18,
    feedback: 'Great step-by-step calculations!'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [hwData, subData, classList, subList] = await Promise.all([
        api.getHomework(),
        api.getSubmissions(),
        api.getClasses(),
        api.getSubjects()
      ]);
      setHomeworkList(hwData);
      setSubmissions(subData);
      setClasses(classList);
      setSubjects(subList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === hwForm.classId);
    const sub = subjects.find(s => s.id === hwForm.subjectId);

    await api.createHomework({
      ...hwForm,
      className: cls ? `${cls.name}-${cls.section}` : 'Class 10-A',
      subjectName: sub ? sub.name : 'Mathematics',
      teacherId: 'u-teacher1',
      teacherName: 'Prof. Robert Langdon',
      assignedDate: new Date().toISOString().split('T')[0]
    });

    setIsModalOpen(false);
    setHwForm({ title: '', description: '', classId: '', subjectId: '', dueDate: '2026-08-01', totalMarks: 20 });
    await loadData();
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    await api.gradeSubmission(selectedSub.id, gradeForm.marksObtained, gradeForm.feedback);
    setIsGradeModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Homework & Assignment Management
          </h2>
          <p className="text-xs text-slate-500">Assign problem sets, track due dates, and evaluate student work.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Homework</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Assigned Homework Tasks ({homeworkList.length})
          </h3>

          <div className="space-y-3">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{hw.title}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                    {hw.subjectName}
                  </span>
                </div>
                <p className="text-slate-600">{hw.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Target: {hw.className}</span>
                  <span>Due: {hw.dueDate}</span>
                  <span className="font-bold text-slate-800">{hw.totalMarks} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Student Submissions ({submissions.length})
          </h3>

          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{sub.studentName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                    sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  "{sub.submissionText}"
                </p>

                {sub.status === 'graded' ? (
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px]">
                    <span className="font-bold">Score: {sub.marksObtained} Marks</span> • Feedback: {sub.feedback}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setIsGradeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Grade Submission</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Homework Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Homework Assignment">
        <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Quadratic Equations Problem Set"
              value={hwForm.title}
              onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Instructions / Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Detail required steps, problems, or essay prompt..."
              value={hwForm.description}
              onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
              <select
                required
                value={hwForm.classId}
                onChange={(e) => setHwForm({ ...hwForm, classId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}-{c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject *</label>
              <select
                required
                value={hwForm.subjectId}
                onChange={(e) => setHwForm({ ...hwForm, subjectId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={hwForm.dueDate}
                onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={hwForm.totalMarks}
                onChange={(e) => setHwForm({ ...hwForm, totalMarks: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Publish Homework Task
          </button>
        </form>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title="Grade Student Submission">
        <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
          <p className="font-semibold text-slate-900">Student: {selectedSub?.studentName}</p>
          <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            "{selectedSub?.submissionText}"
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Marks Awarded</label>
            <input
              type="number"
              value={gradeForm.marksObtained}
              onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Teacher Feedback</label>
            <input
              type="text"
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Submit Grade & Remarks
          </button>
        </form>
      </Modal>
    </div>
  );
};
