import fs from 'fs';
import path from 'path';
import {
  User,
  SchoolSettings,
  ClassRoom,
  Subject,
  AttendanceRecord,
  FeeRecord,
  Homework,
  HomeworkSubmission,
  Exam,
  ExamResult,
  TimetableSlot,
  Notice,
  StudyMaterial,
  ChatMessage,
  CalendarEvent,
  AuditLogEntry,
  DashboardStats,
  NotificationLog,
  Book,
  BookBorrowing
} from '../src/types.js';

// In-Memory store with local JSON backup persistence
const DATA_FILE = path.join(process.cwd(), 'school_data.json');

export interface DBData {
  schoolSettings: SchoolSettings;
  users: User[];
  classes: ClassRoom[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  homework: Homework[];
  submissions: HomeworkSubmission[];
  exams: Exam[];
  examResults: ExamResult[];
  timetable: TimetableSlot[];
  notices: Notice[];
  studyMaterials: StudyMaterial[];
  messages: ChatMessage[];
  calendarEvents?: CalendarEvent[];
  auditLogs?: AuditLogEntry[];
  notificationLogs?: NotificationLog[];
  books?: Book[];
  borrowings?: BookBorrowing[];
}


const DEFAULT_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: "notif-101",
    type: "fee_reminder",
    channel: "SMS_AND_EMAIL",
    recipientId: "u-parent-1",
    recipientName: "David Rivers",
    recipientPhone: "+1 (555) 234-5678",
    recipientEmail: "david.rivers@example.com",
    studentName: "Alexandria Rivers",
    title: "Fee Deadline Reminder: Term 1 Tuition Fee",
    message: "Dear David Rivers, friendly reminder that Term 1 Tuition Fee ($1,200.00) for Alexandria Rivers is due on 2026-08-10. Pay easily via Greenwood Student Portal.",
    sentAt: "2026-07-26T14:30:00.000Z",
    status: "delivered",
    triggeredBy: "Automated Fee Trigger (Scheduled Cron)",
    metadata: {
      feeId: "fee-1",
      amount: 1200,
      dueDate: "2026-08-10"
    }
  },
  {
    id: "notif-102",
    type: "exam_schedule",
    channel: "SMS_AND_EMAIL",
    recipientId: "u-parent-2",
    recipientName: "Sarah Chen",
    recipientPhone: "+1 (555) 345-6789",
    recipientEmail: "sarah.chen@example.com",
    studentName: "Marcus Chen",
    title: "Upcoming Exam Notice: Midterm Mathematics",
    message: "Dear Parent, Midterm Mathematics Exam for Class 10-A is scheduled on 2026-08-15 at 09:00 AM (Duration: 90 mins). Total marks: 100. Please ensure timely preparation.",
    sentAt: "2026-07-25T10:15:00.000Z",
    status: "delivered",
    triggeredBy: "Teacher Dr. Eleanor Vance",
    metadata: {
      examId: "exam-101",
      examDate: "2026-08-15",
      subjectName: "Mathematics"
    }
  },
  {
    id: "notif-103",
    type: "fee_reminder",
    channel: "SMS",
    recipientId: "u-parent-3",
    recipientName: "Robert Taylor",
    recipientPhone: "+1 (555) 456-7890",
    recipientEmail: "robert.taylor@example.com",
    studentName: "Sophia Taylor",
    title: "Library & Annual Activity Fee Reminder",
    message: "Greenwood Academy Alert: Library & Activity Fee ($350.00) for Sophia Taylor is due on 2026-08-05. Please log in to complete payment.",
    sentAt: "2026-07-24T16:00:00.000Z",
    status: "delivered",
    triggeredBy: "Admin Portal Bulk Trigger",
    metadata: {
      feeId: "fee-2",
      amount: 350,
      dueDate: "2026-08-05"
    }
  }
];

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: "2026-07-26T18:45:00.000Z",
    action: "USER_LOGIN",
    category: "auth",
    userId: "u-admin",
    userName: "Dr. Eleanor Vance",
    userRole: "admin",
    ipAddress: "192.168.1.45",
    details: "Administrator logged in successfully via Secure Single Sign-On",
    targetEntity: "Session Token #9823",
    status: "success"
  },
  {
    id: "log-102",
    timestamp: "2026-07-26T17:30:12.000Z",
    action: "STUDENT_UPDATED",
    category: "student",
    userId: "u-admin",
    userName: "Dr. Eleanor Vance",
    userRole: "admin",
    ipAddress: "192.168.1.45",
    details: "Updated emergency contact & section placement for Alexandria Rivers",
    targetEntity: "Student: Alexandria Rivers (STU-2026-001)",
    status: "info"
  },
  {
    id: "log-103",
    timestamp: "2026-07-26T16:15:22.000Z",
    action: "SETTING_CHANGED",
    category: "settings",
    userId: "u-admin",
    userName: "Dr. Eleanor Vance",
    userRole: "admin",
    ipAddress: "192.168.1.45",
    details: "Updated Academic Year config to 2025-2026 & enabled OTP Two-Factor Verification",
    targetEntity: "School Configuration Settings",
    status: "warning"
  },
  {
    id: "log-104",
    timestamp: "2026-07-26T15:10:05.000Z",
    action: "FEE_RECORD_CREATED",
    category: "finance",
    userId: "u-admin",
    userName: "Dr. Eleanor Vance",
    userRole: "admin",
    ipAddress: "192.168.1.88",
    details: "Recorded partial payment $1,250 via Credit Card for Term 1 Tuition Fee",
    targetEntity: "Receipt #RCP-2026-104 (Student: Marcus Chen)",
    status: "success"
  },
  {
    id: "log-105",
    timestamp: "2026-07-26T14:00:00.000Z",
    action: "EXAM_GRADED",
    category: "academic",
    userId: "u-teacher1",
    userName: "Prof. Sarah Jenkins",
    userRole: "teacher",
    ipAddress: "192.168.1.102",
    details: "Submitted grade report cards for Physics Midterm Assessment (Class 10-A)",
    targetEntity: "Exam: Physics Midterm Assessment",
    status: "success"
  },
  {
    id: "log-106",
    timestamp: "2026-07-26T12:20:45.000Z",
    action: "CALENDAR_EVENT_ADDED",
    category: "system",
    userId: "u-admin",
    userName: "Dr. Eleanor Vance",
    userRole: "admin",
    ipAddress: "192.168.1.45",
    details: "Published Annual Science & Technology Fair to Greenwood Shared Calendar",
    targetEntity: "Calendar Event #cal-178502",
    status: "info"
  },
  {
    id: "log-107",
    timestamp: "2026-07-26T10:05:18.000Z",
    action: "FAILED_LOGIN_ATTEMPT",
    category: "auth",
    userId: "unknown",
    userName: "Unregistered User",
    userRole: "student",
    ipAddress: "203.0.113.195",
    details: "Failed authentication attempt with invalid credentials for 'admin_temp'",
    targetEntity: "Authentication Gateway",
    status: "error"
  }
];

