import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Building, LogOut, Menu, Bell, User, X, ArrowRight, Sun, Moon, ChevronDown, ChevronRight, Plus, Archive as ArchiveIcon, Search, UserCheck, Edit3, AlertCircle, CheckCircle, Lock, Layers, Save, Cloud, Wifi } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './services/firebase';
import { fetchEstates, calculateMetrics, LANDLORDS, PROPERTY_CATEGORIES } from './services/dataService';
import { Estate, Tenant, DashboardMetrics, UserProfile, ArchivedItem, UserRole, NotificationItem, AccessScope } from './types';
import { Metrics } from './components/Metrics';
import { Charts } from './components/Charts';
import { OverdueAlerts } from './components/OverdueAlerts';
import { EstateDetail } from './components/EstateDetail';
import { TenantModal } from './components/TenantModal';
import { Login } from './components/Login';
import { Chatbot } from './components/Chatbot';
import { Profile } from './components/Profile';
import { Archive } from './components/Archive';
import { AppActions } from './services/geminiService';
import { AddTenantModal } from './components/AddTenantModal';
import { AddEstateModal } from './components/AddEstateModal';
import { LandlordDetail } from './components/LandlordDetail';
import { PropertyTypeDetail } from './components/PropertyTypeDetail'; 
import { AlertsModal } from './components/AlertsModal';
import { AddLandlordModal } from './components/AddLandlordModal';
import { checkAndSendAutomatedReport } from './services/emailService';

const INITIAL_USERS: UserProfile[] = [
  {
      name: "Super Administrator",
      username: "superadmin",
      email: "superadmin@gabinas.com",
      phone: "",
      role: 'SUPER_ADMIN',
      isVerified: true,
      password: "", // Managed by Firebase Auth
      notificationSettings: {
        rentDueAlerts: true,
        outstandingPaymentAlerts: true,
        daysThreshold: 30,
        emailNotifications: true,
        inAppNotifications: true
      },
      accessScope: { type: 'GLOBAL' }
  },
  {
      name: "Mr. Muyiwa Abiodun",
      username: "boriswole@gmail.com",
      email: "boriswole@gmail.com",
      phone: "",
      role: 'VIEW_ONLY',
      isVerified: true,
      password: "", // Managed by Firebase Auth
      notificationSettings: {
        rentDueAlerts: true,
        outstandingPaymentAlerts: true,
        daysThreshold: 30,
        emailNotifications: false,
        inAppNotifications: true
      },
      accessScope: {
        type: 'RESTRICTED',
        allowedLandlords: ["Mr. Muyiwa Abiodun"]
      }
  }
];

