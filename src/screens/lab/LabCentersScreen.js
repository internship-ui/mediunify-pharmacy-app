// MediUnify Lab Centers & Processing Hubs Screen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";

export function LabCentersScreen() {
  const { centers, addCenter, updateCenter, toggleCenterStatus } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");

  // Modals
  const [viewCenterModal, setViewCenterModal] = useState(null);
  const [editCenterModal, setEditCenterModal] = useState(null); // 'add' or center obj

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    centerCode: `MYS-CEN-${Math.floor(10 + Math.random() * 90)}`,
    type: "Diagnostic & Collection Hub",
    address: "",
    city: "Mysuru",
    contact: "+91 821 ",
    email: "",
    operatingHours: "06:30 AM - 08:30 PM",
    availableTestsCount: "75",
    collectionAvailability: "Walk-in & Home Collection Dispatch",
    hasEcG: true,
    hasUSG: false,
    status: "Active"
  });

  const filteredCenters = centers.filter(c => {
    if (selectedCity !== "ALL" && c.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCode = c.centerCode.toLowerCase().includes(q);
      const matchAddr = c.address.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchAddr) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      shortName: "",
      centerCode: `MYS-CEN-${Math.floor(10 + Math.random() * 90)}`,
      type: "Diagnostic & Collection Hub",
      address: "",
      city: "Mysuru",
      contact: "+91 821 ",
      email: "",
      operatingHours: "06:30 AM - 08:30 PM",
      availableTestsCount: "75",
      collectionAvailability: "Walk-in & Home Collection Dispatch",
      hasEcG: true,
      hasUSG: false,
      status: "Active"
    });
    setEditCenterModal("add");
  };

  const handleOpenEdit = (c) => {
    setFormData({
      name: c.name,
      shortName: c.shortName || c.name,
      centerCode: c.centerCode,
      type: c.type,
      address: c.address,
      city: c.city,
      contact: c.contact,
      email: c.email || "",
      operatingHours: c.operatingHours,
      availableTestsCount: String(c.availableTestsCount || 50),
      collectionAvailability: c.collectionAvailability,
      hasEcG: Boolean(c.hasEcG),
      hasUSG: Boolean(c.hasUSG),
      status: c.status
    });
    setEditCenterModal(c);
  };

  const handleSaveCenter = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      Alert.alert("Validation Error", "Please fill center name and physical address.");
      return;
    }

    if (editCenterModal === "add") {
      addCenter(formData);
    } else if (editCenterModal && editCenterModal.id) {
      updateCenter(editCenterModal.id, formData);
    }
    setEditCenterModal(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="business" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Lab Centers & Accessioning Points</Text>
            <Text style={styles.topSub}>Processing Hubs & Sample Drop Points · {centers.length} Facilities Active</Text>
          </View>
        </View>

        <Pressable style={styles.addCenterBtn} onPress={handleOpenAdd}>
          <Ionicons name="add-circle" size={16} color={COLORS.white} />
          <Text style={styles.addCenterBtnText}>Add Diagnostic Center</Text>
        </Pressable>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search diagnostic center, facility code, address..."
            placeholderTextColor={COLORS.slateLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.cityChipsRow}>
          {["ALL", "Mysuru", "Bengaluru"].map(city => (
            <Pressable
              key={city}
              style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                {city === "ALL" ? "All Cities" : city}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Center Grid */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerGrid}>
          {filteredCenters.map(c => (
            <View key={c.id} style={styles.centerCard}>
              <View style={styles.centerCardHeader}>
                <View style={styles.centerIconWrap}>
                  <Ionicons name="business" size={22} color={COLORS.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.centerCodeBadge}>{c.centerCode}</Text>
                    <LabStatusBadge status={c.status} size="small" />
                  </View>
                  <Text style={styles.centerName}>{c.name}</Text>
                  <Text style={styles.centerType}>{c.type}</Text>
                </View>
              </View>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.slate} />
                  <Text style={styles.detailText}>{c.address}, {c.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.teal} />
                  <Text style={styles.detailTextBold}>{c.operatingHours}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.detailText}>{c.contact}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="flask-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.detailText}>{c.collectionAvailability}</Text>
                </View>
              </View>

              {/* Accreditations & Facilities Badges */}
              <View style={styles.accWrap}>
                {(c.accreditations || ["NABL Accredited"]).map((acc, aIdx) => (
                  <View key={aIdx} style={styles.accBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#047857" />
                    <Text style={styles.accBadgeText}>{acc}</Text>
                  </View>
                ))}
                {c.hasEcG && (
                  <View style={[styles.accBadge, { backgroundColor: COLORS.navyLight, borderColor: "#BFDBFE" }]}>
                    <Text style={[styles.accBadgeText, { color: COLORS.navy }]}>12-Lead ECG</Text>
                  </View>
                )}
                {c.hasUSG && (
                  <View style={[styles.accBadge, { backgroundColor: COLORS.tealLight, borderColor: "#A7F3D0" }]}>
                    <Text style={[styles.accBadgeText, { color: COLORS.teal }]}>USG Sonography</Text>
                  </View>
                )}
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <Pressable style={styles.viewDetailsBtn} onPress={() => setViewCenterModal(c)}>
                  <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.viewDetailsBtnText}>Facility Details</Text>
                </Pressable>

                <View style={styles.actionIconsRow}>
                  <Pressable style={styles.iconBtn} onPress={() => handleOpenEdit(c)}>
                    <Ionicons name="create-outline" size={15} color={COLORS.teal} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, c.status === "Active" ? styles.disableBtn : styles.enableBtn]}
                    onPress={() => toggleCenterStatus(c.id)}
                  >
                    <Ionicons
                      name={c.status === "Active" ? "pause-outline" : "play-outline"}
                      size={14}
                      color={c.status === "Active" ? "#DC2626" : "#059669"}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* View Facility Modal */}
      {viewCenterModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Ionicons name="business" size={20} color={COLORS.teal} />
                  <View>
                    <Text style={styles.modalTitle}>{viewCenterModal.name}</Text>
                    <Text style={styles.modalSub}>Code: {viewCenterModal.centerCode} · {viewCenterModal.city}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setViewCenterModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 18, gap: 12 }}>
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>FACILITY TYPE</Text>
                    <Text style={styles.fieldVal}>{viewCenterModal.type}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>OPERATING HOURS</Text>
                    <Text style={styles.fieldValBold}>{viewCenterModal.operatingHours}</Text>
                  </View>
                  <View style={[styles.modalField, { width: "100%" }]}>
                    <Text style={styles.fieldLabel}>PHYSICAL ADDRESS</Text>
                    <Text style={styles.fieldVal}>{viewCenterModal.address}, {viewCenterModal.city} - {viewCenterModal.pincode}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>CONTACT TELEPHONE</Text>
                    <Text style={styles.fieldVal}>{viewCenterModal.contact}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>EMAIL CONTACT</Text>
                    <Text style={styles.fieldVal}>{viewCenterModal.email || "center@mediunify.in"}</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>TEST PROFILES RUN LOCALLY</Text>
                    <Text style={styles.fieldValBold}>{viewCenterModal.availableTestsCount || 75}+ Tests</Text>
                  </View>
                  <View style={styles.modalField}>
                    <Text style={styles.fieldLabel}>DISPATCH / WALK-IN</Text>
                    <Text style={styles.fieldVal}>{viewCenterModal.collectionAvailability}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCloseBtn} onPress={() => setViewCenterModal(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Center Modal */}
      {editCenterModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editCenterModal === "add" ? "Add New Diagnostic Center" : `Edit Facility (${formData.centerCode})`}
                </Text>
                <Pressable onPress={() => setEditCenterModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ padding: 18, gap: 10 }}>
                <Text style={styles.inputLabel}>Center Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(t) => setFormData(f => ({ ...f, name: t }))}
                  placeholder="e.g. Novus Diagnostic Center (Kuvempunagar)"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Center Code</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.centerCode}
                      onChangeText={(t) => setFormData(f => ({ ...f, centerCode: t }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.city}
                      onChangeText={(t) => setFormData(f => ({ ...f, city: t }))}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Address *</Text>
                <TextInput
                  style={[styles.textInput, { height: 50 }]}
                  value={formData.address}
                  onChangeText={(t) => setFormData(f => ({ ...f, address: t }))}
                  multiline
                  placeholder="Plot / Road, Area, Landmark"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Contact Phone</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.contact}
                      onChangeText={(t) => setFormData(f => ({ ...f, contact: t }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Operating Hours</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.operatingHours}
                      onChangeText={(t) => setFormData(f => ({ ...f, operatingHours: t }))}
                      placeholder="e.g. 06:30 AM - 08:30 PM"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditCenterModal(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSaveCenter}>
                  <Text style={styles.modalSaveBtnText}>Save Lab Center</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy
  },
  topSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  addCenterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  addCenterBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  filterBar: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10
  },
  searchWrap: {
    flex: 1,
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.navy
  },
  cityChipsRow: {
    flexDirection: "row",
    gap: 6
  },
  cityChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  cityChipActive: {
    backgroundColor: COLORS.navy
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  cityChipTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16
  },
  centerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  centerCard: {
    width: "48%",
    minWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12
  },
  centerCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  centerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center"
  },
  centerCodeBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  centerName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 3
  },
  centerType: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  detailsBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    gap: 6
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  detailText: {
    fontSize: 11,
    color: COLORS.navyMuted,
    flex: 1
  },
  detailTextBold: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy,
    flex: 1
  },
  accWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  accBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  accBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#047857"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewDetailsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  actionIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  iconBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 6
  },
  disableBtn: {
    backgroundColor: "#FEE2E2"
  },
  enableBtn: {
    backgroundColor: "#ECFDF5"
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  modalInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12
  },
  modalField: {
    width: "50%",
    paddingRight: 10
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  fieldVal: {
    fontSize: 12,
    color: COLORS.navyMuted
  },
  fieldValBold: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: "#F8FAFC"
  },
  modalCloseBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalCloseBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  formRow: {
    flexDirection: "row",
    gap: 10
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: COLORS.navy
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  modalSaveBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  }
});
