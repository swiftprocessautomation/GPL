
import React, { useState } from 'react';
import { AlertCircle, ArrowRight, SortAsc } from 'lucide-react';
import { Tenant, Estate } from '../types';

interface OverdueAlertsProps {
  estates: Estate[];
  onViewEstate: (estateId: string) => void;
  onViewAll: () => void; 
}

type SortOption = 'days' | 'amount';

export const OverdueAlerts: React.FC<OverdueAlertsProps> = ({ estates, onViewEstate, onViewAll }) => {
  const [sortBy, setSortBy] = useState<SortOption>('days');

  // Flatten all tenants from all estates and filter overdue
  const overdueTenants = estates.flatMap(e => 
    e.tenants
      .filter(t => t.status === 'Overdue')
      .map(t => ({ ...t, estateName: e.name, estateId: e.id }))
  ).sort((a, b) => {
    if (sortBy === 'days') {
      return a.daysLeft - b.daysLeft; // Ascending because daysLeft is negative for overdue (e.g. -50 < -10)
    } else {
      return b.outstandingBalance - a.outstandingBalance; // Descending amount
    }
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-between">
        <h3 className="font-display font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle size={18} /> Overdue Rent Alerts
        </h3>
        <span className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full font-bold">
          {overdueTenants.length}
        </span>
      </div>
      
      {/* Sort Controls */}
      <div className="px-4 py-2 border-b border-red-50 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><SortAsc size={12}/> Rank By:</span>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="text-xs border border-slate-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="days">Days Overdue (Highest)</option>
          <option value="amount">Amount Owed (Highest)</option>
        </select>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-2 max-h-[400px] custom-scrollbar">
        {overdueTenants.length > 0 ? (
          overdueTenants.map((item) => (
            <div 
              key={item.id} 
              className="group p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all cursor-pointer"
              onClick={() => onViewEstate(item.estateId)}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">{Math.abs(item.daysLeft)} days over</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.estateName} • {item.flatType}</p>
              <div className="flex justify-between items-center">
                 <span className="text-xs font-medium text-slate-400">Owed:</span>
                 <span className="text-sm font-bold text-red-700 dark:text-red-400">{formatCurrency(item.outstandingBalance)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-400 text-sm">
            No overdue payments. Great job!
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
          <button 
            onClick={onViewAll}
            className="text-xs font-bold text-brand-800 dark:text-brand-400 hover:text-brand-600 flex items-center justify-center gap-1"
          >
            View All Alerts <ArrowRight size={12} />
          </button>
      </div>
    </div>
  );
};
