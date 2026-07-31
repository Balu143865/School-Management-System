import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  LogOut,
  Building2,
  CheckCircle2,
  Activity,
  Menu,
  X,
  Camera,
  Bell,
  Zap,
  Sun,
  Moon,
  Keyboard,
  MoreVertical,
  SlidersHorizontal,
  ShieldCheck,
  Globe,
  QrCode,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserRole } from '../../types';
import { DocumentScannerModal } from './DocumentScannerModal';
import { NotificationTriggerHub } from './NotificationTriggerHub';
import { FirebaseAuthModal } from './FirebaseAuthModal';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSchoolRegister: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenShortcuts?: () => void;
  onGoToLandingPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSchoolRegister,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onOpenShortcuts,
  onGoToLandingPage
}) => {
  const { user, firebaseUser, role, schoolSettings, demoLogin, logout } = useAuth();
  const { t } = useLanguage();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNotifHubOpen, setIsNotifHubOpen] = useState(false);
  const [isFirebaseAuthOpen, setIsFirebaseAuthOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      document.documentElement.classList.contains('dark')
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'admin', label: 'Admin Portal', desc: 'Management & Settings', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    { role: 'teacher', label: 'Teacher Portal', desc: 'Attendance & Homework', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { role: 'student', label: 'Student Portal', desc: 'Tasks & AI Tutor', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { role: 'parent', label: 'Parent Portal', desc: 'Child Progress & Fees', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  ];

  const handleRoleSwitch = async (newRole: UserRole) => {
    await demoLogin(newRole);
    setShowRoleDropdown(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30 sticky top-0 transition-colors">
      <div className="h-14 px-2.5 sm:px-6 flex items-center justify-between">
        {/* Left Section: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* School Logo & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onGoToLandingPage}
              className="w-8 h-7 bg-blue-600 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 transition cursor-pointer tracking-wider"
              title="Return to Public School Website Landing Page"
            >
              BN
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm tracking-tight truncate max-w-[180px] sm:max-w-none">
                  {schoolSettings?.name || 'BN International Academy'}
                </span>
                {schoolSettings?.isOtpVerified && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded uppercase shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {onGoToLandingPage && (
                  <button
                    onClick={onGoToLandingPage}
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                    title="Open Public School Website Landing Page"
                  >
                    <Globe className="w-3 h-3 text-emerald-500" />
                    <span>School Website</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Global Search Trigger */}
          <button
            onClick={() => setIsGlobalSearchOpen(true)}
            className="relative w-full max-w-sm hidden md:flex items-center justify-between pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 text-left transition cursor-pointer ml-2 group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition" />
            <span className="truncate">{t('header.search', 'Search students, teachers, pages...')}</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-400 shadow-2xs shrink-0 ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Controls & Tools */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Desktop Tools Container */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher variant="compact" />

            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 shadow-2xs'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 shadow-2xs'
                }`}
                title="Keyboard Shortcuts Cheat Sheet"
                aria-label="Keyboard Shortcuts Cheat Sheet"
              >
                <Keyboard className="w-4 h-4 text-blue-500" />
              </button>
            )}

            <div className="flex items-center gap-2 text-[10px] text-right">
              <div>
                <span className="text-slate-400 block font-medium">System Status</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Live: 0ms
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

            <button
              onClick={() => setActiveTab('id-cards')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activeTab === 'id-cards'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-blue-200 dark:border-blue-800'
              }`}
              title="Official ID Card Studio & Generator"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>ID Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activeTab === 'readme'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-purple-200 dark:border-purple-800'
              }`}
              title="GitHub README.md Documentation & Setup Guide"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>README.md</span>
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
              title="Scan Document to PDF"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Scan Doc</span>
            </button>

            <button
              onClick={() => setIsNotifHubOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition shadow-2xs cursor-pointer"
              title="Send Fee & Exam Reminders"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
              <span>Reminders</span>
            </button>

            <button
              onClick={() => setIsFirebaseAuthOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition shadow-2xs cursor-pointer"
              title="Firebase Real-Time Auth State"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{firebaseUser ? 'Auth Connected' : 'Real-Time Auth'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>

          {/* AI Suite Quick Launcher */}
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ai-assistant'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800'
            }`}
            title="AI Assistant Suite"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">AI Suite</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <span className="uppercase px-1 py-0.5 rounded text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold">
                {role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Portal View
                </div>
                <div className="p-1 space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r.role)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                        role === r.role
                          ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{r.label}</div>
                        <div className="text-[10px] text-slate-400">{r.desc}</div>
                      </div>
                      {role === r.role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Register School Button (Admin Desktop) */}
          {role === 'admin' && (
            <button
              onClick={onOpenSchoolRegister}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register School</span>
            </button>
          )}

          {/* Mobile Quick Tools Drawer Toggle Button */}
          <button
            onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
            className={`lg:hidden p-1.5 rounded-xl border transition flex items-center justify-center relative cursor-pointer ${
              isMobileToolsOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Mobile Quick Tools"
            aria-label="Toggle Mobile Quick Tools"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {/* Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab(role === 'admin' ? 'settings' : 'profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE QUICK TOOLS EXPANDABLE TRAY */}
      {isMobileToolsOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md p-3 space-y-3 shadow-inner animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar */}
          <button
            onClick={() => {
              setIsGlobalSearchOpen(true);
              setIsMobileToolsOpen(false);
            }}
            className="relative w-full flex items-center justify-between pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 text-left transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <span className="truncate">{t('header.search', 'Search students, teachers, pages...')}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => {
                setIsScannerOpen(true);
                setIsMobileToolsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Scan Doc</span>
            </button>

            <button
              onClick={() => {
                setIsNotifHubOpen(true);
                setIsMobileToolsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
              <span>Reminders</span>
            </button>

            <button
              onClick={() => {
                setIsFirebaseAuthOpen(true);
                setIsMobileToolsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">{firebaseUser ? 'Auth Active' : 'Real-Time Auth'}</span>
            </button>

            {onOpenShortcuts && (
              <button
                onClick={() => {
                  onOpenShortcuts();
                  setIsMobileToolsOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5 text-blue-500" />
                <span>Shortcuts</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => {
                  onOpenSchoolRegister();
                  setIsMobileToolsOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer col-span-2 sm:col-span-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Register School</span>
              </button>
            )}
          </div>

          {/* Bottom Row: Language, Theme, & System Latency */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="compact" />
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-amber-400 border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </div>

            <div className="text-[10px] text-right">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> System Live: 0ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Document & Permission Slip Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        documentType="general"
        documentTitle="BN_Academy_Scanned_Document"
      />

      {/* Notification Service Trigger Hub Modal */}
      <NotificationTriggerHub
        isOpen={isNotifHubOpen}
        onClose={() => setIsNotifHubOpen(false)}
      />

      {/* Firebase Real-Time Auth Modal */}
      <FirebaseAuthModal
        isOpen={isFirebaseAuthOpen}
        onClose={() => setIsFirebaseAuthOpen(false)}
      />

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenReminders={() => setIsNotifHubOpen(true)}
        onOpenSchoolRegister={onOpenSchoolRegister}
      />
    </header>
  );
};


