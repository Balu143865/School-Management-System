import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}) => {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="flex items-center justify-between mt-1 text-[10px]">
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
        {trend && (
          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

