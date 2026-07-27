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
  CheckCircle2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent } from '../../types';

export const SchoolCalendar: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 26)); // Default Jul 2026 or active date
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
    organizer: user?.name || 'School Admin'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    try {
      const created = await api.createCalendarEvent({
        ...newEvent,
        organizer: newEvent.organizer || user?.name || 'Administration'
      });
      setEvents(prev => [...prev, created]);
      setIsAddModalOpen(false);
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
        organizer: user?.name || 'School Admin'
      });
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this event from the calendar?')) return;
    try {
      await api.deleteCalendarEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
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
    setCurrentDate(new Date(2026, 6, 26)); // Fixed anchor for demo consistency
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

  // Type Color Configuration
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
      case 'holiday':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200';
      case 'event':
        return 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200';
      case 'academic':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 hover:bg-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
    }
  };

  const getTypeDotColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-amber-500';
      case 'holiday': return 'bg-emerald-500';
      case 'event': return 'bg-blue-500';
      case 'meeting': return 'bg-purple-500';
      case 'academic': return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  // Today Date string for highlighting
  const todayStr = '2026-07-26';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] p-5 rounded-2xl text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4 text-amber-400" /> Greenwood Shared Academic Calendar
          </div>
          <h2 className="text-xl font-bold tracking-tight">Exams, Holidays & School Events Schedule</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Centralized schedule sync for teachers, students, parents, and administrative staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Stats Badges */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Award className="w-3.5 h-3.5" />
              {events.filter(e => e.type === 'exam').length} Exams
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Sun className="w-3.5 h-3.5" />
              {events.filter(e => e.type === 'holiday').length} Holidays
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              {events.filter(e => e.type === 'event').length} Events
            </span>
          </div>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={() => {
                setSelectedDayForNewEvent(new Date().toISOString().slice(0, 10));
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event / Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Date Selector, View Toggle, Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Month / Week Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevPeriod}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition shadow-2xs"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition shadow-2xs"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 min-w-[160px]">
            {viewMode === 'month' ? (
              `${monthNames[month]} ${year}`
            ) : (
              `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            )}
          </h3>
        </div>

        {/* View Mode Toggle & Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Monthly Grid</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Weekly View</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="exam">Exams & Tests</option>
            <option value="holiday">School Holidays</option>
            <option value="event">School Events</option>
            <option value="meeting">Parent Meetings</option>
            <option value="academic">Academic Deadlines</option>
          </select>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Category Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 px-1">
        <div className="flex flex-wrap items-center gap-4 font-medium">
          <span className="font-bold text-slate-800">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Exams & Tests
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Holidays
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> School Events
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Parent Meetings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Academic Deadlines
          </span>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Showing {filteredEvents.length} scheduled items
        </span>
      </div>

      {/* ---------------- MONTHLY VIEW GRID ---------------- */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day Headers (Sun - Sat) */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 uppercase tracking-wider py-2.5">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100/40 min-h-[520px]">
            {/* Blank cells for previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
              const dayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="bg-slate-50/50 p-2 min-h-[110px] text-slate-300 text-xs font-medium"
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
                  className={`p-1.5 sm:p-2 min-h-[115px] bg-white transition hover:bg-blue-50/20 relative group ${
                    isToday ? 'bg-blue-50/40 ring-1 ring-blue-400 inset-0 z-10' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                      <button
                        onClick={() => {
                          setSelectedDayForNewEvent(dateKey);
                          setNewEvent(prev => ({ ...prev, date: dateKey }));
                          setIsAddModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 rounded transition"
                        title="Add event on this date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-1 rounded text-[11px] font-semibold border cursor-pointer truncate shadow-2xs transition flex items-center gap-1 ${getTypeBadgeStyle(
                          evt.type
                        )}`}
                        title={`${evt.title} (${evt.startTime || 'All Day'})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTypeDotColor(evt.type)}`} />
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => {
                          // Jump to week view or open details
                          setSelectedEvent(dayEvents[3]);
                        }}
                        className="w-full text-center text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded py-0.5 border border-blue-200 transition"
                      >
                        +{dayEvents.length - 3} more items
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
                className="bg-slate-50/50 p-2 min-h-[110px] text-slate-300 text-xs font-medium"
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
                        className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition space-y-1.5 ${getTypeBadgeStyle(
                          evt.type
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-white/70 rounded">
                            {evt.type}
                          </span>
                          {evt.startTime && (
                            <span className="text-[10px] font-mono font-bold opacity-80 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {evt.startTime}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {evt.title}
                        </h4>

                        {evt.className && (
                          <p className="text-[10px] text-slate-700 font-medium flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-500" />
                            {evt.className}
                          </p>
                        )}

                        {evt.location && (
                          <p className="text-[10px] text-slate-600 flex items-center gap-1">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getTypeBadgeStyle(selectedEvent.type)}`}>
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
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Schedule New Event / Exam
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Midterm Exam or Science Fair"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Category</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="exam">Exam / Test</option>
                    <option value="holiday">School Holiday</option>
                    <option value="event">School Event</option>
                    <option value="meeting">Parent Meeting</option>
                    <option value="academic">Academic Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={newEvent.targetRole}
                    onChange={e => setNewEvent({ ...newEvent, targetRole: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Faculty / Teachers</option>
                    <option value="parents">Parents Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applicable Class</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 10-A or All Classes"
                    value={newEvent.className}
                    onChange={e => setNewEvent({ ...newEvent, className: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Auditorium / Room 101"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional context, agenda, or student instructions..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
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
    </div>
  );
};
