import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Camera,
  CheckCircle2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Download,
  UserCheck,
  Smartphone,
  Sparkles,
  Clock,
  X,
  ShieldCheck,
  Check,
  KeyRound,
  Users
} from 'lucide-react';
import { User, ClassRoom } from '../../types';
import { api } from '../../lib/api';

interface QRAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: ClassRoom | undefined;
  selectedDate: string;
  students: User[];
  onAttendanceUpdated: () => void;
}

export const QRAttendanceModal: React.FC<QRAttendanceModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  selectedDate,
  students,
  onAttendanceUpdated
}) => {
  const [activeMode, setActiveMode] = useState<'presenter' | 'student-scanner'>('presenter');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('8492');
  const [timer, setTimer] = useState<number>(30);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [scannedStudents, setScannedStudents] = useState<
    { id: string; name: string; rollNo: string; time: string; avatar?: string }[]
  >([]);

  // Student Scanner States
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [inputPasscode, setInputPasscode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random 4-digit code
  const generateNewPasscode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setPasscode(code);
    setTimer(30);
    return code;
  };

  // Generate QR Code Data URL
  const updateQRCode = async (codeStr: string) => {
    try {
      const payload = {
        classId: selectedClass?.id || 'c-10a',
        className: `${selectedClass?.name || 'Class 10'}-${selectedClass?.section || 'A'}`,
        date: selectedDate,
        code: codeStr,
        timestamp: Date.now()
      };
      const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 360,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const code = generateNewPasscode();
      updateQRCode(code);
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
    }
  }, [isOpen, selectedClass?.id, selectedDate]);

  // Timer countdown for QR security refresh
  useEffect(() => {
    if (!isOpen || activeMode !== 'presenter') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          const newCode = generateNewPasscode();
          updateQRCode(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeMode, selectedClass?.id]);

  if (!isOpen) return null;

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQR = () => {
    const newCode = generateNewPasscode();
    updateQRCode(newCode);
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Student check-in via passcode or simulated scan
  const handleStudentCheckIn = async (enteredCode: string) => {
    if (enteredCode !== passcode) {
      setScanMessage('Invalid passcode! Please verify the code on the screen.');
      setScanSuccess(false);
      return;
    }

    const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
    if (!currentStudent) return;

    try {
      setIsScanning(true);

      // Save attendance via API
      await api.saveBulkAttendance([
        {
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          rollNo: currentStudent.rollNo || '101',
          classId: selectedClass?.id || 'c-10a',
          date: selectedDate,
          status: 'present',
          remarks: `QR Code Check-in at ${new Date().toLocaleTimeString()}`
        }
      ]);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Add to live scanned list if not already present
      setScannedStudents((prev) => {
        if (prev.some((s) => s.id === currentStudent.id)) return prev;
        return [
          {
            id: currentStudent.id,
            name: currentStudent.name,
            rollNo: currentStudent.rollNo || '101',
            time: nowTime,
            avatar: currentStudent.avatar
          },
          ...prev
        ];
      });

      setScanSuccess(true);
      setScanMessage(`Check-in Confirmed! ${currentStudent.name} marked Present for ${selectedClass?.name}-${selectedClass?.section}.`);
      setInputPasscode('');
      onAttendanceUpdated();
    } catch (e) {
      console.error(e);
      setScanMessage('Failed to save attendance record. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Quick action: simulate random student scan for testing / teacher demo
  const handleSimulateRandomScan = () => {
    const unscanned = students.filter((s) => !scannedStudents.some((sc) => sc.id === s.id));
    const targetStudent = unscanned.length > 0 ? unscanned[Math.floor(Math.random() * unscanned.length)] : students[0];

    if (!targetStudent) return;

    setSelectedStudentId(targetStudent.id);
    handleStudentCheckIn(passcode);
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Attendance_${selectedClass?.name || 'Class'}_${selectedDate}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div
        ref={containerRef}
        className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-full ${
          isFullScreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'max-w-4xl max-h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Live Classroom QR Attendance Studio</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Session
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedClass?.name}-{selectedClass?.section} ({selectedClass?.roomNumber || 'Room 101'}) • Date: {selectedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch Mode Pills */}
            <div className="bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-700/80 text-xs font-semibold mr-2">
              <button
                onClick={() => setActiveMode('presenter')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'presenter' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" /> Presenter View
              </button>
              <button
                onClick={() => setActiveMode('student-scanner')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'student-scanner' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Student Scanner
              </button>
            </div>

            <button
              onClick={handleToggleFullScreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Projector View'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeMode === 'presenter' ? (
            /* PRESENTER MODE (For Projectors & Smartboards) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* QR Code & Pin Card (Left Column) */}
              <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center space-y-6 text-center">
                {/* Timer Bar */}
                <div className="w-full space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Dynamic Code
                    </span>
                    <span>Refreshes in {timer}s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(timer / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* QR Canvas Container */}
                <div className="relative group p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Class Attendance QR Code" className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg" />
                  ) : (
                    <div className="w-64 h-64 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-xs">
                      Generating Code...
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/10 rounded-xl pointer-events-none border border-black/10"></div>
                </div>

                {/* 4-Digit Classroom Passcode */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Classroom PIN Code
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {passcode.split('').map((char, idx) => (
                      <span
                        key={idx}
                        className="w-12 h-14 bg-slate-900 border border-indigo-500/40 rounded-xl text-2xl font-black text-indigo-400 flex items-center justify-center shadow-inner font-mono"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                {/* QR Quick Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleCopyPasscode}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'PIN Copied!' : 'Copy PIN'}</span>
                  </button>

                  <button
                    onClick={handleRefreshQR}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Refresh Code</span>
                  </button>

                  <button
                    onClick={handleDownloadQR}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Poster</span>
                  </button>

                  <button
                    onClick={handleSimulateRandomScan}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Student Scan</span>
                  </button>
                </div>
              </div>

              {/* Live Attendance Stream (Right Column) */}
              <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Live Check-in Feed</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30">
                    {scannedStudents.length} / {students.length} Scanned
                  </span>
                </div>

                {/* Progress ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Class Completion</span>
                    <span>{Math.round((scannedStudents.length / Math.max(1, students.length)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(scannedStudents.length / Math.max(1, students.length)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stream list */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
                  {scannedStudents.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs space-y-2 border border-dashed border-slate-800 rounded-xl">
                      <QrCode className="w-8 h-8 text-slate-600 animate-bounce" />
                      <p>Waiting for students to scan the QR code...</p>
                      <span className="text-[10px] text-slate-600">Students can open Student Scanner or enter PIN {passcode}</span>
                    </div>
                  ) : (
                    scannedStudents.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs animate-fadeIn"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.avatar ||
                              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={item.name}
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
                          />
                          <div>
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400">Roll No: {item.rollNo}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded-md border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Marked Present
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom sync status */}
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Synced with Class Roster</span>
                  <button
                    onClick={onAttendanceUpdated}
                    className="text-indigo-400 hover:underline font-medium"
                  >
                    Refresh Main Table
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STUDENT SCANNER MODE */
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-400" /> Student Self Check-in Portal
                  </h4>
                  <p className="text-xs text-slate-400">
                    Scan the teacher's classroom QR code or enter the 4-digit PIN code displayed on screen.
                  </p>
                </div>

                {/* Select Student */}
                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-300 font-semibold">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Roll No: {s.rollNo || '101'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Camera Viewfinder Simulation */}
                <div className="relative bg-slate-900 rounded-2xl border-2 border-indigo-500/40 p-6 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
                  {cameraActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-slate-900/60 to-indigo-500/10 animate-pulse pointer-events-none"></div>
                  )}

                  {/* Scanning Laser Animation Line */}
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 animate-bounce"></div>

                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                      <Camera className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      Camera viewfinder active. Align QR code inside box.
                    </div>
                    <button
                      onClick={() => handleStudentCheckIn(passcode)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md inline-flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Tap to Scan QR Code
                    </button>
                  </div>
                </div>

                {/* OR Enter 4-Digit PIN */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 text-center">
                    OR Enter Classroom 4-Digit PIN Code
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 8492"
                      value={inputPasscode}
                      onChange={(e) => setInputPasscode(e.target.value)}
                      className="w-40 p-2.5 bg-slate-900 border border-indigo-500/40 text-center font-mono text-xl tracking-widest text-indigo-300 rounded-xl outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={() => handleStudentCheckIn(inputPasscode)}
                      disabled={inputPasscode.length !== 4 || isScanning}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition shadow-xs"
                    >
                      Verify PIN
                    </button>
                  </div>
                </div>

                {/* Scan Results Message */}
                {scanMessage && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                      scanSuccess
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {scanSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{scanMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
