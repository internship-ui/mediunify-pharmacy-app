// MediUnify Lab Operational Orders Mock Data
// Realistic operational data covering all 12 order statuses and workflows

export const INITIAL_ORDERS = [
  {
    id: "LAB-1001",
    bookingDate: "Today, 06:45 AM",
    preferredDate: "Today",
    preferredTime: "07:30 AM - 08:30 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "NEW",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI (GooglePay · Ref #UPI9842190)",
    totalAmount: 2999,
    discountAmount: 500,
    itemType: "Package",
    packageCode: "POP-EXE-01",
    itemTitle: "Novus Executive Essentials",
    category: "Executive Health Checkup",
    patient: {
      id: "PID-4821",
      name: "Rahul Kumar",
      age: 42,
      gender: "Male",
      phone: "+91 98451 99201",
      email: "rahul.kumar@techcorp.in",
      address: "Villa 14, Brigade Symphony, Railway Layout, Mysuru - 570020",
      bloodGroup: "B +ve",
      emergencyContact: "Anitha (Wife) · +91 98451 99202"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-TFT",
      "TEST-URINE-RM",
      "TEST-ECG-12",
      "TEST-USG-ABD-PELVIS"
    ],
    assignedStaff: null,
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "07:30 AM - 08:30 AM",
      notes: "Doorbell #14, Ground Floor. Patient is fasting."
    },
    samples: [
      {
        sampleId: "SMP-2001",
        sampleType: "Blood (EDTA)",
        tubeContainer: "EDTA Tube (Purple Top - 3ml)",
        barcode: "BAR-EDTA-8801",
        collectionStaff: "Unassigned",
        collectionTime: "Pending",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Ambient (Cold Box)",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2002",
        sampleType: "Blood (Fluoride)",
        tubeContainer: "Sodium Fluoride Tube (Grey Top - 2ml)",
        barcode: "BAR-FLR-8802",
        collectionStaff: "Unassigned",
        collectionTime: "Pending",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Ambient",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2003",
        sampleType: "Blood (SST / Gel)",
        tubeContainer: "SST / Gel Tube (Yellow Top - 4ml x 2)",
        barcode: "BAR-SST-8803",
        collectionStaff: "Unassigned",
        collectionTime: "Pending",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Cold-chain (2-8°C)",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2004",
        sampleType: "Urine",
        tubeContainer: "Sterile Urine Container (Yellow Cap 50ml)",
        barcode: "BAR-URN-8804",
        collectionStaff: "Unassigned",
        collectionTime: "Pending",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Ambient",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3001",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Today, 06:45 AM",
        responsiblePerson: "System / Patient App",
        notes: "Patient booked Novus Executive Essentials package with Home Sample Collection request."
      }
    ]
  },
  {
    id: "LAB-1002",
    bookingDate: "Today, 06:15 AM",
    preferredDate: "Today",
    preferredTime: "07:00 AM - 08:00 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "PENDING VERIFICATION",
    centerId: "CTR-MYS-02",
    centerName: "Novus Diagnostic Center (Kuvempunagar)",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card (HDFC Master)",
    totalAmount: 2199,
    discountAmount: 300,
    itemType: "Package",
    packageCode: "CUR-LSW-01",
    itemTitle: "Novus Vitamin & Nutrition Profile",
    category: "Lifestyle & Wellness",
    patient: {
      id: "PID-4822",
      name: "Ananya Sharma",
      age: 29,
      gender: "Female",
      phone: "+91 98452 77112",
      email: "ananya.sharma@healthmail.com",
      address: "Flat 302, Green View Apartments, 8th Cross, Kuvempunagar, Mysuru - 570023",
      bloodGroup: "O +ve",
      emergencyContact: "Vikram (Brother) · +91 98452 77119"
    },
    testIds: [
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-CALCIUM",
      "TEST-MAGNESIUM",
      "TEST-FERRITIN",
      "TEST-IRON-PROFILE"
    ],
    assignedStaff: null,
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "07:00 AM - 08:00 AM",
      notes: "Check if patient stopped multivitamin supplements 48h prior."
    },
    samples: [
      {
        sampleId: "SMP-2005",
        sampleType: "Blood (SST / Gel)",
        tubeContainer: "SST / Gel Tube (Yellow Top - 4ml x 2)",
        barcode: "BAR-SST-8805",
        collectionStaff: "Unassigned",
        collectionTime: "Pending",
        center: "Novus Kuvempunagar Center",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Cold-chain (2-8°C)",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3002",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Today, 06:15 AM",
        responsiblePerson: "System / Patient Web",
        notes: "Online booking received."
      },
      {
        status: "PENDING VERIFICATION",
        timestamp: "Today, 06:20 AM",
        responsiblePerson: "Duty Operator (Sunil K.)",
        notes: "Awaiting clinical team verification for vitamin prep adherence."
      }
    ]
  },
  {
    id: "LAB-1003",
    bookingDate: "Today, 05:30 AM",
    preferredDate: "Today",
    preferredTime: "06:30 AM - 07:30 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "VERIFIED",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI (Paytm)",
    totalAmount: 1499,
    discountAmount: 0,
    itemType: "Package",
    packageCode: "POP-BAS-01",
    itemTitle: "Novus Essential Full Body Health",
    category: "Full Body Wellness",
    patient: {
      id: "PID-4823",
      name: "Arjun Rao",
      age: 36,
      gender: "Male",
      phone: "+91 98801 44521",
      email: "arjun.rao@startup.co",
      address: "#120, 5th Main, Jayalakshmipuram, Mysuru - 570012",
      bloodGroup: "A +ve",
      emergencyContact: "Sandhya · +91 98801 44522"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-URINE-RM"
    ],
    assignedStaff: null,
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "06:30 AM - 07:30 AM",
      notes: "Fasting 10 hours confirmed by patient over IVR."
    },
    samples: [
      {
        sampleId: "SMP-2006",
        sampleType: "Blood (EDTA, Fluoride, SST)",
        tubeContainer: "EDTA (Purple) + Fluoride (Grey) + SST (Yellow)",
        barcode: "BAR-SMP-8806",
        collectionStaff: "Pending Staff Assignment",
        collectionTime: "Scheduled 07:00 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Ambient / Cold",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2007",
        sampleType: "Urine",
        tubeContainer: "Sterile Urine Container (Yellow Cap 50ml)",
        barcode: "BAR-URN-8807",
        collectionStaff: "Pending Staff Assignment",
        collectionTime: "Scheduled 07:00 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PENDING COLLECTION",
        temperature: "Ambient",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3003",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Today, 05:30 AM",
        responsiblePerson: "System",
        notes: "Direct booking."
      },
      {
        status: "VERIFIED",
        timestamp: "Today, 05:45 AM",
        responsiblePerson: "Dr. Arvind Rao (Medical Officer)",
        notes: "Clinical test prescription & fasting eligibility verified. Ready for phlebotomist dispatch."
      }
    ]
  },
  {
    id: "LAB-1004",
    bookingDate: "Yesterday, 08:30 PM",
    preferredDate: "Today",
    preferredTime: "07:00 AM - 08:00 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "COLLECTION SCHEDULED",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    totalAmount: 2499,
    discountAmount: 200,
    itemType: "Package",
    packageCode: "CUR-LSW-02",
    itemTitle: "Novus Hair Fall & Scalp Health Assessment",
    category: "Lifestyle & Wellness",
    patient: {
      id: "PID-4824",
      name: "Priya Nair",
      age: 26,
      gender: "Female",
      phone: "+91 97311 88990",
      email: "priya.nair@designstudio.in",
      address: "House 55, 3rd Stage, Gokulam, Mysuru - 570002",
      bloodGroup: "B -ve",
      emergencyContact: "Nair Sr. · +91 97311 88991"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FERRITIN",
      "TEST-IRON-PROFILE",
      "TEST-TFT",
      "TEST-VIT-D",
      "TEST-VIT-B12"
    ],
    assignedStaff: {
      staffId: "PHL-101",
      name: "Mahesh Gowda",
      phone: "+91 98450 12345",
      vehicleType: "Electric Scooter (Cold Box #04)"
    },
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "07:30 AM",
      notes: "Phlebotomist en route. Cold box carrying temperature 4.2°C verified."
    },
    samples: [
      {
        sampleId: "SMP-2008",
        sampleType: "Blood (EDTA & SST)",
        tubeContainer: "EDTA (Purple Top) + SST (Yellow Top x 2)",
        barcode: "BAR-SMP-8808",
        collectionStaff: "Mahesh Gowda (PHL-101)",
        collectionTime: "Estimated 07:35 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "ASSIGNED",
        temperature: "Cold-chain (2-8°C)",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3004",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Yesterday, 08:30 PM",
        responsiblePerson: "System",
        notes: "Booking created."
      },
      {
        status: "VERIFIED",
        timestamp: "Yesterday, 09:00 PM",
        responsiblePerson: "Admin Team",
        notes: "Order verified."
      },
      {
        status: "COLLECTION SCHEDULED",
        timestamp: "Today, 06:30 AM",
        responsiblePerson: "Fleet Coordinator (Satish)",
        notes: "Assigned phlebotomist Mahesh Gowda. Route optimized for Gokulam zone."
      }
    ]
  },
  {
    id: "LAB-1005",
    bookingDate: "Yesterday, 06:00 PM",
    preferredDate: "Today",
    preferredTime: "06:30 AM - 07:30 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "SAMPLE COLLECTED",
    centerId: "CTR-MYS-02",
    centerName: "Novus Diagnostic Center (Kuvempunagar)",
    paymentStatus: "Paid",
    paymentMethod: "UPI (PhonePe)",
    totalAmount: 1799,
    discountAmount: 0,
    itemType: "Package",
    packageCode: "POP-DIA-01",
    itemTitle: "Novus Diabetes Master Care & Organ Impact",
    category: "Diabetic Master Care",
    patient: {
      id: "PID-4825",
      name: "Sneha Gowda",
      age: 52,
      gender: "Female",
      phone: "+91 99002 11440",
      email: "sneha.gowda@mysoreedu.ac.in",
      address: "#44, 2nd Main, Vivekanandanagar, Mysuru - 570023",
      bloodGroup: "O +ve",
      emergencyContact: "Gowda · +91 99002 11449"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-PPBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-KFT",
      "TEST-URINE-RM"
    ],
    assignedStaff: {
      staffId: "PHL-102",
      name: "Pooja Shankar",
      phone: "+91 98452 33445",
      vehicleType: "Two-Wheeler (Cold Box #11)"
    },
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "06:45 AM",
      notes: "FBS collected at 06:45 AM. Patient will give PPBS at Kuvempunagar center or at home after 2 hrs."
    },
    samples: [
      {
        sampleId: "SMP-2009",
        sampleType: "Blood (EDTA, Fluoride, SST)",
        tubeContainer: "EDTA (Purple) + Fluoride (Grey) + SST (Yellow)",
        barcode: "BAR-SMP-8809",
        collectionStaff: "Pooja Shankar (PHL-102)",
        collectionTime: "Today, 06:50 AM",
        center: "Novus Kuvempunagar Center",
        sampleStatus: "COLLECTED",
        temperature: "Cold-chain (4.1°C)",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2010",
        sampleType: "Urine",
        tubeContainer: "Sterile Urine Container (Yellow Cap 50ml)",
        barcode: "BAR-URN-8810",
        collectionStaff: "Pooja Shankar (PHL-102)",
        collectionTime: "Today, 06:52 AM",
        center: "Novus Kuvempunagar Center",
        sampleStatus: "COLLECTED",
        temperature: "Ambient",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3005",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Yesterday, 06:00 PM",
        responsiblePerson: "System",
        notes: "Booking logged."
      },
      {
        status: "VERIFIED",
        timestamp: "Yesterday, 06:30 PM",
        responsiblePerson: "Admin",
        notes: "Verified."
      },
      {
        status: "COLLECTION SCHEDULED",
        timestamp: "Today, 06:15 AM",
        responsiblePerson: "Fleet Dispatcher",
        notes: "Pooja Shankar assigned."
      },
      {
        status: "SAMPLE COLLECTED",
        timestamp: "Today, 06:52 AM",
        responsiblePerson: "Pooja Shankar (PHL-102)",
        notes: "Fasting samples collected cleanly. Barcodes scanned and sealed in transport bag."
      }
    ]
  },
  {
    id: "LAB-1006",
    bookingDate: "Today, 06:00 AM",
    preferredDate: "Today",
    preferredTime: "07:00 AM",
    bookingType: "Lab Visit",
    orderStatus: "SAMPLE RECEIVED",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "Cash at Desk",
    totalAmount: 1299,
    discountAmount: 0,
    itemType: "Package",
    packageCode: "CUR-FEV-01",
    itemTitle: "Novus Acute Fever & Monsoon Panel",
    category: "Infectious & Serology",
    patient: {
      id: "PID-4826",
      name: "Vijay Raghavan",
      age: 31,
      gender: "Male",
      phone: "+91 98440 33219",
      email: "vijay.raghavan@gmail.com",
      address: "#88, Dattagalli 3rd Stage, Mysuru - 570022",
      bloodGroup: "AB +ve",
      emergencyContact: "Manjula · +91 98440 33210"
    },
    testIds: [
      "TEST-CBC",
      "TEST-DENGUE-COMBO",
      "TEST-WIDAL",
      "TEST-URINE-RM"
    ],
    assignedStaff: {
      staffId: "PHL-CTR",
      name: "Desk Phlebotomist (Deepa N.)",
      phone: "+91 821 245 8800",
      vehicleType: "In-House Phlebotomy Station #2"
    },
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "07:00 AM Walk-In",
      notes: "Walk-in patient with high grade fever (102°F). Stat emergency barcode tagged."
    },
    samples: [
      {
        sampleId: "SMP-2011",
        sampleType: "Blood (EDTA & SST)",
        tubeContainer: "EDTA (Purple) + SST (Yellow)",
        barcode: "BAR-FEV-8811",
        collectionStaff: "Deepa N. (In-House)",
        collectionTime: "Today, 07:05 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "RECEIVED",
        temperature: "Room Temp (Processing Area)",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3006",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Not Generated",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Today, 06:00 AM",
        responsiblePerson: "Reception Desk",
        notes: "Walk-in registered."
      },
      {
        status: "VERIFIED",
        timestamp: "Today, 06:05 AM",
        responsiblePerson: "Medical Officer",
        notes: "Verified for stat fever panel."
      },
      {
        status: "SAMPLE COLLECTED",
        timestamp: "Today, 07:05 AM",
        responsiblePerson: "Deepa N.",
        notes: "Blood sample drawn in Station 2."
      },
      {
        status: "SAMPLE RECEIVED",
        timestamp: "Today, 07:12 AM",
        responsiblePerson: "Accessioning Desk (Kiran B.)",
        notes: "Sample accessioned into central pathology barcoding queue. Integrity intact, no hemolysis."
      }
    ]
  },
  {
    id: "LAB-1007",
    bookingDate: "Today, 05:00 AM",
    preferredDate: "Today",
    preferredTime: "06:00 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "PROCESSING",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    totalAmount: 3499,
    discountAmount: 0,
    itemType: "Package",
    packageCode: "POP-SNR-01",
    itemTitle: "Novus Senior Citizen Comprehensive",
    category: "Senior Citizen Care",
    patient: {
      id: "PID-4827",
      name: "S. N. Murthy",
      age: 68,
      gender: "Male",
      phone: "+91 94480 66551",
      email: "snmurthy.retd@karnataka.gov.in",
      address: "#19, 4th Main, Saraswathipuram, Mysuru - 570009",
      bloodGroup: "O -ve",
      emergencyContact: "Suma (Daughter) · +91 94480 66552"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-LFT",
      "TEST-KFT",
      "TEST-TFT",
      "TEST-URINE-RM",
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-CALCIUM",
      "TEST-ECG-12"
    ],
    assignedStaff: {
      staffId: "PHL-101",
      name: "Mahesh Gowda",
      phone: "+91 98450 12345",
      vehicleType: "Electric Scooter (Cold Box #04)"
    },
    collectionSchedule: {
      scheduledDate: "Today",
      timeSlot: "06:15 AM",
      notes: "Senior citizen. ECG portable unit carried."
    },
    samples: [
      {
        sampleId: "SMP-2012",
        sampleType: "Blood (EDTA, Fluoride, SST)",
        tubeContainer: "EDTA (Purple) + Fluoride (Grey) + SST (Yellow x 2)",
        barcode: "BAR-SMP-8812",
        collectionStaff: "Mahesh Gowda (PHL-101)",
        collectionTime: "Today, 06:20 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PROCESSING",
        temperature: "Centrifuged (3000 RPM / 10m)",
        rejectionReason: null
      },
      {
        sampleId: "SMP-2013",
        sampleType: "Urine & ECG Trace",
        tubeContainer: "Sterile Cup + ECG Digital File",
        barcode: "BAR-URN-8813",
        collectionStaff: "Mahesh Gowda (PHL-101)",
        collectionTime: "Today, 06:25 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "PROCESSING",
        temperature: "Ambient",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3007",
      reportStatus: "UNDER REVIEW",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Processing Assays",
      pdfUrl: null
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Today, 05:00 AM",
        responsiblePerson: "System",
        notes: "Booking confirmed."
      },
      {
        status: "COLLECTION SCHEDULED",
        timestamp: "Today, 05:30 AM",
        responsiblePerson: "Admin",
        notes: "Mahesh Gowda assigned."
      },
      {
        status: "SAMPLE COLLECTED",
        timestamp: "Today, 06:25 AM",
        responsiblePerson: "Mahesh Gowda",
        notes: "Samples and 12-lead ECG trace captured."
      },
      {
        status: "SAMPLE RECEIVED",
        timestamp: "Today, 06:55 AM",
        responsiblePerson: "Lab Accessioning",
        notes: "Sample received at Central Hub."
      },
      {
        status: "PROCESSING",
        timestamp: "Today, 07:15 AM",
        responsiblePerson: "Automated Roche Cobas 6000 & Beckman Coulter DxH 900",
        notes: "Samples loaded on chemistry & immunoassay analyzers."
      }
    ]
  },
  {
    id: "LAB-1008",
    bookingDate: "Yesterday, 04:00 PM",
    preferredDate: "Yesterday",
    preferredTime: "05:00 PM",
    bookingType: "Lab Visit",
    orderStatus: "REPORT PENDING",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "Debit Card",
    totalAmount: 1350,
    discountAmount: 0,
    itemType: "Package",
    packageCode: "CUR-ORG-01",
    itemTitle: "Novus Hepato-Renal Vitality Panel",
    category: "Organ Vitality",
    patient: {
      id: "PID-4828",
      name: "Ranganath Swamy",
      age: 47,
      gender: "Male",
      phone: "+91 94801 22339",
      email: "ranga.swamy@kptcl.gov.in",
      address: "#102, 1st Stage, Vijayanagar, Mysuru - 570017",
      bloodGroup: "B +ve",
      emergencyContact: "Pratibha · +91 94801 22330"
    },
    testIds: [
      "TEST-LFT",
      "TEST-KFT",
      "TEST-URINE-RM"
    ],
    assignedStaff: {
      staffId: "PHL-CTR",
      name: "In-House Phlebotomist",
      phone: "+91 821 245 8800",
      vehicleType: "Walk-in Desk"
    },
    collectionSchedule: {
      scheduledDate: "Yesterday",
      timeSlot: "05:15 PM Walk-In",
      notes: "Routine quarterly organ function review."
    },
    samples: [
      {
        sampleId: "SMP-2014",
        sampleType: "Blood (SST / Gel)",
        tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
        barcode: "BAR-SMP-8814",
        collectionStaff: "In-House Staff",
        collectionTime: "Yesterday, 05:20 PM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "COMPLETED",
        temperature: "Processed",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3008",
      reportStatus: "PENDING",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Awaiting Upload / Entry",
      pdfUrl: null
    },
    timeline: [
      {
        status: "SAMPLE RECEIVED",
        timestamp: "Yesterday, 05:30 PM",
        responsiblePerson: "Lab Accessioning",
        notes: "Accessioned."
      },
      {
        status: "PROCESSING",
        timestamp: "Yesterday, 06:00 PM",
        responsiblePerson: "Biochemistry Tech (Girish M.)",
        notes: "Assays completed on Cobas c501."
      },
      {
        status: "REPORT PENDING",
        timestamp: "Today, 06:00 AM",
        responsiblePerson: "LIS Automation",
        notes: "Assay results populated into LIS. Ready for pathologist review and digital signature."
      }
    ]
  },
  {
    id: "LAB-1009",
    bookingDate: "Yesterday, 02:30 PM",
    preferredDate: "Yesterday",
    preferredTime: "04:00 PM",
    bookingType: "Lab Visit",
    orderStatus: "REPORT READY",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    totalAmount: 3299,
    discountAmount: 200,
    itemType: "Package",
    packageCode: "POP-WMN-01",
    itemTitle: "Novus Women's Comprehensive Wellness",
    category: "Women's Wellness",
    patient: {
      id: "PID-4829",
      name: "Meenakshi Sundaram",
      age: 38,
      gender: "Female",
      phone: "+91 97410 55662",
      email: "meenakshi.s@corpbank.in",
      address: "#77, CFTRI Layout, Bogadi 2nd Stage, Mysuru - 570026",
      bloodGroup: "O +ve",
      emergencyContact: "Sundaram · +91 97410 55663"
    },
    testIds: [
      "TEST-CBC",
      "TEST-TFT",
      "TEST-IRON-PROFILE",
      "TEST-FERRITIN",
      "TEST-CALCIUM",
      "TEST-VIT-D",
      "TEST-VIT-B12",
      "TEST-URINE-RM",
      "TEST-USG-ABD-PELVIS"
    ],
    assignedStaff: null,
    collectionSchedule: {
      scheduledDate: "Yesterday",
      timeSlot: "04:00 PM Walk-In",
      notes: "USG Pelvis performed by Consultant Radiologist Dr. Shilpa."
    },
    samples: [
      {
        sampleId: "SMP-2015",
        sampleType: "Blood (EDTA & SST), Urine, USG",
        tubeContainer: "EDTA + SST + Urine Cup",
        barcode: "BAR-SMP-8815",
        collectionStaff: "In-House Phlebotomy",
        collectionTime: "Yesterday, 04:15 PM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "COMPLETED",
        temperature: "Processed",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3009",
      reportStatus: "UPLOADED",
      uploadedDate: "Today, 06:45 AM",
      verifiedBy: "Dr. Arvind Rao (MD Pathology)",
      verifiedDate: null,
      deliveryStatus: "Awaiting Final Verification",
      pdfUrl: "novus_lab_report_LAB-1009.pdf",
      parameterResults: [
        { name: "Hemoglobin", value: "11.2", range: "12.0 - 15.0", unit: "g/dL", flag: "Low" },
        { name: "Serum Ferritin", value: "8.4", range: "15 - 150", unit: "ng/mL", flag: "Low (Iron Depletion)" },
        { name: "TSH Ultrasensitive", value: "5.82", range: "0.35 - 4.94", unit: "uIU/mL", flag: "Elevated (Subclinical Hypothyroid)" },
        { name: "25-OH Vitamin D", value: "14.2", range: "30 - 100", unit: "ng/mL", flag: "Deficient" },
        { name: "Vitamin B12", value: "185", range: "200 - 900", unit: "pg/mL", flag: "Low" },
        { name: "USG Pelvis", value: "Normal uterus & adnexa", range: "Normal", unit: "", flag: "Normal" }
      ]
    },
    timeline: [
      {
        status: "PROCESSING",
        timestamp: "Yesterday, 06:00 PM",
        responsiblePerson: "Pathology Department",
        notes: "Chemiluminescence assays concluded."
      },
      {
        status: "REPORT READY",
        timestamp: "Today, 06:45 AM",
        responsiblePerson: "Senior Lab Technician",
        notes: "Full diagnostic PDF compiled and uploaded. Ready for consulting pathologist sign-off."
      }
    ]
  },
  {
    id: "LAB-1010",
    bookingDate: "Yesterday, 11:00 AM",
    preferredDate: "Yesterday",
    preferredTime: "12:00 PM",
    bookingType: "Lab Visit",
    orderStatus: "VERIFIED REPORT",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    totalAmount: 450,
    discountAmount: 0,
    itemType: "Individual Test",
    packageCode: "IND-HBA1C",
    itemTitle: "Glycosylated Hemoglobin (HbA1c)",
    category: "Biochemistry & Diabetes",
    patient: {
      id: "PID-4830",
      name: "Kishore Chandran",
      age: 58,
      gender: "Male",
      phone: "+91 98800 12903",
      email: "kishore.c@yahoo.com",
      address: "#22, 7th Main, Vontikoppal, Mysuru - 570002",
      bloodGroup: "A +ve",
      emergencyContact: "Geetha · +91 98800 12904"
    },
    testIds: ["TEST-HBA1C"],
    assignedStaff: null,
    collectionSchedule: {
      scheduledDate: "Yesterday",
      timeSlot: "12:15 PM Walk-In",
      notes: "Follow-up diabetic review."
    },
    samples: [
      {
        sampleId: "SMP-2016",
        sampleType: "Blood (EDTA)",
        tubeContainer: "EDTA (Purple Top - 3ml)",
        barcode: "BAR-SMP-8816",
        collectionStaff: "In-House Phlebotomy",
        collectionTime: "Yesterday, 12:20 PM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "COMPLETED",
        temperature: "Processed",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3010",
      reportStatus: "VERIFIED",
      uploadedDate: "Yesterday, 04:00 PM",
      verifiedBy: "Dr. Arvind Rao (MD Pathology)",
      verifiedDate: "Yesterday, 05:30 PM",
      deliveryStatus: "Verified · Ready for Dispatch",
      pdfUrl: "novus_lab_report_LAB-1010.pdf",
      notes: "HbA1c of 7.1% indicates fair to moderate glycemic control. Clinical correlation advised.",
      parameterResults: [
        { name: "HbA1c", value: "7.1", range: "< 5.7 (Normal), 5.7-6.4 (Prediabetes), >=6.5 (Diabetes)", unit: "%", flag: "Elevated" },
        { name: "Estimated Average Glucose (eAG)", value: "157", range: "90 - 120", unit: "mg/dL", flag: "Elevated" }
      ]
    },
    timeline: [
      {
        status: "PROCESSING",
        timestamp: "Yesterday, 01:00 PM",
        responsiblePerson: "HPLC Unit (Bio-Rad D-10)",
        notes: "HPLC assay completed."
      },
      {
        status: "REPORT READY",
        timestamp: "Yesterday, 04:00 PM",
        responsiblePerson: "Lab Tech",
        notes: "Report generated."
      },
      {
        status: "VERIFIED REPORT",
        timestamp: "Yesterday, 05:30 PM",
        responsiblePerson: "Dr. Arvind Rao (MD Pathology)",
        notes: "Clinical report verified and digitally signed. Quality control checks passed."
      }
    ]
  },
  {
    id: "LAB-1011",
    bookingDate: "Yesterday, 09:00 AM",
    preferredDate: "Yesterday",
    preferredTime: "10:00 AM",
    bookingType: "Home Sample Collection",
    orderStatus: "COMPLETED",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Paid",
    paymentMethod: "UPI (GooglePay)",
    totalAmount: 2199,
    discountAmount: 200,
    itemType: "Package",
    packageCode: "POP-CRD-01",
    itemTitle: "Novus Cardio-Metabolic Wellness",
    category: "Cardiac Wellness",
    patient: {
      id: "PID-4831",
      name: "Sanjay Hegde",
      age: 49,
      gender: "Male",
      phone: "+91 94481 99011",
      email: "sanjay.hegde@infosys.com",
      address: "House 304, Royal Palms, Hebbal 1st Stage, Mysuru - 570016",
      bloodGroup: "B +ve",
      emergencyContact: "Anita Hegde · +91 94481 99012"
    },
    testIds: [
      "TEST-CBC",
      "TEST-FBS",
      "TEST-HBA1C",
      "TEST-LIPID",
      "TEST-HS-CRP",
      "TEST-KFT",
      "TEST-ECG-12"
    ],
    assignedStaff: {
      staffId: "PHL-104",
      name: "Anand Kumar M.",
      phone: "+91 99002 88192",
      vehicleType: "Two-Wheeler (Cold Box #02)"
    },
    collectionSchedule: {
      scheduledDate: "Yesterday",
      timeSlot: "10:15 AM",
      notes: "Home collection completed."
    },
    samples: [
      {
        sampleId: "SMP-2017",
        sampleType: "Blood & ECG",
        tubeContainer: "EDTA + Fluoride + SST + 12-Lead ECG",
        barcode: "BAR-SMP-8817",
        collectionStaff: "Anand Kumar M. (PHL-104)",
        collectionTime: "Yesterday, 10:20 AM",
        center: "Novus Mysuru Central Hub",
        sampleStatus: "COMPLETED",
        temperature: "Processed",
        rejectionReason: null
      }
    ],
    report: {
      reportId: "RPT-3011",
      reportStatus: "DELIVERED",
      uploadedDate: "Yesterday, 04:30 PM",
      verifiedBy: "Dr. Arvind Rao (MD Pathology)",
      verifiedDate: "Yesterday, 06:15 PM",
      deliveryStatus: "Delivered via WhatsApp & SMS",
      pdfUrl: "novus_lab_report_LAB-1011.pdf",
      notes: "Mild dyslipidemia with elevated LDL (142 mg/dL) and borderline hs-CRP (2.1 mg/L). Normal ECG.",
      parameterResults: [
        { name: "Total Cholesterol", value: "218", range: "< 200", unit: "mg/dL", flag: "Borderline High" },
        { name: "LDL Cholesterol", value: "142", range: "< 100", unit: "mg/dL", flag: "High" },
        { name: "Triglycerides", value: "168", range: "< 150", unit: "mg/dL", flag: "Borderline High" },
        { name: "hs-CRP", value: "2.1", range: "< 1.0", unit: "mg/L", flag: "Average Cardiac Risk" },
        { name: "12-Lead ECG", value: "Normal sinus rhythm (HR 72 bpm)", range: "Normal", unit: "", flag: "Normal" }
      ]
    },
    timeline: [
      {
        status: "NEW",
        timestamp: "Yesterday, 09:00 AM",
        responsiblePerson: "Patient App",
        notes: "Order placed."
      },
      {
        status: "SAMPLE COLLECTED",
        timestamp: "Yesterday, 10:25 AM",
        responsiblePerson: "Anand Kumar M.",
        notes: "Samples and trace acquired."
      },
      {
        status: "VERIFIED REPORT",
        timestamp: "Yesterday, 06:15 PM",
        responsiblePerson: "Dr. Arvind Rao",
        notes: "Report approved."
      },
      {
        status: "COMPLETED",
        timestamp: "Yesterday, 06:30 PM",
        responsiblePerson: "Automated Dispatch Service",
        notes: "NABL-accredited PDF report dispatched directly to patient WhatsApp and SMS download link."
      }
    ]
  },
  {
    id: "LAB-1012",
    bookingDate: "Yesterday, 01:00 PM",
    preferredDate: "Yesterday",
    preferredTime: "02:00 PM",
    bookingType: "Home Sample Collection",
    orderStatus: "CANCELLED",
    centerId: "CTR-MYS-01",
    centerName: "Novus Mysuru Central Diagnostic & Reference Hub",
    paymentStatus: "Refunded",
    paymentMethod: "UPI (Refund #REF881290)",
    totalAmount: 1200,
    discountAmount: 0,
    itemType: "Individual Test",
    packageCode: "IND-VIT-D",
    itemTitle: "Vitamin D – 25 Hydroxy (25-OH)",
    category: "Vitamins & Micronutrients",
    patient: {
      id: "PID-4832",
      name: "Harish Murthy",
      age: 44,
      gender: "Male",
      phone: "+91 98455 10992",
      email: "harish.m@gmail.com",
      address: "#501, Prestige Heights, Chamundi Hill Road, Mysuru - 570010",
      bloodGroup: "O +ve",
      emergencyContact: "Murthy · +91 98455 10993"
    },
    testIds: ["TEST-VIT-D"],
    assignedStaff: null,
    collectionSchedule: null,
    samples: [],
    report: {
      reportId: "RPT-3012",
      reportStatus: "REJECTED",
      uploadedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      deliveryStatus: "Order Cancelled",
      pdfUrl: null
    },
    cancellationReason: "Patient travelled out of town for emergency family work. 100% refund initiated to source UPI account.",
    timeline: [
      {
        status: "NEW",
        timestamp: "Yesterday, 01:00 PM",
        responsiblePerson: "Patient App",
        notes: "Order placed."
      },
      {
        status: "CANCELLED",
        timestamp: "Yesterday, 01:45 PM",
        responsiblePerson: "Customer Support (Latha)",
        notes: "Patient requested cancellation due to out-of-station travel. Refund ID: REF881290 processed."
      }
    ]
  }
];
