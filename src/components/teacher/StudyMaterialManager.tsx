import React, { useEffect, useState } from 'react';
import { StudyMaterial } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { FolderDown, Plus, FileText, Download, UploadCloud } from 'lucide-react';

export const StudyMaterialManager: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectName: 'Mathematics',
    className: 'Class 10-A',
    category: 'Notes' as 'PDF' | 'Notes' | 'Worksheet' | 'Previous Paper',
    fileName: 'Math_Revision_Guide.pdf'
  });

  const loadData = async () => {
    try {
      const list = await api.getStudyMaterials();
      setMaterials(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createStudyMaterial({
      ...form,
      fileUrl: '#',
      uploadedBy: 'Prof. Robert Langdon',
      uploadDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
    setForm({
      title: '',
      description: '',
      subjectName: 'Mathematics',
      className: 'Class 10-A',
      category: 'Notes',
      fileName: 'Math_Revision_Guide.pdf'
    });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-purple-600" /> Study Material & Digital Repository
          </h2>
          <p className="text-xs text-slate-500">Upload lecture PDFs, worksheets, revision notes, and past exam papers.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-xs transition shadow-xs"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((mat) => (
          <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[10px]">
                  {mat.category}
                </span>
                <span className="text-[10px] text-slate-400">{mat.uploadDate}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2">{mat.title}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{mat.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px] font-medium">{mat.subjectName}</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Simulated file download for ${mat.fileName}`);
                }}
                className="flex items-center gap-1 text-purple-600 font-semibold hover:underline text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Study Resource">
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Resource Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kinematics Chapter Notes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Key topics covered..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Resource Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              >
                <option value="Notes">Notes</option>
                <option value="PDF">PDF Document</option>
                <option value="Worksheet">Worksheet</option>
                <option value="Previous Paper">Previous Paper</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Simulated Attachment File Name</label>
            <input
              type="text"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Publish Study Resource
          </button>
        </form>
      </Modal>
    </div>
  );
};
