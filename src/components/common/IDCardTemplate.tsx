import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Download,
  Printer,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Copy,
  Award
} from 'lucide-react';
import QRCode from 'qrcode';
import { User, SchoolSettings } from '../../types';
import { generateIdCardPDF } from '../../lib/pdfGenerator';

export interface IDCardTemplateProps {
  user?: User;
  person?: User;
  schoolSettings?: Partial<SchoolSettings>;
  schoolLogo?: string;
  primaryColor?: string;
  showControls?: boolean;
  showBackSide?: boolean;
  viewSide?: 'both' | 'front' | 'back';
  onDownloadPdf?: () => void;
  onPrint?: () => void;
  className?: string;
}

const convertImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png', 0.9);
          resolve(dataURL);
        } else {
          resolve('');
        }
      } catch (err) {
        console.warn('Canvas base64 export error:', err);
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
};

export const IDCardTemplate: React.FC<IDCardTemplateProps> = ({
  user,
  person,
  schoolSettings,
  schoolLogo,
  primaryColor,
  showControls = true,
  showBackSide = true,
  viewSide = 'both',
  onDownloadPdf,
  onPrint,
  className = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Allow either user or person prop
  const activeUser: User = user || person || {
    id: '1084',
    name: 'Alexandria Rivers',
    email: 'alex.rivers@bnia.edu.in',
    role: 'student',
    studentId: 'STU-2026-1084',
    className: 'Class 10-A',
    rollNo: '04'
  };

  const isTeacher = activeUser.role === 'teacher';

  // School metadata & custom branding
  const schoolName = schoolSettings?.name || 'BN International Academy';
  const schoolAddress = schoolSettings?.address || 'Macherla, Palnadu, AP - 522426';
  const principalName = schoolSettings?.principalName || 'Dr. Balu Naik, B. Tech';
  const phone = activeUser.phone || schoolSettings?.phone || '+91 63040 45279';

  const brandColor = primaryColor || schoolSettings?.primaryColor || '#0F172A';
  const logoUrl = schoolLogo || schoolSettings?.logo;

  // ID Details
  const idValue = activeUser.studentId || (isTeacher ? `FAC-2026-${activeUser.id || '042'}` : `STU-2026-${activeUser.id || '1084'}`);
  const classNameVal = activeUser.className || (isTeacher ? 'Senior Secondary' : 'Class 10-A');
  const rollNoVal = activeUser.rollNo || '04';
  const subjectVal = activeUser.subject || 'Mathematics & Science';
  const bloodGroupVal = 'O+';
  const parentNameVal = activeUser.parentName || 'David Rivers';
  const academicYear = schoolSettings?.academicYear || '2025-2026';

  const avatarUrl = activeUser.avatar || (isTeacher
    ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80');

  const verifyToken = `VERIFY_${isTeacher ? 'FAC' : 'STU'}_${idValue}_HASH_${activeUser.id || '8839'}`;

  useEffect(() => {
    const payload = JSON.stringify({
      id: idValue,
      name: activeUser.name,
      role: activeUser.role,
      class: classNameVal,
      school: schoolName,
      issued: academicYear,
      token: verifyToken
    });

    QRCode.toDataURL(payload, { margin: 1, width: 180, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating ID card QR:', err));

    if (avatarUrl) {
      convertImageToBase64(avatarUrl)
        .then(base64 => {
          if (base64) setAvatarDataUrl(base64);
        });
    }

    if (logoUrl) {
      convertImageToBase64(logoUrl)
        .then(base64 => {
          if (base64) setLogoDataUrl(base64);
        });
    } else {
      setLogoDataUrl('');
    }
  }, [activeUser, idValue, classNameVal, schoolName, academicYear, verifyToken, avatarUrl, logoUrl]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePdfAction = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      const doc = generateIdCardPDF(activeUser, {
        schoolName,
        schoolAddress,
        principalName,
        phone,
        qrDataUrl,
        avatarDataUrl,
        schoolLogoDataUrl: logoDataUrl,
        primaryColor: brandColor
      });
      const roleName = isTeacher ? 'Faculty' : 'Student';
      doc.save(`${activeUser.name.replace(/\s+/g, '_')}_${roleName}_ID_Card.pdf`);
    }
  };

  const handlePrintAction = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Toolbar Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl text-xs font-semibold print:hidden">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Official High-Security Printable ID Card</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToken}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
              title="Copy verification hash token"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>

            <button
              type="button"
              onClick={handlePdfAction}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Download CR80 printable PDF card"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrintAction}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Print directly from browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* ID Cards Container (Front & Back) */}
      <div className={`grid gap-4 items-start ${viewSide === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto w-full'}`}>
        {/* FRONT CARD */}
        {(viewSide === 'both' || viewSide === 'front') && (
        <div
          className="relative text-white rounded-2xl p-4 shadow-xl border overflow-hidden flex flex-col justify-between min-h-[220px]"
          style={{
            background: `linear-gradient(135deg, ${brandColor} 0%, #0F172A 100%)`,
            borderColor: `${brandColor}66`
          }}
        >
          {/* Background Decorative Ripples */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/20 relative z-10">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="w-9 h-8 rounded-lg object-contain bg-white/15 p-1 border border-white/30 shadow-xs shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs text-white shadow-xs tracking-wider shrink-0 border border-white/20"
                  style={{ backgroundColor: brandColor }}
                >
                  BN
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-xs text-white tracking-tight uppercase leading-tight">
                  {schoolName}
                </h3>
                <p className="text-[9px] text-indigo-300 font-medium tracking-wider uppercase flex items-center gap-1">
                  <span>{isTeacher ? 'Faculty Identification Pass' : 'Student Identification Pass'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{academicYear}</span>
                </p>
              </div>
            </div>
            <div className="shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
            </div>
          </div>

          {/* Card Body */}
          <div className="flex gap-3.5 items-center my-3 relative z-10">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={person.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = isTeacher
                    ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
                }}
                className="w-20 h-24 rounded-xl object-cover border-2 border-indigo-400/50 shadow-md"
              />
              <div className={`absolute -bottom-2 -right-1 ${isTeacher ? 'bg-amber-600' : 'bg-indigo-600'} text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border border-white shadow-2xs`}>
                {isTeacher ? 'FACULTY' : 'STUDENT'}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">
                {person.name}
              </h4>
              <p className="text-[10px] font-mono font-bold text-indigo-300">
                ID: {idValue}
              </p>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-1">
                {isTeacher ? (
                  <>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Subject Specialization</span>
                      <span className="font-bold text-slate-100 truncate block">{subjectVal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Class Assigned</span>
                      <span className="font-bold text-slate-100">{classNameVal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Phone</span>
                      <span className="font-bold text-slate-100">{phone}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Class / Sec</span>
                      <span className="font-bold text-slate-100">{classNameVal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Roll No</span>
                      <span className="font-bold text-slate-100">{rollNoVal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Blood Grp</span>
                      <span className="font-bold text-rose-400">{bloodGroupVal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] block uppercase font-semibold">Parent</span>
                      <span className="font-bold text-slate-100 truncate block">{parentNameVal}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between gap-2 relative z-10 text-[9px] text-slate-400">
            <div className="flex items-center gap-1 font-mono text-[8px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>CRYPTOGRAPHICALLY SIGNED PASS</span>
            </div>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-8 h-8 rounded bg-white p-0.5 shrink-0" />
            )}
          </div>
        </div>
        )}

        {/* BACK CARD */}
        {(viewSide === 'both' || viewSide === 'back') && showBackSide && (
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[220px]">
            <div>
              {/* Back Header */}
              <div className="bg-slate-900 text-white p-2 rounded-xl mb-3 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Emergency Contacts & Info</span>
                <span className="text-[9px] text-slate-400 font-mono">OFFICIAL PROPERTY</span>
              </div>

              {/* Back Content Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>School Helpline & Emergency Contact</span>
                  </div>
                  <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                    Phone: {phone}
                  </p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">
                    Email: info@bnia.edu.in
                  </p>
                </div>

                <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 px-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                    <span>Campus Address: {schoolAddress}</span>
                  </p>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    This card is institutional property. If found, return to the BN International Academy Admin Office. Non-transferable.
                  </p>
                </div>
              </div>
            </div>

            {/* Back Footer Signature */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between">
              <div>
                <div className="w-28 border-b border-slate-400 mb-0.5"></div>
                <p className="font-bold text-[10px] text-slate-900 dark:text-slate-100">{principalName}</p>
                <p className="text-[8px] text-slate-500 font-medium">Principal & Chief Administrator</p>
              </div>

              <div className="w-10 h-10 rounded-full border-2 border-blue-600 flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 font-black text-[7px] text-center uppercase leading-none tracking-tighter">
                BNIA<br/>SEAL
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
