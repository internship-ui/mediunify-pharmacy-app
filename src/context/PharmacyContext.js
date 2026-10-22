import React, { createContext, useContext, useState } from "react";
import initialOrders from "../data/mockOrders";
import initialCaptains from "../data/mockCaptains";
import initialInventory from "../data/mockInventory";
import {
  MOCK_TP_PHARMACIES,
  INITIAL_TP_INVENTORY_APEX,
  INITIAL_TP_INVENTORY_MEDPLUS,
  INITIAL_TP_ORDERS,
  MOCK_ADMIN_SPLIT_TRACKING,
  INITIAL_NETWORK_BROADCASTS
} from "../data/mockThirdPartyData";

const PharmacyContext = createContext(null);

const HUB_PROFILES = {
  "HUB-MYS-01": {
    id: "HUB-MYS-01",
    name: "MediUnify Central Hub (Mysuru)",
    facilityName: "MediUnify Mysore Central Fulfillment Hub",
    hubType: "Company Owned Central Hub",
    isThirdParty: false,
    ownerName: "MediUnify Central Hub Operations",
    licenseNumber: "KA-MYS-2026-HUB01",
    gstin: "29AABCU9603R1ZM",
    panNumber: "AABCU9603R",
    phone: "+91 821 245 8899",
    alternatePhone: "+91 98450 67890",
    email: "mysore.hub@mediunify.in",
    address: "Central Hub Facility #14, Kuvempunagar Industrial Layout",
    area: "Kuvempunagar",
    city: "Mysuru",
    state: "Karnataka",
    pincode: "570023",
    openingHours: "06:00 AM - 11:30 PM (Daily Dispatch)",
    isOpen: true,
    rating: 4.9,
    reviewsCount: 520,
    establishedYear: "2024",
    provisionedBy: "MediUnify Super Admin",
    activeLocationsServed: ["Mysuru Central", "Kuvempunagar", "Vijayanagar", "Gokulam", "Jayalakshmipuram"]
  },
  "HUB-BLR-02": {
    id: "HUB-BLR-02",
    name: "Apex Pharma Regional Hub (Bengaluru)",
    facilityName: "Apex Regional Pharmacy Store",
    hubType: "Multiple Pharmacy Partner",
    isThirdParty: true,
    ownerName: "Dr. Meera Nambiar (Reg. Pharmacist)",
    licenseNumber: "KA-BLR-2026-HUB88",
    gstin: "29XYZPK1234Q1Z8",
    panNumber: "XYZPK1234Q",
    phone: "+91 80 4123 9900",
    alternatePhone: "+91 98451 12345",
    email: "apex.hub@mediunify-partner.in",
    address: "Unit 4B, Tech Park Road, Electronic City Phase 1",
    area: "Electronic City",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    openingHours: "08:00 AM - 11:00 PM (Daily Dispatch)",
    isOpen: true,
    rating: 4.8,
    reviewsCount: 194,
    establishedYear: "2025",
    provisionedBy: "MediUnify Super Admin",
    activeLocationsServed: ["Electronic City", "HSR Layout", "Bommasandra", "Koramangala"]
  }
};

const INITIAL_PROFILE = HUB_PROFILES["HUB-MYS-01"];

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-1",
    title: "🚨 New Prescription Received",
    message: "Order #ORD1001 from Ravi Kumar requires prescription verification.",
    time: "10 mins ago",
    type: "order",
    orderId: "ORD1001",
    read: false
  },
  {
    id: "NOTIF-2",
    title: "🚴 Captain Suresh B. Arrived",
    message: "Captain is waiting for handover of Order #ORD1005.",
    time: "25 mins ago",
    type: "captain",
    orderId: "ORD1005",
    read: false
  },
  {
    id: "NOTIF-4",
    title: "💰 Payout Settled",
    message: "₹14,250 has been deposited to HDFC Bank (A/C ••4492).",
    time: "Yesterday, 11:30 PM",
    type: "payment",
    read: true
  }
];

const INITIAL_SETTLEMENTS = {
  todayEarnings: 4250.0,
  weeklyEarnings: 28940.0,
  pendingPayout: 12450.0,
  totalOrdersCompleted: 148,
  bankName: "HDFC Bank Ltd",
  accountNumber: "50200049184492",
  ifsc: "HDFC0001234",
  accountHolder: "Novus Pharmacy Enterprises",
  history: [
    { id: "SET-8819", date: "Sep 02, 2026", amount: 14250.0, status: "Settled", ordersCount: 42, utr: "UTR8912304911" },
    { id: "SET-8818", date: "Aug 26, 2026", amount: 31200.0, status: "Settled", ordersCount: 88, utr: "UTR8821904423" },
    { id: "SET-8817", date: "Aug 19, 2026", amount: 26800.0, status: "Settled", ordersCount: 76, utr: "UTR8712399120" },
    { id: "SET-8816", date: "Aug 12, 2026", amount: 29450.0, status: "Settled", ordersCount: 81, utr: "UTR8609214482" }
  ]
};

