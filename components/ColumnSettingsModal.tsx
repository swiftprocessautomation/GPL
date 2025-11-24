
import React, { useState } from 'react';
import { X, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { ColumnSetting } from '../types';

interface ColumnSettingsModalProps {
  columns: ColumnSetting[];
  onSave: (newColumns: ColumnSetting[]) => void;
  onClose: () => void;
}

export const ColumnSettingsModal: React.FC<ColumnSettingsModalProps> = ({ columns, onSave, onClose }) => {
  const [localColumns, setLocalColumns] = useState<ColumnSetting[]>(columns);
  const [newColumnName, setNewColumnName] = useState('');

  const toggleVisibility = (id: string) => {
    setLocalColumns(prev => prev.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const addCustomColumn = () => {
    if (newColumnName.trim()) {
      const newCol: ColumnSetting = {
        id: `custom-${Date.now()}`,
        label: newColumnName,
        visible: true,
        order: localColumns.length,
        isCustom: true
      };
      setLocalColumns([...localColumns, newCol]);
      setNewColumnName('');
    }
  };

  const removeCustomColumn = (id: string) => {
    setLocalColumns(prev => prev.filter(col => col.id !== id));
  };

  const handleSave = () => {
    onSave(localColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand-900 p-4 flex items-center justify-between text-white">
          <h2 className="font-bold">Table Settings</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {localColumns.map((col) => (
              <div key={col.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className={`text-sm font-medium ${col.visible ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{col.label}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleVisibility(col.id)} className="text-slate-500 hover:text-brand-500">
                    {col.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  {col.isCustom && (
                    <button onClick={() => removeCustomColumn(col.id)} className="text-red-500 hover:bg-red-50 rounded p-1">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Add Custom Column</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column Name"
                className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent dark:text-white"
              />
              <button onClick={addCustomColumn} className="p-2 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200">
                <Plus size={20} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Note: New columns map to 'Custom Fields' in tenant edit form.</p>
          </div>

          <button onClick={handleSave} className="w-full bg-brand-500 text-white font-bold py-2 rounded-xl hover:bg-brand-600 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
