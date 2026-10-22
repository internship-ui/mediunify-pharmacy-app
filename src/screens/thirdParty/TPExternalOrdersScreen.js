import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";
import AdminTrackingModal from "../../components/AdminTrackingModal";

export default function TPExternalOrdersScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    currentTpProfile,
    currentTpOrders,
    currentTpInventory,
    tpCheckStock,
    tpAcceptOrder,
    tpRejectOrder
  } = usePharmacy();

  const initialTab = route?.params?.tab || "All";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Stock Check Modal State
  const [stockCheckResult, setStockCheckResult] = useState(null);
  const [stockCheckTargetOrder, setStockCheckTargetOrder] = useState(null);
  const [isStockCheckModalOpen, setIsStockCheckModalOpen] = useState(false);

  // Reject / Reassign Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetOrder, setRejectTargetOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("Insufficient stock balance in pharmacy inventory");
  const [selectedAlternativePartner, setSelectedAlternativePartner] = useState("TP-MEDPLUS-02");

  // Admin Tracking Modal State
  const [isAdminTrackingOpen, setIsAdminTrackingOpen] = useState(false);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return currentTpOrders.filter(order => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchId = order.id.toLowerCase().includes(q);
        const matchOriginal = order.originalOrderId?.toLowerCase().includes(q);
        const matchPatient = order.patientName.toLowerCase().includes(q);
        const matchArea = order.deliveryAddressArea?.toLowerCase().includes(q);
        const matchItem = order.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchId && !matchOriginal && !matchPatient && !matchArea && !matchItem) return false;
      }

      // Tab matching
      if (activeTab === "Pending") return order.status === "Pending Acceptance" || order.status === "New Assigned";
      if (activeTab === "Preparation") return order.status === "Accepted" || order.status === "Picking";
      if (activeTab === "Ready") return order.status === "Packed";
      if (activeTab === "Dispatched") return order.status === "Dispatched";
      if (activeTab === "History") return order.status === "Delivered";
      if (activeTab === "Rejected") return order.status === "Rejected";

      return true;
    });
  }, [currentTpOrders, searchQuery, activeTab]);

  // Tab counts
  const pendingCount = currentTpOrders.filter(o => o.status === "Pending Acceptance" || o.status === "New Assigned").length;
  const prepCount = currentTpOrders.filter(o => o.status === "Accepted" || o.status === "Picking").length;
  const readyCount = currentTpOrders.filter(o => o.status === "Packed").length;
  const dispatchedCount = currentTpOrders.filter(o => o.status === "Dispatched").length;
  const completedCount = currentTpOrders.filter(o => o.status === "Delivered").length;

  // Handle Check Stock
  const handlePerformStockCheck = (order) => {
    const result = tpCheckStock(order.id);
    setStockCheckResult(result);
    setStockCheckTargetOrder(order);
    setIsStockCheckModalOpen(true);
  };

  // Handle Accept
  const handleAcceptOrder = (order) => {
    // Quick stock pre-check
    const check = tpCheckStock(order.id);
    if (!check.canFulfill) {
      Alert.alert(
        "Stock Check Warning",
        `Cannot accept order: ${check.issues[0] || "Stock unavailable"}. Please review stock or reject to reassign.`,
        [
          { text: "Inspect Stock", onPress: () => handlePerformStockCheck(order) },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    tpAcceptOrder(order.id);
    Alert.alert(
      "Order Accepted",
      `Order #${order.id} is accepted. You can now proceed to Pick & Pack.`,
      [
        { text: "Start Picking", onPress: () => navigation.navigate("TPOrderDetail", { orderId: order.id }) },
        { text: "Later", style: "cancel" }
      ]
    );
  };

  // Handle Reject Modal Open
  const handleOpenRejectModal = (order) => {
    setRejectTargetOrder(order);
    setRejectReason("Insufficient stock balance in pharmacy inventory");
    setSelectedAlternativePartner("TP-MEDPLUS-02");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetOrder) return;
    tpRejectOrder(rejectTargetOrder.id, rejectReason, selectedAlternativePartner);
    setIsRejectModalOpen(false);
    Alert.alert(
      "Order Reassigned",
      `Order #${rejectTargetOrder.id} has been reported as unavailable. MediUnify Admin has been alerted to reassign this order to ${selectedAlternativePartner === "TP-MEDPLUS-02" ? "MedPlus Partner Chemist" : "Apollo Partner Pharmacy"}.`
    );
  };

  // Render Order Card
  const renderOrderCard = ({ item }) => {
    const isPending = item.status === "Pending Acceptance" || item.status === "New Assigned";
    const isAccepted = item.status === "Accepted";
    const isPicking = item.status === "Picking";
    const isPacked = item.status === "Packed";
    const isDispatched = item.status === "Dispatched";
    const isDelivered = item.status === "Delivered";
    const isRejected = item.status === "Rejected";

    return (
      <View style={[styles.orderCard, isPending && styles.orderCardPending, isRejected && styles.orderCardRejected]}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftLockup}>
            <Text style={styles.orderId}>{item.id}</Text>
            {item.isSplitOrder && (
              <View style={styles.splitOrderTag}>
                <Ionicons name="git-branch" size={11} color={COLORS.teal} />
                <Text style={styles.splitOrderTagText}>
                  Split Part ({item.splitGroup || "2 of 2"}) · Linked to Hub #{item.originalOrderId}
                </Text>
              </View>
            )}
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
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
                styles.statusBadgeText,
                isPending && { color: "#DC2626" },
                (isAccepted || isPicking) && { color: COLORS.coral },
                isPacked && { color: COLORS.navy },
                isDispatched && { color: "#1E40AF" },
                isDelivered && { color: "#166534" },
                isRejected && { color: "#991B1B" }
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Split Order Context Note */}
        {item.isSplitOrder && item.splitNote && (
          <View style={styles.splitNoteBox}>
            <Ionicons name="information-circle" size={13} color="#0D9488" />
            <Text style={styles.splitNoteText}>{item.splitNote}</Text>
          </View>
        )}

        {/* Privacy Compliant Patient Details */}
        <View style={styles.patientRow}>
          <View style={styles.patientAvatar}>
            <Ionicons name="person" size={14} color={COLORS.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.patientNameLine}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text style={styles.patientAgeGender}>({item.patientAge}y · {item.patientGender})</Text>
              <Text style={styles.phoneMasked}>{item.patientPhoneMasked}</Text>
            </View>
            <Text style={styles.deliveryArea} numberOfLines={1}>
              <Ionicons name="location-outline" size={11} color={COLORS.slate} /> {item.deliveryAddressArea}
            </Text>
          </View>

          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>PARTNER PAYOUT</Text>
            <Text style={styles.amountValue}>₹{item.partnerSettlementAmount?.toFixed(2) || item.subtotal}</Text>
          </View>
        </View>

        {/* Assigned Medicines List */}
        <View style={styles.medicinesBox}>
          <Text style={styles.medicinesBoxHeader}>ASSIGNED MEDICINE ITEMS FOR FULFILMENT:</Text>
          {item.items.map((med, idx) => (
            <View key={idx} style={styles.medRow}>
              <View style={styles.medIconBox}>
                <Ionicons name="bandage-outline" size={14} color={COLORS.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>
                  {med.name} {med.strength ? `(${med.strength})` : ""} × {med.quantity}
                </Text>
                <Text style={styles.medDosage}>
                  Dosage: {med.dosage || "As directed by physician"}
                </Text>
                {med.allocatedBatch ? (
                  <Text style={styles.medBatch}>Allocated Batch: {med.allocatedBatch} (Exp: {med.allocatedExpiry})</Text>
                ) : null}
              </View>
              <Text style={styles.medPrice}>₹{med.unitPrice * med.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Doctor and Prescription verification pill */}
        <View style={styles.doctorRow}>
          <Text style={styles.doctorName}>
            Doctor: {item.doctorName} · {item.clinicName}
          </Text>
          {item.prescriptionVerifiedByAdmin && (
            <View style={styles.rxVerifiedPill}>
              <Ionicons name="shield-checkmark" size={11} color="#166534" />
              <Text style={styles.rxVerifiedPillText}>Admin Verified</Text>
            </View>
          )}
        </View>

        {/* Rejection / Reassigned banner if applicable */}
        {isRejected && (
          <View style={styles.rejectionNotice}>
            <Ionicons name="alert-circle" size={14} color="#991B1B" />
            <Text style={styles.rejectionNoticeText}>
              Reason: {item.rejectionReason} · Reassigned to: {item.reassignedTo || "Next Available Partner"}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          {/* Action 1: Check Stock Availability */}
          <Pressable
            style={({ pressed }) => [styles.actionBtnSecondary, pressed && { opacity: 0.8 }]}
            onPress={() => handlePerformStockCheck(item)}
          >
            <Ionicons name="checkmark-done" size={14} color={COLORS.navy} />
            <Text style={styles.actionBtnSecondaryText}>Check Stock Availability</Text>
          </Pressable>

          {/* Pending state actions: Accept & Reject */}
          {isPending && (
            <>
              <Pressable
                style={({ pressed }) => [styles.actionBtnAccept, pressed && { opacity: 0.88 }]}
                onPress={() => handleAcceptOrder(item)}
              >
                <Ionicons name="checkmark-circle" size={15} color={COLORS.white} />
                <Text style={styles.actionBtnAcceptText}>Accept Order</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.actionBtnReject, pressed && { opacity: 0.85 }]}
                onPress={() => handleOpenRejectModal(item)}
              >
                <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                <Text style={styles.actionBtnRejectText}>Reject / Reassign</Text>
              </Pressable>
            </>
          )}

          {/* Accepted / In Preparation: Go to Fulfilment */}
          {(isAccepted || isPicking || isPacked || isDispatched) && (
            <Pressable
              style={({ pressed }) => [styles.actionBtnPrimary, pressed && { opacity: 0.88 }]}
              onPress={() => navigation.navigate("TPOrderDetail", { orderId: item.id })}
            >
              <Ionicons name="bag-check" size={15} color={COLORS.white} />
              <Text style={styles.actionBtnPrimaryText}>
                {isPacked ? "Dispatch Handover" : isDispatched ? "Track Delivery" : "Pick & Pack"}
              </Text>
            </Pressable>
          )}

          {/* Completed view details */}
          {isDelivered && (
            <Pressable
              style={({ pressed }) => [styles.actionBtnSecondary, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate("TPOrderDetail", { orderId: item.id })}
            >
              <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
              <Text style={styles.actionBtnSecondaryText}>View Fulfilment Record</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Admin Sync Trigger */}
      <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
        <View style={styles.topBarLeft}>
          <Text style={styles.pageTitle}>External Orders Queue</Text>
          <Text style={styles.pageSub}>
            Orders routed to {currentTpProfile.name} based on inventory availability
          </Text>
        </View>

        {/* Live Admin Split Tracking Button */}
        <Pressable
          style={({ pressed }) => [
            styles.adminTrackingTriggerBtn,
            Platform.OS === "web" && { cursor: "pointer" },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => setIsAdminTrackingOpen(true)}
        >
          <Ionicons name="git-network-outline" size={16} color={COLORS.navy} />
          <Text style={styles.adminTrackingTriggerBtnText}>Admin Split Tracking View</Text>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>SYNC</Text>
          </View>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <Pressable
            style={[styles.tabBtn, activeTab === "All" && styles.tabBtnActive]}
            onPress={() => setActiveTab("All")}
          >
            <Text style={[styles.tabBtnText, activeTab === "All" && styles.tabBtnTextActive]}>
              All Orders ({currentTpOrders.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "Pending" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Pending")}
          >
            <Text style={[styles.tabBtnText, activeTab === "Pending" && styles.tabBtnTextActive]}>
              Pending Review {pendingCount > 0 ? `(${pendingCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "Preparation" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Preparation")}
          >
            <Text style={[styles.tabBtnText, activeTab === "Preparation" && styles.tabBtnTextActive]}>
              In Prep (Picking) {prepCount > 0 ? `(${prepCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "Ready" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Ready")}
          >
            <Text style={[styles.tabBtnText, activeTab === "Ready" && styles.tabBtnTextActive]}>
              Packed & Ready {readyCount > 0 ? `(${readyCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "Dispatched" && styles.tabBtnActive]}
            onPress={() => setActiveTab("Dispatched")}
          >
            <Text style={[styles.tabBtnText, activeTab === "Dispatched" && styles.tabBtnTextActive]}>
              Out for Delivery {dispatchedCount > 0 ? `(${dispatchedCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabBtn, activeTab === "History" && styles.tabBtnActive]}
            onPress={() => setActiveTab("History")}
          >
            <Text style={[styles.tabBtnText, activeTab === "History" && styles.tabBtnTextActive]}>
              Delivered ({completedCount})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID, linked Hub #, patient or medicine..."
            placeholderTextColor={COLORS.slateLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && { maxWidth: 1320, width: "100%", alignSelf: "center" },
          { paddingBottom: Math.max(insets.bottom, 16) + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={44} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No orders in this queue</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? "No orders match your search criteria." : "All assigned orders are currently up to date."}
            </Text>
          </View>
        }
      />

      {/* ================= MODAL: STOCK CHECK RESULT ================= */}
      <Modal visible={isStockCheckModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Stock Availability Verification</Text>
                <Text style={styles.modalSub}>Order #{stockCheckTargetOrder?.id}</Text>
              </View>
              <Pressable onPress={() => setIsStockCheckModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={COLORS.navy} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 360, marginVertical: 10 }}>
              {stockCheckResult?.canFulfill ? (
                <View style={styles.stockCheckSuccessBox}>
                  <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockCheckSuccessTitle}>All Required Medicines Available</Text>
                    <Text style={styles.stockCheckSuccessSub}>
                      Your pharmacy has verified stock, valid unexpired batches, and active fulfilment status.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.stockCheckIssueBox}>
                  <Ionicons name="alert-circle" size={22} color="#DC2626" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockCheckIssueTitle}>Stock or Compliance Issues Identified</Text>
                    {stockCheckResult?.issues.map((issue, idx) => (
                      <Text key={idx} style={styles.issueText}>• {issue}</Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Items Breakdown */}
              <View style={styles.checkItemsList}>
                <Text style={styles.checkItemsListTitle}>INVENTORY VERIFICATION BREAKDOWN:</Text>
                {stockCheckResult?.itemsCheck?.map((chk, idx) => (
                  <View key={idx} style={styles.checkItemRow}>
                    <Ionicons
                      name={chk.canDispense ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={chk.canDispense ? "#16A34A" : "#DC2626"}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkItemName}>{chk.name}</Text>
                      <Text style={styles.checkItemMeta}>
                        Required: {chk.quantity} · Available in Stock: {chk.availableStock || 0} units
                        {chk.batchNumber ? ` · Batch: ${chk.batchNumber} (Exp: ${chk.expiryDate})` : ""}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkStatusPill,
                        chk.canDispense ? { backgroundColor: "#F0FDF4" } : { backgroundColor: "#FEF2F2" }
                      ]}
                    >
                      <Text style={[styles.checkStatusText, chk.canDispense ? { color: "#166534" } : { color: "#991B1B" }]}>
                        {chk.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.closeBtn} onPress={() => setIsStockCheckModalOpen(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>

              {stockCheckTargetOrder?.status === "Pending Acceptance" && stockCheckResult?.canFulfill && (
                <Pressable
                  style={styles.modalAcceptBtn}
                  onPress={() => {
                    setIsStockCheckModalOpen(false);
                    handleAcceptOrder(stockCheckTargetOrder);
                  }}
                >
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalAcceptBtnText}>Accept Order Now</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: REJECT / INSUFFICIENT STOCK ================= */}
      <Modal visible={isRejectModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 480 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Report Insufficient Stock / Reject</Text>
                <Text style={styles.modalSub}>Order #{rejectTargetOrder?.id}</Text>
              </View>
              <Pressable onPress={() => setIsRejectModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={COLORS.navy} />
              </Pressable>
            </View>

            <View style={styles.rejectBody}>
              <Text style={styles.rejectNotice}>
                Reporting this order as unfulfillable will immediately notify the MediUnify Super Admin to reassign the medicines to another onboarded partner pharmacy.
              </Text>

              <Text style={styles.fLabel}>Rejection / Stock Shortage Reason *</Text>
              <TextInput
                style={styles.fInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Specify reason for audit..."
              />

              <Text style={[styles.fLabel, { marginTop: 12 }]}>Recommend Alternative Partner for Reassignment</Text>
              <View style={styles.altSelectWrap}>
                <Pressable
                  style={[
                    styles.altOption,
                    selectedAlternativePartner === "TP-MEDPLUS-02" && styles.altOptionActive
                  ]}
                  onPress={() => setSelectedAlternativePartner("TP-MEDPLUS-02")}
                >
                  <Ionicons name="business" size={15} color={COLORS.teal} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.altName}>MedPlus Chemist (TP-MEDPLUS-02)</Text>
                    <Text style={styles.altSub}>12 Pan-D units in stock · 4.2 km</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.altOption,
                    selectedAlternativePartner === "TP-APOLLO-03" && styles.altOptionActive
                  ]}
                  onPress={() => setSelectedAlternativePartner("TP-APOLLO-03")}
                >
                  <Ionicons name="medical" size={15} color={COLORS.navy} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.altName}>Apollo Partner Chemist (TP-APOLLO-03)</Text>
                    <Text style={styles.altSub}>8 Pan-D units in stock · 6.1 km</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.closeBtn} onPress={() => setIsRejectModalOpen(false)}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.confirmRejectBtn} onPress={handleConfirmReject}>
                <Ionicons name="alert-circle" size={16} color={COLORS.white} />
                <Text style={styles.confirmRejectBtnText}>Confirm & Reassign</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin Split Order Tracking Modal */}
      <AdminTrackingModal
        visible={isAdminTrackingOpen}
        onClose={() => setIsAdminTrackingOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    gap: 12
  },
  topBarDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14
  },
  topBarLeft: {
    flex: 1
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  pageSub: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  adminTrackingTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignSelf: "flex-start"
  },
  adminTrackingTriggerBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.teal
  },
  livePillText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.teal
  },
  tabsContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 6
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  tabBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate
  },
  tabBtnTextActive: {
    color: COLORS.white,
    fontWeight: "800"
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.navyDark,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 14
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  orderCardPending: {
    borderColor: "#FED7AA",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral
  },
  orderCardRejected: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFDFD"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8
  },
  headerLeftLockup: {
    flex: 1,
    gap: 4
  },
  orderId: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  splitOrderTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start"
  },
  splitOrderTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  splitNoteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F0FDFA",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 10
  },
  splitNoteText: {
    fontSize: 11,
    color: "#0F766E",
    fontWeight: "600",
    flex: 1,
    lineHeight: 15
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center"
  },
  patientNameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  patientName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  patientAgeGender: {
    fontSize: 11,
    color: COLORS.slate
  },
  phoneMasked: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  deliveryArea: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  amountCol: {
    alignItems: "flex-end"
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  amountValue: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.navyDark,
    marginTop: 1
  },
  medicinesBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8,
    marginBottom: 10
  },
  medicinesBoxHeader: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  medIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center"
  },
  medName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  medDosage: {
    fontSize: 10,
    color: COLORS.slate
  },
  medBatch: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  medPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 6
  },
  doctorName: {
    fontSize: 11,
    color: COLORS.slate,
    fontStyle: "italic"
  },
  rxVerifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BBF7D0"
  },
  rxVerifiedPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#166534"
  },
  rejectionNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 10
  },
  rejectionNoticeText: {
    fontSize: 11,
    color: "#991B1B",
    fontWeight: "700",
    flex: 1
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  actionBtnAccept: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionBtnAcceptText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  actionBtnReject: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  actionBtnRejectText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626"
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.slate
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 25, 49, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  stockCheckSuccessBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 12
  },
  stockCheckSuccessTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534"
  },
  stockCheckSuccessSub: {
    fontSize: 11,
    color: "#166534",
    marginTop: 2
  },
  stockCheckIssueBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12
  },
  stockCheckIssueTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B"
  },
  issueText: {
    fontSize: 11,
    color: "#B91C1C",
    marginTop: 2,
    fontWeight: "600"
  },
  checkItemsList: {
    gap: 8
  },
  checkItemsListTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  checkItemName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  checkItemMeta: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  checkStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  checkStatusText: {
    fontSize: 9,
    fontWeight: "800"
  },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  modalAcceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  modalAcceptBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  rejectBody: {
    gap: 10
  },
  rejectNotice: {
    fontSize: 11,
    color: COLORS.slate,
    lineHeight: 16
  },
  fLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  fInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navyDark
  },
  altSelectWrap: {
    gap: 8
  },
  altOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  altOptionActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealLight
  },
  altName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  altSub: {
    fontSize: 10,
    color: COLORS.slate
  },
  confirmRejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  confirmRejectBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  }
});
