
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Estate, Tenant, UserRole } from "../types";

const BRAND_GREEN = [0, 158, 77] as [number, number, number];
const ACCESS_KEY = "admin@gabinasproperties";

export const generateEstateReport = (
  estates: Estate[], // Pass all estates to handle context
  type: 'ESTATE' | 'LANDLORD' | 'TIME' | 'TENANT',
  value: string,
  secondaryValue: string = '',
  userRole: UserRole = 'ADMIN',
  tenantData?: Tenant
) => {
  // Security check for View Only users
  if (userRole === 'VIEW_ONLY') {
    const key = prompt("Enter Access Key to generate report:");
    if (key !== ACCESS_KEY) {
      alert("Invalid Access Key. Report generation denied.");
      return;
    }
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val).replace('₦', 'N');

  // --- TENANT INDIVIDUAL REPORT ---
  if (type === 'TENANT' && tenantData) {
    doc.setFillColor(...BRAND_GREEN);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TENANT REPORT", 14, 20);
    doc.setFontSize(12);
    doc.text("Gabinas Properties Limited", 14, 30);
    doc.text(`Date: ${today}`, pageWidth - 14, 30, { align: 'right' });

    // Tenant Details Box
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Tenant Information", 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${tenantData.name}`, 14, 58);
    doc.text(`Email: ${tenantData.email || 'N/A'}`, 14, 64);
    doc.text(`Phone: ${tenantData.phoneNumber || 'N/A'}`, 14, 70);
    doc.text(`Landlord: ${tenantData.landlord || 'N/A'}`, pageWidth / 2, 58);
    doc.text(`Flat Type: ${tenantData.flatType}`, pageWidth / 2, 64);
    doc.text(`Block/Phase: ${tenantData.block}${tenantData.phase ? ` / ${tenantData.phase}` : ''}`, pageWidth / 2, 70);

    // Financials Box
    const finY = 80;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, finY, pageWidth - 28, 25, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("Financial Status", 20, finY + 8);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("EXPECTED RENT", 20, finY + 16);
    doc.text("AMOUNT PAID", 85, finY + 16);
    doc.text("OUTSTANDING", 150, finY + 16);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(formatCurrency(tenantData.rentExpected), 20, finY + 23);
    doc.setTextColor(0, 158, 77);
    doc.text(formatCurrency(tenantData.rentPaid), 85, finY + 23);
    doc.setTextColor(220, 50, 50);
    doc.text(formatCurrency(tenantData.outstandingBalance), 150, finY + 23);

    // Dates
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Lease Start: ${tenantData.rentStartDate}`, 14, finY + 35);
    doc.text(`Lease Due: ${tenantData.rentDueDate}`, 85, finY + 35);
    doc.text(`Days Remaining: ${tenantData.daysLeft}`, 150, finY + 35);

    // Payment History Table
    doc.text("Payment History", 14, finY + 45);
    
    const historyData = tenantData.paymentHistory?.map((pay, i) => [
      i + 1,
      pay.date,
      pay.description,
      formatCurrency(pay.amount)
    ]) || [];

    if (historyData.length > 0) {
      autoTable(doc, {
        startY: finY + 50,
        head: [['#', 'Date', 'Description', 'Amount']],
        body: historyData,
        theme: 'grid',
        headStyles: { fillColor: BRAND_GREEN },
      });
    } else {
       doc.setFont("helvetica", "italic");
       doc.text("No recorded payments found.", 14, finY + 55);
    }

    const fileName = `Tenant_Report_${tenantData.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    return;
  }

  // --- STANDARD REPORTS (ESTATE / LANDLORD / TIME) ---

  let title = "Gabinas Properties Limited";
  let subtitle = "Management Report";
  let reportDetails = "";
  let reportEndDate = today; // Default to today
  let processedTenants: { tenant: Tenant; estateName: string }[] = [];

  if (type === 'ESTATE') {
    const estate = estates.find(e => e.id === value);
    if (!estate) return;
    processedTenants = estate.tenants.map(t => ({ tenant: t, estateName: estate.name }));
    subtitle = `Estate Report: ${estate.name}`;
    reportDetails = `Manager: ${estate.manager}`;
  } else if (type === 'LANDLORD') {
    subtitle = `Landlord Report: ${value}`;
    reportDetails = "Consolidated Property Portfolio";
    estates.forEach(est => {
      est.tenants.filter(t => t.landlord === value).forEach(t => {
        processedTenants.push({ tenant: t, estateName: est.name });
      });
    });
  } else if (type === 'TIME') {
    subtitle = `Time Interval Report`;
    reportDetails = `From: ${value} To: ${secondaryValue}`;
    reportEndDate = new Date(secondaryValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const startDate = new Date(value);
    const endDate = new Date(secondaryValue);

    estates.forEach(est => {
      est.tenants.filter(t => {
        const rentStart = new Date(t.rentStartDate);
        const rentDue = new Date(t.rentDueDate);
        // Logic: Active lease overlapping range OR due date in range
        return (rentStart <= endDate && rentDue >= startDate);
      }).forEach(t => {
        processedTenants.push({ tenant: t, estateName: est.name });
      });
    });
  }

  // Calculate Totals
  const totalExpected = processedTenants.reduce((acc, item) => acc + item.tenant.rentExpected, 0);
  const totalPaid = processedTenants.reduce((acc, item) => acc + item.tenant.rentPaid, 0);
  const totalOutstanding = processedTenants.reduce((acc, item) => acc + item.tenant.outstandingBalance, 0);

  // HEADER
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title.toUpperCase(), 14, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${today}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Report End Date: ${reportEndDate}`, pageWidth - 14, 30, { align: 'right' });

  // INFO BLOCK
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(reportDetails, 14, 50);
  doc.text(`Total Properties: ${processedTenants.length}`, 14, 56);

  // FINANCIAL SUMMARY
  const summaryY = 62;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, summaryY, pageWidth - 28, 25, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("TOTAL EXPECTED", 20, summaryY + 8);
  doc.text("TOTAL RECOVERED", 85, summaryY + 8);
  doc.text("TOTAL OUTSTANDING", 150, summaryY + 8);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text(formatCurrency(totalExpected), 20, summaryY + 18);
  
  doc.setTextColor(0, 158, 77);
  doc.text(formatCurrency(totalPaid), 85, summaryY + 18);

  doc.setTextColor(220, 50, 50);
  doc.text(formatCurrency(totalOutstanding), 150, summaryY + 18);

  // TABLE
  // Sort by Estate then Name
  processedTenants.sort((a, b) => a.estateName.localeCompare(b.estateName) || a.tenant.name.localeCompare(b.tenant.name));

  const tableData = processedTenants.map((item, i) => [
    i + 1,
    type !== 'ESTATE' ? item.estateName : (item.tenant.block + (item.tenant.phase ? ` / ${item.tenant.phase}` : '')),
    item.tenant.name,
    item.tenant.flatType,
    formatCurrency(item.tenant.rentExpected),
    formatCurrency(item.tenant.rentPaid),
    formatCurrency(item.tenant.outstandingBalance),
    item.tenant.status
  ]);

  autoTable(doc, {
    startY: summaryY + 35,
    head: [['#', type !== 'ESTATE' ? 'Estate' : 'Block/Phase', 'Tenant', 'Type', 'Expected', 'Paid', 'Owed', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: BRAND_GREEN, textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10 },
      4: { halign: 'right' },
      5: { halign: 'right', textColor: [0, 158, 77] },
      6: { halign: 'right', textColor: [220, 50, 50] },
      7: { fontStyle: 'bold' }
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
            const status = data.cell.raw as string;
            if (status === 'Overdue') data.cell.styles.textColor = [220, 50, 50];
            else data.cell.styles.textColor = [0, 158, 77];
        }
    }
  });

  // FOOTER
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gabinas Properties Limited - Confidential Property Report', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  const fileName = `Gabinas_Report_${type}_${value.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(fileName);
};
