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
    try {
      return await fetchWithCache<SchoolSettings>('settings', async () => {
        const res = await fetch('/api/settings');
        return handleResponse<SchoolSettings>(res);
      });
    } catch {
      return {
        name: "Greenwood International Academy",
        code: "GIA-2026",
        tagline: "Excellence in Education & Character Building",
        address: "Macherla, Palnadu, AP - 522426",
        phone: "+91 63040 45279",
        email: "contact@greenwood.edu",
        academicYear: "2025-2026",
        logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=200&q=80",
        principalName: "Dr. Balu Naik, B. Tech",
        isOtpVerified: true
      };
    }
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
    const cacheKey = role ? `users_${role}` : 'users_all';
    try {
      return await fetchWithCache<User[]>(cacheKey, async () => {
        const url = role ? `/api/users?role=${role}` : '/api/users';
        const res = await fetch(url, { headers: getAuthHeader() });
        return handleResponse<User[]>(res);
      });
    } catch (err) {
      console.warn(`[getUsers] Fetch failed, returning cached or empty list:`, err);
      const cached = offlineStorage.get<User[]>(cacheKey) || offlineStorage.get<User[]>('users_all');
      return cached ? cached.data : [];
    }
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

  async deleteSubject(id: string) {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
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

  async deleteHomework(id: string) {
    const res = await fetch(`/api/homework/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
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

  async deleteExam(id: string) {
    const res = await fetch(`/api/exams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
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

  async deleteNotice(id: string) {
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
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

  async deleteStudyMaterial(id: string) {
    const res = await fetch(`/api/study-materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Messages
  async getMessages() {
    try {
      return await fetchWithCache<ChatMessage[]>('messages', async () => {
        const res = await fetch('/api/messages');
        return handleResponse<ChatMessage[]>(res);
      });
    } catch (err) {
      console.warn(`[getMessages] Fetch failed, returning cached or empty list:`, err);
      const cached = offlineStorage.get<ChatMessage[]>('messages');
      return cached ? cached.data : [];
    }
  },

  async sendMessage(msg: Partial<ChatMessage>) {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(msg)
      });
      const created = await handleResponse<ChatMessage>(res);
      const cached = offlineStorage.get<ChatMessage[]>('messages');
      if (cached) {
        offlineStorage.set('messages', [...cached.data, created]);
      }
      return created;
    } catch (err) {
      console.warn('[sendMessage] Server fetch failed, storing message locally:', err);
      const newMsg: ChatMessage = {
        id: `msg-local-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: msg.senderId || 'user',
        senderName: msg.senderName || 'You',
        senderRole: msg.senderRole || 'parent',
        receiverRole: msg.receiverRole || 'direct',
        receiverId: msg.receiverId,
        receiverName: msg.receiverName,
        channelId: msg.channelId,
        text: msg.text || '',
        avatar: msg.avatar,
        attachmentName: msg.attachmentName,
        attachmentUrl: msg.attachmentUrl,
        isRead: false
      };
      const cached = offlineStorage.get<ChatMessage[]>('messages');
      const updated = cached ? [...cached.data, newMsg] : [newMsg];
      offlineStorage.set('messages', updated);
      return newMsg;
    }
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
  },

  // Notification Service Triggers
  async getNotificationLogs() {
    return fetchWithCache<NotificationLog[]>('notifications_logs', async () => {
      const res = await fetch('/api/notifications', { headers: getAuthHeader() });
      return handleResponse<NotificationLog[]>(res);
    });
  },

  async triggerFeeReminders(data?: { channel?: string; triggeredBy?: string; feeId?: string; studentId?: string }) {
    const res = await fetch('/api/notifications/trigger-fee-reminders', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data || {})
    });
    return handleResponse<{ success: boolean; count: number; logs: NotificationLog[] }>(res);
  },

  async triggerExamReminders(data?: { channel?: string; triggeredBy?: string; examId?: string; classId?: string }) {
    const res = await fetch('/api/notifications/trigger-exam-reminders', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data || {})
    });
    return handleResponse<{ success: boolean; count: number; logs: NotificationLog[] }>(res);
  },

  async sendCustomNotification(log: Partial<NotificationLog>) {
    const res = await fetch('/api/notifications/send-custom', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(log)
    });
    return handleResponse<NotificationLog>(res);
  },

  async clearNotificationLogs() {
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Library Management
  async getBooks() {
    return fetchWithCache<Book[]>('library_books', async () => {
      const res = await fetch('/api/library/books', { headers: getAuthHeader() });
      return handleResponse<Book[]>(res);
    });
  },

  async addBook(book: Omit<Book, 'id'>) {
    const res = await fetch('/api/library/books', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(book)
    });
    return handleResponse<Book>(res);
  },

  async updateBook(id: string, updates: Partial<Book>) {
    const res = await fetch(`/api/library/books/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Book>(res);
  },

  async deleteBook(id: string) {
    const res = await fetch(`/api/library/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getBorrowings() {
    return fetchWithCache<BookBorrowing[]>('library_borrowings', async () => {
      const res = await fetch('/api/library/borrowings', { headers: getAuthHeader() });
      return handleResponse<BookBorrowing[]>(res);
    });
  },

  async checkoutBook(data: {
    bookId: string;
    studentId: string;
    studentName: string;
    studentClass: string;
    dueDate: string;
    issuedBy?: string;
  }) {
    const res = await fetch('/api/library/checkout', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse<BookBorrowing>(res);
  },

  async returnBook(borrowingId: string) {
    const res = await fetch('/api/library/return', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ borrowingId })
    });
    return handleResponse<BookBorrowing>(res);
  }
};

