import React, { createContext, useContext, useState } from "react";
import initialOrders from "../data/mockOrders";
import initialCaptains from "../data/mockCaptains";
import initialInventory from "../data/mockInventory";

const PharmacyContext = createContext(null);

const HUB_PROFILES = {
  "HUB-MYS-01": {
    id: "HUB-MYS-01",
    name: "MediUnify Central Hub (Mysuru)",
    facilityName: "MediUnify Mysore Central Fulfillment Hub",
    hubType: "Company Owned Central Hub",
    isThirdParty: false,
    ownerName: "Dr. Arvind Rao (Lead Pharmacist)",
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
    facilityName: "Apex 3rd-Party Regional Fulfillment Hub",
    hubType: "3rd-Party Partner Hub",
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
  const [currentUser, setCurrentUser] = useState({
    pharmacyId: "PH-2201",
    name: "Novus Pharmacy",
    isLoggedIn: true
  });

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

  // Auth actions (Super Admin Provisioned)
  const login = (id, password) => {
    const cleanId = (id || "HUB-MYS-01").trim().toUpperCase();
    const matchedProfile = HUB_PROFILES[cleanId] || {
      ...INITIAL_PROFILE,
      id: cleanId,
      name: `MediUnify Hub (${cleanId})`,
      facilityName: `MediUnify Fulfillment Center (${cleanId})`
    };

    setPharmacyProfile(matchedProfile);
    setCurrentUser({
      pharmacyId: matchedProfile.id,
      name: matchedProfile.name,
      hubType: matchedProfile.hubType,
      isThirdParty: matchedProfile.isThirdParty,
      isLoggedIn: true
    });
    return true;
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
  };

  const quickAdjustStock = (itemId, deltaQty) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updated = Math.max(0, item.stock + deltaQty);
        return { ...item, stock: updated };
      })
    );
  };

  const toggleInventoryItemStatus = (itemId) => {
    setInventory(prev =>
      prev.map(item => (item.id === itemId ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const addInventoryItem = (newItem) => {
    const generatedId = newItem.id || `MED${String(inventory.length + 1).padStart(3, "0")}`;
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
  };

  return (
    <PharmacyContext.Provider
      value={{
        currentUser,
        login,
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
        restockItem
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
