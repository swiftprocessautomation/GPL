
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Filter, User, AlertTriangle, Plus, DollarSign, PieChart, Layers, Pencil, Trash2, ChevronDown, ChevronUp, FileText, Mail, Phone, Settings, UserCheck, Edit, Lock, Info } from 'lucide-react';
import { Estate, Tenant, ColumnSetting, UserProfile } from '../types';
import { AddTenantModal } from './AddTenantModal';
import { generateEstateReport } from '../utils/reportGenerator';
import { ReportModal } from './ReportModal';
import { ColumnSettingsModal } from './ColumnSettingsModal';
import { EditEstateModal } from './EditEstateModal';

interface EstateDetailProps {
  estate: Estate;
  estatesList: Estate[];
  user?: UserProfile | null;
  isEditMode?: boolean; 
  onBack: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onAddTenant: (tenantData: any) => void;
  onUpdateTenant: (tenantData: any) => void;
  onDeleteTenant: (tenantId: string) => void;
  onDeleteEstate: (estateId: string) => void;
  onUpdateEstate: (estateId: string, data: Partial<Estate>) => void;
  onDeletePhase: (estateId: string, phaseName: string) => void;
  onAddPhase: (estateId: string, phaseName: string) => void;
  onRenamePhase: (estateId: string, oldName: string, newName: string) => void; 
  onRequestAccess: (estateName: string) => void;
  availableLandlords: string[]; 
}

const DEFAULT_COLUMNS: ColumnSetting[] = [
  { id: 'sn', label: 'S/N', visible: true, order: 0 },
  { id: 'landlord', label: 'Landlord', visible: true, order: 1 },
  { id: 'tenant', label: 'Tenant Name', visible: true, order: 2 },
  { id: 'apartment', label: 'Apartment Details', visible: true, order: 3 }, 
  { id: 'expected', label: 'Expected', visible: true, order: 4 },
  { id: 'paid', label: 'Paid', visible: true, order: 5 },
  { id: 'outstanding', label: 'Outstanding', visible: true, order: 6 },
  { id: 'dueDate', label: 'Due Date', visible: true, order: 7 },
  { id: 'status', label: 'Status', visible: true, order: 8 },
  { id: 'actions', label: 'Actions', visible: true, order: 9 }
];

