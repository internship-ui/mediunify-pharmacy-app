import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";
import AdminTrackingModal from "./AdminTrackingModal";

const LOGO_IMG = require("../../assets/logo_clean.png");

export default function TPWebNavBar({ navigation, activeRoute = "TPDashboard" }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width < 1200;

  const {
    unreadCount = 0,
    currentTpProfile,
    currentTpOrders = [],
    currentTpInventory = [],
    logout
  } = usePharmacy();

  const [isAdminTrackingOpen, setIsAdminTrackingOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  if (!isDesktop) {
    return null;
  }

  const tpPendingCount = currentTpOrders.filter(
    (o) => o.status === "Pending Acceptance" || o.status === "New Assigned"
  ).length;

  const tpLowStockCount = currentTpInventory.filter(
    (i) => i.stock === 0 || i.stock <= (i.minStockThreshold || 10)
  ).length;

  const tpPrepCount = currentTpOrders.filter(
    (o) => o.status === "Accepted" || o.status === "Picking"
  ).length;

  const navItems = [
    { name: "TPDashboard", label: isTablet ? "Overview" : "Partner Overview", icon: "grid-outline", activeIcon: "grid" },
    {
      name: "TPOrders",
      label: "External Orders",
      icon: "receipt-outline",
      activeIcon: "receipt",
      badge: tpPendingCount > 0 ? (tpPendingCount > 9 ? "9+" : tpPendingCount) : null,
      badgeColor: COLORS.coral
    },
    {
      name: "TPInventory",
      label: isTablet ? "Inventory" : "Inventory Management",
      icon: "cube-outline",
      activeIcon: "cube",
      badge: tpLowStockCount > 0 ? (tpLowStockCount > 9 ? "9+" : tpLowStockCount) : null,
      badgeColor: "#F59E0B"
    },
    {
      name: "TPPickPack",
      label: "Pick & Pack",
      icon: "bag-check-outline",
      activeIcon: "bag-check",
      badge: tpPrepCount > 0 ? (tpPrepCount > 9 ? "9+" : tpPrepCount) : null,
      badgeColor: COLORS.coral
    },
    { name: "TPDispatch", label: "Dispatch", icon: "bicycle-outline", activeIcon: "bicycle" },
    { name: "TPProfile", label: "Pharmacy Profile", icon: "medical-outline", activeIcon: "medical" }
  ];

  const handleNavigate = (screenName) => {
    if (!navigation) return;
    navigation.navigate("TPMainTabs", { screen: screenName });
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.navInner}>
        {/* Left: Brand Identity */}
        <Pressable
          style={styles.brandLockup}
          onPress={() => {
            setProfileMenuOpen(false);
            handleNavigate("TPDashboard");
          }}
        >
          <View style={styles.logoBadge}>
            <Image source={LOGO_IMG} style={styles.logoImg} resizeMode="contain" />
          </View>
          <View style={styles.brandTextWrap}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandMedi}>Medi</Text>
              <Text style={styles.brandUnify}>Unify</Text>
              <View style={styles.partnerRolePill}>
                <Text style={styles.partnerRoleText}>PARTNER</Text>
              </View>
            </View>
            {!isTablet && (
              <Text style={styles.hubSubText} numberOfLines={1}>
                {currentTpProfile?.name || "Apex Pharmacy & Healthcare"}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Center: Desktop Nav Links */}
        <View style={styles.navLinksRow}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <Pressable
                key={item.name}
                style={[
                  styles.navTab,
                  isTablet && styles.navTabTablet,
                  isActive && styles.navTabActive
                ]}
                onPress={() => {
                  setProfileMenuOpen(false);
                  handleNavigate(item.name);
                }}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={15}
                  color={isActive ? COLORS.teal : "rgba(255, 255, 255, 0.75)"}
                />
                <Text
                  style={[
                    styles.navTabLabel,
                    isTablet && styles.navTabLabelTablet,
                    isActive && styles.navTabLabelActive
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <View style={[styles.tabBadge, { backgroundColor: item.badgeColor }]}>
                    <Text style={styles.tabBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Right: Admin Tracking & Profile */}
        <View style={styles.rightActionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.adminTrackingNavbarBtn,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => setIsAdminTrackingOpen(true)}
          >
            <Ionicons name="git-network-outline" size={14} color={COLORS.navy} />
            <Text style={styles.adminTrackingNavbarBtnText}>Admin Split Tracking</Text>
            <View style={styles.navLiveDot} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.notifBtn,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => navigation?.navigate("Notifications")}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.rightDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.profileBtn,
              activeRoute === "TPProfile" && styles.profileBtnActive,
              profileMenuOpen && styles.profileBtnOpen,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => setProfileMenuOpen(prev => !prev)}
          >
            <Ionicons
              name="medical"
              size={15}
              color={activeRoute === "TPProfile" ? COLORS.teal : COLORS.white}
            />
            <Text
              style={[
                styles.profileBtnText,
                activeRoute === "TPProfile" && styles.profileBtnTextActive
              ]}
            >
              Partner
            </Text>
            <Ionicons
              name={profileMenuOpen ? "chevron-up" : "chevron-down"}
              size={13}
              color={activeRoute === "TPProfile" ? COLORS.teal : "rgba(255, 255, 255, 0.75)"}
            />
          </Pressable>
        </View>
      </View>

      {/* Floating Partner Dropdown */}
      {profileMenuOpen && (
        <>
          <Pressable
            style={styles.dropdownBackdrop}
            onPress={() => setProfileMenuOpen(false)}
          />
          <View style={styles.profileDropdownCard}>
            <View style={styles.dropdownHeader}>
              <View style={[styles.dropdownAvatarLarge, { backgroundColor: COLORS.tealLight }]}>
                <Text style={[styles.dropdownAvatarLargeText, { color: COLORS.teal }]}>TP</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.dropdownNameText} numberOfLines={1}>
                  {currentTpProfile?.name || "Apex Pharmacy"}
                </Text>
                <Text style={styles.dropdownHubSubText} numberOfLines={1}>
                  {currentTpProfile?.pharmacistName || "Registered Partner"}
                </Text>
                <View style={[styles.dropdownHubIdBadge, { backgroundColor: COLORS.tealLight }]}>
                  <Text style={[styles.dropdownHubIdText, { color: COLORS.teal }]}>
                    PARTNER ID: {currentTpProfile?.id || "TP-APEX-01"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.dropdownDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                activeRoute === "TPProfile" && styles.dropdownItemActive,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                handleNavigate("TPProfile");
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: COLORS.tealLight }]}>
                <Ionicons name="medical-outline" size={16} color={COLORS.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownItemLabel}>Pharmacy Details & Licenses</Text>
                <Text style={styles.dropdownItemSub}>License, GSTIN & timings</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.slateLight} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                setIsAdminTrackingOpen(true);
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: COLORS.navyLight }]}>
                <Ionicons name="git-network-outline" size={16} color={COLORS.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownItemLabel}>Admin Split Tracking</Text>
                <Text style={styles.dropdownItemSub}>Live multi-hub order sync</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.slateLight} />
            </Pressable>

            <View style={styles.dropdownDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                logout && logout();
                if (navigation?.reset) {
                  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                } else if (navigation?.navigate) {
                  navigation.navigate("Login");
                }
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: "#FDE8E8" }]}>
                <Ionicons name="log-out-outline" size={16} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dropdownItemLabel, { color: "#DC2626" }]}>Log Out</Text>
                <Text style={styles.dropdownItemSub}>Sign out of partner session</Text>
              </View>
            </Pressable>
          </View>
        </>
      )}

      <AdminTrackingModal
        visible={isAdminTrackingOpen}
        onClose={() => setIsAdminTrackingOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  adminTrackingNavbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B7E7E3"
  },
  adminTrackingNavbarBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  navLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal
  },
  navContainer: {
    backgroundColor: "#0A0F1D",
    zIndex: 100,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 229, 255, 0.25)",
    ...(Platform.OS === "web" ? {
      position: "sticky",
      top: 0,
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(10, 15, 29, 0.94)"
    } : {})
  },
  navInner: {
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 12
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  logoImg: {
    width: "100%",
    height: "100%"
  },
  brandTextWrap: {
    justifyContent: "center"
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  brandMedi: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.3
  },
  brandUnify: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.teal,
    letterSpacing: -0.3
  },
  partnerRolePill: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6
  },
  partnerRoleText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  hubSubText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.65)",
    fontWeight: "500",
    marginTop: 1
  },
  navLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  navTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  navTabTablet: {
    paddingHorizontal: 8
  },
  navTabActive: {
    backgroundColor: "rgba(0, 194, 203, 0.15)"
  },
  navTabLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "600"
  },
  navTabLabelTablet: {
    fontSize: 12
  },
  navTabLabelActive: {
    color: COLORS.teal,
    fontWeight: "700"
  },
  tabBadge: {
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800"
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0
  },
  notifBtn: {
    position: "relative",
    padding: 6,
    borderRadius: 8
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.coral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  notifBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800"
  },
  rightDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    marginHorizontal: 2
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)"
  },
  profileBtnActive: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(0, 168, 132, 0.18)"
  },
  profileBtnOpen: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(0, 168, 132, 0.22)"
  },
  profileBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  profileBtnTextActive: {
    color: COLORS.teal
  },
  dropdownBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998
  },
  profileDropdownCard: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 284,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8
  },
  dropdownAvatarLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownAvatarLargeText: {
    fontSize: 14,
    fontWeight: "800"
  },
  dropdownNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  dropdownHubSubText: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  dropdownHubIdBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3
  },
  dropdownHubIdText: {
    fontSize: 9,
    fontWeight: "800"
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 4
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  dropdownItemActive: {
    backgroundColor: "rgba(0, 168, 132, 0.08)"
  },
  dropdownItemPressed: {
    backgroundColor: "#F8FAFC"
  },
  dropdownItemIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownItemLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  dropdownItemSub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  }
});
