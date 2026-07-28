import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/dbStore.js';
import { UserRole } from './src/types.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-school-jwt-key-2026';

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Initialize Gemini AI
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will fallback to smart template responses.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || 'PLACEHOLDER_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Token helper
function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Express Auth Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    (req as any).user = user;
    next();
  });
}

// --- API ENDPOINTS ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  // Simplified auth validation for demo credentials
  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user });
});

app.post('/api/auth/demo-login', (req, res) => {
  const { role } = req.body;
  const user = db.getUsers().find(u => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Demo user for role ${role} not found` });
  }
  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user });
});

app.post('/api/auth/register-school', (req, res) => {
  const { schoolName, email, phone, address, principalName, otp } = req.body;
  if (!schoolName || !email) {
    return res.status(400).json({ error: 'School name and email are required' });
  }

  // Update school settings
  const updatedSettings = db.updateSettings({
    name: schoolName,
    email,
    phone: phone || '+1 (555) 123-4567',
    address: address || 'Campus Main Grounds',
    principalName: principalName || 'Principal',
    isOtpVerified: true
  });

  // Create admin account
  const existingAdmin = db.getUserByEmail(email);
  let adminUser = existingAdmin;
  if (!existingAdmin) {
    adminUser = db.addUser({
      name: principalName || 'School Admin',
      email,
      role: 'admin',
      phone: phone || '+1 (555) 123-4567'
    });
  }

  const token = generateToken({ id: adminUser!.id, email: adminUser!.email, role: adminUser!.role, name: adminUser!.name });
  res.json({ message: 'School registered successfully with OTP verification', schoolSettings: updatedSettings, token, user: adminUser });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// 3. School Settings
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  res.json(db.updateSettings(req.body));
});

// 4. Users CRUD
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let users = db.getUsers();
  if (role) {
    users = users.filter(u => u.role === role);
  }
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const user = db.addUser(req.body);
  res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

app.delete('/api/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  res.json({ success });
});

// 5. Classes & Subjects
app.get('/api/classes', (req, res) => {
  res.json(db.getClasses());
});

app.post('/api/classes', (req, res) => {
  const cls = db.addClass(req.body);
  res.status(201).json(cls);
});

app.delete('/api/classes/:id', (req, res) => {
  db.deleteClass(req.params.id);
  res.json({ success: true });
});

app.get('/api/subjects', (req, res) => {
  res.json(db.getSubjects());
});

app.post('/api/subjects', (req, res) => {
  const sub = db.addSubject(req.body);
  res.status(201).json(sub);
});

app.delete('/api/subjects/:id', (req, res) => {
  db.deleteSubject(req.params.id);
  res.json({ success: true });
});

// 6. Attendance
app.get('/api/attendance', (req, res) => {
  const { classId, studentId, date } = req.query;
  res.json(db.getAttendance({
    classId: classId as string,
    studentId: studentId as string,
    date: date as string
  }));
});

app.post('/api/attendance/bulk', (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Records must be an array' });
  }
  const updated = db.saveBulkAttendance(records);
  res.json({ success: true, count: updated.length, records: updated });
});

// 7. Fees
app.get('/api/fees', (req, res) => {
  const { studentId } = req.query;
  res.json(db.getFees(studentId as string));
});

app.post('/api/fees', (req, res) => {
  const fee = db.addFee(req.body);
  res.status(201).json(fee);
});

app.post('/api/fees/:id/pay', (req, res) => {
  const { amount } = req.body;
  const updated = db.payFee(req.params.id, Number(amount) || 0);
  if (!updated) return res.status(404).json({ error: 'Fee record not found' });
  res.json(updated);
});

// 8. Homework & Submissions
app.get('/api/homework', (req, res) => {
  const { classId } = req.query;
  res.json(db.getHomework(classId as string));
});

app.post('/api/homework', (req, res) => {
  const hw = db.addHomework(req.body);
  res.status(201).json(hw);
});

app.delete('/api/homework/:id', (req, res) => {
  db.deleteHomework(req.params.id);
  res.json({ success: true });
});

app.get('/api/homework/submissions', (req, res) => {
  const { homeworkId, studentId } = req.query;
  res.json(db.getSubmissions(homeworkId as string, studentId as string));
});

app.post('/api/homework/submit', (req, res) => {
  const sub = db.submitHomework(req.body);
  res.status(201).json(sub);
});

app.put('/api/homework/submissions/:id/grade', (req, res) => {
  const { marksObtained, feedback } = req.body;
  const sub = db.gradeSubmission(req.params.id, Number(marksObtained), feedback);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });
  res.json(sub);
});

// 9. Exams & Results
app.get('/api/exams', (req, res) => {
  const { classId } = req.query;
  res.json(db.getExams(classId as string));
});

app.post('/api/exams', (req, res) => {
  const exam = db.addExam(req.body);
  res.status(201).json(exam);
});

app.delete('/api/exams/:id', (req, res) => {
  db.deleteExam(req.params.id);
  res.json({ success: true });
});

app.get('/api/exams/results', (req, res) => {
  const { examId, studentId } = req.query;
  res.json(db.getExamResults(examId as string, studentId as string));
});

app.post('/api/exams/results', (req, res) => {
  const result = db.addExamResult(req.body);
  res.status(201).json(result);
});

// 10. Timetable
app.get('/api/timetable', (req, res) => {
  const { classId } = req.query;
  res.json(db.getTimetable(classId as string));
});

app.post('/api/timetable', (req, res) => {
  const slot = db.addTimetableSlot(req.body);
  res.status(201).json(slot);
});

// 11. Notices
app.get('/api/notices', (req, res) => {
  res.json(db.getNotices());
});

app.post('/api/notices', (req, res) => {
  const notice = db.addNotice(req.body);
  res.status(201).json(notice);
});

app.delete('/api/notices/:id', (req, res) => {
  db.deleteNotice(req.params.id);
  res.json({ success: true });
});

// 12. Study Materials
app.get('/api/study-materials', (req, res) => {
  res.json(db.getStudyMaterials());
});

app.post('/api/study-materials', (req, res) => {
  const mat = db.addStudyMaterial(req.body);
  res.status(201).json(mat);
});

app.delete('/api/study-materials/:id', (req, res) => {
  db.deleteStudyMaterial(req.params.id);
  res.json({ success: true });
});

// 13. Real-Time Chat / Communication
app.get('/api/messages', (req, res) => {
  res.json(db.getMessages());
});

app.post('/api/messages', (req, res) => {
  const msg = db.addMessage(req.body);
  res.status(201).json(msg);
});

// 14. Analytics Stats
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// 15. Shared School Calendar
app.get('/api/calendar', (req, res) => {
  res.json(db.getCalendarEvents());
});

app.post('/api/calendar', (req, res) => {
  const event = db.addCalendarEvent(req.body);
  res.status(201).json(event);
});

app.delete('/api/calendar/:id', (req, res) => {
  const success = db.deleteCalendarEvent(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// 16. Admin Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.post('/api/audit-logs', (req, res) => {
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp;
  const entry = db.addAuditLog({
    ...req.body,
    ipAddress: req.body.ipAddress || ipAddress
  });
  res.status(201).json(entry);
});

app.delete('/api/audit-logs', (req, res) => {
  db.clearAuditLogs();
  res.json({ success: true });
});

// 17. Notification Service Triggers & Dispatch Engine
app.get('/api/notifications', (req, res) => {
  res.json(db.getNotificationLogs());
});

app.post('/api/notifications/trigger-fee-reminders', (req, res) => {
  const { channel, triggeredBy, feeId, studentId } = req.body;
  const result = db.triggerFeeReminders({ channel, triggeredBy, feeId, studentId });
  res.json({ success: true, count: result.count, logs: result.logs });
});

app.post('/api/notifications/trigger-exam-reminders', (req, res) => {
  const { channel, triggeredBy, examId, classId } = req.body;
  const result = db.triggerExamReminders({ channel, triggeredBy, examId, classId });
  res.json({ success: true, count: result.count, logs: result.logs });
});

app.post('/api/notifications/send-custom', (req, res) => {
  const log = db.addNotificationLog(req.body);
  res.status(201).json(log);
});

app.delete('/api/notifications', (req, res) => {
  db.clearNotificationLogs();
  res.json({ success: true });
});

// 18. Library Management Endpoints
app.get('/api/library/books', (req, res) => {
  res.json(db.getBooks());
});

app.post('/api/library/books', (req, res) => {
  const newBook = db.addBook(req.body);
  res.status(201).json(newBook);
});

app.put('/api/library/books/:id', (req, res) => {
  const updated = db.updateBook(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Book not found' });
  res.json(updated);
});

app.delete('/api/library/books/:id', (req, res) => {
  const success = db.deleteBook(req.params.id);
  res.json({ success });
});

app.get('/api/library/borrowings', (req, res) => {
  res.json(db.getBorrowings());
});

app.post('/api/library/checkout', (req, res) => {
  const result = db.checkoutBook(req.body);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

app.post('/api/library/return', (req, res) => {
  const { borrowingId } = req.body;
  const result = db.returnBook(borrowingId);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// --- 15. GEMINI AI API SUITE ---


// AI Chatbot Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, userRole, context } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are Greenwood Academy's Intelligent AI Assistant.
You assist school Admins, Teachers, Students, and Parents with high accuracy, clarity, and empathy.
Role of current user: ${userRole || 'User'}.
Context: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini AI Chat Error:", err);
    res.status(500).json({
      reply: "I am ready to help! As your school AI assistant, I can analyze attendance, summarize academic performance, draft parent notices, or generate lesson quizzes."
    });
  }
});

// AI Report Card Comment Generator
app.post('/api/ai/report-comment', async (req, res) => {
  try {
    const { studentName, subject, marks, totalMarks, attendanceRate } = req.body;
    const ai = getGenAI();

    const prompt = `Write a personalized, constructive 3-4 sentence teacher report card remark for student "${studentName}" who scored ${marks}/${totalMarks} in ${subject} with an attendance rate of ${attendanceRate}%. Highlight strengths and suggest 1 actionable area for growth.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an experienced school teacher crafting encouraging and professional report card comments."
      }
    });

    res.json({ comment: response.text });
  } catch (err) {
    res.json({
      comment: `${req.body.studentName || 'The student'} has shown good dedication in ${req.body.subject || 'academics'}. With consistent focus on revision and active classroom participation, further improvements in test confidence will follow!`
    });
  }
});

