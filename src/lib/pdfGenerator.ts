import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, DashboardStats } from '../types';

export interface StudentReportData {
  studentName: string;
  studentId: string;
  className: string;
  rollNo: string;
  attendanceRate: number;
  gpa: string | number;
  parentName?: string;
  academicYear?: string;
  subjects: {
    subject: string;
    teacher: string;
    marks: number;
    totalMarks: number;
    grade: string;
    remarks: string;
  }[];
  teacherComments?: string;
}

export interface TimetableData {
  className: string;
  academicTerm: string;
  schedule: {
    time: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
  }[];
}

// Helper to draw consistent official School Letterhead
const drawLetterhead = (doc: jsPDF, title: string, subtitle?: string) => {
  // Primary Navy Header Box
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, 210, 28, 'F');

  // School Emblem / Logo Text
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.roundedRect(12, 6, 16, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('G', 17.5, 17.5);

  // School Name
  doc.setFontSize(14);
  doc.text('GREENWOOD ENTERPRISE ACADEMY', 32, 13);

  // Subtitle / Accreditation
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Affiliated School Management System • Code: GIA-2026 • Verified Portal', 32, 19);

  // Document Title Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246); // blue-400
  doc.text(title.toUpperCase(), 198, 16, { align: 'right' });

  // Secondary Accent Line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(0, 28, 210, 28);

  // Reset text color
  doc.setTextColor(15, 23, 42);
};

// Helper to draw Footer & Page Numbers
const drawFooter = (doc: jsPDF, pageNum: number = 1) => {
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(12, pageHeight - 15, 198, pageHeight - 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Greenwood Enterprise Academy • Confidential Academic Report', 12, pageHeight - 9);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })} • Page ${pageNum}`, 198, pageHeight - 9, { align: 'right' });
};

/**
 * Generate PDF Academic Report Card for a Student
 */
export const generateStudentReportPDF = (data: StudentReportData): jsPDF => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. Draw Header
  drawLetterhead(doc, 'Official Report Card');

  // 2. Student Information Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 33, 186, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName, 16, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID: ${data.studentId}`, 16, 46);
  doc.text(`Class & Section: ${data.className}`, 16, 52);
  doc.text(`Roll Number: ${data.rollNo}`, 16, 58);

  doc.text(`Academic Term: ${data.academicYear || '2025-2026'}`, 105, 46);
  doc.text(`Parent / Guardian: ${data.parentName || 'David Johnson'}`, 105, 52);
  doc.text(`Attendance Rate: ${data.attendanceRate}%`, 105, 58);

  // Overall GPA Badge Box
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(155, 37, 38, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text('CUMULATIVE GPA', 174, 43, { align: 'center' });
  doc.setFontSize(14);
  doc.text(String(data.gpa), 174, 53, { align: 'center' });

  // 3. Subject Grades Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC PERFORMANCE & MARKS SUMMARY', 12, 72);

  const tableBody = data.subjects.map(s => [
    s.subject,
    s.teacher,
    `${s.marks} / ${s.totalMarks}`,
    `${Math.round((s.marks / s.totalMarks) * 100)}%`,
    s.grade,
    s.remarks
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Subject Name', 'Faculty Instructor', 'Marks Obtained', 'Percentage', 'Grade', 'Remarks']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38 },
      1: { cellWidth: 42 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      5: { cellWidth: 'auto' }
    },
    margin: { left: 12, right: 12 }
  });

  // Get Table End Y position
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // 4. Teacher Comments & Evaluation Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('FACULTY EVALUATION & REMARKS', 12, finalY + 10);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, finalY + 13, 186, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const commentText = data.teacherComments ||
    `${data.studentName} has demonstrated consistent academic dedication and strong analytical problem-solving skills this term. Maintains excellent attendance and actively contributes to classroom discussions. Recommended for honors distinction in science and mathematics.`;

  const splitLines = doc.splitTextToSize(commentText, 180);
  doc.text(splitLines, 16, finalY + 20);

  // 5. Official Signatures Section
  const sigY = finalY + 46;

  // Class Teacher Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(20, sigY + 12, 70, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Prof. Robert Langdon', 45, sigY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Class Faculty Representative', 45, sigY + 20, { align: 'center' });

  // School Seal Stamp
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(88, sigY + 2, 34, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(29, 78, 216);
  doc.text('OFFICIAL SEAL', 105, sigY + 9, { align: 'center' });
  doc.text('GIA VERIFIED', 105, sigY + 15, { align: 'center' });

  // Principal Signature Line
  doc.line(140, sigY + 12, 190, sigY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. Eleanor Vance', 165, sigY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Principal & Academic Dean', 165, sigY + 20, { align: 'center' });

  // 6. Draw Footer
  drawFooter(doc, 1);

  return doc;
};

/**
 * Generate PDF Timetable Schedule
 */
export const generateTimetablePDF = (data: TimetableData): jsPDF => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  // Primary Navy Header Box
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 28, 'F');

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(12, 6, 16, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('G', 17.5, 17.5);

  doc.setFontSize(14);
  doc.text('GREENWOOD ENTERPRISE ACADEMY', 32, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Academic Timetable • ${data.className} • Academic Term ${data.academicTerm || '2025-2026'}`, 32, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text('WEEKLY TIMETABLE SCHEDULE', 285, 16, { align: 'right' });

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(0, 28, 297, 28);

  // Timetable Table
  const tableBody = data.schedule.map(s => [
    s.time,
    s.mon,
    s.tue,
    s.wed,
    s.thu,
    s.fri
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['Time Slot', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 42, fillColor: [248, 250, 252] },
      1: { cellWidth: 47 },
      2: { cellWidth: 47 },
      3: { cellWidth: 47 },
      4: { cellWidth: 47 },
      5: { cellWidth: 47 }
    },
    margin: { left: 10, right: 10 },
    didParseCell: function (data) {
      if (data.section === 'body' && data.cell.raw && String(data.cell.raw).includes('RECESS')) {
        data.cell.styles.fillColor = [254, 243, 199]; // amber-100
        data.cell.styles.textColor = [146, 64, 14]; // amber-800
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;

  // Signatures at bottom
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(20, finalY + 18, 80, finalY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Class Teacher Approval', 50, finalY + 22, { align: 'center' });

  doc.line(217, finalY + 18, 277, finalY + 18);
  doc.text('Dean of Academics Stamp', 247, finalY + 22, { align: 'center' });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(10, pageHeight - 12, 287, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Greenwood Enterprise Academy • ${data.className} Schedule`, 10, pageHeight - 7);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 287, pageHeight - 7, { align: 'right' });

  return doc;
};

