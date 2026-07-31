import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BookMarked,
  CalendarCheck,
  CreditCard,
  FileText,
  Award,
  Clock,
  FolderDown,
  MessageSquare,
  Sparkles,
  BarChart3,
  Settings,
  Bell,
  UserCheck,
  Calendar,
  ShieldCheck,
  TrendingUp,
  X,
  Globe,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onGoToLandingPage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  onGoToLandingPage
}) => {
  const { role, user, schoolSettings } = useAuth();
  const { t } = useLanguage();

  const getNavItems = () => {
    switch (role) {
      case 'teacher':
        return [
          { id: 'dashboard', label: t('nav.dashboard', 'Teacher Dashboard'), icon: LayoutDashboard },
          { id: 'id-cards', label: t('nav.idCards', 'ID Card Studio'), icon: QrCode, badge: 'Studio' },
          { id: 'library', label: t('nav.library', 'Library Catalog'), icon: BookMarked, badge: 'Books' },
          { id: 'performance', label: t('nav.performance', 'Performance Overview'), icon: TrendingUp, badge: 'D3' },
          { id: 'calendar', label: t('nav.calendar', 'School Calendar'), icon: Calendar, badge: 'Events' },
          { id: 'attendance', label: t('nav.attendance', 'Manage Attendance'), icon: CalendarCheck, badge: 'Daily' },
          { id: 'homework', label: t('nav.homework', 'Create Homework'), icon: FileText },
          { id: 'materials', label: t('nav.materials', 'Study Material Upload'), icon: FolderDown },
          { id: 'ai-assistant', label: t('nav.aiAssistant', 'AI Quiz & AI Suite'), icon: Sparkles, highlight: true },
          { id: 'exams', label: t('nav.exams', 'Exams & Results'), icon: Award },
          { id: 'timetable', label: t('nav.timetable', 'Class Timetable'), icon: Clock },
          { id: 'chat', label: t('nav.messaging', 'Student Communication'), icon: MessageSquare },
          { id: 'notices', label: t('nav.notices', 'School Notices'), icon: Bell }
        ];

      case 'student':
        return [
          { id: 'dashboard', label: t('nav.dashboard', 'Student Dashboard'), icon: LayoutDashboard },
          { id: 'id-cards', label: t('nav.idCards', 'ID Card Pass'), icon: QrCode, badge: 'Card' },
          { id: 'library', label: t('nav.library', 'School Library'), icon: BookMarked },
          { id: 'calendar', label: t('nav.calendar', 'School Calendar'), icon: Calendar },
          { id: 'attendance', label: t('nav.attendance', 'Attendance Tracking'), icon: CalendarCheck },
          { id: 'homework', label: t('nav.homework', 'My Homework'), icon: FileText, badge: '2 Due' },
          { id: 'ai-assistant', label: t('nav.aiAssistant', 'AI Homework Helper'), icon: Sparkles, highlight: true },
          { id: 'materials', label: t('nav.materials', 'Study Library'), icon: FolderDown },
          { id: 'exams', label: t('nav.exams', 'Exams & Report Card'), icon: Award },
          { id: 'fees', label: t('nav.fees', 'Online Fee Payment'), icon: CreditCard },
          { id: 'timetable', label: t('nav.timetable', 'Weekly Timetable'), icon: Clock },
          { id: 'notices', label: t('nav.notices', 'School Notices'), icon: Bell }
        ];

      case 'parent':
        return [
          { id: 'dashboard', label: t('nav.dashboard', 'Parent Dashboard'), icon: LayoutDashboard },
          { id: 'id-cards', label: t('nav.idCards', 'Student ID Pass'), icon: QrCode },
          { id: 'library', label: t('nav.library', 'Library & Books'), icon: BookMarked },
          { id: 'calendar', label: t('nav.calendar', 'School Calendar'), icon: Calendar },
          { id: 'attendance', label: t('nav.attendance', 'Child Attendance'), icon: CalendarCheck },
          { id: 'exams', label: t('nav.exams', 'Report Cards & Results'), icon: Award },
          { id: 'fees', label: t('nav.fees', 'Fee Status & Receipts'), icon: CreditCard },
          { id: 'homework', label: t('nav.homework', 'Homework Tracker'), icon: FileText },
          { id: 'notices', label: t('nav.notices', 'School Circulars'), icon: Bell },
          { id: 'chat', label: t('nav.messaging', 'Teacher Messaging'), icon: MessageSquare }
        ];

      case 'admin':
      default:
        return [
          { id: 'dashboard', label: t('nav.dashboard', 'Overview Dashboard'), icon: LayoutDashboard },
          { id: 'id-cards', label: t('nav.idCards', 'ID Card Studio'), icon: QrCode, badge: 'Studio' },
          { id: 'library', label: t('nav.library', 'Library Management'), icon: BookMarked, badge: 'New' },
          { id: 'performance', label: t('nav.performance', 'Performance Overview'), icon: TrendingUp, badge: 'D3' },
          { id: 'calendar', label: t('nav.calendar', 'School Calendar'), icon: Calendar, badge: 'Shared' },
          { id: 'students', label: t('nav.students', 'Student Directory'), icon: GraduationCap },
          { id: 'teachers', label: t('nav.teachers', 'Faculty & Staff'), icon: UserCheck },
          { id: 'parents', label: t('nav.parents', 'Parent Network'), icon: Users },
          { id: 'classes', label: t('nav.classes', 'Classes & Subjects'), icon: BookOpen },
          { id: 'attendance', label: t('nav.attendance', 'Attendance Analytics'), icon: CalendarCheck },
          { id: 'fees', label: t('nav.fees', 'Tuition & Fee Portal'), icon: CreditCard },
          { id: 'homework', label: t('nav.homework', 'Assignments & Tasks'), icon: FileText },
          { id: 'exams', label: t('nav.exams', 'Exams & Grades'), icon: Award },
          { id: 'timetable', label: t('nav.timetable', 'Class Schedules'), icon: Clock },
          { id: 'materials', label: t('nav.materials', 'Study Materials'), icon: FolderDown },
          { id: 'notices', label: t('nav.notices', 'Notices & Circulars'), icon: Bell },
          { id: 'ai-assistant', label: t('nav.aiAssistant', 'AI Assistant'), icon: Sparkles, highlight: true },
          { id: 'chat', label: t('nav.messaging', 'Live Messaging'), icon: MessageSquare },
          { id: 'reports', label: t('nav.reports', 'Reports Engine'), icon: BarChart3 },
          { id: 'audit-log', label: t('nav.auditLog', 'Admin Audit Log'), icon: ShieldCheck, badge: 'Audit' },
          { id: 'settings', label: t('nav.settings', 'System Settings'), icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = () => (
    <>
      {/* High Density Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-700/80 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-extrabold text-xs text-white shadow-xs tracking-wider shrink-0 mt-0.5">
              BN
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold tracking-tight text-sm text-white leading-tight break-words">
                {schoolSettings?.name || 'BN International Academy'}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-1">
                v4.2 Enterprise • {role}
              </div>
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {onGoToLandingPage && (
          <div className="mb-3">
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onGoToLandingPage();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition duration-300" />
                <span className="truncate">Public School Website</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded font-black">
                Web
              </span>
            </button>
          </div>
        )}

        <div className="text-[10px] text-slate-400 uppercase px-3 font-semibold mb-2 tracking-widest">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const shortcutMap: Record<string, string> = {
            dashboard: 'Alt+D',
            calendar: 'Alt+C',
            students: 'Alt+S',
            teachers: 'Alt+T',
            library: 'Alt+L',
            notices: 'Alt+N',
            attendance: 'Alt+A',
            homework: 'Alt+H',
            chat: 'Alt+M',
            'ai-assistant': 'Alt+I',
            reports: 'Alt+R',
            performance: 'Alt+P',
          };
          const shortcutKey = shortcutMap[item.id];

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : item.highlight
                  ? 'text-blue-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
                {shortcutKey && (
                  <span
                    className={`hidden group-hover:inline-block px-1 py-0.2 rounded text-[9px] font-mono font-medium ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100 border border-blue-400/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {shortcutKey}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* High Density Profile Footer */}
      <div className="p-3 bg-[#1E293B] border-t border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
            alt={user?.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
            }}
            className="w-8 h-8 rounded-full object-cover border border-slate-600"
          />
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide truncate">{user?.role} Role</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-60 bg-[#0F172A] text-white flex-col shrink-0 h-full overflow-hidden border-r border-slate-800">
        {renderContent()}
      </aside>

      {/* Mobile Overlay Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-[80vw] bg-[#0F172A] text-white flex flex-col z-50 shadow-2xl border-r border-slate-800 h-full overflow-hidden">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
};

