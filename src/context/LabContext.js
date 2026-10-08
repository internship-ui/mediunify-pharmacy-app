// MediUnify Lab Context
// Central State Management for MediUnify Lab Administration

import React, { createContext, useContext, useState, useMemo } from "react";
import { INITIAL_TESTS, INITIAL_POPULAR_PACKAGES, INITIAL_CURATED_PACKAGES } from "../data/labMasterData";
import { INITIAL_ORDERS } from "../data/mockLabOrders";
import { INITIAL_STAFF } from "../data/mockLabStaff";
import { INITIAL_LAB_CENTERS } from "../data/mockLabCenters";
import { INITIAL_LAB_CATEGORIES } from "../data/mockLabCategories";
import { INITIAL_LAB_PATIENTS } from "../data/mockLabPatients";
import { INITIAL_LAB_INVOICES } from "../data/mockLabBilling";

const LabContext = createContext(null);

export const ORDER_STATUSES = [
  "NEW",
  "PENDING VERIFICATION",
  "VERIFIED",
  "COLLECTION SCHEDULED",
  "SAMPLE COLLECTED",
  "SAMPLE RECEIVED",
  "PROCESSING",
  "REPORT PENDING",
  "REPORT READY",
  "VERIFIED REPORT",
  "COMPLETED",
  "CANCELLED"
];

export const SAMPLE_STATUSES = [
  "PENDING COLLECTION",
  "ASSIGNED",
  "COLLECTED",
  "RECEIVED",
  "REJECTED",
  "PROCESSING",
  "COMPLETED"
];

