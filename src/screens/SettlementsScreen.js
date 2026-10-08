import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function SettlementsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { settlements, orders } = usePharmacy();

  const handleInstantPayout = () => {
    Alert.alert(
      "Instant Settlement Request",
      `Transfer eligible balance of ₹${settlements.pendingPayout.toFixed(2)} to ${settlements.bankName} (A/C ${settlements.accountNumber.slice(-4)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Payout",
          onPress: () => Alert.alert("Success", "Instant payout processed. Funds will reflect in your account within 15 minutes.")
        }
      ]
    );
  };

  const handleEditBank = () => {
    Alert.alert("Bank Account Details", "To update settlement bank account, please contact MediUnify Partner Support with a cancelled cheque for IFSC re-verification.");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 1200, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        { paddingBottom: Math.max(insets.bottom, 16) + 30 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Earnings Overview Cards */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.teal }]}>
          <Text style={styles.metricLabel} numberOfLines={1}>Today's Earnings</Text>
          <Text style={styles.metricVal} numberOfLines={1}>₹{settlements.todayEarnings.toFixed(2)}</Text>
          <Text style={styles.metricSub} numberOfLines={1}>Active & completed</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.navy }]}>
          <Text style={styles.metricLabel} numberOfLines={1}>Pending Payout</Text>
          <Text style={[styles.metricVal, { color: COLORS.coral }]} numberOfLines={1}>₹{settlements.pendingPayout.toFixed(2)}</Text>
          <Text style={styles.metricSub} numberOfLines={1}>Midnight settlement</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.aqua }]}>
          <Text style={styles.metricLabel} numberOfLines={1}>Weekly Revenue</Text>
          <Text style={styles.metricVal} numberOfLines={1}>₹{settlements.weeklyEarnings.toFixed(2)}</Text>
          <Text style={styles.metricSub} numberOfLines={1}>Last 7 calendar days</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: COLORS.freshGreen }]}>
          <Text style={styles.metricLabel} numberOfLines={1}>Orders Fulfilled</Text>
          <Text style={styles.metricVal} numberOfLines={1}>{settlements.totalOrdersCompleted}</Text>
          <Text style={styles.metricSub} numberOfLines={1}>100% payout reliability</Text>
        </View>
      </View>

      {/* Instant Payout Button */}
      <Pressable
        style={({ pressed }) => [styles.payoutButton, pressed && { opacity: 0.9 }]}
        onPress={handleInstantPayout}
      >
        <Ionicons name="flash-outline" size={17} color={COLORS.white} />
        <Text style={styles.payoutButtonText}>Request Instant Settlement</Text>
      </Pressable>

      {/* Linked Bank Account Card */}
      <View style={styles.bankCard}>
        <View style={styles.bankHeader}>
          <View style={styles.bankLogoWrap}>
            <Ionicons name="business" size={18} color={COLORS.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName}>{settlements.bankName}</Text>
            <Text style={styles.bankAccount}>{settlements.accountNumber}</Text>
          </View>
          <Pressable onPress={handleEditBank} hitSlop={8}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.slate} />
          </Pressable>
        </View>
        <View style={styles.bankDetailsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankSubLabel}>IFSC Code</Text>
            <Text style={styles.bankSubVal}>{settlements.ifsc}</Text>
          </View>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.bankSubLabel}>Account Holder</Text>
            <Text style={styles.bankSubVal} numberOfLines={1}>{settlements.accountHolder}</Text>
          </View>
          <View style={styles.verifiedTag}>
            <Ionicons name="checkmark-circle" size={13} color={COLORS.teal} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Settlement History */}
      <Text style={styles.sectionHeader}>PAST SETTLEMENT TRANSFERS</Text>
      <View style={styles.historyList}>
        {settlements.history.map((item, index) => (
          <View key={item.id || index} style={styles.historyRow}>
            <View style={styles.historyIconWrap}>
              <Ionicons name="arrow-down-circle" size={22} color={COLORS.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyId}>{item.id} · {item.ordersCount} orders</Text>
              <Text style={styles.historyDate}>{item.date} · UTR: {item.utr}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.historyAmount}>+₹{item.amount.toFixed(2)}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 14 },
  metricsGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  metricLabel: { fontSize: 11, fontWeight: "600", color: COLORS.slate },
  metricVal: { fontSize: 18, fontWeight: "800", color: COLORS.navy, marginVertical: 3 },
  metricSub: { fontSize: 10, color: COLORS.slateLight },

  payoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 16
  },
  payoutButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },

  bankCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 20
  },
  bankHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  bankLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  bankName: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  bankAccount: { fontSize: 13, color: COLORS.slate, marginTop: 1, letterSpacing: 1 },
  bankDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  bankSubLabel: { fontSize: 11, color: COLORS.slateLight, fontWeight: "600" },
  bankSubVal: { fontSize: 12, color: COLORS.navy, fontWeight: "600", marginTop: 2 },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.tealLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verifiedText: { fontSize: 11, fontWeight: "700", color: COLORS.teal },

  sectionHeader: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 10 },
  historyList: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line, overflow: "hidden" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  historyIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  historyId: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
  historyDate: { fontSize: 11, color: COLORS.slate, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: "800", color: COLORS.teal },
  statusBadge: { backgroundColor: COLORS.tealLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.teal }
});
