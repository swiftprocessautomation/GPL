

import { Estate, DashboardMetrics, Tenant } from '../types';

export const LANDLORDS = [
  "Yemi Idowu",
  "Mr. Muyiwa Abiodun",
  "Mr. Seun Olufeko",
  "Ezebunwo Wigwe",
  "Edward Okonofua",
  "Matthias Osayi-Mennon",
  "SMHJ Investment Limited",
  "Alhaji Abuja",
  "Mr. Femi Osibajo",
  "STB Leasing Limited"
];

// Broad Categories for the Sidebar
export const PROPERTY_CATEGORIES = [
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4 Bedroom"
];

// Specific Options for adding/editing tenants
export const TENANT_FLAT_TYPES = [
  "1 Bedroom",
  "2 Bedroom",
  "2 Bedroom Basic",
  "2 Bedroom Maxi",
  "3 Bedroom",
  "4 Bedroom",
  "Standard Flat"
];

export const PROPERTY_TYPES = PROPERTY_CATEGORIES;

// Helper to create ID
const createId = (prefix: string, index: number) => `${prefix}-${index}-${Date.now()}`;

// --- DATE PARSING HELPER ---
// Converts "10 September 2025" OR "21/05/2025" OR "25 May 2025" to "2025-09-10"
const parseDate = (dateStr: string): string => {
  if (!dateStr) return "";
  
  // Handle DD/MM/YYYY format (e.g., 21/05/2025)
  if (dateStr.includes('/') && !dateStr.includes(' ')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Handle "10 September 2025" or "25 May 2025"
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    // Adjust for timezone offset to ensure correct date
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
  }
  
  return dateStr; // Fallback
};

