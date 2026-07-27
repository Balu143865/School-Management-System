import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { api } from '../../lib/api';
import { DataTable, Column } from '../common/DataTable';
import { Users } from 'lucide-react';

export const ParentManagement: React.FC = () => {
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const parentList = await api.getUsers('parent');
      setParents(parentList);
    } catch (err) {
      console.error('Error loading parents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<User>[] = [
    {
      header: 'Parent Name',
      accessor: (item) => (
        <div className="flex items-center gap-2.5">
          <img
            src={item.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
            alt={item.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-[10px] text-slate-400">{item.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Associated Child', accessor: (item) => item.childName || 'Alex Johnson' },
    { header: 'Contact Phone', accessor: 'phone' },
    { header: 'Home Address', accessor: (item) => item.address || 'Campus Neighborhood' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Parent Portal Directory
          </h2>
          <p className="text-xs text-slate-500">Track linked parents, emergency contacts, and home details.</p>
        </div>
      </div>

      <DataTable
        title="Parent Records"
        columns={columns}
        data={parents}
        searchKey="name"
        exportFilename="parents_directory.csv"
      />
    </div>
  );
};
