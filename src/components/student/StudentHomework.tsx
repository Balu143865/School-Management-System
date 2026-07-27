import React, { useEffect, useState } from 'react';
import { Homework, HomeworkSubmission } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { FileText, CheckCircle2, Send } from 'lucide-react';

export const StudentHomeworkView: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [hw, sub] = await Promise.all([
        api.getHomework(),
        api.getSubmissions(undefined, 'u-student1')
      ]);
      setHomeworkList(hw);
      setSubmissions(sub);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHw) return;
    await api.submitHomework({
      homeworkId: selectedHw.id,
      studentId: 'u-student1',
      studentName: 'Alex Johnson',
      submissionText,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted'
    });
    setIsModalOpen(false);
    setSubmissionText('');
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Homework & Submissions
          </h2>
          <p className="text-xs text-slate-500">View assigned tasks, write solutions, and check teacher grades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworkList.map((hw) => {
          const submission = submissions.find(s => s.homeworkId === hw.id);
          return (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                  {hw.subjectName}
                </span>
                <span className="text-[10px] text-slate-400">Due: {hw.dueDate}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{hw.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Max: {hw.totalMarks} Marks</span>

                {submission ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{submission.status === 'graded' ? `Score: ${submission.marksObtained}/${hw.totalMarks}` : 'Submitted'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedHw(hw);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Work</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Submit Homework: ${selectedHw?.title}`}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">{selectedHw?.description}</p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Your Solution / Written Submission *</label>
            <textarea
              rows={4}
              required
              placeholder="Type your answer, calculations, or report notes here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Submit Homework Answer
          </button>
        </form>
      </Modal>
    </div>
  );
};
