import React, { useEffect, useState } from 'react';
import { Homework, HomeworkSubmission } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { FileText, CheckCircle2, Send, Camera, FileCheck, Paperclip } from 'lucide-react';
import { DocumentScannerModal } from '../common/DocumentScannerModal';

export const StudentHomeworkView: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachedPdf, setAttachedPdf] = useState<{ name: string; url: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

    let finalSubmissionText = submissionText;
    if (attachedPdf) {
      finalSubmissionText += `\n\n[Attached Scanned PDF Document: ${attachedPdf.name}]`;
    }

    await api.submitHomework({
      homeworkId: selectedHw.id,
      studentId: 'u-student1',
      studentName: 'Alex Johnson',
      submissionText: finalSubmissionText,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted'
    });
    setIsModalOpen(false);
    setSubmissionText('');
    setAttachedPdf(null);
    await loadData();
  };

  const handleScanComplete = (pdfDataUrl: string, fileName: string) => {
    setAttachedPdf({ name: fileName, url: pdfDataUrl });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Homework & Submissions
          </h2>
          <p className="text-xs text-slate-500">View assigned tasks, write solutions, and check teacher grades.</p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Document / Permission Slip to PDF</span>
        </button>
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

      {/* Submission Modal */}
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

          {/* Attached Document PDF section */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" /> Scanned Document Attachment
              </span>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg transition flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> {attachedPdf ? 'Re-scan / Add Pages' : 'Scan Photo to PDF'}
              </button>
            </div>

            {attachedPdf ? (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> {attachedPdf.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedPdf(null)}
                  className="text-slate-400 hover:text-rose-600 text-[11px]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                You can scan physical handwritten pages or permission slips directly using your camera.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Submit Homework Answer
          </button>
        </form>
      </Modal>

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        documentType="assignment"
        documentTitle={selectedHw ? `${selectedHw.subjectName}_Homework` : 'Student_Document_Scan'}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};
