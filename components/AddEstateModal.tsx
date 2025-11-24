
import React, { useState } from 'react';
import { X, Building, User, Layers, Image as ImageIcon } from 'lucide-react';

interface AddEstateModalProps {
  onClose: () => void;
  onSave: (estateData: any) => void;
}

export const AddEstateModal: React.FC<AddEstateModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    imageUrl: '',
    phaseCount: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate phase names array
    const phases = Array.from({ length: formData.phaseCount }, (_, i) => `Phase ${i + 1}`);
    
    const newEstate = {
      name: formData.name,
      manager: formData.manager,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000', // Default image
      phases: phases,
      tenants: [],
      totalExpected: 0,
      totalActual: 0,
      totalOutstanding: 0,
      occupancyRate: 0
    };

    onSave(newEstate);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Add New Estate</h2>
              <p className="text-brand-100 text-xs">Create a new property portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Estate Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white transition-all"
                placeholder="e.g. Highland Towers"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Estate Manager</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white transition-all"
                placeholder="e.g. Mr. Smith"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Image URL (Optional)</label>
             <div className="relative">
               <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input
                 type="text"
                 value={formData.imageUrl}
                 onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                 className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white transition-all"
                 placeholder="https://..."
               />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Number of Phases</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="number"
                min="1"
                max="20"
                value={formData.phaseCount}
                onChange={(e) => setFormData({...formData, phaseCount: parseInt(e.target.value)})}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 ml-1">Layout will be based on Maben Flats template</p>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30"
          >
            Create Estate
          </button>
        </form>
      </div>
    </div>
  );
};
