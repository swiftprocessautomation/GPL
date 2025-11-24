
import { Estate, Tenant, ReportingSettings } from "../types";

// This simulates the backend email sending logic
export const checkAndSendAutomatedReport = (
  estates: Estate[],
  settings: ReportingSettings
): string | null => {
  if (!settings.enabled || !settings.recipientEmail) return null;

  const today = new Date();
  const dayOfMonth = today.getDate();

  // Check if today is the configured day (e.g., 20th)
  // In a real app, we check if it has *already* run today using a database flag.
  // For this demo, we just check the date.
  if (dayOfMonth !== settings.sendDay) {
    console.log(`Skipping report: Today is ${dayOfMonth}, scheduled for ${settings.sendDay}`);
    return null;
  }

  // Filter Estates based on scope
  let targetEstates = estates;
  if (settings.scope === 'ESTATE' && settings.targetId) {
    targetEstates = estates.filter(e => e.id === settings.targetId);
  }

  // Collect Tenants matching criteria
  const tenants6Months: { t: Tenant, estate: string }[] = [];
  const tenants3Months: { t: Tenant, estate: string }[] = [];

  targetEstates.forEach(estate => {
    // Filter based on landlord if needed
    const estateTenants = settings.scope === 'LANDLORD' && settings.targetId 
      ? estate.tenants.filter(t => t.landlord === settings.targetId)
      : estate.tenants;

    estateTenants.forEach(t => {
      if (t.daysLeft <= 180 && t.daysLeft > 90 && settings.includeExpiring6Months) {
        tenants6Months.push({ t, estate: estate.name });
      }
      if (t.daysLeft <= 90 && settings.includeExpiring3Months) {
        tenants3Months.push({ t, estate: estate.name });
      }
    });
  });

  if (tenants6Months.length === 0 && tenants3Months.length === 0) {
    return "No properties matched criteria for today's report.";
  }

  // Generate Text Body (Simulating Email Content)
  let emailBody = `
  FROM: swiftprocessautomation@gmail.com
  TO: ${settings.recipientEmail}
  SUBJECT: Monthly Property Expiry Report - ${today.toDateString()}
  
  Dear Admin,

  Here is your automated monthly report for properties approaching lease expiry.

  ========================================
  URGENT: LEASE EXPIRING IN < 3 MONTHS
  ========================================
  ${tenants3Months.length > 0 ? tenants3Months.map(i => `
  - ${i.t.name}
    Estate: ${i.estate}
    Unit: ${i.t.block} ${i.t.flatNumber} (${i.t.flatType})
    Due Date: ${i.t.rentDueDate} (${i.t.daysLeft} days left)
    Landlord: ${i.t.landlord}
    Outstanding: ₦${i.t.outstandingBalance.toLocaleString()}
  `).join('') : "No tenants in this category."}

  ========================================
  NOTICE: LEASE EXPIRING IN < 6 MONTHS
  ========================================
  ${tenants6Months.length > 0 ? tenants6Months.map(i => `
  - ${i.t.name}
    Estate: ${i.estate}
    Unit: ${i.t.block} ${i.t.flatNumber} (${i.t.flatType})
    Due Date: ${i.t.rentDueDate} (${i.t.daysLeft} days left)
    Landlord: ${i.t.landlord}
  `).join('') : "No tenants in this category."}

  Best Regards,
  Gabinas Properties Automated System
  `;

  return emailBody;
};
