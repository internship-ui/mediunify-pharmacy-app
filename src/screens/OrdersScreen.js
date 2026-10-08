import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Linking,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

const STATUS_CONFIG = {
  New: { bg: "#E1F7F1", text: COLORS.teal, icon: "document-text-outline", label: "New Order" },
  Accepted: { bg: "#EAF0FB", text: COLORS.navy, icon: "checkmark-circle-outline", label: "Accepted" },
  Picking: { bg: "#FFF1E8", text: COLORS.coral, icon: "flask-outline", label: "Picking" },
  Packed: { bg: "#FFF1E8", text: COLORS.coral, icon: "bag-check-outline", label: "Packed" },
  CaptainAssigned: { bg: "#E0F7F9", text: COLORS.aqua, icon: "bicycle-outline", label: "Captain Assigned" },
  HandedOver: { bg: "#EAF0FB", text: COLORS.navy, icon: "checkmark-done-outline", label: "Handed Over" },
  Delivered: { bg: "#E1F7F1", text: COLORS.teal, icon: "home-outline", label: "Delivered" },
  Completed: { bg: "#E1F7F1", text: COLORS.teal, icon: "checkmark-done-circle-outline", label: "Completed" },
  Rejected: { bg: "#FDE8E8", text: "#DC2626", icon: "close-circle-outline", label: "Rejected" },
  "Split Delivery": { bg: "#FFF7ED", text: "#EA580C", icon: "git-network-outline", label: "Split (In Progress)" },
  "Split Delivery (Batch 2 Packed)": { bg: "#FFF7ED", text: "#EA580C", icon: "cube-outline", label: "Batch 2 Packed" },
  "Partially Dispatched": { bg: "#FFF7ED", text: "#EA580C", icon: "git-network-outline", label: "Part Dispatched" },
  "Partially Delivered": { bg: "#FEF3C7", text: "#D97706", icon: "hourglass-outline", label: "Part Delivered" }
};