const DEFAULT_SETTINGS: SchoolSettings = {
  name: "Greenwood International Academy",
  code: "GIA-2026",
  tagline: "Excellence in Education & Character Building",
  address: "123 Academic Blvd, Innovation City, CA 90210",
  phone: "+1 (555) 234-5678",
  email: "contact@greenwood.edu",
  academicYear: "2025-2026",
  logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=200&q=80",
  principalName: "Dr. Eleanor Vance",
  isOtpVerified: true
};

const DEFAULT_USERS: User[] = [
  {
    id: "u-admin",
    name: "Dr. Eleanor Vance",
    email: "admin@school.com",
    role: "admin",
    phone: "+1 555-0100",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    address: "Admin Residence, Campus Road"
  },
  {
    id: "u-teacher1",
    name: "Prof. Robert Langdon",
    email: "teacher@school.com",
    role: "teacher",
    phone: "+1 555-0101",
    classId: "c-10a",
    className: "Class 10-A",
    subject: "Mathematics & Physics",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "u-teacher2",
    name: "Ms. Sarah Jenkins",
    email: "sarah.teacher@school.com",
    role: "teacher",
    phone: "+1 555-0102",
    classId: "c-10b",
    className: "Class 10-B",
    subject: "English Literature",
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "u-student1",
    name: "Alex Johnson",
    email: "student@school.com",
    role: "student",
    phone: "+1 555-0103",
    studentId: "STU-1001",
    classId: "c-10a",
    className: "Class 10-A",
    rollNo: "101",
    gender: "male",
    dateOfBirth: "2010-05-14",
    admissionDate: "2021-08-15",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "u-student2",
    name: "Sophia Martinez",
    email: "sophia.student@school.com",
    role: "student",
    phone: "+1 555-0104",
    studentId: "STU-1002",
    classId: "c-10a",
    className: "Class 10-A",
    rollNo: "102",
    gender: "female",
    dateOfBirth: "2010-09-21",
    admissionDate: "2021-08-15",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "u-parent1",
    name: "David Johnson",
    email: "parent@school.com",
    role: "parent",
    phone: "+1 555-0105",
    childStudentId: "u-student1",
    childName: "Alex Johnson",
    address: "42 Elm Street, Innovation City",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  }
];

const DEFAULT_CLASSES: ClassRoom[] = [
  { id: "c-10a", name: "Class 10", section: "A", classTeacherId: "u-teacher1", classTeacherName: "Prof. Robert Langdon", roomNumber: "Room 101", studentCount: 32 },
  { id: "c-10b", name: "Class 10", section: "B", classTeacherId: "u-teacher2", classTeacherName: "Ms. Sarah Jenkins", roomNumber: "Room 102", studentCount: 30 },
  { id: "c-9a", name: "Class 9", section: "A", classTeacherId: "u-teacher1", classTeacherName: "Prof. Robert Langdon", roomNumber: "Room 201", studentCount: 28 }
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-1", name: "Mathematics", code: "MATH-10", classId: "c-10a", className: "Class 10-A", teacherId: "u-teacher1", teacherName: "Prof. Robert Langdon" },
  { id: "sub-2", name: "Physics", code: "PHY-10", classId: "c-10a", className: "Class 10-A", teacherId: "u-teacher1", teacherName: "Prof. Robert Langdon" },
  { id: "sub-3", name: "English Literature", code: "ENG-10", classId: "c-10a", className: "Class 10-A", teacherId: "u-teacher2", teacherName: "Ms. Sarah Jenkins" }
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  { id: "att-1", studentId: "u-student1", studentName: "Alex Johnson", rollNo: "101", classId: "c-10a", date: today, status: "present", remarks: "On time" },
  { id: "att-2", studentId: "u-student2", studentName: "Sophia Martinez", rollNo: "102", classId: "c-10a", date: today, status: "present", remarks: "On time" },
  { id: "att-3", studentId: "u-student1", studentName: "Alex Johnson", rollNo: "101", classId: "c-10a", date: yesterday, status: "present", remarks: "Active participation" },
  { id: "att-4", studentId: "u-student2", studentName: "Sophia Martinez", rollNo: "102", classId: "c-10a", date: yesterday, status: "late", remarks: "Arrived 10 min late" }
];

const DEFAULT_FEES: FeeRecord[] = [
  { id: "fee-1", studentId: "u-student1", studentName: "Alex Johnson", classId: "c-10a", className: "Class 10-A", title: "Term 1 Tuition Fee", category: "Tuition", totalAmount: 1200, paidAmount: 1200, dueDate: "2026-06-30", status: "paid", paymentDate: "2026-06-15", receiptNo: "REC-9941" },
  { id: "fee-2", studentId: "u-student1", studentName: "Alex Johnson", classId: "c-10a", className: "Class 10-A", title: "Term 2 Tuition Fee", category: "Tuition", totalAmount: 1200, paidAmount: 600, dueDate: "2026-08-15", status: "partial", paymentDate: "2026-07-01", receiptNo: "REC-9980" },
  { id: "fee-3", studentId: "u-student2", studentName: "Sophia Martinez", classId: "c-10a", className: "Class 10-A", title: "Term 2 Tuition Fee", category: "Tuition", totalAmount: 1200, paidAmount: 0, dueDate: "2026-08-15", status: "pending" },
  { id: "fee-4", studentId: "u-student1", studentName: "Alex Johnson", classId: "c-10a", className: "Class 10-A", title: "Annual Lab & Computer Fee", category: "Laboratory", totalAmount: 250, paidAmount: 250, dueDate: "2026-05-10", status: "paid", paymentDate: "2026-05-02", receiptNo: "REC-9812" }
];

