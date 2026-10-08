import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function NotificationSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { notificationSettings, setNotificationSettings } = usePharmacy();

  const toggleSetting = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestNotification = () => {
    Alert.alert("🔔 Test Alert Triggered", "MediUnify notification audio and banner tested successfully.");
  };

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
      <Text style={styles.subtitle}>
        Configure how and when your pharmacy receives urgent incoming prescription alerts, captain arrivals, and settlement notifications.
      </Text>

      {/* Settings Group: Orders */}
      <Text style={styles.sectionHeader}>ORDERS & PRESCRIPTIONS</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>New Prescription Alerts</Text>
            <Text style={styles.settingDesc}>Instant sound and banner when a patient uploads a prescription</Text>
          </View>
          <Switch
            value={notificationSettings.pushNewOrders}
            onValueChange={() => toggleSetting("pushNewOrders")}
            trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
            thumbColor={notificationSettings.pushNewOrders ? COLORS.teal : COLORS.slateLight}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>High-Volume Ringtone</Text>
            <Text style={styles.settingDesc}>Repeat urgent alarm chime until order is accepted or reviewed</Text>
          </View>
          <Switch
            value={notificationSettings.soundAlerts}
            onValueChange={() => toggleSetting("soundAlerts")}
            trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
            thumbColor={notificationSettings.soundAlerts ? COLORS.teal : COLORS.slateLight}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>SMS Backup Alerts</Text>
            <Text style={styles.settingDesc}>Receive SMS notifications if the app is offline or idle for 5 minutes</Text>
          </View>
          <Switch
            value={notificationSettings.smsAlerts}
            onValueChange={() => toggleSetting("smsAlerts")}
            trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
            thumbColor={notificationSettings.smsAlerts ? COLORS.teal : COLORS.slateLight}
          />
        </View>
      </View>

      {/* Settings Group: Operations */}
      <Text style={styles.sectionHeader}>LOGISTICS & SETTLEMENTS</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Captain Arrival Pings</Text>
            <Text style={styles.settingDesc}>Alert when delivery partner arrives at store for order pickup</Text>
          </View>
          <Switch
            value={notificationSettings.captainUpdates}
            onValueChange={() => toggleSetting("captainUpdates")}
            trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
            thumbColor={notificationSettings.captainUpdates ? COLORS.teal : COLORS.slateLight}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Daily Settlement Reports</Text>
            <Text style={styles.settingDesc}>Receive bank payout summary and GST invoice ledger at 11:30 PM</Text>
          </View>
          <Switch
            value={notificationSettings.settlementReports}
            onValueChange={() => toggleSetting("settlementReports")}
            trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
            thumbColor={notificationSettings.settlementReports ? COLORS.teal : COLORS.slateLight}
          />
        </View>
      </View>

      {/* Test Sound Button */}
      <Pressable style={styles.testBtn} onPress={handleTestNotification}>
        <Ionicons name="volume-high-outline" size={18} color={COLORS.navy} />
        <Text style={styles.testBtnText}>Play Test Notification Sound</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16 },
  subtitle: { fontSize: 13, color: COLORS.slate, lineHeight: 18, marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 16,
    overflow: "hidden"
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    gap: 12
  },
  settingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.navy },
  settingDesc: { fontSize: 12, color: COLORS.slate, marginTop: 2, lineHeight: 16 },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8
  },
  testBtnText: { color: COLORS.navy, fontWeight: "600", fontSize: 14 }
});
