import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { User, ClassRoom, AttendanceRecord } from '../../types';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, QrCode } from 'lucide-react';
import { QRAttendanceModal } from '../common/QRAttendanceModal';

export const AttendanceManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('c-10a');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceState, setAttendanceState] = useState<
    Record<string, 'present' | 'absent' | 'late' | 'excused'>
  >({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const loadAttendanceData = async () => {
    try {
      const [classList, studentList, existingRecords] = await Promise.all([
        api.getClasses(),
        api.getUsers('student'),
        api.getAttendance(selectedClassId, undefined, selectedDate)
      ]);
      setClasses(classList);

      const filteredStudents = studentList.filter(s => s.classId === selectedClassId || !s.classId);
      setStudents(filteredStudents);

      const stateMap: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
      filteredStudents.forEach(s => {
        const found = existingRecords.find(r => r.studentId === s.id);
        stateMap[s.id] = found ? found.status : 'present';
      });
      setAttendanceState(stateMap);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBulkSet = (status: 'present' | 'absent' | 'late' | 'excused') => {
    const newMap: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach(s => {
      newMap[s.id] = status;
    });
    setAttendanceState(newMap);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo || '101',
        classId: selectedClassId,
        date: selectedDate,
        status: attendanceState[s.id] || 'present'
      }));

      await api.saveBulkAttendance(recordsToSave);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" /> Daily Attendance Management
          </h2>
          <p className="text-xs text-slate-500">Record daily attendance, bulk mark status, and review attendance logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Live QR Attendance</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance Log'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Attendance records saved successfully for {selectedDate}!
        </div>
      )}

      {/* Class & Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-900"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}-{c.section} ({c.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Bulk Action Pills */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Quick Bulk Set:</span>
          <button
            onClick={() => handleBulkSet('present')}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkSet('absent')}
            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-medium transition"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-900 text-sm">
          Class Roster ({students.length} Students)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5 text-center">Status Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const currentStatus = attendanceState[student.id] || 'present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-800">{student.rollNo || '101'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{student.studentId || 'STU-1001'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { id: 'present', label: 'Present', color: 'bg-emerald-600 text-white', inactive: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                          { id: 'absent', label: 'Absent', color: 'bg-rose-600 text-white', inactive: 'bg-rose-50 text-rose-700 border-rose-200' },
                          { id: 'late', label: 'Late', color: 'bg-amber-500 text-white', inactive: 'bg-amber-50 text-amber-700 border-amber-200' },
                          { id: 'excused', label: 'Excused', color: 'bg-blue-600 text-white', inactive: 'bg-blue-50 text-blue-700 border-blue-200' },
                        ].map((btn) => {
                          const isSelected = currentStatus === btn.id;
                          return (
                            <button
                              key={btn.id}
                              onClick={() => handleStatusChange(student.id, btn.id as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                isSelected ? btn.color : `${btn.inactive} hover:bg-slate-100`
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Attendance Modal */}
      <QRAttendanceModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        selectedClass={classes.find((c) => c.id === selectedClassId)}
        selectedDate={selectedDate}
        students={students}
        onAttendanceUpdated={loadAttendanceData}
      />
    </div>
  );
};
