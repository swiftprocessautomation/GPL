
import React from 'react';
import { X, Home, Calendar, CreditCard, AlertCircle, Layers, FileText } from 'lucide-react';
import { Tenant } from '../types';
import { generateEstateReport } from '../utils/reportGenerator';

interface TenantModalProps {
  tenant: Tenant | null;
  onClose: () => void;
}

export const TenantModal: React.FC<TenantModalProps> = ({ tenant, onClose }) => {
  if (!tenant) return null;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  const handleDownloadReport = () => {
    generateEstateReport([], 'TENANT', '', '', 'ADMIN', tenant);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose} // Close when clicking backdrop
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        {/* Header */}
        <div className="bg-brand-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <Home size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">{tenant.name}</h2>
              <p className="text-brand-100 font-sans">{tenant.flatType} • Block {tenant.block}</p>
              {tenant.phase && (
                <div className="flex items-center gap-1 mt-1 text-xs bg-white/20 w-fit px-2 py-0.5 rounded-full">
                  <Layers size={10} /> {tenant.phase}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans">Payment Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              tenant.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {tenant.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar size={14} />
                <span className="text-xs uppercase font-bold tracking-wider">Start Date</span>
              </div>
              <p className="font-semibold text-slate-800">{tenant.rentStartDate}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar size={14} />
                <span className="text-xs uppercase font-bold tracking-wider">Due Date</span>
              </div>
              <p className="font-semibold text-slate-800">{tenant.rentDueDate}</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
               <span className="text-slate-600 font-sans">Expected Rent</span>
               <span className="font-bold text-slate-800">{formatCurrency(tenant.rentExpected)}</span>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
               <span className="text-green-700 font-sans flex items-center gap-2">
                 <CreditCard size={16} /> Amount Paid
               </span>
               <span className="font-bold text-green-800">{formatCurrency(tenant.rentPaid)}</span>
             </div>

             <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
               <span className="text-blue-700 font-sans flex items-center gap-2">
                 <Calendar size={16} /> Payment Date
               </span>
               <span className="font-bold text-blue-800">{tenant.lastPaymentDate || tenant.rentStartDate}</span>
             </div>

             <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
               <span className="text-red-700 font-sans flex items-center gap-2">
                 <AlertCircle size={16} /> Outstanding
               </span>
               <span className="font-bold text-red-800">{formatCurrency(tenant.outstandingBalance)}</span>
             </div>
          </div>

          {/* Days Left Counter */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-1">Lease Expiry</p>
            <div className="inline-flex items-baseline gap-1">
              <span className={`text-3xl font-display font-bold ${tenant.daysLeft < 30 ? 'text-red-600' : 'text-slate-800'}`}>
                {Math.abs(tenant.daysLeft)}
              </span>
              <span className="text-slate-600">days {tenant.daysLeft < 0 ? 'overdue' : 'left'}</span>
            </div>
          </div>

          {/* Report Button */}
          <button 
            onClick={handleDownloadReport}
            className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <FileText size={18} /> Download Tenant Report
          </button>

        </div>
      </div>
    </div>
  );
};
