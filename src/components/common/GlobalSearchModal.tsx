import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  Calendar,
  BookOpen,
  CheckSquare,
  CreditCard,
  FileText,
  Award,
  Bell,
  Camera,
  Settings,
  Users,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export interface SearchResultItem {
  id: string;
  type: 'feature' | 'student' | 'teacher' | 'action';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  targetTab?: string;
  action?: () => void;
  metadata?: {
    gpa?: string;
    attendance?: string;
    feeStatus?: string;
    class?: string;
    email?: string;
    phone?: string;
  };
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onOpenScanner?: () => void;
  onOpenReminders?: () => void;
  onOpenSchoolRegister?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenScanner,
  onOpenReminders,
  onOpenSchoolRegister,
}) => {
  const { role } = useAuth();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'feature' | 'student' | 'teacher' | 'action'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle global keyboard shortcuts (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Comprehensive Search Data Catalogue
  const allFeatures: SearchResultItem[] = [
    {
      id: 'feat-dashboard',
      type: 'feature',
      title: 'Overview Dashboard',
      subtitle: 'Key metrics, attendance stats, revenue & AI queue',
      badge: 'Main',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      icon: GraduationCap,
      targetTab: 'dashboard'
    },
    {
      id: 'feat-students',
      type: 'feature',
      title: 'Student Directory',
      subtitle: 'View, filter & manage student profiles and records',
      badge: 'Directory',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: Users,
      targetTab: 'students'
    },
    {
      id: 'feat-faculty',
      type: 'feature',
      title: 'Faculty & Staff',
      subtitle: 'Teacher list, departments & contact info',
      badge: 'Academic',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      icon: Briefcase,
      targetTab: 'faculty'
    },
    {
      id: 'feat-ai',
      type: 'feature',
      title: 'AI Suite & Assistant',
      subtitle: 'Report card generator, notice drafter & AI tutor',
      badge: 'AI Powered',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      icon: Sparkles,
      targetTab: 'ai-assistant'
    },
    {
      id: 'feat-calendar',
      type: 'feature',
      title: 'School Calendar',
      subtitle: 'Academic terms, holidays & upcoming school events',
      badge: 'Schedule',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      icon: Calendar,
      targetTab: 'calendar'
    },
    {
      id: 'feat-library',
      type: 'feature',
      title: 'Library Management',
      subtitle: 'Book catalogue, borrowing history & digital resources',
      badge: 'Library',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
      icon: BookOpen,
      targetTab: 'library'
    },
    {
      id: 'feat-attendance',
      type: 'feature',
      title: 'Attendance Register',
      subtitle: 'Daily student & teacher attendance tracking',
      badge: 'Daily Log',
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
      icon: CheckSquare,
      targetTab: 'attendance'
    },
    {
      id: 'feat-fees',
      type: 'feature',
      title: 'Tuition & Fee Portal',
      subtitle: 'Fee statements, online payment receipts & pending dues',
      badge: 'Finance',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: CreditCard,
      targetTab: 'fees'
    },
    {
      id: 'feat-homework',
      type: 'feature',
      title: 'Assignments & Tasks',
      subtitle: 'Homework submissions, deadlines & grading portal',
      badge: 'Tasks',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      icon: FileText,
      targetTab: 'homework'
    },
    {
      id: 'feat-exams',
      type: 'feature',
      title: 'Exams & Grades',
      subtitle: 'Exam timetables, gradebooks & report cards',
      badge: 'Grades',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      icon: Award,
      targetTab: 'exams'
    },
    {
      id: 'feat-performance',
      type: 'feature',
      title: 'Performance Analytics',
      subtitle: 'D3 charts, class grade distribution & attendance trends',
      badge: 'Analytics',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
      icon: Zap,
      targetTab: 'performance'
    },
    {
      id: 'feat-settings',
      type: 'feature',
      title: 'School Settings',
      subtitle: 'Institution profile, academic year, branding & security',
      badge: 'Admin',
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      icon: Settings,
      targetTab: 'settings'
    }
  ];

  const allStudents: SearchResultItem[] = [
    {
      id: 'stu-1',
      type: 'student',
      title: 'Alexandria Rivers',
      subtitle: 'ID: STU-2026-001 | Class 12A (Sci)',
      badge: 'PAID',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '3.92', attendance: '98%', feeStatus: 'Paid', class: '12A (Sci)', email: 'alexandria.rivers@school.edu' }
    },
    {
      id: 'stu-2',
      type: 'student',
      title: 'Julian Vancer',
      subtitle: 'ID: STU-2026-042 | Class 10B (Comm)',
      badge: 'PARTIAL',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '2.45', attendance: '82%', feeStatus: 'Partial', class: '10B (Comm)', email: 'julian.vancer@school.edu' }
    },
    {
      id: 'stu-3',
      type: 'student',
      title: 'Sarah McKellan',
      subtitle: 'ID: STU-2026-118 | Class 11C (Arts)',
      badge: 'PAID',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '4.00', attendance: '100%', feeStatus: 'Paid', class: '11C (Arts)', email: 'sarah.mckellan@school.edu' }
    },
    {
      id: 'stu-4',
      type: 'student',
      title: 'Marcus Thorne',
      subtitle: 'ID: STU-2026-089 | Class 09A (Gen)',
      badge: 'OVERDUE',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '3.10', attendance: '91%', feeStatus: 'Overdue', class: '09A (Gen)', email: 'marcus.thorne@school.edu' }
    },
    {
      id: 'stu-5',
      type: 'student',
      title: 'Elena Petrova',
      subtitle: 'ID: STU-2026-205 | Class 12B (Sci)',
      badge: 'PAID',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '3.78', attendance: '94%', feeStatus: 'Paid', class: '12B (Sci)', email: 'elena.petrova@school.edu' }
    },
    {
      id: 'stu-6',
      type: 'student',
      title: 'Alex Johnson',
      subtitle: 'ID: STU-1001 | Class 10-A',
      badge: 'PAID',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '3.85', attendance: '96%', feeStatus: 'Paid', class: '10-A', email: 'student@school.com' }
    },
    {
      id: 'stu-7',
      type: 'student',
      title: 'Sophia Martinez',
      subtitle: 'ID: STU-1002 | Class 10-A',
      badge: 'PAID',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      icon: UserIcon,
      targetTab: 'students',
      metadata: { gpa: '3.95', attendance: '99%', feeStatus: 'Paid', class: '10-A', email: 'sophia.student@school.com' }
    }
  ];

  const allTeachers: SearchResultItem[] = [
    {
      id: 'tch-1',
      type: 'teacher',
      title: 'Dr. Eleanor Vance',
      subtitle: 'School Principal & Academic Director',
      badge: 'Admin',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      icon: Briefcase,
      targetTab: 'faculty',
      metadata: { email: 'admin@school.com', phone: '+1 555-0100' }
    },
    {
      id: 'tch-2',
      type: 'teacher',
      title: 'Prof. Robert Langdon',
      subtitle: 'Mathematics & Physics | Class 10-A Teacher',
      badge: 'Faculty',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      icon: Briefcase,
      targetTab: 'faculty',
      metadata: { email: 'teacher@school.com', phone: '+1 555-0101' }
    },
    {
      id: 'tch-3',
      type: 'teacher',
      title: 'Ms. Sarah Jenkins',
      subtitle: 'English Literature | Class 10-B Teacher',
      badge: 'Faculty',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      icon: Briefcase,
      targetTab: 'faculty',
      metadata: { email: 'sarah.teacher@school.com', phone: '+1 555-0102' }
    }
  ];

  const allActions: SearchResultItem[] = [
    {
      id: 'act-scanner',
      type: 'action',
      title: 'Scan Document to PDF',
      subtitle: 'Quick scan permission slips, certificates or reports',
      badge: 'Camera',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      icon: Camera,
      action: () => onOpenScanner && onOpenScanner()
    },
    {
      id: 'act-reminders',
      type: 'action',
      title: 'Send Fee & Exam SMS Reminders',
      subtitle: 'Trigger automated notification dispatch to parents',
      badge: 'SMS/Email',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      icon: Bell,
      action: () => onOpenReminders && onOpenReminders()
    },
    {
      id: 'act-register',
      type: 'action',
      title: 'Register New School Branch',
      subtitle: 'Onboard a new school entity with OTP verification',
      badge: 'Admin',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      icon: Building2,
      action: () => onOpenSchoolRegister && onOpenSchoolRegister()
    }
  ];

  // Combine & Filter Items
  const allItems: SearchResultItem[] = [
    ...allFeatures,
    ...allStudents,
    ...allTeachers,
    ...allActions
  ];

  const filteredItems = allItems.filter((item) => {
    // Filter category
    if (selectedCategory !== 'all' && item.type !== selectedCategory) {
      return false;
    }

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const titleMatch = item.title.toLowerCase().includes(q);
    const subtitleMatch = item.subtitle?.toLowerCase().includes(q) || false;
    const badgeMatch = item.badge?.toLowerCase().includes(q) || false;
    const emailMatch = item.metadata?.email?.toLowerCase().includes(q) || false;

    return titleMatch || subtitleMatch || badgeMatch || emailMatch;
  });

  const handleSelectItem = (item: SearchResultItem) => {
    if (item.action) {
      item.action();
    } else if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
    onClose();
  };

  // Handle arrow keyboard navigation
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-all duration-200 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder={t('search.placeholder', 'Search students, teachers, modules, or quick actions...')}
            className="w-full text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'feature', label: 'App Modules' },
            { id: 'student', label: 'Students' },
            { id: 'teacher', label: 'Faculty & Staff' },
            { id: 'action', label: 'Quick Tools' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No matching records found for "{query}"
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for student names (e.g., "Alexandria"), subjects (e.g., "Math"), or modules (e.g., "Grades").
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        item.type === 'student'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : item.type === 'teacher'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : item.type === 'action'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right metadata badges or jump arrow */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.metadata?.gpa && (
                      <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        GPA: {item.metadata.gpa}
                      </span>
                    )}
                    {item.metadata?.attendance && (
                      <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {item.metadata.attendance} Attd
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] shadow-2xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] shadow-2xs">↵</kbd>
              Select
            </span>
          </div>
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> items
          </div>
        </div>
      </div>
    </div>
  );
};