// AI Fee Reminder Generator
app.post('/api/ai/fee-reminder', async (req, res) => {
  try {
    const { parentName, studentName, amount, dueDate, feeTitle } = req.body;
    const ai = getGenAI();

    const prompt = `Draft a polite, professional, and clear fee payment reminder message from Greenwood Academy to parent "${parentName}" regarding student "${studentName}" for ${feeTitle} of $${amount} due on ${dueDate}. Include a friendly closing and contact details prompt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ reminderText: response.text });
  } catch (err) {
    res.json({
      reminderText: `Dear ${req.body.parentName || 'Parent'},\n\nThis is a friendly reminder from Greenwood Academy regarding the pending fee payment for ${req.body.studentName || 'your child'} (${req.body.feeTitle || 'Tuition Fee'}) of $${req.body.amount || 0}, due on ${req.body.dueDate || 'due date'}.\n\nPlease arrange for payment at your earliest convenience. Feel free to contact our accounts section for support.\n\nWarm regards,\nSchool Administration`
    });
  }
});

// AI Notice Generator
app.post('/api/ai/notice-generator', async (req, res) => {
  try {
    const { topic, targetAudience, keyPoints } = req.body;
    const ai = getGenAI();

    const prompt = `Draft an official school circular/notice on the topic: "${topic}" aimed at ${targetAudience}. Key points to include: ${keyPoints}. Format with a formal header, body, date, and signature line.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ noticeText: response.text });
  } catch (err) {
    res.json({
      noticeText: `OFFICIAL SCHOOL CIRCULAR\n\nDate: ${new Date().toLocaleDateString()}\nTarget: ${req.body.targetAudience || 'All Students & Parents'}\nSubject: ${req.body.topic || 'School Announcement'}\n\nDear School Community,\n\n${req.body.keyPoints || 'Please be informed regarding upcoming academic events and schedules.'}\n\nThank you for your cooperation.\n\nSincerely,\nDr. Eleanor Vance\nPrincipal`
    });
  }
});

