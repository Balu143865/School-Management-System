import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  QrCode,
  Download,
  Copy,
  CheckCircle2,
  Phone,
  User as UserIcon,
  GraduationCap,
  Calendar,
  Heart,
  RotateCw,
  Building2,
  Sparkles,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Modal } from './Modal';
import { User, SchoolSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DigitalStudentIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
}

export const DigitalStudentIdModal: React.FC<DigitalStudentIdModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { schoolSettings } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const schoolName = schoolSettings?.name || 'Greenwood International Academy';
  const schoolAddress = schoolSettings?.address || '100 Academic Way, Metro City, NY 10001';
  const principalName = schoolSettings?.principalName || 'Dr. Eleanor Vance';

  // Fallback defaults for rich ID details
  const studentName = student?.name || 'Alexandria Rivers';
  const studentId = student?.studentId || `STU-2026-${student?.id || '1084'}`;
  const className = student?.className || 'Class 10-A';
  const rollNo = student?.rollNo || '04';
  const gender = student?.gender || 'Female';
  const phone = student?.phone || '+1 (555) 019-2831';
  const bloodGroup = 'O+';
  const dateOfBirth = student?.dateOfBirth || '2010-05-14';
  const parentName = student?.parentName || 'David Rivers';
  const emergencyPhone = '+1 (555) 982-1140';
  const avatarUrl = student?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';

  const verifyToken = `VERIFY_STU_${studentId}_HASH_${student?.id || '8839'}`;

  useEffect(() => {
    if (student || isOpen) {
      const payload = JSON.stringify({
        id: studentId,
        name: studentName,
        class: className,
        school: schoolName,
        issued: '2025-2026',
        token: verifyToken
      });

      QRCode.toDataURL(payload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [student, isOpen, schoolName]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (!student && !isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Student Identification Pass" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setIsFlipped(false)}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              !isFlipped ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Card Front</span>
          </button>
          <button
            onClick={() => setIsFlipped(true)}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              isFlipped ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Card Back</span>
          </button>
        </div>

        {/* Digital ID Pass Container */}
        <div className="relative perspective-1000 min-h-[380px]">
          {/* FRONT VIEW */}
          {!isFlipped ? (
            <div className="w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-indigo-500/30 space-y-4 relative overflow-hidden">
              {/* Background watermark icon */}
              <GraduationCap className="w-48 h-48 text-indigo-500/5 absolute -right-10 -bottom-10 pointer-events-none" />

              {/* Header section */}
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white leading-snug">
                      {schoolName}
                    </h3>
                    <p className="text-[10px] text-indigo-300 font-medium tracking-wider uppercase flex items-center gap-1">
                      <span>Official Digital Student Pass</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">2025-2026</span>
                    </p>
                  </div>
                </div>

                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active</span>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="flex gap-4 items-center">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={studentName}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white shadow-2xs">
                    STU ID
                  </div>
                </div>

                <div className="space-y-1 text-xs flex-1">
                  <h4 className="font-extrabold text-base text-white tracking-tight leading-tight">
                    {studentName}
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-indigo-300">
                    ID: {studentId}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-semibold">Class / Section</span>
                      <span className="font-bold text-slate-100">{className}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-semibold">Roll No</span>
                      <span className="font-bold text-slate-100">{rollNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-semibold">Blood Group</span>
                      <span className="font-bold text-rose-400">{bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-semibold">D.O.B</span>
                      <span className="font-bold text-slate-100">{dateOfBirth}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code & Barcode Section */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 text-slate-900 flex items-center justify-between gap-3 shadow-inner border border-white/20">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Scan to Verify ID</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-800 font-semibold truncate max-w-[170px]">
                    {verifyToken}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    <FileCheck className="w-3 h-3" />
                    <span>Cryptographically Signed</span>
                  </div>
                </div>

                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Student ID Verification QR Code"
                    className="w-16 h-16 rounded-lg border border-slate-200 shrink-0"
                  />
                )}
              </div>
            </div>
          ) : (
            /* BACK VIEW */
            <div className="w-full bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700 space-y-4 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Emergency Contacts & Terms</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PASS-2026-REG</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Parent / Guardian Contact</p>
                    <p className="font-bold text-white text-xs">{parentName}</p>
                    <p className="text-indigo-300 font-mono text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{emergencyPhone}</span>
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">School Address & Support</p>
                    <p className="text-slate-200 text-xs font-medium">{schoolAddress}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Helpline: +1 (800) 555-SCHL</p>
                  </div>

                  <div className="bg-rose-950/40 p-2 rounded-xl border border-rose-500/30 text-rose-300 text-[10px] font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>In case of emergency or loss, report immediately to administrative office.</span>
                  </div>
                </div>
              </div>

              {/* Signature Seal */}
              <div className="pt-3 border-t border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Authorized Signature</p>
                  <p className="text-xs font-serif italic text-indigo-300 font-bold">{principalName}</p>
                  <p className="text-[9px] text-slate-400">Principal & Chief Administrator</p>
                </div>

                <div className="text-right">
                  <div className="w-12 h-12 rounded-full border border-indigo-400/40 bg-indigo-500/10 flex items-center justify-center text-[8px] font-bold text-indigo-300 uppercase tracking-tighter text-center leading-none">
                    ACCREDITED<br />SEAL
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCopyToken}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Token' : 'Copy Verification QR Token'}</span>
          </button>

          <button
            onClick={handlePrintCard}
            className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Print ID</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
