
export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface Tenant {
  id: string;
  serialNumber: number;
  landlord: string;
  name: string;
  email: string;
  phoneNumber: string;
  flatType: string; // This now acts as "House Type" (e.g., 2 Bedroom Basic)
  block: string;
  phase?: string;
  flatNumber?: string; // e.g., 1A, 2H
  tenor?: string; // e.g., "1 Year"
  rentExpected: number;
  rentPaid: number;
  outstandingBalance: number;
  rentStartDate: string;
  rentDueDate: string;
  lastPaymentDate?: string; // New Field
  daysLeft: number;
  status: 'Active' | 'Overdue' | 'Vacant';
  customFields?: Record<string, string>;
  paymentHistory: PaymentRecord[];
}

export interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  isCustom?: boolean;
}

export interface Estate {
  id: string;
  name: string;
  imageUrl: string;
  manager: string;
  tenants: Tenant[];
  totalExpected: number;
  totalActual: number;
  totalOutstanding: number;
  occupancyRate: number;
  phases?: string[];
  columnPreferences?: ColumnSetting[];
}

export interface DashboardMetrics {
  totalProperties: number;
  totalExpectedRent: number;
  totalRentPaid: number;
  totalOutstanding: number;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEW_EDIT' | 'VIEW_ONLY';

export interface AccessScope {
  type: 'GLOBAL' | 'RESTRICTED';
  allowedEstates?: string[]; // Estate IDs
  allowedLandlords?: string[]; // Landlord Names (Global access to all properties of this landlord)
  allowedPhases?: string[]; // Format: "EstateID:PhaseName"
  allowedLandlordEstates?: string[]; // Specific access: Landlord X in Estate Y (Format: "LandlordName|EstateId")
}

export interface ReportingSettings {
  enabled: boolean;
  recipientEmail: string;
  sendDay: number; // e.g. 20
  includeExpiring6Months: boolean;
  includeExpiring3Months: boolean;
  scope: 'ALL' | 'ESTATE' | 'LANDLORD';
  targetId?: string; // Estate ID or Landlord Name if scope is specific
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  notificationSettings: NotificationSettings;
  reportingSettings?: ReportingSettings; // New Field
  password?: string;
  accessScope?: AccessScope;
}

export interface NotificationSettings {
  rentDueAlerts: boolean;
  outstandingPaymentAlerts: boolean;
  daysThreshold: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export type NotificationType = 'OVERDUE' | 'UPCOMING' | 'EDIT_REQUEST';

export interface NotificationItem {
  id?: string;
  type: NotificationType;
  name: string; // User name or Tenant name
  details: string; // Estate name or Request details
  daysLeft?: number;
  actionRequired?: boolean;
  outstandingBalance?: number;
  rentStartDate?: string;
}

export interface ArchivedItem {
  id: string;
  originalId: string;
  type: 'ESTATE' | 'TENANT' | 'PHASE' | 'LANDLORD';
  name: string;
  deletedAt: string;
  data: any;
  parentEstateId?: string;
  parentEstateName?: string;
}
