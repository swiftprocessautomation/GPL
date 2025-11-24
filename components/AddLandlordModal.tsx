import React, { useState } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';

interface AddLandlordModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export const AddLandlordModal: React.FC<AddLandlordModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Add Landlord</h2>
              <p className="text-brand-100 text-xs">Register a new property owner</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Landlord Name</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white font-medium transition-all"
                placeholder="e.g. Chief Alaba"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30"
          >
            Add Landlord
          </button>
        </form>
      </div>
    </div>
  );
};
