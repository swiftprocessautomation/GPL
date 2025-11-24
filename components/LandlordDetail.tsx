
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Building, User, DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText, Filter, Edit2, Check, X, Search, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Estate, Tenant } from '../types';
import { ReportModal } from './ReportModal';
import { generateEstateReport } from '../utils/reportGenerator';

interface LandlordDetailProps {
  landlordName: string;
  estates: Estate[];
  isEditMode?: boolean;
  onBack: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onUpdateLandlord: (oldName: string, newName: string) => void;
  onDeleteLandlord: (name: string) => void;
}

export const LandlordDetail: React.FC<LandlordDetailProps> = ({ landlordName, estates, isEditMode = false, onBack, onSelectTenant, onUpdateLandlord, onDeleteLandlord }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(landlordName);
  
  // View State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Overdue' | 'Active'>('All');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };
  
  // Aggregate Data
  const landlordTenants = useMemo(() => {
    const tenants: { tenant: Tenant; estateName: string }[] = [];
    estates.forEach(est => {
      est.tenants.filter(t => t.landlord === landlordName).forEach(t => {
        tenants.push({ tenant: t, estateName: est.name });
      });
    });
    return tenants;
  }, [estates, landlordName]);

  // Filtering
  const filteredTenants = useMemo(() => {
    return landlordTenants.filter(item => {
      const matchesSearch = 
        item.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.estateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenant.flatType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'All' || item.tenant.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [landlordTenants, searchTerm, filterStatus]);

  const overdueTenants = filteredTenants.filter(item => item.tenant.status === 'Overdue');

  // Metrics (Based on ALL tenants for this landlord, not just filtered)
  const totalExpected = landlordTenants.reduce((acc, item) => acc + item.tenant.rentExpected, 0);
  const totalPaid = landlordTenants.reduce((acc, item) => acc + item.tenant.rentPaid, 0);
  const totalOutstanding = totalExpected - totalPaid;
  const propertyCount = landlordTenants.length;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  // Group by Estate for display
  const groupedByEstate = useMemo(() => {
    const groups: Record<string, typeof filteredTenants> = {};
    filteredTenants.forEach(item => {
      if (!groups[item.estateName]) groups[item.estateName] = [];
      groups[item.estateName].push(item);
    });
    return groups;
  }, [filteredTenants]);

  const handleSaveName = () => {
    if (editName.trim() && editName !== landlordName) {
        onUpdateLandlord(landlordName, editName.trim());
        setIsEditing(false);
    } else {
        setIsEditing(false);
        setEditName(landlordName);
    }
  };

  const handleDelete = () => {
      if (propertyCount > 0) {
          alert(`Cannot delete landlord "${landlordName}" because they have ${propertyCount} active properties. Please reassign or delete the tenants first.`);
          return;
      }
      if (confirm(`Are you sure you want to delete the landlord "${landlordName}"? This action cannot be undone.`)) {
          onDeleteLandlord(landlordName);
      }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6">
          <ArrowLeft size={20} /> <span className="font-bold">Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                <User size={32} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Landlord Portfolio</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-3xl font-display font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-brand-500 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"><Check size={16}/></button>
                    <button onClick={() => { setIsEditing(false); setEditName(landlordName); }} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={16}/></button>
                  </div>
                ) : (
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {landlordName}
                    {isEditMode && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="text-slate-400 hover:text-brand-500 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Name"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={handleDelete} 
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Landlord"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </h1>
                )}
              </div>
            </div>
            <p className="text-slate-500 max-w-lg">
              Overview of properties, tenant performance, and financial status for this landlord across all estates.
            </p>
          </div>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
          >
            <FileText size={20} /> Generate Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><Building size={20} className="text-slate-600 dark:text-slate-300"/></div>
             <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{propertyCount} Units</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total Properties</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{propertyCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><DollarSign size={20} className="text-blue-600 dark:text-blue-400"/></div>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total Expected</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(totalExpected)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><TrendingUp size={20} className="text-green-600 dark:text-green-400"/></div>
             <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Paid</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total Recovered</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalPaid)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><TrendingDown size={20} className="text-red-600 dark:text-red-400"/></div>
             <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">Owed</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search tenants or estate names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50/50 dark:bg-slate-900/50 dark:text-white shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="ml-2 text-slate-400" />
          {['All', 'Active', 'Overdue'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                filterStatus === status 
                  ? 'bg-brand-900 text-white shadow' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Overdue Section */}
         <div className="lg:col-span-1 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden">
               <div 
                 onClick={() => toggleSection('overdue')}
                 className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors"
               >
                 <h3 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                   <AlertCircle size={18} /> Overdue Tenants ({overdueTenants.length})
                 </h3>
                 {collapsedSections['overdue'] ? <ChevronRight size={18} className="text-red-400"/> : <ChevronDown size={18} className="text-red-400"/>}
               </div>
               
               {!collapsedSections['overdue'] && (
                 <div className="p-4 pt-0 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 animate-in slide-in-from-top-1">
                   {overdueTenants.length > 0 ? overdueTenants.map((item) => (
                     <div 
                      key={item.tenant.id}
                      onClick={() => onSelectTenant(item.tenant)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all border border-red-100 dark:border-red-900/30"
                     >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.tenant.name}</p>
                            <p className="text-xs text-slate-500">{item.estateName}</p>
                          </div>
                          <span className="text-xs font-bold text-red-600">{item.tenant.daysLeft} days</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                           <span className="text-xs text-slate-400">Owed:</span>
                           <span className="text-sm font-bold text-red-700 dark:text-red-400">{formatCurrency(item.tenant.outstandingBalance)}</span>
                        </div>
                     </div>
                   )) : (
                     <p className="text-sm text-slate-500 text-center py-4">No overdue tenants matching filter.</p>
                   )}
                 </div>
               )}
            </div>
         </div>

         {/* Property List */}
         <div className="lg:col-span-2 space-y-6">
            {Object.keys(groupedByEstate).length > 0 ? Object.keys(groupedByEstate).map(estateName => (
              <div key={estateName} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                 <div 
                   onClick={() => toggleSection(estateName)}
                   className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                       <Building size={16} className="text-brand-500" /> {estateName}
                    </h3>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                          {groupedByEstate[estateName].length} Properties
                       </span>
                       {collapsedSections[estateName] ? <ChevronRight size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                    </div>
                 </div>
                 
                 {!collapsedSections[estateName] && (
                   <div className="divide-y divide-slate-100 dark:divide-slate-700 animate-in slide-in-from-top-1">
                      {groupedByEstate[estateName].map((item) => (
                         <div 
                          key={item.tenant.id}
                          onClick={() => onSelectTenant(item.tenant)}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between group"
                         >
                            <div>
                               <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">{item.tenant.name}</p>
                               <p className="text-xs text-slate-500">{item.tenant.flatType} • {item.tenant.block}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{formatCurrency(item.tenant.rentExpected)}</p>
                               <p className={`text-xs font-bold ${item.tenant.outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {item.tenant.outstandingBalance > 0 ? `Owes ${formatCurrency(item.tenant.outstandingBalance)}` : 'Paid'}
                               </p>
                            </div>
                         </div>
                      ))}
                   </div>
                 )}
              </div>
            )) : (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-500">No properties found matching your criteria.</p>
              </div>
            )}
         </div>
      </div>

      {isReportModalOpen && (
        <ReportModal 
          currentEstate={estates[0]} 
          estates={estates}
          onClose={() => setIsReportModalOpen(false)}
          onGenerate={(type, value, secondaryValue) => {
             if (type === 'ESTATE') {
               const filteredEstates = estates.map(e => ({
                 ...e,
                 tenants: e.tenants.filter(t => t.landlord === landlordName)
               })).filter(e => e.id === value);

               generateEstateReport(filteredEstates, 'LANDLORD', landlordName, secondaryValue);
             } else if (type === 'TIME') {
                const filteredEstates = estates.map(e => ({
                 ...e,
                 tenants: e.tenants.filter(t => t.landlord === landlordName)
               }));
               generateEstateReport(filteredEstates, 'TIME', value, secondaryValue);
             } else {
               generateEstateReport(estates, 'LANDLORD', landlordName);
             }
          }}
        />
      )}
    </div>
  );
};
