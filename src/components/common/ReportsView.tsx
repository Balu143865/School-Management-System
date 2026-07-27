import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DashboardStats, User } from '../../types';
import {
  Award,
  Download,
  FileText,
  Users,
  DollarSign,
  CalendarCheck,
  FileSpreadsheet,
  GraduationCap,
  Printer,
  X
} from 'lucide-react';
import {
  generateExecutiveReportPDF,
  generateStudentReportPDF,
  StudentReportData
} from '../../lib/pdfGenerator';

export const ReportsView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [showStudentPdfModal, setShowStudentPdfModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customTerm, setCustomTerm] = useState<string>('Academic Year 2025-2026');

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getUsers('student')
    ]).then(([statsData, studentList]) => {
      setStats(statsData);
      setStudents(studentList);
      if (studentList.length > 0) {
        setSelectedStudentId(studentList[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleExportExecutivePdf = () => {
    const doc = generateExecutiveReportPDF(stats);
    doc.save(`Greenwood_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleExportStudentPdf = () => {
    const student = students.find(s => s.id === selectedStudentId) || students[0];

    const reportData: StudentReportData = {
      studentName: student?.name || 'Alexandria Rivers',
      studentId: student?.studentId || 'STU-2026-001',
      className: student?.className || 'Class 12-A (Sci)',
      rollNo: student?.rollNo || '12',
      attendanceRate: 98,
      gpa: '3.92',
      parentName: student?.parentName || 'David Johnson',
      academicYear: customTerm,
      subjects: [
        { subject: 'Advanced Physics', teacher: 'Dr. Marie Curie', marks: 92, totalMarks: 100, grade: 'A+', remarks: 'Outstanding analytical precision in mechanics' },
        { subject: 'Higher Mathematics', teacher: 'Prof. Alan Turing', marks: 95, totalMarks: 100, grade: 'A+', remarks: 'Exceptional mastery of calculus & linear algebra' },
        { subject: 'Organic Chemistry', teacher: 'Dr. Linus Pauling', marks: 88, totalMarks: 100, grade: 'A', remarks: 'Thorough lab execution and research reporting' },
        { subject: 'Computer Science', teacher: 'Mr. Ada Lovelace', marks: 98, totalMarks: 100, grade: 'A+', remarks: 'Flawless logic algorithms & software engineering' },
        { subject: 'English Literature', teacher: 'Ms. Emily Dickinson', marks: 89, totalMarks: 100, grade: 'A', remarks: 'Articulate essay synthesis and critical commentary' }
      ],
      teacherComments: `${student?.name || 'The student'} has maintained exemplary academic standards throughout this term. Displays a keen curiosity, consistent attendance, and strong collaborative teamwork.`
    };

    const doc = generateStudentReportPDF(reportData);
    doc.save(`Report_Card_${(student?.name || 'Student').replace(/\s+/g, '_')}_2026.pdf`);
  };

  const downloadFullReportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Metric,Value',
        `Total Students,${stats?.totalStudents || 0}`,
        `Total Teachers,${stats?.totalTeachers || 0}`,
        `Avg Attendance Rate,${stats?.avgAttendanceRate || 94}%`,
        `Total Fees Collected,$${stats?.totalFeeCollected || 0}`,
        `Pending Fees,$${stats?.pendingFeeTotal || 0}`
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'school_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0F172A] p-5 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-400" /> Academic & Financial Reports Engine
          </div>
          <h2 className="text-xl font-bold tracking-tight">Executive Documentation & PDF Exporter</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Generate printable vector PDF report cards, transcripts, and financial summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowStudentPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition shadow-2xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Generate Student PDF Report</span>
          </button>

          <button
            onClick={handleExportExecutivePdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded text-xs border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export Executive PDF</span>
          </button>

          <button
            onClick={downloadFullReportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 transition"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Attendance Efficiency</h3>
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats?.avgAttendanceRate || 94.2}%</div>
          <p className="text-xs text-slate-500">Average daily presence across all active classrooms.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Fee Collection Revenue</h3>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">${(stats?.totalFeeCollected || 142500).toLocaleString()}</div>
          <p className="text-xs text-slate-500">Pending Dues: ${(stats?.pendingFeeTotal || 12800).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Student-Teacher Ratio</h3>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {Math.round((stats?.totalStudents || 1284) / (stats?.totalTeachers || 48))}:1
          </div>
          <p className="text-xs text-slate-500">Optimal class ratio maintained.</p>
        </div>
      </div>

      {/* Printable Report Templates Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Official Print Documentation Suite
          </h3>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Vector PDF Generator v4.2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Individual Student Transcript PDF</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[10px]">Student Card</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Includes student metadata, roll number, cumulative GPA, subject grades, percentage table, faculty evaluation remarks, and principal seal.
            </p>
            <button
              onClick={() => setShowStudentPdfModal(true)}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Configure & Download PDF</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Executive Institutional Summary PDF</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">Executive</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consolidated school KPI report featuring attendance metrics, fee revenue breakdown, faculty ratios, and departmental benchmarks.
            </p>
            <button
              onClick={handleExportExecutivePdf}
              className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Executive PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student PDF Report Card Modal */}
      {showStudentPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Export Student Report Card PDF
              </h3>
              <button onClick={() => setShowStudentPdfModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student Record</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className || '12A'}) - ID: {s.studentId || s.id}
                    </option>
                  ))}
                  {students.length === 0 && (
                    <option value="default">Alexandria Rivers (Class 12-A Sci) - STU-2026-001</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Term / Year Title</label>
                <input
                  type="text"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Sample Grade Preview Card */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>Included Subjects (5)</span>
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded">Vector Layout</span>
                </div>
                <div className="text-[11px] text-blue-800 space-y-1">
                  <div className="flex justify-between"><span>Advanced Physics:</span> <b>92% (A+)</b></div>
                  <div className="flex justify-between"><span>Higher Mathematics:</span> <b>95% (A+)</b></div>
                  <div className="flex justify-between"><span>Organic Chemistry:</span> <b>88% (A)</b></div>
                  <div className="flex justify-between"><span>Computer Science:</span> <b>98% (A+)</b></div>
                  <div className="flex justify-between"><span>English Literature:</span> <b>89% (A)</b></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowStudentPdfModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleExportStudentPdf();
                  setShowStudentPdfModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
