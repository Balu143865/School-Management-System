import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC<{ variant?: 'header' | 'compact' | 'footer' }> = ({ variant = 'header' }) => {
  const { language, languageInfo, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition text-xs font-semibold select-none ${
          variant === 'header'
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 shadow-2xs'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
        }`}
        aria-label="Switch Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-500 hidden xs:block" />
        <span className="text-xs sm:text-sm leading-none">{languageInfo.flag}</span>
        <span className="hidden md:inline font-bold">{languageInfo.nativeName}</span>
        <span className="inline md:hidden uppercase font-bold text-[10px] sm:text-[11px]">{languageInfo.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Select Language</span>
            <Globe className="w-3 h-3 text-slate-400" />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-bold leading-tight">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
