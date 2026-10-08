// MediUnify Lab Operational Settings Screen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";

export function LabSettingsScreen() {
  const [labProfile, setLabProfile] = useState({
    labName: "Novus Pathology & Central Reference Diagnostic Hub",
    nablCertNumber: "MC-4192",
    nablExpiry: "2028-12-31",
    isoCert: "ISO 15189:2022 Medical Laboratories",
    icmrReg: "ICMR-DIAG-KA-8821",
    leadPathologist: "Dr. Arvind Rao (MD Pathology, KMC 58921)",
    labEmail: "mysore.central.lab@mediunify.in",
    labPhone: "+91 821 245 8800",
    reportDispatchHeader: "NOVUS DIAGNOSTICS & CENTRAL REFERENCE HUB"
  });

  const [toggles, setToggles] = useState({
    autoAssignPhlebotomist: true,
    whatsappReportDispatch: true,
    smsAlerts: true,
    criticalValueCallAlert: true,
    temperatureColdChainAlert: true,
    autoEscalateTAT: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    Alert.alert("Settings Saved", "Laboratory operational parameters and NABL credentials updated successfully.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Laboratory Administration & NABL Settings</Text>
          <Text style={styles.subtitle}>Regulatory compliance, automated dispatch rules, and cold-chain quality controls</Text>
        </View>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={16} color={COLORS.white} />
          <Text style={styles.saveBtnText}>Save Configurations</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {/* Lab Profile & Accreditation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.teal} />
            <Text style={styles.cardTitle}>Laboratory Identity & NABL Accreditation</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Official Laboratory Name</Text>
            <TextInput
              style={styles.input}
              value={labProfile.labName}
              onChangeText={(t) => setLabProfile(p => ({ ...p, labName: t }))}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>NABL Certificate Number</Text>
                <TextInput
                  style={styles.input}
                  value={labProfile.nablCertNumber}
                  onChangeText={(t) => setLabProfile(p => ({ ...p, nablCertNumber: t }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Valid Upto</Text>
                <TextInput
                  style={styles.input}
                  value={labProfile.nablExpiry}
                  onChangeText={(t) => setLabProfile(p => ({ ...p, nablExpiry: t }))}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ISO Certification Standard</Text>
                <TextInput
                  style={styles.input}
                  value={labProfile.isoCert}
                  onChangeText={(t) => setLabProfile(p => ({ ...p, isoCert: t }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ICMR Approval Code</Text>
                <TextInput
                  style={styles.input}
                  value={labProfile.icmrReg}
                  onChangeText={(t) => setLabProfile(p => ({ ...p, icmrReg: t }))}
                />
              </View>
            </View>

            <Text style={styles.label}>Lead Pathologist & Signatory</Text>
            <TextInput
              style={styles.input}
              value={labProfile.leadPathologist}
              onChangeText={(t) => setLabProfile(p => ({ ...p, leadPathologist: t }))}
            />
          </View>
        </View>

        {/* Automation & Dispatch Rules Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="git-network-outline" size={18} color={COLORS.navy} />
            <Text style={styles.cardTitle}>Operational Automation & Dispatch Rules</Text>
          </View>

          <View style={styles.switchList}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Auto-Dispatch Phlebotomist Fleet</Text>
                <Text style={styles.switchDesc}>Automatically matches closest phlebotomist with cold carrier in zone.</Text>
              </View>
              <Switch
                value={toggles.autoAssignPhlebotomist}
                onValueChange={() => handleToggle("autoAssignPhlebotomist")}
                trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
                thumbColor={toggles.autoAssignPhlebotomist ? COLORS.teal : COLORS.slateLight}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>WhatsApp Digital Report Dispatch</Text>
                <Text style={styles.switchDesc}>Dispatches NABL PDF directly to patient WhatsApp upon pathologist verification.</Text>
              </View>
              <Switch
                value={toggles.whatsappReportDispatch}
                onValueChange={() => handleToggle("whatsappReportDispatch")}
                trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
                thumbColor={toggles.whatsappReportDispatch ? COLORS.teal : COLORS.slateLight}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Critical Alert Notification</Text>
                <Text style={styles.switchDesc}>Immediate SMS and duty doctor alert when out-of-range panic values occur.</Text>
              </View>
              <Switch
                value={toggles.criticalValueCallAlert}
                onValueChange={() => handleToggle("criticalValueCallAlert")}
                trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
                thumbColor={toggles.criticalValueCallAlert ? COLORS.teal : COLORS.slateLight}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Cold-Chain Sensor Breach Alert (2°C - 8°C)</Text>
                <Text style={styles.switchDesc}>Alerts accessioning desk if specimen carrier exceeds 8°C during transit.</Text>
              </View>
              <Switch
                value={toggles.temperatureColdChainAlert}
                onValueChange={() => handleToggle("temperatureColdChainAlert")}
                trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
                thumbColor={toggles.temperatureColdChainAlert ? COLORS.teal : COLORS.slateLight}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  content: {
    padding: 20,
    gap: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexWrap: "wrap",
    gap: 12
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  card: {
    flex: 1,
    minWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 14
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  formGroup: {
    gap: 10
  },
  formRow: {
    flexDirection: "row",
    gap: 10
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate,
    marginBottom: 4
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navy
  },
  switchList: {
    gap: 14
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  switchDesc: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1,
    lineHeight: 14
  }
});
