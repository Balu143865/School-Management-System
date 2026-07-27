import React, { useEffect, useState } from 'react';
import { User, ClassRoom } from '../../types';
import { api } from '../../lib/api';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { UserCheck, Trash2 } from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Mathematics',
    classId: ''
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

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const classNameStr = selectedClass ? `${selectedClass.name}-${selectedClass.section}` : 'Class 10-A';

      await api.createUser({
        ...formData,
        role: 'teacher',
        className: classNameStr,
        avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80`
      });

      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', subject: 'Mathematics', classId: '' });
      await loadData();
    } catch (err) {
      console.error('Failed to add teacher:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this faculty record?')) {
      await api.deleteUser(id);
      await loadData();
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
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Faculty Member">
        <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
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
                placeholder="+1 555-0100"
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
