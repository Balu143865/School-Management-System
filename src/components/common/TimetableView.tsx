import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, User, Download, Printer, ShieldCheck, WifiOff, HardDrive } from 'lucide-react';
import { generateTimetablePDF } from '../../lib/pdfGenerator';
import { api } from '../../lib/api';
import { useOnlineStatus, offlineStorage } from '../../lib/offlineStorage';

export const TimetableView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const isOnline = useOnlineStatus();
  const [lastCacheTime, setLastCacheTime] = useState<string | null>(null);

  const defaultSchedule = [
    { time: '08:00 AM - 09:00 AM', mon: 'Mathematics (Prof. Alan)', tue: 'Physics (Dr. Marie)', wed: 'Mathematics (Prof. Alan)', thu: 'Chemistry (Dr. Curie)', fri: 'English (Ms. Emily)' },
    { time: '09:00 AM - 10:00 AM', mon: 'Computer Science (Mr. Turing)', tue: 'Mathematics (Prof. Alan)', wed: 'Physics (Dr. Marie)', thu: 'Mathematics (Prof. Alan)', fri: 'Physical Ed. (Coach Sam)' },
    { time: '10:00 AM - 10:30 AM', mon: 'RECESS / BREAK', tue: 'RECESS / BREAK', wed: 'RECESS / BREAK', thu: 'RECESS / BREAK', fri: 'RECESS / BREAK' },
    { time: '10:30 AM - 11:30 AM', mon: 'Chemistry (Dr. Curie)', tue: 'Computer Science (Mr. Turing)', wed: 'Biology (Dr. Darwin)', thu: 'Physics (Dr. Marie)', fri: 'History (Mr. Herodotus)' },
    { time: '11:30 AM - 12:30 PM', mon: 'English (Ms. Emily)', tue: 'Biology (Dr. Darwin)', wed: 'Chemistry (Dr. Curie)', thu: 'Computer Science (Mr. Turing)', fri: 'Mathematics (Prof. Alan)' },
  ];

  const [schedule, setSchedule] = useState(defaultSchedule);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        await api.getTimetable(selectedClass);
        const cached = offlineStorage.get(`timetable_${selectedClass}`);
        if (cached?.timestamp) {
          setLastCacheTime(new Date(cached.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.warn('Unable to sync latest live timetable, loading offline cache.', err);
      }
    };
    fetchTimetable();
  }, [selectedClass]);

  const handleExportPdf = () => {
    const doc = generateTimetablePDF({
      className: selectedClass,
      academicTerm: 'Term 1 (2025-2026)',
      schedule
    });
    doc.save(`Timetable_${selectedClass.replace(/\s+/g, '_')}_2026.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Class Timetable & Schedule
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500">Weekly class schedule, subject slots, and period timing.</p>
            {!isOnline && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                <WifiOff className="w-3 h-3 text-amber-600" /> Offline Schedule
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs outline-none"
          >
            <option value="Class 10-A">Class 10-A</option>
            <option value="Class 10-B">Class 10-B</option>
            <option value="Class 11-A">Class 11-A</option>
          </select>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Timetable PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer print:hidden"
            title="Print Schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-slate-300 print:shadow-none print:m-0 print:w-full">
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between text-xs gap-2 print:bg-slate-100">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 print:hidden" /> BN International Academy Official Schedule - {selectedClass}
          </span>
          <div className="flex items-center gap-2">
            {lastCacheTime && (
              <span className="text-[10px] font-mono bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 print:hidden">
                <HardDrive className="w-3 h-3 text-slate-500" /> Cache Sync: {lastCacheTime}
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 uppercase print:text-slate-700">Effective: Term 1 (2025-2026)</span>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs print:text-[11px] print:border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase text-[11px] tracking-wider print:bg-slate-100">
              <tr>
                <th className="p-3.5 border-r border-slate-200/80 print:border-slate-300">Time Slot</th>
                <th className="p-3.5 print:border-r print:border-slate-300">Monday</th>
                <th className="p-3.5 print:border-r print:border-slate-300">Tuesday</th>
                <th className="p-3.5 print:border-r print:border-slate-300">Wednesday</th>
                <th className="p-3.5 print:border-r print:border-slate-300">Thursday</th>
                <th className="p-3.5">Friday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
              {schedule.map((slot, idx) => {
                const isBreak = slot.mon.includes('RECESS');
                return (
                  <tr key={idx} className={isBreak ? 'bg-amber-50/60 font-semibold text-amber-900 print:bg-slate-100' : 'hover:bg-slate-50 transition'}>
                    <td className="p-3.5 border-r border-slate-200/80 font-mono text-[11px] text-slate-500 print:border-slate-300 print:text-slate-800 font-bold">{slot.time}</td>
                    <td className="p-3.5 print:border-r print:border-slate-200">{slot.mon}</td>
                    <td className="p-3.5 print:border-r print:border-slate-200">{slot.tue}</td>
                    <td className="p-3.5 print:border-r print:border-slate-200">{slot.wed}</td>
                    <td className="p-3.5 print:border-r print:border-slate-200">{slot.thu}</td>
                    <td className="p-3.5">{slot.fri}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
