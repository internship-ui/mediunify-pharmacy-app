import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Switch,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer, getStateFromPath, getPathFromState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";
import WebNavBar from "../components/WebNavBar";

import DashboardScreen from "../screens/DashboardScreen";
import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import InvoiceScreen from "../screens/InvoiceScreen";
import PrescriptionHistoryScreen from "../screens/PrescriptionHistoryScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SettlementsScreen from "../screens/SettlementsScreen";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import InventoryScreen from "../screens/InventoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const LOGO_IMG = require("../../assets/logo.png");

function MobileTabletHeader({ title, navigation, showBack = false }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768 && width < 1024;
  const { unreadCount = 0 } = usePharmacy();

  const topPadding = Platform.select({
    ios: Math.max(insets.top, 44),
    android: Math.max(insets.top, 14) + 4,
    default: 12
  });

  return (
    <View style={[styles.customHeaderContainer, { paddingTop: topPadding }]}>
      <View style={[styles.customHeaderInner, isTablet && styles.customHeaderInnerTablet]}>
        {/* Left Side: Brand Logo + MediUnify + Screen Title */}
        <View style={styles.headerLeftLockup}>
          {showBack && (
            <Pressable
              style={styles.headerBackBtn}
              onPress={() => navigation?.goBack()}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </Pressable>
          )}

          <Pressable
            style={styles.headerBrandPressable}
            onPress={() => navigation?.navigate("Dashboard")}
          >
            <View style={styles.headerLogoBadge}>
              <Image
                source={LOGO_IMG}
                style={styles.headerLogoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerBrandCol}>
              <View style={styles.headerBrandRow}>
                <Text style={styles.headerBrandMedi}>Medi</Text>
                <Text style={styles.headerBrandUnify}>Unify</Text>
                <View style={styles.hubHeaderBadge}>
                  <Text style={styles.hubHeaderBadgeText}>HUB</Text>
                </View>
              </View>
              {title ? (
                <Text style={styles.headerTitleText} numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </View>

        {/* Right Side: Notifications Bell with Pill */}
        <View style={styles.headerRightRow}>
          <Pressable
            style={({ pressed }) => [styles.notifButton, pressed && { opacity: 0.8 }]}
            onPress={() => navigation?.navigate("Notifications")}
            accessibilityLabel="Notifications"
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MainTabsNavigator() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const { orders = [], inventory = [] } = usePharmacy();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "New" || o.status === "Accepted" || o.status === "Picking" || o.status === "Packed"
  ).length;

  const criticalStockCount = inventory.filter(
    (i) => i.stock === 0 || (i.stock > 0 && i.stock <= (i.minStockThreshold || 15))
  ).length;

  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        // On desktop/web (width >= 1024), use custom WebNavBar; on mobile/tablet, use MobileTabletHeader with logo & toggle
        header: isDesktop
          ? () => <WebNavBar navigation={navigation} activeRoute={route.name} />
          : (headerProps) => (
              <MobileTabletHeader
                navigation={navigation}
                title={headerProps.options.title || route.name}
              />
            ),
        tabBarActiveTintColor: COLORS.teal,
        tabBarInactiveTintColor: COLORS.slateLight,
        // HIDE bottom tab bar completely on desktop/web (width >= 1024)
        tabBarStyle: isDesktop
          ? { display: "none" }
          : {
              display: "flex",
              backgroundColor: COLORS.white,
              borderTopColor: COLORS.line,
              borderTopWidth: 1,
              height: Platform.OS === "ios" ? 88 : 68,
              paddingBottom: Platform.OS === "ios" ? 28 : 10,
              paddingTop: 8,
              elevation: 12,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.08,
              shadowRadius: 10
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2
        },
        tabBarHideOnKeyboard: true
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Hub Operations",
          tabBarLabel: "Hub",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size || 22}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Order Queue",
          tabBarLabel: "Orders",
          tabBarBadge: pendingOrdersCount > 0 ? (pendingOrdersCount > 9 ? "9+" : pendingOrdersCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.coral,
            color: COLORS.white,
            fontSize: 10,
            fontWeight: "800",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 16
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size || 22}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: "Inventory & Stock",
          tabBarLabel: "Inventory",
          tabBarBadge: criticalStockCount > 0 ? (criticalStockCount > 9 ? "9+" : criticalStockCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#F59E0B",
            color: COLORS.white,
            fontSize: 10,
            fontWeight: "800",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            lineHeight: 16
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size || 22}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Settlements"
        component={SettlementsScreen}
        options={{
          title: "Bank & Settlements",
          tabBarLabel: "Finance",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={size || 22}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Pharmacy Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "business" : "business-outline"}
              size={size || 22}
              color={color}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const getLinkingConfig = () => {
  if (Platform.OS !== "web") return undefined;

  const isGitHubPages =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("github.io") ||
     window.location.pathname.startsWith("/mediunify-pharmacy-app"));

  const repoBase = isGitHubPages ? "/mediunify-pharmacy-app" : "";

  return {
    prefixes: [
      typeof window !== "undefined" ? `${window.location.origin}${repoBase}` : "",
      `${repoBase}/`,
      repoBase,
      "/",
      "mediunify://"
    ],
    config: {
      screens: {
        Login: "",
        MainTabs: {
          screens: {
            Dashboard: "dashboard",
            Orders: "orders",
            Inventory: "inventory",
            Settlements: "settlements",
            Profile: "profile"
          }
        },
        OrderDetail: "order/:orderId",
        Invoice: "invoice/:orderId",
        PrescriptionHistory: "prescriptions",
        Notifications: "notifications",
        EditProfile: "edit-profile",
        NotificationSettings: "notification-settings",
        HelpSupport: "help-support"
      }
    },
    getStateFromPath: (path, options) => {
      let cleanPath = path;
      if (repoBase && cleanPath.startsWith(repoBase)) {
        cleanPath = cleanPath.slice(repoBase.length);
      }
      if (!cleanPath || cleanPath === "") {
        cleanPath = "/";
      }
      return getStateFromPath(cleanPath, options);
    },
    getPathFromState: (state, options) => {
      const rawPath = getPathFromState(state, options);
      if (!repoBase) return rawPath;
      if (rawPath === "/" || rawPath === "") {
        return `${repoBase}/`;
      }
      return `${repoBase}${rawPath.startsWith("/") ? rawPath : "/" + rawPath}`;
    }
  };
};

export default function AppNavigator() {
  const linking = React.useMemo(() => getLinkingConfig(), []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation, route }) => ({
          header: (headerProps) => (
            <MobileTabletHeader
              navigation={navigation}
              title={headerProps.options.title || route.name}
              showBack={navigation.canGoBack()}
            />
          )
        })}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: "Order Fulfilment" }}
        />
        <Stack.Screen
          name="Invoice"
          component={InvoiceScreen}
          options={{ title: "Tax Invoice" }}
        />
        <Stack.Screen
          name="PrescriptionHistory"
          component={PrescriptionHistoryScreen}
          options={{ title: "Prescription Vault" }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: "Alerts & Notifications" }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: "Pharmacy Details" }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ title: "Notification Settings" }}
        />
        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={{ title: "Help & Support" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  customHeaderContainer: {
    backgroundColor: COLORS.navy,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    paddingBottom: 10,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  customHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  customHeaderInnerTablet: {
    maxWidth: 760,
    alignSelf: "center"
  },
  headerLeftLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1
  },
  headerBackBtn: {
    padding: 4,
    marginRight: 2
  },
  headerBrandPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1
  },
  hubHeaderBadge: {
    backgroundColor: "rgba(0, 184, 148, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(0, 184, 148, 0.5)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4
  },
  hubHeaderBadgeText: {
    color: "#7BC96F",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  headerLeftContainer: {
    paddingLeft: 12,
    paddingRight: 6,
    justifyContent: "center",
    alignItems: "center"
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1
  },
  headerLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }
  },
  headerLogoImage: {
    width: "100%",
    height: "100%"
  },
  headerBrandCol: {
    justifyContent: "center"
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1
  },
  headerBrandMedi: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  headerBrandUnify: {
    color: "#00C2CB",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  headerTitleText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginTop: -1
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 6
  },
  headerToggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1
  },
  headerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  headerToggleLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  notifButton: {
    padding: 6,
    position: "relative"
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.coral,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800"
  }
});