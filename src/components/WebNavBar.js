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

const LOGO_IMG = require("../../assets/logo.png");

export default function WebNavBar({ navigation, activeRoute = "Dashboard" }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width < 1200;

  const {
    pharmacyProfile,
    unreadCount = 0,
    orders = [],
    inventory = []
  } = usePharmacy();

  if (!isDesktop) {
    return null; // Mobile devices use Bottom Tab Bar instead!
  }

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "New" || o.status === "Accepted" || o.status === "Picking" || o.status === "Packed"
  ).length;

  const criticalStockCount = inventory.filter(
    (i) => i.stock === 0 || (i.stock > 0 && i.stock <= (i.minStockThreshold || 15))
  ).length;

  const navItems = [
    { name: "Dashboard", label: isTablet ? "Hub" : "Hub Operations", icon: "grid-outline", activeIcon: "grid" },
    {
      name: "Orders",
      label: "Orders",
      icon: "receipt-outline",
      activeIcon: "receipt",
      badge: pendingOrdersCount > 0 ? (pendingOrdersCount > 9 ? "9+" : pendingOrdersCount) : null,
      badgeColor: COLORS.coral
    },
    {
      name: "Inventory",
      label: isTablet ? "Stock" : "Inventory & Stock",
      icon: "cube-outline",
      activeIcon: "cube",
      badge: criticalStockCount > 0 ? (criticalStockCount > 9 ? "9+" : criticalStockCount) : null,
      badgeColor: "#F59E0B"
    },
    { name: "Settlements", label: isTablet ? "Finance" : "Bank & Settlements", icon: "wallet-outline", activeIcon: "wallet" },
    { name: "Profile", label: isTablet ? "Settings" : "Hub Settings", icon: "business-outline", activeIcon: "business" }
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.navInner}>
        {/* Left: Brand Identity */}
        <Pressable
          style={styles.brandLockup}
          onPress={() => navigation && navigation.navigate("Dashboard")}
        >
          <View style={styles.logoBadge}>
            <Image source={LOGO_IMG} style={styles.logoImg} resizeMode="contain" />
          </View>
          <View style={styles.brandTextWrap}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandMedi}>Medi</Text>
              <Text style={styles.brandUnify}>Unify</Text>
              <View style={styles.hubRolePill}>
                <Text style={styles.hubRoleText}>PHARMACY HUB</Text>
              </View>
            </View>
            {!isTablet && (
              <Text style={styles.hubSubText} numberOfLines={1}>
                {pharmacyProfile?.name || "Central Fulfillment Hub"}
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
                onPress={() => navigation && navigation.navigate(item.name)}
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

        {/* Right: Notification Bell & Hub Quick Action */}
        <View style={styles.rightActionsRow}>
          <Pressable
            style={({ pressed }) => [styles.notifBtn, pressed && { opacity: 0.8 }]}
            onPress={() => navigation && navigation.navigate("Notifications")}
            hitSlop={8}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={21} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: COLORS.navy,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 100,
    elevation: 4
  },
  navInner: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10
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
    shadowOpacity: 0.15,
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  brandUnify: {
    color: "#00C2CB",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  hubRolePill: {
    backgroundColor: "rgba(0, 184, 148, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(0, 184, 148, 0.5)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6
  },
  hubRoleText: {
    color: "#7BC96F",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  hubSubText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "500",
    maxWidth: 180
  },
  navLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 1
  },
  navTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  navTabTablet: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4
  },
  navTabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)"
  },
  navTabLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
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
  onlineStatusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  notifBtn: {
    position: "relative",
    padding: 6
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
  }
});
