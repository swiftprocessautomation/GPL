
import React, { useState, useMemo, useRef } from 'react';
import { User, Shield, CheckCircle, HelpCircle, Send, Bell, Users, Building, Layers, Mail, Calendar, Settings, ChevronDown, ChevronRight, UserCheck, Download, Upload, AlertTriangle, Save } from 'lucide-react';
import { UserProfile, UserRole, Estate, ReportingSettings } from '../types';

interface ProfileProps {
  user: UserProfile;
  estates?: Estate[]; 
  onUpdateUser: (u: UserProfile) => void;
  onCreateUser?: (u: UserProfile) => void;
  // New Props for Data Portability
  systemData?: {
    landlords: string[];
    propertyTypes: string[];
    registeredUsers: UserProfile[];
    archivedItems: any[];
  };
  onRestoreSystem?: (data: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, estates = [], onUpdateUser, onCreateUser, systemData, onRestoreSystem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [grantAccessMode, setGrantAccessMode] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [expandedLandlords, setExpandedLandlords] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reporting State
  const [reporting, setReporting] = useState<ReportingSettings>(user.reportingSettings || {
    enabled: false,
    recipientEmail: '',
    sendDay: 20,
    includeExpiring6Months: true,
    includeExpiring3Months: true,
    scope: 'ALL'
  });

  // Grant Access State
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    accessLevel: 'VIEW_ONLY' as UserRole,
    name: '',
    scopeType: 'GLOBAL' as 'GLOBAL' | 'RESTRICTED',
    selectedEstates: [] as string[],
    selectedPhases: [] as string[], 
    selectedLandlords: [] as string[],
    selectedLandlordEstates: [] as string[] 
  });

  const handleSave = () => {
    onUpdateUser({
       ...user,
       reportingSettings: reporting
    });
    setIsEditing(false);
  };

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateUser) return;

    let accessScope = {
        type: newUser.scopeType,
        allowedEstates: newUser.selectedEstates.length > 0 ? newUser.selectedEstates : undefined,
        allowedPhases: newUser.selectedPhases.length > 0 ? newUser.selectedPhases : undefined,
        allowedLandlords: newUser.selectedLandlords.length > 0 ? newUser.selectedLandlords : undefined,
        allowedLandlordEstates: newUser.selectedLandlordEstates.length > 0 ? newUser.selectedLandlordEstates : undefined
    };

    if (allLandlords.includes(newUser.name)) {
        accessScope = {
            type: 'RESTRICTED',
            allowedEstates: undefined,
            allowedPhases: undefined,
            allowedLandlords: [newUser.name], 
            allowedLandlordEstates: undefined
        };
    }

    const profileToCreate: UserProfile = {
      name: newUser.name || "Guest User",
      username: newUser.username,
      email: "",
      phone: "",
      role: newUser.accessLevel,
      isVerified: true,
      password: newUser.password,
      notificationSettings: {
        rentDueAlerts: false,
        outstandingPaymentAlerts: false,
        daysThreshold: 7,
        emailNotifications: false,
        inAppNotifications: true
      },
      accessScope: accessScope as any
    };

    onCreateUser(profileToCreate);
    alert(`User '${newUser.username}' created successfully.`);
    setNewUser({ 
      username: '', password: '', accessLevel: 'VIEW_ONLY', name: '', 
      scopeType: 'GLOBAL', selectedEstates: [], selectedPhases: [], selectedLandlords: [], selectedLandlordEstates: []
    });
    setGrantAccessMode(false);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSent(true);
    setTimeout(() => {
        setSupportMsg('');
        setSupportSent(false);
    }, 3000);
  };

  // --- BACKUP & RESTORE LOGIC ---
  const handleDownloadBackup = () => {
    if (!systemData) return;
    
    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      estates: estates,
      ...systemData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `gabinas_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onRestoreSystem) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("This will load the selected data and refresh the application. Continue?")) {
           onRestoreSystem(json);
        }
      } catch (err) {
        alert("Invalid data file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Derived Data ---
  const allLandlords = Array.from(new Set(estates.flatMap(e => e.tenants.map(t => t.landlord)))).sort();
  const inputClass = "w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-12">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">User Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account, permissions, and reporting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="text-brand-500" size={20} /> Personal Information
              </h2>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEditing ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {isEditing ? 'Save All Changes' : 'Edit Profile & Settings'}
              </button>
            </div>
            
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                     <input type="text" value={user.name} disabled={!isEditing} onChange={(e) => onUpdateUser({...user, name: e.target.value})} className={inputClass}/>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                     <input type="text" value={user.username} disabled={!isEditing} onChange={(e) => onUpdateUser({...user, username: e.target.value})} className={inputClass}/>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                     <input type="email" value={user.email} disabled={!isEditing} onChange={(e) => onUpdateUser({...user, email: e.target.value})} className={inputClass}/>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                     <input type="tel" value={user.phone} disabled={!isEditing} onChange={(e) => onUpdateUser({...user, phone: e.target.value})} className={inputClass}/>
                  </div>
               </div>
            </div>
          </div>

          {/* Save & Load Data - SUPER_ADMIN ONLY */}
          {user.role === 'SUPER_ADMIN' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                 <Save className="text-brand-500" size={20} /> Save & Load Data
               </h2>
               <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start gap-3 mb-4">
                     <CheckCircle className="text-brand-500 shrink-0 mt-1" size={20}/>
                     <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Synchronize Devices</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                           Save your current data to a file to keep a backup or to transfer your work to another computer. Use "Load Changes" to import data from another device.
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <button 
                       onClick={handleDownloadBackup}
                       className="flex-1 bg-brand-100 text-brand-800 hover:bg-brand-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                     >
                        <Download size={18}/> Save Data to File
                     </button>
                     <div className="flex-1 relative">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleRestoreBackup}
                          accept=".json"
                          className="hidden"
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                           <Upload size={18}/> Load Changes
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Automated Reporting Settings */}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Mail className="text-brand-500" size={20} /> Automated Reporting
              </h2>
              <div className={`space-y-5 ${!isEditing ? 'opacity-70 pointer-events-none' : ''}`}>
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                       <h3 className="font-bold text-slate-800 dark:text-white">Enable Monthly Automation</h3>
                       <p className="text-xs text-slate-500">Send reports automatically on scheduled dates.</p>
                    </div>
                    <button 
                      onClick={() => setReporting({...reporting, enabled: !reporting.enabled})}
                      className={`w-12 h-6 rounded-full relative transition-colors ${reporting.enabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${reporting.enabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Recipient Email</label>
                       <input 
                         type="email" 
                         value={reporting.recipientEmail} 
                         onChange={e => setReporting({...reporting, recipientEmail: e.target.value})} 
                         className={inputClass}
                         placeholder="admin@company.com"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase">Day of Month</label>
                       <select 
                         value={reporting.sendDay} 
                         onChange={e => setReporting({...reporting, sendDay: parseInt(e.target.value)})}
                         className={inputClass}
                       >
                          {[...Array(28)].map((_, i) => (
                             <option key={i} value={i+1}>{i+1}{i+1 === 1 ? 'st' : i+1 === 2 ? 'nd' : i+1 === 3 ? 'rd' : 'th'}</option>
                          ))}
                       </select>
                    </div>
                 </div>
              </div>
              
              {!isEditing && (
                 <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex gap-2 items-center">
                    <Settings size={14}/> Click "Edit Profile" to change automation settings.
                 </div>
              )}
            </div>
          )}

          {/* Grant Access (SUPER_ADMIN Only) */}
          {user.role === 'SUPER_ADMIN' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Users className="text-brand-500" size={20} /> User Management
              </h2>
              
              {!grantAccessMode ? (
                 <button onClick={() => setGrantAccessMode(true)} className="bg-brand-100 text-brand-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-200">
                   Setup New User
                 </button>
              ) : (
                <form onSubmit={handleGrantAccess} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-600 space-y-4 animate-in fade-in">
                   <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">Account Details</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">User Full Name (Landlord)</label>
                        <select 
                            value={newUser.name} 
                            onChange={e => setNewUser({...newUser, name: e.target.value})} 
                            className={inputClass}
                            required
                        >
                            <option value="">-- Select Landlord --</option>
                            {allLandlords.map(l => <option key={l} value={l}>{l}</option>)}
                            <option value="Other">Other / Staff</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Access Role</label>
                        <select value={newUser.accessLevel} onChange={(e) => setNewUser({...newUser, accessLevel: e.target.value as UserRole})} className={inputClass}>
                            <option value="VIEW_ONLY">View Only</option>
                            <option value="VIEW_EDIT">View & Edit</option>
                        </select>
                     </div>
                   </div>
                   {newUser.name === "Other" && (
                       <input required type="text" onChange={e => setNewUser({...newUser, name: e.target.value})} className={inputClass} placeholder="Enter Full Name"/>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className={inputClass} placeholder="Login Username"/>
                     <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputClass} placeholder="Login Password"/>
                   </div>
                   
                   {newUser.name === "Other" && (
                       <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mt-2">
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">Access Permissions</h3>
                          <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="scope" checked={newUser.scopeType === 'GLOBAL'} onChange={() => setNewUser({...newUser, scopeType: 'GLOBAL'})} className="text-brand-500 focus:ring-brand-500" />
                              <span className="text-sm dark:text-slate-300">Full Access (All Estates)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="scope" checked={newUser.scopeType === 'RESTRICTED'} onChange={() => setNewUser({...newUser, scopeType: 'RESTRICTED'})} className="text-brand-500 focus:ring-brand-500" />
                              <span className="text-sm dark:text-slate-300">Restricted Access</span>
                            </label>
                          </div>
                       </div>
                   )}
                   
                   {newUser.name !== "Other" && newUser.name !== "" && (
                       <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 mt-2">
                           <strong>Note:</strong> This user will be automatically restricted to view only data related to <strong>{newUser.name}</strong>.
                       </div>
                   )}

                   <div className="flex gap-3 pt-4">
                     <button type="submit" className="bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">Create User Account</button>
                     <button type="button" onClick={() => setGrantAccessMode(false)} className="text-slate-500 px-4 py-2.5 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                   </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Shield className="text-brand-500" size={20} /> Current Role
              </h2>
              <div className={`p-4 rounded-xl border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 border-purple-100' : user.role === 'ADMIN' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                 <p className="font-bold text-slate-800">{user.role.replace('_', ' ')}</p>
                 <p className="text-xs text-slate-600 mt-1">
                   {user.role === 'SUPER_ADMIN' ? 'Full access: User management & all data.' : 
                    user.role === 'ADMIN' ? 'Can edit data when Edit Mode is on.' : 'View Only access.'}
                 </p>
              </div>
           </div>
           {/* Contact Support */}
           <div className="bg-brand-900 p-6 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={20} />
                <h3 className="font-bold text-lg">Contact Support</h3>
              </div>
              {supportSent ? (
                <div className="bg-white/10 p-4 rounded-xl text-center"><CheckCircle className="mx-auto mb-2"/> Message Sent</div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-3">
                   <textarea required value={supportMsg} onChange={e => setSupportMsg(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white" rows={3} placeholder="Describe issue..."/>
                   <button type="submit" className="w-full bg-white text-brand-900 py-2 rounded-lg font-bold text-sm hover:bg-brand-50">Send Message</button>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
