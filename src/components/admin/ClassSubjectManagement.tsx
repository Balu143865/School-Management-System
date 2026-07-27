import React, { useEffect, useState } from 'react';
import { ClassRoom, Subject, User } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { BookOpen, Plus, Trash2, Building } from 'lucide-react';

export const ClassSubjectManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const [classForm, setClassForm] = useState({
    name: 'Class 11',
    section: 'A',
    classTeacherId: '',
    roomNumber: 'Room 301',
    studentCount: 30
  });

  const [subForm, setSubForm] = useState({
    name: '',
    code: '',
    classId: '',
    teacherId: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [classList, subList, teacherList] = await Promise.all([
        api.getClasses(),
        api.getSubjects(),
        api.getUsers('teacher')
      ]);
      setClasses(classList);
      setSubjects(subList);
      setTeachers(teacherList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === classForm.classTeacherId);
    await api.createClass({
      ...classForm,
      classTeacherName: teacher ? teacher.name : 'Faculty Member'
    });
    setIsClassModalOpen(false);
    await loadData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === subForm.classId);
    const teacher = teachers.find(t => t.id === subForm.teacherId);
    await api.createSubject({
      ...subForm,
      className: cls ? `${cls.name}-${cls.section}` : 'Class 10-A',
      teacherName: teacher ? teacher.name : 'Unassigned'
    });
    setIsSubModalOpen(false);
    setSubForm({ name: '', code: '', classId: '', teacherId: '' });
    await loadData();
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('Delete classroom record?')) {
      await api.deleteClass(id);
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Classrooms & Subject Curriculum
          </h2>
          <p className="text-xs text-slate-500">Configure academic grades, sections, room assignments, and subjects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Rooms Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" /> Active Class Rooms
            </h3>
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {cls.name} - Section {cls.section}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Class Teacher: <span className="text-slate-700 font-medium">{cls.classTeacherName}</span> • {cls.roomNumber}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                    {cls.studentCount} Students
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Subject Catalog
            </h3>
            <button
              onClick={() => setIsSubModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {sub.name} ({sub.code})
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {sub.className} • Instructor: <span className="text-slate-700 font-medium">{sub.teacherName}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                  Active Course
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Class Room">
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Grade / Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Class 11"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                required
                placeholder="e.g. A"
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Class Teacher</label>
              <select
                value={classForm.classTeacherId}
                onChange={(e) => setClassForm({ ...classForm, classTeacherId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                placeholder="Room 302"
                value={classForm.roomNumber}
                onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Create Classroom
          </button>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Create New Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS-101"
                value={subForm.code}
                onChange={(e) => setSubForm({ ...subForm, code: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Class *</label>
              <select
                required
                value={subForm.classId}
                onChange={(e) => setSubForm({ ...subForm, classId: e.target.value })}
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
              <label className="block font-medium text-slate-700 mb-1">Assigned Teacher</label>
              <select
                value={subForm.teacherId}
                onChange={(e) => setSubForm({ ...subForm, teacherId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              >
                <option value="">Select Faculty</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Add Subject
          </button>
        </form>
      </Modal>
    </div>
  );
};
