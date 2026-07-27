export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  // Role specific fields
  studentId?: string;       // For students and parents
  classId?: string;         // For students and teachers
  className?: string;       // E.g., "10-A"
  subject?: string;         // For teachers
  childStudentId?: string;  // For parents
  childName?: string;       // For parents
  parentName?: string;      // For students
  rollNo?: string;          // For students
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  admissionDate?: string;
}

export interface SchoolSettings {
  name: string;
  code: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  logo: string;
  principalName: string;
  isOtpVerified?: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;          // e.g. "Class 10"
  section: string;       // e.g. "A"
  classTeacherId: string;
  classTeacherName: string;
  roomNumber: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  date: string;          // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  title: string;
  category: 'Tuition' | 'Transport' | 'Library' | 'Laboratory' | 'Exam' | 'Sports';
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'partial';
  paymentDate?: string;
  receiptNo?: string;
  concessionAmount?: number;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionText: string;
  fileUrl?: string;
  status: 'submitted' | 'graded' | 'late';
  marksObtained?: number;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string;
  type: 'Quiz' | 'Unit Test' | 'Midterm' | 'Final Exam';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  aiComment?: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  roomNumber: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Exam' | 'Event' | 'Holiday';
  targetRole: 'all' | 'teachers' | 'students' | 'parents';
  date: string;
  authorName: string;
  authorRole: string;
  urgent: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  className: string;
  category: 'PDF' | 'Notes' | 'Worksheet' | 'Previous Paper';
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;          // YYYY-MM-DD
  endDate?: string;       // YYYY-MM-DD for multi-day events
  startTime?: string;     // e.g. "09:00 AM"
  endTime?: string;       // e.g. "11:00 AM"
  type: 'exam' | 'holiday' | 'event' | 'meeting' | 'academic';
  targetRole?: 'all' | 'teachers' | 'students' | 'parents';
  className?: string;     // e.g. "Class 10-A" or "All Classes"
  location?: string;
  organizer?: string;
  color?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverRole: 'all' | UserRole | 'direct' | string;
  receiverId?: string;
  receiverName?: string;
  channelId?: string;
  text: string;
  timestamp: string;
  avatar?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isRead?: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  avgAttendanceRate: number;
  totalFeeCollected: number;
  pendingFeeTotal: number;
  activeExamsCount: number;
  pendingHomeworkCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'settings' | 'student' | 'finance' | 'academic' | 'system';
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress?: string;
  details: string;
  targetEntity?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