function OrderCard({ order, onPress, onInvoicePress }) {
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.New;
  const pendingBatch2 = order.isSplit && order.deliveries?.[1]?.status === "PendingArrangement";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={styles.idRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            {order.invoiceNo && (
              <Text style={styles.invoiceNo} numberOfLines={1}>· {order.invoiceNo}</Text>
            )}
          </View>
          <Text style={styles.patientName} numberOfLines={1}>
            {order.patientName}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon} size={12} color={statusCfg.text} />
          <Text style={[styles.statusText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Patient info row */}
      <View style={styles.patientMetaRow}>
        <Ionicons name="location-outline" size={13} color={COLORS.slate} />
        <Text style={styles.patientMetaText} numberOfLines={1}>
          {order.deliveryAddress} ({order.distanceKm || "2.5"} km away)
        </Text>
      </View>

      {/* Split Delivery Highlight Banner if split */}
      {order.isSplit && (
        <View style={styles.splitOrderTag}>
          <Ionicons name="git-branch" size={13} color="#EA580C" />
          <Text style={styles.splitOrderTagText} numberOfLines={2}>
            {pendingBatch2
              ? `Split Delivery: Batch 1 Dispatched · ${order.deliveries[1]?.items?.length || 2} remaining (${order.remainingEta || "2-3 hrs"})`
              : "Split Delivery: Multi-batch fulfillment active"}
          </Text>
        </View>
      )}

      {/* Medicines summary */}
      <View style={styles.itemsSummary}>
        <Ionicons
          name={order.type === "prescription" ? "document-text-outline" : "cart-outline"}
          size={14}
          color={order.type === "prescription" ? COLORS.teal : COLORS.navy}
        />
        <Text style={styles.itemsSummaryText} numberOfLines={1}>
          {order.type === "prescription" ? "Prescription Order" : "Cart Order"} · {order.items.length} item{order.items.length > 1 ? "s" : ""}
        </Text>
        <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
      </View>

      {/* Bottom info & quick action */}
      <View style={styles.cardFooter}>
        <View style={styles.paymentBadge}>
          <Text style={[styles.paymentBadgeText, { color: order.paymentStatus === "Paid" ? COLORS.teal : COLORS.coral }]}>
            {order.paymentMethod || "UPI"} · {order.paymentStatus || "Paid"}
          </Text>
        </View>
        <View style={styles.footerActions}>
          <Pressable
            style={({ pressed }) => [styles.callSmallBtn, pressed && { opacity: 0.7 }]}
            onPress={(e) => {
              e.stopPropagation();
              const rawPhone = order.patientPhone || "+91 98765 43210";
              const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
              if (Platform.OS !== "web") {
                Linking.openURL(`tel:${cleanPhone}`).catch(() => {
                  Alert.alert("Call Patient", `Dialing ${order.patientName} (${rawPhone})...`);
                });
              } else {
                Alert.alert("Call Patient", `Dialing ${order.patientName} (${rawPhone})...`);
              }
            }}
            hitSlop={6}
          >
            <Ionicons name="call-outline" size={12} color={COLORS.teal} />
            <Text style={styles.callSmallText}>Call</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.invoiceSmallBtn, pressed && { opacity: 0.7 }]}
            onPress={(e) => {
              e.stopPropagation();
              onInvoicePress();
            }}
            hitSlop={6}
          >
            <Ionicons name="receipt-outline" size={13} color={COLORS.navy} />
            <Text style={styles.invoiceSmallText}>Invoice</Text>
          </Pressable>
          <View style={styles.viewDetailsWrap}>
            <Text style={styles.viewDetailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.teal} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { orders } = usePharmacy();
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || "All");
  const [searchQuery, setSearchQuery] = useState("");

  // Synchronize when navigating from Dashboard cards with route params
  React.useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const isInProgress = (o) =>
    ["Accepted", "Picking", "Split Delivery", "Split Delivery (Batch 2 Packed)", "Partially Dispatched", "Partially Delivered"].includes(o.status) ||
    (o.isSplit && o.deliveries?.some(d => d.status !== "HandedOver" && d.status !== "Delivered"));

  const newCount = orders.filter(o => o.status === "New").length;
  const inProgressCount = orders.filter(isInProgress).length;
  const readyCount = orders.filter(o => ["Packed", "CaptainAssigned"].includes(o.status)).length;
  const historyCount = orders.filter(o => ["HandedOver", "Delivered", "Completed"].includes(o.status) && !isInProgress(o)).length;
  const rejectedCount = orders.filter(o => o.status === "Rejected").length;

  const tabs = [
    { key: "All", label: "All", count: orders.length },
    { key: "New", label: "New Prescriptions", count: newCount },
    { key: "InProgress", label: "In Progress", count: inProgressCount },
    { key: "Ready", label: "Ready / Captain", count: readyCount },
    { key: "History", label: "Delivered", count: historyCount },
    { key: "Rejected", label: "Rejected", count: rejectedCount }
  ];

  const filteredOrders = orders.filter(order => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchId = order.id.toLowerCase().includes(q);
      const matchPatient = order.patientName.toLowerCase().includes(q);
      const matchPhone = order.patientPhone?.toLowerCase().includes(q);
      const matchItem = order.items?.some(it => it.name.toLowerCase().includes(q));
      if (!matchId && !matchPatient && !matchPhone && !matchItem) return false;
    }

    // Tab filter matching
    if (activeTab === "All") return true;
    if (activeTab === "New") return order.status === "New";
    if (activeTab === "InProgress" || activeTab === "Active") return isInProgress(order);
    if (activeTab === "Ready") return ["Packed", "CaptainAssigned"].includes(order.status);
    if (activeTab === "History") return ["HandedOver", "Delivered", "Completed"].includes(order.status) && !isInProgress(order);
    if (activeTab === "Rejected") return order.status === "Rejected";
    return true;
  });

  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, isDesktop && styles.innerContainerDesktop, isTablet && styles.innerContainerTablet]}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={17} color={COLORS.slate} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID, Patient, Medicine..."
          placeholderTextColor={COLORS.slateLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS !== "ios" && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={COLORS.slate} />
          </Pressable>
        )}
      </View>

      {/* Segmented Filter Tabs */}
      <View style={styles.tabScrollWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.tabScrollContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.tabChip,
                  isActive && styles.tabChipActive,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => setActiveTab(item.key)}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {item.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {item.count}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== "web"}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="clipboard-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyDesc}>
              There are no orders matching your selected filters or search query.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
            onInvoicePress={() => navigation.navigate("Invoice", { orderId: item.id })}
          />
        )}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  innerContainer: {
    flex: 1
  },
  innerContainerDesktop: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12
  },
  innerContainerTablet: {
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 8
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8,
    height: 44
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: "500"
  },

  tabScrollWrap: {
    marginVertical: 4
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  tabChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate
  },
  tabLabelActive: {
    color: COLORS.white
  },
  tabBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)"
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy
  },
  tabBadgeTextActive: {
    color: COLORS.white
  },

  listContent: {
    padding: 16
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  orderId: {
    fontSize: 11,
    color: COLORS.slateLight,
    fontWeight: "700"
  },
  invoiceNo: {
    fontSize: 11,
    color: COLORS.slateLight,
    fontWeight: "500",
    marginLeft: 4,
    flexShrink: 1
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy,
    marginTop: 2
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700"
  },

  patientMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6
  },
  patientMetaText: {
    fontSize: 11,
    color: COLORS.slate,
    flex: 1
  },

  splitOrderTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8
  },
  splitOrderTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C2410C",
    flex: 1
  },

  itemsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  itemsSummaryText: {
    fontSize: 12,
    color: COLORS.navy,
    flex: 1,
    fontWeight: "500"
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC"
  },
  paymentBadge: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: "600"
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  callSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  callSmallText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  invoiceSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  invoiceSmallText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  viewDetailsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy,
    marginTop: 10
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 280
  }
});