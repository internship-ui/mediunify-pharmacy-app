import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Platform,
  Linking,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

const STATUS_STYLES = {
  New: { bg: "#E1F7F1", text: COLORS.teal, label: "New Prescription Order" },
  Accepted: { bg: "#EAF0FB", text: COLORS.navy, label: "Accepted · Stock Verification" },
  Rejected: { bg: "#FDE8E8", text: "#DC2626", label: "Rejected" },
  Picking: { bg: "#FFF1E8", text: COLORS.coral, label: "Picking & Packing" },
  Packed: { bg: "#FFF1E8", text: COLORS.coral, label: "Packed · Fleet Notified" },
  CaptainAssigned: { bg: "#E0F7F9", text: COLORS.aqua, label: "Captain Arrived for Pickup" },
  HandedOver: { bg: "#EAF0FB", text: COLORS.navy, label: "Handed Over with Photo Proof" },
  Delivered: { bg: "#E1F7F1", text: COLORS.teal, label: "Delivered to Patient" },
  Completed: { bg: "#E1F7F1", text: COLORS.teal, label: "Order Completed" },
  "Split Delivery": { bg: "#FFF7ED", text: "#EA580C", label: "Split Delivery · Part 1 Dispatched" },
  "Split Delivery (Batch 2 Packed)": { bg: "#FFF7ED", text: "#EA580C", label: "Split Delivery · Batch 2 Packed" },
  "Partially Dispatched": { bg: "#FFF7ED", text: "#EA580C", label: "Partially Dispatched" },
  "Partially Delivered": { bg: "#FEF3C7", text: "#D97706", label: "Partially Delivered" }
};

const REJECTION_TEMPLATES = [
  {
    id: "unclear_photo",
    label: "Prescription Illegible / Blurry",
    category: "Image Quality",
    defaultText: "The uploaded prescription image is blurry, cropped, or illegible. Please re-upload a clear, well-lit photo of the full doctor's prescription slip."
  },
  {
    id: "missing_signature",
    label: "Missing Doctor Signature / Stamp",
    category: "Regulatory",
    defaultText: "Doctor's signature, clinic stamp, or medical registration number is missing on the slip. As per pharmacy regulations, valid medical credentials are required."
  },
  {
    id: "out_of_stock",
    label: "Medicine Out of Stock at Hub",
    category: "Availability",
    defaultText: "One or more prescribed medicines are currently out of stock at the Central Hub. Please consult your physician for alternative brands or try again later."
  },
  {
    id: "expired_rx",
    label: "Expired Prescription (>6 Months)",
    category: "Validity",
    defaultText: "This prescription is older than 6 months and has expired under pharmacy council rules. Please obtain a fresh prescription from your doctor."
  },
  {
    id: "schedule_x",
    label: "Schedule X / Restricted Drug",
    category: "Compliance",
    defaultText: "Prescription contains restricted Schedule X or habit-forming narcotics that cannot be delivered online as per Indian drug laws."
  },
  {
    id: "dosage_unclear",
    label: "Dosage / Strength Not Specified",
    category: "Clinical",
    defaultText: "The medicine dosage, duration, or strength is not clearly specified by the doctor. Please contact your doctor for dosage clarity."
  },
  {
    id: "custom",
    label: "Custom Pharmacist Note",
    category: "Custom",
    defaultText: ""
  }
];

const SAMPLE_HANDOVER_PROOFS = [
  {
    title: "Sealed Tamper-Proof Parcel at Dispatch Desk",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Handing Over Package to Delivery Partner",
    url: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Barcoded Security Bag with Rx Tag",
    url: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&auto=format&fit=crop&q=80"
  }
];

const ETA_OPTIONS = [
  "Within 2 to 3 hours",
  "Within 1 to 2 hours",
  "Today by 5:00 PM",
  "Within 3 to 4 hours"
];

