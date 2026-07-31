import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  User,
  Users,
  Award,
  Sun,
  X,
  Trash2,
  CalendarDays,
  ListFilter,
  Download,
  Info,
  CheckCircle2,
  RefreshCw,
  Palette
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CalendarEvent, Exam } from '../../types';

export const SchoolCalendar: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [deleteEventTarget, setDeleteEventTarget] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDayForNewEvent, setSelectedDayForNewEvent] = useState<string>('');

  // New Event Form State
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    type: 'event',
    targetRole: 'all',
    className: 'All Classes',
    location: 'Main Campus',
    organizer: user?.name || 'School Admin',
    color: 'blue'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getCalendarEvents();
      
      // Fetch exams from ExamManager to auto-sync if any missing
      const examList = await api.getExams().catch(() => [] as Exam[]);
      const existingKeys = new Set(data.map(e => `${e.title.toLowerCase()}_${e.date}`));

      const newlyImported: CalendarEvent[] = [];
      for (const exam of examList) {
        const titleKey = `[exam] ${exam.title.toLowerCase()} - ${exam.subjectName.toLowerCase()}_${exam.date}`;
        const titleKeyAlt = `${exam.title.toLowerCase()} (${exam.subjectName.toLowerCase()})_${exam.date}`;
        
        if (!existingKeys.has(titleKey) && !existingKeys.has(titleKeyAlt)) {
          let examColor = 'rose';
          if (exam.type === 'Final Exam') examColor = 'red';
          else if (exam.type === 'Midterm') examColor = 'rose';
          else if (exam.type === 'Unit Test') examColor = 'amber';
          else if (exam.type === 'Quiz') examColor = 'purple';

          try {
            const created = await api.createCalendarEvent({
              title: `[Exam] ${exam.title} - ${exam.subjectName}`,
              description: `[Auto-Imported from ExamManager] ${exam.type} for ${exam.subjectName} (${exam.className}). Total Marks: ${exam.totalMarks}, Passing Marks: ${exam.passingMarks}. Duration: ${exam.durationMinutes} mins.`,
              date: exam.date,
              startTime: exam.startTime || '09:00 AM',
              type: 'exam',
              targetRole: 'all',
              className: exam.className,
              location: 'Examination Hall',
              organizer: 'Exam Coordinator / Teacher',
              color: examColor
            });
            newlyImported.push(created);
          } catch (e) {
            console.error('Auto-import single exam failed:', e);
          }
        }
      }

      setEvents([...data, ...newlyImported]);
      if (newlyImported.length > 0) {
        showToast(`Auto-imported ${newlyImported.length} exam schedule item(s) from ExamManager.`);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => {
      setSyncToast(null);
    }, 4000);
  };

  const handleSyncExams = async () => {
    setIsSyncing(true);
    try {
      const examList = await api.getExams();
      const currentCalendarEvents = await api.getCalendarEvents();
      const existingKeys = new Set(
        currentCalendarEvents.map((e) => `${e.title.toLowerCase()}_${e.date}`)
      );

      let importedCount = 0;
      const createdEvents: CalendarEvent[] = [];

      for (const exam of examList) {
        const titleKey = `[exam] ${exam.title.toLowerCase()} - ${exam.subjectName.toLowerCase()}_${exam.date}`;
        const titleKeyAlt = `${exam.title.toLowerCase()} (${exam.subjectName.toLowerCase()})_${exam.date}`;

        if (!existingKeys.has(titleKey) && !existingKeys.has(titleKeyAlt)) {
          let examColor = 'rose';
          if (exam.type === 'Final Exam') examColor = 'red';
          else if (exam.type === 'Midterm') examColor = 'rose';
          else if (exam.type === 'Unit Test') examColor = 'amber';
          else if (exam.type === 'Quiz') examColor = 'purple';

          const created = await api.createCalendarEvent({
            title: `[Exam] ${exam.title} - ${exam.subjectName}`,
            description: `[Imported from ExamManager] ${exam.type} for ${exam.subjectName} (${exam.className}). Total Marks: ${exam.totalMarks}, Passing Marks: ${exam.passingMarks}. Duration: ${exam.durationMinutes} mins.`,
            date: exam.date,
            startTime: exam.startTime || '09:00 AM',
            type: 'exam',
            targetRole: 'all',
            className: exam.className,
            location: 'Examination Hall',
            organizer: 'Exam Coordinator / Teacher',
            color: examColor
          });
          createdEvents.push(created);
          importedCount++;
        }
      }

      if (importedCount > 0) {
        setEvents((prev) => [...prev, ...createdEvents]);
        showToast(`Successfully imported ${importedCount} exam date(s) from ExamManager!`);
      } else {
        showToast('All ExamManager schedules are already synchronized with the Calendar.');
      }
    } catch (err) {
      console.error('Failed to sync exams:', err);
      showToast('Failed to sync exam dates. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    try {
      // Auto-assign appropriate default color if not manually set
      let assignedColor = newEvent.color;
      if (!assignedColor) {
        if (newEvent.type === 'holiday') assignedColor = 'emerald';
        else if (newEvent.type === 'exam') assignedColor = 'rose';
        else if (newEvent.type === 'meeting') assignedColor = 'indigo';
        else if (newEvent.type === 'academic') assignedColor = 'teal';
        else assignedColor = 'blue';
      }

      const created = await api.createCalendarEvent({
        ...newEvent,
        color: assignedColor,
        organizer: newEvent.organizer || user?.name || 'Administration'
      });
      setEvents((prev) => [...prev, created]);
      setIsAddModalOpen(false);
      showToast(`Scheduled "${created.title}" successfully!`);
      setNewEvent({
        title: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        type: 'event',
        targetRole: 'all',
        className: 'All Classes',
        location: 'Main Campus',
        organizer: user?.name || 'School Admin',
        color: 'blue'
      });
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteCalendarEvent(deleteEventTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteEventTarget.id));
      setSelectedEvent(null);
      setDeleteEventTarget(null);
      showToast('Event removed from calendar.');
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Month Navigation
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() - 7);
      setCurrentDate(newD);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newD = new Date(currentDate);
      newD.setDate(newD.getDate() + 7);
      setCurrentDate(newD);
    }
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Helpers for Month Grid Generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter events
  const filteredEvents = events.filter(evt => {
    const matchesCategory = categoryFilter === 'all' || evt.type === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.className && evt.className.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Role visibility check
    const matchesRole = evt.targetRole === 'all' || !evt.targetRole ||
      user?.role === 'admin' ||
      (user?.role === 'teacher' && (evt.targetRole === 'teachers' || evt.targetRole === 'all')) ||
      (user?.role === 'student' && (evt.targetRole === 'students' || evt.targetRole === 'all')) ||
      (user?.role === 'parent' && (evt.targetRole === 'parents' || evt.targetRole === 'all'));

    return matchesCategory && matchesSearch && matchesRole;
  });

  // Helper to format date string YYYY-MM-DD
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Map events by date
  const eventsByDateMap: Record<string, CalendarEvent[]> = {};
  filteredEvents.forEach(evt => {
    if (!eventsByDateMap[evt.date]) {
      eventsByDateMap[evt.date] = [];
    }
    eventsByDateMap[evt.date].push(evt);
  });

  // Calculate Week range for Weekly View
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Advanced Type & Color Configuration for Exam vs Holiday differentiation
  const getEventBadgeStyle = (evt: CalendarEvent) => {
    let colorKey = evt.color;
    if (!colorKey) {
      if (evt.type === 'exam') {
        const lower = (evt.title + ' ' + (evt.description || '')).toLowerCase();
        if (lower.includes('final')) colorKey = 'red';
        else if (lower.includes('midterm')) colorKey = 'rose';
        else if (lower.includes('unit test')) colorKey = 'amber';
        else if (lower.includes('quiz')) colorKey = 'purple';
        else colorKey = 'rose';
      } else if (evt.type === 'holiday') {
        colorKey = 'emerald';
      } else if (evt.type === 'event') {
        colorKey = 'blue';
      } else if (evt.type === 'meeting') {
        colorKey = 'indigo';
      } else if (evt.type === 'academic') {
        colorKey = 'teal';
      } else {
        colorKey = 'slate';
      }
    }

    switch (colorKey) {
      case 'red':
        return 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/90';
      case 'rose':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/90';
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/90';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/90';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/90';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/90';
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-900/90';
      case 'teal':
        return 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-800 hover:bg-teal-200 dark:hover:bg-teal-900/90';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  };

  const getEventDotColor = (evt: CalendarEvent) => {
    let colorKey = evt.color;
    if (!colorKey) {
      if (evt.type === 'exam') {
        const lower = (evt.title + ' ' + (evt.description || '')).toLowerCase();
        if (lower.includes('final')) colorKey = 'red';
        else if (lower.includes('midterm')) colorKey = 'rose';
        else if (lower.includes('unit test')) colorKey = 'amber';
        else if (lower.includes('quiz')) colorKey = 'purple';
        else colorKey = 'rose';
      } else if (evt.type === 'holiday') {
        colorKey = 'emerald';
      } else if (evt.type === 'event') {
        colorKey = 'blue';
      } else if (evt.type === 'meeting') {
        colorKey = 'indigo';
      } else if (evt.type === 'academic') {
        colorKey = 'teal';
      } else {
        colorKey = 'slate';
      }
    }

    switch (colorKey) {
      case 'red': return 'bg-red-500';
      case 'rose': return 'bg-rose-500';
      case 'amber': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      case 'emerald': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-500';
      case 'indigo': return 'bg-indigo-500';
      case 'teal': return 'bg-teal-500';
      default: return 'bg-slate-500';
    }
  };

  // Today Date string for highlighting
  const realToday = new Date();
  const todayStr = formatDateKey(realToday.getFullYear(), realToday.getMonth(), realToday.getDate());

  return (
    <div className="space-y-4">
      {/* Toast Notification Bar for Auto Sync */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{syncToast}</span>
          <button onClick={() => setSyncToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner - Compact */}
      <div className="bg-[#0F172A] p-2.5 sm:p-4 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" /> BN International Academy Academic Calendar
          </div>
          <h2 className="text-sm sm:text-lg font-bold tracking-tight">Schedule & Event Planner</h2>
          <p className="hidden sm:block text-[11px] text-slate-300">
            Exams, holidays, classes, and academic events calendar synced with ExamManager.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Quick Stats Badges */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Award className="w-3 h-3" />
              {events.filter(e => e.type === 'exam').length} Exams
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Sun className="w-3 h-3" />
              {events.filter(e => e.type === 'holiday').length} Holidays
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-blue-400">
              <Sparkles className="w-3 h-3" />
              {events.filter(e => e.type === 'event').length} Events
            </span>
          </div>

          <button
            onClick={handleSyncExams}
            disabled={isSyncing}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
            title="Auto-import exam schedules from ExamManager"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Exams'}</span>
          </button>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={() => {
                setSelectedDayForNewEvent(new Date().toISOString().slice(0, 10));
                setIsAddModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Date Selector, View Toggle, Category Filters */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Date Month / Week Selector */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl">
            <button
              onClick={prevPeriod}
              className="p-1 hover:bg-white text-slate-700 rounded-lg transition shadow-2xs"
              title="Previous Month/Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-2xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Today</span>
            </button>
            <button
              onClick={nextPeriod}
              className="p-1 hover:bg-white text-slate-700 rounded-lg transition shadow-2xs"
              title="Next Month/Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">
            {viewMode === 'month' ? (
              `${monthNames[month]} ${year}`
            ) : (
              `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            )}
          </h3>

          <div className="hidden sm:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500">Go to:</span>
            <input
              type="date"
              value={formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  setCurrentDate(new Date(y, m - 1, d));
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none font-mono cursor-pointer"
              title="Select any custom date"
            />
          </div>
        </div>

        {/* View Mode Toggle & Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Week</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shrink-0"
          >
            <option value="all">All Categories</option>
            <option value="exam">Exams & Tests</option>
            <option value="holiday">School Holidays</option>
            <option value="event">School Events</option>
            <option value="meeting">Parent Meetings</option>
            <option value="academic">Academic Deadlines</option>
          </select>

          {/* Search Bar */}
          <div className="relative min-w-[110px] sm:w-40 flex-1">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Category Legend Bar - Compact for Mobile */}
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0 scrollbar-none">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 shrink-0">
            <Palette className="w-3 h-3 text-blue-600" /> Legend:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 px-1.5 py-0.5 rounded font-bold border border-red-200/60" title="Final Exam">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Final
            </span>
            <span className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold border border-rose-200/60" title="Midterm Exam">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Midterm
            </span>
            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-200/60" title="Unit Test">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Test
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-200/60" title="School Holiday">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Holiday
            </span>
            <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-200/60" title="School Event">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Event
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2 border-t sm:border-0 border-slate-100 pt-1 sm:pt-0">
          <button
            onClick={handleSyncExams}
            disabled={isSyncing}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition text-[10px] cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Auto-Sync ExamManager</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredEvents.length} items
          </span>
        </div>
      </div>

      {/* ---------------- MONTHLY VIEW GRID ---------------- */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-hidden w-full">
          <div className="w-full">
            {/* Day Headers (Sun - Sat) */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight py-1.5">
              <div><span className="sm:hidden">Sun</span><span className="hidden sm:inline">Sun</span></div>
              <div><span className="sm:hidden">Mon</span><span className="hidden sm:inline">Mon</span></div>
              <div><span className="sm:hidden">Tue</span><span className="hidden sm:inline">Tue</span></div>
              <div><span className="sm:hidden">Wed</span><span className="hidden sm:inline">Wed</span></div>
              <div><span className="sm:hidden">Thu</span><span className="hidden sm:inline">Thu</span></div>
              <div><span className="sm:hidden">Fri</span><span className="hidden sm:inline">Fri</span></div>
              <div><span className="sm:hidden">Sat</span><span className="hidden sm:inline">Sat</span></div>
            </div>

            {/* Calendar Cells - Compact Height */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 bg-slate-100/40 dark:bg-slate-950/40">
            {/* Blank cells for previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="bg-slate-50/50 dark:bg-slate-900/30 p-0.5 sm:p-1.5 min-h-[48px] sm:min-h-[72px] text-slate-300 dark:text-slate-700 text-[10px] sm:text-xs font-medium"
                >
                  <span>{dayNum}</span>
                </div>
              );
            })}

            {/* Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = formatDateKey(year, month, dayNum);
              const dayEvents = eventsByDateMap[dateKey] || [];
              const isToday = dateKey === todayStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`p-0.5 sm:p-1.5 min-h-[48px] sm:min-h-[72px] bg-white dark:bg-slate-900 transition hover:bg-blue-50/20 dark:hover:bg-blue-900/10 relative group overflow-hidden ${
                    isToday ? 'bg-blue-50/60 dark:bg-blue-950/30 ring-1.5 sm:ring-2 ring-blue-500/80 z-10' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span
                      className={`text-[10px] sm:text-xs font-bold inline-flex items-center justify-center min-w-[18px] sm:min-w-[22px] h-4 sm:h-5 px-0.5 sm:px-1 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {isToday && (
                      <span className="hidden sm:inline text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-950 px-1 rounded">
                        Today
                      </span>
                    )}

                    {(user?.role === 'admin' || user?.role === 'teacher') && !isToday && (
                      <button
                        onClick={() => {
                          setSelectedDayForNewEvent(dateKey);
                          setNewEvent(prev => ({ ...prev, date: dateKey }));
                          setIsAddModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 rounded transition hidden sm:inline-block"
                        title="Add event on this date"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`px-0.5 sm:px-1 py-0.2 sm:py-0.5 rounded text-[8px] sm:text-[10px] font-semibold border cursor-pointer truncate shadow-2xs transition flex items-center gap-0.5 sm:gap-1 leading-tight ${getEventBadgeStyle(
                          evt
                        )}`}
                        title={`${evt.title} (${evt.startTime || 'All Day'})`}
                      >
                        <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full shrink-0 ${getEventDotColor(evt)}`} />
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <button
                        onClick={() => {
                          setSelectedEvent(dayEvents[2]);
                        }}
                        className="w-full text-center text-[8px] sm:text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded py-0.2 sm:py-0.5 border border-blue-200 transition truncate"
                      >
                        +{dayEvents.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Blank cells for next month padding */}
            {Array.from({
              length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7
            }).map((_, idx) => (
              <div
                key={`next-${idx}`}
                className="bg-slate-50/50 p-0.5 sm:p-1.5 min-h-[48px] sm:min-h-[72px] text-slate-300 text-[10px] sm:text-xs font-medium"
              >
                <span>{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ---------------- WEEKLY VIEW COLUMNS ---------------- */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((dayObj, i) => {
            const dateKey = formatDateKey(dayObj.getFullYear(), dayObj.getMonth(), dayObj.getDate());
            const dayEvents = eventsByDateMap[dateKey] || [];
            const isToday = dateKey === todayStr;

            return (
              <div
                key={dateKey}
                className={`bg-white rounded-2xl border p-3.5 flex flex-col space-y-3 min-h-[380px] shadow-xs ${
                  isToday ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {dayObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-base font-extrabold ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                      {dayObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <button
                      onClick={() => {
                        setSelectedDayForNewEvent(dateKey);
                        setNewEvent(prev => ({ ...prev, date: dateKey }));
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Add Event"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Day Events Detailed Timeline Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px]">
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No scheduled events
                    </div>
                  ) : (
                    dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition space-y-1.5 ${getEventBadgeStyle(
                          evt
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-white/70 dark:bg-slate-900/70 rounded">
                            {evt.type}
                          </span>
                          {evt.startTime && (
                            <span className="text-[10px] font-mono font-bold opacity-80 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {evt.startTime}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                          {evt.title}
                        </h4>

                        {evt.className && (
                          <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-500" />
                            {evt.className}
                          </p>
                        )}

                        {evt.location && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.location}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getEventBadgeStyle(selectedEvent)}`}>
                  {selectedEvent.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">
                    {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {selectedEvent.startTime && (
                    <div className="text-slate-500 font-mono">
                      {selectedEvent.startTime} {selectedEvent.endTime ? `- ${selectedEvent.endTime}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Location: <b>{selectedEvent.location}</b></span>
                </div>
              )}

              {selectedEvent.className && (
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Applicable To: <b>{selectedEvent.className}</b></span>
                </div>
              )}

              {selectedEvent.organizer && (
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <User className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Organizer: <b>{selectedEvent.organizer}</b></span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-900 block mb-1">Details & Agenda:</span>
                  {selectedEvent.description}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {(user?.role === 'admin' || user?.role === 'teacher') ? (
                <button
                  onClick={() => setDeleteEventTarget(selectedEvent)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Event</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Schedule New Event / Exam
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Midterm Exam or Science Fair"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Category</label>
                  <select
                    value={newEvent.type}
                    onChange={e => {
                      const typeVal = e.target.value as any;
                      let autoColor = 'blue';
                      if (typeVal === 'exam') autoColor = 'rose';
                      else if (typeVal === 'holiday') autoColor = 'emerald';
                      else if (typeVal === 'meeting') autoColor = 'indigo';
                      else if (typeVal === 'academic') autoColor = 'teal';
                      setNewEvent({ ...newEvent, type: typeVal, color: autoColor });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="exam">Exam / Test</option>
                    <option value="holiday">School Holiday</option>
                    <option value="event">School Event</option>
                    <option value="meeting">Parent Meeting</option>
                    <option value="academic">Academic Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={newEvent.targetRole}
                    onChange={e => setNewEvent({ ...newEvent, targetRole: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Faculty / Teachers</option>
                    <option value="parents">Parents Only</option>
                  </select>
                </div>
              </div>

              {/* Color Selector Palette */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-blue-600" /> Color Code Palette
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'red', label: 'Final (Red)', bg: 'bg-red-500' },
                    { id: 'rose', label: 'Midterm (Rose)', bg: 'bg-rose-500' },
                    { id: 'amber', label: 'Unit Test (Amber)', bg: 'bg-amber-500' },
                    { id: 'purple', label: 'Quiz (Purple)', bg: 'bg-purple-500' },
                    { id: 'emerald', label: 'Holiday (Green)', bg: 'bg-emerald-500' },
                    { id: 'blue', label: 'Event (Blue)', bg: 'bg-blue-500' },
                    { id: 'indigo', label: 'Meeting (Indigo)', bg: 'bg-indigo-500' },
                    { id: 'teal', label: 'Deadline (Teal)', bg: 'bg-teal-500' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, color: item.id })}
                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition ${
                        newEvent.color === item.id
                          ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.bg}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Applicable Class</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 10-A or All Classes"
                    value={newEvent.className}
                    onChange={e => setNewEvent({ ...newEvent, className: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium / Room 101"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional context, agenda, or student instructions..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-2xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Event Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteEventTarget}
        onClose={() => setDeleteEventTarget(null)}
        onConfirm={confirmDeleteEvent}
        title="Delete Calendar Event"
        itemName={deleteEventTarget?.title}
        description={`Are you sure you want to remove "${deleteEventTarget?.title || ''}" from the school calendar?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