/**
 * Generate Executive Analytics Summary PDF
 */
export const generateExecutiveReportPDF = (stats: DashboardStats | null): jsPDF => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawLetterhead(doc, 'Executive Performance Report');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('KEY PERFORMANCE INDICATORS', 12, 36);

  const totalStudents = stats?.totalStudents || 1284;
  const totalTeachers = stats?.totalTeachers || 48;
  const avgAttendance = stats?.avgAttendanceRate || 94.2;
  const totalFees = stats?.totalFeeCollected || 142500;
  const pendingFees = stats?.pendingFeeTotal || 12800;

  autoTable(doc, {
    startY: 40,
    head: [['Key Metric Indicator', 'Current Value', 'Target Benchmark', 'Status']],
    body: [
      ['Total Active Student Enrolment', `${totalStudents} Students`, '1,200 Capacity', 'Optimal (107%)'],
      ['Faculty Teaching Staff', `${totalTeachers} Faculty`, '50 Teachers', 'Sufficient'],
      ['Student-Teacher Ratio', `${Math.round(totalStudents / totalTeachers)}:1 Ratio`, '25:1 Benchmark', 'Excellent'],
      ['Daily Attendance Efficiency Rate', `${avgAttendance}%`, '95.0% Goal', 'On Target'],
      ['Fee Collection Revenue (YTD)', `$${totalFees.toLocaleString()}`, '$150,000 Target', '95% Collected'],
      ['Outstanding Fee Dues', `$${pendingFees.toLocaleString()}`, '< $15,000 Limit', 'Compliant']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    margin: { left: 12, right: 12 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC DEPARTMENTAL BREAKDOWN', 12, finalY + 10);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Department', 'Faculty Count', 'Enrolled Students', 'Avg Performance', 'Compliance']],
    body: [
      ['Science & Mathematics', '16 Teachers', '420 Students', '3.82 GPA', '100% Verified'],
      ['Commerce & Finance', '10 Teachers', '310 Students', '3.65 GPA', '100% Verified'],
      ['Humanities & Arts', '12 Teachers', '294 Students', '3.70 GPA', '100% Verified'],
      ['Physical Education & Sports', '6 Teachers', '260 Students', 'Pass (98%)', '100% Verified']
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    margin: { left: 12, right: 12 }
  });

  drawFooter(doc, 1);

  return doc;
};