const DEFAULT_HOMEWORK: Homework[] = [
  { id: "hw-1", title: "Quadratic Equations Problem Set", description: "Solve questions 1 through 15 on Page 142. Show all step-by-step working clearly.", classId: "c-10a", className: "Class 10-A", subjectId: "sub-1", subjectName: "Mathematics", teacherId: "u-teacher1", teacherName: "Prof. Robert Langdon", assignedDate: "2026-07-24", dueDate: "2026-07-28", totalMarks: 20 },
  { id: "hw-2", title: "Newton's Laws Essay & Analysis", description: "Write a 500-word analysis on real-world applications of Newton's Third Law in space rocketry.", classId: "c-10a", className: "Class 10-A", subjectId: "sub-2", subjectName: "Physics", teacherId: "u-teacher1", teacherName: "Prof. Robert Langdon", assignedDate: "2026-07-22", dueDate: "2026-07-29", totalMarks: 25 }
];

const DEFAULT_SUBMISSIONS: HomeworkSubmission[] = [
  { id: "sub-101", homeworkId: "hw-1", studentId: "u-student1", studentName: "Alex Johnson", submittedAt: "2026-07-25 14:30", submissionText: "Attached calculations for all 15 quadratic equations using factoring and quadratic formula.", status: "graded", marksObtained: 19, feedback: "Excellent clarity in algebraic steps!" }
];

const DEFAULT_EXAMS: Exam[] = [
  { id: "ex-1", title: "Midterm Mathematics Assessment", type: "Midterm", classId: "c-10a", className: "Class 10-A", subjectId: "sub-1", subjectName: "Mathematics", date: "2026-08-10", startTime: "09:00 AM", durationMinutes: 90, totalMarks: 100, passingMarks: 40 },
  { id: "ex-2", title: "Physics Motion Unit Test", type: "Unit Test", classId: "c-10a", className: "Class 10-A", subjectId: "sub-2", subjectName: "Physics", date: "2026-08-05", startTime: "10:30 AM", durationMinutes: 45, totalMarks: 50, passingMarks: 20 }
];

const DEFAULT_EXAM_RESULTS: ExamResult[] = [
  { id: "res-1", examId: "ex-2", examTitle: "Physics Motion Unit Test", studentId: "u-student1", studentName: "Alex Johnson", subjectName: "Physics", marksObtained: 46, totalMarks: 50, grade: "A+", remarks: "Outstanding conceptual grasp.", aiComment: "Alex demonstrated stellar analytical mastery in physics motion calculations. Keep up the momentum!" }
];

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  { id: "tt-1", classId: "c-10a", className: "Class 10-A", dayOfWeek: "Monday", periodNumber: 1, startTime: "08:30 AM", endTime: "09:20 AM", subjectName: "Mathematics", teacherName: "Prof. Robert Langdon", roomNumber: "Room 101" },
  { id: "tt-2", classId: "c-10a", className: "Class 10-A", dayOfWeek: "Monday", periodNumber: 2, startTime: "09:25 AM", endTime: "10:15 AM", subjectName: "Physics", teacherName: "Prof. Robert Langdon", roomNumber: "Lab 2" },
  { id: "tt-3", classId: "c-10a", className: "Class 10-A", dayOfWeek: "Tuesday", periodNumber: 1, startTime: "08:30 AM", endTime: "09:20 AM", subjectName: "English Literature", teacherName: "Ms. Sarah Jenkins", roomNumber: "Room 101" }
];

const DEFAULT_NOTICES: Notice[] = [
  { id: "not-1", title: "Annual Science Exhibition 2026 Announcement", content: "We are thrilled to invite all students from Grades 8-12 to participate in the Annual Science & Robotics Exhibition. Registration closes on August 1st.", category: "Event", targetRole: "all", date: "2026-07-25", authorName: "Dr. Eleanor Vance", authorRole: "Principal", urgent: false },
  { id: "not-2", title: "Parent-Teacher Conference Schedule", content: "The Q2 Parent-Teacher Conference will be conducted on Saturday, August 8th from 9:00 AM to 1:00 PM.", category: "Academic", targetRole: "parents", date: "2026-07-26", authorName: "School Administration", authorRole: "Admin", urgent: true }
];