export const EstateDetail: React.FC<EstateDetailProps> = ({ 
  estate, 
  estatesList,
  user,
  isEditMode = false, 
  onBack, 
  onSelectTenant, 
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onDeleteEstate,
  onUpdateEstate,
  onDeletePhase,
  onAddPhase,
  onRenamePhase,
  onRequestAccess,
  availableLandlords
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Overdue' | 'Active'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isEditEstateModalOpen, setIsEditEstateModalOpen] = useState(false);
  
  // Robust initialization for columns
  const [columns, setColumns] = useState<ColumnSetting[]>(
    (estate.columnPreferences && estate.columnPreferences.length > 0) ? estate.columnPreferences : DEFAULT_COLUMNS
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('All');
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'VIEW_EDIT' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    setColumns(
      (estate.columnPreferences && estate.columnPreferences.length > 0) ? estate.columnPreferences : DEFAULT_COLUMNS
    );
  }, [estate.id, estate.columnPreferences]);

  const [expandedPhases, setExpandedPhases] = useState<string[]>(estate.phases || []);

  const hasPhases = (estate.phases && estate.phases.length > 0);
  const uniquePropertyTypes = Array.from(new Set(estate.tenants.map(t => t.flatType)));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  // Helper for outstanding color
  const getOutstandingStyle = (balance: number, daysLeft: number) => {
    if (balance <= 0) return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'; // Paid
    if (daysLeft < 0) return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'; // Overdue
    return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'; // Active but Owing
  };

  const filteredTenants = useMemo(() => {
    return estate.tenants.filter(tenant => {
      const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tenant.flatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (tenant.landlord && tenant.landlord.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'All' || tenant.status === filterStatus;
      const matchesType = propertyTypeFilter === 'All' || tenant.flatType === propertyTypeFilter;

      return matchesSearch && matchesFilter && matchesType;
    });
  }, [estate.tenants, searchTerm, filterStatus, propertyTypeFilter]);

  const handleEditClick = (e: React.MouseEvent, tenant: Tenant) => {
    e.stopPropagation();
    if (!isEditMode) return; 
    setEditingTenant(tenant);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, tenantId: string, tenantName: string) => {
    e.stopPropagation();
    if (!isEditMode) return; 
    if (confirm(`Are you sure you want to delete tenant "${tenantName}"? They will be moved to the archive.`)) {
      onDeleteTenant(tenantId);
    }
  };
  
  const handleDeleteEstateClick = () => {
    if (confirm(`Are you sure you want to delete "${estate.name}"? This will move the estate and all its data to the archive.`)) {
      onDeleteEstate(estate.id);
    }
  };

  const handlePhaseDeleteClick = (e: React.MouseEvent, phaseName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the entire "${phaseName}" section? All tenants in this phase will be moved to the archive.`)) {
      onDeletePhase(estate.id, phaseName);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingTenant(null);
  };

  const handleModalSave = (data: any) => {
    if (editingTenant) {
      onUpdateTenant(data);
    } else {
      onAddTenant(data);
    }
    handleModalClose();
  };
  
  const handleColumnSave = (newColumns: ColumnSetting[]) => {
    setColumns(newColumns);
  };

  const togglePhase = (phaseName: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseName) 
        ? prev.filter(p => p !== phaseName) 
        : [...prev, phaseName]
    );
  };

  const isColVisible = (id: string) => columns.find(c => c.id === id)?.visible;

  const renderTenantRow = (tenant: Tenant, idx: number) => (
    <tr 
      key={tenant.id}
      onClick={() => onSelectTenant(tenant)}
      className="hover:bg-brand-50/50 dark:hover:bg-brand-900/20 cursor-pointer transition-colors group border-b border-slate-50 dark:border-slate-700 last:border-0"
    >
      {isColVisible('sn') && <td className="p-4 pl-6 text-slate-400 font-sans text-sm font-medium">{tenant.serialNumber}</td>}
      {isColVisible('landlord') && (
        <td className="p-4 font-sans text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <UserCheck size={14} className="text-brand-400" /> {tenant.landlord || '-'}
        </td>
      )}
      {isColVisible('tenant') && (
        <td className="p-4 font-sans text-sm">
          <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{tenant.name}</div>
          {(tenant.email || tenant.phoneNumber) && (
             <div className="flex flex-col text-xs text-slate-400 mt-1">
               {tenant.phoneNumber && <span className="flex items-center gap-1"><Phone size={10}/> {tenant.phoneNumber}</span>}
               {tenant.email && <span className="flex items-center gap-1"><Mail size={10}/> {tenant.email}</span>}
             </div>
          )}
        </td>
      )}
      {isColVisible('apartment') && (
        <td className="p-4 text-slate-600 dark:text-slate-400 font-sans text-sm">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
               <span className="font-bold text-lg text-slate-800 dark:text-white">{tenant.flatNumber}</span>
               {tenant.flatNumber && <span className="text-slate-300">|</span>}
               <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">BLK {tenant.block}</span>
            </div>
            <span className="text-xs font-medium">{tenant.flatType}</span>
            {tenant.tenor && <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wide">{tenant.tenor}</span>}
          </div>
        </td>
      )}
      
      {columns.filter(c => c.isCustom && c.visible).map(col => (
         <td key={col.id} className="p-4 text-slate-600 dark:text-slate-400 text-sm">
            {tenant.customFields?.[col.label] || '-'}
         </td>
      ))}

      {isColVisible('expected') && <td className="p-4 text-right text-slate-500 dark:text-slate-400 font-sans text-sm font-medium">{formatCurrency(tenant.rentExpected)}</td>}
      {isColVisible('paid') && <td className="p-4 text-right text-brand-600 dark:text-brand-400 font-sans text-sm font-bold">{formatCurrency(tenant.rentPaid)}</td>}
      {isColVisible('outstanding') && (
        <td className="p-4 text-right font-medium font-sans text-sm">
          <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${getOutstandingStyle(tenant.outstandingBalance, tenant.daysLeft)}`}>
            {formatCurrency(tenant.outstandingBalance)}
          </span>
        </td>
      )}
      {isColVisible('dueDate') && <td className="p-4 text-slate-600 dark:text-slate-400 text-sm font-sans">{tenant.rentDueDate}</td>}
      {isColVisible('status') && (
        <td className="p-4 pr-6 text-center font-sans">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border ${
            tenant.daysLeft < 0 ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900' : 
            tenant.daysLeft < 30 ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900' : 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900'
          }`}>
            {tenant.daysLeft < 0 && <AlertTriangle size={12} />}
            {tenant.daysLeft} days
          </div>
        </td>
      )}
      {isColVisible('actions') && (
        <td className="p-4 pr-6 text-right">
          {isAdmin && isEditMode ? (
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => handleEditClick(e, tenant)}
                className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-full transition-colors"
                title="Edit Tenant"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={(e) => handleDeleteClick(e, tenant.id, tenant.name)}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                title="Delete Tenant"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
             <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-xs text-slate-400 flex items-center gap-1"><Lock size={10} /> View Only</span>
             </div>
          )}
        </td>
      )}
    </tr>
  );

  const renderTableHeader = () => (
    <thead>
      <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {isColVisible('sn') && <th className="p-4 pl-6 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">S/N</th>}
        {isColVisible('landlord') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Landlord</th>}
        {isColVisible('tenant') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Tenant Name</th>}
        {isColVisible('apartment') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Apartment Details</th>}
        
        {columns.filter(c => c.isCustom && c.visible).map(col => (
           <th key={col.id} className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">{col.label}</th>
        ))}

        {isColVisible('expected') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Expected</th>}
        {isColVisible('paid') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Paid</th>}
        {isColVisible('outstanding') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Outstanding</th>}
        {isColVisible('dueDate') && <th className="p-4 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Due Date</th>}
        {isColVisible('status') && <th className="p-4 text-center font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>}
        {isColVisible('actions') && <th className="p-4 pr-6 font-display font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">
           <button onClick={() => setIsColumnModalOpen(true)} title="Table Settings">
              <Settings size={16} className="text-slate-400 hover:text-brand-500" />
           </button>
        </th>}
      </tr>
    </thead>
  );

  const renderPhaseSegments = () => {
    const phases = estate.phases || [];
    return (
      <div className="space-y-6">
        {phases.map(phase => {
           const phaseTenants = filteredTenants.filter(t => t.phase === phase);
           
           // Skip rendering empty phases if we have filters active, BUT keep them if we're in edit mode to allow editing
           if (phaseTenants.length === 0 && (searchTerm || filterStatus !== 'All' || propertyTypeFilter !== 'All') && !isEditMode) return null;

           const phaseExpected = phaseTenants.reduce((sum, t) => sum + t.rentExpected, 0);
           const phasePaid = phaseTenants.reduce((sum, t) => sum + t.rentPaid, 0);
           const phaseOutstanding = phaseExpected - phasePaid;
           
           const isExpanded = expandedPhases.includes(phase);

           return (
             <div key={phase} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
               <div 
                 onClick={() => togglePhase(phase)}
                 className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
               >
                 <div className="flex items-center gap-3">
                   <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-brand-200 dark:bg-brand-900 rotate-180' : 'bg-slate-200 dark:bg-slate-600'}`}>
                      <ChevronDown size={16} className={isExpanded ? 'text-brand-700 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'} />
                   </div>
                   <h3 className="text-lg font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                     <Layers size={20} className="text-brand-500" /> {phase}
                   </h3>
                 </div>
 
                 <div className="flex flex-wrap items-center gap-3 text-sm">
                   <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                     <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase block">Expected</span>
                     <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(phaseExpected)}</span>
                   </div>
                   <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900 shadow-sm">
                     <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase block">Paid</span>
                     <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(phasePaid)}</span>
                   </div>
                   <div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900 shadow-sm">
                      <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase block">Outstanding</span>
                      <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(phaseOutstanding)}</span>
                   </div>
                   {isAdmin && isEditMode && (
                     <button
                       onClick={(e) => handlePhaseDeleteClick(e, phase)}
                       className="p-2 ml-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors z-10"
                       title={`Delete ${phase}`}
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                 </div>
               </div>
 
               {isExpanded && (
                 <div className="animate-in slide-in-from-top-2 duration-200">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       {renderTableHeader()}
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                         {phaseTenants.length > 0 ? phaseTenants.map((t, i) => renderTenantRow(t, i)) : (
                            <tr><td colSpan={10} className="p-4 text-center text-slate-400 text-sm">No tenants match criteria in this phase</td></tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}
             </div>
           );
         })}
       </div>
     );
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-6 pb-12">
      
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-md group">
        <img 
          src={estate.imageUrl} 
          alt={estate.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-6 left-6">
           <button 
            onClick={onBack}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-colors border border-white/30"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {isAdmin && isEditMode && (
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={() => setIsEditEstateModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-colors border border-white/30"
              title="Edit Estate Details"
            >
              <Edit size={20} />
            </button>
            <button 
              onClick={handleDeleteEstateClick}
              className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white p-2 rounded-full transition-colors border border-red-400"
              title="Delete Estate"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 shadow-sm">{estate.name}</h1>
            <div className="flex items-center gap-2 text-brand-100 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit border border-white/10">
              <User size={16} />
              <span className="font-sans text-sm font-medium">Managed by {estate.manager}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={() => setIsReportModalOpen(true)}
               className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-3 rounded-xl font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
             >
               <FileText size={16} /> Generate Report
             </button>
             {isAdmin && isEditMode ? (
               <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all font-bold transform active:scale-95"
              >
                <Plus size={20} />
                Add Tenant
              </button>
             ) : !isAdmin && (
               <button 
                 onClick={() => onRequestAccess(estate.name)}
                 className="flex items-center gap-2 bg-slate-600/80 hover:bg-slate-600 text-white px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 transition-all font-bold"
               >
                 <Lock size={16} /> Request Edit Access
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Controls & Legend */}
      <div className="flex flex-col gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search tenants, landlords, flats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50/50 dark:bg-slate-900/50 dark:text-white shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Property Type Filter */}
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="All">All Types</option>
              {uniquePropertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

            <Filter size={16} className="ml-1 text-slate-400" />
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

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-slate-500 dark:text-slate-400">
           <span className="flex items-center gap-1 font-bold text-slate-400"><Info size={14}/> Outstanding Balance Color Code:</span>
           <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-100 dark:border-green-900">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-green-700 dark:text-green-400 font-bold">Green (Paid)</span>
           </div>
           <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-100 dark:border-blue-900">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-blue-700 dark:text-blue-400 font-bold">Blue (Owing but Not Overdue)</span>
           </div>
           <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-red-700 dark:text-red-400 font-bold">Red (Owing & Overdue)</span>
           </div>
        </div>
      </div>

      {/* Content */}
      {hasPhases ? (
        renderPhaseSegments()
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {renderTableHeader()}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant, idx) => renderTenantRow(tenant, idx))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      <p className="font-medium">No tenants found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddTenantModal 
          onClose={handleModalClose}
          onSave={handleModalSave}
          initialData={editingTenant}
          isMabenEstate={hasPhases}
          availableLandlords={availableLandlords}
        />
      )}

      {isReportModalOpen && (
        <ReportModal 
          currentEstate={estate}
          estates={estatesList}
          onClose={() => setIsReportModalOpen(false)}
          onGenerate={(type, value, secondaryValue) => generateEstateReport(estatesList, type, value, secondaryValue || '', user?.role)}
        />
      )}

      {isColumnModalOpen && (
        <ColumnSettingsModal 
          columns={columns}
          onSave={handleColumnSave}
          onClose={() => setIsColumnModalOpen(false)}
        />
      )}

      {isEditEstateModalOpen && isAdmin && isEditMode && (
        <EditEstateModal
          estate={estate}
          onClose={() => setIsEditEstateModalOpen(false)}
          onSave={(data) => onUpdateEstate(estate.id, data)}
          onDeletePhase={(phase) => onDeletePhase(estate.id, phase)}
          onAddPhase={(phase) => onAddPhase(estate.id, phase)}
          onRenamePhase={(oldName, newName) => onRenamePhase(estate.id, oldName, newName)} 
          onDeleteEstate={() => onDeleteEstate(estate.id)} 
        />
      )}
    </div>
  );
};
