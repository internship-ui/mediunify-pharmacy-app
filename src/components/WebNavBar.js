import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
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
    inventory = [],
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications
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
    { name: "Settlements", label: "Earnings", icon: "wallet-outline", activeIcon: "wallet" }
  ];

  const TAB_NAMES = ["Dashboard", "Orders", "Inventory", "Settlements", "Profile"];

  const handleNavigate = (targetScreen) => {
    if (!navigation) return;
    if (TAB_NAMES.includes(targetScreen)) {
      navigation.navigate("MainTabs", { screen: targetScreen });
    } else {
      navigation.navigate(targetScreen);
    }
  };

  const isNotifActive = activeRoute === "Notifications";
  const isProfileActive = ["Profile", "EditProfile", "NotificationSettings", "HelpSupport"].includes(activeRoute);

  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = React.useState(false);
  const [notifTab, setNotifTab] = React.useState("All");

  const hubName = pharmacyProfile?.name || "MediUnify Central Hub (Mysuru)";
  const initials = "MU";

  const filteredNotifs = notifications.filter((n) => {
    if (notifTab === "All") return true;
    if (notifTab === "Orders") return n.type === "order";
    if (notifTab === "Logistics") return n.type === "captain";
    if (notifTab === "Payments") return n.type === "payment";
    return true;
  });

  const getNotifMeta = (type) => {
    switch (type) {
      case "order":
        return { icon: "receipt-outline", color: COLORS.teal, bg: "#E1F7F1" };
      case "captain":
        return { icon: "bicycle-outline", color: COLORS.aqua, bg: "#E0F7F9" };
      case "payment":
        return { icon: "wallet-outline", color: COLORS.navy, bg: "#EAF0FB" };
      default:
        return { icon: "notifications-outline", color: COLORS.slate, bg: "#F1F5F9" };
    }
  };

  const handleNotifItemPress = (notif) => {
    if (markNotificationRead) {
      markNotificationRead(notif.id);
    }
    setNotifMenuOpen(false);
    if (notif.orderId) {
      navigation && navigation.navigate("OrderDetail", { orderId: notif.orderId });
    } else if (notif.type === "payment") {
      handleNavigate("Settlements");
    }
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.navInner}>
        {/* Left: Brand Identity */}
        <Pressable
          style={styles.brandLockup}
          onPress={() => {
            setProfileMenuOpen(false);
            setNotifMenuOpen(false);
            handleNavigate("Dashboard");
          }}
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

        {/* Center: Desktop Nav Links (Hub Settings removed from here) */}
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
                  setNotifMenuOpen(false);
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

        {/* Right: Notification Bell & Profile Section */}
        <View style={styles.rightActionsRow}>
          {/* Notification Bell (Toggles Pop-up) */}
          <Pressable
            style={({ pressed }) => [
              styles.notifBtn,
              (notifMenuOpen || isNotifActive) && styles.notifBtnActive,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => {
              setProfileMenuOpen(false);
              setNotifMenuOpen((prev) => !prev);
            }}
            hitSlop={8}
            accessibilityLabel="Notifications Pop-up"
          >
            <Ionicons
              name={notifMenuOpen || isNotifActive ? "notifications" : "notifications-outline"}
              size={20}
              color={notifMenuOpen || isNotifActive ? COLORS.teal : COLORS.white}
            />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Divider between Bell and Profile */}
          <View style={styles.rightDivider} />

          {/* Profile Section next to Notifications */}
          <Pressable
            style={({ pressed }) => [
              styles.profileBtn,
              isProfileActive && styles.profileBtnActive,
              profileMenuOpen && styles.profileBtnOpen,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => {
              setNotifMenuOpen(false);
              setProfileMenuOpen((prev) => !prev);
            }}
            accessibilityLabel="Profile"
          >
            <Ionicons
              name={isProfileActive ? "person" : "person-outline"}
              size={15}
              color={isProfileActive ? COLORS.teal : COLORS.white}
            />
            <Text
              style={[
                styles.profileBtnText,
                isProfileActive && styles.profileBtnTextActive
              ]}
            >
              Profile
            </Text>
            <Ionicons
              name={profileMenuOpen ? "chevron-up" : "chevron-down"}
              size={13}
              color={isProfileActive ? COLORS.teal : "rgba(255, 255, 255, 0.75)"}
            />
          </Pressable>
        </View>
      </View>

      {/* Floating Profile & Hub Settings Dropdown Menu */}
      {profileMenuOpen && (
        <>
          <Pressable
            style={styles.dropdownBackdrop}
            onPress={() => setProfileMenuOpen(false)}
          />
          <View style={styles.profileDropdownCard}>
            {/* Header: Hub Info */}
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatarLarge}>
                <Text style={styles.dropdownAvatarLargeText}>{initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.dropdownNameText} numberOfLines={1}>
                  {hubName}
                </Text>
                <Text style={styles.dropdownHubSubText} numberOfLines={1}>
                  {pharmacyProfile?.facilityName || "Central Fulfillment Hub (Mysuru)"}
                </Text>
                <View style={styles.dropdownHubIdBadge}>
                  <Text style={styles.dropdownHubIdText}>
                    HUB ID: {pharmacyProfile?.id || "HUB-MYS-01"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.dropdownDivider} />

            {/* Hub Settings features */}
            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                activeRoute === "Profile" && styles.dropdownItemActive,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                handleNavigate("Profile");
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: COLORS.navyLight }]}>
                <Ionicons name="business-outline" size={16} color={COLORS.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownItemLabel}>Hub Settings & Profile</Text>
                <Text style={styles.dropdownItemSub}>Overview, operations & licenses</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.slateLight} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                activeRoute === "EditProfile" && styles.dropdownItemActive,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                handleNavigate("EditProfile");
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: COLORS.tealLight }]}>
                <Ionicons name="create-outline" size={16} color={COLORS.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownItemLabel}>Edit Pharmacy Details</Text>
                <Text style={styles.dropdownItemSub}>License, GSTIN, timings & contacts</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.slateLight} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                activeRoute === "NotificationSettings" && styles.dropdownItemActive,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
                handleNavigate("NotificationSettings");
              }}
            >
              <View style={[styles.dropdownItemIcon, { backgroundColor: "#FFF1E8" }]}>
                <Ionicons name="notifications-outline" size={16} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownItemLabel}>Notification Preferences</Text>
                <Text style={styles.dropdownItemSub}>Order alerts, sounds & dispatch</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.slateLight} />
            </Pressable>

            <View style={styles.dropdownDivider} />

            {/* Logout */}
            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem,
                pressed && styles.dropdownItemPressed
              ]}
              onPress={() => {
                setProfileMenuOpen(false);
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
                <Text style={styles.dropdownItemSub}>Sign out of hub session</Text>
              </View>
            </Pressable>
          </View>
        </>
      )}

      {/* Floating Notifications Pop-up Card */}
      {notifMenuOpen && (
        <>
          <Pressable
            style={styles.dropdownBackdrop}
            onPress={() => setNotifMenuOpen(false)}
          />
          <View style={styles.notifDropdownCard}>
            {/* Pop-up Header */}
            <View style={styles.notifHeaderRow}>
              <View style={styles.notifHeaderTitleWrap}>
                <Ionicons name="notifications" size={16} color={COLORS.navy} />
                <Text style={styles.notifHeaderTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifUnreadPill}>
                    <Text style={styles.notifUnreadPillText}>{unreadCount} new</Text>
                  </View>
                )}
              </View>

              {unreadCount > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.notifMarkAllBtn,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                    if (markAllNotificationsRead) markAllNotificationsRead();
                  }}
                  hitSlop={6}
                >
                  <Ionicons name="checkmark-done" size={14} color={COLORS.teal} />
                  <Text style={styles.notifMarkAllText}>Mark all as read</Text>
                </Pressable>
              )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.notifTabRow}>
              {["All", "Orders", "Logistics", "Payments"].map((tab) => {
                const isActive = notifTab === tab;
                return (
                  <Pressable
                    key={tab}
                    style={[
                      styles.notifTabChip,
                      isActive && styles.notifTabChipActive
                    ]}
                    onPress={() => setNotifTab(tab)}
                  >
                    <Text
                      style={[
                        styles.notifTabChipText,
                        isActive && styles.notifTabChipTextActive
                      ]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Notifications Scrollable List */}
            <ScrollView
              style={styles.notifListScroll}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {filteredNotifs.length === 0 ? (
                <View style={styles.notifEmptyState}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={36}
                    color={COLORS.slateLight}
                  />
                  <Text style={styles.notifEmptyTitle}>All caught up!</Text>
                  <Text style={styles.notifEmptySub}>
                    No {notifTab !== "All" ? notifTab.toLowerCase() : ""} notifications right now.
                  </Text>
                </View>
              ) : (
                filteredNotifs.map((item) => {
                  const meta = getNotifMeta(item.type);
                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.notifItem,
                        !item.read && styles.notifItemUnread,
                        pressed && styles.notifItemPressed
                      ]}
                      onPress={() => handleNotifItemPress(item)}
                    >
                      <View
                        style={[styles.notifItemIconBadge, { backgroundColor: meta.bg }]}
                      >
                        <Ionicons name={meta.icon} size={16} color={meta.color} />
                      </View>

                      <View style={styles.notifItemContent}>
                        <View style={styles.notifItemHeader}>
                          <Text
                            style={[
                              styles.notifItemTitle,
                              !item.read && styles.notifItemTitleUnread
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          {!item.read && <View style={styles.notifUnreadDot} />}
                        </View>
                        <Text style={styles.notifItemMsg} numberOfLines={2}>
                          {item.message}
                        </Text>
                        <Text style={styles.notifItemTime}>{item.time}</Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {/* Pop-up Footer */}
            {filteredNotifs.length > 0 && (
              <View style={styles.notifFooterRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.notifClearBtn,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                    if (clearNotifications) clearNotifications();
                  }}
                  hitSlop={6}
                >
                  <Ionicons name="trash-outline" size={13} color={COLORS.slate} />
                  <Text style={styles.notifClearText}>Clear notifications</Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: COLORS.navy,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 100,
    elevation: 4,
    ...(Platform.OS === "web" ? { position: "sticky", top: 0 } : {})
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
    padding: 6,
    borderRadius: 8
  },
  notifBtnActive: {
    backgroundColor: "rgba(0, 168, 132, 0.2)"
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
  profileOnlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#10B981"
  },
  profileRoleText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    fontWeight: "600"
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
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownAvatarLargeText: {
    color: COLORS.white,
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
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3
  },
  dropdownHubIdText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slate
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
  },
  notifDropdownCard: {
    position: "absolute",
    top: 56,
    right: 80,
    width: 380,
    maxWidth: "92%",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  notifHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  notifHeaderTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  notifHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  notifUnreadPill: {
    backgroundColor: "rgba(0, 168, 132, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10
  },
  notifUnreadPillText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: "800"
  },
  notifMarkAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  notifMarkAllText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: "700"
  },
  notifTabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  notifTabChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "transparent"
  },
  notifTabChipActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  notifTabChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  notifTabChipTextActive: {
    color: COLORS.teal,
    fontWeight: "800"
  },
  notifListScroll: {
    maxHeight: 340
  },
  notifEmptyState: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  notifEmptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  notifEmptySub: {
    fontSize: 11,
    color: COLORS.slate,
    textAlign: "center"
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  notifItemUnread: {
    backgroundColor: "rgba(0, 168, 132, 0.04)"
  },
  notifItemPressed: {
    backgroundColor: "#F8FAFC"
  },
  notifItemIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  notifItemContent: {
    flex: 1
  },
  notifItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6
  },
  notifItemTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy,
    flex: 1
  },
  notifItemTitleUnread: {
    fontWeight: "800",
    color: COLORS.navy
  },
  notifUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal
  },
  notifItemMsg: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2,
    lineHeight: 15
  },
  notifItemTime: {
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 3,
    fontWeight: "500"
  },
  notifFooterRow: {
    paddingHorizontal: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    alignItems: "flex-end"
  },
  notifClearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  notifClearText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "600"
  }
});
