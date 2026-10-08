// MediUnify Lab Patients Master Records & Directory

export const INITIAL_LAB_PATIENTS = [
  {
    id: "PAT-1001",
    uhid: "MU-UHID-8821",
    name: "Rahul Kumar",
    age: 38,
    gender: "Male",
    phone: "+91 98450 12345",
    email: "rahul.kumar@gmail.com",
    bloodGroup: "O+",
    address: "#42, 3rd Cross, Saraswathipuram, Mysuru",
    pincode: "570009",
    cohortTags: ["Diabetic Care", "Home Regular"],
    conditions: ["Type-2 Diabetes Mellitus", "Hypertension"],
    clinicalAlerts: "Requires 10-12 hrs fasting prior to sample collection. Fast vein collapse - use 23G needle.",
    emergencyContact: {
      name: "Sunita Kumar (Wife)",
      phone: "+91 98450 67890",
      relation: "Spouse"
    },
    preferredCenter: "Kuvempunagar Diagnostic Center",
    registrationDate: "12-Jan-2025",
    totalVisits: 6,
    totalSpent: 14850,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1001",
        date: "Today, 08:30 AM",
        type: "Home Collection",
        testSummary: "Popular Checkup (Comprehensive Health - 72 Parameters)",
        amount: 2499,
        paymentStatus: "Paid",
        orderStatus: "NEW"
      },
      {
        orderId: "LAB-0942",
        date: "14-Feb-2026",
        type: "Walk-in Center",
        testSummary: "HbA1c & Fasting Blood Sugar",
        amount: 850,
        paymentStatus: "Paid",
        orderStatus: "COMPLETED"
      }
    ]
  },
  {
    id: "PAT-1002",
    uhid: "MU-UHID-8845",
    name: "Anita Deshmukh",
    age: 45,
    gender: "Female",
    phone: "+91 98860 98765",
    email: "anita.deshmukh@yahoo.com",
    bloodGroup: "B+",
    address: "#108, 5th Main, Kuvempunagar, Mysuru",
    pincode: "570023",
    cohortTags: ["Senior / Pre-senior", "Thyroid Cohort"],
    conditions: ["Hypothyroidism", "Dyslipidemia"],
    clinicalAlerts: "Thyroid meds to be skipped on morning of blood draw until sample taken.",
    emergencyContact: {
      name: "Rajesh Deshmukh (Husband)",
      phone: "+91 98860 11223",
      relation: "Spouse"
    },
    preferredCenter: "Kuvempunagar Diagnostic Center",
    registrationDate: "03-Nov-2024",
    totalVisits: 4,
    totalSpent: 9200,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1002",
        date: "Today, 09:15 AM",
        type: "Walk-in Center",
        testSummary: "Curated Checkup (Full Body Package with ECG & USG)",
        amount: 4999,
        paymentStatus: "Paid",
        orderStatus: "PENDING VERIFICATION"
      }
    ]
  },
  {
    id: "PAT-1003",
    uhid: "MU-UHID-8902",
    name: "Venkatraman Iyer",
    age: 62,
    gender: "Male",
    phone: "+91 94480 34567",
    email: "viyer.mys@gmail.com",
    bloodGroup: "A+",
    address: "#88, Kalidasa Road, Jayalakshmipuram, Mysuru",
    pincode: "570012",
    cohortTags: ["Senior Citizen", "Cardiac Care", "VIP Patient"],
    conditions: ["Coronary Artery Disease", "Hyperuricemia", "Mild Renal Impairment"],
    clinicalAlerts: "Senior citizen home collection priority. Always dispatch experienced phlebotomist.",
    emergencyContact: {
      name: "Lakshmi Iyer (Daughter)",
      phone: "+91 94480 99887",
      relation: "Daughter"
    },
    preferredCenter: "Central Diagnostic Hub (Mysuru)",
    registrationDate: "19-Aug-2024",
    totalVisits: 9,
    totalSpent: 28500,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1003",
        date: "Today, 07:45 AM",
        type: "Home Collection",
        testSummary: "Cardiac & Lipid Panel (ECG + hs-CRP + Lipid Profile)",
        amount: 2150,
        paymentStatus: "Pending",
        orderStatus: "COLLECTION SCHEDULED"
      }
    ]
  },
  {
    id: "PAT-1004",
    uhid: "MU-UHID-8919",
    name: "Meenakshi S.",
    age: 29,
    gender: "Female",
    phone: "+91 97410 56789",
    email: "meenakshi.s@outlook.com",
    bloodGroup: "O-",
    address: "#12/A, 1st Cross, Vijayanagar 2nd Stage, Mysuru",
    pincode: "570017",
    cohortTags: ["Maternal & Women Care", "Anemia Cohort"],
    conditions: ["Iron Deficiency Anemia", "Vitamin D Deficiency"],
    clinicalAlerts: "Rare blood group (O-Negative). Keep record updated.",
    emergencyContact: {
      name: "Srinivas (Father)",
      phone: "+91 97410 44332",
      relation: "Father"
    },
    preferredCenter: "Vijayanagar Diagnostic Center",
    registrationDate: "05-Jan-2025",
    totalVisits: 3,
    totalSpent: 6400,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1009",
        date: "Yesterday, 11:30 AM",
        type: "Walk-in Center",
        testSummary: "Anemia & Vitamin Profile (CBC, Ferritin, Vit B12, Vit D3)",
        amount: 2800,
        paymentStatus: "Paid",
        orderStatus: "REPORT READY"
      }
    ]
  },
  {
    id: "PAT-1005",
    uhid: "MU-UHID-8950",
    name: "Suresh Patil",
    age: 52,
    gender: "Male",
    phone: "+91 99000 87654",
    email: "suresh.patil@rediffmail.com",
    bloodGroup: "AB+",
    address: "#240, Temple Road, Gokulam 3rd Stage, Mysuru",
    pincode: "570002",
    cohortTags: ["Corporate Executive", "Routine Checkup"],
    conditions: ["Non-Alcoholic Fatty Liver (NAFLD)", "Mild Obesity"],
    clinicalAlerts: "Ultrasound Abdomen fasting rule (6 hrs water sip only).",
    emergencyContact: {
      name: "Rekha Patil (Wife)",
      phone: "+91 99000 33221",
      relation: "Spouse"
    },
    preferredCenter: "Central Diagnostic Hub (Mysuru)",
    registrationDate: "14-Dec-2024",
    totalVisits: 5,
    totalSpent: 18200,
    outstandingDue: 500,
    recentOrders: [
      {
        orderId: "LAB-1005",
        date: "Today, 06:15 AM",
        type: "Home Collection",
        testSummary: "Comprehensive Liver & Renal Health Screen (LFT + KFT + USG)",
        amount: 3200,
        paymentStatus: "Partial",
        orderStatus: "SAMPLE RECEIVED"
      }
    ]
  },
  {
    id: "PAT-1006",
    uhid: "MU-UHID-8988",
    name: "Farida Banu",
    age: 34,
    gender: "Female",
    phone: "+91 96110 43210",
    email: "farida.banu@gmail.com",
    bloodGroup: "B+",
    address: "#77, Sayyaji Rao Road, Mandi Mohalla, Mysuru",
    pincode: "570021",
    cohortTags: ["Fever / Infectious Panel", "Routine"],
    conditions: ["Acute Febrile Illness", "Suspected Dengue"],
    clinicalAlerts: "Stat reporting requested by referring physician. Urgent platelet & NS1 antigen.",
    emergencyContact: {
      name: "Mohammed Rafi (Husband)",
      phone: "+91 96110 88776",
      relation: "Spouse"
    },
    preferredCenter: "Central Diagnostic Hub (Mysuru)",
    registrationDate: "28-Feb-2026",
    totalVisits: 2,
    totalSpent: 3100,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1006",
        date: "Today, 10:00 AM",
        type: "Walk-in Center",
        testSummary: "Dengue Duo (NS1 + IgM/IgG) & CBC Platelet Count",
        amount: 1450,
        paymentStatus: "Paid",
        orderStatus: "PROCESSING"
      }
    ]
  },
  {
    id: "PAT-1007",
    uhid: "MU-UHID-9012",
    name: "Priya Sharma",
    age: 26,
    gender: "Female",
    phone: "+91 95350 78901",
    email: "priya.sharma@techfirm.com",
    bloodGroup: "O+",
    address: "#501, Prestige Palms, Hebbal Industrial Area, Mysuru",
    pincode: "570016",
    cohortTags: ["Corporate Health", "Annual Screen"],
    conditions: ["Allergic Rhinitis"],
    clinicalAlerts: "Total IgE allergen sensitivity monitoring.",
    emergencyContact: {
      name: "Alok Sharma (Brother)",
      phone: "+91 95350 11998",
      relation: "Sibling"
    },
    preferredCenter: "Vijayanagar Diagnostic Center",
    registrationDate: "10-Feb-2026",
    totalVisits: 1,
    totalSpent: 2199,
    outstandingDue: 0,
    recentOrders: [
      {
        orderId: "LAB-1007",
        date: "Today, 11:20 AM",
        type: "Walk-in Center",
        testSummary: "Popular Checkup (Basic Wellness Screening - 45 Parameters)",
        amount: 1499,
        paymentStatus: "Paid",
        orderStatus: "SAMPLE COLLECTED"
      }
    ]
  }
];
