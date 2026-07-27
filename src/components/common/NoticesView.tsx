import React, { useEffect, useState } from 'react';
import { Notice } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../lib/offlineStorage';
import { Bell, Plus, Sparkles, Calendar, Tag, WifiOff } from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'All' as 'All' | 'Teachers' | 'Students' | 'Parents',
    category: 'General' as 'General' | 'Academic' | 'Sports' | 'Exam' | 'Holiday'
  });

  const loadData = async () => {
    try {
      const list = await api.getNotices();
      setNotices(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createNotice({
      ...form,
      authorName: user?.name || 'School Principal',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(false);
    setForm({ title: '', content: '', targetAudience: 'All', category: 'General' });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600" /> School Noticeboard & Announcements
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-500">Official circulars, holiday notices, and campus updates.</p>
            {!isOnline && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                <WifiOff className="w-3 h-3 text-amber-600" /> Offline Notices
              </span>
            )}
          </div>
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px]">
                  {n.category}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {n.date}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Audience: <strong className="text-slate-700">{n.targetAudience}</strong></span>
              <span>Issued By: <strong className="text-slate-700">{n.authorName}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Official Notice">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Examination Schedule Released"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notice Body / Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Detail official instructions, schedules, or updates..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Audience</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
              >
                <option value="All">All School</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Sports">Sports</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition shadow-xs mt-2"
          >
            Publish Notice
          </button>
        </form>
      </Modal>
    </div>
  );
};
