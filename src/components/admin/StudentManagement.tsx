import React, { useEffect, useState } from 'react';
import { User, ClassRoom } from '../../types';
import { api } from '../../lib/api';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { UserPlus, Trash2, Edit3, GraduationCap, FileText, QrCode } from 'lucide-react';
import { generateStudentReportPDF } from '../../lib/pdfGenerator';
import { DigitalStudentIdModal } from '../common/DigitalStudentIdModal';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentForId, setSelectedStudentForId] = useState<User | null>(null);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    classId: '',
    className: '',
    rollNo: '',
    gender: 'male',
    dateOfBirth: '2010-01-01'
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const classNameStr = selectedClass ? `${selectedClass.name}-${selectedClass.section}` : 'Class 10-A';

      await api.createUser({
        ...formData,
        role: 'student',
        className: classNameStr,
        studentId: formData.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80`
      });

      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        classId: '',
        className: '',
        rollNo: '',
        gender: 'male',
        dateOfBirth: '2010-01-01'
      });
      await loadData();
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this student record?')) {
      await api.deleteUser(id);
      await loadData();
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
            src={item.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"}
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
          <p className="text-xs text-slate-500">View, register, and update active enrolled students.</p>
        </div>
      </div>

      <DataTable
        title="Enrolled Student Records"
        columns={columns}
        data={students}
        searchKey="name"
        exportFilename="students_list.csv"
        onAddClick={() => setIsModalOpen(true)}
        addLabel="Register Student"
        actions={(item) => (
          <div className="flex items-center justify-end gap-1">
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
              onClick={() => handleDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Digital Student ID Modal */}
      <DigitalStudentIdModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        student={selectedStudentForId}
      />

      {/* Register Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
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
                placeholder="+1 555-0192"
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
            Confirm Registration
          </button>
        </form>
      </Modal>
    </div>
  );
};