const DEFAULT_MATERIALS: StudyMaterial[] = [
  { id: "mat-1", title: "Algebraic Formulas Cheat Sheet", description: "Comprehensive reference guide for quadratic equations, polynomials, and logarithms.", subjectName: "Mathematics", className: "Class 10-A", category: "Notes", fileUrl: "#", fileName: "Math_Formulas_2026.pdf", uploadedBy: "Prof. Robert Langdon", uploadDate: "2026-07-20" },
  { id: "mat-2", title: "Physics Kinematics Worksheet 1", description: "Practice problems covering velocity, acceleration, and projectile motion.", subjectName: "Physics", className: "Class 10-A", category: "Worksheet", fileUrl: "#", fileName: "Kinematics_Worksheet.pdf", uploadedBy: "Prof. Robert Langdon", uploadDate: "2026-07-22" }
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "u-admin",
    senderName: "Dr. Eleanor Vance",
    senderRole: "admin",
    receiverRole: "all",
    text: "Welcome teachers, students, and parents to the Greenwood SMS Internal Portal!",
    timestamp: "2026-07-26 09:00",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "msg-2",
    senderId: "u-teacher1",
    senderName: "Prof. Robert Langdon",
    senderRole: "teacher",
    receiverRole: "direct",
    receiverId: "u-parent1",
    receiverName: "David Johnson",
    channelId: "direct-u-teacher1-u-parent1",
    text: "Hello Mr. Johnson! I wanted to touch base regarding Alex's performance in Physics. Alex scored 46/50 on the motion unit test!",
    timestamp: "2026-07-26 10:15",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    isRead: true
  },
  {
    id: "msg-3",
    senderId: "u-parent1",
    senderName: "David Johnson",
    senderRole: "parent",
    receiverRole: "direct",
    receiverId: "u-teacher1",
    receiverName: "Prof. Robert Langdon",
    channelId: "direct-u-teacher1-u-parent1",
    text: "That is fantastic news, Professor Langdon! Thank you for the update. Is there any specific area Alex should focus on for the upcoming midterms?",
    timestamp: "2026-07-26 10:22",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    isRead: true
  },
  {
    id: "msg-4",
    senderId: "u-teacher1",
    senderName: "Prof. Robert Langdon",
    senderRole: "teacher",
    receiverRole: "direct",
    receiverId: "u-parent1",
    receiverName: "David Johnson",
    channelId: "direct-u-teacher1-u-parent1",
    text: "Just reviewing multi-variable quadratic equations. I have attached the formula reference sheet for your review.",
    timestamp: "2026-07-26 10:30",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    attachmentUrl: "#",
    attachmentName: "Math_Formulas_2026.pdf",
    isRead: false
  },
  {
    id: "msg-5",
    senderId: "u-teacher2",
    senderName: "Ms. Sarah Jenkins",
    senderRole: "teacher",
    receiverRole: "direct",
    receiverId: "u-parent1",
    receiverName: "David Johnson",
    channelId: "direct-u-teacher2-u-parent1",
    text: "Dear Mr. Johnson, reminding you about the upcoming English Literature book reading assignment for Grade 10-A.",
    timestamp: "2026-07-25 14:00",
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=150&q=80",
    isRead: true
  }
];

const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Midterm Physics Examination",
    description: "Comprehensive mid-semester evaluation covering Mechanics, Kinematics, and Thermodynamics.",
    date: "2026-07-28",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    type: "exam",
    targetRole: "all",
    className: "Class 10-A",
    location: "Main Examination Hall A",
    organizer: "Dr. Marie Curie"
  },
  {
    id: "cal-2",
    title: "Advanced Mathematics Unit Test",
    description: "Calculus and quadratic functions pop assessment.",
    date: "2026-07-30",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    type: "exam",
    targetRole: "students",
    className: "Class 10-A",
    location: "Room 204",
    organizer: "Prof. Alan Turing"
  },
  {
    id: "cal-3",
    title: "Annual Science & Robotics Fair 2026",
    description: "Inter-school exhibition showcasing student inventions, AI projects, and automated robotics.",
    date: "2026-08-01",
    startTime: "09:00 AM",
    endTime: "04:00 PM",
    type: "event",
    targetRole: "all",
    className: "All Classes",
    location: "Campus Sports Complex & Innovation Lab",
    organizer: "Dr. Eleanor Vance"
  },
  {
    id: "cal-4",
    title: "Mid-Term Civic Holiday Break",
    description: "School closed for Civic Holiday. No academic classes or online lectures.",
    date: "2026-08-03",
    endDate: "2026-08-03",
    type: "holiday",
    targetRole: "all",
    className: "All Classes",
    organizer: "School Administration"
  },
  {
    id: "cal-5",
    title: "Q2 Parent-Teacher Progress Conference",
    description: "Individual 1-on-1 consultations with class teachers regarding academic performance and student well-being.",
    date: "2026-08-08",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    type: "meeting",
    targetRole: "parents",
    className: "All Classes",
    location: "Auditorium & Classrooms",
    organizer: "Parent-Teacher Council"
  },
  {
    id: "cal-6",
    title: "Organic Chemistry Practical Lab Evaluation",
    description: "Hands-on titration and compound analysis evaluation in Chemistry Lab.",
    date: "2026-08-12",
    startTime: "11:00 AM",
    endTime: "01:00 PM",
    type: "exam",
    targetRole: "students",
    className: "Class 12-A",
    location: "Chemistry Lab B",
    organizer: "Dr. Linus Pauling"
  },
  {
    id: "cal-7",
    title: "National Heritage Day - Public Holiday",
    description: "School closed in observance of National Heritage and Freedom Day.",
    date: "2026-08-15",
    type: "holiday",
    targetRole: "all",
    className: "All Classes",
    organizer: "Government & School Board"
  },
  {
    id: "cal-8",
    title: "Inter-School Basketball Championship Finals",
    description: "Greenwood Academy vs. St. Jude High School in the District Finals.",
    date: "2026-08-20",
    startTime: "02:00 PM",
    endTime: "05:00 PM",
    type: "event",
    targetRole: "all",
    className: "All Classes",
    location: "Greenwood Central Indoor Arena",
    organizer: "Athletics Department"
  },
  {
    id: "cal-9",
    title: "Literature & World History Research Paper Submission",
    description: "Final deadline for Grade 11 & 12 essays.",
    date: "2026-08-25",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    type: "academic",
    targetRole: "students",
    className: "Class 11-A",
    location: "Online Portal",
    organizer: "Ms. Emily Dickinson"
  },
  {
    id: "cal-10",
    title: "Faculty Professional Development Workshop",
    description: "Staff training on AI pedagogy, modern learning management, and student safety.",
    date: "2026-08-28",
    startTime: "08:30 AM",
    endTime: "03:00 PM",
    type: "event",
    targetRole: "teachers",
    className: "Faculty Only",
    location: "Conference Room A",
    organizer: "Dr. Eleanor Vance"
  },
  {
    id: "cal-11",
    title: "Labor Day Holiday",
    description: "National public holiday. School closed.",
    date: "2026-09-07",
    type: "holiday",
    targetRole: "all",
    className: "All Classes",
    organizer: "School Administration"
  }
];

class DBStore {
  private data: DBData;

  constructor() {
    this.data = this.loadFromFile();
  }

