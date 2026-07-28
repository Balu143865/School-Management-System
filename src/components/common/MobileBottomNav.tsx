import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Bell,
  Menu,
  CreditCard,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const { role } = useAuth();
  const { t } = useLanguage();

  const getFourthTab = () => {
    if (role === 'student' || role === 'parent') {
      return { id: 'fees', label: t('nav.fees', 'Fees'), icon: CreditCard };
    }
    if (role === 'teacher') {
      return { id: 'homework', label: t('nav.homework', 'Homework'), icon: FileText };
    }
    return { id: 'notices', label: t('nav.notices', 'Notices'), icon: Bell };
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const fourthTab: NavItem = getFourthTab();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('nav.dashboard', 'Home'), icon: LayoutDashboard },
    { id: 'calendar', label: t('nav.calendar', 'Calendar'), icon: Calendar },
    { id: 'ai-assistant', label: t('nav.aiAssistant', 'AI Suite'), icon: Sparkles, highlight: true },
    fourthTab,
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : item.highlight
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.highlight && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[56px]">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Menu Toggle for Full Navigation Drawer */}
      <button
        onClick={onToggleMobileMenu}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isMobileMenuOpen
            ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        aria-label="Open Full Navigation Drawer"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">
          {t('nav.menu', 'Menu')}
        </span>
      </button>
    </div>
  );
};
