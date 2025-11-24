
import React from 'react';
import { RotateCcw, Trash2, Archive as ArchiveIcon, AlertTriangle, Layers } from 'lucide-react';
import { ArchivedItem } from '../types';

interface ArchiveProps {
  items: ArchivedItem[];
  onRestore: (item: ArchivedItem) => void;
  onPermanentDelete: (id: string) => void;
}

export const Archive: React.FC<ArchiveProps> = ({ items, onRestore, onPermanentDelete }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <ArchiveIcon size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-slate-600">Archive is Empty</h2>
        <p className="text-sm">Deleted estates, phases, and tenants will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ArchiveIcon className="text-slate-400" /> Archive
        </h1>
        <p className="text-slate-500">Restore deleted items or remove them permanently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
             <div className="flex items-start justify-between mb-2">
               <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                 item.type === 'ESTATE' ? 'bg-purple-100 text-purple-700' : 
                 item.type === 'PHASE' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
               }`}>
                 {item.type}
               </span>
               <span className="text-xs text-slate-400">
                 {new Date(item.deletedAt).toLocaleString(undefined, { 
                   month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                 })}
               </span>
             </div>
             
             <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 flex items-center gap-2">
               {item.type === 'PHASE' && <Layers size={16} className="text-amber-500"/>}
               {item.name}
             </h3>
             
             {(item.type === 'TENANT' || item.type === 'PHASE') && (
               <p className="text-xs text-slate-500 mb-4">From: {item.parentEstateName || 'Unknown Estate'}</p>
             )}
             
             {item.type === 'PHASE' && (
                <p className="text-xs text-slate-500 mb-4 italic">{item.data.tenants.length} tenants archived</p>
             )}

             <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => onRestore(item)}
                  className="flex-1 bg-brand-50 text-brand-700 py-2 rounded-lg text-sm font-bold hover:bg-brand-100 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> Restore
                </button>
                <button 
                  onClick={() => {
                    if(confirm("This action cannot be undone. Are you sure?")) onPermanentDelete(item.id);
                  }}
                  className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  title="Permanent Delete"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
