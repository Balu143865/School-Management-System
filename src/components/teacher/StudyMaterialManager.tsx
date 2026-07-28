import React, { useEffect, useState } from 'react';
import { StudyMaterial } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import {
  FolderDown,
  Plus,
  FileText,
  Download,
  UploadCloud,
  Camera,
  Search,
  Eye,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Trash2,
  Filter
} from 'lucide-react';
import { DocumentScannerModal } from '../common/DocumentScannerModal';
import { generateStudyMaterialPDF } from '../../lib/pdfGenerator';
import { useAuth } from '../../context/AuthContext';

export const StudyMaterialManager: React.FC = () => {
  const { role } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
      setMaterials(list || []);
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
      uploadedBy: role === 'teacher' ? 'Prof. Robert Langdon' : 'Faculty Administrator',
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this study resource?')) {
      await api.deleteStudyMaterial(id);
      await loadData();
    }
  };

  const handleScanComplete = (pdfDataUrl: string, fileName: string) => {
    setForm((prev) => ({
      ...prev,
      fileName,
      category: 'PDF'
    }));
  };

  const handleDownloadMaterial = (mat: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(mat.id);
    try {
      const doc = generateStudyMaterialPDF(mat);
      const safeFileName = mat.fileName && mat.fileName.endsWith('.pdf')
        ? mat.fileName
        : `${(mat.title || 'Study_Material').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(safeFileName);
    } catch (err) {
      console.error('Error generating study material PDF:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 400);
    }
  };

  const subjectsList = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
  const categoriesList = ['All', 'Notes', 'PDF', 'Worksheet', 'Previous Paper'];

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mat.description && mat.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mat.subjectName && mat.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === 'All' ||
      mat.subjectName?.toLowerCase().includes(selectedSubject.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      mat.category === selectedCategory;

    return matchesSearch && matchesSubject && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-purple-600" /> Study Material & Digital Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access, preview, and download verified lecture notes, practice worksheets, and model answer guides.
          </p>
        </div>

        {role === 'teacher' || role === 'admin' ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition border border-indigo-200/80"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Scan Notes</span>
              <span className="md:hidden">Scan</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resource</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200/60 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Greenwood Verified Learning Library</span>
          </div>
        )}
      </div>

      {/* Search & Filtering Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <div className="flex items-center gap-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Subject:</span>
          {subjectsList.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                selectedSubject === subj
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Material Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <FolderDown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No study materials found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search filter or selecting another subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200/60">
                    {mat.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400">{mat.uploadDate}</span>
                    {(role === 'teacher' || role === 'admin') && (
                      <button
                        onClick={(e) => handleDelete(mat.id, e)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2.5 group-hover:text-purple-700 transition">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {mat.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {mat.subjectName}
                  </span>
                  <span>•</span>
                  <span>{mat.className || 'Class 10-A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview Notes</span>
                </button>

                <button
                  onClick={(e) => handleDownloadMaterial(mat, e)}
                  disabled={downloadingId === mat.id}
                  className="flex items-center gap-1.5 text-white bg-purple-600 hover:bg-purple-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition shadow-2xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === mat.id ? 'Downloading...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Online Preview Modal */}
      {previewMaterial && (
        <Modal
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          title={`Study Material: ${previewMaterial.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="px-2 py-0.5 bg-purple-600 text-white font-bold text-[10px] rounded uppercase">
                  {previewMaterial.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{previewMaterial.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{previewMaterial.description}</p>
              </div>
              <button
                onClick={() => handleDownloadMaterial(previewMaterial)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shrink-0 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Document</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 block">Subject</span>
                <span className="font-bold text-slate-800">{previewMaterial.subjectName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Class Roster</span>
                <span className="font-bold text-slate-800">{previewMaterial.className || 'Class 10-A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Uploaded By</span>
                <span className="font-bold text-slate-800">{previewMaterial.uploadedBy || 'Faculty'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Upload Date</span>
                <span className="font-bold text-slate-800">{previewMaterial.uploadDate || 'Recent'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-700">
                <BookOpen className="w-4 h-4" /> Key Formulas & Syllabus Overview
              </h4>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-800">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold">Primary Topic</span>
                  <span className="text-purple-600">{previewMaterial.title}</span>
                </div>
                <p className="text-slate-600 pt-1">
                  • Fundamental definitions and standard mathematical/scientific derivation procedures.
                </p>
                <p className="text-slate-600">
                  • Step-by-step example problem breakdown for upcoming term assessments.
                </p>
                <p className="text-slate-600">
                  • Verified practice exercises included in official PDF attachment.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleDownloadMaterial(previewMaterial)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to File ({previewMaterial.fileName || 'Resource.pdf'})</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

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
            <label className="block font-medium text-slate-700 mb-1">Attachment PDF File Name</label>
            <input
              type="text"
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-xs mt-2"
          >
            Publish Study Resource
          </button>
        </form>
      </Modal>

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        documentType="assignment"
        documentTitle="Teacher_Scanned_Study_Notes"
        onScanComplete={handleScanComplete}
      />
    </div>
  );
};
