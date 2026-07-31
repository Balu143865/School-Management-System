import React, { useEffect, useState } from 'react';
import { User, ClassRoom } from '../../types';
import { api } from '../../lib/api';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { DigitalStudentIdModal } from '../common/DigitalStudentIdModal';
import { generateIdCardPDF } from '../../lib/pdfGenerator';
import { UserCheck, Trash2, Upload, Image as ImageIcon, X, QrCode, FileText } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
];

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTeacherForId, setSelectedTeacherForId] = useState<User | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mathematics',
    classId: '',
    avatar: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [teacherList, classList] = await Promise.all([
        api.getUsers('teacher'),
        api.getClasses()
      ]);
      setTeachers(teacherList);
      setClasses(classList);
    } catch (err) {
      console.error('Error loading teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const classNameStr = selectedClass ? `${selectedClass.name}-${selectedClass.section}` : 'Class 10-A';

      await api.createUser({
        ...formData,
        role: 'teacher',
        className: classNameStr,
        avatar: formData.avatar || PRESET_AVATARS[0]
      });

      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', subject: 'Mathematics', classId: '', avatar: '' });
      await loadData();
    } catch (err) {
      console.error('Failed to add teacher:', err);
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to remove faculty:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Faculty Member',
      accessor: (item) => (
        <div className="flex items-center gap-2.5">
          <img
            src={item.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"}
            alt={item.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80";
            }}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[10px] text-slate-400">{item.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Subject Expertise', accessor: 'subject' },
    { header: 'Assigned Class', accessor: 'className' },
    { header: 'Contact Phone', accessor: 'phone' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" /> Faculty & Teacher Management
          </h2>
          <p className="text-xs text-slate-500">Manage teacher credentials, subject mapping, and class assignments.</p>
        </div>
      </div>

      <DataTable
        title="Faculty Directory"
        columns={columns}
        data={teachers}
        searchKey="name"
        exportFilename="faculty_list.csv"
        onAddClick={() => setIsModalOpen(true)}
        addLabel="Add Faculty Member"
        actions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setSelectedTeacherForId(item);
                setIsIdModalOpen(true);
              }}
              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
              title="View Digital Faculty ID Pass with QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const doc = generateIdCardPDF(item, {
                  schoolName: 'BN INTERNATIONAL ACADEMY',
                  phone: item.phone || '+91 63040 45279'
                });
                doc.save(`${item.name.replace(/\s+/g, '_')}_Faculty_ID_Card.pdf`);
              }}
              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
              title="Download Printable Faculty ID Card PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(item)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Delete Faculty Member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTeacher}
        title="Delete Faculty Member"
        itemName={deleteTarget?.name}
        description={`Are you sure you want to remove ${deleteTarget?.name || 'this teacher'} from the faculty registry?`}
        isLoading={isDeleting}
      />

      {/* Digital Faculty ID Modal */}
      <DigitalStudentIdModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        student={selectedTeacherForId}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Faculty Member">
        <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
          {/* Profile Photo / Image Upload Section */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <label className="block font-semibold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-600" /> Faculty Profile Photo / Avatar
            </label>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={formData.avatar || PRESET_AVATARS[0]}
                  alt="Faculty Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30 shadow-xs"
                />
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                    className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 hover:bg-rose-600 transition"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                </div>

                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-[11px]"
                />
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-1">Quick Select Presets:</div>
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setFormData((prev) => ({ ...prev, avatar: url }))}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                      formData.avatar === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Alan Turing"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="teacher@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 63040 45279"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Expertise</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Math"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class Teacher Assignment</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Create Faculty Record
          </button>
        </form>
      </Modal>
    </div>
  );
};
