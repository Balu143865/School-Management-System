import React, { useEffect, useState } from 'react';
import { User, ClassRoom } from '../../types';
import { api } from '../../lib/api';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { UserPlus, Trash2, Edit3, GraduationCap, FileText, QrCode, Upload, Image as ImageIcon, X, Camera } from 'lucide-react';
import { generateStudentReportPDF } from '../../lib/pdfGenerator';
import { DigitalStudentIdModal } from '../common/DigitalStudentIdModal';

const STUDENT_PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80'
];

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [selectedStudentForId, setSelectedStudentForId] = useState<User | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    classId: '',
    className: '',
    rollNo: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '2010-01-01',
    avatar: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentList, classList] = await Promise.all([
        api.getUsers('student'),
        api.getClasses()
      ]);
      setStudents(studentList);
      setClasses(classList);
    } catch (err) {
      console.error('Error loading students:', err);
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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      studentId: '',
      classId: '',
      className: '',
      rollNo: '',
      gender: 'male',
      dateOfBirth: '2010-01-01',
      avatar: STUDENT_PRESET_AVATARS[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: User) => {
    setEditingStudent(student);
    const matchedClass = classes.find(c => `${c.name}-${c.section}` === student.className);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      studentId: student.studentId || '',
      classId: matchedClass?.id || '',
      className: student.className || '',
      rollNo: student.rollNo || '',
      gender: (student.gender as any) || 'male',
      dateOfBirth: student.dateOfBirth || '2010-01-01',
      avatar: student.avatar || STUDENT_PRESET_AVATARS[0]
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const classNameStr = selectedClass ? `${selectedClass.name}-${selectedClass.section}` : formData.className || 'Class 10-A';

      const payload = {
        ...formData,
        role: 'student' as const,
        className: classNameStr,
        studentId: formData.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: formData.avatar || STUDENT_PRESET_AVATARS[0]
      };

      if (editingStudent) {
        await api.updateUser(editingStudent.id, payload);
      } else {
        await api.createUser(payload);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        classId: '',
        className: '',
        rollNo: '',
        gender: 'male',
        dateOfBirth: '2010-01-01',
        avatar: ''
      });
      await loadData();
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };

  const confirmDeleteStudent = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadStudentPdf = (item: User) => {
    const doc = generateStudentReportPDF({
      studentName: item.name,
      studentId: item.studentId || `STU-${item.id}`,
      className: item.className || 'Class 10-A',
      rollNo: item.rollNo || '01',
      attendanceRate: 98,
      gpa: '3.90',
      parentName: item.parentName || 'David Johnson',
      academicYear: 'Academic Year 2025-2026',
      subjects: [
        { subject: 'Mathematics', teacher: 'Prof. Alan Turing', marks: 94, totalMarks: 100, grade: 'A+', remarks: 'Exceptional problem solving' },
        { subject: 'Physics', teacher: 'Dr. Marie Curie', marks: 91, totalMarks: 100, grade: 'A+', remarks: 'Great practical laboratory skills' },
        { subject: 'Chemistry', teacher: 'Dr. Linus Pauling', marks: 87, totalMarks: 100, grade: 'A', remarks: 'Thorough subject comprehension' },
        { subject: 'Computer Science', teacher: 'Mr. Ada Lovelace', marks: 97, totalMarks: 100, grade: 'A+', remarks: 'Brilliant programming aptitude' },
        { subject: 'English', teacher: 'Ms. Emily Dickinson', marks: 88, totalMarks: 100, grade: 'A', remarks: 'Strong analytical literature essays' }
      ]
    });
    doc.save(`Transcript_${item.name.replace(/\s+/g, '_')}_2026.pdf`);
  };

  const columns: Column<User>[] = [
    {
      header: 'Student Name',
      accessor: (item) => (
        <div className="flex items-center gap-2.5">
          <img
            src={item.avatar || STUDENT_PRESET_AVATARS[0]}
            alt={item.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[10px] text-slate-400">{item.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'Class', accessor: 'className' },
    { header: 'Roll No', accessor: 'rollNo' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Gender',
      accessor: (item) => (
        <span className="capitalize px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium">
          {item.gender || 'N/A'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" /> Student Directory Management
          </h2>
          <p className="text-xs text-slate-500">View, register, update photos, and manage active enrolled students.</p>
        </div>
      </div>

      <DataTable
        title="Enrolled Student Records"
        columns={columns}
        data={students}
        searchKey="name"
        exportFilename="students_list.csv"
        onAddClick={handleOpenAddModal}
        addLabel="Register Student"
        actions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenEditModal(item)}
              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
              title="Edit Student Details & Update Photo"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedStudentForId(item);
                setIsIdModalOpen(true);
              }}
              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
              title="View Digital Student ID Pass with QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownloadStudentPdf(item)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
              title="Download Official PDF Report Card"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteTarget(item)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Delete Student"
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
        onConfirm={confirmDeleteStudent}
        title="Delete Student Record"
        itemName={deleteTarget?.name}
        description={`Are you sure you want to delete ${deleteTarget?.name || 'this student'}? This will remove all associated enrollment and grade records.`}
        isLoading={isDeleting}
      />

      {/* Digital Student ID Modal */}
      <DigitalStudentIdModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        student={selectedStudentForId}
      />

      {/* Register / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : "Register New Student"}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          {/* Photo Upload Option Field */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Profile Photo / Student Avatar
            </label>

            <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {/* Photo Preview Badge */}
              <div className="relative group shrink-0">
                <img
                  src={formData.avatar || STUDENT_PRESET_AVATARS[0]}
                  alt="Student Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                />
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition shadow-xs"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">JPG/PNG up to 5MB</span>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Or choose a preset portrait:</span>
                  <div className="flex items-center gap-1.5">
                    {STUDENT_PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: url }))}
                        className={`w-6 h-6 rounded-full overflow-hidden border-2 transition ${
                          formData.avatar === url ? 'border-emerald-600 scale-110 shadow-xs' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={`Select preset ${idx + 1}`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Michael Scott"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="student@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 63040 45279"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class Room *</label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
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
              <label className="block font-medium text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                placeholder="e.g. 105"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            {editingStudent ? "Save Student Changes" : "Confirm Registration"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

