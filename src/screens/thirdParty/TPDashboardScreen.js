import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";

export default function TPDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 600 && width < 1024;

  const {
    currentTpProfile,
    currentTpOrders,
    currentTpInventory,
    adminSplitTracking,
    networkBroadcasts = []
  } = usePharmacy();

  const [showAdminModal, setShowAdminModal] = useState(false);

  // Summary Metrics calculations
  const newOrders = currentTpOrders.filter(o => o.status === "Pending Acceptance" || o.status === "New Assigned");
  const pendingAcceptance = currentTpOrders.filter(o => o.status === "Pending Acceptance");
  const inPreparation = currentTpOrders.filter(o => o.status === "Accepted" || o.status === "Picking");
  const packedReady = currentTpOrders.filter(o => o.status === "Packed");
  const dispatchedActive = currentTpOrders.filter(o => o.status === "Dispatched");
  const completedOrders = currentTpOrders.filter(o => o.status === "Delivered");

  // Inventory metrics
  const outOfStockMedicines = currentTpInventory.filter(i => i.stock === 0);
  const lowStockMedicines = currentTpInventory.filter(i => i.stock > 0 && i.stock <= (i.minStockThreshold || 10));
  const expiredMedicines = currentTpInventory.filter(i =>
    i.expiryDate && (i.expiryDate.startsWith("2025") || i.expiryDate.startsWith("2024") || i.expiryDate.startsWith("2023"))
  );
  const nearExpiryMedicines = currentTpInventory.filter(i =>
    i.expiryDate && (i.expiryDate.startsWith("2026-10") || i.expiryDate.startsWith("2026-11") || i.expiryDate.startsWith("2026-12"))
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 1320, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
        isTablet && { maxWidth: 820, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        { paddingBottom: Math.max(insets.bottom, 16) + 32 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Partner Identity Card */}
      <View style={styles.partnerHeaderCard}>
        <View style={styles.partnerInfoRow}>
          <View style={styles.partnerBadgeIcon}>
            <Ionicons name="medical" size={26} color={COLORS.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.partnerTitleRow}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {currentTpProfile.name}
              </Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={12} color="#166534" />
                <Text style={styles.verifiedTagText}>Onboarded Partner</Text>
              </View>
            </View>
            <Text style={styles.partnerSub} numberOfLines={1}>
              ID: {currentTpProfile.id} · Pharmacist: {currentTpProfile.pharmacistName} ({currentTpProfile.pharmacistRegNo})
            </Text>
            <Text style={styles.partnerAddress} numberOfLines={1}>
              {currentTpProfile.address}, {currentTpProfile.city} · DL: {currentTpProfile.licenseNumber?.split("/")[0]}
            </Text>
          </View>
        </View>
      </View>

      {/* Network Broadcast RFQ Sourcing Banner */}
      {networkBroadcasts.length > 0 && (
        <View style={styles.broadcastRfqBanner}>
          <View style={styles.broadcastRfqIcon}>
            <Ionicons name="radio" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={styles.broadcastRfqTitle}>Hub Stock Availability Request</Text>
              <View style={styles.broadcastRfqStatusPill}>
                <View style={styles.livePulseDot} />
                <Text style={styles.broadcastRfqStatusText}>Availability Sent (100% Stock)</Text>
              </View>
            </View>
            <Text style={styles.broadcastRfqDesc} numberOfLines={2}>
              Central Hub requested {networkBroadcasts[0].itemsToSource?.length || 2} medicines for Order #{networkBroadcasts[0].originalOrderId} ({networkBroadcasts[0].itemsToSource?.map(i => i.name).join(", ")}). Your store responded with verified stock.
            </Text>
          </View>
          <Pressable
            style={styles.broadcastRfqActionBtn}
            onPress={() => navigation.navigate("TPOrders", { tab: "All" })}
          >
            <Text style={styles.broadcastRfqActionText}>View Orders</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
          </Pressable>
        </View>
      )}

      {/* Urgent Pending Acceptance Banner */}
      {pendingAcceptance.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.urgentAlert, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate("TPOrders", { tab: "Pending" })}
        >
          <View style={styles.urgentIconPulse}>
            <Ionicons name="alert-circle" size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.urgentTitle}>
              {pendingAcceptance.length} External Order{pendingAcceptance.length > 1 ? "s" : ""} Pending Acceptance
            </Text>
            <Text style={styles.urgentDesc} numberOfLines={1}>
              {pendingAcceptance[0].patientName} requires {pendingAcceptance[0].items?.map(i => i.name).join(", ")}
              {pendingAcceptance[0].isSplitOrder ? " · Split Order from Hub #ORD1001" : ""}
            </Text>
          </View>
          <View style={styles.urgentActionPill}>
            <Text style={styles.urgentActionText}>Review Stock</Text>
            <Ionicons name="chevron-forward" size={14} color="#DC2626" />
          </View>
        </Pressable>
      )}

      {/* Low Stock & Expiry Alert Banner */}
      {(lowStockMedicines.length > 0 || expiredMedicines.length > 0 || outOfStockMedicines.length > 0) && (
        <Pressable
          style={({ pressed }) => [styles.stockAlertBanner, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate("TPInventory")}
        >
          <View style={styles.stockAlertIcon}>
            <Ionicons name="cube-outline" size={20} color={COLORS.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stockAlertTitle}>Inventory Attention Required</Text>
            <Text style={styles.stockAlertDesc} numberOfLines={1}>
              {outOfStockMedicines.length > 0 ? `${outOfStockMedicines.length} out of stock · ` : ""}
              {lowStockMedicines.length > 0 ? `${lowStockMedicines.length} low stock · ` : ""}
              {expiredMedicines.length > 0 ? `${expiredMedicines.length} expired (blocked) · ` : ""}
              {nearExpiryMedicines.length > 0 ? `${nearExpiryMedicines.length} expiring soon` : ""}
            </Text>
          </View>
          <View style={styles.stockActionPill}>
            <Text style={styles.stockActionText}>Manage Stock</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.coral} />
          </View>
        </Pressable>
      )}

      {/* 5 Required Summary Cards */}
      <Text style={styles.sectionHeading}>FULFILMENT & INVENTORY METRICS</Text>
      <View style={styles.summaryCardsGrid}>
        {/* Card 1: New Orders */}
        <Pressable
          style={({ pressed }) => [
            styles.summaryCard,
            { borderLeftColor: COLORS.navy },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => navigation.navigate("TPOrders", { tab: "All" })}
        >
          <View style={styles.summaryCardTop}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.navy} />
            <Text style={styles.summaryCount}>{newOrders.length}</Text>
          </View>
          <Text style={styles.summaryLabel}>New Orders</Text>
          <Text style={styles.summarySub}>Assigned by Admin</Text>
        </Pressable>

        {/* Card 2: Pending Acceptance */}
        <Pressable
          style={({ pressed }) => [
            styles.summaryCard,
            { borderLeftColor: COLORS.coral },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => navigation.navigate("TPOrders", { tab: "Pending" })}
        >
          <View style={styles.summaryCardTop}>
            <Ionicons name="time-outline" size={20} color={COLORS.coral} />
            <Text style={[styles.summaryCount, { color: COLORS.coral }]}>{pendingAcceptance.length}</Text>
          </View>
          <Text style={styles.summaryLabel}>Pending Acceptance</Text>
          <Text style={styles.summarySub}>Requires Stock Check</Text>
        </Pressable>

        {/* Card 3: Orders in Preparation */}
        <Pressable
          style={({ pressed }) => [
            styles.summaryCard,
            { borderLeftColor: COLORS.aqua },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => navigation.navigate("TPOrders", { tab: "Preparation" })}
        >
          <View style={styles.summaryCardTop}>
            <Ionicons name="flask-outline" size={20} color={COLORS.aqua} />
            <Text style={styles.summaryCount}>{inPreparation.length}</Text>
          </View>
          <Text style={styles.summaryLabel}>Orders in Preparation</Text>
          <Text style={styles.summarySub}>Accepted & Picking</Text>
        </Pressable>

        {/* Card 4: Low-Stock Medicines */}
        <Pressable
          style={({ pressed }) => [
            styles.summaryCard,
            { borderLeftColor: "#F59E0B" },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => navigation.navigate("TPInventory", { filter: "LowStock" })}
        >
          <View style={styles.summaryCardTop}>
            <Ionicons name="cube-outline" size={20} color="#F59E0B" />
            <Text style={[styles.summaryCount, { color: "#D97706" }]}>
              {lowStockMedicines.length + outOfStockMedicines.length}
            </Text>
          </View>
          <Text style={styles.summaryLabel}>Low-Stock Medicines</Text>
          <Text style={styles.summarySub}>Below Min Level</Text>
        </Pressable>

        {/* Card 5: Completed Orders */}
        <Pressable
          style={({ pressed }) => [
            styles.summaryCard,
            { borderLeftColor: COLORS.teal },
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => navigation.navigate("TPOrders", { tab: "History" })}
        >
          <View style={styles.summaryCardTop}>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.teal} />
            <Text style={[styles.summaryCount, { color: COLORS.teal }]}>{completedOrders.length}</Text>
          </View>
          <Text style={styles.summaryLabel}>Completed Orders</Text>
          <Text style={styles.summarySub}>Delivered Today</Text>
        </Pressable>
      </View>

      {/* Real-time MediUnify Admin Tracking & Split Order Sync Inspector */}
      <View style={styles.adminSyncCard}>
        <View style={styles.adminSyncHeader}>
          <View style={styles.adminSyncTitleRow}>
            <Ionicons name="git-network-outline" size={18} color={COLORS.navy} />
            <Text style={styles.adminSyncTitle}>MediUnify Admin Split Order Tracking</Text>
            <View style={styles.adminLiveBadge}>
              <View style={styles.adminLiveDot} />
              <Text style={styles.adminLiveText}>LIVE ADMIN SYNC</Text>
            </View>
          </View>
          <Text style={styles.adminSyncSub}>
            Live demonstration of how the Super Admin unifies split orders across Central Hub & this Third-Party Pharmacy:
          </Text>
        </View>

        <View style={styles.adminSyncBody}>
          {/* Original Order Metadata */}
          <View style={styles.orderSummaryStrip}>
            <View>
              <Text style={styles.stripLabel}>ORIGINAL PATIENT ORDER</Text>
              <Text style={styles.stripValue}>#{adminSplitTracking.originalOrder.id} · {adminSplitTracking.originalOrder.patientName}</Text>
            </View>
            <View style={styles.stripStatusChip}>
              <Text style={styles.stripStatusChipText}>{adminSplitTracking.originalOrder.overallStatus}</Text>
            </View>
          </View>

          {/* Split Parts Comparison */}
          <View style={[styles.splitRowWrapper, (isDesktop || isTablet) && styles.splitRowWrapperRow]}>
            {/* Part 1: Central Hub */}
            <View style={styles.splitPartCol}>
              <View style={styles.partHeader}>
                <Ionicons name="business" size={14} color={COLORS.navy} />
                <Text style={styles.partTitle}>Part 1: Central Hub Fulfilment</Text>
              </View>
              <Text style={styles.partMeta}>
                4 items in stock: Dolo 500mg, Cetzine, Calcirol, Augmentin
              </Text>
              <View style={styles.partStatusPill}>
                <Ionicons name="bicycle" size={12} color="#1E40AF" />
                <Text style={styles.partStatusPillText}>{adminSplitTracking.hubFulfilment.status}</Text>
              </View>
            </View>

            {/* Part 2: Third-Party Pharmacy (Live Dynamic) */}
            <View style={[styles.splitPartCol, styles.splitPartColTp]}>
              <View style={styles.partHeader}>
                <Ionicons name="medical" size={14} color={COLORS.teal} />
                <Text style={[styles.partTitle, { color: COLORS.teal }]}>
                  Part 2: 3rd-Party Fulfilment (This Pharmacy)
                </Text>
              </View>
              <Text style={styles.partMeta}>
                1 unavailable item: Pan-D Capsule (40mg/30mg)
              </Text>
              <View style={[styles.partStatusPill, { backgroundColor: COLORS.tealLight }]}>
                <Ionicons name="sync" size={12} color={COLORS.teal} />
                <Text style={[styles.partStatusPillText, { color: COLORS.teal }]}>
                  {adminSplitTracking.thirdPartyFulfilment.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Main Operational Modules Navigation Grid */}
      <Text style={styles.sectionHeading}>PHARMACY MODULES & OPERATIONS</Text>
      <View style={styles.modulesGrid}>
        {/* Module 1: External Orders */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPOrders")}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: COLORS.navyLight }]}>
            <Ionicons name="receipt" size={24} color={COLORS.navy} />
          </View>
          <Text style={styles.moduleTitle}>External Orders</Text>
          <Text style={styles.moduleDesc}>
            {currentTpOrders.length} assigned · {pendingAcceptance.length} pending review
          </Text>
        </Pressable>

        {/* Module 2: Inventory Management */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPInventory")}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: COLORS.tealLight }]}>
            <Ionicons name="cube" size={24} color={COLORS.teal} />
          </View>
          <Text style={styles.moduleTitle}>Inventory Management</Text>
          <Text style={styles.moduleDesc}>
            {currentTpInventory.length} SKUs · Add, edit, restock & expiry control
          </Text>
        </Pressable>

        {/* Module 3: Pick & Pack */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPPickPack")}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: "#FFF1E8" }]}>
            <Ionicons name="bag-check" size={24} color={COLORS.coral} />
          </View>
          <Text style={styles.moduleTitle}>Pick & Pack</Text>
          <Text style={styles.moduleDesc}>
            {inPreparation.length + packedReady.length} active · Security seal validation
          </Text>
        </Pressable>

        {/* Module 4: Dispatch & Delivery */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPDispatchDelivery")}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: "#E0F7F9" }]}>
            <Ionicons name="bicycle" size={24} color={COLORS.aqua} />
          </View>
          <Text style={styles.moduleTitle}>Dispatch & Delivery</Text>
          <Text style={styles.moduleDesc}>
            {packedReady.length} ready · {dispatchedActive.length} out for delivery
          </Text>
        </Pressable>

        {/* Module 5: Order History */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPOrders", { tab: "History" })}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: "#F1F5F9" }]}>
            <Ionicons name="time" size={24} color={COLORS.slate} />
          </View>
          <Text style={styles.moduleTitle}>Order History</Text>
          <Text style={styles.moduleDesc}>
            {completedOrders.length} completed orders & delivery proofs
          </Text>
        </Pressable>

        {/* Module 6: Profile & Pharmacy Details */}
        <Pressable
          style={({ pressed }) => [styles.moduleTile, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate("TPProfile")}
        >
          <View style={[styles.moduleIconWrap, { backgroundColor: "#EDF8EC" }]}>
            <Ionicons name="business" size={24} color={COLORS.freshGreen} />
          </View>
          <Text style={styles.moduleTitle}>Profile & Details</Text>
          <Text style={styles.moduleDesc}>
            Drug license, pharmacist in charge & hours
          </Text>
        </Pressable>
      </View>

      {/* Active External Orders Quick List */}
      <View style={styles.ordersSectionHeader}>
        <Text style={styles.sectionHeading}>ACTIVE EXTERNAL ASSIGNMENTS</Text>
        <Pressable onPress={() => navigation.navigate("TPOrders")}>
          <Text style={styles.viewAllText}>View All ({currentTpOrders.length}) →</Text>
        </Pressable>
      </View>

      <View style={styles.activeOrdersList}>
        {currentTpOrders.slice(0, 3).map(order => (
          <Pressable
            key={order.id}
            style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.9 }]}
            onPress={() => navigation.navigate("TPOrderDetail", { orderId: order.id })}
          >
            <View style={styles.orderCardHeader}>
              <View style={styles.orderIdLockup}>
                <Text style={styles.orderIdText}>{order.id}</Text>
                {order.isSplitOrder && (
                  <View style={styles.splitTag}>
                    <Ionicons name="git-branch" size={10} color={COLORS.teal} />
                    <Text style={styles.splitTagText}>Split Order ({order.originalOrderId})</Text>
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.statusTag,
                  order.status === "Pending Acceptance" && { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
                  order.status === "Accepted" && { backgroundColor: COLORS.tealLight, borderColor: "#B7E7E3" },
                  order.status === "Picking" && { backgroundColor: COLORS.coralLight, borderColor: "#FED7AA" },
                  order.status === "Packed" && { backgroundColor: COLORS.aquaLight, borderColor: "#A5F3FC" },
                  order.status === "Delivered" && { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    order.status === "Pending Acceptance" && { color: "#DC2626" },
                    order.status === "Accepted" && { color: COLORS.teal },
                    order.status === "Picking" && { color: COLORS.coral },
                    order.status === "Packed" && { color: COLORS.navy },
                    order.status === "Delivered" && { color: "#166534" }
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.patientInfoRow}>
              <Text style={styles.patientName}>{order.patientName}</Text>
              <Text style={styles.dotSeparator}>·</Text>
              <Text style={styles.patientArea}>{order.deliveryAddressArea}</Text>
            </View>

            <View style={styles.orderItemsSnippet}>
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemSnippetRow}>
                  <Ionicons name="medkit-outline" size={13} color={COLORS.slate} />
                  <Text style={styles.itemSnippetText}>
                    {item.name} ({item.strength || item.dosageForm}) × {item.quantity}
                  </Text>
                  <Text style={styles.itemSnippetPrice}>₹{item.unitPrice}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderCardFooter}>
              <Text style={styles.orderTimestamp}>{order.adminAssignmentTimestamp}</Text>
              <View style={styles.openDetailsBtn}>
                <Text style={styles.openDetailsBtnText}>Fulfil Order</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.teal} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
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
    paddingTop: 16
  },
  partnerHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  partnerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  partnerBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B7E7E3"
  },
  partnerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0"
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534"
  },
  partnerSub: {
    fontSize: 12,
    color: COLORS.navyMuted,
    marginTop: 2,
    fontWeight: "600"
  },
  partnerAddress: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  urgentAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  urgentIconPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center"
  },
  urgentTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B"
  },
  urgentDesc: {
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 2
  },
  urgentActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5"
  },
  urgentActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626"
  },
  stockAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  stockAlertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center"
  },
  stockAlertTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400E"
  },
  stockAlertDesc: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2
  },
  stockActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCD34D"
  },
  stockActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.coral
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.slate,
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6
  },
  summaryCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18
  },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderLeftWidth: 4,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  summaryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyMuted
  },
  summarySub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 2
  },
  adminSyncCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  adminSyncHeader: {
    marginBottom: 12
  },
  adminSyncTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  adminSyncTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  adminLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  adminLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal
  },
  adminLiveText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  adminSyncSub: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 4,
    lineHeight: 16
  },
  adminSyncBody: {
    gap: 10
  },
  orderSummaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  stripLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  stripValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark,
    marginTop: 2
  },
  stripStatusChip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  stripStatusChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF"
  },
  splitRowWrapper: {
    flexDirection: "column",
    gap: 10
  },
  splitRowWrapperRow: {
    flexDirection: "row"
  },
  splitPartCol: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  splitPartColTp: {
    borderColor: "#B7E7E3",
    backgroundColor: "#FBFDFD"
  },
  partHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  partTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  partMeta: {
    fontSize: 11,
    color: COLORS.slate,
    lineHeight: 15,
    marginBottom: 8
  },
  partStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start"
  },
  partStatusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E40AF"
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20
  },
  moduleTile: {
    flex: 1,
    minWidth: 160,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  moduleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  moduleDesc: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 3,
    lineHeight: 15
  },
  ordersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.teal
  },
  activeOrdersList: {
    gap: 10
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  orderCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  orderIdLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  splitTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  splitTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.teal
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "800"
  },
  patientInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  patientName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  dotSeparator: {
    color: COLORS.slateLight
  },
  patientArea: {
    fontSize: 12,
    color: COLORS.slate
  },
  orderItemsSnippet: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 8,
    gap: 4,
    marginBottom: 10
  },
  itemSnippetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  itemSnippetText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navyMuted
  },
  itemSnippetPrice: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  orderCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  orderTimestamp: {
    fontSize: 11,
    color: COLORS.slate
  },
  openDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  openDetailsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.teal
  },
  broadcastRfqBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FDBA74",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  broadcastRfqIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center"
  },
  broadcastRfqTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9A3412"
  },
  broadcastRfqStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981"
  },
  broadcastRfqStatusText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#059669"
  },
  broadcastRfqDesc: {
    fontSize: 11,
    color: "#9A3412",
    marginTop: 2,
    lineHeight: 15
  },
  broadcastRfqActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EA580C",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  broadcastRfqActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white
  }
});