export default function OrderDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const orderId = route?.params?.orderId;
  const {
    orders,
    inventory = [],
    verifyPrescription,
    acceptOrder,
    rejectOrder,
    toggleItemPicked,
    markPackedAndNotifyFleet,
    confirmHandover,
    packSelectedAndSplit,
    packRemainingBatch,
    confirmDeliveryHandover
  } = usePharmacy();

  const order = orders.find(o => o.id === orderId) || (orders.length > 0 ? orders[0] : null);

  // Modals & form state
  const [prescriptionZoomModal, setPrescriptionZoomModal] = useState(false);
  const [handoverZoomModal, setHandoverZoomModal] = useState(false);
  const [activeHandoverPhotoToZoom, setActiveHandoverPhotoToZoom] = useState(null);
  const [photoPickerModal, setPhotoPickerModal] = useState(false);
  const [activePhotoTarget, setActivePhotoTarget] = useState("single"); // "single", "delivery1", "delivery2"
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  // Split Delivery Configuration State
  const [selectedEta, setSelectedEta] = useState(ETA_OPTIONS[0]);
  const [customPatientNote, setCustomPatientNote] = useState("");
  const [itemSplits, setItemSplits] = useState({});

  // Single Order Handover State
  const [selectedTemplateId, setSelectedTemplateId] = useState(REJECTION_TEMPLATES[0].id);
  const [rejectReasonText, setRejectReasonText] = useState(REJECTION_TEMPLATES[0].defaultText);
  const [patientCalled, setPatientCalled] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(order?.handoverProofPhoto || null);

  // Split Deliveries Local State
  const [del1OtpInput, setDel1OtpInput] = useState("");
  const [del1OtpError, setDel1OtpError] = useState("");
  const [del1CapturedPhoto, setDel1CapturedPhoto] = useState(null);

  const [del2OtpInput, setDel2OtpInput] = useState("");
  const [del2OtpError, setDel2OtpError] = useState("");
  const [del2CapturedPhoto, setDel2CapturedPhoto] = useState(null);

  if (!order) {
    return (
      <View style={styles.notFoundWrap}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.coral} />
        <Text style={styles.notFoundTitle}>Order Not Found</Text>
        <Text style={styles.notFoundSub}>The requested prescription order ID #{orderId || "N/A"} could not be located.</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("MainTabs", { screen: "Orders" });
            }
          }}
        >
          <Ionicons name="arrow-back" size={16} color={COLORS.white} />
          <Text style={styles.backButtonText}>Back to Orders</Text>
        </Pressable>
      </View>
    );
  }

  const {
    status,
    patientName,
    patientPhone,
    deliveryAddress,
    items = [],
    doctorName,
    clinicName,
    prescriptionUrl: orderPrescriptionUrl,
    prescriptionImage,
    rejectionReason,
    prescriptionVerified,
    timeline = [],
    handoverProofPhoto,
    handoverConfirmedAt,
    handoverConfirmedBy,
    handoverOtp,
    pickupOtp,
    isSplit,
    deliveries = [],
    remainingEta
  } = order;

  const prescriptionUrl = orderPrescriptionUrl || prescriptionImage;
  const currentPickupOtp = handoverOtp || pickupOtp || "4921";
  const currentStatusStyle = STATUS_STYLES[status] || { bg: COLORS.navyLight, text: COLORS.navy, label: status };

  const pickedIndices = items
    .map((item, idx) => (item.picked !== false ? idx : null))
    .filter(idx => idx !== null);
  const pickedCount = pickedIndices.length;
  const unpickedItems = items.filter((_, idx) => !pickedIndices.includes(idx));
  const pickedItemsList = items.filter((_, idx) => pickedIndices.includes(idx));

  const getItemSplit = (itemIndex, totalQty, liveStock) => {
    if (itemSplits[itemIndex] !== undefined) {
      return itemSplits[itemIndex];
    }
    const available = liveStock !== null ? liveStock : totalQty;
    const defB1 = Math.min(totalQty, Math.max(0, available));
    const defB2 = totalQty - defB1;
    return { batch1Qty: defB1, batch2Qty: defB2 };
  };

  const handleAdjustItemSplit = (itemIndex, totalQty, deltaB1) => {
    setItemSplits(prev => {
      const current = prev[itemIndex] || getItemSplit(itemIndex, totalQty, null);
      const newB1 = Math.max(0, Math.min(totalQty, current.batch1Qty + deltaB1));
      const newB2 = totalQty - newB1;
      return {
        ...prev,
        [itemIndex]: { batch1Qty: newB1, batch2Qty: newB2 }
      };
    });
  };

  const handleCallPatient = () => {
    const rawPhone = order.patientPhone || "+91 98765 43210";
    const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
    setPatientCalled(true);

    if (Platform.OS !== "web") {
      const telUrl = `tel:${cleanPhone}`;
      Linking.canOpenURL(telUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(telUrl);
          } else {
            Alert.alert(
              "Calling Patient",
              `Connecting call to ${order.patientName} (${rawPhone})\n\nVerification call logged in order audit trail.`
            );
          }
        })
        .catch(() => {
          Alert.alert(
            "Calling Patient",
            `Connecting call to ${order.patientName} (${rawPhone})\n\nVerification call logged in order audit trail.`
          );
        });
    } else {
      Alert.alert(
        "Calling Patient",
        `Connecting call to ${order.patientName} (${rawPhone})\n\nVerification call logged in order audit trail.`
      );
    }
  };

  const handleCallCaptain = (captain) => {
    const c = captain || order.captain;
    if (c) {
      Alert.alert("Call Delivery Partner", `Calling ${c.name} (${c.phone})`);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setRejectReasonText(template.defaultText);
  };

  const handleConfirmRejection = () => {
    if (!rejectReasonText.trim()) {
      Alert.alert("Rejection Reason Required", "Please enter or select an explanation for the patient before submitting rejection.");
      return;
    }

    const template = REJECTION_TEMPLATES.find(t => t.id === selectedTemplateId);
    rejectOrder(order.id, rejectReasonText.trim(), {
      calledPatient: patientCalled,
      category: template?.category || "General"
    });

    setRejectModalVisible(false);

    Alert.alert(
      "Prescription Rejected & Patient Notified",
      `Order #${order.id} has been marked as rejected. An SMS and push notification containing your explanation have been sent to ${order.patientName}.`
    );
  };

  const handleConfirmPackAll = () => {
    // If some were unselected, mark all as picked
    items.forEach((_, idx) => {
      if (items[idx].picked === false) {
        toggleItemPicked(order.id, idx);
      }
    });

    markPackedAndNotifyFleet(order.id);
    Alert.alert(
      "All Medicines Packed & Fleet Broadcasted",
      `All ${items.length} medicines packed in tamper-proof bag. Delivery partner Suresh B. assigned (ETA 4 mins).`
    );
  };

  const handleOpenSplitModal = (initialSplits = null) => {
    if (initialSplits) {
      setItemSplits(prev => ({ ...prev, ...initialSplits }));
    }
    const defaultMsg = `Dear ${patientName}, available medicines from your order #${order.id} have been packed and dispatched right away. The remaining medicines are being arranged and will be delivered in Batch 2 within ${selectedEta}.`;
    setCustomPatientNote(defaultMsg);
    setSplitModalVisible(true);
  };

  const handleConfirmSplitDispatch = () => {
    const splitConfigArray = items.map((item, idx) => {
      const invMatch = inventory.find(inv => (item.id && inv.id === item.id) || (item.name && inv.name.toLowerCase().includes(item.name.toLowerCase())));
      const liveStock = invMatch ? invMatch.stock : null;
      const split = getItemSplit(idx, item.qty, liveStock);
      if (item.picked === false) {
        return { itemIndex: idx, batch1Qty: 0, batch2Qty: item.qty };
      }
      return { itemIndex: idx, batch1Qty: split.batch1Qty, batch2Qty: split.batch2Qty };
    });

    packSelectedAndSplit(order.id, splitConfigArray, selectedEta, customPatientNote);
    setSplitModalVisible(false);
    Alert.alert(
      "📦 Split Delivery Dispatched!",
      `Batch 1 medicines packed & assigned to Delivery Partner Suresh B.\n\nBatch 2 remaining items queued for stock arrangement (ETA: ${selectedEta}). Patient has been notified via SMS & App.`
    );
  };

  const handleOpenPhotoPicker = (target) => {
    setActivePhotoTarget(target);
    setPhotoPickerModal(true);
  };

  const handleSelectHandoverPhoto = (photoUrl) => {
    if (activePhotoTarget === "delivery1") {
      setDel1CapturedPhoto(photoUrl);
    } else if (activePhotoTarget === "delivery2") {
      setDel2CapturedPhoto(photoUrl);
    } else {
      setCapturedPhoto(photoUrl);
    }
    setPhotoPickerModal(false);
    Alert.alert("Photo Attached", "Handover proof photo attached. Enter the 4-digit OTP to complete handover.");
  };

  const handleSimulateCameraCapture = () => {
    const photoUrl = SAMPLE_HANDOVER_PROOFS[0].url;
    if (activePhotoTarget === "delivery1") {
      setDel1CapturedPhoto(photoUrl);
    } else if (activePhotoTarget === "delivery2") {
      setDel2CapturedPhoto(photoUrl);
    } else {
      setCapturedPhoto(photoUrl);
    }
    setPhotoPickerModal(false);
    Alert.alert("Photo Captured", "Handover proof captured with timestamp. Enter the 4-digit captain OTP to complete handover.");
  };

  // Single Order Handover submit
  const handleHandoverSubmit = () => {
    if (!capturedPhoto) {
      setOtpError("Please take or upload a photo proof of the package handover first.");
      Alert.alert("Handover Photo Required", "Please attach a photo proof of handing over the parcel to the delivery partner.");
      return;
    }

    if (otpInput.length !== 4) {
      setOtpError("Please enter the complete 4-digit pickup OTP provided by captain.");
      return;
    }

    const res = confirmHandover(order.id, otpInput, capturedPhoto);
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpError("");
      Alert.alert("Handover Complete & Dispatched", `Order #${order.id} verified with photo proof and handed over to Captain ${order.captain?.name || "Delivery Partner"}.`);
    }
  };

  // Split Delivery 1 Handover submit
  const handleDelivery1HandoverSubmit = (delivery) => {
    if (!del1CapturedPhoto) {
      setDel1OtpError("Please attach a photo proof of the Delivery 1 package handover.");
      Alert.alert("Photo Required", "Please attach handover photo proof for Delivery 1.");
      return;
    }

    if (del1OtpInput.length !== 4) {
      setDel1OtpError("Enter 4-digit OTP (Demo: " + (delivery.handoverOtp || "4921") + ")");
      return;
    }

    const res = confirmDeliveryHandover(order.id, delivery.id, del1OtpInput, del1CapturedPhoto);
    if (!res.success) {
      setDel1OtpError(res.message);
    } else {
      setDel1OtpError("");
      Alert.alert("Batch 1 Dispatched", `Batch 1 (${delivery.items.length} medicines) handed over to Captain ${delivery.captain?.name || "Partner"}. Batch 2 remains in progress!`);
    }
  };

  // Split Delivery 2 Pack & Dispatch
  const handlePackDelivery2 = (delivery) => {
    packRemainingBatch(order.id, delivery.id);
    Alert.alert("Batch 2 Packed & Captain Assigned", `Remaining ${delivery.items.length} medicines packed in tamper-proof bag. Captain Ramesh K. assigned (ETA 3 mins).`);
  };

  // Split Delivery 2 Handover submit
  const handleDelivery2HandoverSubmit = (delivery) => {
    if (!del2CapturedPhoto) {
      setDel2OtpError("Please attach a photo proof of the Delivery 2 package handover.");
      Alert.alert("Photo Required", "Please attach handover photo proof for Delivery 2.");
      return;
    }

    if (del2OtpInput.length !== 4) {
      setDel2OtpError("Enter 4-digit OTP (Demo: " + (delivery.handoverOtp || "8312") + ")");
      return;
    }

    const res = confirmDeliveryHandover(order.id, delivery.id, del2OtpInput, del2CapturedPhoto);
    if (!res.success) {
      setDel2OtpError(res.message);
    } else {
      setDel2OtpError("");
      Alert.alert("Order Fulfillment Complete! 🎉", `Batch 2 handed over to Captain. All medicines for Order #${order.id} have now been successfully dispatched!`);
    }
  };

  const isNew = status === "New";
  const isAccepted = status === "Accepted";
  const isPicking = status === "Picking";
  const isPacked = status === "Packed";
  const isCaptainAssigned = status === "CaptainAssigned";
  const isHandedOver = status === "HandedOver" || status === "Delivered" || status === "Completed";
  const isRejected = status === "Rejected";

  const delivery1 = deliveries.find(d => d.deliveryNumber === 1);
  const delivery2 = deliveries.find(d => d.deliveryNumber === 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 1100, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 16, paddingTop: 12 },
        { paddingBottom: Math.max(insets.bottom, 16) + 30 }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header Card */}
      <View style={styles.orderHeaderCard}>
        <View style={styles.orderHeaderTop}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={styles.orderIdText}>Order #{order.id}</Text>
              <View style={[styles.typeBadge, { backgroundColor: order.type === "prescription" ? COLORS.tealLight : "#EAF0FB" }]}>
                <Ionicons
                  name={order.type === "prescription" ? "document-text" : "cart"}
                  size={11}
                  color={order.type === "prescription" ? COLORS.teal : COLORS.navy}
                />
                <Text style={[styles.typeBadgeText, { color: order.type === "prescription" ? COLORS.teal : COLORS.navy }]}>
                  {order.type === "prescription" ? "Doctor Rx" : "Direct OTC"}
                </Text>
              </View>
            </View>
            <Text style={styles.orderTimeText}>{order.createdAt} · {order.distanceKm || "2.5"} km away</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: currentStatusStyle.text }]}>
              {currentStatusStyle.label}
            </Text>
          </View>
        </View>

        {/* Action Button Strip for Invoices & Quick Patient Call */}
        <View style={styles.quickHeaderLinksRow}>
          <Pressable
            style={({ pressed }) => [styles.headerCallPatientPill, pressed && { opacity: 0.85 }]}
            onPress={handleCallPatient}
          >
            <Ionicons name="call" size={13} color={COLORS.teal} />
            <Text style={styles.headerCallPatientText}>
              Call Patient ({patientPhone || "+91 98765 43210"})
            </Text>
            {patientCalled && (
              <View style={styles.headerCalledDot} />
            )}
          </Pressable>

          <Pressable
            style={styles.invoiceQuickLink}
            onPress={() => navigation.navigate("Invoice", { orderId: order.id })}
          >
            <Ionicons name="receipt-outline" size={14} color={COLORS.navy} />
            <Text style={styles.invoiceQuickLinkText}>GST Invoice</Text>
          </Pressable>
        </View>
      </View>

      {/* Prescription Review Card (If Prescription Order) */}
      {order.type === "prescription" && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="document-attach-outline" size={16} color={COLORS.teal} />
              <Text style={styles.sectionTitle}>Uploaded Doctor Prescription</Text>
            </View>
            {prescriptionVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
                <Text style={styles.verifiedBadgeText}>Rx Verified</Text>
              </View>
            )}
          </View>

          {prescriptionUrl ? (
            <Pressable style={styles.prescriptionPreviewWrap} onPress={() => setPrescriptionZoomModal(true)}>
              <Image source={{ uri: prescriptionUrl }} style={styles.prescriptionImage} resizeMode="cover" />
              <View style={styles.zoomOverlay}>
                <Ionicons name="expand" size={18} color={COLORS.white} />
                <Text style={styles.zoomText}>Tap to Zoom Full Slip & Verify</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.noRxBox}>
              <Ionicons name="image-outline" size={32} color={COLORS.slateLight} />
              <Text style={styles.noRxText}>No digital slip attached</Text>
            </View>
          )}

          {/* Pharmacist Tele-Verification Bar (Call Patient) */}
          <View style={styles.verificationCallBox}>
            <View style={styles.verificationCallHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                <Ionicons name="headset-outline" size={15} color={COLORS.teal} />
                <Text style={styles.verificationCallTitle}>Pharmacist Tele-Verification</Text>
              </View>
              {patientCalled ? (
                <View style={styles.patientCalledTag}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.patientCalledTagText}>Patient Consulted</Text>
                </View>
              ) : (
                <Text style={styles.verificationCallHint}>Direct Patient Connect</Text>
              )}
            </View>

            <Text style={styles.verificationCallDesc}>
              Need to clarify medicine dosage, brand substitution, allergy alerts, or delivery instructions with {patientName}?
            </Text>

            <Pressable
              style={({ pressed }) => [styles.callPatientActiveBtn, pressed && { opacity: 0.88 }]}
              onPress={handleCallPatient}
            >
              <Ionicons name="call" size={14} color={COLORS.white} />
              <Text style={styles.callPatientActiveBtnText}>
                Call Patient ({patientPhone || "+91 98765 43210"})
              </Text>
            </Pressable>
          </View>

          {/* Doctor Info Row */}
          {(doctorName || clinicName) && (
            <View style={styles.doctorInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorNameText}>Prescribed by: {doctorName || "Registered Medical Practitioner"}</Text>
                {clinicName && <Text style={styles.clinicNameText}>{clinicName}</Text>}
              </View>
            </View>
          )}

          {/* Prescription Action Buttons (If New) */}
          {isNew && (
            <View style={styles.rxActionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.rejectBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => setRejectModalVisible(true)}
              >
                <Ionicons name="close-circle" size={17} color="#DC2626" />
                <Text style={styles.rejectBtnText} numberOfLines={1}>
                  Reject Rx
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.acceptBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => {
                  acceptOrder(order.id);
                  Alert.alert("Prescription Accepted", `Order #${order.id} verified. You can now pick and pack medicines from warehouse racks.`);
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                <Text style={styles.acceptBtnText} numberOfLines={1}>
                  Accept & Verify Rx
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Rejection Details Banner (If Rejected) */}
      {isRejected && (
        <View style={styles.rejectionCard}>
          <View style={styles.rejectionHeaderRow}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.rejectionTitle}>Prescription Rejected by Pharmacist</Text>
          </View>
          <Text style={styles.rejectionReasonText}>{rejectionReason || "Illegible or invalid prescription."}</Text>
          <View style={styles.recontactRow}>
            <Text style={styles.recontactText}>Patient was notified via SMS.</Text>
            <Pressable style={styles.recontactBtn} onPress={handleCallPatient}>
              <Ionicons name="call" size={13} color={COLORS.navy} />
              <Text style={styles.recontactBtnText}>Call Patient</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* CASE A: ORDER IS SPLIT -> MULTI-BATCH DELIVERY HUB VIEW */}
      {/* ========================================================================= */}
      {isSplit && deliveries && deliveries.length > 0 ? (
        <View style={styles.splitMasterContainer}>
          {/* Split Order Master Banner */}
          <View style={styles.splitHeaderCard}>
            <View style={styles.splitHeaderTop}>
              <View style={styles.splitBadgeIcon}>
                <Ionicons name="git-branch" size={18} color="#C2410C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.splitMasterTitle}>Split Delivery Fulfillment Active</Text>
                <Text style={styles.splitMasterDesc}>
                  Order is divided into 2 fulfillment batches. Batch 1 is assigned to fleet partner; Batch 2 remains In Progress for stock arrangement.
                </Text>
              </View>
            </View>
          </View>

          {/* ===================================================================== */}
          {/* BATCH 1: IMMEDIATE DISPATCH */}
          {/* ===================================================================== */}
          {delivery1 && (
            <View style={styles.batchCard}>
              <View style={styles.batchHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={styles.batchNumberCircle}>
                    <Text style={styles.batchNumberText}>1</Text>
                  </View>
                  <Text style={styles.batchTitle}>Batch 1 · Immediate Delivery ({delivery1.items.length} Medicines)</Text>
                </View>
                <View style={[styles.batchStatusPill, { backgroundColor: delivery1.status === "HandedOver" ? "#ECFDF5" : "#E0F7F9" }]}>
                  <Text style={[styles.batchStatusPillText, { color: delivery1.status === "HandedOver" ? "#059669" : COLORS.aqua }]}>
                    {delivery1.status === "HandedOver" ? "Dispatched" : "Captain Assigned"}
                  </Text>
                </View>
              </View>

              {/* Items in Batch 1 */}
              <View style={styles.batchItemsBox}>
                {delivery1.items.map((it, idx) => (
                  <View key={idx} style={styles.batchItemRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.batchItemName}>{it.name}</Text>
                    <Text style={styles.batchItemDosage}>x{it.qty}</Text>
                  </View>
                ))}
              </View>

              {/* Captain Details for Batch 1 */}
              <View style={styles.captainCard}>
                <View style={styles.captainAvatar}>
                  <Ionicons name="bicycle" size={20} color={COLORS.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.captainName}>{delivery1.captain?.name || "Suresh B."}</Text>
                  <Text style={styles.captainVehicle}>Vehicle: {delivery1.captain?.vehicle || "KA-09-EA-4412"} · {delivery1.captain?.phone || "+91 98450 11223"}</Text>
                </View>
                <Pressable style={styles.callCaptainBtn} onPress={() => handleCallCaptain(delivery1.captain)}>
                  <Ionicons name="call" size={14} color={COLORS.white} />
                  <Text style={styles.callCaptainBtnText}>Call</Text>
                </Pressable>
              </View>

              {/* If Not Yet Handed Over -> Photo proof & OTP input */}
              {delivery1.status !== "HandedOver" && delivery1.status !== "Delivered" ? (
                <View style={styles.handoverBoxSub}>
                  <Text style={styles.subStepTitle}>Batch 1 Handover Verification</Text>
                  
                  {/* Photo Proof */}
                  {del1CapturedPhoto ? (
                    <View style={styles.attachedPhotoRow}>
                      <Image source={{ uri: del1CapturedPhoto }} style={styles.attachedPhotoThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.attachedPhotoTitle}>Photo Proof Attached</Text>
                        <Text style={styles.attachedPhotoTime}>Captured at Central Hub Desk</Text>
                      </View>
                      <Pressable style={styles.retakeBtn} onPress={() => handleOpenPhotoPicker("delivery1")}>
                        <Text style={styles.retakeBtnText}>Change</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.photoActionButtonsRow}>
                      <Pressable style={styles.takePhotoBtn} onPress={() => { setActivePhotoTarget("delivery1"); handleSimulateCameraCapture(); }}>
                        <Ionicons name="camera" size={15} color={COLORS.white} />
                        <Text style={styles.takePhotoBtnText}>Take Live Photo</Text>
                      </Pressable>
                      <Pressable style={styles.selectSamplePhotoBtn} onPress={() => handleOpenPhotoPicker("delivery1")}>
                        <Ionicons name="images-outline" size={15} color={COLORS.navy} />
                        <Text style={styles.selectSamplePhotoBtnText}>Sample Proofs</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* OTP Input */}
                  <View style={[styles.otpInputRow, { marginTop: 10 }]}>
                    <TextInput
                      style={[styles.otpInput, del1OtpError ? styles.otpInputErr : null]}
                      placeholder="Demo: 4921"
                      placeholderTextColor={COLORS.slateLight}
                      value={del1OtpInput}
                      onChangeText={(val) => {
                        setDel1OtpInput(val);
                        setDel1OtpError("");
                      }}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Pressable
                      style={[styles.confirmHandoverBtn, (!del1CapturedPhoto || del1OtpInput.length !== 4) && styles.disabledButton]}
                      disabled={!del1CapturedPhoto || del1OtpInput.length !== 4}
                      onPress={() => handleDelivery1HandoverSubmit(delivery1)}
                    >
                      <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
                      <Text style={styles.confirmHandoverBtnText}>Dispatch Batch 1</Text>
                    </Pressable>
                  </View>
                  {del1OtpError ? <Text style={styles.errorText}>{del1OtpError}</Text> : null}
                </View>
              ) : (
                <View style={styles.handoverDoneNotice}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={styles.handoverDoneNoticeText}>Batch 1 handed over & dispatched with verified photo proof.</Text>
                </View>
              )}
            </View>
          )}

          {/* ===================================================================== */}
          {/* BATCH 2: REMAINING MEDICINES (IN PROGRESS) */}
          {/* ===================================================================== */}
          {delivery2 && (
            <View style={[styles.batchCard, styles.batchCardPending]}>
              <View style={styles.batchHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={[styles.batchNumberCircle, { backgroundColor: "#EA580C" }]}>
                    <Text style={styles.batchNumberText}>2</Text>
                  </View>
                  <Text style={styles.batchTitle}>Batch 2 · Remaining Medicines ({delivery2.items.length} Items)</Text>
                </View>
                <View style={[styles.batchStatusPill, { backgroundColor: "#FFF7ED" }]}>
                  <Text style={[styles.batchStatusPillText, { color: "#EA580C" }]}>
                    {delivery2.status === "PendingArrangement" ? "IN PROGRESS" : delivery2.status === "CaptainAssigned" ? "Captain Assigned" : "Dispatched"}
                  </Text>
                </View>
              </View>

              {/* Items in Batch 2 */}
              <View style={styles.batchItemsBox}>
                {delivery2.items.map((it, idx) => (
                  <View key={idx} style={styles.batchItemRow}>
                    <Ionicons name="time-outline" size={16} color="#EA580C" />
                    <Text style={styles.batchItemName}>{it.name}</Text>
                    <Text style={styles.batchItemDosage}>x{it.qty}</Text>
                  </View>
                ))}
              </View>

              {/* Patient notification info banner */}
              <View style={styles.splitNoticeBox}>
                <Ionicons name="chatbox-ellipses-outline" size={18} color="#C2410C" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.splitNoticeTitle}>Patient Informed via SMS & App</Text>
                  <Text style={styles.splitNoticeDesc}>
                    "{delivery2.patientMessage || `Remaining medicines will be arranged and delivered within ${remainingEta || "2 to 3 hours"}.`}"
                  </Text>
                  <Text style={styles.splitNoticeEta}>Expected Delivery: {remainingEta || "Within 2 to 3 hours"}</Text>
                </View>
              </View>

              {/* If still pending arrangement -> Pharmacist Pack Button */}
              {delivery2.status === "PendingArrangement" && (
                <Pressable
                  style={styles.packRemainingBtn}
                  onPress={() => handlePackDelivery2(delivery2)}
                >
                  <Ionicons name="bag-check" size={18} color={COLORS.white} />
                  <Text style={styles.packRemainingBtnText}>
                    Stock Arranged · Pack & Dispatch Batch 2 ({delivery2.items.length} Medicines)
                  </Text>
                </Pressable>
              )}

              {/* If Packed & Captain Assigned for Batch 2 */}
              {delivery2.status === "CaptainAssigned" && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.captainCard}>
                    <View style={[styles.captainAvatar, { backgroundColor: "#FED7AA" }]}>
                      <Ionicons name="bicycle" size={20} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.captainName}>{delivery2.captain?.name || "Ramesh K."}</Text>
                      <Text style={styles.captainVehicle}>Vehicle: {delivery2.captain?.vehicle || "KA-09-EB-7718"} · {delivery2.captain?.phone || "+91 98450 67891"}</Text>
                    </View>
                    <Pressable style={styles.callCaptainBtn} onPress={() => handleCallCaptain(delivery2.captain)}>
                      <Ionicons name="call" size={14} color={COLORS.white} />
                      <Text style={styles.callCaptainBtnText}>Call</Text>
                    </Pressable>
                  </View>

                  <View style={styles.handoverBoxSub}>
                    <Text style={styles.subStepTitle}>Batch 2 Handover & Final Completion</Text>
                    
                    {del2CapturedPhoto ? (
                      <View style={styles.attachedPhotoRow}>
                        <Image source={{ uri: del2CapturedPhoto }} style={styles.attachedPhotoThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.attachedPhotoTitle}>Photo Proof Attached</Text>
                          <Text style={styles.attachedPhotoTime}>Captured at Central Hub Desk</Text>
                        </View>
                        <Pressable style={styles.retakeBtn} onPress={() => handleOpenPhotoPicker("delivery2")}>
                          <Text style={styles.retakeBtnText}>Change</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.photoActionButtonsRow}>
                        <Pressable style={styles.takePhotoBtn} onPress={() => { setActivePhotoTarget("delivery2"); handleSimulateCameraCapture(); }}>
                          <Ionicons name="camera" size={15} color={COLORS.white} />
                          <Text style={styles.takePhotoBtnText}>Take Live Photo</Text>
                        </Pressable>
                        <Pressable style={styles.selectSamplePhotoBtn} onPress={() => handleOpenPhotoPicker("delivery2")}>
                          <Ionicons name="images-outline" size={15} color={COLORS.navy} />
                          <Text style={styles.selectSamplePhotoBtnText}>Sample Proofs</Text>
                        </Pressable>
                      </View>
                    )}

                    <View style={[styles.otpInputRow, { marginTop: 10 }]}>
                      <TextInput
                        style={[styles.otpInput, del2OtpError ? styles.otpInputErr : null]}
                        placeholder="Enter 4-digit OTP"
                        placeholderTextColor={COLORS.slateLight}
                        value={del2OtpInput}
                        onChangeText={(val) => {
                          setDel2OtpInput(val);
                          setDel2OtpError("");
                        }}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                      <Pressable
                        style={({ pressed }) => [
                          styles.confirmHandoverBtn,
                          (!del2CapturedPhoto || del2OtpInput.length !== 4) && styles.disabledButton,
                          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                        ]}
                        disabled={!del2CapturedPhoto || del2OtpInput.length !== 4}
                        onPress={() => handleDelivery2HandoverSubmit(delivery2)}
                      >
                        <Ionicons name="checkmark-done" size={17} color={COLORS.white} />
                        <Text style={styles.confirmHandoverBtnText} numberOfLines={1}>
                          Confirm
                        </Text>
                      </Pressable>
                    </View>
                    {del2OtpError ? <Text style={styles.errorText}>{del2OtpError}</Text> : null}
                  </View>
                </View>
              )}

              {/* If Batch 2 Completed */}
              {delivery2.status === "HandedOver" && (
                <View style={styles.handoverDoneNotice}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={styles.handoverDoneNoticeText}>Batch 2 delivered. Order fulfillment 100% completed!</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        /* ========================================================================= */
        /* CASE B: STANDARD SINGLE-ORDER ITEM CHECKLIST & PACKING WORKFLOW */
        /* ========================================================================= */
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Prescribed Medicines ({items.length})</Text>
                <Text style={styles.availabilitySubtitle}>
                  {isAccepted || isPicking
                    ? `Pick & check off items available in stock (${pickedCount}/${items.length} selected)`
                    : "Medicines prescribed in this order"}
                </Text>
              </View>
              <Text style={styles.totalHeaderVal}>₹{order.totalAmount}</Text>
            </View>

            {items.map((item, index) => {
              const isPicked = item.picked !== false;
              const invMatch = inventory.find(inv => {
                if (item.id && inv.id === item.id) return true;
                const oName = (item.name || "").toLowerCase().trim();
                const iName = inv.name.toLowerCase().trim();
                return oName.includes(iName) || iName.includes(oName);
              });
              const liveStock = invMatch ? invMatch.stock : null;
              const isOut = liveStock === 0;
              const isLow = liveStock !== null && liveStock > 0 && liveStock <= (invMatch?.minStockThreshold || 15);
              const hasShortage = liveStock !== null && liveStock > 0 && liveStock < item.qty;

              return (
                <View
                  key={index}
                  style={[
                    styles.medicineCardItem,
                    isPicked && styles.medicineCardItemPicked,
                    isOut && styles.medicineCardItemOutOfStock
                  ]}
                >
                  <Pressable
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    onPress={() => (isAccepted || isPicking || isNew) && toggleItemPicked(order.id, index)}
                  >
                    <Ionicons
                      name={isPicked ? "checkbox" : "square-outline"}
                      size={22}
                      color={isPicked ? COLORS.teal : COLORS.slate}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <Text style={[styles.itemName, isPicked && styles.itemNamePicked]}>{item.name}</Text>
                      </View>
                      <Text style={styles.itemDosage}>{item.dosage}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        <Text style={styles.itemHsn}>HSN: {item.hsn || "30049099"} · Rate: ₹{item.unitPrice?.toFixed(2) || "10.00"}</Text>
                        {liveStock !== null && (
                          <View
                            style={[
                              styles.itemStockPill,
                              isOut && styles.itemStockPillOut,
                              isLow && styles.itemStockPillLow,
                              !isOut && !isLow && styles.itemStockPillIn
                            ]}
                          >
                            <View
                              style={[
                                styles.itemStockDot,
                                { backgroundColor: isOut ? COLORS.coral : isLow ? COLORS.coral : COLORS.teal }
                              ]}
                            />
                            <Text
                              style={[
                                styles.itemStockPillText,
                                { color: isOut ? COLORS.coral : isLow ? COLORS.coral : COLORS.navy }
                              ]}
                            >
                              {isOut ? "Out of Stock (0 units)" : isLow ? `Low Stock (${liveStock} left)` : `Stock: ${liveStock} units`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={[styles.qtyBadge, isOut && styles.qtyBadgeOut]}>
                      <Text style={[styles.qtyText, isOut && { color: COLORS.coral }]}>x{item.qty}</Text>
                    </View>
                  </Pressable>

                  {/* 1-Tap Shortage Split Action Banner if quantity in stock is less than ordered */}
                  {hasShortage && (isAccepted || isPicking) && (
                    <Pressable
                      style={styles.shortageSplitBanner}
                      onPress={() => {
                        handleOpenSplitModal({
                          [index]: { batch1Qty: liveStock, batch2Qty: item.qty - liveStock }
                        });
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                        <Ionicons name="git-branch" size={14} color={COLORS.coral} />
                        <Text style={styles.shortageSplitBannerText}>
                          Stock Shortage ({liveStock}/{item.qty}): Pack {liveStock} now + {item.qty - liveStock} in Batch 2
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward-circle" size={16} color={COLORS.coral} />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action Buttons for Picking Stage */}
          {(isAccepted || isPicking) && (
            <View style={styles.actionContainer}>
              {/* If some items picked and some unpicked -> Offer Manual Split Delivery! */}
              {pickedCount > 0 && pickedCount < items.length ? (
                <View style={{ gap: 10 }}>
                  <Pressable
                    style={styles.splitActionButton}
                    onPress={() => handleOpenSplitModal()}
                  >
                    <View style={styles.splitActionIconWrap}>
                      <Ionicons name="git-branch" size={20} color={COLORS.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.splitActionBtnTitle}>
                        Pack Selected ({pickedCount}) & Split Delivery
                      </Text>
                      <Text style={styles.splitActionBtnSub}>
                        Dispatch {pickedCount} now · {unpickedItems.length} remaining will be arranged & delivered in 2–3 hrs
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
                  </Pressable>

                  <Pressable
                    style={styles.packAllSecondaryButton}
                    onPress={handleConfirmPackAll}
                  >
                    <Ionicons name="bag-check-outline" size={16} color={COLORS.navy} />
                    <Text style={styles.packAllSecondaryText}>
                      Pack All ({items.length} Medicines)
                    </Text>
                  </Pressable>
                </View>
              ) : (
                /* All items selected or none */
                <View style={{ gap: 10 }}>
                  <Pressable
                    style={[styles.primaryActionButton, pickedCount === 0 && styles.disabledButton]}
                    disabled={pickedCount === 0}
                    onPress={handleConfirmPackAll}
                  >
                    <Ionicons name="bag-check-outline" size={18} color={COLORS.white} />
                    <Text style={styles.primaryActionText}>
                      Confirm & Pack Order ({pickedCount}/{items.length} Medicines)
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.manualSplitTriggerBtn}
                    onPress={() => handleOpenSplitModal()}
                  >
                    <Ionicons name="git-branch-outline" size={15} color={COLORS.coral} />
                    <Text style={styles.manualSplitTriggerText}>
                      Configure Partial / Split Batch Delivery
                    </Text>
                  </Pressable>
                </View>
              )}

              <Text style={styles.verifyHint}>
                Packs verified medicines in a tamper-proof bag and notifies delivery partner.
              </Text>
            </View>
          )}

          {/* Stage: Captain Arrived & Ready for Handover (Single Order) */}
          {(isPacked || isCaptainAssigned) && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Delivery Partner at Hub Desk</Text>
                <View style={styles.liveEtaPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveEtaText}>Ready for Handover</Text>
                </View>
              </View>

              {/* Captain Info Bar */}
              <View style={styles.captainCard}>
                <View style={styles.captainAvatar}>
                  <Ionicons name="bicycle" size={20} color={COLORS.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.captainName}>{order.captain?.name || "Suresh B."}</Text>
                  <Text style={styles.captainVehicle}>Vehicle: {order.captain?.vehicle || "KA-09-EA-4902"} · {order.captain?.phone || "+91 98450 12345"}</Text>
                </View>
                <Pressable style={styles.callCaptainBtn} onPress={() => handleCallCaptain(order.captain)}>
                  <Ionicons name="call" size={14} color={COLORS.white} />
                  <Text style={styles.callCaptainBtnText}>Call</Text>
                </Pressable>
              </View>

              {/* Step 1: Handover Photo Proof */}
              <View style={styles.handoverStepBox}>
                <Text style={styles.stepTitle}>1. Handover Photo Proof (Required)</Text>
                <Text style={styles.stepDesc}>Take a photo of the packed medicine parcel handed to the delivery partner.</Text>

                {capturedPhoto ? (
                  <View style={styles.attachedPhotoRow}>
                    <Image source={{ uri: capturedPhoto }} style={styles.attachedPhotoThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attachedPhotoTitle}>Photo Proof Attached</Text>
                      <Text style={styles.attachedPhotoTime}>Captured just now at Central Desk</Text>
                    </View>
                    <Pressable style={styles.retakeBtn} onPress={() => handleOpenPhotoPicker("single")}>
                      <Text style={styles.retakeBtnText}>Change Photo</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.photoActionButtonsRow}>
                    <Pressable style={styles.takePhotoBtn} onPress={() => { setActivePhotoTarget("single"); handleSimulateCameraCapture(); }}>
                      <Ionicons name="camera" size={16} color={COLORS.white} />
                      <Text style={styles.takePhotoBtnText}>Take Live Photo</Text>
                    </Pressable>
                    <Pressable style={styles.selectSamplePhotoBtn} onPress={() => handleOpenPhotoPicker("single")}>
                      <Ionicons name="images-outline" size={16} color={COLORS.navy} />
                      <Text style={styles.selectSamplePhotoBtnText}>Sample Proofs</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Step 2: 4-Digit Handover OTP */}
              <View style={styles.handoverStepBox}>
                <Text style={styles.stepTitle}>2. Enter Captain's Handover OTP</Text>
                <Text style={styles.stepDesc}>Ask the delivery captain for the 4-digit pickup OTP shown on their app (Demo OTP: {currentPickupOtp}).</Text>

                <View style={styles.otpInputRow}>
                  <TextInput
                    style={[styles.otpInput, otpError ? styles.otpInputErr : null]}
                    placeholder="Enter 4-digit OTP"
                    placeholderTextColor={COLORS.slateLight}
                    value={otpInput}
                    onChangeText={(val) => {
                      setOtpInput(val);
                      setOtpError("");
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmHandoverBtn,
                      (!capturedPhoto || otpInput.length !== 4) && styles.disabledButton,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                    ]}
                    disabled={!capturedPhoto || otpInput.length !== 4}
                    onPress={handleHandoverSubmit}
                  >
                    <Ionicons name="checkmark-done" size={17} color={COLORS.white} />
                    <Text style={styles.confirmHandoverBtnText} numberOfLines={1}>
                      Confirm
                    </Text>
                  </Pressable>
                </View>
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
              </View>
            </View>
          )}

          {/* Completed Handover Card (If Handed Over / Delivered) */}
          {isHandedOver && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#059669" />
                  <Text style={styles.sectionTitle}>Handover Verified & Dispatched</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>Dispatched</Text>
                </View>
              </View>

              <Text style={styles.handoverDetailsText}>
                Handed over to <Text style={{ fontWeight: "700" }}>{order.captain?.name || "Delivery Partner"}</Text> ({order.captain?.vehicle || "Vehicle"}).
              </Text>
              <Text style={styles.handoverTimeSubText}>
                Verified at {handoverConfirmedAt || "10:30 AM"} by {handoverConfirmedBy || "Hub Lead Pharmacist"}.
              </Text>

              {/* Photo Proof Thumbnail */}
              {handoverProofPhoto && (
                <Pressable
                  style={styles.proofThumbWrap}
                  onPress={() => {
                    setActiveHandoverPhotoToZoom(handoverProofPhoto);
                    setHandoverZoomModal(true);
                  }}
                >
                  <Image source={{ uri: handoverProofPhoto }} style={styles.proofThumbImage} />
                  <View style={styles.proofOverlay}>
                    <Ionicons name="eye-outline" size={14} color={COLORS.white} />
                    <Text style={styles.proofOverlayText}>View Handover Proof Photo</Text>
                  </View>
                </Pressable>
              )}
            </View>
          )}
        </>
      )}

      {/* Patient & Delivery Information Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Patient & Delivery Details</Text>
          <Pressable style={styles.callPatientPill} onPress={handleCallPatient}>
            <Ionicons name="call" size={12} color={COLORS.teal} />
            <Text style={styles.callPatientPillText}>Call Patient</Text>
          </Pressable>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Patient Name</Text>
          <Text style={styles.infoValue}>{patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact Number</Text>
          <Text style={styles.infoValue}>{patientPhone || "+91 98765 43210"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Delivery Address</Text>
          <Text style={[styles.infoValue, { flex: 1, textAlign: "right" }]}>{deliveryAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Mode</Text>
          <Text style={[styles.infoValue, { fontWeight: "700", color: order.paymentStatus === "Paid" ? "#059669" : "#D97706" }]}>
            {order.paymentMode || "Online Paid (Prepaid UPI)"} · {order.paymentStatus || "Paid"}
          </Text>
        </View>
      </View>

      {/* Operational Timeline Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Audit Log & Fulfillment Timeline</Text>
        {timeline.map((step, idx) => (
          <View key={idx} style={styles.timelineItem}>
            <View style={styles.timelineLeftCol}>
              <View style={styles.timelineDot} />
              {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={{ flex: 1, paddingBottom: 14 }}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineStatus}>{step.status}</Text>
                <Text style={styles.timelineTime}>{step.timestamp}</Text>
              </View>
              <Text style={styles.timelineDesc}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ========================================================================= */}
      {/* MODAL 1: MANUAL / QUANTITY SPLIT DELIVERY CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      <Modal visible={splitModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={styles.splitModalCard}>
            <View style={styles.splitModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.splitModalIconCircle}>
                  <Ionicons name="git-branch" size={18} color={COLORS.coral} />
                </View>
                <View>
                  <Text style={styles.splitModalTitle}>Split Batch Fulfillment</Text>
                  <Text style={styles.splitModalSub}>Order #{order.id} · {patientName}</Text>
                </View>
              </View>
              <Pressable onPress={() => setSplitModalVisible(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={COLORS.slate} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 440, padding: 16 }}>
              <Text style={styles.modalSectionLabel}>QUANTITY ALLOCATION PER MEDICINE:</Text>

              {items.map((it, idx) => {
                const invMatch = inventory.find(inv => (it.id && inv.id === it.id) || (it.name && inv.name.toLowerCase().includes(it.name.toLowerCase())));
                const liveStock = invMatch ? invMatch.stock : null;
                const split = getItemSplit(idx, it.qty, liveStock);

                return (
                  <View key={idx} style={styles.splitItemConfigCard}>
                    <View style={styles.splitItemConfigHeader}>
                      <Text style={styles.splitItemConfigName} numberOfLines={1}>{it.name}</Text>
                      <Text style={styles.splitItemTotalQty}>Prescribed: {it.qty} units</Text>
                    </View>
                    <Text style={styles.splitItemStockSub}>
                      Hub Stock: {liveStock !== null ? `${liveStock} units available` : "Checked on shelf"}
                    </Text>

                    <View style={styles.splitAllocationRow}>
                      {/* Batch 1 Allocation Stepper */}
                      <View style={styles.splitColBox}>
                        <Text style={styles.splitColLabel}>BATCH 1 (NOW):</Text>
                        <View style={styles.splitStepper}>
                          <Pressable
                            style={styles.splitStepBtn}
                            onPress={() => handleAdjustItemSplit(idx, it.qty, -1)}
                            disabled={split.batch1Qty <= 0}
                          >
                            <Ionicons name="remove" size={14} color={COLORS.navy} />
                          </Pressable>
                          <Text style={styles.splitStepVal}>{split.batch1Qty}</Text>
                          <Pressable
                            style={styles.splitStepBtn}
                            onPress={() => handleAdjustItemSplit(idx, it.qty, 1)}
                            disabled={split.batch1Qty >= it.qty}
                          >
                            <Ionicons name="add" size={14} color={COLORS.navy} />
                          </Pressable>
                        </View>
                      </View>

                      {/* Arrow */}
                      <Ionicons name="arrow-forward" size={16} color={COLORS.slate} style={{ marginTop: 14 }} />

                      {/* Batch 2 Remaining */}
                      <View style={[styles.splitColBox, { backgroundColor: COLORS.coralLight, borderColor: "#FED7AA" }]}>
                        <Text style={[styles.splitColLabel, { color: COLORS.coral }]}>BATCH 2 (LATER):</Text>
                        <View style={styles.splitRemainingBadge}>
                          <Text style={styles.splitRemainingVal}>{split.batch2Qty} units</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Estimated Delivery Time Selector */}
              <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>
                ESTIMATED DELIVERY TIME FOR BATCH 2:
              </Text>
              <View style={styles.etaChipsGrid}>
                {ETA_OPTIONS.map((opt, idx) => (
                  <Pressable
                    key={idx}
                    style={[styles.etaChip, selectedEta === opt && styles.etaChipActive]}
                    onPress={() => setSelectedEta(opt)}
                  >
                    <Ionicons
                      name={selectedEta === opt ? "radio-button-on" : "radio-button-off"}
                      size={14}
                      color={selectedEta === opt ? COLORS.coral : COLORS.slate}
                    />
                    <Text style={[styles.etaChipText, selectedEta === opt && styles.etaChipTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Patient Notification Preview */}
              <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>
                PATIENT SMS & APP NOTIFICATION MESSAGE:
              </Text>
              <TextInput
                style={styles.patientMessageInput}
                multiline
                numberOfLines={3}
                value={customPatientNote}
                onChangeText={setCustomPatientNote}
                placeholder="Message for the patient regarding split delivery..."
              />
              <Text style={styles.smsNoticeText}>
                📲 SMS will be automatically dispatched to {patientPhone || "+91 98765 43210"} upon confirmation.
              </Text>
            </ScrollView>

            <View style={styles.splitModalFooter}>
              <Pressable style={styles.rejectCancelBtn} onPress={() => setSplitModalVisible(false)}>
                <Text style={styles.rejectCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.splitModalConfirmBtn} onPress={handleConfirmSplitDispatch}>
                <Ionicons name="checkmark-done-outline" size={16} color={COLORS.white} />
                <Text style={styles.splitModalConfirmBtnText}>Confirm Split & Dispatch Batch 1</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: PRESCRIPTION ZOOM MODAL */}
      {/* ========================================================================= */}
      <Modal visible={prescriptionZoomModal} transparent animationType="fade">
        <View style={styles.modalOverlayDark}>
          <View style={styles.zoomModalCard}>
            <View style={styles.zoomModalHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.zoomModalTitle}>Doctor Prescription Verification</Text>
                <Text style={styles.zoomModalSub} numberOfLines={1}>
                  Order #{order.id} · {patientName} ({patientPhone || "+91 98765 43210"})
                </Text>
              </View>
              <Pressable onPress={() => setPrescriptionZoomModal(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: "center", padding: 12 }}>
              {prescriptionUrl && (
                <Image source={{ uri: prescriptionUrl }} style={styles.zoomedImage} resizeMode="contain" />
              )}
            </ScrollView>

            {/* Bottom Verification & Patient Call Action Bar inside Zoom */}
            <View style={styles.zoomModalBottomBar}>
              <View style={styles.zoomModalPatientInfo}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Ionicons name="person-outline" size={12} color={COLORS.navy} />
                  <Text style={styles.zoomModalPatientName} numberOfLines={1}>
                    {patientName} · {patientPhone || "+91 98765 43210"}
                  </Text>
                </View>
                <Text style={styles.zoomModalHint}>
                  {patientCalled ? "✓ Patient called during verification" : "Call patient to verify unclear handwriting, salts, or dosage"}
                </Text>
              </View>
              <View style={styles.zoomModalActionsRow}>
                <Pressable
                  style={({ pressed }) => [styles.zoomCallPatientBtn, pressed && { opacity: 0.88 }]}
                  onPress={handleCallPatient}
                >
                  <Ionicons name="call" size={13} color={COLORS.white} />
                  <Text style={styles.zoomCallPatientBtnText}>Call Patient ({patientPhone || "+91 98765 43210"})</Text>
                </Pressable>

                {isNew && (
                  <Pressable
                    style={({ pressed }) => [styles.zoomAcceptBtn, pressed && { opacity: 0.88 }]}
                    onPress={() => {
                      setPrescriptionZoomModal(false);
                      acceptOrder(order.id);
                      Alert.alert("Prescription Accepted", `Order #${order.id} verified. You can now pick and pack medicines from warehouse racks.`);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                    <Text style={styles.zoomAcceptBtnText}>Accept Rx</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: HANDOVER PHOTO ZOOM MODAL */}
      {/* ========================================================================= */}
      <Modal visible={handoverZoomModal} transparent animationType="fade">
        <View style={styles.modalOverlayDark}>
          <View style={styles.zoomModalCard}>
            <View style={styles.zoomModalHeader}>
              <Text style={styles.zoomModalTitle}>Handover Proof Record</Text>
              <Pressable onPress={() => setHandoverZoomModal(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: "center", padding: 12 }}>
              {activeHandoverPhotoToZoom && (
                <Image source={{ uri: activeHandoverPhotoToZoom }} style={styles.zoomedImage} resizeMode="contain" />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: HANDOVER PHOTO PICKER / SAMPLES */}
      {/* ========================================================================= */}
      <Modal visible={photoPickerModal} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={styles.photoPickerCard}>
            <View style={styles.zoomModalHeader}>
              <Text style={styles.zoomModalTitle}>Attach Dispatch Handover Proof</Text>
              <Pressable onPress={() => setPhotoPickerModal(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380, padding: 16 }}>
              <Pressable style={styles.liveCameraOption} onPress={handleSimulateCameraCapture}>
                <View style={styles.cameraIconWrap}>
                  <Ionicons name="camera" size={22} color={COLORS.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cameraOptionTitle}>Take Live Desk Photo</Text>
                  <Text style={styles.cameraOptionSub}>Capture barcoded sealed parcel with dispatch timestamp</Text>
                </View>
              </Pressable>

              <Text style={styles.sampleListHeader}>OR SELECT DISPATCH SAMPLE:</Text>

              {SAMPLE_HANDOVER_PROOFS.map((proof, idx) => (
                <Pressable
                  key={idx}
                  style={styles.sampleProofCard}
                  onPress={() => handleSelectHandoverPhoto(proof.url)}
                >
                  <Image source={{ uri: proof.url }} style={styles.sampleProofThumb} />
                  <Text style={styles.sampleProofTitle} numberOfLines={2}>{proof.title}</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.teal} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: PRESCRIPTION REJECTION MODAL */}
      {/* ========================================================================= */}
      <Modal visible={rejectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={styles.rejectModalCard}>
            <View style={styles.rejectModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="alert-circle" size={22} color="#DC2626" />
                <Text style={styles.rejectModalTitle}>Reject Prescription Order</Text>
              </View>
              <Pressable onPress={() => setRejectModalVisible(false)} style={styles.modalCloseIconBtn}>
                <Ionicons name="close" size={22} color={COLORS.slate} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 420, padding: 16 }}>
              {/* Call Recommendation Banner */}
              <View style={styles.rejectCallBanner}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.rejectCallTitle}>Clarify with Patient First?</Text>
                  <Text style={styles.rejectCallSub}>
                    Call {patientName} ({patientPhone || "+91 98765 43210"}) before rejecting to request a clearer slip or verify requirements.
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.rejectCallBtn, pressed && { opacity: 0.88 }]}
                  onPress={handleCallPatient}
                >
                  <Ionicons name="call" size={13} color={COLORS.white} />
                  <Text style={styles.rejectCallBtnText}>Call Patient</Text>
                </Pressable>
              </View>

              <Text style={styles.templateSectionLabel}>SELECT REASON TEMPLATE:</Text>
              {REJECTION_TEMPLATES.map((tpl) => (
                <Pressable
                  key={tpl.id}
                  style={[styles.templatePill, selectedTemplateId === tpl.id && styles.templatePillActive]}
                  onPress={() => handleSelectTemplate(tpl)}
                >
                  <Ionicons
                    name={selectedTemplateId === tpl.id ? "radio-button-on" : "radio-button-off"}
                    size={16}
                    color={selectedTemplateId === tpl.id ? "#DC2626" : COLORS.slate}
                  />
                  <Text style={[styles.templatePillText, selectedTemplateId === tpl.id && styles.templatePillTextActive]}>
                    {tpl.label}
                  </Text>
                </Pressable>
              ))}

              <Text style={[styles.templateSectionLabel, { marginTop: 14 }]}>EXPLANATION FOR PATIENT (SENT VIA SMS):</Text>
              <TextInput
                style={styles.rejectionTextInput}
                multiline
                numberOfLines={4}
                value={rejectReasonText}
                onChangeText={setRejectReasonText}
                placeholder="Explain clearly why this prescription cannot be fulfilled..."
              />
            </ScrollView>

            <View style={styles.rejectModalFooter}>
              <Pressable style={styles.rejectCancelBtn} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.rejectCancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.rejectConfirmBtn} onPress={handleConfirmRejection}>
                <Ionicons name="trash-outline" size={16} color={COLORS.white} />
                <Text style={styles.rejectConfirmBtnText}>Confirm Rejection</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, gap: 12 },
  notFoundTitle: { fontSize: 18, fontWeight: "700", color: COLORS.navy },
  notFoundSub: { fontSize: 13, color: COLORS.slate, textAlign: "center" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  backButtonText: { color: COLORS.white, fontWeight: "600" },

  orderHeaderCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.line },
  orderHeaderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderIdText: { fontSize: 18, fontWeight: "800", color: COLORS.navy },
  orderTimeText: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },

  quickHeaderLinksRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.line, gap: 8 },
  headerCallPatientPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.tealLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flex: 1 },
  headerCallPatientText: { fontSize: 11, fontWeight: "700", color: COLORS.teal, flexShrink: 1 },
  headerCalledDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#059669" },
  invoiceQuickLink: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  invoiceQuickLinkText: { fontSize: 12, fontWeight: "600", color: COLORS.navy },

  sectionCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.line },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.navy },
  totalHeaderVal: { fontSize: 16, fontWeight: "800", color: COLORS.navy },
  availabilitySubtitle: { fontSize: 11, color: COLORS.slate, marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  verifiedBadgeText: { fontSize: 10, fontWeight: "700", color: "#059669" },

  /* Pharmacist Verification Call Box */
  verificationCallBox: { backgroundColor: "#F0FDFA", borderWidth: 1, borderColor: COLORS.tealLight, borderRadius: 8, padding: 12, marginBottom: 12 },
  verificationCallHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  verificationCallTitle: { fontSize: 12, fontWeight: "700", color: COLORS.teal },
  verificationCallHint: { fontSize: 10, fontWeight: "600", color: COLORS.slate },
  patientCalledTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  patientCalledTagText: { fontSize: 10, fontWeight: "700", color: "#059669" },
  verificationCallDesc: { fontSize: 11, color: COLORS.slate, lineHeight: 15, marginBottom: 8 },
  callPatientActiveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.teal, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  callPatientActiveBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.white },

  prescriptionPreviewWrap: { height: 160, borderRadius: 8, overflow: "hidden", position: "relative", marginBottom: 10 },
  prescriptionImage: { width: "100%", height: "100%" },
  zoomOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15, 23, 42, 0.7)", paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  zoomText: { color: COLORS.white, fontSize: 11, fontWeight: "600" },
  noRxBox: { alignItems: "center", justifyContent: "center", height: 100, backgroundColor: "#F8FAFC", borderRadius: 8, gap: 6 },
  noRxText: { fontSize: 12, color: COLORS.slate },

  doctorInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 8, marginBottom: 12 },
  doctorNameText: { fontSize: 12, fontWeight: "600", color: COLORS.navy },
  rxActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    alignItems: "stretch"
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    minHeight: 46
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626"
  },
  acceptBtn: {
    flex: 1.35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    minHeight: 46,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white
  },

  rejectionCard: { backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#FEE2E2" },
  rejectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  rejectionTitle: { fontSize: 13, fontWeight: "700", color: "#DC2626" },
  rejectionReasonText: { fontSize: 12, color: "#991B1B", lineHeight: 17 },
  recontactRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#FEE2E2" },
  recontactText: { fontSize: 11, color: "#991B1B" },
  recontactBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  recontactBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.navy },

  medicineCardItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.line },
  medicineCardItemPicked: { backgroundColor: "#F0FDFA", borderColor: COLORS.tealLight },
  medicineCardItemOutOfStock: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  itemName: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
  itemNamePicked: { color: COLORS.teal },
  itemDosage: { fontSize: 11, color: COLORS.slate, marginTop: 2 },
  itemHsn: { fontSize: 10, color: COLORS.slateLight, marginTop: 2 },

  itemStockPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  itemStockPillIn: { backgroundColor: "#ECFDF5" },
  itemStockPillLow: { backgroundColor: "#FEF3C7" },
  itemStockPillOut: { backgroundColor: "#FEE2E2" },
  itemStockDot: { width: 5, height: 5, borderRadius: 2.5 },
  itemStockPillText: { fontSize: 10, fontWeight: "700" },

  itemBatchExpiryRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  itemBatchText: { fontSize: 10, fontWeight: "600", color: COLORS.slate },
  itemBatchDivider: { fontSize: 10, color: COLORS.slateLight },
  itemExpiryText: { fontSize: 10, fontWeight: "600", color: COLORS.slate },
  itemExpiryTextUrgent: { color: "#DC2626", fontWeight: "700" },

  qtyBadge: { backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.line },
  qtyBadgeOut: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  qtyText: { fontSize: 12, fontWeight: "700", color: COLORS.navy },

  actionContainer: { marginBottom: 14 },
  primaryActionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.teal, paddingVertical: 14, borderRadius: 10 },
  primaryActionText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  verifyHint: { textAlign: "center", fontSize: 11, color: COLORS.slate, marginTop: 6 },

  splitActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EA580C",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#EA580C",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  splitActionIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  splitActionBtnTitle: { fontSize: 14, fontWeight: "800", color: COLORS.white },
  splitActionBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.9)", marginTop: 2 },

  packAllSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: 10,
    borderRadius: 8
  },
  packAllSecondaryText: { fontSize: 12, fontWeight: "700", color: COLORS.navy },

  /* Split master view styles */
  splitMasterContainer: { marginBottom: 14, gap: 12 },
  splitHeaderCard: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", borderRadius: 12, padding: 14 },
  splitHeaderTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  splitBadgeIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFEDD5", alignItems: "center", justifyContent: "center", marginTop: 2 },
  splitMasterTitle: { fontSize: 14, fontWeight: "800", color: "#9A3412" },
  splitMasterDesc: { fontSize: 12, color: "#C2410C", marginTop: 3, lineHeight: 16 },

  batchCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.line },
  batchCardPending: { borderColor: "#FED7AA", backgroundColor: "#FFFAF5" },
  batchHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  batchNumberCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.teal, alignItems: "center", justifyContent: "center" },
  batchNumberText: { color: COLORS.white, fontSize: 11, fontWeight: "800" },
  batchTitle: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
  batchStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  batchStatusPillText: { fontSize: 10, fontWeight: "700" },

  batchItemsBox: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginBottom: 10, gap: 6 },
  batchItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  batchItemName: { fontSize: 12, fontWeight: "600", color: COLORS.navy, flex: 1 },
  batchItemDosage: { fontSize: 11, fontWeight: "700", color: COLORS.slate },

  handoverBoxSub: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 10, marginTop: 10, borderWidth: 1, borderColor: COLORS.line },
  subStepTitle: { fontSize: 11, fontWeight: "700", color: COLORS.navy, marginBottom: 8 },
  handoverDoneNotice: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ECFDF5", padding: 10, borderRadius: 8, marginTop: 10 },
  handoverDoneNoticeText: { fontSize: 12, color: "#059669", fontWeight: "600", flex: 1 },

  splitNoticeBox: { flexDirection: "row", gap: 8, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", borderRadius: 8, padding: 10, marginBottom: 10 },
  splitNoticeTitle: { fontSize: 11, fontWeight: "700", color: "#9A3412" },
  splitNoticeDesc: { fontSize: 11, color: "#C2410C", fontStyle: "italic", marginTop: 2 },
  splitNoticeEta: { fontSize: 11, fontWeight: "800", color: "#9A3412", marginTop: 4 },

  packRemainingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EA580C",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4
  },
  packRemainingBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.white },

  liveEtaPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#059669" },
  liveEtaText: { fontSize: 10, fontWeight: "700", color: "#059669" },

  captainCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F0FDFA", padding: 12, borderRadius: 8, marginBottom: 6 },
  captainAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" },
  captainName: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
  captainVehicle: { fontSize: 11, color: COLORS.slate, marginTop: 1 },
  callCaptainBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.teal, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  callCaptainBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.white },

  handoverStepBox: { backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.line },
  stepTitle: { fontSize: 12, fontWeight: "700", color: COLORS.navy },
  stepDesc: { fontSize: 11, color: COLORS.slate, marginTop: 2, marginBottom: 10 },

  attachedPhotoRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.white, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#D1FAE5" },
  attachedPhotoThumb: { width: 44, height: 44, borderRadius: 6 },
  attachedPhotoTitle: { fontSize: 12, fontWeight: "700", color: "#059669" },
  attachedPhotoTime: { fontSize: 10, color: COLORS.slate },
  retakeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  retakeBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.teal },

  photoActionButtonsRow: { flexDirection: "row", gap: 10 },
  takePhotoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.teal, paddingVertical: 10, borderRadius: 6 },
  takePhotoBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.white },
  selectSamplePhotoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#F1F5F9", paddingVertical: 10, borderRadius: 6 },
  selectSamplePhotoBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.navy },

  otpInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  otpInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
    backgroundColor: COLORS.white,
    color: COLORS.navy
  },
  otpInputErr: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2"
  },
  confirmHandoverBtn: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingHorizontal: 16,
    shadowColor: "#059669",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  confirmHandoverBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white
  },
  errorText: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 4
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0
  },

  handoverDetailsText: { fontSize: 13, color: COLORS.navy },
  handoverTimeSubText: { fontSize: 11, color: COLORS.slate, marginTop: 2, marginBottom: 10 },
  proofThumbWrap: { height: 120, borderRadius: 8, overflow: "hidden", position: "relative", backgroundColor: COLORS.line },
  proofThumbImage: { width: "100%", height: "100%", resizeMode: "cover" },
  proofOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", paddingVertical: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  proofOverlayText: { color: COLORS.white, fontSize: 11, fontWeight: "600" },

  callPatientPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F0FDFA", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  callPatientPillText: { fontSize: 11, fontWeight: "600", color: COLORS.teal },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  infoLabel: { fontSize: 12, color: COLORS.slate },
  infoValue: { fontSize: 12, fontWeight: "600", color: COLORS.navy },

  timelineItem: { flexDirection: "row", gap: 10 },
  timelineLeftCol: { alignItems: "center", width: 14 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.teal, marginTop: 4 },
  timelineLine: { width: 1, flex: 1, backgroundColor: COLORS.line, marginTop: 4 },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineStatus: { fontSize: 12, fontWeight: "700", color: COLORS.navy },
  timelineTime: { fontSize: 10, color: COLORS.slate },
  timelineDesc: { fontSize: 11, color: COLORS.slate, marginTop: 2 },

  /* Modal Base */
  modalOverlayDark: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.75)", justifyContent: "center", alignItems: "center", padding: 14 },
  zoomModalCard: { width: "100%", maxWidth: 500, backgroundColor: COLORS.card, borderRadius: 14, overflow: "hidden" },
  zoomModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  zoomModalTitle: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  zoomModalSub: { fontSize: 11, color: COLORS.slate, marginTop: 2 },
  modalCloseIconBtn: { padding: 4 },
  zoomedImage: { width: "100%", height: 360, borderRadius: 8, resizeMode: "contain", backgroundColor: "#0F172A" },

  zoomModalBottomBar: { backgroundColor: "#F8FAFC", borderTopWidth: 1, borderTopColor: COLORS.line, padding: 12, gap: 10 },
  zoomModalPatientInfo: { gap: 2 },
  zoomModalPatientName: { fontSize: 12, fontWeight: "700", color: COLORS.navy },
  zoomModalHint: { fontSize: 11, color: COLORS.slate },
  zoomModalActionsRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  zoomCallPatientBtn: { flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.teal, paddingVertical: 9, borderRadius: 6 },
  zoomCallPatientBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.white },
  zoomAcceptBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#059669", paddingVertical: 9, borderRadius: 6 },
  zoomAcceptBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.white },

  photoPickerCard: { width: "100%", maxWidth: 460, backgroundColor: COLORS.card, borderRadius: 14, overflow: "hidden" },
  liveCameraOption: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.teal, padding: 14, borderRadius: 8, marginBottom: 14 },
  cameraIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cameraOptionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.white },
  cameraOptionSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  sampleListHeader: { fontSize: 10, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 8 },
  sampleProofCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.line, marginBottom: 8 },
  sampleProofThumb: { width: 44, height: 44, borderRadius: 6 },
  sampleProofTitle: { fontSize: 12, color: COLORS.navy, flex: 1 },

  shortageSplitBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.coralLight,
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8
  },
  shortageSplitBannerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C2410C"
  },

  manualSplitTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.coral,
    paddingVertical: 11,
    borderRadius: 10
  },
  manualSplitTriggerText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.coral
  },

  /* Split Modal */
  splitModalCard: { width: "100%", maxWidth: 480, maxHeight: "90%", backgroundColor: COLORS.card, borderRadius: 14, overflow: "hidden" },
  splitModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.coralLight },
  splitModalIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center" },
  splitModalTitle: { fontSize: 14, fontWeight: "800", color: COLORS.navy },
  splitModalSub: { fontSize: 11, color: COLORS.slate, marginTop: 1 },

  splitItemConfigCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  splitItemConfigHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  splitItemConfigName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
    flex: 1
  },
  splitItemTotalQty: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  splitItemStockSub: {
    fontSize: 11,
    color: COLORS.teal,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 8
  },
  splitAllocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  splitColBox: {
    flex: 1,
    backgroundColor: COLORS.tealLight,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 8,
    padding: 8
  },
  splitColLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.4,
    marginBottom: 6
  },
  splitStepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 2
  },
  splitStepBtn: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    backgroundColor: "#F1F5F9"
  },
  splitStepVal: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  splitRemainingBadge: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FED7AA"
  },
  splitRemainingVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.coral
  },

  modalSectionLabel: { fontSize: 10, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 6 },
  etaChipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  etaChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  etaChipActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coralLight },
  etaChipText: { fontSize: 11, fontWeight: "600", color: COLORS.navy },
  etaChipTextActive: { color: COLORS.coral, fontWeight: "700" },

  patientMessageInput: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, padding: 10, fontSize: 12, color: COLORS.navy, height: 65, textAlignVertical: "top", backgroundColor: "#F8FAFC" },
  smsNoticeText: { fontSize: 10, color: COLORS.slate, marginTop: 4, fontStyle: "italic" },

  splitModalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.coralLight },
  splitModalConfirmBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.coral, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
  splitModalConfirmBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.white },

  /* Rejection Modal */
  rejectModalCard: { width: "100%", maxWidth: 480, maxHeight: "90%", backgroundColor: COLORS.card, borderRadius: 14, overflow: "hidden" },
  rejectModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  rejectModalTitle: { fontSize: 14, fontWeight: "700", color: "#DC2626" },

  rejectCallBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FEE2E2", borderRadius: 8, padding: 10, marginBottom: 12 },
  rejectCallTitle: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
  rejectCallSub: { fontSize: 11, color: "#991B1B", marginTop: 2 },
  rejectCallBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#DC2626", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  rejectCallBtnText: { fontSize: 11, fontWeight: "700", color: COLORS.white },

  templateSectionLabel: { fontSize: 10, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 6 },
  templatePill: { flexDirection: "row", alignItems: "center", gap: 8, padding: 9, borderRadius: 6, borderWidth: 1, borderColor: COLORS.line, marginBottom: 6 },
  templatePillActive: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  templatePillText: { fontSize: 12, color: COLORS.navy, flex: 1 },
  templatePillTextActive: { color: "#DC2626", fontWeight: "600" },
  rejectionTextInput: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, padding: 10, fontSize: 12, color: COLORS.navy, height: 75, textAlignVertical: "top" },
  rejectModalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.line },
  rejectCancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  rejectCancelBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.slate },
  rejectConfirmBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#DC2626", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  rejectConfirmBtnText: { fontSize: 12, fontWeight: "700", color: COLORS.white },

  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: COLORS.bg
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 12
  },
  notFoundSub: {
    fontSize: 13,
    color: COLORS.slate,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 300
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  }
});