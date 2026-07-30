import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, DashboardStats, StudyMaterial } from '../types';

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
  doc.text('Dr. Balu Naik, B. Tech', 165, sigY + 16, { align: 'center' });
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

/**
 * Generate PDF Study Material Document with relative subject content
 */
export const generateStudyMaterialPDF = (mat: StudyMaterial): jsPDF => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. Draw Official Header
  drawLetterhead(doc, 'Study Resource');

  // 2. Resource Banner Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 32, 186, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(mat.title, 16, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(mat.description || 'Official academic learning resource provided by faculty.', 16, 47, { maxWidth: 178 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(124, 58, 237); // purple
  doc.text(`Subject: ${mat.subjectName} | Category: ${mat.category} | Class: ${mat.className || 'Class 10-A'}`, 16, 55);

  // 3. Resource Metadata Table
  autoTable(doc, {
    startY: 63,
    head: [['Attribute', 'Details', 'Author / Faculty', 'Upload Date']],
    body: [
      ['Resource Title', mat.title, mat.uploadedBy || 'Faculty Member', mat.uploadDate || '2026-07-28'],
      ['Subject & Grade', `${mat.subjectName} (${mat.className || 'Class 10-A'})`, 'Greenwood Academy', 'Verified Resource'],
      ['Document Format', `${mat.category} (${mat.fileName || 'Resource.pdf'})`, 'Academic Repository', 'Active Distribution']
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237], // Purple
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

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Relative Content Table according to Subject
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('KEY SYLLABUS CONCEPTS & FORMULA REFERENCE', 12, currentY);

  const subject = (mat.subjectName || '').toLowerCase();
  let tableHead = [['Topic / Concept', 'Formula / Key Principle', 'Application / Usage Notes']];
  let tableBody: string[][] = [];

  if (subject.includes('math')) {
    tableBody = [
      ['Quadratic Formula', 'x = (-b ± √(b² - 4ac)) / 2a', 'Solves standard ax² + bx + c = 0 equations.'],
      ['Polynomial Theorem', 'P(x) = (x - a)Q(x) + R', 'Remainder theorem for polynomial division.'],
      ['Logarithm Rules', 'log(ab) = log(a) + log(b)', 'Simplifies exponential product calculations.'],
      ['Pythagorean Identity', 'sin²(θ) + cos²(θ) = 1', 'Fundamental trigonometric identity.'],
      ['Arithmetic Progression', 'a_n = a_1 + (n - 1)d', 'Calculates the nth term of a linear sequence.']
    ];
  } else if (subject.includes('physic')) {
    tableBody = [
      ['First Equation of Motion', 'v = u + at', 'Relates final velocity, initial velocity, acceleration, time.'],
      ['Second Equation of Motion', 's = ut + ½at²', 'Calculates displacement with constant acceleration.'],
      ['Newton\'s Second Law', 'F = ma', 'Force equals mass multiplied by acceleration.'],
      ['Kinetic Energy', 'KE = ½mv²', 'Energy possessed by an object due to motion.'],
      ['Ohm\'s Law', 'V = IR', 'Voltage equals current multiplied by resistance.']
    ];
  } else if (subject.includes('chemist')) {
    tableBody = [
      ['Ideal Gas Law', 'PV = nRT', 'Relates pressure, volume, moles, and temperature.'],
      ['Molarity Formula', 'M = Moles of Solute / Liters of Solution', 'Concentration measurement in aqueous solutions.'],
      ['pH Definition', 'pH = -log[H+]', 'Measures acidity or alkalinity of solutions.'],
      ['Stoichiometry Ratio', 'aA + bB → cC + dD', 'Calculates reactant-product mole conversions.'],
      ['Alkanes Formula', 'C_n H_(2n+2)', 'General formula for saturated hydrocarbons.']
    ];
  } else if (subject.includes('bio')) {
    tableBody = [
      ['Mitochondria Function', 'ATP Synthesis via Cellular Respiration', 'Powerhouse of the cell generating metabolic energy.'],
      ['DNA Replication', 'Adenine-Thymine, Cytosine-Guanine', 'Base pairing rules for double-helix replication.'],
      ['Photosynthesis Reaction', '6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂', 'Converts solar energy into chemical glucose energy.'],
      ['Mendel\'s Monohybrid Ratio', '3:1 Phenotypic Ratio in F2 Generation', 'Dominant vs recessive single-trait inheritance.'],
      ['Mitosis Stages', 'Prophase → Metaphase → Anaphase → Telophase', 'Somatic cell division producing identical daughter cells.']
    ];
  } else if (subject.includes('computer') || subject.includes('coding') || subject.includes('python')) {
    tableBody = [
      ['Array / List Lookup', 'O(1) Time Complexity', 'Direct index access in memory.'],
      ['Binary Search', 'O(log N) Time Complexity', 'Dividing sorted search space repeatedly.'],
      ['Queue Structure', 'FIFO (First-In, First-Out)', 'Used in task scheduling and messaging buffers.'],
      ['Stack Structure', 'LIFO (Last-In, First-Out)', 'Used in call stack execution & recursion.'],
      ['Recursion Requirement', 'Base Case + Recursive Step', 'Prevents infinite call loops.']
    ];
  } else {
    tableBody = [
      ['Core Concept 1', 'Fundamental Principles & Definitions', 'Key foundation for chapter examination.'],
      ['Core Concept 2', 'Structured Framework & Analytical Method', 'Applied in problem solving.'],
      ['Core Concept 3', 'Practical Example Application', 'Observed in real-world scenarios.'],
      ['Core Concept 4', 'Synthesis & Critical Questions', 'Tested in past board examinations.']
    ];
  }

  autoTable(doc, {
    startY: currentY + 4,
    head: tableHead,
    body: tableBody,
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

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. Practice & Revision Exercises
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('PRACTICE & SELF-ASSESSMENT QUESTIONS', 12, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Q#', 'Question Description', 'Target Marks', 'Suggested Approach']],
    body: [
      ['Q1', `Explain the core principles of ${mat.title} with a neat diagram or step-by-step derivation.`, '5 Marks', 'Detail definitions, formulas, and state assumptions.'],
      ['Q2', `Solve the numerical problem: Apply the formulas listed above for ${mat.subjectName} to solve for unknown variables.`, '4 Marks', 'Substitute given values into standard equation.'],
      ['Q3', `Contrast and compare the key mechanisms outlined in this ${mat.category.toLowerCase()} document.`, '3 Marks', 'List 3 distinct point-by-point differences.']
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

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Sign-off box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, currentY, 186, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED ACADEMIC RESOURCE', 16, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Authorized by: ${mat.uploadedBy || 'Prof. Robert Langdon'} • Greenwood Enterprise Academy Academic Board`, 16, currentY + 13);

  drawFooter(doc, 1);

  return doc;
};

export interface AttendanceSummaryReportData {
  className: string;
  roomNumber: string;
  classTeacherName: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  remarks?: string;
  records: {
    rollNo: string;
    studentName: string;
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
  }[];
}

/**
 * Generate PDF Daily Classroom Attendance Summary Report
 */
export const generateAttendanceSummaryPDF = (data: AttendanceSummaryReportData): jsPDF => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. Draw Header
  drawLetterhead(doc, 'Daily Attendance Summary');

  // 2. Class Summary Meta Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 32, 186, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Daily Attendance Summary: ${data.className}`, 16, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Classroom: Room ${data.roomNumber || 'N/A'}  |  Class Teacher: ${data.classTeacherName || 'Faculty In-Charge'}`, 16, 46);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text(`Attendance Date: ${data.date}  |  Overall Attendance Rate: ${data.attendanceRate.toFixed(1)}%`, 16, 52);

  // 3. Key Metrics Table
  autoTable(doc, {
    startY: 61,
    head: [['Total Enrolled', 'Present', 'Absent', 'Late', 'Excused', 'Attendance Rate']],
    body: [
      [
        `${data.totalStudents} Students`,
        `${data.presentCount} (${((data.presentCount / (data.totalStudents || 1)) * 100).toFixed(0)}%)`,
        `${data.absentCount} (${((data.absentCount / (data.totalStudents || 1)) * 100).toFixed(0)}%)`,
        `${data.lateCount} (${((data.lateCount / (data.totalStudents || 1)) * 100).toFixed(0)}%)`,
        `${data.excusedCount} (${((data.excusedCount / (data.totalStudents || 1)) * 100).toFixed(0)}%)`,
        `${data.attendanceRate.toFixed(1)}%`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      halign: 'center'
    },
    margin: { left: 12, right: 12 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Student Attendance Roll List Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CLASSROOM ROLL CALL ROSTER', 12, currentY);

  const tableBody = data.records.map(r => [
    r.rollNo || '-',
    r.studentName,
    r.studentId || '-',
    r.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Roll No', 'Student Name', 'Student ID', 'Attendance Status']],
    body: tableBody,
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
    didParseCell: (didParseData) => {
      if (didParseData.section === 'body' && didParseData.column.index === 3) {
        const val = didParseData.cell.raw as string;
        if (val === 'PRESENT') {
          didParseData.cell.styles.textColor = [16, 185, 129];
          didParseData.cell.styles.fontStyle = 'bold';
        } else if (val === 'ABSENT') {
          didParseData.cell.styles.textColor = [225, 29, 72];
          didParseData.cell.styles.fontStyle = 'bold';
        } else if (val === 'LATE') {
          didParseData.cell.styles.textColor = [217, 119, 6];
          didParseData.cell.styles.fontStyle = 'bold';
        } else if (val === 'EXCUSED') {
          didParseData.cell.styles.textColor = [37, 99, 235];
          didParseData.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 12, right: 12 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Summary remarks if available
  if (data.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('TEACHER / FACULTY REMARKS:', 12, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(data.remarks, 12, currentY + 5, { maxWidth: 186 });

    currentY += 14;
  }

  // Sign-off verification
  if (currentY + 22 > 270) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, currentY, 186, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL ACADEMIC ATTENDANCE AUDIT', 16, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Recorded By: ${data.classTeacherName || 'Class Teacher'} • Greenwood Enterprise Academy Student Affairs`, 16, currentY + 12);

  drawFooter(doc, 1);

  return doc;
};
