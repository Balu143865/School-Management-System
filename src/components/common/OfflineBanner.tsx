import React from 'react';
import { WifiOff, RefreshCw, HardDrive } from 'lucide-react';
import { useOnlineStatus } from '../../lib/offlineStorage';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-3 sm:px-4 py-1.5 text-xs font-semibold flex items-center justify-between gap-2 shadow-inner border-b border-amber-600/30 animate-in fade-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
        <div className="truncate">
          <span className="font-bold">Offline Mode Active:</span>
          <span className="hidden sm:inline ml-1 font-normal text-slate-900">
            Network unavailable. Showing locally cached dashboard stats, timetable schedules, and notices.
          </span>
          <span className="sm:hidden ml-1 font-normal text-slate-900">
            Viewing cached offline data.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-amber-600/20 px-2 py-0.5 rounded text-amber-950 font-bold uppercase tracking-wider">
          <HardDrive className="w-3 h-3" /> Local Storage Cache
        </span>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-0.5 bg-amber-950 hover:bg-amber-900 text-amber-100 rounded text-[11px] font-bold transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
};
