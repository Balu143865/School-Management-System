import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Settings, Building2, Save, CheckCircle2 } from 'lucide-react';

export const SchoolSettingsView: React.FC = () => {
  const { user, schoolSettings, refreshSettings } = useAuth();
  const [formData, setFormData] = useState({
    name: schoolSettings?.name || '',
    code: schoolSettings?.code || '',
    tagline: schoolSettings?.tagline || '',
    address: schoolSettings?.address || 'Macherla, Palnadu, AP - 522426',
    phone: schoolSettings?.phone || '+91 63040 45279',
    email: schoolSettings?.email || '',
    academicYear: schoolSettings?.academicYear || '2025-2026',
    principalName: schoolSettings?.principalName || '',
    logo: schoolSettings?.logo || ''
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSettings(formData);
    await refreshSettings();

    try {
      await api.createAuditLog({
        action: 'SETTING_CHANGED',
        category: 'settings',
        userId: user?.id || 'u-admin',
        userName: user?.name || 'Administrator',
        userRole: user?.role || 'admin',
        details: `Updated institution settings: ${formData.name} (${formData.code}), Academic Year: ${formData.academicYear}`,
        targetEntity: 'School Profile & Configuration',
        status: 'warning'
      });
    } catch (err) {
      console.error('Failed to record audit log for settings update:', err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" /> Institution Profile & Settings
          </h2>
          <p className="text-xs text-slate-500">Update official branding, academic term configuration, and contact details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            School settings saved and applied system-wide!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">School Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Institution Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Motto / Tagline</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Principal / Director Name</label>
            <input
              type="text"
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
