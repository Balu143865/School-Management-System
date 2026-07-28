import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, Command, Sparkles, X, CheckCircle2, Navigation, Search } from 'lucide-react';

export interface ShortcutDefinition {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: 'Navigation' | 'System';
  tabId?: string;
  action?: () => void;
}

interface KeyboardShortcutManagerProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const SHORTCUTS: { keyDisplay: string; altDisplay: string; label: string; tabId: string; category: 'Navigation' | 'System' }[] = [
  { keyDisplay: 'Ctrl + D', altDisplay: 'Alt + D', label: 'Dashboard', tabId: 'dashboard', category: 'Navigation' },
  { keyDisplay: 'Ctrl + C', altDisplay: 'Alt + C', label: 'School Calendar', tabId: 'calendar', category: 'Navigation' },
  { keyDisplay: 'Ctrl + S', altDisplay: 'Alt + S', label: 'Student Directory', tabId: 'students', category: 'Navigation' },
  { keyDisplay: 'Ctrl + T', altDisplay: 'Alt + T', label: 'Faculty & Staff', tabId: 'teachers', category: 'Navigation' },
  { keyDisplay: 'Ctrl + L', altDisplay: 'Alt + L', label: 'Library Management', tabId: 'library', category: 'Navigation' },
  { keyDisplay: 'Ctrl + N', altDisplay: 'Alt + N', label: 'Notice Board', tabId: 'notices', category: 'Navigation' },
  { keyDisplay: 'Ctrl + A', altDisplay: 'Alt + A', label: 'Attendance Register', tabId: 'attendance', category: 'Navigation' },
  { keyDisplay: 'Ctrl + H', altDisplay: 'Alt + H', label: 'Homework & Assignments', tabId: 'homework', category: 'Navigation' },
  { keyDisplay: 'Ctrl + M', altDisplay: 'Alt + M', label: 'Messages & Chat', tabId: 'chat', category: 'Navigation' },
  { keyDisplay: 'Ctrl + I', altDisplay: 'Alt + I', label: 'AI Suite', tabId: 'ai-assistant', category: 'Navigation' },
  { keyDisplay: 'Ctrl + R', altDisplay: 'Alt + R', label: 'Reports & Analytics', tabId: 'reports', category: 'Navigation' },
  { keyDisplay: 'Ctrl + P', altDisplay: 'Alt + P', label: 'Performance Overview', tabId: 'performance', category: 'Navigation' },
];

export const KeyboardShortcutManager: React.FC<KeyboardShortcutManagerProps> = ({
  activeTab,
  onNavigate,
  isOpen,
  onClose,
  onOpen,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore shortcut keys when typing inside input, textarea or contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (isOpen) {
          onClose();
          return;
        }
      }

      // Toggle cheat sheet on Shift + ? or Ctrl + / or Alt + /
      if ((e.key === '?' && !isInput) || (e.key === '/' && (e.ctrlKey || e.metaKey || e.altKey))) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
        return;
      }

      // If user is inside an input field, do not trigger navigation shortcuts unless Ctrl/Alt combo is explicitly pressed
      if (isInput && !e.altKey && !e.ctrlKey && !e.metaKey) {
        return;
      }

      const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;
      if (!isModifierPressed) return;

      const keyLower = e.key.toLowerCase();

      // Mapping of shortcut keys to tabs
      const shortcutMap: Record<string, { tabId: string; label: string }> = {
        d: { tabId: 'dashboard', label: 'Dashboard' },
        c: { tabId: 'calendar', label: 'School Calendar' },
        s: { tabId: 'students', label: 'Student Directory' },
        t: { tabId: 'teachers', label: 'Faculty & Staff' },
        l: { tabId: 'library', label: 'Library Management' },
        n: { tabId: 'notices', label: 'Notice Board' },
        a: { tabId: 'attendance', label: 'Attendance Register' },
        h: { tabId: 'homework', label: 'Homework & Assignments' },
        m: { tabId: 'chat', label: 'Messages & Chat' },
        i: { tabId: 'ai-assistant', label: 'AI Suite' },
        r: { tabId: 'reports', label: 'Reports & Analytics' },
        p: { tabId: 'performance', label: 'Performance Overview' },
      };

      if (shortcutMap[keyLower]) {
        // Prevent default browser actions (like Ctrl+S save, Ctrl+P print, Ctrl+D bookmark, Ctrl+H history)
        e.preventDefault();
        const targetShortcut = shortcutMap[keyLower];
        onNavigate(targetShortcut.tabId);
        showToast(`Navigated to ${targetShortcut.label}`);
      }
    },
    [isOpen, onClose, onOpen, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const filteredShortcuts = SHORTCUTS.filter(
    (s) =>
      s.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.keyDisplay.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.altDisplay.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {/* Toast Popup on Shortcut Trigger */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/60 backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Global Keyboard Shortcuts
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use quick key combinations to instantly navigate between portal modules
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search shortcut name or key..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Modal Body - Shortcuts List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((sc) => {
                  const isActive = activeTab === sc.tabId;
                  return (
                    <div
                      key={sc.tabId}
                      onClick={() => {
                        onNavigate(sc.tabId);
                        onClose();
                        showToast(`Navigated to ${sc.label}`);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-slate-800/70 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs font-semibold truncate ${
                            isActive
                              ? 'text-blue-900 dark:text-blue-200 font-bold'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {sc.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
                          {sc.altDisplay}
                        </kbd>
                        <span className="text-[10px] text-slate-400">or</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
                          {sc.keyDisplay}
                        </kbd>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Help tip */}
              <div className="mt-4 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Pro Tip:</span>
                  Press <kbd className="px-1 py-0.2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded text-[10px] font-mono">?</kbd> or <kbd className="px-1 py-0.2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded text-[10px] font-mono">Ctrl + /</kbd> anytime anywhere in the portal to open or close this keyboard shortcut panel.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5" /> 12 Navigation Shortcuts Available
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