export function PharmacyProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const [pharmacyProfile, setPharmacyProfile] = useState(INITIAL_PROFILE);
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [captains] = useState(initialCaptains);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [notificationSettings, setNotificationSettings] = useState({
    pushNewOrders: true,
    soundAlerts: true,
    smsAlerts: false,
    captainUpdates: true,
    settlementReports: true
  });

  // Third-Party Isolated State
  const [tpPharmacies, setTpPharmacies] = useState(MOCK_TP_PHARMACIES);
  const [tpInventories, setTpInventories] = useState({
    "TP-APEX-01": INITIAL_TP_INVENTORY_APEX,
    "TP-MEDPLUS-02": INITIAL_TP_INVENTORY_MEDPLUS
  });
  const [tpOrders, setTpOrders] = useState(INITIAL_TP_ORDERS);
  const [adminSplitTracking, setAdminSplitTracking] = useState(MOCK_ADMIN_SPLIT_TRACKING);
  const [networkBroadcasts, setNetworkBroadcasts] = useState(INITIAL_NETWORK_BROADCASTS);

  // Auth actions (Super Admin Provisioned)
  const loginAsHub = (id, password) => {
    const cleanId = (id || "HUB-MYS-01").trim().toUpperCase();
    const matchedProfile = HUB_PROFILES[cleanId] || {
      ...INITIAL_PROFILE,
      id: cleanId,
      name: `MediUnify Hub (${cleanId})`,
      facilityName: `MediUnify Fulfillment Center (${cleanId})`
    };

    setPharmacyProfile(matchedProfile);
    setInventory(initialInventory);
    setOrders(initialOrders);
    setSettlements(INITIAL_SETTLEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser({
      role: "hub",
      pharmacyId: matchedProfile.id,
      name: matchedProfile.name,
      hubType: matchedProfile.hubType,
      isThirdParty: false,
      isLoggedIn: true
    });
    return true;
  };

  const loginAsThirdParty = (id, password) => {
    const cleanId = (id || "TP-APEX-01").trim().toUpperCase();
    const matchedProfile = tpPharmacies[cleanId] || MOCK_TP_PHARMACIES["TP-APEX-01"];

    const completeProfile = {
      ...matchedProfile,
      facilityName: matchedProfile.facilityName || matchedProfile.name,
      ownerName: matchedProfile.ownerName || matchedProfile.pharmacistName || "Registered Pharmacist",
      openingHours: matchedProfile.openingHours || matchedProfile.operatingHours || "08:00 AM - 10:30 PM",
      isThirdParty: true
    };
    setPharmacyProfile(completeProfile);

    setCurrentUser({
      role: "third_party",
      pharmacyId: matchedProfile.id,
      name: matchedProfile.name,
      hubType: matchedProfile.hubType,
      isThirdParty: true,
      isLoggedIn: true
    });

    // Populate inventory mapped for standard InventoryScreen
    const partnerRawInv = tpInventories[cleanId] || (cleanId.includes("MEDPLUS") ? INITIAL_TP_INVENTORY_MEDPLUS : INITIAL_TP_INVENTORY_APEX);
    const mappedInventory = partnerRawInv.map(item => ({
      id: item.id,
      name: item.name,
      genericName: item.brand ? `${item.brand} (${item.strength || ""})` : item.name,
      manufacturer: item.manufacturer,
      category: item.category || (
        item.name.toLowerCase().includes("pan") ? "Gastro" :
        item.name.toLowerCase().includes("aug") ? "Antibiotics" :
        item.name.toLowerCase().includes("telma") ? "Cardiac" :
        item.name.toLowerCase().includes("rosu") ? "Cardiac" :
        item.name.toLowerCase().includes("glyco") ? "Diabetes" :
        item.name.toLowerCase().includes("thyro") ? "Endocrine" :
        item.name.toLowerCase().includes("dolo") || item.name.toLowerCase().includes("para") ? "Pain Relief" :
        item.name.toLowerCase().includes("syp") || item.name.toLowerCase().includes("syrup") ? "Respiratory" :
        "General Medicines"
      ),
      unit: item.unit || (item.dosageForm ? `Pack of 10 ${item.dosageForm}s` : "Strip of 10 Tablets"),
      stock: item.stock,
      minStockThreshold: item.minStockThreshold || 10,
      batchNumber: item.batchNumber,
      mfgDate: item.mfgDate || "2025-06",
      expiryDate: item.expiryDate,
      rackLocation: item.rackLocation,
      mrp: item.mrp || Number(((item.unitPrice || 50) * 1.15).toFixed(2)),
      sellingPrice: item.sellingPrice || item.unitPrice || 50,
      hsn: item.hsn || "30049099",
      gstRate: item.gstRate || 12,
      isScheduleH: !!item.isScheduleH,
      isActive: item.isActive !== false
    }));
    setInventory(mappedInventory);

    // Populate orders mapped for standard OrdersScreen and DashboardScreen
    const partnerOrders = INITIAL_TP_ORDERS.filter(o => !o.pharmacyId || o.pharmacyId === cleanId || cleanId === "TP-APEX-01");
    const statusMap = {
      "Admin Assigned": "New",
      "New Assigned": "New",
      "Pending Acceptance": "New",
      "Accepted": "Accepted",
      "Picking": "Picking",
      "Packed": "Packed",
      "Dispatched": "CaptainAssigned",
      "CaptainAssigned": "CaptainAssigned",
      "HandedOver": "Delivered",
      "Delivered": "Delivered",
      "Completed": "Completed",
      "Rejected": "Rejected"
    };

    const mappedOrders = (partnerOrders.length > 0 ? partnerOrders : INITIAL_TP_ORDERS).map(order => ({
      id: order.id,
      invoiceNo: order.invoiceNo || `INV-TP-${order.id.replace(/[^0-9]/g, "") || "901"}`,
      patientName: order.patientName,
      patientPhone: order.patientPhone || order.patientPhoneMasked || "+91 98451 23456",
      patientAge: order.patientAge || 45,
      patientGender: order.patientGender || "Male",
      doctorName: order.doctorName || "Dr. Arvind Swaminathan (MD)",
      clinicName: order.clinicName || "Narayana Health Specialist Clinic",
      status: statusMap[order.status] || order.status || "New",
      createdAt: order.adminAssignmentTimestamp || "2026-09-03T09:20:00",
      type: "prescription",
      prescriptionImage: order.prescriptionImage || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      prescriptionVerified: order.prescriptionVerifiedByAdmin !== false,
      isSplit: !!order.isSplitOrder,
      splitNote: order.splitNote,
      items: (order.items || []).map(it => ({
        id: it.inventoryId || it.id,
        name: it.name,
        qty: it.quantity || it.qty || 1,
        unitPrice: it.unitPrice || 50,
        dosage: it.dosage || "1 tablet daily after food",
        hsn: "30049099",
        gstRate: 12,
        available: true,
        picked: !!it.picked,
        currentHubAvailable: true,
        sourceHub: "Partner Pharmacy"
      })),
      deliveryAddress: order.deliveryAddressArea || "Electronic City, Bengaluru, Karnataka 560100",
      deliveryInstructions: order.deliveryInstructions || "Hand over at reception/gate",
      distanceKm: order.distanceKm || 2.4,
      paymentMethod: order.paymentMethod || "UPI Prepaid (MediUnify Hub Escrow)",
      paymentStatus: order.paymentStatus || "Paid",
      subtotal: order.subtotal || 250.0,
      taxAmount: order.taxAmount || 30.0,
      deliveryFee: order.deliveryFee || 0,
      packagingCharge: 10.0,
      discountAmount: 0,
      totalAmount: order.totalAmount || ((order.subtotal || 250) + (order.taxAmount || 30)),
      partnerSettlementAmount: order.partnerSettlementAmount,
      rejectionReason: order.rejectionReason || null,
      captain: order.captain || null,
      handoverOtp: order.handoverOtp || "4921",
      timeline: order.timeline || [
        { status: "New", timestamp: "Today, 09:20 AM", description: "Prescription assigned by MediUnify Admin" }
      ]
    }));
    setOrders(mappedOrders);

    // Populate settlements for partner
    setSettlements({
      todayEarnings: 3120.0,
      weeklyEarnings: 21850.0,
      pendingPayout: 8450.0,
      totalOrdersCompleted: 94,
      bankName: cleanId.includes("APEX") ? "ICICI Bank Ltd" : "State Bank of India",
      accountNumber: cleanId.includes("APEX") ? "002105018821" : "30281920192",
      ifsc: cleanId.includes("APEX") ? "ICIC0000021" : "SBIN0001234",
      accountHolder: matchedProfile.name,
      history: [
        { id: "SET-TP-901", date: "Sep 02, 2026", amount: 9850.0, status: "Settled", ordersCount: 28, utr: "UTR90128471" },
        { id: "SET-TP-902", date: "Aug 26, 2026", amount: 18400.0, status: "Settled", ordersCount: 56, utr: "UTR89481722" },
        { id: "SET-TP-903", date: "Aug 19, 2026", amount: 15200.0, status: "Settled", ordersCount: 44, utr: "UTR87219904" }
      ]
    });

    setNotifications([
      {
        id: "NOTIF-TP-1",
        title: "📋 Split Order Assigned from Super Admin",
        message: "Admin assigned Split Order #EXT-ORD2001 (Pan-D Capsule) for patient Ravi Kumar.",
        time: "15 mins ago",
        type: "order",
        orderId: "EXT-ORD2001",
        read: false
      },
      {
        id: "NOTIF-TP-2",
        title: "🚴 Delivery Partner En-Route",
        message: "Captain Kiran Gowda assigned for pickup at your pharmacy dispatch desk.",
        time: "20 mins ago",
        type: "captain",
        orderId: "EXT-ORD2002",
        read: false
      },
      {
        id: "NOTIF-TP-3",
        title: "💰 Partner Payout Settled",
        message: "₹9,850.00 settled to partner account for previous week fulfilment.",
        time: "Yesterday",
        type: "payment",
        read: true
      }
    ]);

    return true;
  };

  const login = (id, password, role = null) => {
    const cleanId = (id || "").trim().toUpperCase();
    if (role === "third_party" || cleanId.startsWith("TP")) {
      return loginAsThirdParty(cleanId, password);
    }
    return loginAsHub(cleanId, password);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleStoreOpen = () => {
    setPharmacyProfile(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const updatePharmacyProfile = (updatedFields) => {
    setPharmacyProfile(prev => ({ ...prev, ...updatedFields }));
  };

  // Order lifecycle actions
  const updateOrderStatus = (orderId, newStatus, extraData = {}) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newTimeline = [
          ...order.timeline,
          {
            status: newStatus,
            timestamp: nowFormatted,
            description: extraData.timelineDescription || `Status updated to ${newStatus}`
          }
        ];
        return {
          ...order,
          status: newStatus,
          timeline: newTimeline,
          ...extraData
        };
      })
    );
  };

  const verifyPrescription = (orderId) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, prescriptionVerified: true } : o))
    );
  };

  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, "Accepted", {
      prescriptionVerified: true,
      timelineDescription: "Pharmacy accepted order and verified prescription"
    });
  };

  const rejectOrder = (orderId, reason, extra = {}) => {
    updateOrderStatus(orderId, "Rejected", {
      rejectionReason: reason,
      rejectionCalledPatient: extra.calledPatient || false,
      rejectionCategory: extra.category || "General",
      paymentStatus: "Cancelled",
      timelineDescription: `Prescription rejected: ${reason}${extra.calledPatient ? " (Patient verbally informed via phone)" : ""}`
    });
  };

  const toggleItemAvailability = (orderId, itemIndex) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item, idx) =>
          idx === itemIndex ? { ...item, available: !item.available } : item
        );
        return { ...order, items: updatedItems };
      })
    );
  };

  const toggleItemPicked = (orderId, itemIndex) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item, idx) =>
          idx === itemIndex ? { ...item, picked: !item.picked } : item
        );
        return { ...order, items: updatedItems };
      })
    );
  };

  const deductInventoryStock = (itemsToDeduct) => {
    if (!itemsToDeduct || !itemsToDeduct.length) return;
    setInventory(prevInventory => {
      return prevInventory.map(invItem => {
        // Find matching item by SKU id or by fuzzy name match
        const matchedOrderItem = itemsToDeduct.find(oi => {
          if (oi.inventoryId && oi.inventoryId === invItem.id) return true;
          const oName = (oi.name || oi.medicineName || "").toLowerCase().trim();
          const iName = invItem.name.toLowerCase().trim();
          const gName = (invItem.genericName || "").toLowerCase().trim();
          const oFirst = oName.split(" ")[0];
          const iFirst = iName.split(" ")[0];
          return (
            oName.includes(iName) ||
            iName.includes(oName) ||
            (gName && oName.includes(gName)) ||
            (oFirst.length > 3 && iFirst.length > 3 && oFirst === iFirst)
          );
        });

        if (matchedOrderItem) {
          const qty = parseInt(matchedOrderItem.quantity, 10) || 1;
          const newStock = Math.max(0, invItem.stock - qty);
          return { ...invItem, stock: newStock };
        }
        return invItem;
      });
    });
  };

  const markPackedAndNotifyFleet = (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.items) {
      deductInventoryStock(targetOrder.items);
    }

    // Select closest nearby captain automatically (Swiggy fleet broadcast simulation)
    const selectedCaptain = captains[0] || {
      id: "CAP01",
      name: "Suresh B.",
      phone: "+91 98450 11223",
      vehicle: "TVS Jupiter · KA-09-EA-4412",
      etaMins: 4
    };

    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const generatedOtp = "4921";

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const newTimeline = [
          ...order.timeline,
          {
            status: "Packed",
            timestamp: nowFormatted,
            description: "Medicines packed in tamper-proof security bag. Broadcasted pickup to nearby fleet."
          },
          {
            status: "CaptainAssigned",
            timestamp: nowFormatted,
            description: `Captain ${selectedCaptain.name} accepted pickup (ETA ${selectedCaptain.etaMins} mins)`
          }
        ];
        return {
          ...order,
          status: "CaptainAssigned",
          captain: selectedCaptain,
          handoverOtp: order.handoverOtp || generatedOtp,
          timeline: newTimeline
        };
      })
    );
  };

  const assignCaptainToOrder = (orderId, captain) => {
    updateOrderStatus(orderId, "CaptainAssigned", {
      captain,
      timelineDescription: `Delivery Captain ${captain.name} assigned (ETA ${captain.etaMins} mins)`
    });
  };

  const confirmHandover = (orderId, enteredOtp, handoverProofPhoto) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (!handoverProofPhoto) {
      return { success: false, message: "Please upload or capture a photo proof of the package handover to the delivery agent." };
    }

    // Check OTP
    if (order.handoverOtp && enteredOtp !== order.handoverOtp) {
      return { success: false, message: `Invalid OTP. Ask captain for the correct 4-digit code (Demo OTP: ${order.handoverOtp})` };
    }

    const nowIso = new Date().toISOString();
    updateOrderStatus(orderId, "HandedOver", {
      handoverTime: nowIso,
      handoverProofPhoto: handoverProofPhoto,
      timelineDescription: `OTP ${enteredOtp} verified · Package handover photo proof captured · Handed to Captain ${order.captain?.name || "Delivery Partner"}`
    });

    // Update settlements earnings
    setSettlements(prev => ({
      ...prev,
      todayEarnings: prev.todayEarnings + order.totalAmount,
      totalOrdersCompleted: prev.totalOrdersCompleted + 1
    }));

    return { success: true };
  };

  // Split Order / Split Delivery Actions
  const splitOrder = (orderId, delivery1Items, delivery2Items, secondaryHubName) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const d1Items = delivery1Items.map(item => ({
          ...item,
          available: true,
          picked: false,
          currentHubAvailable: true,
          sourceHub: "Current Hub",
          deliveryGroup: "Delivery 1"
        }));

        const d2Items = delivery2Items.map(item => ({
          ...item,
          available: false,
          picked: false,
          currentHubAvailable: false,
          sourceHub: secondaryHubName || "Apex Pharma Regional Hub (Bengaluru)",
          deliveryGroup: "Delivery 2"
        }));

        const combinedItems = [...d1Items, ...d2Items];

        const delivery1 = {
          id: `${order.id}-A`,
          deliveryNumber: 1,
          deliveryGroup: "Delivery 1 – Current Hub",
          sourceHub: "MediUnify Central Hub (Mysuru)",
          isCurrentHub: true,
          status: "Accepted",
          captain: null,
          handoverOtp: "4921",
          items: d1Items,
          timeline: [
            {
              status: "Accepted",
              timestamp: nowFormatted,
              description: `Split Delivery 1 created with ${d1Items.length} available medicines (Current Hub)`
            }
          ]
        };

        const delivery2 = {
          id: `${order.id}-B`,
          deliveryNumber: 2,
          deliveryGroup: "Delivery 2 – Split Delivery",
          sourceHub: secondaryHubName || "Apex Pharma Regional Hub (Bengaluru)",
          isCurrentHub: false,
          status: "Pending",
          captain: null,
          handoverOtp: "8312",
          items: d2Items,
          timeline: [
            {
              status: "Pending",
              timestamp: nowFormatted,
              description: `Split Delivery 2 created with ${d2Items.length} unavailable medicine(s) routed to ${secondaryHubName || "Apex Pharma Regional Hub"}`
            }
          ]
        };

        const newTimeline = [
          ...order.timeline,
          {
            status: "Split Delivery",
            timestamp: nowFormatted,
            description: `Order split into 2 fulfillment parts: Delivery 1 (${d1Items.length} items from Current Hub) & Delivery 2 (${d2Items.length} item(s) from ${secondaryHubName || "Secondary Hub"})`
          }
        ];

        return {
          ...order,
          isSplit: true,
          status: "Split Delivery",
          items: combinedItems,
          deliveries: [delivery1, delivery2],
          timeline: newTimeline
        };
      })
    );
  };

  const packSelectedAndSplit = (orderId, packedItemIndicesOrSplits, remainingEta = "Within 2 to 3 hours", customPatientMessage = "") => {
    const selectedCaptain = captains[0] || {
      id: "CAP01",
      name: "Suresh B.",
      phone: "+91 98450 11223",
      vehicle: "TVS Jupiter · KA-09-EA-4412",
      etaMins: 4
    };
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;

        const d1Items = [];
        const d2Items = [];

        order.items.forEach((item, idx) => {
          // Check if custom quantity split passed
          const splitConfig = Array.isArray(packedItemIndicesOrSplits) && typeof packedItemIndicesOrSplits[0] === "object"
            ? packedItemIndicesOrSplits.find(s => s.itemIndex === idx)
            : null;

          if (splitConfig) {
            const b1Qty = Math.max(0, splitConfig.batch1Qty);
            const b2Qty = Math.max(0, splitConfig.batch2Qty);
            if (b1Qty > 0) {
              d1Items.push({
                ...item,
                qty: b1Qty,
                available: true,
                picked: true,
                currentHubAvailable: true,
                sourceHub: "Central Hub Desk",
                deliveryGroup: "Delivery 1"
              });
            }
            if (b2Qty > 0) {
              d2Items.push({
                ...item,
                qty: b2Qty,
                available: false,
                picked: false,
                currentHubAvailable: false,
                sourceHub: "Warehouse Stock / Arranging",
                deliveryGroup: "Delivery 2"
              });
            }
          } else {
            // Index-based fallback
            const isPacked = Array.isArray(packedItemIndicesOrSplits) && packedItemIndicesOrSplits.includes(idx);
            if (isPacked) {
              d1Items.push({
                ...item,
                available: true,
                picked: true,
                currentHubAvailable: true,
                sourceHub: "Central Hub Desk",
                deliveryGroup: "Delivery 1"
              });
            } else {
              d2Items.push({
                ...item,
                available: false,
                picked: false,
                currentHubAvailable: false,
                sourceHub: "Warehouse Stock / Arranging",
                deliveryGroup: "Delivery 2"
              });
            }
          }
        });

        deductInventoryStock(d1Items);

        const delivery1 = {
          id: `${order.id}-A`,
          deliveryNumber: 1,
          deliveryGroup: "Delivery 1 – Immediate Dispatch",
          sourceHub: "MediUnify Central Hub",
          isCurrentHub: true,
          status: "CaptainAssigned",
          captain: selectedCaptain,
          handoverOtp: "4921",
          items: d1Items,
          timeline: [
            {
              status: "Accepted",
              timestamp: nowFormatted,
              description: "Prescription verified"
            },
            {
              status: "Packed",
              timestamp: nowFormatted,
              description: `Packed ${d1Items.length} available medicines in tamper-proof security bag (Batch 1)`
            },
            {
              status: "CaptainAssigned",
              timestamp: nowFormatted,
              description: `Captain ${selectedCaptain.name} assigned for Delivery 1 pickup (ETA ${selectedCaptain.etaMins} mins)`
            }
          ]
        };

        const defaultMsg = `Dear ${order.patientName}, ${d1Items.length} medicines from your order #${order.id} are packed and dispatched. The remaining ${d2Items.length} medicine(s) are being arranged from our hub supplier and will be delivered within ${remainingEta}.`;

        const delivery2 = {
          id: `${order.id}-B`,
          deliveryNumber: 2,
          deliveryGroup: "Delivery 2 – Remaining Medicines",
          sourceHub: "Arranging from Central Hub Stock",
          isCurrentHub: true,
          status: "PendingArrangement",
          captain: null,
          handoverOtp: "8312",
          remainingEta: remainingEta || "Within 2 to 3 hours",
          patientInformed: true,
          patientMessage: customPatientMessage || defaultMsg,
          items: d2Items,
          timeline: [
            {
              status: "In Progress",
              timestamp: nowFormatted,
              description: `Remaining ${d2Items.length} medicine(s) pending arrangement. Patient notified (ETA: ${remainingEta}).`
            }
          ]
        };

        const newTimeline = [
          ...order.timeline,
          {
            status: "Split Delivery",
            timestamp: nowFormatted,
            description: `Split Delivery confirmed: Batch 1 (${d1Items.length} medicines packed & assigned to Captain ${selectedCaptain.name}). Batch 2 (${d2Items.length} medicines) in progress — patient notified of delivery within ${remainingEta}.`
          }
        ];

        return {
          ...order,
          isSplit: true,
          status: "Split Delivery",
          remainingEta: remainingEta,
          patientNotificationSent: true,
          patientNotificationMessage: customPatientMessage || defaultMsg,
          items: [...d1Items, ...d2Items],
          deliveries: [delivery1, delivery2],
          timeline: newTimeline
        };
      })
    );

    // Add notification
    setNotifications(prev => [
      {
        id: `NOTIF-SPLIT-${Date.now()}`,
        title: "📦 Split Delivery Dispatched",
        message: `Order #${orderId}: Batch 1 (picked items) assigned to fleet. Remaining items in progress (ETA: ${remainingEta}).`,
        time: "Just now",
        type: "order",
        orderId: orderId,
        read: false
      },
      ...prev
    ]);
  };

  const packRemainingBatch = (orderId, deliveryId = null) => {
    const secondCaptain = captains[1] || {
      id: "CAP02",
      name: "Ramesh K.",
      phone: "+91 98450 67891",
      vehicle: "Honda Activa · KA-09-EB-7718",
      etaMins: 3
    };
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        if (!order.deliveries) return order;

        const updatedDeliveries = order.deliveries.map(del => {
          if (deliveryId ? del.id === deliveryId : del.deliveryNumber === 2 || del.status === "PendingArrangement") {
            deductInventoryStock(del.items);
            const updatedItems = del.items.map(item => ({ ...item, available: true, picked: true }));
            const newDelTimeline = [
              ...(del.timeline || []),
              {
                status: "Packed",
                timestamp: nowFormatted,
                description: `Remaining ${del.items.length} medicines arranged, verified & packed in security bag`
              },
              {
                status: "CaptainAssigned",
                timestamp: nowFormatted,
                description: `Captain ${secondCaptain.name} assigned for Delivery 2 pickup (ETA ${secondCaptain.etaMins} mins)`
              }
            ];
            return {
              ...del,
              status: "CaptainAssigned",
              captain: secondCaptain,
              handoverOtp: "8312",
              items: updatedItems,
              timeline: newDelTimeline
            };
          }
          return del;
        });

        const newTimeline = [
          ...order.timeline,
          {
            status: "Split Delivery (Batch 2 Packed)",
            timestamp: nowFormatted,
            description: `Batch 2 stock arranged & packed. Captain ${secondCaptain.name} assigned for second parcel pickup.`
          }
        ];

        return {
          ...order,
          deliveries: updatedDeliveries,
          timeline: newTimeline
        };
      })
    );
  };

  // =========================================================================
  // MULTI-PHARMACY SPLIT DELIVERY BROADCAST & AVAILABILITY ENGINE
  // =========================================================================

  const broadcastMissingItemsToNetwork = (orderId, missingItems = []) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const broadcastId = `BC-${orderId}-${Date.now().toString().slice(-4)}`;

    const itemsToBroadcast = missingItems && missingItems.length > 0
      ? missingItems
      : (targetOrder ? targetOrder.items.filter(it => it.picked === false || it.available === false) : []);

    const newBroadcast = {
      id: broadcastId,
      originalOrderId: orderId,
      patientName: targetOrder?.patientName || "Ravi Kumar",
      patientArea: targetOrder?.deliveryAddress || "Kuvempunagar, Mysuru",
      totalPrescriptionMedicines: targetOrder?.items?.length || 5,
      hubAvailableCount: Math.max(0, (targetOrder?.items?.length || 5) - itemsToBroadcast.length),
      missingItemsCount: itemsToBroadcast.length,
      itemsToSource: itemsToBroadcast.map(it => ({
        id: it.id || "MED-BC",
        name: it.name,
        qty: it.qty || 1,
        unitPrice: it.unitPrice || 100,
        dosage: it.dosage || "As prescribed",
        hsn: it.hsn || "30049099",
        schedule: it.schedule || "Schedule H"
      })),
      status: "ResponsesReceived",
      broadcastTimestamp: nowFormatted,
      expiresInSeconds: 300,
      responses: [
        {
          pharmacyId: "TP-APEX-01",
          pharmacyName: "Apex Pharmacy & Healthcare",
          facilityName: "Apex Multiple Pharmacy Store",
          address: "Electronic City Phase 1 · 2.4 km away",
          phone: "+91 80 4123 9900",
          pharmacist: "Dr. Meera Nambiar (B.Pharm, Pharm.D)",
          licenseNumber: "20B-KA-BLR-2024-9912",
          rating: 4.85,
          matchStatus: "FULL_MATCH",
          matchPercentage: 100,
          matchSummary: `Both ${itemsToBroadcast.length} of ${itemsToBroadcast.length} items in stock (Verified)`,
          readyInMins: 10,
          isRecommended: true,
          itemsStock: itemsToBroadcast.map((it, idx) => ({
            name: it.name,
            inStock: true,
            stockQty: idx === 0 ? 42 : 35,
            batch: idx === 0 ? "GSK-4412-B" : "ALK-2026-90",
            expiry: idx === 0 ? "2027-08" : "2027-11",
            rack: idx === 0 ? "Section A-03 / Vault" : "Section C-01 / Shelf 2"
          })),
          responseTime: "Responded in 24s",
          respondedAt: nowFormatted
        },
        {
          pharmacyId: "TP-MEDPLUS-02",
          pharmacyName: "MedPlus Pharmacy Store",
          facilityName: "MedPlus Kuvempunagar Store",
          address: "Saraswathipuram · 3.8 km away",
          phone: "+91 821 254 7711",
          pharmacist: "Rajesh Kumar (M.Pharm)",
          licenseNumber: "20B-KA-MYS-2025-4421",
          rating: 4.75,
          matchStatus: "FULL_MATCH",
          matchPercentage: 100,
          matchSummary: `Both ${itemsToBroadcast.length} of ${itemsToBroadcast.length} items in stock (Verified)`,
          readyInMins: 15,
          isRecommended: false,
          itemsStock: itemsToBroadcast.map((it, idx) => ({
            name: it.name,
            inStock: true,
            stockQty: idx === 0 ? 18 : 12,
            batch: idx === 0 ? "AUG-3321" : "ALK-9981-M",
            expiry: idx === 0 ? "2027-04" : "2027-05",
            rack: idx === 0 ? "Rack M2-01" : "Rack M1-04"
          })),
          responseTime: "Responded in 58s",
          respondedAt: nowFormatted
        },
        {
          pharmacyId: "TP-APOLLO-03",
          pharmacyName: "Apollo Pharmacy Store",
          facilityName: "Apollo Gokulam Store",
          address: "Gokulam 3rd Stage · 5.2 km away",
          phone: "+91 821 241 8833",
          pharmacist: "S. Swaminathan (B.Pharm)",
          licenseNumber: "20B-KA-MYS-2024-3319",
          rating: 4.65,
          matchStatus: "PARTIAL_MATCH",
          matchPercentage: Math.max(50, Math.floor(100 / (itemsToBroadcast.length || 1))),
          matchSummary: `1 of ${itemsToBroadcast.length} items available`,
          readyInMins: 25,
          isRecommended: false,
          itemsStock: itemsToBroadcast.map((it, idx) => ({
            name: it.name,
            inStock: idx === 0,
            stockQty: idx === 0 ? 14 : 0,
            batch: idx === 0 ? "AUG-7714" : null,
            expiry: idx === 0 ? "2026-12" : null,
            rack: idx === 0 ? "Section B-02" : null
          })),
          responseTime: "Responded in 1m 15s",
          respondedAt: nowFormatted
        }
      ],
      selectedPharmacyId: null
    };

    setNetworkBroadcasts(prev => [newBroadcast, ...prev.filter(b => b.originalOrderId !== orderId)]);

    setNotifications(prev => [
      {
        id: `NOTIF-BC-${Date.now()}`,
        title: "📡 Network Broadcast Sent",
        message: `Order #${orderId}: Pushed ${itemsToBroadcast.length} missing medicines to partner pharmacies. Responses received!`,
        time: "Just now",
        type: "order",
        orderId: orderId,
        read: false
      },
      ...prev
    ]);

    return newBroadcast;
  };

  const selectPartnerAndSplitOrder = (orderId, broadcastId, selectedPharmacyId, eta = "Within 2 to 3 hours", customMessage = "") => {
    const selectedPharmacy = tpPharmacies[selectedPharmacyId] || MOCK_TP_PHARMACIES[selectedPharmacyId] || MOCK_TP_PHARMACIES["TP-APEX-01"];
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const selectedCaptain = captains[0] || {
      id: "CAP01",
      name: "Suresh B.",
      phone: "+91 98450 11223",
      vehicle: "TVS Jupiter · KA-09-EA-4412",
      etaMins: 4
    };

    let targetOrder = null;
    const hubItems = [];
    const partnerItems = [];

    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        targetOrder = order;

        order.items.forEach((item) => {
          if (item.picked !== false && item.available !== false) {
            hubItems.push({
              ...item,
              available: true,
              picked: true,
              currentHubAvailable: true,
              sourceHub: "Central Hub Desk",
              deliveryGroup: "Delivery 1"
            });
          } else {
            partnerItems.push({
              ...item,
              available: true,
              picked: false,
              currentHubAvailable: false,
              sourceHub: selectedPharmacy.name,
              deliveryGroup: "Delivery 2"
            });
          }
        });

        // Ensure partition matches 3 at Hub and 2 at Partner
        if (partnerItems.length === 0 && order.items.length >= 2) {
          const p1 = hubItems.pop();
          const p2 = hubItems.pop();
          if (p1) partnerItems.push({ ...p1, picked: false, sourceHub: selectedPharmacy.name, deliveryGroup: "Delivery 2" });
          if (p2) partnerItems.push({ ...p2, picked: false, sourceHub: selectedPharmacy.name, deliveryGroup: "Delivery 2" });
        }

        deductInventoryStock(hubItems);

        const delivery1 = {
          id: `${order.id}-A`,
          deliveryNumber: 1,
          deliveryGroup: "Delivery 1 – Immediate Central Hub Dispatch",
          sourceHub: "MediUnify Central Hub",
          isCurrentHub: true,
          status: "CaptainAssigned",
          captain: selectedCaptain,
          handoverOtp: "4921",
          items: hubItems,
          timeline: [
            {
              status: "Accepted",
              timestamp: nowFormatted,
              description: "Prescription verified"
            },
            {
              status: "Packed",
              timestamp: nowFormatted,
              description: `Packed ${hubItems.length} available medicines in security bag (Batch 1)`
            },
            {
              status: "CaptainAssigned",
              timestamp: nowFormatted,
              description: `Captain ${selectedCaptain.name} assigned for Delivery 1 pickup (ETA ${selectedCaptain.etaMins} mins)`
            }
          ]
        };

        const defaultMsg = `Dear ${order.patientName}, ${hubItems.length} medicines from your order #${order.id} are packed & dispatched from Central Hub. The remaining ${partnerItems.length} medicine(s) have been verified in stock at ${selectedPharmacy.name} and will be picked, packed & delivered within ${eta}.`;

        const linkedTpId = `EXT-${order.id}`;

        const delivery2 = {
          id: `${order.id}-B`,
          deliveryNumber: 2,
          deliveryGroup: `Delivery 2 – Sourced from ${selectedPharmacy.name}`,
          sourceHub: selectedPharmacy.name,
          isCurrentHub: false,
          isPartnerSourced: true,
          partnerPharmacyId: selectedPharmacyId,
          partnerPharmacyName: selectedPharmacy.name,
          partnerAddress: selectedPharmacy.address,
          partnerPhone: selectedPharmacy.phone,
          partnerPharmacist: selectedPharmacy.pharmacistName,
          partnerLicense: selectedPharmacy.licenseNumber,
          status: "PartnerPicking",
          linkedTpOrderId: linkedTpId,
          captain: null,
          handoverOtp: "8312",
          remainingEta: eta || "Within 2 to 3 hours",
          patientInformed: true,
          patientMessage: customMessage || defaultMsg,
          items: partnerItems,
          timeline: [
            {
              status: "Broadcast Dispatched",
              timestamp: nowFormatted,
              description: `Pushed ${partnerItems.length} missing items to multiple pharmacies in network.`
            },
            {
              status: "Availability Confirmed",
              timestamp: nowFormatted,
              description: `${selectedPharmacy.name} confirmed 100% stock availability. Hub member selected store.`
            },
            {
              status: "Partner Picking",
              timestamp: nowFormatted,
              description: `Order assigned to ${selectedPharmacy.name}. Registered Pharmacist ${selectedPharmacy.pharmacistName} picking medicines.`
            }
          ]
        };

        const newTimeline = [
          ...order.timeline,
          {
            status: "Split Delivery Activated",
            timestamp: nowFormatted,
            description: `Network Sourcing Complete: ${hubItems.length} items packed at Hub (Captain ${selectedCaptain.name}). ${partnerItems.length} items routed to ${selectedPharmacy.name} after 100% availability response.`
          }
        ];

        return {
          ...order,
          isSplit: true,
          status: "Split Delivery",
          remainingEta: eta,
          patientNotificationSent: true,
          patientNotificationMessage: customMessage || defaultMsg,
          items: [...hubItems, ...partnerItems],
          deliveries: [delivery1, delivery2],
          timeline: newTimeline
        };
      })
    );

    // Update broadcast status
    setNetworkBroadcasts(prev =>
      prev.map(b => (b.id === broadcastId || b.originalOrderId === orderId)
        ? { ...b, status: "Assigned", selectedPharmacyId: selectedPharmacyId }
        : b
      )
    );

    // Create / update external order for this partner in tpOrders
    const linkedTpId = `EXT-${orderId}`;
    const newTpOrder = {
      id: linkedTpId,
      originalOrderId: orderId,
      isSplitOrder: true,
      splitGroup: "Delivery 2 of 2",
      splitNote: `Patient ordered 5 items. 3 items fulfilled by Central Hub (immediate dispatch). 2 items (${partnerItems.map(i => i.name).join(", ")}) routed to your store following network availability confirmation.`,
      pharmacyId: selectedPharmacyId,
      pharmacyName: selectedPharmacy.name,
      patientName: targetOrder?.patientName || "Ravi Kumar",
      patientPhoneMasked: targetOrder?.patientPhone ? targetOrder.patientPhone.slice(0, 8) + "•••" + targetOrder.patientPhone.slice(-2) : "+91 98765 •••10",
      patientAge: targetOrder?.patientAge || 42,
      patientGender: targetOrder?.patientGender || "Male",
      doctorName: targetOrder?.doctorName || "Dr. S. K. Narang (MBBS, MD)",
      clinicName: targetOrder?.clinicName || "Apollo Medical Clinic",
      prescriptionVerifiedByAdmin: true,
      adminAssignmentTimestamp: nowFormatted,
      assignmentReason: `Selected by Hub Pharmacist via Network Availability Response · 100% Stock Match`,
      status: "Picking",
      rejectionReason: null,
      items: partnerItems.map((item, idx) => ({
        inventoryId: `TPMED-00${idx + 1}`,
        name: item.name,
        brand: item.name.split(" ")[0],
        strength: item.name.includes("625") ? "625mg" : item.name.includes("Pan") ? "40mg/30mg" : "Standard",
        dosageForm: item.name.includes("Capsule") ? "Capsule" : "Tablet",
        manufacturer: item.name.includes("Aug") ? "GlaxoSmithKline Pharmaceuticals" : "Alkem Laboratories Ltd",
        quantity: item.qty || 1,
        unitPrice: item.unitPrice || 195.0,
        dosage: item.dosage,
        allocatedBatch: idx === 0 ? "GSK-4412-B" : "ALK-2026-90",
        allocatedExpiry: idx === 0 ? "2027-08" : "2027-11",
        rackLocation: idx === 0 ? "Section A-03 / Vault (Schedule H)" : "Section C-01 / Shelf 2",
        picked: false,
        verified: true
      })),
      deliveryAddressArea: targetOrder?.deliveryAddress || "Kuvempunagar, Mysuru · Zone South",
      deliveryInstructions: targetOrder?.deliveryInstructions || "Security gate handover if patient unavailable",
      distanceKm: selectedPharmacy.deliveryRadiusKm || 2.4,
      paymentMethod: "UPI Prepaid (MediUnify Hub Escrow)",
      paymentStatus: "Escrow Held by Admin",
      subtotal: partnerItems.reduce((acc, i) => acc + (i.unitPrice || 100) * (i.qty || 1), 0),
      taxAmount: 47.16,
      deliveryFee: 0.0,
      partnerSettlementAmount: 373.35,
      packagingPouchId: null,
      captain: null,
      handoverOtp: "8312",
      timeline: [
        {
          status: "Network Broadcast Received",
          timestamp: nowFormatted,
          description: "Central Hub broadcasted 2 missing medicines request to multiple stores."
        },
        {
          status: "Availability Sent",
          timestamp: nowFormatted,
          description: "Your pharmacy responded: 100% stock available (ready in 10 mins)."
        },
        {
          status: "Selected & Assigned",
          timestamp: nowFormatted,
          description: "Hub Pharmacist selected your pharmacy. Ready for picking & packing."
        }
      ]
    };

    setTpOrders(prev => [newTpOrder, ...prev.filter(o => o.originalOrderId !== orderId && o.id !== linkedTpId)]);

    // Update Admin Split Tracking Matrix
    setAdminSplitTracking(prev => ({
      ...prev,
      originalOrder: {
        ...prev.originalOrder,
        id: orderId,
        patientName: targetOrder?.patientName || "Ravi Kumar",
        overallStatus: "Split Fulfilment Active (Hub + Partner)"
      },
      hubFulfilment: {
        partNumber: "Part 1 of 2 (Central Hub)",
        deliveryId: `${orderId}-A`,
        fulfilledBy: "MediUnify Central Hub (Mysuru)",
        itemsCount: hubItems.length,
        items: hubItems.map(i => ({ name: i.name, qty: i.qty, status: "Packed & Picked" })),
        status: "Captain Assigned / Out for Delivery",
        captain: "Suresh B. (TVS Jupiter · KA-09-EA-4412)",
        eta: "4 mins"
      },
      thirdPartyFulfilment: {
        partNumber: "Part 2 of 2 (Multiple Pharmacy Partner)",
        deliveryId: linkedTpId,
        assignedTo: selectedPharmacy.name,
        assignedPharmacist: `${selectedPharmacy.pharmacistName} (Reg. Pharmacist)`,
        itemsCount: partnerItems.length,
        items: partnerItems.map(i => ({ name: i.name, qty: i.qty, reason: "Sourced via Network Broadcast" })),
        status: "Assigned & Pharmacist Picking",
        reassignmentOptions: []
      }
    }));

    setNotifications(prev => [
      {
        id: `NOTIF-ASSIGN-${Date.now()}`,
        title: "✅ Partner Pharmacy Selected",
        message: `${selectedPharmacy.name} selected for Batch 2 (2 items). Pharmacist notified to start picking & packing.`,
        time: "Just now",
        type: "order",
        orderId: orderId,
        read: false
      },
      ...prev
    ]);
  };

  const simulatePartnerPickPack = (orderId) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const matchingOrder = tpOrders.find(o => o.originalOrderId === orderId || o.id === `EXT-${orderId}` || o.id === "EXT-ORD2001");
    const tpId = matchingOrder ? matchingOrder.id : `EXT-${orderId}`;
    const pouchId = `PCH-TP-${Math.floor(1000 + Math.random() * 9000)}`;
    const sealNo = `SL-${Math.floor(10000 + Math.random() * 90000)}`;

    tpPackOrder(tpId, pouchId, sealNo);

    // Sync Central Hub deliveries[1]
    setOrders(prev =>
      prev.map(hubOrder => {
        if (!hubOrder.deliveries) return hubOrder;
        const matchesHub = hubOrder.id === orderId || (matchingOrder && hubOrder.id === matchingOrder.originalOrderId);
        if (!matchesHub) return hubOrder;

        const updatedDeliveries = hubOrder.deliveries.map(del => {
          if (del.deliveryNumber === 2 || del.isPartnerSourced || del.linkedTpOrderId === tpId) {
            return {
              ...del,
              status: "PackedAtPartner",
              packagingPouchId: pouchId,
              tamperSealNumber: sealNo,
              captain: {
                id: "CAP-TP-01",
                name: "Kiran Gowda",
                phone: "+91 98455 22110",
                vehicle: "Honda Activa · KA-05-MN-2022",
                etaMins: 5
              },
              timeline: [
                ...(del.timeline || []),
                {
                  status: "Packed at Partner Store",
                  timestamp: nowFormatted,
                  description: `Partner Pharmacist packed medicines in tamper-proof pouch #${pouchId} (Seal: ${sealNo}). Fleet assigned.`
                }
              ]
            };
          }
          return del;
        });

        return {
          ...hubOrder,
          deliveries: updatedDeliveries
        };
      })
    );

    setNotifications(prev => [
      {
        id: `NOTIF-PACKED-${Date.now()}`,
        title: "📦 Partner Pharmacy Packed Batch 2",
        message: `Partner Store packed the 2 medicines for Order #${orderId} in pouch #${pouchId}. Captain assigned!`,
        time: "Just now",
        type: "order",
        orderId: orderId,
        read: false
      },
      ...prev
    ]);
  };

  const updateDeliveryStatus = (orderId, deliveryId, newStatus, extraData = {}) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        if (!order.deliveries) return order;

        const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const updatedDeliveries = order.deliveries.map(del => {
          if (del.id !== deliveryId) return del;
          const newTimeline = [
            ...(del.timeline || []),
            {
              status: newStatus,
              timestamp: nowFormatted,
              description: extraData.timelineDescription || `Delivery status updated to ${newStatus}`
            }
          ];
          return {
            ...del,
            status: newStatus,
            timeline: newTimeline,
            ...extraData
          };
        });

        // Determine overall order status
        const allCompleted = updatedDeliveries.every(d => d.status === "Delivered" || d.status === "HandedOver");
        const anyDelivered = updatedDeliveries.some(d => d.status === "Delivered" || d.status === "HandedOver");

        let overallStatus = order.status;
        if (allCompleted) {
          overallStatus = "HandedOver";
        } else if (anyDelivered) {
          overallStatus = "Split Delivery";
        } else {
          overallStatus = "Split Delivery";
        }

        const newOrderTimeline = [
          ...order.timeline,
          {
            status: overallStatus,
            timestamp: nowFormatted,
            description: `${deliveryId} updated to ${newStatus}. Overall order: ${overallStatus}`
          }
        ];

        return {
          ...order,
          status: overallStatus,
          deliveries: updatedDeliveries,
          timeline: newOrderTimeline
        };
      })
    );
  };

  const toggleDeliveryItemPicked = (orderId, deliveryId, itemIndex) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId || !order.deliveries) return order;
        const updatedDeliveries = order.deliveries.map(del => {
          if (del.id !== deliveryId) return del;
          const updatedItems = del.items.map((item, idx) =>
            idx === itemIndex ? { ...item, picked: !item.picked } : item
          );
          return { ...del, items: updatedItems };
        });
        return { ...order, deliveries: updatedDeliveries };
      })
    );
  };

  const markDeliveryPackedAndNotifyFleet = (orderId, deliveryId) => {
    const selectedCaptain = captains[0] || {
      id: "CAP01",
      name: "Suresh B.",
      phone: "+91 98450 11223",
      vehicle: "TVS Jupiter · KA-09-EA-4412",
      etaMins: 4
    };
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    updateDeliveryStatus(orderId, deliveryId, "CaptainAssigned", {
      captain: selectedCaptain,
      handoverOtp: "4921",
      timelineDescription: `Delivery packed and sealed. Captain ${selectedCaptain.name} assigned for pickup (ETA ${selectedCaptain.etaMins} mins)`
    });
  };

  const confirmDeliveryHandover = (orderId, deliveryId, enteredOtp, handoverProofPhoto) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };
    const delivery = order.deliveries?.find(d => d.id === deliveryId);
    if (!delivery) return { success: false, message: "Delivery not found" };

    if (!handoverProofPhoto) {
      return { success: false, message: "Please upload or capture a photo proof of the package handover." };
    }

    if (delivery.handoverOtp && enteredOtp !== delivery.handoverOtp) {
      return { success: false, message: `Invalid OTP. Ask captain for the correct 4-digit code (Demo OTP: ${delivery.handoverOtp})` };
    }

    const nowIso = new Date().toISOString();
    updateDeliveryStatus(orderId, deliveryId, "HandedOver", {
      handoverTime: nowIso,
      handoverProofPhoto: handoverProofPhoto,
      timelineDescription: `OTP ${enteredOtp} verified · Package handover photo captured · Handed to Captain ${delivery.captain?.name || "Delivery Partner"}`
    });

    // Check if other deliveries are also handed over or pending
    const otherDeliveries = order.deliveries?.filter(d => d.id !== deliveryId) || [];
    const allOthersHandedOver = otherDeliveries.every(d => d.status === "HandedOver" || d.status === "Delivered");

    if (allOthersHandedOver) {
      setSettlements(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + order.totalAmount,
        totalOrdersCompleted: prev.totalOrdersCompleted + 1
      }));
    }

    return { success: true };
  };

  // Notification actions
  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Inventory actions
  const updateInventoryStock = (itemId, newStockQuantity) => {
    const qty = Math.max(0, parseInt(newStockQuantity, 10) || 0);
    setInventory(prev =>
      prev.map(item => (item.id === itemId ? { ...item, stock: qty } : item))
    );
    if (currentUser?.isThirdParty || currentUser?.role === "third_party") {
      const pharmId = currentUser.pharmacyId || "TP-APEX-01";
      setTpInventories(prev => {
        const list = prev[pharmId] || [];
        const updatedList = list.map(item =>
          item.id === itemId ? { ...item, stock: qty } : item
        );
        return { ...prev, [pharmId]: updatedList };
      });
    }
  };

  const quickAdjustStock = (itemId, deltaQty) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updated = Math.max(0, item.stock + deltaQty);
        return { ...item, stock: updated };
      })
    );
    if (currentUser?.isThirdParty || currentUser?.role === "third_party") {
      const pharmId = currentUser.pharmacyId || "TP-APEX-01";
      setTpInventories(prev => {
        const list = prev[pharmId] || [];
        const updatedList = list.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, stock: Math.max(0, item.stock + deltaQty) };
        });
        return { ...prev, [pharmId]: updatedList };
      });
    }
  };

  const toggleInventoryItemStatus = (itemId) => {
    setInventory(prev =>
      prev.map(item => (item.id === itemId ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const addInventoryItem = (newItem) => {
    const isTP = currentUser?.isThirdParty || currentUser?.role === "third_party";
    const prefix = isTP ? "TPMED-" : "MED-";
    const generatedId = newItem.id || `${prefix}${String(inventory.length + 1).padStart(3, "0")}`;
    const formattedItem = {
      id: generatedId,
      name: newItem.name.trim(),
      genericName: newItem.genericName?.trim() || newItem.name.trim(),
      manufacturer: newItem.manufacturer?.trim() || "Generic Pharma",
      category: newItem.category || "General",
      unit: newItem.unit || "Strip of 10 Tablets",
      stock: Math.max(0, parseInt(newItem.stock, 10) || 0),
      minStockThreshold: Math.max(1, parseInt(newItem.minStockThreshold, 10) || 15),
      batchNumber: newItem.batchNumber?.trim() || "BAT-" + Math.floor(1000 + Math.random() * 9000),
      mfgDate: newItem.mfgDate || "2026-01",
      expiryDate: newItem.expiryDate || "2028-12",
      rackLocation: newItem.rackLocation?.trim() || "Rack A-01 / Shelf 1",
      mrp: parseFloat(newItem.mrp) || 100,
      sellingPrice: parseFloat(newItem.sellingPrice) || parseFloat(newItem.mrp) || 100,
      hsn: newItem.hsn?.trim() || "30049099",
      gstRate: parseInt(newItem.gstRate, 10) || 12,
      isScheduleH: Boolean(newItem.isScheduleH),
      isActive: newItem.isActive !== undefined ? newItem.isActive : true
    };

    setInventory(prev => [formattedItem, ...prev]);

    if (isTP) {
      const pharmId = currentUser.pharmacyId || "TP-APEX-01";
      setTpInventories(prev => ({
        ...prev,
        [pharmId]: [
          {
            id: formattedItem.id,
            name: formattedItem.name,
            brand: formattedItem.genericName,
            manufacturer: formattedItem.manufacturer,
            category: formattedItem.category,
            unit: formattedItem.unit,
            stock: formattedItem.stock,
            minStockThreshold: formattedItem.minStockThreshold,
            batchNumber: formattedItem.batchNumber,
            mfgDate: formattedItem.mfgDate,
            expiryDate: formattedItem.expiryDate,
            rackLocation: formattedItem.rackLocation,
            unitPrice: formattedItem.sellingPrice,
            isScheduleH: formattedItem.isScheduleH,
            isActive: true,
            isAvailableForFulfilment: true
          },
          ...(prev[pharmId] || [])
        ]
      }));
    }

    return formattedItem;
  };

  const updateInventoryItem = (itemId, updatedFields) => {
    setInventory(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteInventoryItem = (itemId) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const restockItem = (itemId, addedQty, newBatch, newExpiry) => {
    const qty = Math.max(0, parseInt(addedQty, 10) || 0);
    setInventory(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          stock: item.stock + qty,
          batchNumber: newBatch ? newBatch.trim() : item.batchNumber,
          expiryDate: newExpiry ? newExpiry.trim() : item.expiryDate
        };
      })
    );
    if (currentUser?.isThirdParty || currentUser?.role === "third_party") {
      const pharmId = currentUser.pharmacyId || "TP-APEX-01";
      setTpInventories(prev => {
        const list = prev[pharmId] || [];
        const updatedList = list.map(item => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            stock: item.stock + qty,
            batchNumber: newBatch ? newBatch.trim() : item.batchNumber,
            expiryDate: newExpiry ? newExpiry.trim() : item.expiryDate
          };
        });
        return { ...prev, [pharmId]: updatedList };
      });
    }
  };

  const bulkUpdateStockFromExcel = (updatesList = []) => {
    if (!Array.isArray(updatesList) || updatesList.length === 0) {
      return { success: false, updatedCount: 0, totalUnitsAdded: 0 };
    }

    let updatedCount = 0;
    let totalUnitsAdded = 0;
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setInventory(prev => {
      const nextList = prev.map(invItem => {
        const match = updatesList.find(u => {
          if (u.id && invItem.id && String(u.id).trim().toUpperCase() === String(invItem.id).trim().toUpperCase()) return true;
          if (u.sku && invItem.id && String(u.sku).trim().toUpperCase() === String(invItem.id).trim().toUpperCase()) return true;
          if (u.name && invItem.name && String(u.name).trim().toLowerCase() === String(invItem.name).trim().toLowerCase()) return true;
          return false;
        });

        if (!match) return invItem;

        updatedCount += 1;
        let newStock = invItem.stock;
        if (match.addStockQty !== undefined && !isNaN(parseInt(match.addStockQty, 10))) {
          const delta = parseInt(match.addStockQty, 10);
          newStock = Math.max(0, invItem.stock + delta);
          totalUnitsAdded += Math.max(0, delta);
        } else if (match.newStock !== undefined && !isNaN(parseInt(match.newStock, 10))) {
          const target = Math.max(0, parseInt(match.newStock, 10));
          if (target > invItem.stock) {
            totalUnitsAdded += (target - invItem.stock);
          }
          newStock = target;
        }

        return {
          ...invItem,
          stock: newStock,
          batchNumber: match.batchNumber ? String(match.batchNumber).trim() : invItem.batchNumber,
          expiryDate: match.expiryDate ? String(match.expiryDate).trim() : invItem.expiryDate,
          sellingPrice: match.sellingPrice && !isNaN(parseFloat(match.sellingPrice)) ? parseFloat(match.sellingPrice) : invItem.sellingPrice,
          lastStockAdjusted: nowFormatted,
          adjustmentReason: "Bulk Excel Inward Sheet Update"
        };
      });
      return nextList;
    });

    if (currentUser?.isThirdParty || currentUser?.role === "third_party") {
      const pharmId = currentUser.pharmacyId || "TP-APEX-01";
      setTpInventories(prev => {
        const list = prev[pharmId] || [];
        const updatedList = list.map(invItem => {
          const match = updatesList.find(u => {
            if (u.id && invItem.id && String(u.id).trim().toUpperCase() === String(invItem.id).trim().toUpperCase()) return true;
            if (u.sku && invItem.id && String(u.sku).trim().toUpperCase() === String(invItem.id).trim().toUpperCase()) return true;
            if (u.name && invItem.name && String(u.name).trim().toLowerCase() === String(invItem.name).trim().toLowerCase()) return true;
            return false;
          });

          if (!match) return invItem;

          let newStock = invItem.stock;
          if (match.addStockQty !== undefined && !isNaN(parseInt(match.addStockQty, 10))) {
            const delta = parseInt(match.addStockQty, 10);
            newStock = Math.max(0, invItem.stock + delta);
          } else if (match.newStock !== undefined && !isNaN(parseInt(match.newStock, 10))) {
            newStock = Math.max(0, parseInt(match.newStock, 10));
          }

          return {
            ...invItem,
            stock: newStock,
            batchNumber: match.batchNumber ? String(match.batchNumber).trim() : invItem.batchNumber,
            expiryDate: match.expiryDate ? String(match.expiryDate).trim() : invItem.expiryDate,
            lastStockAdjusted: nowFormatted,
            adjustmentReason: "Bulk Excel Inward Sheet Update"
          };
        });
        return { ...prev, [pharmId]: updatedList };
      });
    }

    return {
      success: true,
      updatedCount,
      totalUnitsAdded
    };
  };

  // Third-Party Isolated Getters
  const currentTpId = currentUser?.role === "third_party"
    ? (currentUser.pharmacyId || "TP-APEX-01")
    : "TP-APEX-01";

  const currentTpProfile = tpPharmacies[currentTpId] || MOCK_TP_PHARMACIES["TP-APEX-01"];
  const currentTpInventory = tpInventories[currentTpId] || [];
  const currentTpOrders = tpOrders.filter(o => o.pharmacyId === currentTpId);

  // Third-Party Order Lifecycle Handlers
  const tpCheckStock = (orderId) => {
    const order = tpOrders.find(o => o.id === orderId);
    if (!order) return { canFulfill: false, itemsCheck: [], issues: ["Order not found"] };

    const inv = tpInventories[order.pharmacyId] || [];
    const issues = [];
    const itemsCheck = order.items.map(orderItem => {
      const matched = inv.find(invItem =>
        invItem.id === orderItem.inventoryId ||
        invItem.name.toLowerCase().includes(orderItem.name.toLowerCase()) ||
        orderItem.name.toLowerCase().includes(invItem.name.toLowerCase())
      );

      if (!matched) {
        issues.push(`${orderItem.name}: Not stocked in your pharmacy inventory.`);
        return {
          ...orderItem,
          found: false,
          availableStock: 0,
          status: "Not Stocked",
          canDispense: false
        };
      }

      if (matched.isAvailableForFulfilment === false) {
        issues.push(`${orderItem.name}: Flagged as unavailable for external fulfilment.`);
        return {
          ...orderItem,
          found: true,
          availableStock: matched.stock,
          status: "Unavailable for Fulfilment",
          canDispense: false
        };
      }

      const isExpired = matched.expiryDate && (
        matched.expiryDate.startsWith("2025") ||
        matched.expiryDate.startsWith("2024") ||
        matched.expiryDate.startsWith("2023")
      );
      if (isExpired) {
        issues.push(`${orderItem.name}: Batch ${matched.batchNumber} is expired (${matched.expiryDate}). Distribution prohibited.`);
        return {
          ...orderItem,
          found: true,
          availableStock: matched.stock,
          status: "Expired Batch",
          canDispense: false
        };
      }

      if (matched.stock < orderItem.quantity) {
        issues.push(`${orderItem.name}: Insufficient stock (Needs ${orderItem.quantity}, Available: ${matched.stock}).`);
        return {
          ...orderItem,
          found: true,
          availableStock: matched.stock,
          status: "Insufficient Stock",
          canDispense: false
        };
      }

      return {
        ...orderItem,
        found: true,
        availableStock: matched.stock,
        batchNumber: matched.batchNumber,
        expiryDate: matched.expiryDate,
        status: "Available & Verified",
        canDispense: true
      };
    });

    const canFulfill = issues.length === 0;
    return { canFulfill, itemsCheck, issues };
  };

  const tpAcceptOrder = (orderId) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "Accepted",
          timeline: [
            ...o.timeline,
            {
              status: "Accepted",
              timestamp: nowFormatted,
              description: "Pharmacist verified inventory stock and accepted fulfilment."
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: "Accepted by Partner Pharmacist"
      }
    }));
  };

  const tpRejectOrder = (orderId, reason, reassignPharmacyId = null) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "Rejected",
          rejectionReason: reason,
          reassignedTo: reassignPharmacyId,
          timeline: [
            ...o.timeline,
            {
              status: "Rejected / Insufficient Stock",
              timestamp: nowFormatted,
              description: `Fulfilment rejected: ${reason}. Notification dispatched to MediUnify Admin for reassignment.`
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: `Rejected: ${reason} (Reassigned to ${reassignPharmacyId || "Alternative Partner"})`
      }
    }));
  };

  const tpToggleItemPicked = (orderId, itemIndex) => {
    setTpOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item, idx) =>
          idx === itemIndex ? { ...item, picked: !item.picked } : item
        );
        const allPicked = updatedItems.every(i => i.picked);
        return {
          ...order,
          items: updatedItems,
          status: allPicked ? "Picking" : order.status
        };
      })
    );
  };

  const tpUpdatePreparationStatus = (orderId, newStatus) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          timeline: [
            ...o.timeline,
            {
              status: newStatus,
              timestamp: nowFormatted,
              description: `Preparation status advanced to ${newStatus}`
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: newStatus
      }
    }));
  };

  const tpPackOrder = (orderId, { pouchId = "POUCH-APEX-88210", tamperSealNumber = "SEAL-KA-9901" } = {}) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Deduct stock from third party inventory
    const targetOrder = tpOrders.find(o => o.id === orderId);
    if (targetOrder) {
      setTpInventories(prev => {
        const pharmId = targetOrder.pharmacyId;
        const currentList = prev[pharmId] || [];
        const updatedList = currentList.map(invItem => {
          const matchingOrderItem = targetOrder.items.find(oi =>
            oi.inventoryId === invItem.id ||
            oi.name.toLowerCase().includes(invItem.name.toLowerCase())
          );
          if (matchingOrderItem) {
            const newStock = Math.max(0, invItem.stock - (matchingOrderItem.quantity || 1));
            return {
              ...invItem,
              stock: newStock,
              lastStockAdjusted: nowFormatted,
              adjustmentReason: `Dispensed for Order #${orderId}`
            };
          }
          return invItem;
        });
        return { ...prev, [pharmId]: updatedList };
      });
    }

    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "Packed",
          packagingPouchId: pouchId,
          tamperSealNumber: tamperSealNumber,
          captain: o.captain || {
            id: "CAP-TP-01",
            name: "Kiran Gowda",
            phone: "+91 98455 22110",
            vehicle: "Honda Activa · KA-05-MN-2022",
            etaMins: 5
          },
          timeline: [
            ...o.timeline,
            {
              status: "Packed",
              timestamp: nowFormatted,
              description: `Packed in tamper-proof pouch #${pouchId} (Seal: ${tamperSealNumber}). Fleet assigned.`
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: "Packed & Ready for Dispatch"
      }
    }));

    // Sync with Central Hub order if this was a split order
    setOrders(prev =>
      prev.map(hubOrder => {
        if (!hubOrder.deliveries) return hubOrder;
        const matchesHub = (targetOrder && hubOrder.id === targetOrder.originalOrderId) ||
          hubOrder.deliveries.some(d => d.linkedTpOrderId === orderId || d.isPartnerSourced);
        if (!matchesHub) return hubOrder;

        const updatedDeliveries = hubOrder.deliveries.map(del => {
          if (del.linkedTpOrderId === orderId || del.deliveryNumber === 2 || del.isPartnerSourced) {
            return {
              ...del,
              status: "PackedAtPartner",
              packagingPouchId: pouchId,
              tamperSealNumber: tamperSealNumber,
              captain: {
                id: "CAP-TP-01",
                name: "Kiran Gowda",
                phone: "+91 98455 22110",
                vehicle: "Honda Activa · KA-05-MN-2022",
                etaMins: 5
              },
              timeline: [
                ...(del.timeline || []),
                {
                  status: "Packed at Partner Store",
                  timestamp: nowFormatted,
                  description: `Partner Pharmacist packed medicines in tamper-proof pouch #${pouchId} (Seal: ${tamperSealNumber}). Fleet assigned.`
                }
              ]
            };
          }
          return del;
        });

        return {
          ...hubOrder,
          deliveries: updatedDeliveries
        };
      })
    );
  };

  const tpDispatchOrder = (orderId, dispatchInfo = {}) => {
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const cap = dispatchInfo.captain || o.captain || {
          id: "CAP-TP-01",
          name: "Kiran Gowda",
          phone: "+91 98455 22110",
          vehicle: "Honda Activa · KA-05-MN-2022",
          etaMins: 15
        };
        return {
          ...o,
          status: "Dispatched",
          captain: cap,
          timeline: [
            ...o.timeline,
            {
              status: "Dispatched",
              timestamp: nowFormatted,
              description: `Handed over to Captain ${cap.name}. Out for customer delivery.`
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: "Dispatched (Out for Delivery)"
      }
    }));
  };

  const tpDeliverOrder = (orderId, { enteredOtp, proofNote = "" } = {}) => {
    const order = tpOrders.find(o => o.id === orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.handoverOtp && enteredOtp && enteredOtp !== order.handoverOtp) {
      return { success: false, message: `Invalid OTP. Demo OTP is ${order.handoverOtp}` };
    }

    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: "Delivered",
          deliveredAt: nowFormatted,
          deliveryProofNote: proofNote || "Verified via recipient OTP authentication",
          timeline: [
            ...o.timeline,
            {
              status: "Delivered",
              timestamp: nowFormatted,
              description: `Successfully delivered to patient ${o.patientName} with OTP verification.`
            }
          ]
        };
      })
    );

    setAdminSplitTracking(prev => ({
      ...prev,
      thirdPartyFulfilment: {
        ...prev.thirdPartyFulfilment,
        status: "Delivered to Patient (Fulfilment Complete)"
      }
    }));

    return { success: true };
  };

  // Third-Party Inventory Operations
  const tpAddMedicine = (medicineData) => {
    const pharmId = currentTpId;
    const currentList = tpInventories[pharmId] || [];
    const newId = `TPMED-${String(currentList.length + 1).padStart(3, "0")}`;

    const newItem = {
      id: newId,
      name: medicineData.name?.trim() || "New Medicine",
      brand: medicineData.brand?.trim() || medicineData.name?.trim(),
      strength: medicineData.strength?.trim() || "",
      dosageForm: medicineData.dosageForm || "Tablet",
      manufacturer: medicineData.manufacturer?.trim() || "Generic Pharma",
      batchNumber: medicineData.batchNumber?.trim() || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: medicineData.expiryDate || "2027-12",
      stock: Math.max(0, parseInt(medicineData.stock, 10) || 0),
      minStockThreshold: Math.max(1, parseInt(medicineData.minStockThreshold, 10) || 10),
      unitPrice: parseFloat(medicineData.unitPrice) || 50.0,
      rackLocation: medicineData.rackLocation?.trim() || "Shelf 1",
      isScheduleH: Boolean(medicineData.isScheduleH),
      isActive: true,
      isAvailableForFulfilment: medicineData.isAvailableForFulfilment !== undefined ? medicineData.isAvailableForFulfilment : true,
      lastStockAdjusted: "Just now",
      adjustmentReason: "Newly registered SKU"
    };

    setTpInventories(prev => ({
      ...prev,
      [pharmId]: [newItem, ...(prev[pharmId] || [])]
    }));

    setInventory(prev => [
      {
        id: newItem.id,
        name: newItem.name,
        genericName: newItem.brand || newItem.name,
        manufacturer: newItem.manufacturer,
        category: "General Medicines",
        unit: `Pack of 10 ${newItem.dosageForm}s`,
        stock: newItem.stock,
        minStockThreshold: newItem.minStockThreshold,
        batchNumber: newItem.batchNumber,
        mfgDate: "2025-06",
        expiryDate: newItem.expiryDate,
        rackLocation: newItem.rackLocation,
        mrp: Number((newItem.unitPrice * 1.15).toFixed(2)),
        sellingPrice: newItem.unitPrice,
        hsn: "30049099",
        gstRate: 12,
        isScheduleH: newItem.isScheduleH,
        isActive: true
      },
      ...prev
    ]);

    return newItem;
  };

  const tpUpdateMedicine = (medicineId, updatedFields) => {
    const pharmId = currentTpId;
    setTpInventories(prev => {
      const list = prev[pharmId] || [];
      const updatedList = list.map(item =>
        item.id === medicineId ? { ...item, ...updatedFields } : item
      );
      return { ...prev, [pharmId]: updatedList };
    });

    setInventory(prev =>
      prev.map(item =>
        item.id === medicineId
          ? {
              ...item,
              ...updatedFields,
              sellingPrice: updatedFields.unitPrice !== undefined ? updatedFields.unitPrice : item.sellingPrice,
              stock: updatedFields.stock !== undefined ? updatedFields.stock : item.stock
            }
          : item
      )
    );
  };

  const tpAdjustStock = (medicineId, deltaQty, reason = "Manual stock adjustment") => {
    const pharmId = currentTpId;
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTpInventories(prev => {
      const list = prev[pharmId] || [];
      const updatedList = list.map(item => {
        if (item.id !== medicineId) return item;
        const newStock = Math.max(0, item.stock + deltaQty);
        return {
          ...item,
          stock: newStock,
          lastStockAdjusted: nowFormatted,
          adjustmentReason: reason
        };
      });
      return { ...prev, [pharmId]: updatedList };
    });

    setInventory(prev =>
      prev.map(item =>
        item.id === medicineId
          ? { ...item, stock: Math.max(0, item.stock + deltaQty) }
          : item
      )
    );
  };

  const tpRecordStockReceived = (medicineId, { receivedQty, batchNumber, expiryDate, invoiceNo, supplier } = {}) => {
    const pharmId = currentTpId;
    const qty = Math.max(0, parseInt(receivedQty, 10) || 0);
    const nowFormatted = "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setTpInventories(prev => {
      const list = prev[pharmId] || [];
      const updatedList = list.map(item => {
        if (item.id !== medicineId) return item;
        return {
          ...item,
          stock: item.stock + qty,
          batchNumber: batchNumber?.trim() || item.batchNumber,
          expiryDate: expiryDate?.trim() || item.expiryDate,
          lastStockAdjusted: nowFormatted,
          adjustmentReason: `Stock Received (+${qty}) · Inv #${invoiceNo || "DIR-GRN"} · ${supplier || "Authorized Distributor"}`
        };
      });
      return { ...prev, [pharmId]: updatedList };
    });

    setInventory(prev =>
      prev.map(item =>
        item.id === medicineId
          ? {
              ...item,
              stock: item.stock + qty,
              batchNumber: batchNumber?.trim() || item.batchNumber,
              expiryDate: expiryDate?.trim() || item.expiryDate
            }
          : item
      )
    );
  };

  const tpToggleMedicineAvailability = (medicineId) => {
    const pharmId = currentTpId;
    setTpInventories(prev => {
      const list = prev[pharmId] || [];
      const updatedList = list.map(item =>
        item.id === medicineId ? { ...item, isAvailableForFulfilment: !item.isAvailableForFulfilment } : item
      );
      return { ...prev, [pharmId]: updatedList };
    });
  };

  const tpDeleteMedicine = (medicineId) => {
    const pharmId = currentTpId;
    setTpInventories(prev => {
      const list = prev[pharmId] || [];
      return { ...prev, [pharmId]: list.filter(item => item.id !== medicineId) };
    });
  };

  const tpUpdateProfile = (updatedFields) => {
    const pharmId = currentTpId;
    setTpPharmacies(prev => ({
      ...prev,
      [pharmId]: { ...(prev[pharmId] || {}), ...updatedFields }
    }));
  };

  return (
    <PharmacyContext.Provider
      value={{
        currentUser,
        login,
        loginAsHub,
        loginAsThirdParty,
        loginAsMultiplePharmacy: loginAsThirdParty,
        logout,
        pharmacyProfile,
        toggleStoreOpen,
        updatePharmacyProfile,
        orders,
        updateOrderStatus,
        verifyPrescription,
        acceptOrder,
        rejectOrder,
        toggleItemAvailability,
        toggleItemPicked,
        markPackedAndNotifyFleet,
        assignCaptainToOrder,
        confirmHandover,
        splitOrder,
        packSelectedAndSplit,
        packRemainingBatch,
        updateDeliveryStatus,
        toggleDeliveryItemPicked,
        markDeliveryPackedAndNotifyFleet,
        confirmDeliveryHandover,
        captains,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        settlements,
        notificationSettings,
        setNotificationSettings,
        inventory,
        updateInventoryStock,
        quickAdjustStock,
        toggleInventoryItemStatus,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        restockItem,
        bulkUpdateStockFromExcel,

        // Multi-Pharmacy Split Broadcast & Sourcing
        networkBroadcasts,
        broadcastMissingItemsToNetwork,
        selectPartnerAndSplitOrder,
        simulatePartnerPickPack,

        // Third-Party Exports
        currentTpId,
        currentTpProfile,
        currentTpInventory,
        currentTpOrders,
        tpPharmacies,
        tpOrders,
        tpInventories,
        adminSplitTracking,
        tpCheckStock,
        tpAcceptOrder,
        tpRejectOrder,
        tpToggleItemPicked,
        tpUpdatePreparationStatus,
        tpPackOrder,
        tpDispatchOrder,
        tpDeliverOrder,
        tpAddMedicine,
        tpUpdateMedicine,
        tpAdjustStock,
        tpRecordStockReceived,
        tpToggleMedicineAvailability,
        tpDeleteMedicine,
        tpUpdateProfile
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error("usePharmacy must be used within a PharmacyProvider");
  }
  return context;
}
