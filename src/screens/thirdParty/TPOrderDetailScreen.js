import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";
import AdminTrackingModal from "../../components/AdminTrackingModal";

export default function TPOrderDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { orderId } = route.params || {};

  const {
    currentTpProfile,
    currentTpOrders,
    tpCheckStock,
    tpAcceptOrder,
    tpRejectOrder,
    tpToggleItemPicked,
    tpUpdatePreparationStatus,
    tpPackOrder,
    tpDispatchOrder,
    tpDeliverOrder
  } = usePharmacy();

  const order = currentTpOrders.find(o => o.id === orderId) || currentTpOrders[0];

  const [isAdminTrackingOpen, setIsAdminTrackingOpen] = useState(false);
  const [pouchId, setPouchId] = useState("POUCH-APEX-" + Math.floor(10000 + Math.random() * 90000));
  const [tamperSeal, setTamperSeal] = useState("SEAL-KA-" + Math.floor(1000 + Math.random() * 9000));
  const [enteredOtp, setEnteredOtp] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.coral} />
        <Text style={styles.errorText}>External Order not found</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back to Orders</Text>
        </Pressable>
      </View>
    );
  }

  const isPending = order.status === "Pending Acceptance" || order.status === "New Assigned";
  const isAccepted = order.status === "Accepted";
  const isPicking = order.status === "Picking";
  const isPacked = order.status === "Packed";
  const isDispatched = order.status === "Dispatched";
  const isDelivered = order.status === "Delivered";
  const isRejected = order.status === "Rejected";

  const allPicked = order.items.every(i => i.picked);

  // Handlers
  const handleCheckStock = () => {
    const res = tpCheckStock(order.id);
    if (res.canFulfill) {
      Alert.alert(
        "Stock Verification Passed",
        "All items are in stock with valid unexpired batches in your pharmacy inventory. Ready for fulfilment!"
      );
    } else {
      Alert.alert(
        "Stock Issue Flagged",
        res.issues.join("\n") + "\n\nYou can reject the order so MediUnify Admin can reassign it."
      );
    }
  };

  const handleAccept = () => {
    const res = tpCheckStock(order.id);
    if (!res.canFulfill) {
      Alert.alert(
        "Cannot Accept Order",
        res.issues[0] || "Stock issue identified. Please review inventory or reject."
      );
      return;
    }
    tpAcceptOrder(order.id);
  };

  const handleStartPicking = () => {
    tpUpdatePreparationStatus(order.id, "Picking");
  };

  const handlePack = () => {
    if (!allPicked) {
      Alert.alert("Pending Items", "Please pick all medicines before sealing the package.");
      return;
    }
    tpPackOrder(order.id, { pouchId, tamperSealNumber: tamperSeal });
    Alert.alert("Order Packed", `Order #${order.id} is sealed in security pouch #${pouchId}. Pickup fleet notified.`);
  };

  const handleDispatch = () => {
    tpDispatchOrder(order.id, {
      captain: {
        id: "CAP-TP-01",
        name: "Kiran Gowda",
        phone: "+91 98455 22110",
        vehicle: "Honda Activa · KA-05-MN-2022",
        etaMins: 10
      }
    });
    Alert.alert("Order Dispatched", "Handed over to delivery partner. Tracking active.");
  };

  const handleDeliver = () => {
    const otpToTest = enteredOtp || order.handoverOtp;
    const res = tpDeliverOrder(order.id, { enteredOtp: otpToTest, proofNote: deliveryNote });
    if (res.success) {
      Alert.alert("Delivery Confirmed", `Order #${order.id} marked as Delivered with OTP verification.`);
    } else {
      Alert.alert("Verification Error", res.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 1080, width: "100%", alignSelf: "center", paddingHorizontal: 24 },
        { paddingBottom: Math.max(insets.bottom, 16) + 40 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Breadcrumb & Status Lockup */}
      <View style={styles.topBanner}>
        <View style={styles.topBannerLeft}>
          <View style={styles.topIdRow}>
            <Text style={styles.orderTitleId}>{order.id}</Text>
            {order.isSplitOrder && (
              <View style={styles.splitOrderBadge}>
                <Ionicons name="git-branch" size={12} color={COLORS.teal} />
                <Text style={styles.splitOrderBadgeText}>
                  Split Order Part (Hub #{order.originalOrderId})
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.orderAssignedTimestamp}>
            Assigned: {order.adminAssignmentTimestamp} · {order.assignmentReason}
          </Text>
        </View>

        {/* Status Tag */}
        <View
          style={[
            styles.statusTag,
            isPending && { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
            (isAccepted || isPicking) && { backgroundColor: COLORS.coralLight, borderColor: "#FED7AA" },
            isPacked && { backgroundColor: COLORS.aquaLight, borderColor: "#A5F3FC" },
            isDispatched && { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
            isDelivered && { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
            isRejected && { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }
          ]}
        >
          <Text
            style={[
              styles.statusTagText,
              isPending && { color: "#DC2626" },
              (isAccepted || isPicking) && { color: COLORS.coral },
              isPacked && { color: COLORS.navy },
              isDispatched && { color: "#1E40AF" },
              isDelivered && { color: "#166534" },
              isRejected && { color: "#991B1B" }
            ]}
          >
            {order.status}
          </Text>
        </View>
      </View>

      {/* Split Order Admin Link Banner */}
      {order.isSplitOrder && (
        <Pressable
          style={({ pressed }) => [styles.adminSyncBanner, pressed && { opacity: 0.9 }]}
          onPress={() => setIsAdminTrackingOpen(true)}
        >
          <View style={styles.adminSyncIcon}>
            <Ionicons name="git-network-outline" size={20} color={COLORS.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminSyncTitle}>Split Order Fulfilment ({order.items.length} of 5 Medicines)</Text>
            <Text style={styles.adminSyncDesc} numberOfLines={2}>
              {order.splitNote || "3 medicines fulfilled by Central Hub. These remaining medicines were routed to your pharmacy following network availability response."}
            </Text>
          </View>
          <View style={styles.adminSyncAction}>
            <Text style={styles.adminSyncActionText}>Admin Sync View</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.navy} />
          </View>
        </Pressable>
      )}

      {/* Workflow Progress Bar */}
      <View style={styles.workflowCard}>
        <Text style={styles.cardSectionLabel}>FULFILMENT LIFECYCLE PROGRESS</Text>
        <View style={styles.stepIndicatorRow}>
          {/* Step 1: Assigned */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleDone]}>
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            </View>
            <Text style={styles.stepLabelActive}>Assigned</Text>
          </View>
          <View style={[styles.stepLine, (isAccepted || isPicking || isPacked || isDispatched || isDelivered) && styles.stepLineDone]} />

          {/* Step 2: Accepted */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, (isAccepted || isPicking || isPacked || isDispatched || isDelivered) && styles.stepCircleDone]}>
              {(isAccepted || isPicking || isPacked || isDispatched || isDelivered) ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNum}>2</Text>
              )}
            </View>
            <Text style={(isAccepted || isPicking || isPacked || isDispatched || isDelivered) ? styles.stepLabelActive : styles.stepLabel}>
              Accepted
            </Text>
          </View>
          <View style={[styles.stepLine, (isPicking || isPacked || isDispatched || isDelivered) && styles.stepLineDone]} />

          {/* Step 3: Picking */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, (isPicking || isPacked || isDispatched || isDelivered) && styles.stepCircleDone]}>
              {(isPacked || isDispatched || isDelivered) ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNum}>3</Text>
              )}
            </View>
            <Text style={(isPicking || isPacked || isDispatched || isDelivered) ? styles.stepLabelActive : styles.stepLabel}>
              Picking
            </Text>
          </View>
          <View style={[styles.stepLine, (isPacked || isDispatched || isDelivered) && styles.stepLineDone]} />

          {/* Step 4: Packed */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, (isPacked || isDispatched || isDelivered) && styles.stepCircleDone]}>
              {(isDispatched || isDelivered) ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNum}>4</Text>
              )}
            </View>
            <Text style={(isPacked || isDispatched || isDelivered) ? styles.stepLabelActive : styles.stepLabel}>
              Packed
            </Text>
          </View>
          <View style={[styles.stepLine, (isDispatched || isDelivered) && styles.stepLineDone]} />

          {/* Step 5: Dispatched / Delivered */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, isDelivered && styles.stepCircleDone]}>
              {isDelivered ? (
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNum}>5</Text>
              )}
            </View>
            <Text style={isDelivered ? styles.stepLabelActive : styles.stepLabel}>
              Delivered
            </Text>
          </View>
        </View>
      </View>

      {/* Patient & Prescription Info Box */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.cardSectionLabel}>PATIENT & PRESCRIPTION INFORMATION</Text>
          <View style={styles.privacyShield}>
            <Ionicons name="lock-closed" size={11} color={COLORS.teal} />
            <Text style={styles.privacyShieldText}>Privacy Protected</Text>
          </View>
        </View>

        <View style={styles.patientGrid}>
          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>PATIENT NAME</Text>
            <Text style={styles.metaVal}>{order.patientName}</Text>
          </View>

          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>AGE / GENDER</Text>
            <Text style={styles.metaVal}>{order.patientAge} Years · {order.patientGender}</Text>
          </View>

          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>MASKED CONTACT</Text>
            <Text style={[styles.metaVal, { color: COLORS.teal }]}>{order.patientPhoneMasked}</Text>
          </View>

          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>DELIVERY ZONE</Text>
            <Text style={styles.metaVal}>{order.deliveryAddressArea}</Text>
          </View>

          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>DOCTOR / CLINIC</Text>
            <Text style={styles.metaVal}>{order.doctorName}</Text>
            <Text style={styles.metaSubVal}>{order.clinicName}</Text>
          </View>

          <View style={styles.patientGridCol}>
            <Text style={styles.metaLabel}>DELIVERY INSTRUCTIONS</Text>
            <Text style={styles.metaVal}>{order.deliveryInstructions || "Standard Handover"}</Text>
          </View>
        </View>
      </View>

      {/* Required Medicine Items Checklist (Interactive Picking) */}
      <View style={styles.medicineChecklistCard}>
        <View style={styles.checklistHeaderRow}>
          <View>
            <Text style={styles.cardSectionLabel}>MEDICINE ITEMS & BATCH ALLOCATION</Text>
            <Text style={styles.checklistSub}>
              Verify allocated batch, check expiry compliance, and tick items as picked
            </Text>
          </View>
          <Pressable style={styles.stockCheckPillBtn} onPress={handleCheckStock}>
            <Ionicons name="checkbox-outline" size={13} color={COLORS.navy} />
            <Text style={styles.stockCheckPillBtnText}>Verify Inventory Stock</Text>
          </Pressable>
        </View>

        <View style={styles.itemsListWrap}>
          {order.items.map((med, index) => {
            return (
              <View key={index} style={[styles.itemPickRow, med.picked && styles.itemPickRowPicked]}>
                {/* Picking Checkbox */}
                <Pressable
                  style={styles.pickCheckbox}
                  onPress={() => {
                    if (isPending) {
                      Alert.alert("Order Pending", "Please accept the order before picking medicines.");
                      return;
                    }
                    tpToggleItemPicked(order.id, index);
                  }}
                >
                  <Ionicons
                    name={med.picked ? "checkbox" : "square-outline"}
                    size={22}
                    color={med.picked ? COLORS.teal : COLORS.slate}
                  />
                </Pressable>

                <View style={{ flex: 1 }}>
                  <View style={styles.itemTitleRow}>
                    <Text style={[styles.itemName, med.picked && styles.itemNamePicked]}>
                      {med.name} {med.strength ? `(${med.strength})` : ""}
                    </Text>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeText}>Qty: {med.quantity}</Text>
                    </View>
                  </View>

                  <Text style={styles.itemDosage}>
                    Dosage: {med.dosage || "As prescribed by doctor"}
                  </Text>

                  <View style={styles.batchInfoRow}>
                    <Ionicons name="barcode-outline" size={13} color={COLORS.teal} />
                    <Text style={styles.batchText}>
                      Allocated Batch: <Text style={{ fontWeight: "800" }}>{med.allocatedBatch || "ALK-2026-90"}</Text>
                    </Text>
                    <Text style={styles.expiryText}>Exp: {med.allocatedExpiry || "2027-11"} (Valid)</Text>
                  </View>
                </View>

                <View style={styles.priceCol}>
                  <Text style={styles.itemPriceText}>₹{med.unitPrice * med.quantity}</Text>
                  <Text style={styles.itemPriceSub}>₹{med.unitPrice} ea</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Interactive Fulfilment Stage Controls */}
      <View style={styles.stageActionCard}>
        {/* State 1: Pending Acceptance */}
        {isPending && (
          <View style={styles.stageBox}>
            <Text style={styles.stageTitle}>Step 1: Review & Accept Order</Text>
            <Text style={styles.stageSub}>
              Ensure items are in stock in your pharmacy inventory before accepting.
            </Text>
            <View style={styles.stageBtnsRow}>
              <Pressable style={styles.acceptPrimaryBtn} onPress={handleAccept}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                <Text style={styles.acceptPrimaryBtnText}>Accept External Order</Text>
              </Pressable>

              <Pressable
                style={styles.rejectSecondaryBtn}
                onPress={() => {
                  tpRejectOrder(order.id, "Pharmacist reported insufficient stock", "TP-MEDPLUS-02");
                  Alert.alert("Order Rejected", "Admin alerted to reassign this order.");
                }}
              >
                <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                <Text style={styles.rejectSecondaryBtnText}>Report Insufficient Stock</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* State 2: Accepted / Picking */}
        {(isAccepted || isPicking) && (
          <View style={styles.stageBox}>
            <Text style={styles.stageTitle}>Step 2: Pick & Security Packaging</Text>
            <Text style={styles.stageSub}>
              {allPicked
                ? "All medicines are picked! Enter the tamper-proof security pouch ID and seal."
                : "Tick each medicine checkbox above as you pick it from your shelves."}
            </Text>

            {allPicked ? (
              <View style={styles.packingForm}>
                <View style={styles.packingInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Security Pouch ID</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={pouchId}
                      onChangeText={setPouchId}
                      placeholder="e.g. POUCH-APEX-88210"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Tamper Seal Code</Text>
                    <TextInput
                      style={styles.inputBox}
                      value={tamperSeal}
                      onChangeText={setTamperSeal}
                      placeholder="e.g. SEAL-KA-9901"
                    />
                  </View>
                </View>

                <Pressable style={styles.packBtn} onPress={handlePack}>
                  <Ionicons name="bag-check" size={16} color={COLORS.white} />
                  <Text style={styles.packBtnText}>Seal in Security Pouch & Mark Packed</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.startPickingBtn} onPress={handleStartPicking}>
                <Ionicons name="flask-outline" size={16} color={COLORS.white} />
                <Text style={styles.startPickingBtnText}>Start Medicine Picking</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* State 3: Packed & Ready for Dispatch */}
        {isPacked && (
          <View style={styles.stageBox}>
            <Text style={styles.stageTitle}>Step 3: Dispatch & Delivery Fleet Handover</Text>
            <Text style={styles.stageSub}>
              Order is packed in pouch #{order.packagingPouchId || pouchId}. Hand over to delivery captain.
            </Text>

            {order.captain ? (
              <View style={styles.captainCard}>
                <Ionicons name="bicycle" size={24} color={COLORS.navy} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.captainName}>Captain: {order.captain.name}</Text>
                  <Text style={styles.captainVehicle}>{order.captain.vehicle} · {order.captain.phone}</Text>
                  <Text style={styles.captainOtp}>Demo Handover OTP: {order.handoverOtp || "4921"}</Text>
                </View>
              </View>
            ) : null}

            <Pressable style={styles.dispatchBtn} onPress={handleDispatch}>
              <Ionicons name="paper-plane" size={16} color={COLORS.white} />
              <Text style={styles.dispatchBtnText}>Hand Over to Fleet & Mark Dispatched</Text>
            </Pressable>
          </View>
        )}

        {/* State 4: Dispatched / Out for Delivery */}
        {isDispatched && (
          <View style={styles.stageBox}>
            <Text style={styles.stageTitle}>Step 4: Confirm Delivery to Patient</Text>
            <Text style={styles.stageSub}>
              Order is out for customer delivery. Enter patient handover OTP to complete.
            </Text>

            <View style={styles.deliveryConfirmRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Recipient OTP</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder={`Demo OTP: ${order.handoverOtp || "4921"}`}
                  value={enteredOtp}
                  onChangeText={setEnteredOtp}
                  keyboardType="numeric"
                />
              </View>
              <Pressable style={styles.deliverBtn} onPress={handleDeliver}>
                <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
                <Text style={styles.deliverBtnText}>Confirm Delivery</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* State 5: Delivered */}
        {isDelivered && (
          <View style={styles.deliveredSuccessBox}>
            <Ionicons name="checkmark-done-circle" size={28} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveredSuccessTitle}>Fulfilment Successfully Completed</Text>
              <Text style={styles.deliveredSuccessSub}>
                Delivered on {order.deliveredAt || "Today"}. Payout of ₹{order.partnerSettlementAmount?.toFixed(2)} credited to your pharmacy ledger.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Order Audit Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.cardSectionLabel}>FULFILMENT AUDIT TIMELINE</Text>
        <View style={styles.timelineList}>
          {order.timeline?.map((step, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={{ flex: 1 }}>
                <View style={styles.timelineHeadingRow}>
                  <Text style={styles.timelineStatus}>{step.status}</Text>
                  <Text style={styles.timelineTime}>{step.timestamp}</Text>
                </View>
                <Text style={styles.timelineDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Admin Split Order Tracking Modal */}
      <AdminTrackingModal
        visible={isAdminTrackingOpen}
        onClose={() => setIsAdminTrackingOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12
  },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  backBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: "700"
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 10
  },
  topBannerLeft: {
    flex: 1
  },
  topIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  orderTitleId: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  splitOrderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  splitOrderBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal
  },
  orderAssignedTimestamp: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 4
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: "800"
  },
  adminSyncBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.navyLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  adminSyncIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  adminSyncTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  adminSyncDesc: {
    fontSize: 11,
    color: COLORS.navyMuted,
    marginTop: 1
  },
  adminSyncAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  adminSyncActionText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  workflowCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.6,
    marginBottom: 10
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  stepItem: {
    alignItems: "center",
    gap: 4
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center"
  },
  stepCircleDone: {
    backgroundColor: COLORS.teal
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slateLight
  },
  stepLabelActive: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 4,
    marginBottom: 16
  },
  stepLineDone: {
    backgroundColor: COLORS.teal
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  privacyShield: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  privacyShieldText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.teal
  },
  patientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  patientGridCol: {
    width: "48%",
    minWidth: 140
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navyDark,
    marginTop: 2
  },
  metaSubVal: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  medicineChecklistCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  checklistHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8
  },
  checklistSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  stockCheckPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  stockCheckPillBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  itemsListWrap: {
    gap: 10
  },
  itemPickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  itemPickRowPicked: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0"
  },
  pickCheckbox: {
    padding: 2
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  itemName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  itemNamePicked: {
    color: "#166534"
  },
  qtyBadge: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  qtyBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy
  },
  itemDosage: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  batchInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    flexWrap: "wrap"
  },
  batchText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  expiryText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600"
  },
  priceCol: {
    alignItems: "flex-end"
  },
  itemPriceText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  itemPriceSub: {
    fontSize: 10,
    color: COLORS.slate
  },
  stageActionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  stageBox: {
    gap: 8
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  stageSub: {
    fontSize: 12,
    color: COLORS.slate,
    lineHeight: 16
  },
  stageBtnsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap"
  },
  acceptPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  acceptPrimaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  rejectSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  rejectSecondaryBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700"
  },
  startPickingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.coral,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8
  },
  startPickingBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  packingForm: {
    gap: 10,
    marginTop: 8
  },
  packingInputRow: {
    flexDirection: "row",
    gap: 10
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navyDark,
    marginBottom: 4
  },
  inputBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navyDark
  },
  packBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    borderRadius: 8
  },
  packBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  captainCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginVertical: 8
  },
  captainName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  captainVehicle: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  captainOtp: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.teal,
    marginTop: 2
  },
  dispatchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.teal,
    paddingVertical: 12,
    borderRadius: 8
  },
  dispatchBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  deliveryConfirmRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 8
  },
  deliverBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  deliverBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800"
  },
  deliveredSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0"
  },
  deliveredSuccessTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534"
  },
  deliveredSuccessSub: {
    fontSize: 12,
    color: "#166534",
    marginTop: 2
  },
  timelineCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  timelineList: {
    gap: 12
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
    marginTop: 5
  },
  timelineHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  timelineStatus: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  timelineTime: {
    fontSize: 10,
    color: COLORS.slate
  },
  timelineDesc: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2,
    lineHeight: 15
  }
});
