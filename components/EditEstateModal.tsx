
import React, { useState, useRef } from 'react';
import { X, Building, User, Image as ImageIcon, Trash2, Upload, Plus, Edit2, Check } from 'lucide-react';
import { Estate } from '../types';

interface EditEstateModalProps {
  estate: Estate;
  onClose: () => void;
  onSave: (updatedEstate: Partial<Estate>) => void;
  onDeletePhase: (phaseName: string) => void;
  onAddPhase: (phaseName: string) => void;
  onRenamePhase: (oldName: string, newName: string) => void; // New Prop
  onDeleteEstate: () => void;
}

export const EditEstateModal: React.FC<EditEstateModalProps> = ({ estate, onClose, onSave, onDeletePhase, onAddPhase, onRenamePhase, onDeleteEstate }) => {
  const [formData, setFormData] = useState({
    name: estate.name,
    manager: estate.manager,
    imageUrl: estate.imageUrl,
  });
  const [newPhaseName, setNewPhaseName] = useState('');
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [tempPhaseName, setTempPhaseName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddPhase = () => {
    if (newPhaseName.trim()) {
      onAddPhase(newPhaseName.trim());
      setNewPhaseName('');
    }
  };
  
  const startRenaming = (phase: string) => {
      setEditingPhase(phase);
      setTempPhaseName(phase);
  };

  const saveRename = () => {
      if (editingPhase && tempPhaseName.trim() && tempPhaseName !== editingPhase) {
          onRenamePhase(editingPhase, tempPhaseName.trim());
      }
      setEditingPhase(null);
      setTempPhaseName('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Edit Estate</h2>
              <p className="text-brand-100 text-xs">Modify details and configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-estate-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Preview & Upload */}
            <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100 group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 transition-colors">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-white flex items-center gap-2"
                >
                  <Upload size={16} /> Change Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Estate Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white font-medium transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 dark:text-white font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Phase Management */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1">Manage Phases</label>
              
              {/* Add Phase Input */}
              <div className="flex gap-2 mb-3">
                <input 
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="New Phase Name"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
                <button 
                  type="button"
                  onClick={handleAddPhase}
                  className="px-3 py-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {estate.phases && estate.phases.map((phase) => (
                  <div key={phase} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {editingPhase === phase ? (
                         <div className="flex flex-1 items-center gap-2 mr-2">
                            <input 
                              type="text" 
                              value={tempPhaseName} 
                              onChange={(e) => setTempPhaseName(e.target.value)}
                              className="flex-1 p-1 text-sm rounded border border-brand-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                              autoFocus
                            />
                            <button type="button" onClick={saveRename} className="p-1 bg-green-100 text-green-600 rounded"><Check size={14}/></button>
                            <button type="button" onClick={() => setEditingPhase(null)} className="p-1 bg-red-100 text-red-600 rounded"><X size={14}/></button>
                         </div>
                    ) : (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{phase}</span>
                    )}
                    
                    <div className="flex items-center gap-1">
                        {!editingPhase && (
                            <button
                              type="button"
                              onClick={() => startRenaming(phase)}
                              className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Rename Phase"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent form submit
                            e.stopPropagation(); // Stop click from bubbling up
                            if(confirm(`Are you sure you want to delete ${phase}? All tenants in this phase will be moved to the archive.`)) {
                              onDeletePhase(phase);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Phase"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                ))}
                {(!estate.phases || estate.phases.length === 0) && (
                  <p className="text-center text-xs text-slate-400 py-2">No phases added yet.</p>
                )}
              </div>
            </div>

            {/* Delete Estate Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                   type="button"
                   onClick={() => {
                       if(confirm("WARNING: This will permanently delete the entire estate and all its tenants. This cannot be undone. Are you sure?")) {
                           onDeleteEstate();
                           onClose();
                       }
                   }}
                   className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Trash2 size={16} /> Delete Entire Estate
                </button>
            </div>

          </form>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-estate-form"
            className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all transform active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