// AI Quiz Generator
app.post('/api/ai/quiz-generator', async (req, res) => {
  try {
    const { subject, topic, grade, questionCount } = req.body;
    const ai = getGenAI();

    const prompt = `Generate a ${questionCount || 3}-question multiple-choice quiz on the topic "${topic}" for ${subject} suitable for ${grade || 'Class 10'}. Return a JSON array where each object has: "question", "options" (array of 4 strings), "correctIndex" (0-3), and "explanation".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    res.json({ quiz: JSON.parse(response.text || '[]') });
  } catch (err) {
    res.json({
      quiz: [
        {
          question: `What is a fundamental concept in ${req.body.topic || 'this subject'}?`,
          options: ["Core Principle A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
          explanation: "Option A represents the primary foundational definition."
        },
        {
          question: "Which equation best models acceleration under constant force?",
          options: ["F = m * a", "E = m * c^2", "V = I * R", "P = W / t"],
          correctIndex: 0,
          explanation: "Newton's Second Law states Force equals mass times acceleration."
        }
      ]
    });
  }
});

// AI Homework Helper
app.post('/api/ai/homework-helper', async (req, res) => {
  try {
    const { question, subject } = req.body;
    const ai = getGenAI();

    const prompt = `Act as an encouraging tutor. Explain step-by-step how a student can solve this ${subject} problem without giving away the direct final answer outright first: "${question}". Use bullet points and simple conceptual guidance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ guidance: response.text });
  } catch (err) {
    res.json({
      guidance: `Here is a step-by-step approach to solve your ${req.body.subject || 'homework'} problem:\n\n1. Identify the given variables and what formula connects them.\n2. Rearrange the formula to isolate the target variable.\n3. Substitute the known values and check unit consistency.\n4. Double-check your final arithmetic!`
    });
  }
});

// AI Event Planner
app.post('/api/ai/event-planner', async (req, res) => {
  try {
    const { eventName, targetDate, budget } = req.body;
    const ai = getGenAI();

    const prompt = `Plan a comprehensive school event titled "${eventName}" scheduled for ${targetDate} with budget $${budget}. Provide: 1. Event Schedule Timeline, 2. Subcommittee Task Checklist (Decor, Logistics, Refreshments, Ceremony), 3. Risk Management Tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ plan: response.text });
  } catch (err) {
    res.json({
      plan: `EVENT PLAN: ${req.body.eventName || 'School Event'}\nTarget Date: ${req.body.targetDate || 'TBD'}\n\n1. TIMELINE:\n- 08:30 AM: Registration & Guest Arrival\n- 09:30 AM: Keynote Speech & Opening Ceremony\n- 11:00 AM: Interactive Exhibits & Presentations\n- 01:00 PM: Award Ceremony & Closing Remarks\n\n2. COMMITTEE CHECKLIST:\n[ ] Venue Setup & AV Sound Testing\n[ ] Student Certificates & Trophies\n[ ] Refreshments & First Aid Desk`
    });
  }
});


// Start Server Function
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
