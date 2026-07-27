import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSchoolRegister: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSchoolRegister,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const { user, role, schoolSettings, demoLogin, logout } = useAuth();
  const { t } = useLanguage();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
    <header className="h-14 bg-white border-b border-slate-200 px-2.5 sm:px-6 shrink-0 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>

        {/* School Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="hidden xs:block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                {schoolSettings?.name || 'Greenwood Enterprise'}
              </span>
              {schoolSettings?.isOtpVerified && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded uppercase shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* High Density Search input */}
        <div className="relative w-full max-w-sm hidden md:block ml-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('header.search', 'Search students, records, or AI tools...')}
            className="w-full pl-8 pr-4 py-1.5 bg-slate-100 border border-slate-200 focus:border-blue-500 focus:bg-white rounded text-xs text-slate-800 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Action Tools & Live Status */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Switcher Dropdown Utility */}
        <LanguageSwitcher variant="compact" />

        {/* Live Latency Status */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-right">
          <div>
            <span className="text-slate-400 block font-medium">System Status</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Live: 0ms Latency
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden lg:block"></div>

        {/* AI Suite Launcher */}
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-semibold transition ${
            activeTab === 'ai-assistant'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
          }`}
          title="AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Suite</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded text-xs font-semibold text-slate-700 transition"
          >
            <span className="uppercase px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-blue-100 text-blue-700 font-bold">
              {role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Portal View
              </div>
              <div className="p-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSwitch(r.role)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-xs transition ${
                      role === r.role
                        ? 'bg-slate-100 font-bold text-slate-900'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                    {role === r.role && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Register School Button */}
        {role === 'admin' && (
          <button
            onClick={onOpenSchoolRegister}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Register School</span>
          </button>
        )}

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:bg-slate-100 transition"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-xs truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab(role === 'admin' ? 'settings' : 'profile');
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

