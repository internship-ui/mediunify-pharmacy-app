import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState("All");

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === "All") return true;
    if (activeTab === "Orders") return n.type === "order";
    if (activeTab === "Logistics") return n.type === "captain";
    if (activeTab === "Payments") return n.type === "payment";
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "order":
        return { icon: "receipt-outline", color: COLORS.teal, bg: COLORS.tealLight };
      case "captain":
        return { icon: "bicycle-outline", color: COLORS.aqua, bg: "#E0F7F9" };
      case "payment":
        return { icon: "wallet-outline", color: COLORS.navy, bg: "#EAF0FB" };
      default:
        return { icon: "notifications-outline", color: COLORS.slate, bg: "#F1F5F9" };
    }
  };

  const handleNotificationPress = (notif) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      navigation.navigate("OrderDetail", { orderId: notif.orderId });
    } else if (notif.type === "payment") {
      navigation.navigate("Settlements");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, isDesktop && styles.innerContainerDesktop, isTablet && styles.innerContainerTablet]}>
        {/* Top Header Actions */}
        <View style={styles.topActions}>
        <Pressable
          style={({ pressed }) => [styles.actionLink, pressed && { opacity: 0.7 }]}
          onPress={markAllNotificationsRead}
        >
          <Ionicons name="checkmark-done" size={16} color={COLORS.teal} />
          <Text style={styles.actionLinkText}>Mark all as read</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionLink, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Alert.alert("Clear Notifications", "Are you sure you want to clear all alerts?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear All", style: "destructive", onPress: clearNotifications }
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={15} color={COLORS.slate} />
          <Text style={[styles.actionLinkText, { color: COLORS.slate }]}>Clear</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {["All", "Orders", "Logistics", "Payments"].map(tab => (
          <Pressable
            key={tab}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab && styles.tabActive,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 30 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up with orders and store alerts!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const style = getNotifIcon(item.type);
          return (
            <Pressable
              style={[styles.notifCard, !item.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: style.bg }]}>
                <Ionicons name={style.icon} size={20} color={style.color} />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.notifTitle, !item.read && { fontWeight: "700" }]}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage}>{item.message}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={COLORS.slateLight} style={{ marginLeft: 4 }} />
            </Pressable>
          );
        }}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  innerContainer: { flex: 1 },
  innerContainerDesktop: {
    maxWidth: 900,
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
  listContent: { padding: 14 },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  actionLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionLinkText: { fontSize: 13, fontWeight: "600", color: COLORS.teal },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 6
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  tabActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  tabText: { fontSize: 12, fontWeight: "600", color: COLORS.slate },
  tabTextActive: { color: COLORS.white },

  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  unreadCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD"
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center"
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifTitle: { fontSize: 14, color: COLORS.navy, fontWeight: "600" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.teal },
  notifMessage: { fontSize: 13, color: COLORS.slate, marginTop: 3, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.slateLight, marginTop: 4, fontWeight: "500" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: COLORS.slate, marginTop: 4, textAlign: "center", maxWidth: 260 }
});
