import React from "react";
import {
  View,
  Text,
  Image,
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

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { pharmacyProfile, logout } = usePharmacy();

  const handleLogout = () => {
    Alert.alert(
      "Log Out Confirmation",
      "Are you sure you want to log out of the MediUnify Hub portal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }]
            });
          }
        }
      ]
    );
  };

  const menuSections = [
    {
      title: "HUB FULFILLMENT OPERATIONS",
      items: [
        {
          label: "Inventory & Medicine Stock",
          sub: "Manage stock levels, batch numbers, rack locations, and catalog SKUs",
          icon: "cube-outline",
          route: "Inventory"
        },
        {
          label: "Hub Details & Drug License",
          sub: "View hub location, license, GSTIN, and operational dispatch timings",
          icon: "business-outline",
          route: "EditProfile"
        },
        {
          label: "Prescription History Vault",
          sub: "Search archived prescriptions and patient dispensing records",
          icon: "document-attach-outline",
          route: "PrescriptionHistory"
        }
      ]
    },
    {
      title: "FINANCE & SETTLEMENTS",
      items: [
        {
          label: "Bank Account & Settlements",
          sub: "View earnings, pending payouts, and bank ledger",
          icon: "card-outline",
          route: "Settlements"
        }
      ]
    },
    {
      title: "PREFERENCES & SUPPORT",
      items: [
        {
          label: "Alerts & Notifications",
          sub: "Configure sound alarms, SMS, and dispatch push alerts",
          icon: "notifications-outline",
          route: "NotificationSettings"
        },
        {
          label: "Hub Partner Help & Support",
          sub: "Super Admin desk, 24/7 Helpline, and FAQ guide",
          icon: "help-circle-outline",
          route: "HelpSupport"
        }
      ]
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 900, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        { paddingBottom: Math.max(insets.bottom, 16) + 30 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hub Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.profileLogoBadge}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.profileLogoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.pharmacyName}>{pharmacyProfile.name}</Text>
        <Text style={styles.facilityText}>{pharmacyProfile.facilityName || pharmacyProfile.name}</Text>
        <Text style={styles.ownerText}>{pharmacyProfile.ownerName}</Text>
        <Text style={styles.pharmacyId}>HUB ID: {pharmacyProfile.id} · GSTIN: {pharmacyProfile.gstin}</Text>

        {/* Hub Type & Super Admin Provisioned Badge */}
        <View style={styles.hubTypeBadge}>
          <Ionicons
            name={pharmacyProfile.isThirdParty ? "git-network-outline" : "shield-checkmark"}
            size={13}
            color={pharmacyProfile.isThirdParty ? COLORS.navy : COLORS.teal}
          />
          <Text style={[styles.hubTypeText, { color: pharmacyProfile.isThirdParty ? COLORS.navy : COLORS.teal }]}>
            {pharmacyProfile.hubType || "Fulfillment Hub"} · Super Admin Provisioned
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.statusPill, { backgroundColor: pharmacyProfile.isOpen ? COLORS.tealLight : "#FEE2E2" }]}>
            <View style={[styles.statusDot, { backgroundColor: pharmacyProfile.isOpen ? "#10B981" : "#EF4444" }]} />
            <Text style={[styles.statusPillText, { color: pharmacyProfile.isOpen ? "#065F46" : "#991B1B" }]}>
              {pharmacyProfile.isOpen ? "Hub Active (Dispatching)" : "Hub Offline"}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{pharmacyProfile.rating} ({pharmacyProfile.reviewsCount} reviews)</Text>
          </View>
        </View>

        {/* Coverage areas pill */}
        {pharmacyProfile.activeLocationsServed && (
          <View style={styles.coverageRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.slate} />
            <Text style={styles.coverageText}>
              Serving: {pharmacyProfile.activeLocationsServed.slice(0, 3).join(", ")} +more
            </Text>
          </View>
        )}
      </View>

      {/* Menu Sections */}
      {menuSections.map((sec, secIdx) => (
        <View key={secIdx} style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          <View style={styles.menuCard}>
            {sec.items.map((item, itemIdx) => (
              <Pressable
                key={itemIdx}
                style={[styles.menuRow, itemIdx < sec.items.length - 1 && styles.menuRowBorder]}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={COLORS.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.slateLight} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutText}>Log Out of Hub Session</Text>
      </Pressable>

      <Text style={styles.versionNote}>MediUnify Fulfillment Hub Operating System v1.0.0 (Build 57.0.19)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 14 },
  profileHeaderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  profileLogoBadge: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 2
  },
  profileLogoImage: {
    width: "100%",
    height: "100%"
  },
  pharmacyName: { fontSize: 17, fontWeight: "800", color: COLORS.navy, textAlign: "center" },
  facilityText: { fontSize: 12, fontWeight: "600", color: COLORS.teal, marginTop: 2, textAlign: "center" },
  ownerText: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  pharmacyId: { fontSize: 11, color: COLORS.slateLight, marginTop: 3, fontWeight: "500" },

  hubTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8
  },
  hubTypeText: { fontSize: 11, fontWeight: "700" },

  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  ratingText: { fontSize: 11, fontWeight: "700", color: "#92400E" },

  coverageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  coverageText: { fontSize: 11, color: COLORS.slate, fontWeight: "500" },

  sectionWrap: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 },
  menuCard: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", color: COLORS.navy },
  menuSub: { fontSize: 11, color: COLORS.slate, marginTop: 1 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FDE8E8",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8
  },
  logoutText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  versionNote: { textAlign: "center", fontSize: 11, color: COLORS.slateLight, marginTop: 14 }
});