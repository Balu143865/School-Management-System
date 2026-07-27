import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Sparkles,
  UserCheck,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  X,
  FileText,
  Phone,
  Mail,
  GraduationCap,
  ChevronRight,
  Info,
  Calendar,
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { User, ChatMessage, UserRole } from '../../types';

export const MessagingView: React.FC = () => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('direct-u-teacher1-u-parent1');
  const [activeRecipient, setActiveRecipient] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'announcements'>('direct');
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [newChatRecipient, setNewChatRecipient] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isAiDrafting, setIsAiDrafting] = useState<boolean>(false);
  const [showStudentContext, setShowStudentContext] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load users and messages
  const loadData = async () => {
    try {
      const [usersData, msgData] = await Promise.all([
        api.getUsers(),
        api.getMessages()
      ]);
      setAllUsers(usersData);
      setMessages(msgData);

      // Default selected recipient based on user role
      if (user) {
        if (role === 'parent') {
          // Find teacher
          const teacher = usersData.find(u => u.role === 'teacher');
          if (teacher) {
            setActiveRecipient(teacher);
            setSelectedChannel(`direct-${teacher.id}-${user.id}`);
          }
        } else if (role === 'teacher') {
          // Find parent
          const parent = usersData.find(u => u.role === 'parent');
          if (parent) {
            setActiveRecipient(parent);
            setSelectedChannel(`direct-${user.id}-${parent.id}`);
          }
        } else {
          // Admin or default
          const parent = usersData.find(u => u.role === 'parent');
          if (parent) {
            setActiveRecipient(parent);
            setSelectedChannel(`direct-u-teacher1-${parent.id}`);
          }
        }
      }
    } catch (err) {
      console.error("Error loading messaging data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Live poll updates every 5s
    return () => clearInterval(interval);
  }, [user, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel]);

  // Compute contacts for conversation list
  const getContactsList = () => {
    if (!user) return [];

    let contacts = allUsers.filter(u => u.id !== user.id);

    if (filterType === 'direct') {
      // Show Parents for Teachers, and Teachers for Parents
      if (role === 'parent') {
        contacts = contacts.filter(u => u.role === 'teacher' || u.role === 'admin');
      } else if (role === 'teacher') {
        contacts = contacts.filter(u => u.role === 'parent' || u.role === 'student' || u.role === 'admin');
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      contacts = contacts.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.childName && u.childName.toLowerCase().includes(q)) ||
        (u.subject && u.subject.toLowerCase().includes(q))
      );
    }

    return contacts;
  };

  // Filter messages for current channel or recipient
  const currentMessages = messages.filter(m => {
    if (selectedChannel === 'announcements') {
      return m.receiverRole === 'all' || m.receiverRole === role;
    }
    if (activeRecipient) {
      return (
        (m.senderId === user?.id && m.receiverId === activeRecipient.id) ||
        (m.senderId === activeRecipient.id && m.receiverId === user?.id) ||
        (m.channelId && m.channelId.includes(activeRecipient.id) && m.channelId.includes(user?.id || ''))
      );
    }
    return m.receiverRole === 'all';
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !attachmentName) return;
    if (!user) return;

    try {
      const channelId = activeRecipient ? `direct-${user.id}-${activeRecipient.id}` : 'announcements';
      const newMsg: Partial<ChatMessage> = {
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role as UserRole,
        receiverRole: activeRecipient ? 'direct' : 'all',
        receiverId: activeRecipient?.id,
        receiverName: activeRecipient?.name,
        channelId,
        text: messageInput.trim(),
        avatar: user.avatar,
        attachmentName: attachmentName || undefined,
        attachmentUrl: attachmentName ? '#' : undefined,
        isRead: false
      };

      const created = await api.sendMessage(newMsg);
      setMessages(prev => [...prev, created]);
      setMessageInput('');
      setAttachmentName('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSelectContact = (contact: User) => {
    setActiveRecipient(contact);
    if (user) {
      setSelectedChannel(`direct-${user.id}-${contact.id}`);
    }
  };

  // Gemini AI Draft Prompts for Teachers & Parents
  const handleAiDraft = async (topicType: 'progress' | 'homework' | 'absence' | 'meeting') => {
    if (!activeRecipient) return;
    setIsAiDrafting(true);

    try {
      let prompt = '';
      if (topicType === 'progress') {
        prompt = `Draft a concise 2-sentence polite progress update message from teacher ${user?.name} to parent ${activeRecipient.name} regarding their child's excellent participation in class this week.`;
      } else if (topicType === 'homework') {
        prompt = `Draft a friendly 2-sentence reminder message from teacher ${user?.name} to parent ${activeRecipient.name} about submitting the upcoming science project by Friday.`;
      } else if (topicType === 'absence') {
        prompt = `Draft a brief, courteous query message from teacher ${user?.name} to parent ${activeRecipient.name} inquiring about the child's absence today and wishing them well.`;
      } else if (topicType === 'meeting') {
        prompt = `Draft a professional request message from ${user?.role === 'parent' ? 'parent ' + user?.name : 'teacher ' + user?.name} to schedule a brief 15-minute Parent-Teacher conference call.`;
      }

      const res = await api.aiChat(prompt, user?.role || 'user', { recipient: activeRecipient.name });
      if (res && res.reply) {
        setMessageInput(res.reply.replace(/^"|"$/g, '').trim());
      }
    } catch (err) {
      setMessageInput(`Hello ${activeRecipient.name}, I wanted to quickly reach out to discuss academic progress and upcoming key assignments.`);
    } finally {
      setIsAiDrafting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
        Initializing Secure Messaging Portal & Connections...
      </div>
    );
  }

  const contactsList = getContactsList();

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0F172A] p-4 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Parent-Teacher Messaging Engine
          </div>
          <h2 className="text-lg font-bold">Internal Communication Portal</h2>
          <p className="text-xs text-slate-300">
            Encrypted direct messaging between parents, teachers, and school administration.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Direct Message</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            title="Refresh messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Messaging Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row h-[620px] overflow-hidden">
        {/* Column 1: Contacts & Channels Sidebar */}
        <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teachers or parents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setFilterType('direct')}
                className={`flex-1 py-1 rounded text-center transition ${
                  filterType === 'direct'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Direct Chats
              </button>
              <button
                onClick={() => {
                  setFilterType('announcements');
                  setSelectedChannel('announcements');
                  setActiveRecipient(null);
                }}
                className={`flex-1 py-1 rounded text-center transition ${
                  filterType === 'announcements'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Broadcasting
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* School Broadcast Item */}
            {filterType === 'announcements' && (
              <button
                onClick={() => {
                  setSelectedChannel('announcements');
                  setActiveRecipient(null);
                }}
                className={`w-full p-3 text-left flex items-start gap-3 transition ${
                  selectedChannel === 'announcements'
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  📢
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">School Broadcast</span>
                    <span className="text-[10px] text-slate-400">Official</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    Announcements for all teachers & parents
                  </p>
                </div>
              </button>
            )}

            {/* Direct Contact Users */}
            {filterType === 'direct' && contactsList.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No active contacts found. Click "New Direct Message" above.
              </div>
            )}

            {filterType === 'direct' && contactsList.map((contact) => {
              const isActive = activeRecipient?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full p-3 text-left flex items-start gap-3 transition ${
                    isActive
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                      alt={contact.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate">{contact.name}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                        {contact.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {contact.role === 'parent' && contact.childName ? (
                        <span>Parent of {contact.childName}</span>
                      ) : contact.subject ? (
                        <span>{contact.subject}</span>
                      ) : (
                        <span>{contact.email}</span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Main Chat Box */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            {activeRecipient ? (
              <div className="flex items-center gap-3">
                <img
                  src={activeRecipient.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={activeRecipient.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{activeRecipient.name}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded capitalize">
                      {activeRecipient.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    {activeRecipient.role === 'parent' && (
                      <span>Student: {activeRecipient.childName || 'Alex Johnson'}</span>
                    )}
                    {activeRecipient.phone && <span>• {activeRecipient.phone}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm">
                  📢
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">School-wide Broadcasting Channel</h3>
                  <p className="text-[11px] text-slate-500">Official circulars & general announcements</p>
                </div>
              </div>
            )}

            {activeRecipient && (
              <button
                onClick={() => setShowStudentContext(!showStudentContext)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 transition"
              >
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{showStudentContext ? 'Hide Info' : 'Student Info'}</span>
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs font-semibold">No message history yet</p>
                <p className="text-[11px] mt-1 text-slate-400">
                  Send a message below or use Gemini AI assistance to draft a note.
                </p>
              </div>
            ) : (
              currentMessages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {!isMe && (
                      <img
                        src={m.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={m.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-300"
                      />
                    )}
                    <div>
                      <div className={`flex items-center gap-1.5 text-[10px] mb-1 text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-semibold text-slate-700">{isMe ? 'You' : m.senderName}</span>
                        <span className="capitalize px-1 py-0.2 bg-slate-200 text-slate-600 rounded font-mono text-[9px]">
                          {m.senderRole}
                        </span>
                        <span>• {m.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>

                        {m.attachmentName && (
                          <div className={`mt-2 p-2 rounded flex items-center gap-2 border text-[11px] ${
                            isMe ? 'bg-blue-700/60 border-blue-400/40 text-blue-100' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-semibold truncate">{m.attachmentName}</span>
                          </div>
                        )}
                      </div>

                      {isMe && (
                        <div className="text-[9px] text-slate-400 text-right mt-0.5 font-mono flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" /> Delivered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Helper Bar */}
          {activeRecipient && (
            <div className="px-3 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="font-bold text-blue-700 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> AI Draft:
              </span>
              <button
                onClick={() => handleAiDraft('progress')}
                disabled={isAiDrafting}
                className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 rounded font-medium shrink-0 transition"
              >
                Progress Note
              </button>
              <button
                onClick={() => handleAiDraft('homework')}
                disabled={isAiDrafting}
                className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 rounded font-medium shrink-0 transition"
              >
                Homework Reminder
              </button>
              <button
                onClick={() => handleAiDraft('absence')}
                disabled={isAiDrafting}
                className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 rounded font-medium shrink-0 transition"
              >
                Absence Enquiry
              </button>
              <button
                onClick={() => handleAiDraft('meeting')}
                disabled={isAiDrafting}
                className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 rounded font-medium shrink-0 transition"
              >
                Schedule Call
              </button>
            </div>
          )}

          {/* Message Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white space-y-2">
            {attachmentName && (
              <div className="flex items-center justify-between text-xs p-1.5 bg-amber-50 border border-amber-200 rounded text-amber-800">
                <span className="flex items-center gap-1 font-medium truncate">
                  <Paperclip className="w-3.5 h-3.5" /> Attached: {attachmentName}
                </span>
                <button type="button" onClick={() => setAttachmentName('')} className="text-amber-600 hover:text-amber-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer transition">
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAttachmentName(file.name);
                  }}
                />
              </label>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  activeRecipient
                    ? `Type a secure message to ${activeRecipient.name}...`
                    : "Post broadcast announcement to all users..."
                }
                className="flex-1 py-2 px-3 bg-slate-100 border border-slate-200 focus:border-blue-500 focus:bg-white rounded text-xs text-slate-800 outline-none transition"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Column 3: Context Panel (Student Performance & Details) */}
        {activeRecipient && showStudentContext && (
          <div className="w-full md:w-64 border-l border-slate-200 bg-slate-50 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Contextual Details
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">
                    {activeRecipient.role === 'parent' ? activeRecipient.childName || 'Alex Johnson' : 'Class 10-A'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Attendance Rate:</span>
                    <span className="font-bold text-emerald-600">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grade Average:</span>
                    <span className="font-bold text-slate-900">3.92 GPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Clearance:</span>
                    <span className="font-bold text-amber-600">Term 1 Paid</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Quick Portal Shortcuts
              </div>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => alert("Scheduled a Parent-Teacher conference request.")}
                  className="w-full p-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 rounded font-medium flex items-center justify-between text-left transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Schedule Call
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => alert("Report card overview generated.")}
                  className="w-full p-2 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 rounded font-medium flex items-center justify-between text-left transition"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Report Card
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="mt-auto p-3 bg-blue-100/60 border border-blue-200 rounded text-[11px] text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Privacy & Audit
              </p>
              <p className="text-[10px] text-blue-800">
                Messages in this portal are logged for academic record compliance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Direct Message Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Start Direct Conversation
              </h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Contact Person</label>
              <select
                value={newChatRecipient}
                onChange={(e) => setNewChatRecipient(e.target.value)}
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Teacher or Parent --</option>
                {allUsers
                  .filter(u => u.id !== user?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.toUpperCase()}) {u.childName ? `- Parent of ${u.childName}` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetUser = allUsers.find(u => u.id === newChatRecipient);
                  if (targetUser) {
                    handleSelectContact(targetUser);
                    setShowNewChatModal(false);
                  }
                }}
                disabled={!newChatRecipient}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded shadow-2xs"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