// Calculate days left
const calculateDaysLeft = (dueDateStr: string): number => {
  const today = new Date();
  const due = new Date(dueDateStr);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- MABEN PHASE 1 DATA (1 Bedroom Schedule) ---
const MABEN_PHASE_1_RAW = [
  { sn: 1, name: "Ms. Alheri Ayuba Danjuma", flat: "1A", block: "1", type: "1 Bedroom", start: "October 25, 2025", end: "October 24, 2026", due: 2500000, paid: 2300000 },
  { sn: 2, name: "Ms. Elizabeth M. Ogundipe", flat: "1H", block: "1", type: "1 Bedroom", start: "November 11, 2024", end: "November 10, 2025", due: 2500000, paid: 0 },
  { sn: 3, name: "Mrs. Temitope Oladipo", flat: "2A", block: "1", type: "1 Bedroom", start: "November 11, 2024", end: "November 10, 2025", due: 2500000, paid: 2000000 },
  { sn: 4, name: "Jack Emmanuel Amobi", flat: "2H", block: "1", type: "1 Bedroom", start: "November 11, 2024", end: "November 10, 2025", due: 2500000, paid: 0 },
  { sn: 5, name: "Ms. Kemi Babatunde", flat: "3A", block: "1", type: "1 Bedroom", start: "October 25, 2025", end: "October 24, 2026", due: 2500000, paid: 2500000 },
  { sn: 6, name: "Mr. Olumide Lawal", flat: "3H", block: "1", type: "1 Bedroom", start: "November 12, 2024", end: "November 11, 2025", due: 2500000, paid: 0 },
  { sn: 7, name: "Kehinde Yusuf Odunuga", flat: "4A", block: "1", type: "1 Bedroom", start: "October 25, 2024", end: "October 24, 2025", due: 2500000, paid: 0 },
  { sn: 8, name: "Leiba Love Solomon", flat: "4H", block: "1", type: "1 Bedroom", start: "January 3, 2025", end: "January 2, 2026", due: 2500000, paid: 0 },
  { sn: 9, name: "Circle Empire", flat: "1A", block: "2", type: "1 Bedroom", start: "October 15, 2024", end: "October 14, 2025", due: 2500000, paid: 0 },
  { sn: 10, name: "Chioma Ibekwe", flat: "1H", block: "2", type: "1 Bedroom", start: "October 15, 2025", end: "October 14, 2026", due: 2500000, paid: 1500000 },
  { sn: 11, name: "Ms. Vanessa O. Igbenabor", flat: "2A", block: "2", type: "1 Bedroom", start: "November 10, 2025", end: "November 10, 2026", due: 2500000, paid: 625000 },
  { sn: 12, name: "Musa Leroy", flat: "2H", block: "2", type: "1 Bedroom", start: "December 7, 2025", end: "December 7, 2026", due: 2500000, paid: 2500000 },
  { sn: 13, name: "Emmanuel Afamefuna Amamfa", flat: "3A", block: "2", type: "1 Bedroom", start: "October 15, 2025", end: "October 15, 2026", due: 2500000, paid: 2000000 },
  { sn: 14, name: "Blessing Udoh Friday", flat: "3H", block: "2", type: "1 Bedroom", start: "October 15, 2025", end: "October 14, 2026", due: 2500000, paid: 2000000 },
  { sn: 15, name: "Olumide Adewumi", flat: "4A", block: "2", type: "1 Bedroom", start: "October 15, 2025", end: "October 14, 2026", due: 2500000, paid: 2000000 },
  { sn: 16, name: "Fashanu Ayodeji Opeyemi", flat: "4H", block: "2", type: "1 Bedroom", start: "October 15, 2025", end: "October 14, 2026", due: 2500000, paid: 2500000 },
  { sn: 17, name: "Sese Ebisindou Stephanie", flat: "1A", block: "3", type: "1 Bedroom", start: "October 1, 2025", end: "September 30, 2026", due: 2500000, paid: 2500000 },
  { sn: 18, name: "Nofisat Olabisi Omooye", flat: "1H", block: "3", type: "1 Bedroom", start: "October 1, 2025", end: "September 30, 2026", due: 2500000, paid: 2000000 },
  { sn: 19, name: "Ms. Jane Chioma Anakwe", flat: "2A", block: "3", type: "1 Bedroom", start: "October 1, 2025", end: "September 30, 2026", due: 2500000, paid: 1700000 },
  { sn: 20, name: "Babajide Faboyinde", flat: "2H", block: "3", type: "1 Bedroom", start: "October 31, 2025", end: "October 30, 2026", due: 2500000, paid: 2500000 },
  { sn: 21, name: "Mr. Adegoke Adedara", flat: "3A", block: "3", type: "1 Bedroom", start: "October 1, 2025", end: "September 30, 2026", due: 2500000, paid: 2500000 },
  { sn: 22, name: "Abiodun Atilola", flat: "3H", block: "3", type: "1 Bedroom", start: "October 1, 2024", end: "September 30, 2025", due: 2500000, paid: 0 },
  { sn: 23, name: "Mr. Afarooq Fagbamila", flat: "4A", block: "3", type: "1 Bedroom", start: "October 1, 2025", end: "September 30, 2026", due: 2500000, paid: 2000000 },
  { sn: 24, name: "Segun Daini", flat: "4H", block: "3", type: "1 Bedroom", start: "October 1, 2024", end: "September 30, 2025", due: 2500000, paid: 0 }
];

// --- MABEN PHASE 1 (2-BEDROOM) DATA ---
const MABEN_PHASE_1_2BED_RAW = [
  { sn: 25, name: "Marves Omozupiah Iyinbor", landlord: "Alhaji Abuja", block: "3", flat: "1G", type: "2 Bedroom Maxi", start: "January 29, 2025", end: "January 28, 2027", due: 4200000, paid: 4200000 },
  { sn: 26, name: "Osuji Daniel Chigozie", landlord: "Alhaji Abuja", block: "3", flat: "1E", type: "2 Bedroom Basic", start: "January 29, 2025", end: "January 28, 2026", due: 3700000, paid: 0 },
  { sn: 27, name: "Obehi Christopher Iyinbor", landlord: "Alhaji Abuja", block: "1", flat: "3G", type: "2 Bedroom Maxi", start: "February 7, 2025", end: "February 6, 2027", due: 4200000, paid: 4200000 },
  { sn: 28, name: "Chioma Jennifer", landlord: "Alhaji Abuja", block: "3", flat: "1D", type: "2 Bedroom Basic", start: "February 11, 2025", end: "February 10, 2026", due: 3700000, paid: 0 },
  { sn: 29, name: "Amobi Emmanuel Jack", landlord: "Yemi Idowu", block: "1", flat: "1F", type: "2 Bedroom Maxi", start: "June 15, 2025", end: "June 14, 2026", due: 4200000, paid: 0 },
  { sn: 30, name: "Ms. Omolara R Balogun", landlord: "Yemi Idowu", block: "2", flat: "1C", type: "2 Bedroom Maxi", start: "June 25, 2025", end: "June 24, 2026", due: 4200000, paid: 0 },
  { sn: 31, name: "Ms. Abiola F. Olofa", landlord: "Yemi Idowu", block: "3", flat: "1C", type: "2 Bedroom Maxi", start: "April 13, 2025", end: "April 12, 2026", due: 4200000, paid: 0 }
];

// --- MABEN PHASE V RAW DATA (115 Tenants) ---
const MABEN_PHASE_5_RAW: any[] = [
  [1,"11","1A","2- BEDROOM MAXI","ADEOWOLE MUKAILA ODUTARASIN",4000000,4000000,"10 September 2025","09 September 2026","Mr. Muyiwa Abiodun"],
  [2,"11","1B","2- BEDROOM BASIC","ADEYEMO ADESHOLA",3500000,3500000,"09 October 2025","08 October 2026","Mr. Muyiwa Abiodun"],
  [3,"11","1D","2- BEDROOM BASIC","LONGINUS PROMISE NKIRUKA",3500000,3500000,"25 September 2025","24 September 2026","Mr. Muyiwa Abiodun"],
  [4,"11","1E","2- BEDROOM BASIC","AGOOLA YUSUF",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [5,"11","1F","2- BEDROOM BASIC","MICHAEL SHEDRACH AKUE",3500000,3500000,"25 September 2025","24 September 2026","Yemi Idowu"],
  [6,"11","1H","2- BEDROOM BASIC","NKECHI MERCY EMMANUEL",3500000,3500000,"19 September 2025","18 September 2026","Yemi Idowu"],
  [7,"11","2B","2- BEDROOM BASIC","AKINSUYA JOSHUA AKINYEMI",3500000,3500000,"10 September 2025","09 September 2026","Mr. Muyiwa Abiodun"],
  [8,"11","2C","2- BEDROOM BASIC","OLUSOLA OLASELE",3500000,3500000,"10 September 2025","09 September 2026","Mr. Muyiwa Abiodun"],
  [9,"11","2E","2- BEDROOM BASIC","GLORY NKOYENUM",3500000,3500000,"19 September 2025","18 September 2026","Yemi Idowu"],
  [10,"11","2F","2- BEDROOM BASIC","AWUJO JONAS IHEJIETO",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [11,"11","2H","2- BEDROOM BASIC","ADELAJU TAIWO",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [12,"11","3A","2- BEDROOM MAXI","AKINWANDE FOLORUNSHO",4000000,4000000,"19 September 2025","18 September 2026","Mr. Muyiwa Abiodun"],
  [13,"11","3B","2- BEDROOM BASIC","AGNES ODIMARHA",3500000,3500000,"10 September 2025","09 September 2026","Mr. Muyiwa Abiodun"],
  [14,"11","3C","2- BEDROOM BASIC","EMMANUEL EBOZOJIE",3500000,3500000,"19 September 2025","18 September 2026","Mr. Muyiwa Abiodun"],
  [15,"11","3D","2- BEDROOM BASIC","OLUWABUNMI MICHAEL BABAWANDE",3500000,3500000,"09 October 2025","08 October 2026","Mr. Muyiwa Abiodun"],
  [16,"11","3E","2- BEDROOM BASIC","EBUKA ANTHONY NWIKE",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [17,"11","3F","2- BEDROOM BASIC","TOLA SHITTA",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [18,"11","3H","2- BEDROOM BASIC","MUTIU OYEWUSI OJO",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [19,"11","4B","2- BEDROOM BASIC","SEANTEL BONIFACE",3500000,3500000,"10 September 2025","09 September 2026","Mr. Muyiwa Abiodun"],
  [20,"11","4C","2- BEDROOM BASIC","GLORY NDUESO EKERE",3500000,3500000,"22 September 2025","21 September 2026","Mr. Muyiwa Abiodun"],
  [21,"11","4D","2- BEDROOM BASIC","CHIOMA PEACE AGBO",3500000,3500000,"09 October 2025","08 October 2026","Mr. Muyiwa Abiodun"],
  [22,"11","4E","2- BEDROOM BASIC","GODFREY JOSEPH EBIMOBOWEI",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [23,"11","4F","2- BEDROOM BASIC","IBEZIMAKOR CHISIMDI DIVINE",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [24,"11","4H","2- BEDROOM BASIC","ANYAOHA SANDRA",3500000,3500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [25,"12","1B","2- BEDROOM BASIC","ADESHIYAN ELIZABETH OLOLADE",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [26,"12","1C","2- BEDROOM BASIC","MALIK OGIE USMAN",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [27,"12","1D","2- BEDROOM BASIC","OLADUSO ABASS MUYIWA",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [28,"12","1E","2- BEDROOM BASIC","OGUNSANYA MOSHOOD OWONIYI",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [29,"12","1F","2- BEDROOM BASIC","SIMISOLA GBENLE",3500000,3500000,"30 September 2025","29 September 2026","Yemi Idowu"],
  [30,"12","1H","2- BEDROOM BASIC","CHIBUZOR EMMANUEL ONUORAH",3500000,3500000,"25 September 2025","24 September 2026","Yemi Idowu"],
  [31,"12","2B","2- BEDROOM BASIC","OKOLIE EMEKA ANSLEM",3500000,3500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [32,"12","2C","2- BEDROOM BASIC","OFOEGBU PETER CHIBUEZE",3500000,3500000,"30 September 2025","29 September 2026","Yemi Idowu"],
  [33,"12","2D","2- BEDROOM BASIC","ONUCHE MARY",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [34,"12","2E","2- BEDROOM BASIC","BANJO SIMISOLA OLABISI",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [35,"12","2F","2- BEDROOM BASIC","CHIZOBA IJEOMA ANYASIE",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [36,"12","2H","2- BEDROOM BASIC","BASSEY NDUEHE MFON",3500000,3500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [37,"12","3B","2- BEDROOM BASIC","JEFFREY OBAISIAGBON",3500000,3500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [38,"12","3C","2- BEDROOM BASIC","UMEANYIKA CHUKWUEBUKA",3500000,3500000,"06 October 2025","05 October 2026","Yemi Idowu"],
  [39,"12","3D","2- BEDROOM BASIC","OKUBANJO OLUBOLAJIMI",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [40,"12","3E","2- BEDROOM BASIC","CHRISTIAN OSEMWEGIE",3500000,3500000,"25 September 2025","24 September 2026","Yemi Idowu"],
  [41,"12","3F","2- BEDROOM BASIC","OFOEGBU PETER CHIBUEZE",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [42,"12","3G","2- BEDROOM MAXI","BABALOLA BOLANLE OLUCHI",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [43,"12","3H","2- BEDROOM BASIC","OLUCHUKWU BENJAMIN ANAZIA",3500000,3500000,"19 September 2025","18 September 2026","Yemi Idowu"],
  [44,"12","4A","2- BEDROOM MAXI","ADEMOLA ABISAYO PAUL",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [45,"12","4B","2- BEDROOM BASIC","IBELEMA FINISIDI OBOMANU",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [46,"12","4C","2- BEDROOM BASIC","IKELEGBE PRISCILLA OGHENEFEJIRO",3500000,3500000,"06 October 2025","05 October 2026","Yemi Idowu"],
  [47,"12","4D","2- BEDROOM BASIC","ABDULKADIRI ABMIBOLA ESTHER",3500000,3500000,"19 September 2025","18 September 2026","Yemi Idowu"],
  [48,"12","4E","2- BEDROOM BASIC","AJIDAHUN IBUKUNOLUWA",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [49,"12","4F","2- BEDROOM BASIC","PETER MERCY GRACE",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [50,"12","4G","2- BEDROOM MAXI","ADEWALE OLOLADE JAMES",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [51,"12","4H","2- BEDROOM BASIC","ANN UMEOZO",3500000,3500000,"19 September 2025","18 September 2026","Yemi Idowu"],
  [52,"13","1A","1 BEDROOM","JOSEPH ANSELM",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [53,"13","1B","2 BEDROOM MAXI","ALABI ADEDEJI",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [54,"13","1C","2 BEDROOM MAXI","OWOEYE OLUWASEGUN JOSEPH",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [55,"13","1D","2 BEDROOM BASIC","SANUSI HAMID OLAYIWOLA",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [56,"13","1E","2 BEDROOM BASIC","WINTORIA EMPIRE/NDUNESEOKWU ANTHONY",3500000,3500000,"30 September 2025","29 September 2026","Yemi Idowu"],
  [57,"13","1F","2 BEDROOM MAXI","OLUWOLE DARMOLA EBENEZER",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [58,"13","1G","2 BEDROOM MAXI","OMORUAN EMMANUEL",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [59,"13","1H","1 BEDROOM","ATANDA OLADIPUPO",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [60,"13","1ST FLOOR 2A","1 BEDROOM","SEGUN ADEDIRAN",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [61,"13","1ST FLOOR 2B","2 BEDROOM MAXI","STEVE AKHUETIEMEN",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [62,"13","1ST FLOOR 2C","2 BEDROOM MAXI","UKET DENNIS UBI",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [63,"13","1ST FLOOR 2D","2 BEDROOM BASIC","ADEOYE TEMITOPE SUNDAY",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [64,"13","1ST FLOOR 2E","2 BEDROOM BASIC","BOBBY OSAHON OGBEBOR",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [65,"13","1ST FLOOR 2F","2 BEDROOM MAXI","CANICE NCHEDOCHUKWU OBI",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [66,"13","1ST FLOOR 2G","2 BEDROOM MAXI","OLATUNJI BAJOWA",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [67,"13","1ST FLOOR 2H","1 BEDROOM","SANDRA OSUNWE",2500000,2500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [68,"13","2ND FLOOR 3A","1 BEDROOM","OBI CHIDERA SHALOM",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [69,"13","2ND FLOOR 3B","2 BEDROOM MAXI","IGHO PETERS MARBEL",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [70,"13","2ND FLOOR 3C","2 BEDROOM MAXI","OBASUYI FRANCISCA ITOHAN",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [71,"13","2ND FLOOR 3D","2 BEDROOM BASIC","SANYAOLU OLAMILEKAN",3500000,3500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [72,"13","2ND FLOOR 3E","2 BEDROOM BASIC","LAWAL SOFIAT MOSEBOLATAN",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [73,"13","2ND FLOOR 3F","2 BEDROOM MAXI","MORDI KEVIN EBUKA",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [74,"13","2ND FLOOR 3G","2 BEDROOM MAXI","AKHIGBEMEN PAMELA",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [75,"13","2ND FLOOR 3H","1 BEDROOM","ALABI TAIWO",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [76,"13","3RD FLOOR 4A","1 BEDROOM","FRANK OBINNA",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [77,"13","3RD FLOOR 4B","2 BEDROOM MAXI","EMEKAME ABASI ETOP",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [78,"13","3RD FLOOR 4C","2 BEDROOM MAXI","AYOOLA MICHAEL FOLORUNSHO",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [79,"13","3RD FLOOR 4D","2 BEDROOM BASIC","CHIBUIKE SOLOMON CHIMEREMEZE",3500000,3500000,"22 September 2025","21 September 2026","Yemi Idowu"],
  [80,"13","3RD FLOOR 4E","2 BEDROOM BASIC","OFOEGBU PETER CHIBUEZE",3500000,3500000,"25 September 2025","24 September 2026","Yemi Idowu"],
  [81,"13","3RD FLOOR 4F","2 BEDROOM MAXI","OYEBANJI OLUWASEYI STEPHEN",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [82,"13","3RD FLOOR 4G","2 BEDROOM MAXI","NAOMI NDUBUEZE",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [83,"13","3RD FLOOR 4H","1 BEDROOM","DIVINE CHIMAMANDA WEGWU",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [84,"14","GROUND FLOOR 1A","1 BEDROOM","YEKINNI MURITALA",2500000,2500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [85,"14","GROUND FLOOR 1B","2 BEDROOM MAXI","AMUCHE SHEDRACK SIMON",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [86,"14","GROUND FLOOR 1C","2 BEDROOM MAXI","PRECIOUS UWOGHIREN",4000000,4000000,"06 October 2025","05 October 2026","Yemi Idowu"],
  [87,"14","GROUND FLOOR 1D","2 BEDROOM BASIC","AGBABIAKA TIJANI BABATUNDE",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [88,"14","GROUND FLOOR 1E","2 BEDROOM BASIC","UANGBAOJE UYI NOAHSON",3500000,3500000,"29 September 2025","28 September 2026","Yemi Idowu"],
  [89,"14","GROUND FLOOR 1F","2 BEDROOM MAXI","DOSUMU EBUNOLUWA",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [90,"14","GROUND FLOOR 1G","2 BEDROOM MAXI","AKONANI DUBEM PRECIOUS",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [91,"14","GROUND FLOOR 1H","1 BEDROOM","YEKINNI MURITALA",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [92,"14","1ST FLOOR 2A","1 BEDROOM","AMAKA (OSUNWE)",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [93,"14","1ST FLOOR 2B","2 BEDROOM MAXI","SOLOMON EKUNKE OKPE",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [94,"14","1ST FLOOR 2C","2 BEDROOM MAXI","FADUMO MOSUNMOLA OLUWATOSIN",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [95,"14","1ST FLOOR 2D","2 BEDROOM BASIC","AGBOLAHAN MODUPE",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [96,"14","1ST FLOOR 2E","2 BEDROOM BASIC","OLUWAGBENGA OGUNLANA",3500000,3500000,"06 October 2025","05 October 2026","Yemi Idowu"],
  [97,"14","1ST FLOOR 2F","2 BEDROOM MAXI","YEKINNI MURITALA",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [98,"14","1ST FLOOR 2G","2 BEDROOM MAXI","EZIHE DAVID CHIDUBEM",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [99,"14","1ST FLOOR 2H","1 BEDROOM","YEKINNI MURITALA",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [100,"14","2ND FLOOR 3A","1 BEDROOM","STEVEN OLALEKAN",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [101,"14","2ND FLOOR 3B","2 BEDROOM MAXI","MR. AND MRS. OLUWASEYE KUPOLUYI",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [102,"14","2ND FLOOR 3C","2 BEDROOM MAXI","COLLINS-OGBUO NNEKA",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [103,"14","2ND FLOOR 3D","2 BEDROOM BASIC","DORATHY SYLVESTER",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [104,"14","2ND FLOOR 3E","2 BEDROOM BASIC","ASG GLOBAL RESOURCES",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [105,"14","2ND FLOOR 3F","2 BEDROOM MAXI","DAVE NDUKA NWOKEDI",4000000,4000000,"22 September 2025","21 September 2027","Yemi Idowu"],
  [106,"14","2ND FLOOR 3G","2 BEDROOM MAXI","ASG GLOBAL RESOURCES",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [107,"14","2ND FLOOR 3H","1 BEDROOM","LASISI AMINAT OLAWUNMI",2500000,2500000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [108,"14","3RD FLOOR 4A","1 BEDROOM","ADEYINKA JONATHAN OLOLADE",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [109,"14","3RD FLOOR 4B","2 BEDROOM MAXI","NURENI ABDULHAMEED OLUWATIMILEYIN",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [110,"14","3RD FLOOR 4C","2 BEDROOM MAXI","DOM ANYANWU CHINENYE PAMELA",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [111,"14","3RD FLOOR 4D","2 BEDROOM BASIC","ODIRHI AKPOYOHMA",3500000,3500000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [112,"14","3RD FLOOR 4E","2 BEDROOM BASIC","DANIEL OREOLUWA ADEBOYEJO",3500000,3500000,"15 September 2025","14 September 2026","Yemi Idowu"],
  [113,"14","3RD FLOOR 4F","2 BEDROOM MAXI","OKOTETE OGHARAMADO BLESSING",4000000,4000000,"10 September 2025","09 September 2026","Yemi Idowu"],
  [114,"14","3RD FLOOR 4G","2 BEDROOM MAXI","PAUL OBIANYO",4000000,4000000,"07 September 2025","06 September 2026","Yemi Idowu"],
  [115,"14","3RD FLOOR 4H","1 BEDROOM","LASISI OLAMIDE DANIEL",2500000,2500000,"07 September 2025","06 September 2026","Yemi Idowu"],
];

// --- NEW NOVABASE 1-BEDROOM DATA (STB LEASING LIMITED) ---
const NOVABASE_1BED_UPDATED = [
  { sn: 1, name: "ADETUNJI TEJUOSHO (AYODEJI OPEYEMI)", landlord: "STB Leasing Limited", block: "1", flat: "E", type: "1 Bedroom", start: "25 May 2025", end: "24 May 2026", due: 3000000, paid: 3000000 },
  { sn: 2, name: "ODDIH UCHE", landlord: "STB Leasing Limited", block: "1", flat: "J", type: "1 Bedroom", start: "22 May 2025", end: "21 May 2026", due: 3000000, paid: 3000000 },
  { sn: 3, name: "MRS. FOLASHADE JOHNSON", landlord: "STB Leasing Limited", block: "1", flat: "O", type: "1 Bedroom", start: "27 August 2025", end: "26 August 2026", due: 3000000, paid: 3000000 },
  { sn: 4, name: "KOLADE SURAKAT/KIMMEL SOLUTION", landlord: "STB Leasing Limited", block: "1", flat: "T", type: "1 Bedroom", start: "1 June 2025", end: "31 May 2026", due: 3000000, paid: 2000000 },
  { sn: 5, name: "IFENACHO CHIJIOKE", landlord: "STB Leasing Limited", block: "2", flat: "E", type: "1 Bedroom", start: "10 June 2025", end: "9 June 2026", due: 3000000, paid: 3000000 },
  { sn: 6, name: "LOVETH NKECHI AMEH", landlord: "STB Leasing Limited", block: "2", flat: "J", type: "1 Bedroom", start: "23 June 2025", end: "22 June 2026", due: 3000000, paid: 3000000 },
  { sn: 7, name: "LOVETH NKECHI AMEH", landlord: "STB Leasing Limited", block: "2", flat: "O", type: "1 Bedroom", start: "25 June 2025", end: "24 June 2026", due: 3000000, paid: 3000000 },
  { sn: 8, name: "EZECHUKWU JANA ASSUZU", landlord: "STB Leasing Limited", block: "2", flat: "T", type: "1 Bedroom", start: "25 May 2025", end: "24 May 2026", due: 3000000, paid: 3000000 },
  { sn: 9, "name": "MR. LANRE AKINMUSIRE", landlord: "STB Leasing Limited", block: "3", flat: "E", type: "1 Bedroom", start: "28 May 2025", end: "27 May 2026", due: 3000000, paid: 3000000 },
  { sn: 10, name: "MS. LOVETH NKECHI AMEH", landlord: "STB Leasing Limited", block: "3", flat: "J", type: "1 Bedroom", start: "26 July 2025", end: "25 July 2026", due: 3000000, paid: 3000000 },
  { sn: 11, name: "EFOSA JOHN OSUNHON", landlord: "STB Leasing Limited", block: "3", flat: "O", type: "1 Bedroom", start: "22 June 2025", end: "21 June 2026", due: 3000000, paid: 3000000 },
  { sn: 12, name: "EBA MERCY UKEH", landlord: "STB Leasing Limited", block: "3", flat: "T", type: "1 Bedroom", start: "10 June 2025", end: "9 June 2026", due: 3000000, paid: 3000000 },
  { sn: 13, name: "OLAMIDE ADETAYO", landlord: "STB Leasing Limited", block: "4", flat: "E", type: "1 Bedroom", start: "28 May 2025", end: "27 May 2026", due: 3000000, paid: 3000000 },
  { sn: 14, name: "EZECHUKWU JANA", landlord: "STB Leasing Limited", block: "4", flat: "J", type: "1 Bedroom", start: "15 June 2025", end: "14 June 2026", due: 3000000, paid: 3000000 },
  { sn: 15, name: "FASHANU AYODEJI OPEYEMI", landlord: "STB Leasing Limited", block: "4", flat: "O", type: "1 Bedroom", start: "8 June 2025", end: "7 June 2026", due: 3000000, paid: 3000000 },
  { sn: 16, name: "CHIDI EKWE GODWIN", landlord: "STB Leasing Limited", block: "4", flat: "T", type: "1 Bedroom", start: "12 June 2025", end: "11 June 2026", due: 3000000, paid: 3000000 }
];

// --- NEW NOVABASE 2-BEDROOM DATA (STB LEASING LIMITED) ---
const NOVABASE_2BED_UPDATED = [
  { sn: 1, name: "DONALD MOYOSIOLUWA DA-SILVA", landlord: "STB Leasing Limited", block: "1", flat: "A", type: "2 Bedrooms", start: "21/05/2025", end: "20/05/2026", due: 6000000, paid: 6000000 },
  { sn: 2, name: "FASHANU AYODEJI", landlord: "STB Leasing Limited", block: "1", flat: "B", type: "2 Bedrooms", start: "21/05/2025", end: "20/05/2026", due: 6000000, paid: 6000000 },
  { sn: 3, name: "NSE ETEYEN OBOHO", landlord: "STB Leasing Limited", block: "1", flat: "C", type: "2 Bedrooms", start: "25/05/2025", end: "24/05/2026", due: 6000000, paid: 6000000 },
  { sn: 4, name: "AKODU AYOMIDE SHARON", landlord: "STB Leasing Limited", block: "1", flat: "D", type: "2 Bedrooms", start: "24/05/2025", end: "23/05/2026", due: 6000000, paid: 6000000 },
  { sn: 5, name: "OLAOSEBIKAN JEREMIAH (COURT YARD FARMS LIMITED)", landlord: "STB Leasing Limited", block: "1", flat: "F", type: "2 Bedrooms", start: "27/05/2024", end: "26/05/2025", due: 6000000, paid: 0 },
  { sn: 6, name: "OLAOSEBIKAN JEREMIAH (COURT YARD FARMS LIMITED)", landlord: "STB Leasing Limited", block: "1", flat: "G", type: "2 Bedrooms", start: "27/05/2025", end: "26/05/2026", due: 6000000, paid: 6000000 },
  { sn: 7, name: "EMMANUEL OGBE IRIOGBE", landlord: "STB Leasing Limited", block: "1", flat: "H", type: "2 Bedrooms", start: "24/10/2025", end: "23/10/2026", due: 6000000, paid: 6000000 },
  { sn: 8, name: "ODDIHI UCHE", landlord: "STB Leasing Limited", block: "1", flat: "I", type: "2 Bedrooms", start: "21/05/2025", end: "20/05/2026", due: 6000000, paid: 6000000 },
  { sn: 9, name: "NNAMDI NNAMA ABODEMORADA LTD", landlord: "STB Leasing Limited", block: "1", flat: "K", type: "2 Bedrooms", start: "30/06/2025", end: "29/06/2026", due: 6000000, paid: 6000000 },
  { sn: 10, name: "GEORGE CHIWENDU PEACE", landlord: "STB Leasing Limited", block: "1", flat: "L", type: "2 Bedrooms", start: "31/08/2025", end: "30/08/2026", due: 6000000, paid: 3000000 },
  { sn: 11, name: "AZUBUIKE EMMANUEL", landlord: "STB Leasing Limited", block: "1", flat: "M", type: "2 Bedrooms", start: "15/07/2025", end: "14/07/2026", due: 6000000, paid: 6000000 },
  { sn: 12, name: "FEMI JAMES", landlord: "STB Leasing Limited", block: "1", flat: "N", type: "2 Bedrooms", start: "21/05/2025", end: "20/05/2026", due: 6000000, paid: 6000000 },
  { sn: 13, name: "AKINWUNMI ESO", landlord: "STB Leasing Limited", block: "1", flat: "P", type: "2 Bedrooms", start: "25/05/2024", end: "24/05/2025", due: 6000000, paid: 0 },
  { sn: 14, name: "EZEJA ODUM BLESSING", landlord: "STB Leasing Limited", block: "1", flat: "Q", type: "2 Bedrooms", start: "21/09/2025", end: "20/09/2026", due: 6000000, paid: 6000000 },
  { sn: 15, name: "KOLADE SURAKAT/KIMMEL SOLUTION", landlord: "STB Leasing Limited", block: "1", flat: "R", type: "2 Bedrooms", start: "01/06/2025", end: "31/05/2026", due: 6000000, paid: 6000000 },
  { sn: 16, name: "KOLADE SURAKAT/KIMMEL SOLUTION", landlord: "STB Leasing Limited", block: "1", flat: "S", type: "2 Bedrooms", start: "01/06/2025", end: "31/05/2026", due: 6000000, paid: 5000000 },
  { sn: 17, name: "ADEGOKE ELIJAH ADEGBAMI", landlord: "STB Leasing Limited", block: "2", flat: "A", type: "2 Bedrooms", start: "31/05/2025", end: "30/05/2026", due: 6000000, paid: 6000000 },
  { sn: 18, name: "ADEGOKE ELIJAH ADEGBAMI", landlord: "STB Leasing Limited", block: "2", flat: "B", type: "2 Bedrooms", start: "31/05/2025", end: "30/05/2026", due: 6000000, paid: 6000000 },
  { sn: 19, name: "UGOCHUKWU IFEANACHO UGORJI", landlord: "STB Leasing Limited", block: "2", flat: "C", type: "2 Bedrooms", start: "22/05/2025", end: "21/05/2026", due: 6000000, paid: 6000000 },
  { sn: 20, name: "HUGBO OGHENERUME", landlord: "STB Leasing Limited", block: "2", flat: "D", type: "2 Bedrooms", start: "31/05/2025", end: "30/05/2026", due: 6000000, paid: 6000000 },
  { sn: 21, name: "CHIJIOKE IFEANACHO", landlord: "STB Leasing Limited", block: "2", flat: "F", type: "2 Bedrooms", start: "29/05/2025", end: "28/05/2026", due: 6000000, paid: 6000000 },
  { sn: 22, name: "MR. EBUKA FRANCIS AKARAKA", landlord: "STB Leasing Limited", block: "2", flat: "G", type: "2 Bedrooms", start: "20/07/2025", end: "19/07/2026", due: 6000000, paid: 6000000 },
  { sn: 23, name: "UGOCHUKWU IFEANACHO UGORJI", landlord: "STB Leasing Limited", block: "2", flat: "H", type: "2 Bedrooms", start: "22/05/2025", end: "21/05/2026", due: 6000000, paid: 6000000 },
  { sn: 24, name: "MR. ANAYO OPARA GODSWILL", landlord: "STB Leasing Limited", block: "2", flat: "I", type: "2 Bedrooms", start: "29/05/2025", end: "28/05/2026", due: 6000000, paid: 6000000 },
  { sn: 25, name: "OLUWBANKOLA FALADE (PRIME PENTHOUSE)", landlord: "STB Leasing Limited", block: "2", flat: "K", type: "2 Bedrooms", start: "25/05/2025", end: "24/05/2026", due: 6000000, paid: 6000000 },
  { sn: 26, name: "CHUKWUKA CLETUS MBACHU", landlord: "STB Leasing Limited", block: "2", flat: "L", type: "2 Bedrooms", start: "17/06/2025", end: "16/06/2026", due: 6000000, paid: 6000000 },
  { sn: 27, name: "OLUWASEUN SEGUN OTI", landlord: "STB Leasing Limited", block: "2", flat: "M", type: "2 Bedrooms", start: "28/05/2025", end: "27/05/2026", due: 6000000, paid: 6000000 },
  { sn: 28, name: "KINGSLEY BATURE", landlord: "STB Leasing Limited", block: "2", flat: "N", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 },
  { sn: 29, name: "PETER OKEKE", landlord: "STB Leasing Limited", block: "2", flat: "P", type: "2 Bedrooms", start: "25/05/2025", end: "24/05/2026", due: 6000000, paid: 6000000 },
  { sn: 30, name: "PETER OKEKE", landlord: "STB Leasing Limited", block: "2", flat: "Q", type: "2 Bedrooms", start: "27/05/2025", end: "26/05/2026", due: 6000000, paid: 6000000 },
  { sn: 31, name: "MR. DANIEL SUNDAY KPANAKI", landlord: "STB Leasing Limited", block: "2", flat: "R", type: "2 Bedrooms", start: "04/07/2025", end: "03/07/2026", due: 6000000, paid: 6000000 },
  { sn: 32, name: "MR PROSPER KING", landlord: "STB Leasing Limited", block: "2", flat: "S", type: "2 Bedrooms", start: "23/07/2025", end: "22/07/2026", due: 6000000, paid: 6000000 },
  { sn: 33, name: "LOVETH NKECHI", landlord: "STB Leasing Limited", block: "3", flat: "A", type: "2 Bedrooms", start: "03/06/2025", end: "02/06/2026", due: 6000000, paid: 6000000 },
  { sn: 34, name: "AYOTOMIDE FALOMO", landlord: "STB Leasing Limited", block: "3", flat: "B", type: "2 Bedrooms", start: "29/05/2025", end: "28/05/2026", due: 6000000, paid: 6000000 },
  { sn: 35, name: "NSE OBOHO", landlord: "STB Leasing Limited", block: "3", flat: "C", type: "2 Bedrooms", start: "01/06/2025", end: "31/05/2026", due: 6000000, paid: 6000000 },
  { sn: 36, name: "MOMODU COVENANT", landlord: "STB Leasing Limited", block: "3", flat: "D", type: "2 Bedrooms", start: "16/07/2025", end: "15/07/2026", due: 6000000, paid: 6000000 },
  { sn: 37, name: "DAVE NDUKA NWOKEDI", landlord: "STB Leasing Limited", block: "3", flat: "F", type: "2 Bedrooms", start: "06/07/2025", end: "05/07/2026", due: 8000000, paid: 8000000 },
  { sn: 38, name: "MOMODU COVENANT", landlord: "STB Leasing Limited", block: "3", flat: "G", type: "2 Bedrooms", start: "16/10/2025", end: "30/09/2026", due: 6000000, paid: 6000000 },
  { sn: 39, name: "OLUFEMI ADEWOLE", landlord: "STB Leasing Limited", block: "3", flat: "H", type: "2 Bedrooms", start: "01/06/2025", end: "31/05/2026", due: 6000000, paid: 6000000 },
  { sn: 40, name: "NSE OBOHO", landlord: "STB Leasing Limited", block: "3", flat: "I", type: "2 Bedrooms", start: "07/06/2025", end: "06/06/2026", due: 6000000, paid: 6000000 },
  { sn: 41, name: "AZUBUIKE EMMANUEL", landlord: "STB Leasing Limited", block: "3", flat: "K", type: "2 Bedrooms", start: "26/05/2025", end: "25/05/2026", due: 6000000, paid: 6000000 },
  { sn: 42, name: "MS. SAIDI-RAJI JESSICA", landlord: "STB Leasing Limited", block: "3", flat: "L", type: "2 Bedrooms", start: "21/08/2025", end: "20/08/2026", due: 6000000, paid: 6000000 },
  { sn: 43, name: "PETER OBELE ABUE (CORAFRICA)", landlord: "STB Leasing Limited", block: "3", flat: "M", type: "2 Bedrooms", start: "20/07/2024", end: "19/07/2025", due: 6000000, paid: 0 },
  { sn: 44, name: "AL-HASSAN DAUDA TIJANI", landlord: "STB Leasing Limited", block: "3", flat: "N", type: "2 Bedrooms", start: "26/05/2025", end: "25/05/2026", due: 6000000, paid: 6000000 },
  { sn: 45, name: "AL-HASSAN DAUDA TIJANI", landlord: "STB Leasing Limited", block: "3", flat: "P", type: "2 Bedrooms", start: "26/05/2025", end: "25/05/2026", due: 6000000, paid: 6000000 },
  { sn: 46, name: "TAIWO TOPE", landlord: "STB Leasing Limited", block: "3", flat: "Q", type: "2 Bedrooms", start: "26/05/2025", end: "25/05/2026", due: 6000000, paid: 6000000 },
  { sn: 47, name: "ALIAH IGNATIUS ALIAH", landlord: "STB Leasing Limited", block: "3", flat: "R", type: "2 Bedrooms", start: "22/05/2025", end: "21/05/2026", due: 6000000, paid: 6000000 },
  { sn: 48, name: "ALIAH IGNATIUS ALIAH", landlord: "STB Leasing Limited", block: "3", flat: "S", type: "2 Bedrooms", start: "22/05/2025", end: "21/05/2026", due: 6000000, paid: 6000000 },
  { sn: 49, name: "ODUM HYACIENT OKECHWUKWU", landlord: "STB Leasing Limited", block: "4", flat: "A", type: "2 Bedrooms", start: "19/06/2025", end: "18/06/2026", due: 6000000, paid: 6000000 },
  { sn: 50, name: "MR. ANAYO OKPARA GODSWILL", landlord: "STB Leasing Limited", block: "4", flat: "B", type: "2 Bedrooms", start: "01/07/2025", end: "30/06/2026", due: 6000000, paid: 6000000 },
  { sn: 51, name: "NWOBIARA KALU/AMAKE MIKE-NWOKE", landlord: "STB Leasing Limited", block: "4", flat: "C", type: "2 Bedrooms", start: "11/06/2025", end: "10/06/2026", due: 6000000, paid: 6000000 },
  { sn: 52, name: "OLATOMISIN FALOMO", landlord: "STB Leasing Limited", block: "4", flat: "D", type: "2 Bedrooms", start: "14/06/2025", end: "13/06/2026", due: 6000000, paid: 6000000 },
  { sn: 53, name: "KELVIN EBHOJIE", landlord: "STB Leasing Limited", block: "4", flat: "F", type: "2 Bedrooms", start: "09/06/2025", end: "08/06/2026", due: 6000000, paid: 6000000 },
  { sn: 54, name: "ONOSE ASOTIE-ENAHOLO", landlord: "STB Leasing Limited", block: "4", flat: "G", type: "2 Bedrooms", start: "06/07/2025", end: "05/07/2026", due: 6000000, paid: 6000000 },
  { sn: 55, name: "NNAMDI NNAMA ABODEMORADA LTD", landlord: "STB Leasing Limited", block: "4", flat: "H", type: "2 Bedrooms", start: "30/06/2025", end: "29/06/2026", due: 6000000, paid: 6000000 },
  { sn: 56, name: "CHAZZ MBADIWE", landlord: "STB Leasing Limited", block: "4", flat: "I", type: "2 Bedrooms", start: "04/06/2025", end: "03/06/2026", due: 6000000, paid: 6000000 },
  { sn: 57, name: "FASHANU AYODEJI OPEYEMI", landlord: "STB Leasing Limited", block: "4", flat: "K", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 },
  { sn: 58, name: "ADEBISI MICHEAL OLUFEMI", landlord: "STB Leasing Limited", block: "4", flat: "L", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 },
  { sn: 59, name: "FASHANU AYODEJI OPEYEMI", landlord: "STB Leasing Limited", block: "4", flat: "M", type: "2 Bedrooms", start: "28/08/2025", end: "27/08/2026", due: 6000000, paid: 6000000 },
  { sn: 60, name: "SABRINA UMUHOZA", landlord: "STB Leasing Limited", block: "4", flat: "N", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 },
  { sn: 61, name: "TAIWO SHEKONI VANTAGGIO LTD", landlord: "STB Leasing Limited", block: "4", flat: "P", type: "2 Bedrooms", start: "09/06/2025", end: "08/06/2026", due: 6000000, paid: 6000000 },
  { sn: 62, name: "EBA MERCY UKEH", landlord: "STB Leasing Limited", block: "4", flat: "Q", type: "2 Bedrooms", start: "10/06/2025", end: "09/06/2026", due: 6000000, paid: 6000000 },
  { sn: 63, name: "ADESHOLA ADESANYA", landlord: "STB Leasing Limited", block: "4", flat: "R", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 },
  { sn: 64, name: "ADESHOLA ADESANYA", landlord: "STB Leasing Limited", block: "4", flat: "S", type: "2 Bedrooms", start: "08/06/2025", end: "07/06/2026", due: 6000000, paid: 6000000 }
];

// --- ALPERTON RAW DATA ---
const ALPERTON_RAW = [
  { sn: 1, name: "EJOH ANDREW", landlord: "Mr. Seun Olufeko", block: "11", flat: "B", start: "15/09/2025", end: "14/09/2026", due: 6500000, paid: 6500000 },
  { sn: 2, name: "AYODELE OYEDE", landlord: "Mr. Femi Osibajo", block: "17", flat: "A", start: "05/08/2025", end: "05/08/2026", due: 6500000, paid: 6500000 },
  { sn: 3, name: "SHENBOTE CHARLES ADEWUNMI", landlord: "Mr. Femi Osibajo", block: "17", flat: "B", start: "24/02/2025", end: "23/02/2026", due: 6500000, paid: 6500000 },
  { sn: 4, name: "OVORO MILLICENT USMAN", landlord: "Ezebunwo Wigwe", block: "22", flat: "A", start: "14/11/2024", end: "13/11/2025", due: 6500000, paid: 0 },
  { sn: 5, name: "YUSSUF OLAMILEKAN MOJEED", landlord: "Ezebunwo Wigwe", block: "22", flat: "B", start: "01/02/2025", end: "31/01/2026", due: 6500000, paid: 6500000 },
  { sn: 6, name: "ABIODUN ATILOLA", landlord: "Mr. Muyiwa Abiodun", block: "25", flat: "A", start: "11/09/2025", end: "10/09/2026", due: 6500000, paid: 6500000 },
];

export const fetchEstates = async (): Promise<Estate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_ESTATES);
    }, 300);
  });
};

// Process Maben Phase 1 Tenants
const mabenPhase1Tenants: Tenant[] = [
  // Phase 1 (1 Bedroom)
  ...MABEN_PHASE_1_RAW.map(t => {
    const startDate = parseDate(t.start);
    const dueDate = parseDate(t.end);
    const daysLeft = calculateDaysLeft(dueDate);
    const outstanding = t.due - t.paid;
    return {
      id: createId('maben-p1', t.sn),
      serialNumber: t.sn,
      name: t.name,
      landlord: "Yemi Idowu",
      email: "",
      phoneNumber: "",
      flatType: t.type,
      block: t.block,
      flatNumber: t.flat,
      tenor: "1 Year",
      phase: "Phase 1 - 1 Bedroom",
      rentExpected: t.due,
      rentPaid: t.paid,
      outstandingBalance: outstanding,
      rentStartDate: startDate,
      rentDueDate: dueDate,
      lastPaymentDate: startDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      paymentHistory: []
    } as Tenant;
  }),
  // Phase 1 (2 Bedroom)
  ...MABEN_PHASE_1_2BED_RAW.map(t => {
    const startDate = parseDate(t.start);
    const dueDate = parseDate(t.end);
    const daysLeft = calculateDaysLeft(dueDate);
    const outstanding = t.due - t.paid;
    return {
      id: createId('maben-p1-2bed', t.sn),
      serialNumber: t.sn,
      name: t.name,
      landlord: t.landlord,
      email: "",
      phoneNumber: "",
      flatType: t.type,
      block: t.block,
      flatNumber: t.flat,
      tenor: "1 Year",
      phase: "Phase 1 - 2 Bedroom",
      rentExpected: t.due,
      rentPaid: t.paid,
      outstandingBalance: outstanding,
      rentStartDate: startDate,
      rentDueDate: dueDate,
      lastPaymentDate: startDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      paymentHistory: []
    } as Tenant;
  })
];

// Process Maben Phase 5 Tenants
const mabenPhase5Tenants: Tenant[] = MABEN_PHASE_5_RAW.map((row) => {
    const [sn, block, flat, typeRaw, name, due, paid, startRaw, endRaw, landlord] = row;
    const startDate = parseDate(startRaw);
    const dueDate = parseDate(endRaw);
    const daysLeft = calculateDaysLeft(dueDate);
    const outstanding = due - paid;
    
    // Clean up type string "2- BEDROOM MAXI" -> "2 Bedroom Maxi"
    let cleanType = typeRaw.replace("2- ", "2 ").replace("2-", "2 ").replace("1 BEDROOM", "1 Bedroom");
    if(cleanType.toUpperCase().includes("MAXI")) cleanType = "2 Bedroom Maxi";
    else if(cleanType.toUpperCase().includes("BASIC")) cleanType = "2 Bedroom Basic";
    else if(cleanType.toUpperCase() === "1 BEDROOM" || cleanType === "1 Bedroom") cleanType = "1 Bedroom";

    // Determine specific phase based on type
    let specificPhase = "Phase 5";
    if (cleanType === "1 Bedroom") specificPhase = "Phase 5 - 1 Bedroom";
    else if (cleanType === "2 Bedroom Basic") specificPhase = "Phase 5 - 2 Bedroom Basic";
    else if (cleanType === "2 Bedroom Maxi") specificPhase = "Phase 5 - 2 Bedroom Maxi";

    return {
      id: createId('maben-p5', sn),
      serialNumber: sn,
      name: name,
      landlord: landlord,
      email: "",
      phoneNumber: "",
      flatType: cleanType,
      block: block,
      flatNumber: flat,
      tenor: "1 Year",
      phase: specificPhase,
      rentExpected: due,
      rentPaid: paid,
      outstandingBalance: outstanding,
      rentStartDate: startDate,
      rentDueDate: dueDate,
      lastPaymentDate: startDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      paymentHistory: []
    } as Tenant;
});

// Process Novabase Tenants
// Step 1: Process 2-Bedroom Tenants from NEW UPDATED Data (STB Leasing)
const novabase2BedTenants: Tenant[] = NOVABASE_2BED_UPDATED.map(t => {
    const startDate = parseDate(t.start);
    const dueDate = parseDate(t.end);
    const daysLeft = calculateDaysLeft(dueDate);
    const outstanding = t.due - t.paid;
    
    return {
      id: createId('nova-2b-new', t.sn),
      serialNumber: t.sn,
      name: t.name,
      landlord: t.landlord, 
      email: "",
      phoneNumber: "",
      flatType: "2 Bedrooms",
      block: t.block,
      flatNumber: t.flat,
      tenor: "1 Year",
      phase: "Nova Cluster - 2 Bedroom",
      rentExpected: t.due,
      rentPaid: t.paid,
      outstandingBalance: outstanding,
      rentStartDate: startDate,
      rentDueDate: dueDate,
      lastPaymentDate: startDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      paymentHistory: []
    } as Tenant;
});

// Step 2: Process 1-Bedroom Tenants from NEW UPDATED Data (STB Leasing)
const novabase1BedTenants: Tenant[] = NOVABASE_1BED_UPDATED.map(t => {
    const startDate = parseDate(t.start);
    const dueDate = parseDate(t.end);
    const daysLeft = calculateDaysLeft(dueDate);
    const outstanding = t.due - t.paid;

    return {
      id: createId('nova-1b-new', t.sn),
      serialNumber: t.sn,
      name: t.name,
      landlord: t.landlord, // "STB Leasing Limited"
      email: "",
      phoneNumber: "",
      flatType: t.type,
      block: t.block,
      flatNumber: t.flat,
      tenor: "1 Year",
      phase: "Nova Cluster - 1 Bedroom",
      rentExpected: t.due,
      rentPaid: t.paid,
      outstandingBalance: outstanding,
      rentStartDate: startDate,
      rentDueDate: dueDate,
      lastPaymentDate: startDate,
      daysLeft: daysLeft,
      status: daysLeft < 0 ? 'Overdue' : 'Active',
      paymentHistory: []
    } as Tenant;
});

// Combine Novabase Tenants
const novabaseTenants: Tenant[] = [...novabase2BedTenants, ...novabase1BedTenants];

// Process Alperton Tenants
const alpertonTenants: Tenant[] = ALPERTON_RAW.map(t => {
  const startDate = parseDate(t.start);
  const dueDate = parseDate(t.end);
  const daysLeft = calculateDaysLeft(dueDate);
  const outstanding = t.due - t.paid;
  
  return {
    id: createId('alperton', t.sn),
    serialNumber: t.sn,
    name: t.name,
    landlord: t.landlord,
    email: "",
    phoneNumber: "",
    flatType: "Standard Flat", // Defaulting as PDF didn't specify
    block: t.block,
    flatNumber: t.flat,
    tenor: "1 Year",
    phase: "Phase 1",
    rentExpected: t.due,
    rentPaid: t.paid,
    outstandingBalance: outstanding,
    rentStartDate: startDate,
    rentDueDate: dueDate,
    lastPaymentDate: startDate,
    daysLeft: daysLeft,
    status: daysLeft < 0 ? 'Overdue' : 'Active',
    paymentHistory: []
  } as Tenant;
});

// Calculate Totals for Estates
const calcTotals = (tenants: Tenant[]) => {
  const expected = tenants.reduce((acc, t) => acc + t.rentExpected, 0);
  const actual = tenants.reduce((acc, t) => acc + t.rentPaid, 0);
  return {
    totalExpected: expected,
    totalActual: actual,
    totalOutstanding: expected - actual,
    occupancyRate: tenants.length > 0 ? 98 : 0
  };
};

const mabenPhase1Totals = calcTotals(mabenPhase1Tenants);
const mabenPhase5Totals = calcTotals(mabenPhase5Tenants);
const novabaseTotals = calcTotals(novabaseTenants);
const alpertonTotals = calcTotals(alpertonTenants);

// --- EXPORTED MOCK DATA ---
export const MOCK_ESTATES: Estate[] = [
  {
    id: 'est-1',
    name: 'Maben Flats Estate Phase 1',
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=1000&auto=format&fit=crop',
    manager: 'Mr. Johnson',
    tenants: mabenPhase1Tenants,
    ...mabenPhase1Totals,
    phases: [
        "Phase 1 - 1 Bedroom",
        "Phase 1 - 2 Bedroom"
    ],
  },
  {
    id: 'est-2',
    name: 'Novabase Estate',
    imageUrl: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=1000&auto=format&fit=crop',
    manager: 'Mrs. Peters',
    tenants: novabaseTenants,
    ...novabaseTotals,
    phases: [
      "Nova Cluster - 1 Bedroom", 
      "Nova Cluster - 2 Bedroom"
    ],
  },
  // Empty Placeholders for other estates
  {
    id: 'est-3',
    name: 'Pullman Apartments',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
    manager: 'Mr. David',
    tenants: [],
    totalExpected: 0,
    totalActual: 0,
    totalOutstanding: 0,
    occupancyRate: 0,
    phases: ["Phase 1"],
  },
  {
    id: 'est-4',
    name: 'Maben Flat Estate Phase 5',
    imageUrl: 'https://pixabay.com/get/g68b57986c8cff1a94a72a1a280c2014c80ea1bc18d81c7a96aa541cc2789474799ba5c4fb77640ace194ed1919fec3d5cd85200946886db39d6a4674fc0e27340cf7bc91193e60e18e3d4eae3530c252_1280.jpg?attachment=',
    manager: 'Mr. Johnson',
    tenants: mabenPhase5Tenants,
    ...mabenPhase5Totals,
    phases: [
        "Phase 5 - 1 Bedroom",
        "Phase 5 - 2 Bedroom Basic",
        "Phase 5 - 2 Bedroom Maxi"
    ],
  },
  {
    id: 'est-5',
    name: 'Keffi Suites',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1000',
    manager: 'Ms. Sarah',
    tenants: [],
    totalExpected: 0,
    totalActual: 0,
    totalOutstanding: 0,
    occupancyRate: 0,
    phases: [],
  },
  {
    id: 'est-6',
    name: 'Alperton Residence',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000',
    manager: 'Mr. James',
    tenants: alpertonTenants,
    ...alpertonTotals,
    phases: ["Phase 1"],
  },
  {
    id: 'est-7',
    name: 'Western Foreshore',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    manager: 'Mrs. Igwe',
    tenants: [],
    totalExpected: 0,
    totalActual: 0,
    totalOutstanding: 0,
    occupancyRate: 0,
    phases: [],
  }
];

export const generateMockTenants = (estates: Estate[]): Estate[] => {
  return estates; 
};

export const calculateMetrics = (estates: Estate[]): DashboardMetrics => {
  const totalProperties = estates.reduce((acc, estate) => acc + estate.tenants.length, 0);
  const totalExpectedRent = estates.reduce((acc, estate) => acc + estate.totalExpected, 0);
  const totalRentPaid = estates.reduce((acc, estate) => acc + estate.totalActual, 0);
  const totalOutstanding = estates.reduce((acc, estate) => acc + estate.totalOutstanding, 0);

  return {
    totalProperties,
    totalExpectedRent,
    totalRentPaid,
    totalOutstanding
  };
};
