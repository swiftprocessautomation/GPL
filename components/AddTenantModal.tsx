
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calendar, DollarSign, Home, Hash, Layers, Edit2, Mail, Phone, UserCheck, Clock, Plus, Trash2 } from 'lucide-react';
import { Tenant, PaymentRecord } from '../types';
import { TENANT_FLAT_TYPES } from '../services/dataService';

interface AddTenantModalProps {
  onClose: () => void;
  onSave: (tenantData: any) => void;
  initialData?: Partial<Tenant> | null;
  isMabenEstate?: boolean;
  availableLandlords: string[];
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ onClose, onSave, initialData, isMabenEstate = true, availableLandlords }) => {
  const [formData, setFormData] = useState({
    name: '',
    landlord: '',
    email: '',
    phone: '',
    houseType: '1 Bedroom', 
    flatNumber: '',
    block: '1',
    tenor: '1 Year',
    phase: 'Phase 1',
    rentExpected: '',
    rentPaid: '', 
    lastPaymentDate: '', // New Field State
    rentStartDate: '',
    rentDueDate: '',
  });
  
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [newPayment, setNewPayment] = useState({ 
    date: '', 
    amount: '', 
    description: '',
    periodFrom: '',
    periodTo: ''
  });

  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        landlord: initialData.landlord || '',
        email: initialData.email || '',
        phone: initialData.phoneNumber || '',
        houseType: initialData.flatType || '1 Bedroom',
        flatNumber: initialData.flatNumber || initialData.customFields?.['Flat Number'] || '',
        block: initialData.block || '1',
        tenor: initialData.tenor || '1 Year',
        phase: initialData.phase || 'Phase 1',
        rentExpected: initialData.rentExpected ? initialData.rentExpected.toString() : '',
        rentPaid: initialData.rentPaid ? initialData.rentPaid.toString() : '',
        rentStartDate: initialData.rentStartDate || '',
        rentDueDate: initialData.rentDueDate || '',
        lastPaymentDate: initialData.lastPaymentDate || initialData.rentStartDate || '',
      });
      if (initialData.customFields) {
        setCustomFields(initialData.customFields);
      }
      if (initialData.paymentHistory) {
        setPaymentHistory(initialData.paymentHistory);
      }
    }
  }, [initialData]);

  // Auto-calculate Rent Paid when history changes
  useEffect(() => {
    if (paymentHistory.length > 0) {
      const total = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
      setFormData(prev => ({ ...prev, rentPaid: total.toString() }));
    }
  }, [paymentHistory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPayment = () => {
    if (newPayment.date && newPayment.amount) {
      const record: PaymentRecord = {
        id: Date.now().toString(),
        date: newPayment.date,
        amount: parseFloat(newPayment.amount),
        description: newPayment.description || 'Rent Payment',
        periodStart: newPayment.periodFrom,
        periodEnd: newPayment.periodTo
      };
      setPaymentHistory(prev => [...prev, record]);
      setNewPayment({ date: '', amount: '', description: '', periodFrom: '', periodTo: '' });
    }
  };

  const handleRemovePayment = (id: string) => {
    setPaymentHistory(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rentExpected || !formData.rentStartDate || !formData.rentDueDate) return;

    const expected = parseFloat(formData.rentExpected);
    const paid = parseFloat(formData.rentPaid || '0');
    
    const today = new Date();
    const due = new Date(formData.rentDueDate);
    
    let daysLeft = 0;
    if (!isNaN(due.getTime())) {
      const diffTime = due.getTime() - today.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }

    // If lastPaymentDate is missing, default to start date
    const finalPaymentDate = formData.lastPaymentDate || formData.rentStartDate;

    const tenantData = {
      ...initialData, 
      name: formData.name,
      landlord: formData.landlord,
      email: formData.email,
      phoneNumber: formData.phone,
      flatType: formData.houseType, 
      flatNumber: formData.flatNumber,
      block: formData.block,
      tenor: formData.tenor,
      phase: isMabenEstate ? formData.phase : undefined,
      rentExpected: expected,
      rentPaid: paid,
      outstandingBalance: expected - paid,
      rentStartDate: formData.rentStartDate,
      rentDueDate: formData.rentDueDate,
      lastPaymentDate: finalPaymentDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      customFields: customFields,
      paymentHistory: paymentHistory
    };

    onSave(tenantData);
    onClose();
  };

  const inputClasses = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm";
  const labelClasses = "text-xs font-bold text-slate-600 dark:text-slate-400 uppercase ml-1 mb-1 block";

  const houseTypeOptions = TENANT_FLAT_TYPES;
  const isEditing = !!initialData?.id;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              {isEditing ? <Edit2 size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">{isEditing ? 'Edit Tenant Details' : 'Add New Tenant'}</h2>
              <p className="text-brand-100 text-xs">
                {isEditing ? 'Update information & payments' : 'Enter new lease details'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-black/20">
          <form id="tenant-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">Tenant Information</h3>
              
              {/* Name & Landlord fields */}
              <div>
                <label className={labelClasses}>Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Landlord</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="landlord"
                    value={formData.landlord}
                    onChange={handleChange}
                    className={`${inputClasses} appearance-none`}
                  >
                    <option value="">-- Select Landlord --</option>
                    {availableLandlords.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="optional"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="optional"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>House Type</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      name="houseType"
                      value={formData.houseType}
                      onChange={handleChange}
                      className={`${inputClasses} appearance-none`}
                    >
                      {houseTypeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Flat Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="flatNumber"
                      value={formData.flatNumber}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="e.g. 1A"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className={labelClasses}>Block</label>
                    <input
                      type="text"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="1"
                    />
                 </div>
                 <div>
                    <label className={labelClasses}>Tenor</label>
                    <input
                      type="text"
                      name="tenor"
                      value={formData.tenor}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="1 Year"
                    />
                 </div>
              </div>

              {isMabenEstate && (
                <div>
                  <label className={labelClasses}>Phase</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      name="phase"
                      value={formData.phase}
                      onChange={handleChange}
                      className={`${inputClasses} appearance-none`}
                    >
                      <option value="Phase 1">Phase 1</option>
                      <option value="Phase 2">Phase 2</option>
                      <option value="Phase 3">Phase 3</option>
                      <option value="Phase 4">Phase 4</option>
                      <option value="Phase 5">Phase 5</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Financials Section */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">Financials & Dates</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Rent Expected</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                    <input
                      type="number"
                      name="rentExpected"
                      value={formData.rentExpected}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Rent Paid (Total)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
                    <input
                      type="number"
                      name="rentPaid"
                      value={formData.rentPaid}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="0.00"
                      readOnly={paymentHistory.length > 0} 
                    />
                  </div>
                </div>
              </div>

              {/* Payment Date Field (New) */}
              <div>
                <label className={labelClasses}>Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    name="lastPaymentDate"
                    value={formData.lastPaymentDate}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Select date"
                  />
                </div>
                {!formData.lastPaymentDate && (
                   <p className="text-[10px] text-slate-400 ml-1 mt-1">Defaults to start date if left blank.</p>
                )}
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      name="rentStartDate"
                      value={formData.rentStartDate}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      name="rentDueDate"
                      value={formData.rentDueDate}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment History Sub-section */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Add Payment Record</label>
                
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl space-y-3">
                   <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-400 font-bold">Payment Date</label>
                        <input 
                          type="date" 
                          value={newPayment.date}
                          onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                          className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-400 font-bold">Amount</label>
                        <input 
                          type="number" 
                          value={newPayment.amount}
                          onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                          className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          placeholder="Amount"
                        />
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-400 font-bold">Period From</label>
                        <input 
                          type="date" 
                          value={newPayment.periodFrom}
                          onChange={e => setNewPayment({...newPayment, periodFrom: e.target.value})}
                          className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-400 font-bold">Period To</label>
                        <input 
                          type="date" 
                          value={newPayment.periodTo}
                          onChange={e => setNewPayment({...newPayment, periodTo: e.target.value})}
                          className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        />
                      </div>
                   </div>

                   <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={newPayment.description}
                         onChange={e => setNewPayment({...newPayment, description: e.target.value})}
                         className="flex-1 p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                         placeholder="Description (e.g. Bank Transfer, Cash)"
                       />
                       <button 
                         type="button" 
                         onClick={handleAddPayment}
                         className="bg-green-500 text-white px-4 rounded font-bold text-sm hover:bg-green-600"
                       >
                         Add
                       </button>
                   </div>
                </div>

                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                   {paymentHistory.map((record) => (
                     <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 text-xs relative group">
                        <div className="flex justify-between mb-1">
                           <span className="font-bold text-slate-700 dark:text-white">₦{record.amount.toLocaleString()}</span>
                           <span className="text-slate-500">{record.date}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{record.description}</p>
                        {(record.periodStart || record.periodEnd) && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Covers: {record.periodStart} to {record.periodEnd}
                          </p>
                        )}
                        <button 
                          type="button" 
                          onClick={() => handleRemovePayment(record.id)} 
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14}/>
                        </button>
                     </div>
                   ))}
                </div>
              </div>
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
            form="tenant-form"
            className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all transform active:scale-95"
          >
            {isEditing ? 'Update Tenant' : 'Save Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};
