import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";

export default function TPProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const {
    currentTpId,
    currentTpProfile,
    currentTpOrders,
    currentTpInventory,
    tpUpdateProfile,
    loginAsThirdParty,
    logout
  } = usePharmacy();

  const handleToggleOpen = () => {
    tpUpdateProfile({ isOpen: !currentTpProfile.isOpen });
  };

  const handleSwitchPharmacy = (targetId) => {
    loginAsThirdParty(targetId, "partner@demo");
    Alert.alert(
      "Switched Partner Pharmacy",
      `Active pharmacy changed to ${targetId}. Your inventory and external orders are now isolated to this pharmacy.`
    );
  };

  const handleLogout = () => {
    logout();
    navigation.replace("Login");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 900, width: "100%", alignSelf: "center", paddingHorizontal: 24 },
        { paddingBottom: Math.max(insets.bottom, 16) + 40 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Lockup */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarRow}>
          <View style={styles.pharmacyAvatar}>
            <Ionicons name="medical" size={32} color={COLORS.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.pharmacyName}>{currentTpProfile.name}</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={12} color="#166534" />
                <Text style={styles.verifiedTagText}>Verified Partner</Text>
              </View>
            </View>
            <Text style={styles.facilityName}>{currentTpProfile.facilityName}</Text>
            <Text style={styles.partnerIdTag}>Partner ID: {currentTpProfile.id}</Text>
          </View>
        </View>

        {/* Online / Accepting Orders Toggle */}
        <View style={styles.onlineToggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>
              {currentTpProfile.isOpen ? "Accepting MediUnify Orders" : "Store Offline (Paused Orders)"}
            </Text>
            <Text style={styles.toggleSub}>
              {currentTpProfile.isOpen
                ? "Available to receive automatic routed prescription orders"
                : "New orders will be routed to other nearby partner pharmacies"}
            </Text>
          </View>
          <Switch
            value={currentTpProfile.isOpen}
            onValueChange={handleToggleOpen}
            trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
            thumbColor={currentTpProfile.isOpen ? COLORS.teal : "#94A3B8"}
          />
        </View>
      </View>

      {/* KPI Performance Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACCEPTED & FULFILLED</Text>
          <Text style={styles.metricVal}>{currentTpOrders.filter(o => o.status === "Delivered").length + (currentTpProfile.fulfilledOrdersCount || 100)}</Text>
          <Text style={styles.metricSub}>All-Time Orders</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACCEPTANCE RATE</Text>
          <Text style={[styles.metricVal, { color: COLORS.teal }]}>{currentTpProfile.acceptanceRate || 98.4}%</Text>
          <Text style={styles.metricSub}>SLA Benchmark: 95%</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>AVG FULFILMENT TIME</Text>
          <Text style={styles.metricVal}>{currentTpProfile.avgFulfilmentTimeMins || 18}m</Text>
          <Text style={styles.metricSub}>Pick to Dispatch</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>LOCAL INVENTORY SKUS</Text>
          <Text style={styles.metricVal}>{currentTpInventory.length}</Text>
          <Text style={styles.metricSub}>Isolated to this store</Text>
        </View>
      </View>

      {/* Strict Data Separation & Privacy Assurance */}
      <View style={styles.privacyCard}>
        <View style={styles.privacyHeader}>
          <Ionicons name="lock-closed" size={16} color="#0D9488" />
          <Text style={styles.privacyTitle}>Data Separation & Patient Privacy Protocols</Text>
        </View>
        <Text style={styles.privacyDesc}>
          • Your pharmacy inventory is strictly isolated and never exposed to other retail or hub pharmacies.
        </Text>
        <Text style={styles.privacyDesc}>
          • External orders display only the minimal patient information (Masked Phone, Name, Area) required for medicine verification and dispatch.
        </Text>
        <Text style={styles.privacyDesc}>
          • You have full autonomy to manage, add, restock, or flag medicines as unavailable in your inventory.
        </Text>
      </View>

      {/* Pharmacist in Charge Details */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionHeader}>REGISTERED PHARMACIST IN CHARGE</Text>
        <View style={styles.detailCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Name</Text>
            <Text style={styles.infoVal}>{currentTpProfile.pharmacistName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Qualifications</Text>
            <Text style={styles.infoVal}>{currentTpProfile.pharmacistQualification || "B.Pharm, Registered Pharmacist"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Pharmacy Council Reg No</Text>
            <Text style={[styles.infoVal, { fontWeight: "800", color: COLORS.navy }]}>
              {currentTpProfile.pharmacistRegNo}
            </Text>
          </View>
        </View>
      </View>

      {/* Drug License & Statutory Registrations */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionHeader}>DRUG LICENSES & COMPLIANCE</Text>
        <View style={styles.detailCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Retail Drug License (Form 20B/21B)</Text>
            <Text style={[styles.infoVal, { fontWeight: "700" }]}>{currentTpProfile.licenseNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>GSTIN</Text>
            <Text style={styles.infoVal}>{currentTpProfile.gstin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>PAN</Text>
            <Text style={styles.infoVal}>{currentTpProfile.panNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Compliance Status</Text>
            <Text style={[styles.infoVal, { color: "#16A34A", fontWeight: "800" }]}>
              {currentTpProfile.complianceStatus || "Verified & Audited"}
            </Text>
          </View>
        </View>
      </View>

      {/* Location, Operating Hours & Service Area */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionHeader}>LOCATION & OPERATING HOURS</Text>
        <View style={styles.detailCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Address</Text>
            <Text style={styles.infoVal}>{currentTpProfile.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>City / State / Pincode</Text>
            <Text style={styles.infoVal}>
              {currentTpProfile.city}, {currentTpProfile.state} - {currentTpProfile.pincode}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Operating Hours</Text>
            <Text style={styles.infoVal}>{currentTpProfile.operatingHours}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Delivery Radius</Text>
            <Text style={styles.infoVal}>{currentTpProfile.deliveryRadiusKm || 8.5} km</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Active Zones Served</Text>
            <Text style={styles.infoVal}>
              {currentTpProfile.activeLocationsServed?.join(", ") || "Local Area"}
            </Text>
          </View>
        </View>
      </View>

      {/* Demo Partner Switcher */}
      <View style={styles.switcherCard}>
        <Text style={styles.switcherTitle}>TESTING / SWITCH DEMO THIRD-PARTY PHARMACY</Text>
        <Text style={styles.switcherSub}>
          Switch active partner session to test isolated inventories and orders:
        </Text>
        <View style={styles.switcherBtns}>
          <Pressable
            style={[
              styles.switchBtn,
              currentTpId === "TP-APEX-01" && styles.switchBtnActive
            ]}
            onPress={() => handleSwitchPharmacy("TP-APEX-01")}
          >
            <Ionicons name="medical" size={14} color={currentTpId === "TP-APEX-01" ? COLORS.white : COLORS.navy} />
            <Text style={[styles.switchBtnText, currentTpId === "TP-APEX-01" && styles.switchBtnTextActive]}>
              Apex Pharmacy (TP-APEX-01 · Bengaluru)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.switchBtn,
              currentTpId === "TP-MEDPLUS-02" && styles.switchBtnActive
            ]}
            onPress={() => handleSwitchPharmacy("TP-MEDPLUS-02")}
          >
            <Ionicons name="bandage" size={14} color={currentTpId === "TP-MEDPLUS-02" ? COLORS.white : COLORS.navy} />
            <Text style={[styles.switchBtnText, currentTpId === "TP-MEDPLUS-02" && styles.switchBtnTextActive]}>
              MedPlus Partner (TP-MEDPLUS-02 · Mysuru)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Logout Action */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutBtnText}>Log Out from Third-Party Pharmacist</Text>
      </Pressable>
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
  profileHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14
  },
  pharmacyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B7E7E3"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: "900",
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
  facilityName: {
    fontSize: 12,
    color: COLORS.navyMuted,
    marginTop: 2,
    fontWeight: "600"
  },
  partnerIdTag: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  onlineToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    gap: 10
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    flex: 1,
    minWidth: 135,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  metricVal: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.navyDark,
    marginTop: 2
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  privacyCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    gap: 6
  },
  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F766E"
  },
  privacyDesc: {
    fontSize: 11,
    color: "#115E59",
    lineHeight: 16
  },
  detailSection: {
    gap: 6
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.6,
    marginLeft: 2
  },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 10
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  infoKey: {
    fontSize: 12,
    color: COLORS.slate,
    fontWeight: "600"
  },
  infoVal: {
    fontSize: 12,
    color: COLORS.navyDark,
    fontWeight: "600",
    textAlign: "right"
  },
  switcherCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8
  },
  switcherTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.6
  },
  switcherSub: {
    fontSize: 11,
    color: COLORS.slate
  },
  switcherBtns: {
    gap: 6,
    marginTop: 4
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  switchBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  switchBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  switchBtnTextActive: {
    color: COLORS.white
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 6
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626"
  }
});
