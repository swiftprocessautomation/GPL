
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Building, Layers, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Estate, Tenant } from '../types';

interface PropertyTypeDetailProps {
  propertyType: string;
  estates: Estate[];
  onBack: () => void;
  onSelectTenant: (tenant: Tenant) => void;
}

export const PropertyTypeDetail: React.FC<PropertyTypeDetailProps> = ({ propertyType, estates, onBack, onSelectTenant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedEstates, setCollapsedEstates] = useState<Record<string, boolean>>({});

  // Aggregate tenants of this property type across all estates
  const matchingTenants = useMemo(() => {
    const results: { tenant: Tenant; estateName: string }[] = [];
    estates.forEach(est => {
      // Match logic: "2 Bedroom" should match "2 Bedroom Basic" and "2 Bedroom Maxi"
      est.tenants.filter(t => t.flatType.includes(propertyType)).forEach(t => {
        results.push({ tenant: t, estateName: est.name });
      });
    });
    return results;
  }, [estates, propertyType]);

  const filteredTenants = matchingTenants.filter(item => 
    item.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.estateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tenant.flatType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by Estate
  const groupedByEstate = useMemo(() => {
    const groups: Record<string, typeof filteredTenants> = {};
    filteredTenants.forEach(item => {
      if (!groups[item.estateName]) groups[item.estateName] = [];
      groups[item.estateName].push(item);
    });
    return groups;
  }, [filteredTenants]);

  const toggleEstate = (name: string) => {
    setCollapsedEstates(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
         
         <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-4">
           <ArrowLeft size={20} /> <span className="font-bold">Back to Dashboard</span>
         </button>

         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Layers size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Classification</p>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{propertyType}s</h1>
              </div>
           </div>
           <p className="text-slate-500">
             Found {filteredTenants.length} units across {Object.keys(groupedByEstate).length} estates matching "{propertyType}".
           </p>
         </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search tenants, estate or specific type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white"
          />
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-6">
        {Object.keys(groupedByEstate).length > 0 ? Object.keys(groupedByEstate).map(estateName => (
          <div key={estateName} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div 
               onClick={() => toggleEstate(estateName)}
               className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
               <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Building size={16} className="text-purple-500" /> {estateName}
               </h3>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                     {groupedByEstate[estateName].length} Units
                  </span>
                  {collapsedEstates[estateName] ? <ChevronRight size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
               </div>
            </div>

            {!collapsedEstates[estateName] && (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 animate-in slide-in-from-top-1">
                 {groupedByEstate[estateName].map((item) => (
                    <div 
                     key={item.tenant.id}
                     onClick={() => onSelectTenant(item.tenant)}
                     className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${item.tenant.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {item.tenant.block}-{item.tenant.flatNumber}
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{item.tenant.name}</p>
                             {/* Show specific type explicitly (e.g. 2 Bedroom Basic) */}
                             <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{item.tenant.flatType}</span>
                                <span>• Phase: {item.tenant.phase || 'N/A'}</span>
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{formatCurrency(item.tenant.rentExpected)}/yr</p>
                          <p className="text-xs text-slate-400">{item.tenant.daysLeft} days left</p>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        )) : (
          <div className="p-12 text-center text-slate-400">No properties found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};
