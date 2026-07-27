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
  DashboardStats
} from '../types';
import { offlineStorage } from './offlineStorage';

function getAuthHeader() {
  const token = localStorage.getItem('sms_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchWithCache<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const data = await fetcher();
    offlineStorage.set(cacheKey, data);
    return data;
  } catch (err) {
    const cached = offlineStorage.get<T>(cacheKey);
    if (cached) {
      console.info(`[Offline Cache Hit] Key "${cacheKey}" cached at ${new Date(cached.timestamp).toLocaleTimeString()}`);
      return cached.data;
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async demoLogin(role: string) {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async registerSchool(data: { schoolName: string; email: string; phone?: string; address?: string; principalName?: string; otp: string }) {
    const res = await fetch('/api/auth/register-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; schoolSettings: SchoolSettings; token: string; user: User }>(res);
  },

  async getMe() {
    const res = await fetch('/api/auth/me', { headers: getAuthHeader() });
    return handleResponse<{ user: User }>(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch('/api/settings');
    return handleResponse<SchoolSettings>(res);
  },

  async updateSettings(settings: Partial<SchoolSettings>) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(settings)
    });
    return handleResponse<SchoolSettings>(res);
  },

  // Users
  async getUsers(role?: string) {
    const url = role ? `/api/users?role=${role}` : '/api/users';
    const res = await fetch(url, { headers: getAuthHeader() });
    return handleResponse<User[]>(res);
  },

  async createUser(user: Partial<User>) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(user)
    });
    return handleResponse<User>(res);
  },

  async updateUser(id: string, user: Partial<User>) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(user)
    });
    return handleResponse<User>(res);
  },

  async deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Classes & Subjects
  async getClasses() {
    const res = await fetch('/api/classes');
    return handleResponse<ClassRoom[]>(res);
  },

  async createClass(cls: Partial<ClassRoom>) {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(cls)
    });
    return handleResponse<ClassRoom>(res);
  },

  async deleteClass(id: string) {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getSubjects() {
    const res = await fetch('/api/subjects');
    return handleResponse<Subject[]>(res);
  },

  async createSubject(sub: Partial<Subject>) {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(sub)
    });
    return handleResponse<Subject>(res);
  },

  // Attendance
  async getAttendance(classId?: string, studentId?: string, date?: string) {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (studentId) params.append('studentId', studentId);
    if (date) params.append('date', date);

    const res = await fetch(`/api/attendance?${params.toString()}`);
    return handleResponse<AttendanceRecord[]>(res);
  },

  async saveBulkAttendance(records: Partial<AttendanceRecord>[]) {
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ records })
    });
    return handleResponse<{ success: boolean; count: number; records: AttendanceRecord[] }>(res);
  },

  // Fees
  async getFees(studentId?: string) {
    const key = `fees_${studentId || 'all'}`;
    const url = studentId ? `/api/fees?studentId=${studentId}` : '/api/fees';
    return fetchWithCache<FeeRecord[]>(key, async () => {
      const res = await fetch(url);
      return handleResponse<FeeRecord[]>(res);
    });
  },

  async createFee(fee: Partial<FeeRecord>) {
    const res = await fetch('/api/fees', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(fee)
    });
    return handleResponse<FeeRecord>(res);
  },

  async payFee(id: string, amount: number) {
    const res = await fetch(`/api/fees/${id}/pay`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ amount })
    });
    return handleResponse<FeeRecord>(res);
  },

  // Homework
  async getHomework(classId?: string) {
    const key = `homework_${classId || 'all'}`;
    const url = classId ? `/api/homework?classId=${classId}` : '/api/homework';
    return fetchWithCache<Homework[]>(key, async () => {
      const res = await fetch(url);
      return handleResponse<Homework[]>(res);
    });
  },

  async createHomework(hw: Partial<Homework>) {
    const res = await fetch('/api/homework', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(hw)
    });
    return handleResponse<Homework>(res);
  },

  async getSubmissions(homeworkId?: string, studentId?: string) {
    const params = new URLSearchParams();
    if (homeworkId) params.append('homeworkId', homeworkId);
    if (studentId) params.append('studentId', studentId);
    const res = await fetch(`/api/homework/submissions?${params.toString()}`);
    return handleResponse<HomeworkSubmission[]>(res);
  },

  async submitHomework(sub: Partial<HomeworkSubmission>) {
    const res = await fetch('/api/homework/submit', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(sub)
    });
    return handleResponse<HomeworkSubmission>(res);
  },

  async gradeSubmission(id: string, marksObtained: number, feedback: string) {
    const res = await fetch(`/api/homework/submissions/${id}/grade`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ marksObtained, feedback })
    });
    return handleResponse<HomeworkSubmission>(res);
  },

  // Exams
  async getExams(classId?: string) {
    const url = classId ? `/api/exams?classId=${classId}` : '/api/exams';
    const res = await fetch(url);
    return handleResponse<Exam[]>(res);
  },

  async createExam(exam: Partial<Exam>) {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(exam)
    });
    return handleResponse<Exam>(res);
  },

  async getExamResults(examId?: string, studentId?: string) {
    const key = `exam_results_${examId || 'all'}_${studentId || 'all'}`;
    return fetchWithCache<ExamResult[]>(key, async () => {
      const params = new URLSearchParams();
      if (examId) params.append('examId', examId);
      if (studentId) params.append('studentId', studentId);
      const res = await fetch(`/api/exams/results?${params.toString()}`);
      return handleResponse<ExamResult[]>(res);
    });
  },

  async createExamResult(resData: Partial<ExamResult>) {
    const res = await fetch('/api/exams/results', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(resData)
    });
    return handleResponse<ExamResult>(res);
  },

  // Timetable
  async getTimetable(classId?: string) {
    const key = `timetable_${classId || 'all'}`;
    const url = classId ? `/api/timetable?classId=${classId}` : '/api/timetable';
    return fetchWithCache<TimetableSlot[]>(key, async () => {
      const res = await fetch(url);
      return handleResponse<TimetableSlot[]>(res);
    });
  },

  async createTimetableSlot(slot: Partial<TimetableSlot>) {
    const res = await fetch('/api/timetable', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(slot)
    });
    return handleResponse<TimetableSlot>(res);
  },

  // Notices
  async getNotices() {
    return fetchWithCache<Notice[]>('notices', async () => {
      const res = await fetch('/api/notices');
      return handleResponse<Notice[]>(res);
    });
  },

  async createNotice(notice: Partial<Notice>) {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(notice)
    });
    return handleResponse<Notice>(res);
  },

  // Study Materials
  async getStudyMaterials() {
    return fetchWithCache<StudyMaterial[]>('study_materials', async () => {
      const res = await fetch('/api/study-materials');
      return handleResponse<StudyMaterial[]>(res);
    });
  },

  async createStudyMaterial(mat: Partial<StudyMaterial>) {
    const res = await fetch('/api/study-materials', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(mat)
    });
    return handleResponse<StudyMaterial>(res);
  },

  // Messages
  async getMessages() {
    const res = await fetch('/api/messages');
    return handleResponse<ChatMessage[]>(res);
  },

  async sendMessage(msg: Partial<ChatMessage>) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(msg)
    });
    return handleResponse<ChatMessage>(res);
  },

  // Stats
  async getStats() {
    return fetchWithCache<DashboardStats>('stats', async () => {
      const res = await fetch('/api/stats');
      return handleResponse<DashboardStats>(res);
    });
  },

  // Shared School Calendar
  async getCalendarEvents() {
    return fetchWithCache<CalendarEvent[]>('calendar', async () => {
      const res = await fetch('/api/calendar');
      return handleResponse<CalendarEvent[]>(res);
    });
  },

  async createCalendarEvent(event: Partial<CalendarEvent>) {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(event)
    });
    return handleResponse<CalendarEvent>(res);
  },

  async deleteCalendarEvent(id: string) {
    const res = await fetch(`/api/calendar/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Admin Audit Logs
  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    return handleResponse<AuditLogEntry[]>(res);
  },

  async createAuditLog(entry: Partial<AuditLogEntry>) {
    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(entry)
    });
    return handleResponse<AuditLogEntry>(res);
  },

  async clearAuditLogs() {
    const res = await fetch('/api/audit-logs', {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Gemini AI Tools
  async aiChat(prompt: string, userRole: string, context?: object) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userRole, context })
    });
    return handleResponse<{ reply: string }>(res);
  },

  async aiReportComment(studentName: string, subject: string, marks: number, totalMarks: number, attendanceRate: number) {
    const res = await fetch('/api/ai/report-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, subject, marks, totalMarks, attendanceRate })
    });
    return handleResponse<{ comment: string }>(res);
  },

  async aiFeeReminder(parentName: string, studentName: string, amount: number, dueDate: string, feeTitle: string) {
    const res = await fetch('/api/ai/fee-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentName, studentName, amount, dueDate, feeTitle })
    });
    return handleResponse<{ reminderText: string }>(res);
  },

  async aiNoticeGenerator(topic: string, targetAudience: string, keyPoints: string) {
    const res = await fetch('/api/ai/notice-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, targetAudience, keyPoints })
    });
    return handleResponse<{ noticeText: string }>(res);
  },

  async aiQuizGenerator(subject: string, topic: string, grade: string, questionCount: number) {
    const res = await fetch('/api/ai/quiz-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, grade, questionCount })
    });
    return handleResponse<{ quiz: any[] }>(res);
  },

  async aiHomeworkHelper(question: string, subject: string) {
    const res = await fetch('/api/ai/homework-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, subject })
    });
    return handleResponse<{ guidance: string }>(res);
  },

  async aiEventPlanner(eventName: string, targetDate: string, budget: number) {
    const res = await fetch('/api/ai/event-planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, targetDate, budget })
    });
    return handleResponse<{ plan: string }>(res);
  }
};