const App = () => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Data State (Firebase Synced)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [landlords, setLandlords] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // View State
  const [selectedEstateId, setSelectedEstateId] = useState<string | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROFILE' | 'ARCHIVE'>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); 
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false); 

  // Sidebar State
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isEstatesExpanded, setIsEstatesExpanded] = useState(true);
  const [isLandlordsExpanded, setIsLandlordsExpanded] = useState(false);
  const [isTypesExpanded, setIsTypesExpanded] = useState(false);

  // Modal States
  const [isAddEstateModalOpen, setIsAddEstateModalOpen] = useState(false);
  const [isAddLandlordModalOpen, setIsAddLandlordModalOpen] = useState(false);
  const [aiDraftData, setAiDraftData] = useState<any>(null);
  const [isAiAddModalOpen, setIsAiAddModalOpen] = useState(false);

  // --- Firebase Synchronization ---

  // Helper to remove circular references and sanitize data
  const sanitizeData = (data: any) => {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return; // Discard circular reference
        }
        seen.add(value);
      }
      // Filter out React synthetic events or DOM nodes if they accidentally slipped in
      if (value && (value._reactName || value.nativeEvent || value instanceof Node || value instanceof Window)) {
          return;
      }
      return value;
    }));
  };

  // Helper to save data to a Firestore document in the 'app_data' collection
  const saveDataToFirebase = async (docName: string, data: any) => {
    try {
      setSaveStatus('saving');
      const cleanData = sanitizeData(data);
      // Wrapping array data in an object key 'data' because Firestore documents must be objects
      await setDoc(doc(db, 'app_data', docName), { data: cleanData });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error) {
      console.error("Firebase save error:", error);
      setSaveStatus('idle');
      // Do not alert on minor sync glitches to avoid interrupting user flow too often
    }
  };

  // Data Listeners (Firestore)
  useEffect(() => {
    setLoading(true);
    
    const unsubEstates = onSnapshot(doc(db, 'app_data', 'estates'), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        setEstates(docSnapshot.data().data || []);
      } else {
        // Seed initial data
        const seedData = await fetchEstates();
        setEstates(seedData);
        saveDataToFirebase('estates', seedData);
      }
      setLoading(false);
    });

    const unsubLandlords = onSnapshot(doc(db, 'app_data', 'landlords'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setLandlords(docSnapshot.data().data || []);
      } else {
        setLandlords(LANDLORDS);
        saveDataToFirebase('landlords', LANDLORDS);
      }
    });

    const unsubTypes = onSnapshot(doc(db, 'app_data', 'propertyTypes'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setPropertyTypes(docSnapshot.data().data || []);
      } else {
        setPropertyTypes(PROPERTY_CATEGORIES);
        saveDataToFirebase('propertyTypes', PROPERTY_CATEGORIES);
      }
    });

    const unsubArchive = onSnapshot(doc(db, 'app_data', 'archivedItems'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setArchivedItems(docSnapshot.data().data || []);
      } else {
        setArchivedItems([]);
      }
    });

    const unsubUsers = onSnapshot(doc(db, 'app_data', 'registeredUsers'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setRegisteredUsers(docSnapshot.data().data || []);
      } else {
        setRegisteredUsers(INITIAL_USERS);
        saveDataToFirebase('registeredUsers', INITIAL_USERS);
      }
    });

    return () => {
      unsubEstates();
      unsubLandlords();
      unsubTypes();
      unsubArchive();
      unsubUsers();
    };
  }, []);

  // Auth Listener (Firebase Auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in. Match with registeredUsers for role/profile
        // Note: This depends on registeredUsers being loaded.
        const profile = registeredUsers.find(u => u.email === firebaseUser.email);
        
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          // Fallback if user exists in Auth but not in app DB (e.g. newly created super admin or mismatch)
          setUser({
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
            username: firebaseUser.email || "",
            email: firebaseUser.email || "",
            phone: "",
            role: 'VIEW_ONLY', // Default safety role
            isVerified: true,
            notificationSettings: {
              rentDueAlerts: false,
              outstandingPaymentAlerts: false,
              daysThreshold: 7,
              emailNotifications: false,
              inAppNotifications: true
            },
            accessScope: { type: 'GLOBAL' }
          });
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [registeredUsers]);


  // --- Effects ---

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Calculate metrics whenever estates data changes (from Firebase or local update)
    if (estates.length > 0) {
      const filteredData = filterDataByPermissions(estates, user?.accessScope);
      setMetrics(calculateMetrics(filteredData));
      
      // Trigger reporting check once if enabled (simple implementation)
      if (user?.reportingSettings?.enabled && !loading) {
          const emailResult = checkAndSendAutomatedReport(filteredData, user.reportingSettings);
          if (emailResult && adminNotifications.length === 0) {
            setAdminNotifications(prev => [
                { type: 'UPCOMING', name: "System", details: "Monthly Report Sent Successfully", actionRequired: false },
                ...prev
            ]);
          }
      }
    }
  }, [estates, user, loading]);

  // Manual Force Save (Now pushes everything to Firebase)
  const handleManualSave = () => {
    saveDataToFirebase('estates', estates);
    saveDataToFirebase('landlords', landlords);
    saveDataToFirebase('propertyTypes', propertyTypes);
    saveDataToFirebase('archivedItems', archivedItems);
    saveDataToFirebase('registeredUsers', registeredUsers);
  };

  // Handle Restore from Backup file
  const handleRestoreSystem = (data: any) => {
      if (data.estates) {
        setEstates(data.estates);
        saveDataToFirebase('estates', data.estates);
      }
      if (data.landlords) {
        setLandlords(data.landlords);
        saveDataToFirebase('landlords', data.landlords);
      }
      if (data.propertyTypes) {
        setPropertyTypes(data.propertyTypes);
        saveDataToFirebase('propertyTypes', data.propertyTypes);
      }
      if (data.archivedItems) {
        setArchivedItems(data.archivedItems);
        saveDataToFirebase('archivedItems', data.archivedItems);
      }
      if (data.registeredUsers) {
          setRegisteredUsers(data.registeredUsers);
          saveDataToFirebase('registeredUsers', data.registeredUsers);
      }
      
      alert("System restored successfully and synced to cloud.");
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  const filterDataByPermissions = (allEstates: Estate[], scope?: AccessScope): Estate[] => {
    if (!scope || scope.type === 'GLOBAL') return allEstates;

    return allEstates.map(estate => {
      const isEstateAllowed = scope.allowedEstates?.includes(estate.id);

      const visibleTenants = estate.tenants.filter(t => {
         if (isEstateAllowed) return true; 
         if (t.phase && scope.allowedPhases?.includes(`${estate.id}:${t.phase}`)) return true;
         if (scope.allowedLandlords?.includes(t.landlord)) return true;
         if (scope.allowedLandlordEstates?.includes(`${t.landlord}|${estate.id}`)) return true;
         return false;
      });

      const hasPhaseAccess = estate.phases?.some(p => scope.allowedPhases?.includes(`${estate.id}:${p}`));

      if (visibleTenants.length === 0 && !isEstateAllowed && !hasPhaseAccess) {
         return null;
      }

      const expected = visibleTenants.reduce((s, t) => s + t.rentExpected, 0);
      const actual = visibleTenants.reduce((s, t) => s + t.rentPaid, 0);
      const outstanding = expected - actual;

      return { 
        ...estate, 
        tenants: visibleTenants,
        totalExpected: expected,
        totalActual: actual,
        totalOutstanding: outstanding 
      };
    }).filter((e): e is Estate => e !== null);
  };

  const filteredEstates = estates.filter(e => e.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
  
  const accessibleLandlords = useMemo(() => {
     if (user?.accessScope?.allowedLandlords && user.accessScope.allowedLandlords.length > 0) {
        return landlords.filter(l => user.accessScope!.allowedLandlords!.includes(l));
     }
     return landlords;
  }, [landlords, user]);

  const filteredLandlords = accessibleLandlords.filter(l => l.toLowerCase().includes(sidebarSearch.toLowerCase())).sort();
  const filteredTypes = propertyTypes.filter(t => t.toLowerCase().includes(sidebarSearch.toLowerCase()));

  const notifications = useMemo(() => {
     const overdue = estates.flatMap(e => e.tenants.filter(t => t.daysLeft < 0).map(t => ({
       type: 'OVERDUE' as const, 
       name: t.name,
       details: e.name,
       daysLeft: t.daysLeft,
       outstandingBalance: t.outstandingBalance,
       rentStartDate: t.rentStartDate
      })));
     
     const upcoming = estates.flatMap(e => e.tenants.filter(t => t.daysLeft >= 0 && t.daysLeft <= 90).map(t => ({
       type: 'UPCOMING' as const, 
       name: t.name,
       details: e.name,
       daysLeft: t.daysLeft,
       outstandingBalance: t.outstandingBalance,
       rentStartDate: t.rentStartDate
      })));
     
     const systemNotifications = [...overdue.sort((a,b) => a.daysLeft! - b.daysLeft!), ...upcoming.sort((a,b) => a.daysLeft! - b.daysLeft!)];
     return [...adminNotifications, ...systemNotifications];
  }, [estates, adminNotifications]);

  const handleLogin = () => {
     // Triggered by Login component on success if needed, though onAuthStateChanged handles state
     setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUser(null);
    setSelectedEstateId(null);
    setActiveView('DASHBOARD');
    setIsEditMode(false);
  };

  const handleCreateUser = (newUser: UserProfile) => {
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    saveDataToFirebase('registeredUsers', updatedUsers);
    // Note: Creating a user here only adds them to the app DB permissions.
    // You would still need to create the account in Firebase Auth Console or use the Admin SDK.
    alert("User profile added to database. Please ensure a corresponding account exists in Firebase Authentication.");
  };

  const navigateTo = (view: 'DASHBOARD' | 'PROFILE' | 'ARCHIVE') => {
    setActiveView(view);
    setSelectedEstateId(null);
    setSelectedLandlord(null);
    setSelectedPropertyType(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewEstate = (id: string) => {
    setSelectedEstateId(id);
    setSelectedLandlord(null);
    setSelectedPropertyType(null);
    setActiveView('DASHBOARD');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewLandlord = (name: string) => {
    setSelectedLandlord(name);
    setSelectedEstateId(null);
    setSelectedPropertyType(null);
    setActiveView('DASHBOARD');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPropertyType = (type: string) => {
    setSelectedPropertyType(type);
    setSelectedEstateId(null);
    setSelectedLandlord(null);
    setActiveView('DASHBOARD');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddEstate = (newEstateData: any) => {
    const newEstate: Estate = { ...newEstateData, id: `est-${Date.now()}` };
    const updatedEstates = [...estates, newEstate];
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
    setIsAddEstateModalOpen(false);
  };

  const handleAddLandlord = (name: string) => {
    const updatedLandlords = [...landlords, name];
    setLandlords(updatedLandlords);
    saveDataToFirebase('landlords', updatedLandlords);
    setIsAddLandlordModalOpen(false);
  };

  const handleAddPropertyType = () => {
    const name = prompt("Enter new Property Type Name (e.g. Duplex):");
    if (name) {
      const updatedTypes = [...propertyTypes, name];
      setPropertyTypes(updatedTypes);
      saveDataToFirebase('propertyTypes', updatedTypes);
    }
  };

  const handleUpdateEstate = (estateId: string, data: Partial<Estate>) => {
    const updatedEstates = estates.map(e => e.id === estateId ? { ...e, ...data } : e);
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
  };

  const handleAddPhase = (estateId: string, phaseName: string) => {
    const updatedEstates = estates.map(e => {
      if (e.id === estateId) {
        return { ...e, phases: [...(e.phases || []), phaseName] };
      }
      return e;
    });
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
  };

  const handleRenamePhase = (estateId: string, oldName: string, newName: string) => {
    const updatedEstates = estates.map(e => {
      if (e.id === estateId) {
        const updatedPhases = e.phases?.map(p => p === oldName ? newName : p) || [];
        const updatedTenants = e.tenants.map(t => 
          t.phase === oldName ? { ...t, phase: newName } : t
        );
        return { ...e, phases: updatedPhases, tenants: updatedTenants };
      }
      return e;
    });
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
  };

  const handleDeletePhase = (estateId: string, phaseName: string) => {
    const estate = estates.find(e => e.id === estateId);
    if (!estate) return;

    const tenantsToArchive = estate.tenants.filter(t => t.phase === phaseName);

    const archivedPhase: ArchivedItem = {
      id: `arch-phase-${Date.now()}`,
      originalId: phaseName, 
      type: 'PHASE',
      name: phaseName,
      deletedAt: new Date().toISOString(),
      data: { phaseName: phaseName, tenants: tenantsToArchive },
      parentEstateId: estate.id,
      parentEstateName: estate.name
    };
    const updatedArchive = [archivedPhase, ...archivedItems];
    setArchivedItems(updatedArchive);
    saveDataToFirebase('archivedItems', updatedArchive);

    const updatedEstates = estates.map(e => {
      if (e.id === estateId) {
        const updatedPhases = e.phases?.filter(p => p !== phaseName) || [];
        const updatedTenants = e.tenants.filter(t => t.phase !== phaseName);
        const expected = updatedTenants.reduce((s,t) => s + t.rentExpected, 0);
        const actual = updatedTenants.reduce((s,t) => s + t.rentPaid, 0);
        
        return { 
           ...e, 
           phases: updatedPhases, 
           tenants: updatedTenants,
           totalExpected: expected,
           totalActual: actual,
           totalOutstanding: expected - actual
        };
      }
      return e;
    });
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
  };

  const handleUpdateLandlord = (oldName: string, newName: string) => {
    const updatedEstates = estates.map(e => ({
      ...e,
      tenants: e.tenants.map(t => t.landlord === oldName ? { ...t, landlord: newName } : t)
    }));
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);

    const updatedLandlords = landlords.map(l => l === oldName ? newName : l);
    setLandlords(updatedLandlords);
    saveDataToFirebase('landlords', updatedLandlords);

    if (selectedLandlord === oldName) setSelectedLandlord(newName);
  };

  const handleArchiveEstate = (estateId: string) => {
    const estateToArchive = estates.find(e => e.id === estateId);
    if (estateToArchive) {
        const archivedItem: ArchivedItem = {
            id: `arch-${Date.now()}`,
            originalId: estateToArchive.id,
            type: 'ESTATE',
            name: estateToArchive.name,
            deletedAt: new Date().toISOString(),
            data: estateToArchive
        };
        const updatedArchive = [archivedItem, ...archivedItems];
        setArchivedItems(updatedArchive);
        saveDataToFirebase('archivedItems', updatedArchive);
    }
    const updatedEstates = estates.filter(e => e.id !== estateId);
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
    setSelectedEstateId(null);
  };

  const handleArchiveTenant = (tenantId: string) => {
    const estate = estates.find(e => e.tenants.some(t => t.id === tenantId));
    if (estate) {
       const tenantToArchive = estate.tenants.find(t => t.id === tenantId);
       if (tenantToArchive) {
           const archivedItem: ArchivedItem = {
               id: `arch-${Date.now()}`,
               originalId: tenantToArchive.id,
               type: 'TENANT',
               name: tenantToArchive.name,
               deletedAt: new Date().toISOString(),
               data: tenantToArchive,
               parentEstateId: estate.id,
               parentEstateName: estate.name
           };
           const updatedArchive = [archivedItem, ...archivedItems];
           setArchivedItems(updatedArchive);
           saveDataToFirebase('archivedItems', updatedArchive);
       }

       const updatedEstates = estates.map(e => {
         if (e.id === estate.id) {
            const updatedTenants = e.tenants.filter(t => t.id !== tenantId);
            const expected = updatedTenants.reduce((s,t) => s + t.rentExpected, 0);
            const actual = updatedTenants.reduce((s,t) => s + t.rentPaid, 0);
            return { ...e, tenants: updatedTenants, totalExpected: expected, totalActual: actual, totalOutstanding: expected - actual };
         }
         return e;
       });
       setEstates(updatedEstates);
       saveDataToFirebase('estates', updatedEstates);
    }
  };
  
  const handleRestoreItem = (item: ArchivedItem) => {
      if (item.type === 'ESTATE') {
          const estate = item.data as Estate;
          if (!estates.find(e => e.id === estate.id)) {
              const updated = [...estates, estate];
              setEstates(updated);
              saveDataToFirebase('estates', updated);
          } else {
              const updated = [...estates, { ...estate, id: `${estate.id}-restored-${Date.now()}` }];
              setEstates(updated);
              saveDataToFirebase('estates', updated);
          }
      } else if (item.type === 'TENANT') {
          const tenant = item.data as Tenant;
          const parentEstate = estates.find(e => e.id === item.parentEstateId);
          if (parentEstate) {
               const updatedEstates = estates.map(e => {
                   if (e.id === parentEstate.id) {
                       return { ...e, tenants: [...e.tenants, tenant] };
                   }
                   return e;
               });
               setEstates(updatedEstates);
               saveDataToFirebase('estates', updatedEstates);
          } else {
              alert("Parent estate not found. Please restore the estate first if it was deleted.");
              return;
          }
      } else if (item.type === 'PHASE') {
          const { phaseName, tenants } = item.data;
          const parentEstate = estates.find(e => e.id === item.parentEstateId);
          
          if (parentEstate) {
              const updatedEstates = estates.map(e => {
                  if (e.id === parentEstate.id) {
                      const phases = e.phases?.includes(phaseName) ? e.phases : [...(e.phases || []), phaseName];
                      const currentTenantIds = new Set(e.tenants.map(t => t.id));
                      const tenantsToRestore = (tenants as Tenant[]).filter(t => !currentTenantIds.has(t.id));
                      
                      return { 
                        ...e, 
                        phases: phases, 
                        tenants: [...e.tenants, ...tenantsToRestore] 
                      };
                  }
                  return e;
              });
              setEstates(updatedEstates);
              saveDataToFirebase('estates', updatedEstates);
          } else {
               alert("Parent estate not found. Cannot restore phase.");
               return;
          }
      } else if (item.type === 'LANDLORD') {
         if (!landlords.includes(item.name)) {
             const updated = [...landlords, item.name];
             setLandlords(updated);
             saveDataToFirebase('landlords', updated);
         }
      }
      const remainingArchive = archivedItems.filter(i => i.id !== item.id);
      setArchivedItems(remainingArchive);
      saveDataToFirebase('archivedItems', remainingArchive);
  };

  const handlePermanentDelete = (id: string) => {
      const remainingArchive = archivedItems.filter(i => i.id !== id);
      setArchivedItems(remainingArchive);
      saveDataToFirebase('archivedItems', remainingArchive);
  };

  const handleDeleteLandlord = (name: string) => {
      const tenantsAffected = estates.flatMap(e => e.tenants.filter(t => t.landlord === name));
      if (tenantsAffected.length > 0) {
          alert(`Cannot delete landlord. There are ${tenantsAffected.length} tenants assigned to this landlord.`);
          return;
      }

      const archivedItem: ArchivedItem = {
          id: `arch-ll-${Date.now()}`,
          originalId: name,
          type: 'LANDLORD',
          name: name,
          deletedAt: new Date().toISOString(),
          data: {}
      };
      
      const updatedArchive = [archivedItem, ...archivedItems];
      setArchivedItems(updatedArchive);
      saveDataToFirebase('archivedItems', updatedArchive);

      const updatedLandlords = landlords.filter(l => l !== name);
      setLandlords(updatedLandlords);
      saveDataToFirebase('landlords', updatedLandlords);
      
      if (selectedLandlord === name) {
          setSelectedLandlord(null);
          setActiveView('DASHBOARD');
      }
  };

  const handleAddTenant = (newTenantData: any) => {
    const targetEstateId = selectedEstateId || estates[0]?.id; 
    if (!targetEstateId) return;

    const updatedEstates = estates.map(e => {
      if (e.id === targetEstateId) {
        const newTenant: Tenant = { ...newTenantData, id: `${e.id}-t-${Date.now()}`, serialNumber: e.tenants.length + 1 };
        const updatedTenants = [...e.tenants, newTenant];
        return { ...e, tenants: updatedTenants };
      }
      return e;
    });
    setEstates(updatedEstates);
    saveDataToFirebase('estates', updatedEstates);
  };
  
  const handleUpdateTenant = (data: any) => {
      const targetEstateId = selectedEstateId || estates.find(e => e.tenants.some(t => t.id === data.id))?.id;
      if (!targetEstateId) return;

      const updatedEstates = estates.map(e => {
        if (e.id === targetEstateId) {
            const updatedTenants = e.tenants.map(t => t.id === data.id ? { ...t, ...data } : t);
            return { ...e, tenants: updatedTenants };
        }
        return e;
      });
      setEstates(updatedEstates);
      saveDataToFirebase('estates', updatedEstates);
      
      if (selectedTenant && selectedTenant.id === data.id) {
        setSelectedTenant({ ...selectedTenant, ...data });
      }
  };

  const appActions: AppActions = useMemo(() => ({
    navigate: (dest: string) => console.log(dest),
    generateReport: (target) => console.log(target),
    openAddTenant: (data) => {
       setAiDraftData(data);
       setIsAiAddModalOpen(true);
    }
  }), [estates]);

  if (authLoading) {
     return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
     );
  }

  if (!isAuthenticated) {
    return <Login registeredUsers={registeredUsers} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Syncing with Cloud Firestore...</p>
      </div>
    );
  }

  const currentEstate = selectedEstateId ? estates.find(e => e.id === selectedEstateId) : null;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const canToggleEdit = isSuperAdmin || isAdmin;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-brand-900 text-white border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col shadow-xl lg:shadow-none`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-brand-500 p-2 rounded-lg shadow-lg shadow-brand-500/30">
               <Building className="text-white" size={20} />
             </div>
             <div>
               <h1 className="font-display font-bold text-white text-lg leading-none">Gabinas</h1>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties</span>
             </div>
           </div>
           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 custom-scrollbar">
          
          <div className="space-y-1">
            <button 
              onClick={() => navigateTo('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'DASHBOARD' && !selectedEstateId && !selectedLandlord && !selectedPropertyType ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => navigateTo('PROFILE')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'PROFILE' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <User size={18} /> My Profile
            </button>
            <button 
              onClick={() => navigateTo('ARCHIVE')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'ARCHIVE' ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <ArchiveIcon size={18} /> Archive
            </button>
          </div>

          <hr className="border-slate-800/50" />

          <div>
            <div 
              onClick={() => setIsEstatesExpanded(!isEstatesExpanded)}
              className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 cursor-pointer hover:text-slate-300 transition-colors"
            >
              <span>Estate Portfolio</span>
              {isEstatesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            
            {isEstatesExpanded && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                {filteredEstates.map(estate => (
                  <button
                    key={estate.id}
                    onClick={() => handleViewEstate(estate.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${selectedEstateId === estate.id ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="truncate">{estate.name}</span>
                  </button>
                ))}
                {isSuperAdmin && isEditMode && (
                  <button 
                    onClick={() => setIsAddEstateModalOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-400 hover:bg-white/5 rounded-xl transition-colors mt-2 border border-dashed border-slate-700 hover:border-brand-400"
                  >
                    <Plus size={16} /> Add New Estate
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <div 
              onClick={() => setIsLandlordsExpanded(!isLandlordsExpanded)}
              className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 cursor-pointer hover:text-slate-300 transition-colors"
            >
              <span>Landlords</span>
              {isLandlordsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            
            {isLandlordsExpanded && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                {filteredLandlords.length > 0 ? filteredLandlords.map(landlord => (
                  <button
                    key={landlord}
                    onClick={() => handleViewLandlord(landlord)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedLandlord === landlord ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <UserCheck size={14} />
                    <span className="truncate">{landlord}</span>
                  </button>
                )) : (
                  <p className="px-4 text-xs text-slate-500 italic">No landlords found.</p>
                )}
                {isSuperAdmin && isEditMode && (
                  <button 
                    onClick={() => setIsAddLandlordModalOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-400 hover:bg-white/5 rounded-xl transition-colors mt-2 border border-dashed border-slate-700 hover:border-brand-400"
                  >
                    <Plus size={16} /> Add Landlord
                  </button>
                )}
              </div>
            )}
          </div>

           <div>
            <div 
              onClick={() => setIsTypesExpanded(!isTypesExpanded)}
              className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 cursor-pointer hover:text-slate-300 transition-colors"
            >
              <span>Property Types</span>
              {isTypesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            
            {isTypesExpanded && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                {filteredTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleViewPropertyType(type)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedPropertyType === type ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Layers size={14} />
                    <span className="truncate">{type}</span>
                  </button>
                ))}
                {isSuperAdmin && isEditMode && (
                  <button 
                    onClick={handleAddPropertyType}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-400 hover:bg-white/5 rounded-xl transition-colors mt-2 border border-dashed border-slate-700 hover:border-brand-400"
                  >
                    <Plus size={16} /> Add Type
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 space-y-4 bg-black/20">
           {/* Connection Status Indicator */}
           <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-400">
             <Cloud size={14} />
             Cloud Connected
           </div>

           {canToggleEdit && (
             <div className="space-y-3">
               <div className="flex items-center justify-between px-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                   <Edit3 size={16} className={isEditMode ? "text-green-400" : "text-slate-500"} /> Admin Edit
                 </div>
                 <button 
                   onClick={toggleEditMode}
                   className={`w-10 h-5 rounded-full relative transition-colors ${isEditMode ? 'bg-brand-50' : 'bg-slate-600'}`}
                 >
                   <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isEditMode ? 'left-6' : 'left-1'}`}></div>
                 </button>
               </div>
               
               <button 
                 onClick={handleManualSave}
                 disabled={saveStatus !== 'idle'}
                 className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                   saveStatus === 'saved' ? 'bg-green-600 text-white' : 
                   saveStatus === 'saving' ? 'bg-slate-700 text-slate-300' :
                   'bg-white/10 text-white hover:bg-white/20'
                 }`}
               >
                 {saveStatus === 'saving' ? 'Syncing...' : 
                  saveStatus === 'saved' ? <><CheckCircle size={14}/> Synced</> : 
                  <><Cloud size={14}/> Force Cloud Sync</>}
               </button>
             </div>
           )}

           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-800 text-brand-200 border border-brand-700 flex items-center justify-center font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate w-24">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{user?.role.replace('_', ' ')}</p>
                </div>
             </div>
             <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
               <LogOut size={18} />
             </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">
              {activeView === 'DASHBOARD' ? (
                  selectedEstateId ? 'Estate Details' : 
                  selectedLandlord ? 'Landlord Profile' : 
                  selectedPropertyType ? 'Property Type View' :
                  'Dashboard Overview'
              ) : 
               activeView === 'PROFILE' ? 'User Profile' : 'Archive'}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-2 text-slate-400 hover:text-brand-500 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-slate-400 hover:text-brand-500 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                   <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2">
                   <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700"><h3 className="font-bold text-slate-800 dark:text-white">Notifications ({notifications.length})</h3></div>
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? notifications.map((n,i) => (
                        <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm text-slate-800 dark:text-white truncate w-3/4">{n.name}</p>
                            {n.daysLeft !== undefined && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${n.daysLeft < 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                {Math.abs(n.daysLeft)}d {n.daysLeft < 0 ? 'over' : 'left'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{n.details}</p>
                          
                          {(n.outstandingBalance !== undefined || n.rentStartDate) && (
                            <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                               {n.rentStartDate ? (
                                  <span className="text-slate-500 dark:text-slate-400">Start: {n.rentStartDate}</span>
                               ) : <span></span>}
                               
                               {n.outstandingBalance !== undefined && n.outstandingBalance > 0 && (
                                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                     ₦{n.outstandingBalance.toLocaleString()}
                                  </span>
                               )}
                            </div>
                          )}
                        </div>
                      )) : (
                        <p className="p-8 text-center text-xs text-slate-500">No new alerts.</p>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-900 relative"
          onClick={() => setIsNotificationOpen(false)}
        >
          {activeView === 'DASHBOARD' && !selectedEstateId && !selectedLandlord && !selectedPropertyType && (
             <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    Welcome back, {user?.name.split(' ')[0]}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Here's a clear overview of your property portfolio today.
                  </p>
                </div>

                {metrics && <Metrics metrics={metrics} />}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                   <div className="lg:col-span-2">
                      <Charts estates={estates} />
                   </div>
                   <div className="h-full">
                      <OverdueAlerts estates={estates} onViewEstate={handleViewEstate} onViewAll={() => setIsAlertModalOpen(true)} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {estates.map(estate => (
                    <div 
                      key={estate.id}
                      onClick={() => handleViewEstate(estate.id)}
                      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer relative"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"/>
                        <img src={estate.imageUrl} alt={estate.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
                          {estate.occupancyRate}% Occupancy
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-1 group-hover:text-brand-600 transition-colors">{estate.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                           <User size={14} /> {estate.manager}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                           <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">Tenants</p>
                             <p className="font-bold text-slate-800 dark:text-slate-200">{estate.tenants.length}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase font-bold">Outstanding</p>
                             <p className={`font-bold ${estate.totalOutstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                               {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(estate.totalOutstanding)}
                             </p>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeView === 'DASHBOARD' && selectedEstateId && currentEstate && (
            <div className="max-w-7xl mx-auto">
               <EstateDetail 
                 estate={currentEstate}
                 estatesList={estates}
                 user={user}
                 isEditMode={canToggleEdit && isEditMode} 
                 onBack={() => setSelectedEstateId(null)}
                 onSelectTenant={setSelectedTenant}
                 onAddTenant={handleAddTenant}
                 onUpdateTenant={handleUpdateTenant}
                 onDeleteTenant={handleArchiveTenant}
                 onDeleteEstate={handleArchiveEstate}
                 onUpdateEstate={handleUpdateEstate}
                 onDeletePhase={handleDeletePhase}
                 onAddPhase={handleAddPhase}
                 onRenamePhase={handleRenamePhase} 
                 onRequestAccess={() => alert("Feature disabled for demo")}
                 availableLandlords={landlords}
               />
            </div>
          )}

          {activeView === 'DASHBOARD' && selectedLandlord && (
             <div className="max-w-7xl mx-auto">
                <LandlordDetail 
                  landlordName={selectedLandlord}
                  estates={estates}
                  isEditMode={canToggleEdit && isEditMode}
                  onBack={() => setSelectedLandlord(null)}
                  onSelectTenant={setSelectedTenant}
                  onUpdateLandlord={handleUpdateLandlord}
                  onDeleteLandlord={handleDeleteLandlord}
                />
             </div>
          )}

          {activeView === 'DASHBOARD' && selectedPropertyType && (
             <div className="max-w-7xl mx-auto">
                <PropertyTypeDetail 
                  propertyType={selectedPropertyType}
                  estates={estates}
                  onBack={() => setSelectedPropertyType(null)}
                  onSelectTenant={setSelectedTenant}
                />
             </div>
          )}

          {activeView === 'PROFILE' && user && (
             <div className="max-w-5xl mx-auto">
                <Profile 
                  user={user} 
                  estates={estates}
                  onUpdateUser={setUser} 
                  onCreateUser={handleCreateUser} 
                  systemData={{
                    landlords,
                    propertyTypes,
                    registeredUsers,
                    archivedItems
                  }}
                  onRestoreSystem={handleRestoreSystem}
                />
             </div>
          )}

          {activeView === 'ARCHIVE' && (
             <div className="max-w-6xl mx-auto">
                <Archive 
                  items={archivedItems} 
                  onRestore={handleRestoreItem}
                  onPermanentDelete={handlePermanentDelete}
                />
             </div>
          )}
        </div>
      </main>

      {selectedTenant && (
        <TenantModal 
          tenant={selectedTenant} 
          onClose={() => setSelectedTenant(null)} 
        />
      )}
      
      {isAddEstateModalOpen && isSuperAdmin && isEditMode && (
        <AddEstateModal 
          onClose={() => setIsAddEstateModalOpen(false)} 
          onSave={handleAddEstate}
        />
      )}

      {isAddLandlordModalOpen && isSuperAdmin && isEditMode && (
        <AddLandlordModal 
          onClose={() => setIsAddLandlordModalOpen(false)} 
          onSave={handleAddLandlord}
        />
      )}
      
      {isAiAddModalOpen && canToggleEdit && isEditMode && (
        <AddTenantModal
          initialData={aiDraftData}
          isMabenEstate={false}
          onClose={() => setIsAiAddModalOpen(false)}
          onSave={handleAddTenant}
          availableLandlords={landlords}
        />
      )}

      {isAlertModalOpen && (
        <AlertsModal
          estates={estates}
          onClose={() => setIsAlertModalOpen(false)}
          onViewEstate={handleViewEstate}
        />
      )}

      <Chatbot estates={estates} actions={appActions} />
    </div>
  );
};

export default App;