import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Sparkles, MessageSquare, HelpCircle, FileText, Bell, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AIAssistantSuite: React.FC = () => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<'chat' | 'quiz' | 'notice' | 'fee' | 'homework'>('chat');

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your Gemini-powered AI Education Assistant. Ask me anything about lesson planning, administrative tasks, homework help, or school circulars!'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Quiz state
  const [quizSubject, setQuizSubject] = useState('Physics');
  const [quizTopic, setQuizTopic] = useState('Newton Laws of Motion');
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // Fee reminder state
  const [parentName, setParentName] = useState('Mr. David Johnson');
  const [childName, setChildName] = useState('Alex Johnson');
  const [dueAmount, setDueAmount] = useState(450);
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [feeMessage, setFeeMessage] = useState('');
  const [feeLoading, setFeeLoading] = useState(false);

  // Circular generator state
  const [noticeTopic, setNoticeTopic] = useState('Annual Sports Day Meet');
  const [noticeAudience, setNoticeAudience] = useState('Parents & Students');
  const [noticeDate, setNoticeDate] = useState('August 20th, 2026');
  const [generatedNotice, setGeneratedNotice] = useState<string>('');
  const [noticeLoading, setNoticeLoading] = useState(false);

  // Homework helper state
  const [hwQuestion, setHwQuestion] = useState('How do I solve quadratic equations using the quadratic formula?');
  const [hwGuidance, setHwGuidance] = useState<any>(null);
  const [hwLoading, setHwLoading] = useState(false);

  // Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.aiChat(userMsg, user?.role || 'admin');
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Error connecting to Gemini AI API server.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await api.aiQuizGenerator(quizSubject, quizTopic, 'Grade 10', 3);
      setGeneratedQuiz(res.quiz);
    } catch (e) {
      console.error(e);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateFeeReminder = async () => {
    setFeeLoading(true);
    try {
      const res = await api.aiFeeReminder(parentName, childName, dueAmount, dueDate, 'Q3 Term Tuition Fee');
      setFeeMessage(res.reminderText);
    } catch (e) {
      console.error(e);
    } finally {
      setFeeLoading(false);
    }
  };

  const handleGenerateNotice = async () => {
    setNoticeLoading(true);
    try {
      const res = await api.aiNoticeGenerator(noticeTopic, noticeAudience, noticeDate);
      setGeneratedNotice(res.noticeText);
    } catch (e) {
      console.error(e);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleGetHwHelp = async () => {
    setHwLoading(true);
    try {
      const res = await api.aiHomeworkHelper(hwQuestion, 'Mathematics');
      setHwGuidance(res.guidance);
    } catch (e) {
      console.error(e);
    } finally {
      setHwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] p-5 rounded-xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-blue-400" /> Gemini AI Education Intelligence Suite
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Smart Academic Assistant</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Powered by Google Gemini 2.5 Flash for quiz creation, automated reminders, homework tutoring, and administrative drafting.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
        {[
          { id: 'chat', label: 'AI Assistant Chat', icon: MessageSquare },
          { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle },
          { id: 'notice', label: 'Circular Writer', icon: Bell },
          { id: 'fee', label: 'Fee Reminder Writer', icon: FileText },
          { id: 'homework', label: 'Homework Tutor', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTool(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition shrink-0 ${
                isActive
                  ? 'bg-white text-blue-600 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool Views */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        {/* Chat Tool */}
        {activeTool === 'chat' && (
          <div className="space-y-4 flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="text-slate-400 italic text-[11px] animate-pulse">
                  Gemini AI is generating response...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Gemini AI for teaching ideas, lesson schedules, circulars, or code..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Quiz Generator */}
        {activeTool === 'quiz' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Topic / Chapter</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={quizLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{quizLoading ? 'Generating Quiz...' : 'Generate MCQ Quiz with Gemini AI'}</span>
            </button>

            {generatedQuiz && (
              <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">{generatedQuiz.title || 'AI Quiz'}</h4>
                <div className="space-y-3">
                  {generatedQuiz.questions?.map((q: any, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-emerald-200/80 space-y-1.5">
                      <p className="font-semibold text-slate-900">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {q.options?.map((opt: string, optIdx: number) => (
                          <span
                            key={optIdx}
                            className={`p-2 rounded border text-[11px] ${
                              opt === q.correctAnswer ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Circular Writer */}
        {activeTool === 'notice' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notice Event / Subject</label>
                <input
                  type="text"
                  value={noticeTopic}
                  onChange={(e) => setNoticeTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={noticeAudience}
                  onChange={(e) => setNoticeAudience(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Event Date</label>
                <input
                  type="text"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateNotice}
              disabled={noticeLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{noticeLoading ? 'Drafting...' : 'Draft Formal Circular with Gemini'}</span>
            </button>

            {generatedNotice && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-4">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{generatedNotice}</p>
              </div>
            )}
          </div>
        )}

        {/* Fee Reminder Writer */}
        {activeTool === 'fee' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Child Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateFeeReminder}
              disabled={feeLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{feeLoading ? 'Writing Message...' : 'Draft Polite Fee Reminder'}</span>
            </button>

            {feeMessage && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-4">
                <p className="text-slate-700 leading-relaxed">{feeMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Homework Tutor */}
        {activeTool === 'homework' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Enter Problem / Question</label>
              <textarea
                rows={3}
                value={hwQuestion}
                onChange={(e) => setHwQuestion(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleGetHwHelp}
              disabled={hwLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{hwLoading ? 'Analyzing Step-by-Step...' : 'Get Gemini Tutoring Step Guidance'}</span>
            </button>

            {hwGuidance && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 mt-4">
                <div className="font-bold text-emerald-900 text-sm">Key Concept: {hwGuidance.concept}</div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-800">Guided Steps:</p>
                  {hwGuidance.steps?.map((step: string, i: number) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-emerald-200 text-slate-700">
                      Step {i + 1}: {step}
                    </div>
                  ))}
                </div>
                <p className="text-emerald-800 font-medium italic">Hint: {hwGuidance.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
