import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Printer,
  UserPlus,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Upload,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Search,
  Building2,
  FileText
} from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { IDCardTemplate } from './IDCardTemplate';
import { generateIdCardPDF } from '../../lib/pdfGenerator';

const DEMO_STUDENTS: User[] = [
  {
    id: '1001',
    name: 'Alex Johnson',
    email: 'alex.j@bnia.edu.in',
    role: 'student',
    studentId: 'STU-2026-1001',
    className: 'Class 10-A',
    rollNo: '101',
    phone: '+91 98765 43210',
    parentName: 'Robert Johnson',
    dateOfBirth: '2010-05-14',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '1002',
    name: 'Sophia Patel',
    email: 'sophia.p@bnia.edu.in',
    role: 'student',
    studentId: 'STU-2026-1002',
    className: 'Class 10-A',
    rollNo: '102',
    phone: '+91 98765 43211',
    parentName: 'Dev Patel',
    dateOfBirth: '2010-08-22',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '1003',
    name: 'Marcus Chen',
    email: 'marcus.c@bnia.edu.in',
    role: 'student',
    studentId: 'STU-2026-1003',
    className: 'Class 9-B',
    rollNo: '205',
    phone: '+91 98765 43212',
    parentName: 'Wei Chen',
    dateOfBirth: '2011-03-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  }
];

const DEMO_TEACHERS: User[] = [
  {
    id: '2001',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.j@bnia.edu.in',
    role: 'teacher',
    className: 'Class 10-A Supervisor',
    subject: 'Mathematics & Quantum Physics',
    phone: '+91 63040 45279',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2002',
    name: 'Prof. Rajesh Sharma',
    email: 'rajesh.s@bnia.edu.in',
    role: 'teacher',
    className: 'Senior Secondary HOD',
    subject: 'Chemistry & Biology',
    phone: '+91 94401 22334',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
  }
];

export const IDCardStudioView: React.FC = () => {
  const { schoolSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<'custom' | 'students' | 'teachers'>('custom');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating custom ID card
  const [formData, setFormData] = useState<User>({
    id: `CUSTOM-${Date.now().toString().slice(-4)}`,
    name: 'Alexandria Rivers',
    email: 'alex.rivers@bnia.edu.in',
    role: 'student',
    studentId: 'STU-2026-1084',
    className: 'Class 10-A',
    rollNo: '04',
    subject: 'Mathematics & Science',
    phone: '+91 63040 45279',
    parentName: 'David Rivers',
    dateOfBirth: '2010-05-14',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  });

  const [customSchoolName, setCustomSchoolName] = useState(schoolSettings?.name || 'BN International Academy');
  const [customPrincipal, setCustomPrincipal] = useState(schoolSettings?.principalName || 'Dr. Balu Naik, B. Tech');

  // Selected existing user for preview in Students / Teachers tab
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setFormData(prev => ({
      ...prev,
      role,
      studentId: role === 'teacher' ? `FAC-2026-${Date.now().toString().slice(-3)}` : `STU-2026-${Date.now().toString().slice(-4)}`,
      className: role === 'teacher' ? 'Senior Secondary' : 'Class 10-A'
    }));
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormData(prev => ({ ...prev, avatar: uploadEvent.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPreviewPerson = (activeTab === 'students' || activeTab === 'teachers') && selectedUser
    ? selectedUser
    : formData;

  const filteredStudents = DEMO_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.className && s.className.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeachers = DEMO_TEACHERS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBatchDownloadAll = (list: User[]) => {
    list.forEach((person, index) => {
      setTimeout(() => {
        const doc = generateIdCardPDF(person, {
          schoolName: customSchoolName,
          principalName: customPrincipal,
          phone: person.phone || '+91 63040 45279'
        });
        const roleLabel = person.role === 'teacher' ? 'Faculty' : 'Student';
        doc.save(`${person.name.replace(/\s+/g, '_')}_${roleLabel}_ID_Card.pdf`);
      }, index * 300);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600/30 border border-indigo-400/30 rounded-xl text-indigo-400">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Official ID Card Studio & Generator
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Design, customize, preview, and issue high-security digital & printable ID Cards with encrypted QR codes for Students and Faculty.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('custom'); setSelectedUser(null); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Custom ID</span>
          </button>

          <button
            onClick={() => { setActiveTab('students'); setSelectedUser(DEMO_STUDENTS[0]); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Cards</span>
          </button>

          <button
            onClick={() => { setActiveTab('teachers'); setSelectedUser(DEMO_TEACHERS[0]); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Cards</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Creator Controls + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creator Form or Roster List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>ID Card Configuration</span>
                </h3>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Live Builder
                </span>
              </div>

              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`py-2 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                    formData.role === 'student'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student ID Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`py-2 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                    formData.role === 'teacher'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Faculty ID Pass</span>
                </button>
              </div>

              {/* Input Fields Grid */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Alexandria Rivers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.studentId || ''}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. STU-2026-1084"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      {formData.role === 'teacher' ? 'Class Assigned' : 'Class & Section'}
                    </label>
                    <input
                      type="text"
                      value={formData.className || ''}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Class 10-A"
                    />
                  </div>
                </div>

                {formData.role === 'teacher' ? (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Subject Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.subject || ''}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Mathematics & Quantum Physics"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.rollNo || ''}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. 04"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Parent / Guardian
                      </label>
                      <input
                        type="text"
                        value={formData.parentName || ''}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. David Rivers"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+91 63040 45279"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Profile Photo / Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-[11px]"
                      placeholder="Paste image URL..."
                    />
                    <label className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl font-bold hover:bg-indigo-100 transition cursor-pointer shrink-0 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Custom Institutional Header */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Institutional Branding
                  </span>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-[11px] mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'students' || activeTab === 'teachers') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Select {activeTab === 'students' ? 'Student' : 'Faculty Member'}</span>
                </h3>
                <button
                  onClick={() => handleBatchDownloadAll(activeTab === 'students' ? DEMO_STUDENTS : DEMO_TEACHERS)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 cursor-pointer"
                  title="Generate & Download All ID Cards as PDF"
                >
                  <Download className="w-3 h-3" />
                  <span>Download All</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              {/* Roster Item List */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {(activeTab === 'students' ? filteredStudents : filteredTeachers).map((person) => {
                  const isSelected = selectedUser?.id === person.id;
                  return (
                    <button
                      key={person.id}
                      onClick={() => setSelectedUser(person)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {person.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {person.studentId || person.className} • {person.role === 'teacher' ? person.subject : person.className}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High Fidelity Printable ID Card Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Real-Time Printable Card Canvas</span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Standard CR80 3.375" x 2.125" ID Card Layout with embedded encrypted QR code.
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                {currentPreviewPerson.role === 'teacher' ? 'FACULTY PASS' : 'STUDENT PASS'}
              </span>
            </div>

            {/* Render ID Card Template */}
            <IDCardTemplate
              person={currentPreviewPerson}
              schoolSettings={{
                name: customSchoolName,
                principalName: customPrincipal
              }}
              showControls={true}
              showBackSide={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
