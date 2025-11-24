
import React, { useMemo } from 'react';
import { X, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Estate } from '../types';

interface AlertsModalProps {
  estates: Estate[];
  onClose: () => void;
  onViewEstate: (estateId: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ estates, onClose, onViewEstate }) => {
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  const { overdue, upcoming } = useMemo(() => {
    const allTenants = estates.flatMap(e => 
      e.tenants.map(t => ({ ...t, estateName: e.name, estateId: e.id }))
    );

    const overdueList = allTenants.filter(t => t.status === 'Overdue').sort((a, b) => a.daysLeft - b.daysLeft);
    // Filter for upcoming (0 to 90 days)
    const upcomingList = allTenants.filter(t => t.daysLeft >= 0 && t.daysLeft <= 90).sort((a, b) => a.daysLeft - b.daysLeft);

    return { overdue: overdueList, upcoming: upcomingList };
  }, [estates]);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Alerts Center</h2>
              <p className="text-brand-100 text-xs">Overdue payments and upcoming lease expirations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Overdue Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
                <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={18} /> Overdue Rents
                </h3>
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full font-bold">
                  {overdue.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {overdue.length > 0 ? overdue.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => { onViewEstate(t.estateId); onClose(); }}
                    className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.estateName} • {t.flatType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">{t.daysLeft} days</p>
                        <p className="text-xs text-red-500">Overdue</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30 flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Outstanding:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(t.outstandingBalance)}</span>
                        <ArrowRight size={14} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                    <p className="text-slate-500 text-sm">No overdue rents!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/30 pb-2">
                <h3 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Clock size={18} /> Expiring Soon (&lt;90 Days)
                </h3>
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-2 py-1 rounded-full font-bold">
                  {upcoming.length}
                </span>
              </div>

              <div className="space-y-3">
                {upcoming.length > 0 ? upcoming.map(t => (
                   <div 
                    key={t.id}
                    onClick={() => { onViewEstate(t.estateId); onClose(); }}
                    className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.estateName} • {t.flatType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600 dark:text-amber-400">{t.daysLeft} days</p>
                        <p className="text-xs text-amber-500">Remaining</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/30 flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Due Date:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{t.rentDueDate}</span>
                        <ArrowRight size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )) : (
                   <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle className="mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-slate-500 text-sm">No upcoming expirations in the next 90 days.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