  private loadFromFile(): DBData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.calendarEvents || parsed.calendarEvents.length === 0) {
          parsed.calendarEvents = DEFAULT_CALENDAR_EVENTS;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not read local data store, initializing defaults.");
    }

    const initialData: DBData = {
      schoolSettings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS,
      classes: DEFAULT_CLASSES,
      subjects: DEFAULT_SUBJECTS,
      attendance: DEFAULT_ATTENDANCE,
      fees: DEFAULT_FEES,
      homework: DEFAULT_HOMEWORK,
      submissions: DEFAULT_SUBMISSIONS,
      exams: DEFAULT_EXAMS,
      examResults: DEFAULT_EXAM_RESULTS,
      timetable: DEFAULT_TIMETABLE,
      notices: DEFAULT_NOTICES,
      studyMaterials: DEFAULT_MATERIALS,
      messages: DEFAULT_MESSAGES,
      calendarEvents: DEFAULT_CALENDAR_EVENTS
    };

    this.saveToFile(initialData);
    return initialData;
  }

  private saveToFile(dataToSave: DBData = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (e) {
      console.error("Failed to save data store to disk:", e);
    }
  }

  // --- School Settings ---
  getSettings(): SchoolSettings {
    return this.data.schoolSettings;
  }

  updateSettings(settings: Partial<SchoolSettings>): SchoolSettings {
    this.data.schoolSettings = { ...this.data.schoolSettings, ...settings };
    this.saveToFile();
    return this.data.schoolSettings;
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: Omit<User, 'id'> & { id?: string }): User {
    const newUser: User = {
      id: user.id || `u-${Date.now()}`,
      ...user
    };
    this.data.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  updateUser(id: string, update: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...update };
      this.saveToFile();
      return this.data.users[idx];
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const lenBefore = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== lenBefore) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Classes & Subjects ---
  getClasses(): ClassRoom[] {
    return this.data.classes;
  }

  addClass(cls: Omit<ClassRoom, 'id'>): ClassRoom {
    const newClass: ClassRoom = {
      id: `c-${Date.now()}`,
      ...cls
    };
    this.data.classes.push(newClass);
    this.saveToFile();
    return newClass;
  }

  deleteClass(id: string): boolean {
    this.data.classes = this.data.classes.filter(c => c.id !== id);
    this.saveToFile();
    return true;
  }

  getSubjects(): Subject[] {
    return this.data.subjects;
  }

  addSubject(sub: Omit<Subject, 'id'>): Subject {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      ...sub
    };
    this.data.subjects.push(newSubject);
    this.saveToFile();
    return newSubject;
  }

  // --- Attendance ---
  getAttendance(filters?: { classId?: string; studentId?: string; date?: string }): AttendanceRecord[] {
    let records = this.data.attendance;
    if (filters?.classId) records = records.filter(r => r.classId === filters.classId);
    if (filters?.studentId) records = records.filter(r => r.studentId === filters.studentId);
    if (filters?.date) records = records.filter(r => r.date === filters.date);
    return records;
  }

  saveBulkAttendance(records: Omit<AttendanceRecord, 'id'>[]): AttendanceRecord[] {
    const updated: AttendanceRecord[] = [];
    for (const rec of records) {
      const existingIdx = this.data.attendance.findIndex(
        a => a.studentId === rec.studentId && a.date === rec.date
      );
      if (existingIdx !== -1) {
        this.data.attendance[existingIdx] = {
          ...this.data.attendance[existingIdx],
          status: rec.status,
          remarks: rec.remarks
        };
        updated.push(this.data.attendance[existingIdx]);
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...rec
        };
        this.data.attendance.push(newRecord);
        updated.push(newRecord);
      }
    }
    this.saveToFile();
    return updated;
  }

  // --- Fees ---
  getFees(studentId?: string): FeeRecord[] {
    if (studentId) return this.data.fees.filter(f => f.studentId === studentId);
    return this.data.fees;
  }

  addFee(fee: Omit<FeeRecord, 'id'>): FeeRecord {
    const newFee: FeeRecord = {
      id: `fee-${Date.now()}`,
      ...fee
    };
    this.data.fees.push(newFee);
    this.saveToFile();
    return newFee;
  }

  payFee(id: string, amount: number): FeeRecord | undefined {
    const fee = this.data.fees.find(f => f.id === id);
    if (fee) {
      fee.paidAmount = Math.min(fee.totalAmount, fee.paidAmount + amount);
      if (fee.paidAmount >= fee.totalAmount) {
        fee.status = 'paid';
      } else if (fee.paidAmount > 0) {
        fee.status = 'partial';
      }
      fee.paymentDate = new Date().toISOString().split('T')[0];
      fee.receiptNo = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
      this.saveToFile();
      return fee;
    }
    return undefined;
  }

  // --- Homework & Submissions ---
  getHomework(classId?: string): Homework[] {
    if (classId) return this.data.homework.filter(h => h.classId === classId);
    return this.data.homework;
  }

  addHomework(hw: Omit<Homework, 'id'>): Homework {
    const newHw: Homework = {
      id: `hw-${Date.now()}`,
      ...hw
    };
    this.data.homework.push(newHw);
    this.saveToFile();
    return newHw;
  }

  getSubmissions(homeworkId?: string, studentId?: string): HomeworkSubmission[] {
    let subs = this.data.submissions;
    if (homeworkId) subs = subs.filter(s => s.homeworkId === homeworkId);
    if (studentId) subs = subs.filter(s => s.studentId === studentId);
    return subs;
  }

  submitHomework(sub: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>): HomeworkSubmission {
    const newSub: HomeworkSubmission = {
      id: `sub-${Date.now()}`,
      ...sub,
      submittedAt: new Date().toLocaleString(),
      status: 'submitted'
    };
    this.data.submissions.push(newSub);
    this.saveToFile();
    return newSub;
  }

  gradeSubmission(id: string, marksObtained: number, feedback: string): HomeworkSubmission | undefined {
    const sub = this.data.submissions.find(s => s.id === id);
    if (sub) {
      sub.marksObtained = marksObtained;
      sub.feedback = feedback;
      sub.status = 'graded';
      this.saveToFile();
      return sub;
    }
    return undefined;
  }

  // --- Exams & Results ---
  getExams(classId?: string): Exam[] {
    if (classId) return this.data.exams.filter(e => e.classId === classId);
    return this.data.exams;
  }

  addExam(exam: Omit<Exam, 'id'>): Exam {
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      ...exam
    };
    this.data.exams.push(newExam);
    this.saveToFile();
    return newExam;
  }

  getExamResults(examId?: string, studentId?: string): ExamResult[] {
    let res = this.data.examResults;
    if (examId) res = res.filter(r => r.examId === examId);
    if (studentId) res = res.filter(r => r.studentId === studentId);
    return res;
  }

  addExamResult(res: Omit<ExamResult, 'id'>): ExamResult {
    const newRes: ExamResult = {
      id: `res-${Date.now()}`,
      ...res
    };
    this.data.examResults.push(newRes);
    this.saveToFile();
    return newRes;
  }

  // --- Timetable ---
  getTimetable(classId?: string): TimetableSlot[] {
    if (classId) return this.data.timetable.filter(t => t.classId === classId);
    return this.data.timetable;
  }

  addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      ...slot
    };
    this.data.timetable.push(newSlot);
    this.saveToFile();
    return newSlot;
  }

  // --- Notices ---
  getNotices(): Notice[] {
    return this.data.notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addNotice(notice: Omit<Notice, 'id'>): Notice {
    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      ...notice
    };
    this.data.notices.unshift(newNotice);
    this.saveToFile();
    return newNotice;
  }

  // --- Study Materials ---
  getStudyMaterials(): StudyMaterial[] {
    return this.data.studyMaterials;
  }

  addStudyMaterial(mat: Omit<StudyMaterial, 'id'>): StudyMaterial {
    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      ...mat
    };
    this.data.studyMaterials.unshift(newMat);
    this.saveToFile();
    return newMat;
  }

  // --- Chat / Messages ---
  getMessages(): ChatMessage[] {
    return this.data.messages;
  }

  addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...msg
    };
    this.data.messages.push(newMsg);
    this.saveToFile();
    return newMsg;
  }

  // --- Shared School Calendar Events ---
  getCalendarEvents(): CalendarEvent[] {
    if (!this.data.calendarEvents || this.data.calendarEvents.length === 0) {
      this.data.calendarEvents = DEFAULT_CALENDAR_EVENTS;
      this.saveToFile();
    }
    return this.data.calendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  addCalendarEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      ...event
    };
    if (!this.data.calendarEvents) {
      this.data.calendarEvents = [];
    }
    this.data.calendarEvents.push(newEvent);
    this.saveToFile();
    return newEvent;
  }

  deleteCalendarEvent(id: string): boolean {
    if (!this.data.calendarEvents) return false;
    const prevLen = this.data.calendarEvents.length;
    this.data.calendarEvents = this.data.calendarEvents.filter(e => e.id !== id);
    if (this.data.calendarEvents.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Admin Audit Logs ---
  getAuditLogs(): AuditLogEntry[] {
    if (!this.data.auditLogs || this.data.auditLogs.length === 0) {
      this.data.auditLogs = DEFAULT_AUDIT_LOGS;
      this.saveToFile();
    }
    return this.data.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditLogEntry {
    if (!this.data.auditLogs) {
      this.data.auditLogs = DEFAULT_AUDIT_LOGS;
    }
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      action: entry.action,
      category: entry.category || 'system',
      userId: entry.userId || 'system',
      userName: entry.userName || 'System Auto',
      userRole: entry.userRole || 'admin',
      ipAddress: entry.ipAddress || '127.0.0.1',
      details: entry.details,
      targetEntity: entry.targetEntity || 'System Resource',
      status: entry.status || 'info'
    };
    this.data.auditLogs.unshift(newEntry);
    this.saveToFile();
    return newEntry;
  }

  clearAuditLogs(): boolean {
    this.data.auditLogs = [];
    this.saveToFile();
    return true;
  }

  // --- Notification Logs & Service Triggers ---
  getNotificationLogs(): NotificationLog[] {
    if (!this.data.notificationLogs || this.data.notificationLogs.length === 0) {
      this.data.notificationLogs = DEFAULT_NOTIFICATION_LOGS;
      this.saveToFile();
    }
    return this.data.notificationLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  addNotificationLog(log: Omit<NotificationLog, 'id' | 'sentAt'> & { sentAt?: string }): NotificationLog {
    if (!this.data.notificationLogs) {
      this.data.notificationLogs = DEFAULT_NOTIFICATION_LOGS;
    }
    const newLog: NotificationLog = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: log.sentAt || new Date().toISOString(),
      ...log
    };
    this.data.notificationLogs.unshift(newLog);
    this.saveToFile();
    return newLog;
  }

  clearNotificationLogs(): boolean {
    this.data.notificationLogs = [];
    this.saveToFile();
    return true;
  }

  triggerFeeReminders(options?: {
    channel?: 'SMS' | 'EMAIL' | 'SMS_AND_EMAIL';
    triggeredBy?: string;
    feeId?: string;
    studentId?: string;
  }): { count: number; logs: NotificationLog[] } {
    const channel = options?.channel || 'SMS_AND_EMAIL';
    const triggeredBy = options?.triggeredBy || 'Automated Fee Trigger System';
    
    // Find matching unpaid or partially paid fee records
    let pendingFees = this.data.fees.filter(f => f.status === 'pending' || f.status === 'partial');
    if (options?.feeId) {
      pendingFees = pendingFees.filter(f => f.id === options.feeId);
    }
    if (options?.studentId) {
      pendingFees = pendingFees.filter(f => f.studentId === options.studentId);
    }

    const createdLogs: NotificationLog[] = [];
    const parents = this.data.users.filter(u => u.role === 'parent');

    for (const fee of pendingFees) {
      const dueAmount = fee.totalAmount - fee.paidAmount;
      // Match parent for student if available
      const studentUser = this.data.users.find(u => u.id === fee.studentId || u.name.toLowerCase() === fee.studentName.toLowerCase());
      const parentUser = parents.find(p => p.childStudentId === fee.studentId || (p.childName && p.childName.toLowerCase() === fee.studentName.toLowerCase())) || parents[0];

      const parentName = parentUser?.name || 'Parent/Guardian';
      const recipientPhone = parentUser?.phone || '+1 (555) 019-2831';
      const recipientEmail = parentUser?.email || `${parentName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

      const title = `Fee Reminder: ${fee.title} Due Soon`;
      const message = `Dear ${parentName}, this is an automated reminder from Greenwood Academy regarding ${fee.studentName}'s ${fee.title}. Outstanding balance: $${dueAmount.toLocaleString()}. Payment Due Date: ${fee.dueDate}. Please log into the portal to complete payment.`;

      const log = this.addNotificationLog({
        type: 'fee_reminder',
        channel,
        recipientId: parentUser?.id,
        recipientName: parentName,
        recipientPhone,
        recipientEmail,
        studentName: fee.studentName,
        title,
        message,
        status: 'delivered',
        triggeredBy,
        metadata: {
          feeId: fee.id,
          amount: dueAmount,
          dueDate: fee.dueDate
        }
      });

      createdLogs.push(log);
    }

    // Also record an audit log for transparency
    this.addAuditLog({
      action: 'NOTIFICATION_TRIGGERED',
      category: 'finance',
      userId: 'system',
      userName: triggeredBy,
      userRole: 'admin',
      details: `Triggered automated fee reminders to ${createdLogs.length} parents via ${channel}`,
      targetEntity: `Fee Reminders Engine`,
      status: 'success'
    });

    return { count: createdLogs.length, logs: createdLogs };
  }

  triggerExamReminders(options?: {
    channel?: 'SMS' | 'EMAIL' | 'SMS_AND_EMAIL';
    triggeredBy?: string;
    examId?: string;
    classId?: string;
  }): { count: number; logs: NotificationLog[] } {
    const channel = options?.channel || 'SMS_AND_EMAIL';
    const triggeredBy = options?.triggeredBy || 'Automated Exam Schedule Trigger';

    let targetExams = this.data.exams;
    if (options?.examId) {
      targetExams = targetExams.filter(e => e.id === options.examId);
    }
    if (options?.classId) {
      targetExams = targetExams.filter(e => e.classId === options.classId);
    }

    const createdLogs: NotificationLog[] = [];
    const parents = this.data.users.filter(u => u.role === 'parent');

    for (const exam of targetExams) {
      // Find parents of students in that class
      const classStudents = this.data.users.filter(u => u.role === 'student' && u.className === exam.className);
      const targetParents: Array<Partial<User>> = parents.length > 0 ? parents : [{ name: 'Class Parent', phone: '+1 (555) 888-9900', email: 'parent@example.com', id: 'p-default', childStudentId: 'u-student1' }];

      for (const parentUser of targetParents.slice(0, Math.max(1, classStudents.length))) {
        const student = classStudents.find(s => s.id === parentUser.childStudentId) || classStudents[0];
        const studentName = student ? student.name : 'Your Child';
        const parentName = parentUser.name || 'Parent/Guardian';

        const title = `Exam Schedule Alert: ${exam.title} (${exam.subjectName})`;
        const message = `Dear ${parentName}, Greenwood Academy Notice: ${exam.title} (${exam.subjectName}) for ${exam.className} is scheduled on ${exam.date} at ${exam.startTime}. Duration: ${exam.durationMinutes} mins. Total Marks: ${exam.totalMarks}. Please support ${studentName} in preparation.`;

        const log = this.addNotificationLog({
          type: 'exam_schedule',
          channel,
          recipientId: parentUser.id,
          recipientName: parentName,
          recipientPhone: parentUser.phone || '+1 (555) 999-0011',
          recipientEmail: parentUser.email || 'parent@school.org',
          studentName,
          title,
          message,
          status: 'delivered',
          triggeredBy,
          metadata: {
            examId: exam.id,
            examDate: exam.date,
            subjectName: exam.subjectName
          }
        });

        createdLogs.push(log);
      }
    }

    this.addAuditLog({
      action: 'NOTIFICATION_TRIGGERED',
      category: 'academic',
      userId: 'system',
      userName: triggeredBy,
      userRole: 'admin',
      details: `Dispatched exam schedule notifications for ${targetExams.length} upcoming exams to parents via ${channel}`,
      targetEntity: `Exam Notification Trigger`,
      status: 'success'
    });

    return { count: createdLogs.length, logs: createdLogs };
  }

  // --- Library Management Store ---
  getBooks(): Book[] {
    if (!this.data.books || this.data.books.length === 0) {
      this.data.books = [
        {
          id: "bk-101",
          isbn: "978-0143127741",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          category: "Literature",
          publisher: "Harper Perennial",
          publishedYear: 1960,
          totalCopies: 5,
          availableCopies: 3,
          locationRack: "Rack A-1",
          synopsis: "A classic story of justice, racial tension, and moral growth in the American South."
        },
        {
          id: "bk-102",
          isbn: "978-0451524935",
          title: "1984",
          author: "George Orwell",
          category: "Fiction",
          publisher: "Signet Classics",
          publishedYear: 1949,
          totalCopies: 8,
          availableCopies: 6,
          locationRack: "Rack A-3",
          synopsis: "A chilling dystopian vision of totalitarian government control and ubiquitous surveillance."
        },
        {
          id: "bk-103",
          isbn: "978-0131103627",
          title: "The C Programming Language",
          author: "Brian W. Kernighan, Dennis M. Ritchie",
          category: "Technology",
          publisher: "Prentice Hall",
          publishedYear: 1988,
          totalCopies: 4,
          availableCopies: 2,
          locationRack: "Rack C-2",
          synopsis: "The definitive guide and fundamental reference for C programming."
        },
        {
          id: "bk-104",
          isbn: "978-0307474278",
          title: "A Short History of Nearly Everything",
          author: "Bill Bryson",
          category: "Science",
          publisher: "Broadway Books",
          publishedYear: 2003,
          totalCopies: 6,
          availableCopies: 5,
          locationRack: "Rack B-1",
          synopsis: "An accessible and fascinating tour through physical science, cosmology, and biology."
        },
        {
          id: "bk-105",
          isbn: "978-0060935467",
          title: "Principles of Mathematics",
          author: "Bertrand Russell",
          category: "Mathematics",
          publisher: "Routledge",
          publishedYear: 1903,
          totalCopies: 3,
          availableCopies: 3,
          locationRack: "Rack D-4",
          synopsis: "An foundational exploration of mathematical logic and formal reasoning."
        }
      ];
      this.saveToFile();
    }
    return this.data.books;
  }

  addBook(book: Omit<Book, 'id'>): Book {
    if (!this.data.books) {
      this.getBooks();
    }
    const newBook: Book = {
      id: `bk-${Date.now()}`,
      ...book,
      availableCopies: book.totalCopies
    };
    this.data.books!.push(newBook);
    this.saveToFile();

    this.addAuditLog({
      action: 'BOOK_ADDED',
      category: 'academic',
      userId: 'system',
      userName: 'Librarian',
      userRole: 'admin',
      details: `Added new library book: ${newBook.title} (${newBook.isbn})`,
      targetEntity: `Library Book`,
      status: 'success'
    });

    return newBook;
  }

  updateBook(id: string, updates: Partial<Book>): Book | null {
    if (!this.data.books) this.getBooks();
    const index = this.data.books!.findIndex(b => b.id === id);
    if (index === -1) return null;

    this.data.books![index] = { ...this.data.books![index], ...updates };
    this.saveToFile();
    return this.data.books![index];
  }

  deleteBook(id: string): boolean {
    if (!this.data.books) this.getBooks();
    const lenBefore = this.data.books!.length;
    this.data.books = this.data.books!.filter(b => b.id !== id);
    if (this.data.books.length !== lenBefore) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  getBorrowings(): BookBorrowing[] {
    if (!this.data.borrowings || this.data.borrowings.length === 0) {
      this.data.borrowings = [
        {
          id: "brw-101",
          bookId: "bk-101",
          bookTitle: "To Kill a Mockingbird",
          studentId: "u-student1",
          studentName: "Alexandria Rivers",
          studentClass: "Class 10-A",
          borrowedDate: "2026-07-15",
          dueDate: "2026-07-29",
          status: "active",
          issuedBy: "Librarian Mrs. Higgins"
        },
        {
          id: "brw-102",
          bookId: "bk-103",
          bookTitle: "The C Programming Language",
          studentId: "u-student2",
          studentName: "Marcus Chen",
          studentClass: "Class 10-A",
          borrowedDate: "2026-07-10",
          dueDate: "2026-07-24",
          status: "overdue",
          issuedBy: "Librarian Mrs. Higgins",
          fineAmount: 5
        }
      ];
      this.saveToFile();
    }
    return this.data.borrowings;
  }

  checkoutBook(data: {
    bookId: string;
    studentId: string;
    studentName: string;
    studentClass: string;
    dueDate: string;
    issuedBy?: string;
  }): BookBorrowing | { error: string } {
    const books = this.getBooks();
    const book = books.find(b => b.id === data.bookId);

    if (!book) return { error: 'Book not found' };
    if (book.availableCopies <= 0) return { error: 'No available copies left for checkout' };

    // Deduct available copy
    book.availableCopies -= 1;

    const newBorrowing: BookBorrowing = {
      id: `brw-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      studentId: data.studentId,
      studentName: data.studentName,
      studentClass: data.studentClass,
      borrowedDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: 'active',
      issuedBy: data.issuedBy || 'Librarian'
    };

    if (!this.data.borrowings) this.getBorrowings();
    this.data.borrowings!.unshift(newBorrowing);
    this.saveToFile();

    this.addAuditLog({
      action: 'BOOK_CHECKED_OUT',
      category: 'academic',
      userId: data.studentId,
      userName: data.studentName,
      userRole: 'student',
      details: `Checked out "${book.title}" due on ${data.dueDate}`,
      targetEntity: `Library Borrowing`,
      status: 'success'
    });

    return newBorrowing;
  }

  returnBook(borrowingId: string): BookBorrowing | { error: string } {
    if (!this.data.borrowings) this.getBorrowings();
    const borrowing = this.data.borrowings!.find(b => b.id === borrowingId);
    if (!borrowing) return { error: 'Borrowing record not found' };

    if (borrowing.status === 'returned') return { error: 'Book already returned' };

    borrowing.status = 'returned';
    borrowing.returnedDate = new Date().toISOString().split('T')[0];

    // Return copy to book inventory
    const books = this.getBooks();
    const book = books.find(b => b.id === borrowing.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    this.saveToFile();

    this.addAuditLog({
      action: 'BOOK_RETURNED',
      category: 'academic',
      userId: borrowing.studentId,
      userName: borrowing.studentName,
      userRole: 'student',
      details: `Returned book "${borrowing.bookTitle}"`,
      targetEntity: `Library Borrowing`,
      status: 'success'
    });

    return borrowing;
  }


  // --- Analytics & Dashboard Stats ---
  getStats(): DashboardStats {
    const students = this.data.users.filter(u => u.role === 'student');
    const teachers = this.data.users.filter(u => u.role === 'teacher');
    const parents = this.data.users.filter(u => u.role === 'parent');

    const totalCollected = this.data.fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const pendingTotal = this.data.fees.reduce((acc, f) => acc + (f.totalAmount - f.paidAmount), 0);

    const presentCount = this.data.attendance.filter(a => a.status === 'present').length;
    const totalAttRecords = this.data.attendance.length;
    const avgAttendanceRate = totalAttRecords > 0 ? Math.round((presentCount / totalAttRecords) * 100) : 94;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalParents: parents.length,
      totalClasses: this.data.classes.length,
      avgAttendanceRate,
      totalFeeCollected: totalCollected,
      pendingFeeTotal: pendingTotal,
      activeExamsCount: this.data.exams.length,
      pendingHomeworkCount: this.data.homework.length
    };
  }
}

export const db = new DBStore();