export function LabProvider({ children }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [categories, setCategories] = useState(INITIAL_LAB_CATEGORIES);
  const [patients, setPatients] = useState(INITIAL_LAB_PATIENTS);
  const [invoices, setInvoices] = useState(INITIAL_LAB_INVOICES);
  const [popularPackages, setPopularPackages] = useState(INITIAL_POPULAR_PACKAGES);
  const [curatedPackages, setCuratedPackages] = useState(INITIAL_CURATED_PACKAGES);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [centers, setCenters] = useState(INITIAL_LAB_CENTERS);
  const [activeCenterId, setActiveCenterId] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("All");

  // Notifications State for Lab Operations
  const [labNotifications, setLabNotifications] = useState([
    {
      id: "LNOTIF-1",
      title: "New Executive Health Booking",
      message: "Order LAB-1001 for Rahul Kumar (Home Collection) requires clinical verification.",
      time: "15 mins ago",
      type: "order",
      orderId: "LAB-1001",
      read: false
    },
    {
      id: "LNOTIF-2",
      title: "Report Ready for Verification",
      message: "Order LAB-1009 (Meenakshi S.) multi-parameter panel is ready for pathologist sign-off.",
      time: "45 mins ago",
      type: "report",
      orderId: "LAB-1009",
      read: false
    },
    {
      id: "LNOTIF-3",
      title: "Phlebotomist Available",
      message: "Mahesh Gowda completed Saraswathipuram pickup and is now ready for reassignment.",
      time: "1 hour ago",
      type: "staff",
      read: true
    }
  ]);

  // Helper function to format timestamp
  const getTimestamp = () => {
    return "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // --- Order Lifecycle Actions ---

  const verifyOrder = (orderId, doctorName = "Dr. Arvind Rao (MD Pathology)", notes = "Clinical requirements and fasting eligibility verified.") => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const newTimeline = [
          ...order.timeline,
          {
            status: "VERIFIED",
            timestamp: getTimestamp(),
            responsiblePerson: doctorName,
            notes: notes
          }
        ];
        return {
          ...order,
          orderStatus: "VERIFIED",
          timeline: newTimeline
        };
      })
    );
  };

  const scheduleCollection = (orderId, scheduleData) => {
    const { scheduledDate, timeSlot, staffId, centerId, notes } = scheduleData;
    const assignedStaffMember = staff.find(s => s.staffId === staffId || s.id === staffId);
    const assignedCenter = centers.find(c => c.id === centerId || c.centerCode === centerId);

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const newTimeline = [
          ...order.timeline,
          {
            status: "COLLECTION SCHEDULED",
            timestamp: getTimestamp(),
            responsiblePerson: "Fleet Coordinator",
            notes: `Collection scheduled for ${scheduledDate} (${timeSlot}). ${assignedStaffMember ? `Assigned to ${assignedStaffMember.name}.` : ""} ${notes || ""}`
          }
        ];

        const updatedSamples = order.samples.map(s => ({
          ...s,
          collectionStaff: assignedStaffMember ? `${assignedStaffMember.name} (${assignedStaffMember.staffId})` : s.collectionStaff,
          sampleStatus: "ASSIGNED"
        }));

        return {
          ...order,
          orderStatus: "COLLECTION SCHEDULED",
          assignedStaff: assignedStaffMember || order.assignedStaff,
          centerId: assignedCenter ? assignedCenter.id : order.centerId,
          centerName: assignedCenter ? assignedCenter.name : order.centerName,
          collectionSchedule: {
            scheduledDate: scheduledDate || "Today",
            timeSlot: timeSlot || "Morning Slot",
            notes: notes || "Scheduled collection"
          },
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );

    // Update staff assignment count
    if (assignedStaffMember) {
      setStaff(prevStaff =>
        prevStaff.map(s => (s.id === assignedStaffMember.id ? { ...s, todayAssignments: s.todayAssignments + 1, availability: "BUSY" } : s))
      );
    }
  };

  const assignStaffToOrder = (orderId, staffId) => {
    const assignedStaffMember = staff.find(s => s.staffId === staffId || s.id === staffId);
    if (!assignedStaffMember) return;

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const newTimeline = [
          ...order.timeline,
          {
            status: order.orderStatus === "VERIFIED" ? "COLLECTION SCHEDULED" : order.orderStatus,
            timestamp: getTimestamp(),
            responsiblePerson: "Admin",
            notes: `Assigned phlebotomist ${assignedStaffMember.name} (${assignedStaffMember.phone}).`
          }
        ];

        const updatedSamples = order.samples.map(s => ({
          ...s,
          collectionStaff: `${assignedStaffMember.name} (${assignedStaffMember.staffId})`,
          sampleStatus: s.sampleStatus === "PENDING COLLECTION" ? "ASSIGNED" : s.sampleStatus
        }));

        return {
          ...order,
          orderStatus: order.orderStatus === "VERIFIED" ? "COLLECTION SCHEDULED" : order.orderStatus,
          assignedStaff: assignedStaffMember,
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );
  };

  const assignCenterToOrder = (orderId, centerId) => {
    const center = centers.find(c => c.id === centerId || c.centerCode === centerId);
    if (!center) return;

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          centerId: center.id,
          centerName: center.name
        };
      })
    );
  };

  const markSampleCollected = (orderId, sampleId = null, extraData = {}) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const updatedSamples = order.samples.map(s => {
          if (!sampleId || s.sampleId === sampleId) {
            return {
              ...s,
              sampleStatus: "COLLECTED",
              collectionTime: now,
              temperature: extraData.temperature || "Cold-chain (2-8°C)",
              barcode: extraData.barcode || s.barcode
            };
          }
          return s;
        });

        const allCollected = updatedSamples.every(s => s.sampleStatus === "COLLECTED" || s.sampleStatus === "RECEIVED" || s.sampleStatus === "PROCESSING" || s.sampleStatus === "COMPLETED");

        const newTimeline = [
          ...order.timeline,
          {
            status: "SAMPLE COLLECTED",
            timestamp: now,
            responsiblePerson: order.assignedStaff ? order.assignedStaff.name : "Phlebotomist",
            notes: extraData.notes || `Sample ${sampleId ? `(${sampleId})` : "tubes"} collected and labeled with verified barcodes.`
          }
        ];

        return {
          ...order,
          orderStatus: allCollected ? "SAMPLE COLLECTED" : order.orderStatus,
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );
  };

  const markSampleReceived = (orderId, sampleId = null, extraData = {}) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const updatedSamples = order.samples.map(s => {
          if (!sampleId || s.sampleId === sampleId) {
            return {
              ...s,
              sampleStatus: "RECEIVED",
              receivedTime: now
            };
          }
          return s;
        });

        const allReceived = updatedSamples.every(s => s.sampleStatus === "RECEIVED" || s.sampleStatus === "PROCESSING" || s.sampleStatus === "COMPLETED");

        const newTimeline = [
          ...order.timeline,
          {
            status: "SAMPLE RECEIVED",
            timestamp: now,
            responsiblePerson: "Central Lab Accessioning Desk",
            notes: extraData.notes || `Sample ${sampleId ? `(${sampleId})` : "barcodes"} received at laboratory and accessioned into LIS queue.`
          }
        ];

        return {
          ...order,
          orderStatus: allReceived ? "SAMPLE RECEIVED" : order.orderStatus,
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );
  };

  const rejectSample = (orderId, sampleId, rejectionReason, notes) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const updatedSamples = order.samples.map(s => {
          if (s.sampleId === sampleId) {
            return {
              ...s,
              sampleStatus: "REJECTED",
              rejectionReason: rejectionReason,
              rejectionNotes: notes
            };
          }
          return s;
        });

        const newTimeline = [
          ...order.timeline,
          {
            status: "SAMPLE REJECTED",
            timestamp: now,
            responsiblePerson: "Accessioning / Quality Officer",
            notes: `Sample ${sampleId} rejected: ${rejectionReason}. ${notes || "Recollection requested."}`
          }
        ];

        return {
          ...order,
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );
  };

  const startProcessing = (orderId) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const updatedSamples = order.samples.map(s => ({
          ...s,
          sampleStatus: "PROCESSING"
        }));

        const newTimeline = [
          ...order.timeline,
          {
            status: "PROCESSING",
            timestamp: now,
            responsiblePerson: "Pathology Automated Analyzer Workstation",
            notes: "Samples loaded on clinical chemistry, hematology, and immunoassay analyzers."
          }
        ];

        return {
          ...order,
          orderStatus: "PROCESSING",
          samples: updatedSamples,
          timeline: newTimeline
        };
      })
    );
  };

  const markReportPending = (orderId) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "REPORT PENDING",
            timestamp: now,
            responsiblePerson: "Lab Information System (LIS)",
            notes: "Assay analyzer values transferred to LIS. Awaiting PDF compilation and pathologist review."
          }
        ];

        return {
          ...order,
          orderStatus: "REPORT PENDING",
          report: {
            ...order.report,
            reportStatus: "PENDING"
          },
          timeline: newTimeline
        };
      })
    );
  };

  const uploadReport = (orderId, reportPayload) => {
    const { reportId, pdfUrl, parameterResults, notes } = reportPayload;
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "REPORT READY",
            timestamp: now,
            responsiblePerson: "Senior Lab Technician / Documentation Desk",
            notes: notes || `Diagnostic report ${reportId || "RPT-" + order.id.slice(4)} compiled and uploaded.`
          }
        ];

        const updatedSamples = order.samples.map(s => ({
          ...s,
          sampleStatus: "COMPLETED"
        }));

        return {
          ...order,
          orderStatus: "REPORT READY",
          samples: updatedSamples,
          report: {
            ...order.report,
            reportId: reportId || order.report?.reportId || `RPT-30${order.id.slice(-2)}`,
            reportStatus: "UPLOADED",
            uploadedDate: now,
            pdfUrl: pdfUrl || `novus_report_${order.id}.pdf`,
            parameterResults: parameterResults || order.report?.parameterResults || [
              { name: "Hemoglobin", value: "13.8", range: "13.0 - 17.0", unit: "g/dL", flag: "Normal" },
              { name: "Fasting Blood Sugar", value: "92", range: "70 - 99", unit: "mg/dL", flag: "Normal" },
              { name: "Serum Creatinine", value: "0.9", range: "0.7 - 1.3", unit: "mg/dL", flag: "Normal" },
              { name: "Total Cholesterol", value: "174", range: "< 200", unit: "mg/dL", flag: "Desirable" }
            ],
            notes: notes || "Diagnostic results compiled."
          },
          timeline: newTimeline
        };
      })
    );
  };

  const verifyReport = (orderId, verificationData = {}) => {
    const { verifiedBy = "Dr. Arvind Rao (MD Pathology)", notes = "Report reviewed, clinical correlation established, and digitally signed." } = verificationData;
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "VERIFIED REPORT",
            timestamp: now,
            responsiblePerson: verifiedBy,
            notes: notes
          }
        ];

        return {
          ...order,
          orderStatus: "VERIFIED REPORT",
          report: {
            ...order.report,
            reportStatus: "VERIFIED",
            verifiedBy: verifiedBy,
            verifiedDate: now,
            deliveryStatus: "Verified & Ready for Dispatch",
            notes: notes
          },
          timeline: newTimeline
        };
      })
    );
  };

  const rejectReport = (orderId, rejectionData) => {
    const { reason, notes, rejectedBy = "Pathologist Quality Lead" } = rejectionData;
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "REPORT REJECTED",
            timestamp: now,
            responsiblePerson: rejectedBy,
            notes: `Report rejected for correction: ${reason}. ${notes || ""}`
          }
        ];

        return {
          ...order,
          orderStatus: "REPORT PENDING",
          report: {
            ...order.report,
            reportStatus: "REJECTED",
            rejectionReason: reason,
            rejectionNotes: notes
          },
          timeline: newTimeline
        };
      })
    );
  };

  const sendReportToPatient = (orderId, channel = "WhatsApp & SMS") => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "COMPLETED",
            timestamp: now,
            responsiblePerson: "Automated Communication Dispatcher",
            notes: `NABL verified report link dispatched directly to patient phone (${order.patient.phone}) via ${channel}.`
          }
        ];

        return {
          ...order,
          orderStatus: "COMPLETED",
          report: {
            ...order.report,
            reportStatus: "DELIVERED",
            deliveryStatus: `Delivered via ${channel} (${now})`
          },
          timeline: newTimeline
        };
      })
    );
  };

  const cancelOrder = (orderId, reason) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const now = getTimestamp();

        const newTimeline = [
          ...order.timeline,
          {
            status: "CANCELLED",
            timestamp: now,
            responsiblePerson: "Lab Admin",
            notes: `Order cancelled: ${reason || "Cancelled by admin"}`
          }
        ];

        return {
          ...order,
          orderStatus: "CANCELLED",
          cancellationReason: reason,
          paymentStatus: order.paymentStatus === "Paid" ? "Refund Initiated" : "Cancelled",
          timeline: newTimeline
        };
      })
    );
  };

  // --- Test Catalogue CRUD Actions ---

  const addTest = (newTestData) => {
    const generatedId = `TEST-${Date.now().toString().slice(-4)}`;
    const testItem = {
      id: generatedId,
      testCode: newTestData.testCode || `TST-${Math.floor(100 + Math.random() * 900)}`,
      testName: newTestData.testName.trim(),
      category: newTestData.category || "Routine & Hematology",
      panelType: newTestData.panelType || "Individual",
      sampleRequired: newTestData.sampleRequired || "Blood (SST / Gel)",
      tubeContainer: newTestData.tubeContainer || "SST / Gel Tube (Yellow Top)",
      preparation: newTestData.preparation || "No fasting required.",
      tat: newTestData.tat || "6-8 Hours",
      cpt: parseFloat(newTestData.cpt) || 0,
      suggestedMysuruPrice: parseFloat(newTestData.suggestedMysuruPrice) || 300,
      status: newTestData.status || "Active",
      clinicalNotes: newTestData.clinicalNotes || "",
      includedParameters: newTestData.includedParameters || [
        { name: newTestData.testName, range: "Normal", unit: "" }
      ]
    };

    setTests(prev => [testItem, ...prev]);
    return testItem;
  };

  const updateTest = (testId, updatedFields) => {
    setTests(prev =>
      prev.map(t => (t.id === testId ? { ...t, ...updatedFields } : t))
    );
  };

  const toggleTestStatus = (testId) => {
    setTests(prev =>
      prev.map(t => (t.id === testId ? { ...t, status: t.status === "Active" ? "Inactive" : "Active" } : t))
    );
  };

  // --- Package CRUD Actions ---

  const addPackage = (newPkgData, isPopular = true) => {
    const generatedId = `PKG-${Date.now().toString().slice(-4)}`;
    const pkgItem = {
      id: generatedId,
      packageCode: newPkgData.packageCode || `${isPopular ? "POP" : "CUR"}-${Math.floor(100 + Math.random() * 900)}`,
      packageName: newPkgData.packageName.trim(),
      category: newPkgData.category || "Full Body Wellness",
      suggestedMysuruPrice: parseFloat(newPkgData.suggestedMysuruPrice) || 1999,
      referenceOriginalPrice: parseFloat(newPkgData.referenceOriginalPrice) || parseFloat(newPkgData.suggestedMysuruPrice) * 1.5,
      tat: newPkgData.tat || "12-24 Hours",
      sampleRequired: newPkgData.sampleRequired || "Blood & Urine",
      tubeContainer: newPkgData.tubeContainer || "EDTA + SST Tubes",
      preparation: newPkgData.preparation || "8-10 hours fasting.",
      clinicalPricingNote: newPkgData.clinicalPricingNote || "",
      status: newPkgData.status || "Active",
      isPopular: Boolean(isPopular),
      isCurated: !isPopular,
      testIds: newPkgData.testIds || ["TEST-CBC", "TEST-FBS"]
    };

    if (isPopular) {
      setPopularPackages(prev => [pkgItem, ...prev]);
    } else {
      setCuratedPackages(prev => [pkgItem, ...prev]);
    }
    return pkgItem;
  };

  const updatePackage = (pkgId, updatedFields) => {
    setPopularPackages(prev =>
      prev.map(p => (p.id === pkgId ? { ...p, ...updatedFields } : p))
    );
    setCuratedPackages(prev =>
      prev.map(p => (p.id === pkgId ? { ...p, ...updatedFields } : p))
    );
  };

  const duplicatePackage = (pkgId) => {
    const foundPopular = popularPackages.find(p => p.id === pkgId);
    if (foundPopular) {
      const duplicated = {
        ...foundPopular,
        id: `PKG-POP-${Date.now().toString().slice(-4)}`,
        packageCode: `${foundPopular.packageCode}-COPY`,
        packageName: `${foundPopular.packageName} (Copy)`
      };
      setPopularPackages(prev => [duplicated, ...prev]);
      return duplicated;
    }

    const foundCurated = curatedPackages.find(p => p.id === pkgId);
    if (foundCurated) {
      const duplicated = {
        ...foundCurated,
        id: `PKG-CUR-${Date.now().toString().slice(-4)}`,
        packageCode: `${foundCurated.packageCode}-COPY`,
        packageName: `${foundCurated.packageName} (Copy)`
      };
      setCuratedPackages(prev => [duplicated, ...prev]);
      return duplicated;
    }
  };

  const togglePackageStatus = (pkgId) => {
    setPopularPackages(prev =>
      prev.map(p => (p.id === pkgId ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p))
    );
    setCuratedPackages(prev =>
      prev.map(p => (p.id === pkgId ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p))
    );
  };

  const addTestToPackage = (pkgId, testId) => {
    const updateFn = (list) =>
      list.map(pkg => {
        if (pkg.id !== pkgId) return pkg;
        if (pkg.testIds.includes(testId)) return pkg;
        return { ...pkg, testIds: [...pkg.testIds, testId] };
      });

    setPopularPackages(updateFn);
    setCuratedPackages(updateFn);
  };

  const removeTestFromPackage = (pkgId, testId) => {
    const updateFn = (list) =>
      list.map(pkg => {
        if (pkg.id !== pkgId) return pkg;
        return { ...pkg, testIds: pkg.testIds.filter(id => id !== testId) };
      });

    setPopularPackages(updateFn);
    setCuratedPackages(updateFn);
  };

  const reorderTestsInPackage = (pkgId, newTestIds) => {
    const updateFn = (list) =>
      list.map(pkg => {
        if (pkg.id !== pkgId) return pkg;
        return { ...pkg, testIds: newTestIds };
      });

    setPopularPackages(updateFn);
    setCuratedPackages(updateFn);
  };

  // --- Collection Staff Actions ---

  const addStaff = (staffData) => {
    const newStaff = {
      id: `STF-${Date.now().toString().slice(-4)}`,
      staffId: `PHL-${Math.floor(100 + Math.random() * 900)}`,
      name: staffData.name.trim(),
      phone: staffData.phone.trim(),
      email: staffData.email || "staff@mediunify.in",
      serviceArea: staffData.serviceArea || "Mysuru City",
      specialization: staffData.specialization || "Routine Venipuncture",
      experience: staffData.experience || "2 Years",
      availability: "AVAILABLE",
      todayAssignments: 0,
      completedCollections: 0,
      status: "Active",
      vehicleType: staffData.vehicleType || "Two-Wheeler (Cold Box)",
      vaccinationStatus: "Fully Vaccinated",
      rating: 5.0,
      assignedOrders: []
    };
    setStaff(prev => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaff = (staffId, updatedFields) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId || s.staffId === staffId ? { ...s, ...updatedFields } : s))
    );
  };

  const toggleStaffAvailability = (staffId, newAvailability) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId || s.staffId === staffId ? { ...s, availability: newAvailability } : s))
    );
  };

  const toggleStaffStatus = (staffId) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId || s.staffId === staffId ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
    );
  };

  // --- Lab Centers Actions ---

  const addCenter = (centerData) => {
    const newCenter = {
      id: `CTR-${Date.now().toString().slice(-4)}`,
      centerCode: centerData.centerCode || `MYS-CEN-${Math.floor(10 + Math.random() * 90)}`,
      name: centerData.name.trim(),
      shortName: centerData.shortName || centerData.name.trim(),
      type: centerData.type || "Collection & Diagnostic Center",
      address: centerData.address,
      city: centerData.city || "Mysuru",
      state: "Karnataka",
      pincode: centerData.pincode || "570001",
      contact: centerData.contact,
      email: centerData.email || "center.lab@mediunify.in",
      operatingHours: centerData.operatingHours || "06:30 AM - 08:30 PM",
      availableTestsCount: parseInt(centerData.availableTestsCount, 10) || 50,
      collectionAvailability: "Walk-in & Home Dispatch",
      hasEcG: Boolean(centerData.hasEcG),
      hasUSG: Boolean(centerData.hasUSG),
      accreditations: ["NABL Collection Hub"],
      activePhlebotomistsCount: 3,
      status: "Active"
    };
    setCenters(prev => [newCenter, ...prev]);
    return newCenter;
  };

  const updateCenter = (centerId, updatedFields) => {
    setCenters(prev =>
      prev.map(c => (c.id === centerId || c.centerCode === centerId ? { ...c, ...updatedFields } : c))
    );
  };

  const toggleCenterStatus = (centerId) => {
    setCenters(prev =>
      prev.map(c => (c.id === centerId ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c))
    );
  };

  // --- Categories CRUD Actions ---

  const addCategory = (catData) => {
    const newCat = {
      id: `CAT-${Date.now().toString().slice(-4)}`,
      code: catData.code?.toUpperCase() || `CAT${Math.floor(10 + Math.random() * 90)}`,
      name: catData.name.trim(),
      nablDiscipline: catData.nablDiscipline || "Clinical Pathology",
      description: catData.description || "Diagnostic laboratory sub-discipline.",
      headOfDepartment: catData.headOfDepartment || "Dr. Arvind Rao (MD Pathology)",
      roomNumber: catData.roomNumber || "Main Lab Diagnostic Block",
      sampleTypes: catData.sampleTypes || ["Blood", "Serum"],
      standardTAT: catData.standardTAT || "6-12 Hours",
      storageTemp: catData.storageTemp || "2°C - 8°C",
      color: catData.color || "#0D9488",
      bgLight: "#F0FDFA",
      iconName: catData.iconName || "flask-outline",
      status: "Active",
      sortOrder: categories.length + 1,
      testCodes: []
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (catId, updatedFields) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId || c.code === catId ? { ...c, ...updatedFields } : c))
    );
  };

  const toggleCategoryStatus = (catId) => {
    setCategories(prev =>
      prev.map(c => (c.id === catId ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c))
    );
  };

  // --- Patients CRUD Actions ---

  const addPatient = (patientData) => {
    const newPat = {
      id: `PAT-${Date.now().toString().slice(-4)}`,
      uhid: `MU-UHID-${Math.floor(9000 + Math.random() * 999)}`,
      name: patientData.name.trim(),
      age: parseInt(patientData.age, 10) || 30,
      gender: patientData.gender || "Male",
      phone: patientData.phone.trim(),
      email: patientData.email || "",
      bloodGroup: patientData.bloodGroup || "O+",
      address: patientData.address || "Mysuru, Karnataka",
      pincode: patientData.pincode || "570001",
      cohortTags: patientData.cohortTags || ["Routine Checkup"],
      conditions: patientData.conditions || [],
      clinicalAlerts: patientData.clinicalAlerts || "None",
      emergencyContact: patientData.emergencyContact || { name: "Primary Contact", phone: patientData.phone, relation: "Family" },
      preferredCenter: patientData.preferredCenter || "Central Diagnostic Hub (Mysuru)",
      registrationDate: "Today",
      totalVisits: 1,
      totalSpent: 0,
      outstandingDue: 0,
      recentOrders: []
    };
    setPatients(prev => [newPat, ...prev]);
    return newPat;
  };

  const updatePatient = (patientId, updatedFields) => {
    setPatients(prev =>
      prev.map(p => (p.id === patientId || p.uhid === patientId ? { ...p, ...updatedFields } : p))
    );
  };

  // --- Invoicing & Billing Actions ---

  const recordPayment = (invoiceId, paymentData) => {
    const { amountPaid, paymentMode, transactionRef, notes } = paymentData;
    const now = getTimestamp();

    setInvoices(prev =>
      prev.map(inv => {
        if (inv.invoiceId !== invoiceId) return inv;
        const newPaidAmount = (inv.paidAmount || 0) + parseFloat(amountPaid || 0);
        const newBalance = Math.max(0, inv.netAmount - newPaidAmount);
        const newStatus = newBalance === 0 ? "PAID" : "PARTIAL";

        return {
          ...inv,
          paidAmount: newPaidAmount,
          balanceDue: newBalance,
          paymentStatus: newStatus,
          paymentMode: paymentMode || inv.paymentMode,
          transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
          status: newBalance === 0 ? "Settled" : "Partial Balance Pending",
          paymentNotes: notes
        };
      })
    );

    // Also sync with related order's paymentStatus if exists
    const matchingInv = invoices.find(inv => inv.invoiceId === invoiceId);
    if (matchingInv && matchingInv.orderId) {
      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== matchingInv.orderId) return ord;
          return {
            ...ord,
            paymentStatus: "Paid"
          };
        })
      );
    }
  };

  const applyDiscount = (invoiceId, discountData) => {
    const { discountPercent = 0, discountAmount = 0, reason = "Promotional Waiver" } = discountData;
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.invoiceId !== invoiceId) return inv;
        const calculatedDiscount = discountAmount > 0 ? discountAmount : Math.round((inv.subTotal * discountPercent) / 100);
        const newNet = Math.max(0, inv.subTotal - calculatedDiscount + (inv.homeCollectionFee || 0));
        const newBalance = Math.max(0, newNet - (inv.paidAmount || 0));

        return {
          ...inv,
          discountPercent: discountPercent,
          discountAmount: calculatedDiscount,
          netAmount: newNet,
          balanceDue: newBalance,
          discountReason: reason
        };
      })
    );
  };

  const addInvoice = (invoiceData) => {
    const newInv = {
      invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: invoiceData.orderId || `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      uhid: invoiceData.uhid || "MU-UHID-8821",
      patientName: invoiceData.patientName,
      patientPhone: invoiceData.patientPhone,
      patientAddress: invoiceData.patientAddress || "Mysuru",
      date: getTimestamp(),
      items: invoiceData.items || [{ description: "Diagnostic Investigation", hsnSac: "999312", unitPrice: invoiceData.netAmount, qty: 1, total: invoiceData.netAmount }],
      subTotal: invoiceData.subTotal || invoiceData.netAmount,
      discountPercent: invoiceData.discountPercent || 0,
      discountAmount: invoiceData.discountAmount || 0,
      homeCollectionFee: invoiceData.homeCollectionFee || 0,
      gstRate: 0,
      netAmount: invoiceData.netAmount,
      paidAmount: invoiceData.paidAmount || 0,
      balanceDue: invoiceData.balanceDue !== undefined ? invoiceData.balanceDue : invoiceData.netAmount,
      paymentStatus: invoiceData.paymentStatus || "PENDING",
      paymentMode: invoiceData.paymentMode || "Cash at Desk",
      transactionRef: invoiceData.transactionRef || "TXN-MANUAL",
      centerName: invoiceData.centerName || "Central Diagnostic Hub (Mysuru)",
      b2bPartner: invoiceData.b2bPartner || null,
      status: invoiceData.paidAmount >= invoiceData.netAmount ? "Settled" : "Due"
    };

    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  // --- Pricing & TAT Updates ---

  const updatePricingAndTAT = (type, itemId, fields) => {
    if (type === "test") {
      updateTest(itemId, fields);
    } else if (type === "package") {
      updatePackage(itemId, fields);
    }
  };

  // Notifications
  const markLabNotificationRead = (notifId) => {
    setLabNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllLabNotificationsRead = () => {
    setLabNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Helper map of all test objects by ID for quick lookups
  const testsMap = useMemo(() => {
    const map = {};
    tests.forEach(t => {
      map[t.id] = t;
    });
    return map;
  }, [tests]);

  return (
    <LabContext.Provider
      value={{
        orders,
        tests,
        testsMap,
        categories,
        patients,
        invoices,
        popularPackages,
        curatedPackages,
        staff,
        centers,
        activeCenterId,
        setActiveCenterId,
        dateFilter,
        setDateFilter,
        labNotifications,
        markLabNotificationRead,
        markAllLabNotificationsRead,
        // Order Actions
        verifyOrder,
        scheduleCollection,
        assignStaffToOrder,
        assignCenterToOrder,
        markSampleCollected,
        markSampleReceived,
        rejectSample,
        startProcessing,
        markReportPending,
        uploadReport,
        verifyReport,
        rejectReport,
        sendReportToPatient,
        cancelOrder,
        // Test Catalogue Actions
        addTest,
        updateTest,
        toggleTestStatus,
        // Package Actions
        addPackage,
        updatePackage,
        duplicatePackage,
        togglePackageStatus,
        addTestToPackage,
        removeTestFromPackage,
        reorderTestsInPackage,
        // Staff Actions
        addStaff,
        updateStaff,
        toggleStaffAvailability,
        toggleStaffStatus,
        // Center Actions
        addCenter,
        updateCenter,
        toggleCenterStatus,
        // Category Actions
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        // Patient Actions
        addPatient,
        updatePatient,
        // Billing & Payment Actions
        recordPayment,
        applyDiscount,
        addInvoice,
        // Pricing
        updatePricingAndTAT
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error("useLab must be used within a LabProvider");
  }
  return context;
}
