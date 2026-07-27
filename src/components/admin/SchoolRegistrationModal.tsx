import React, { useState } from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, KeyRound } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRegistrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { registerSchool } = useAuth();
  const [step, setStep] = useState<'info' | 'otp' | 'success'>('info');
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    phone: '',
    address: '',
    principalName: '',
    otp: ''
  });
  const [otpSentCode, setOtpSentCode] = useState('8842');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.email) {
      setError('Please provide school name and official email.');
      return;
    }
    setError('');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpSentCode(code);
    setStep('otp');
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp !== otpSentCode && formData.otp !== '1234') {
      setError(`Invalid OTP code. For demo testing, enter ${otpSentCode} or 1234.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerSchool(formData);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to register school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="School Registration & OTP Verification" maxWidth="max-w-xl">
      {step === 'info' && (
        <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-800 leading-snug">
              Register your institution to launch an enterprise SMS instance with verified OTP security.
            </p>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div>
            <label className="block text-slate-700 font-medium mb-1">School / Institution Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. St. Xavier International School"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                placeholder="admin@school.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 019-2831"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Principal / Director Name</label>
              <input
                type="text"
                placeholder="Dr. John Doe"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Campus Address</label>
              <input
                type="text"
                placeholder="City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Send OTP Verification Code
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <p className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" /> Security Verification Code Sent
            </p>
            <p className="mt-1">
              A 4-digit OTP was generated for <span className="font-bold">{formData.email}</span>.
            </p>
            <div className="mt-2 text-center py-2 bg-white rounded-lg border border-amber-300 font-mono text-base font-bold text-amber-900 tracking-widest">
              Demo Code: {otpSentCode}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div>
            <label className="block text-slate-700 font-medium mb-1">Enter 4-Digit OTP *</label>
            <input
              type="text"
              maxLength={4}
              required
              placeholder="e.g. 8842"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-mono outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('info')}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Complete Setup'}
            </button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">School Registered Successfully!</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {formData.schoolName} is now active with verified OTP authorization and admin portal access.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition mt-2"
          >
            Go to Admin Dashboard
          </button>
        </div>
      )}
    </Modal>
  );
};
