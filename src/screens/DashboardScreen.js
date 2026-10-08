import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";
import MediUnifyLogo from "../components/MediUnifyLogo";

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    pharmacyProfile,
    orders,
    settlements,
    inventory = []
  } = usePharmacy();

  const newOrders = orders.filter(o => o.status === "New");
  const isInProgress = (o) =>
    ["Accepted", "Picking", "Split Delivery", "Split Delivery (Batch 2 Packed)", "Partially Dispatched", "Partially Delivered"].includes(o.status) ||
    (o.isSplit && o.deliveries?.some(d => d.status !== "HandedOver" && d.status !== "Delivered"));

  const inProgressOrders = orders.filter(isInProgress);
  const readyOrders = orders.filter(o => o.status === "Packed" || o.status === "CaptainAssigned");
  const completedToday = orders.filter(o => o.status === "HandedOver" || o.status === "Delivered");

  const outOfStockCount = inventory.filter(i => i.stock === 0).length;
  const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock <= (i.minStockThreshold || 15)).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 1320, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        { paddingBottom: Math.max(insets.bottom, 16) + 24 }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hub Header on Mobile only (Desktop uses top WebNavBar) */}
      {!isDesktop && (
        <View style={styles.storeHeaderCard}>
          <View style={styles.storeInfoRow}>
            <View style={styles.hubLogoCard}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.hubLogoImage}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.storeTitleRow}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {pharmacyProfile.name}
                </Text>
                <View
                  style={[
                    styles.hubTypePill,
                    { backgroundColor: pharmacyProfile.isThirdParty ? "#EAF0FB" : COLORS.tealLight }
                  ]}
                >
                  <Text
                    style={[
                      styles.hubTypePillText,
                      { color: pharmacyProfile.isThirdParty ? COLORS.navy : COLORS.teal }
                    ]}
                  >
                    {pharmacyProfile.isThirdParty ? "3rd-Party Hub" : "Central Hub"}
                  </Text>
                </View>
              </View>
              <Text style={styles.storeId} numberOfLines={1}>
                HUB ID: {pharmacyProfile.id} · DL: {pharmacyProfile.licenseNumber}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Urgent Alert Banner */}
      {newOrders.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.alertBanner, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate("OrderDetail", { orderId: newOrders[0].id })}
        >
          <View style={styles.alertIconPulse}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Incoming Prescription Order</Text>
            <Text style={styles.alertDesc} numberOfLines={1}>
              Order #{newOrders[0].id} from {newOrders[0].patientName} is waiting for review.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </Pressable>
      )}

      {/* Inventory Low Stock Alert Banner */}
      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <Pressable
          style={({ pressed }) => [styles.inventoryAlertBanner, pressed && { opacity: 0.9 }]}
          onPress={() => navigation.navigate("Inventory")}
        >
          <View style={styles.inventoryAlertIcon}>
            <Ionicons name="cube-outline" size={18} color={COLORS.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inventoryAlertTitle}>Stock Replenishment Alert</Text>
            <Text style={styles.inventoryAlertDesc} numberOfLines={1}>
              {outOfStockCount > 0 ? `${outOfStockCount} out of stock` : ""}
              {outOfStockCount > 0 && lowStockCount > 0 ? " · " : ""}
              {lowStockCount > 0 ? `${lowStockCount} low in stock` : ""}
            </Text>
          </View>
          <View style={styles.inventoryAlertAction}>
            <Text style={styles.inventoryAlertActionText}>Catalog</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.coral} />
          </View>
        </Pressable>
      )}

      {/* Responsive 2x2 Stats Grid (Guaranteed alignment on any mobile width) */}
      <View style={styles.statGridContainer}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              { borderLeftColor: COLORS.teal },
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
            ]}
            onPress={() => navigation.navigate("Orders", { initialTab: "New" })}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="document-text" size={20} color={COLORS.teal} />
              <Text style={styles.statCount}>{newOrders.length}</Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>New Prescriptions</Text>
            <Text style={styles.statBadge} numberOfLines={1}>
              {newOrders.length > 0 ? "Action Required" : "Up to date"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              { borderLeftColor: COLORS.coral },
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
            ]}
            onPress={() => navigation.navigate("Orders", { initialTab: "InProgress" })}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="flask" size={20} color={COLORS.coral} />
              <Text style={styles.statCount}>{inProgressOrders.length}</Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>In Progress</Text>
            <Text style={styles.statBadge} numberOfLines={1}>Picking & Verification</Text>
          </Pressable>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              { borderLeftColor: COLORS.aqua },
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
            ]}
            onPress={() => navigation.navigate("Orders", { initialTab: "Ready" })}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="bicycle" size={20} color={COLORS.aqua} />
              <Text style={styles.statCount}>{readyOrders.length}</Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>Ready for Captain</Text>
            <Text style={styles.statBadge} numberOfLines={1}>Awaiting Handover</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              { borderLeftColor: COLORS.navy },
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
            ]}
            onPress={() => navigation.navigate("Orders", { initialTab: "History" })}
          >
            <View style={styles.statCardHeader}>
              <Ionicons name="checkmark-done-circle" size={20} color={COLORS.navy} />
              <Text style={styles.statCount}>{completedToday.length}</Text>
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>Completed</Text>
            <Text style={styles.statBadge} numberOfLines={1}>Settled Today</Text>
          </Pressable>
        </View>
      </View>

      {/* Earnings & Financials Mini Widget */}
      <Pressable
        style={({ pressed }) => [styles.earningsCard, pressed && { opacity: 0.9 }]}
        onPress={() => navigation.navigate("Settlements")}
      >
        <View style={styles.earningsHeader}>
          <View>
            <Text style={styles.earningsSub}>TODAY'S REVENUE</Text>
            <Text style={styles.earningsAmount}>₹{settlements.todayEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.payoutChip}>
            <Ionicons name="wallet-outline" size={14} color={COLORS.teal} />
            <Text style={styles.payoutChipText}>₹{settlements.pendingPayout.toFixed(2)} Payout</Text>
          </View>
        </View>
        <View style={styles.earningsFooter}>
          <Text style={styles.earningsFooterText} numberOfLines={1}>
            Bank: {settlements.bankName} (A/C {settlements.accountNumber.slice(-4)})
          </Text>
          <Text style={styles.viewDetailsText}>View Ledger →</Text>
        </View>
      </Pressable>

      {/* Quick Access Hub Operations */}
      <Text style={styles.sectionHeading}>PHARMACY OPERATIONS</Text>
      <View style={styles.quickGridContainer}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("Orders", { initialTab: "All" })}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: COLORS.tealLight }]}>
              <Ionicons name="list" size={22} color={COLORS.teal} />
            </View>
            <Text style={styles.quickTileTitle}>All Orders</Text>
            <Text style={styles.quickTileDesc}>{orders.length} active/total</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("Inventory")}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: "#FFF1E8" }]}>
              <Ionicons name="cube" size={22} color={COLORS.coral} />
            </View>
            <Text style={styles.quickTileTitle}>Inventory</Text>
            <Text style={styles.quickTileDesc}>
              {inventory.length} SKUs {lowStockCount > 0 ? `(${lowStockCount} Low)` : ""}
            </Text>
          </Pressable>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("PrescriptionHistory")}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: "#E0F7F9" }]}>
              <Ionicons name="images" size={22} color={COLORS.aqua} />
            </View>
            <Text style={styles.quickTileTitle}>Rx Vault</Text>
            <Text style={styles.quickTileDesc}>Prescription History</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("Settlements")}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: "#EAF0FB" }]}>
              <Ionicons name="cash" size={22} color={COLORS.navy} />
            </View>
            <Text style={styles.quickTileTitle}>Settlements</Text>
            <Text style={styles.quickTileDesc}>Bank Payouts</Text>
          </Pressable>
        </View>

        {/* Row 3 */}
        <View style={styles.gridRow}>
          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="business" size={22} color={COLORS.navy} />
            </View>
            <Text style={styles.quickTileTitle}>Hub Settings</Text>
            <Text style={styles.quickTileDesc}>Profile & License</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("HelpSupport")}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="help-buoy" size={22} color="#16A34A" />
            </View>
            <Text style={styles.quickTileTitle}>Help & Support</Text>
            <Text style={styles.quickTileDesc}>24/7 Desk</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent / Active Orders Direct Access */}
      <View style={styles.recentSectionHeader}>
        <Text style={styles.sectionHeading}>RECENT & ACTIVE ORDERS</Text>
        <Pressable
          onPress={() => navigation.navigate("Orders", { initialTab: "All" })}
          hitSlop={8}
        >
          <Text style={styles.viewAllLink}>View All ({orders.length}) →</Text>
        </Pressable>
      </View>

      <View style={styles.recentOrdersList}>
        {orders.slice(0, 4).map((order) => {
          const isNew = order.status === "New";
          const isSplit = order.isSplit;
          const statusBg = isNew
            ? "#E1F7F1"
            : order.status === "Accepted" || order.status === "Picking" || order.status === "Packed"
            ? "#FFF1E8"
            : order.status === "CaptainAssigned"
            ? "#E0F7F9"
            : "#F1F5F9";
          const statusColor = isNew
            ? COLORS.teal
            : order.status === "Accepted" || order.status === "Picking" || order.status === "Packed"
            ? COLORS.coral
            : order.status === "CaptainAssigned"
            ? COLORS.aqua
            : COLORS.navy;

          return (
            <Pressable
              key={order.id}
              style={({ pressed }) => [
                styles.recentOrderCard,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
              onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
            >
              <View style={styles.recentOrderTop}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.recentOrderId}>{order.id}</Text>
                    {isSplit && (
                      <View style={styles.splitTagSmall}>
                        <Text style={styles.splitTagSmallText}>Split</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recentPatientName} numberOfLines={1}>
                    {order.patientName}
                  </Text>
                </View>
                <View style={[styles.recentStatusPill, { backgroundColor: statusBg }]}>
                  <Text style={[styles.recentStatusText, { color: statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
              <View style={styles.recentOrderBottom}>
                <Text style={styles.recentOrderItems} numberOfLines={1}>
                  {order.items?.length || 0} item{order.items?.length > 1 ? "s" : ""} · {order.deliveryAddress?.split(",")[0] || "Mysuru"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={styles.recentOrderAmount}>₹{order.totalAmount || "0"}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.teal} />
                </View>
              </View>
            </Pressable>
          );
        })}
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
    padding: 16
  },
  brandHeaderBar: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 8
  },
  storeHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  storeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  hubLogoCard: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2
  },
  hubLogoImage: {
    width: "100%",
    height: "100%"
  },
  storeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy,
    flexShrink: 1
  },
  hubTypePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  hubTypePillText: {
    fontSize: 10,
    fontWeight: "800"
  },
  storeId: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },

  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 10,
    gap: 8
  },
  alertIconPulse: {
    marginRight: 2
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626"
  },
  alertDesc: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },

  inventoryAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.coralLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
    marginBottom: 12,
    gap: 8
  },
  inventoryAlertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE8D6",
    alignItems: "center",
    justifyContent: "center"
  },
  inventoryAlertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C2410C"
  },
  inventoryAlertDesc: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  inventoryAlertAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  inventoryAlertActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.coral
  },

  statGridContainer: {
    gap: 10,
    marginBottom: 12
  },
  gridRow: {
    flexDirection: "row",
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  statCount: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.navy
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  statBadge: {
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 2
  },

  earningsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 14,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  earningsSub: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.teal,
    marginTop: 2
  },
  payoutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  payoutChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  earningsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  earningsFooterText: {
    fontSize: 11,
    color: COLORS.slate,
    flex: 1,
    marginRight: 6
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },

  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 2
  },
  quickGridContainer: {
    gap: 10
  },
  quickTile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center"
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  quickTileTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
    textAlign: "center"
  },
  quickTileDesc: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 2,
    textAlign: "center"
  },

  /* Recent Orders Section Styles */
  recentSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.teal
  },
  recentOrdersList: {
    gap: 8,
    marginBottom: 10
  },
  recentOrderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  recentOrderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  recentOrderId: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  splitTagSmall: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  splitTagSmallText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#EA580C"
  },
  recentPatientName: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 1
  },
  recentStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  recentStatusText: {
    fontSize: 11,
    fontWeight: "700"
  },
  recentOrderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
    marginTop: 4
  },
  recentOrderItems: {
    fontSize: 11,
    color: COLORS.slate,
    flex: 1,
    marginRight: 8
  },
  recentOrderAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  }
});