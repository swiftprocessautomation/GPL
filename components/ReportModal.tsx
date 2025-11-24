
import React, { useState } from 'react';
import { X, FileText, Calendar, User, Building } from 'lucide-react';
import { Estate } from '../types';

interface ReportModalProps {
  estates: Estate[]; // Pass all estates for "Per Estate" selection if needed
  currentEstate: Estate;
  onClose: () => void;
  onGenerate: (type: 'ESTATE' | 'LANDLORD' | 'TIME', value: string, secondaryValue?: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ estates, currentEstate, onClose, onGenerate }) => {
  const [reportType, setReportType] = useState<'ESTATE' | 'LANDLORD' | 'TIME'>('ESTATE');
  const [selectedLandlord, setSelectedLandlord] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract unique landlords from current estate
  const landlords = Array.from(new Set(currentEstate.tenants.map(t => t.landlord).filter(Boolean)));

  const handleSubmit = () => {
    if (reportType === 'ESTATE') {
      onGenerate('ESTATE', currentEstate.id);
    } else if (reportType === 'LANDLORD') {
      if (!selectedLandlord) return alert('Please select a landlord');
      onGenerate('LANDLORD', selectedLandlord);
    } else if (reportType === 'TIME') {
      if (!startDate || !endDate) return alert('Please select a start and end date');
      onGenerate('TIME', startDate, endDate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <FileText size={24} /> Generate Report
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setReportType('ESTATE')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-bold transition-all ${reportType === 'ESTATE' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
            >
              <Building size={20} /> Per Estate
            </button>
            <button 
              onClick={() => setReportType('LANDLORD')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-bold transition-all ${reportType === 'LANDLORD' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
            >
              <User size={20} /> Per Landlord
            </button>
            <button 
              onClick={() => setReportType('TIME')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-sm font-bold transition-all ${reportType === 'TIME' ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
            >
              <Calendar size={20} /> Time Interval
            </button>
          </div>

          {/* Inputs based on type */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[120px] flex flex-col justify-center">
            {reportType === 'ESTATE' && (
              <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                Generates a full summary report for <strong>{currentEstate.name}</strong>, including all phases and tenants.
              </p>
            )}

            {reportType === 'LANDLORD' && (
              <div className="space-y-2 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Landlord</label>
                <select 
                  value={selectedLandlord}
                  onChange={(e) => setSelectedLandlord(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="">-- Select a Landlord --</option>
                  {landlords.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'TIME' && (
              <div className="space-y-3 w-full">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">Generates report based on historical payment data.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
          >
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
