// MediUnify Lab Collection Staff / Phlebotomists Management Screen
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

export function LabCollectionStaffScreen({ onSelectOrder }) {
  const {
    staff,
    orders,
    addStaff,
    updateStaff,
    toggleStaffAvailability,
    toggleStaffStatus
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("ALL");

  // Modals
  const [viewStaffModal, setViewStaffModal] = useState(null); // staff object
  const [editStaffModal, setEditStaffModal] = useState(null); // 'add' or staff object

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "+91 ",
    email: "",
    serviceArea: "Mysuru Central",
    specialization: "Pediatric & Geriatric Venipuncture",
    experience: "3 Years",
    vehicleType: "Electric Scooter (Cold Box)",
    status: "Active"
  });

  const filteredStaff = staff.filter(s => {
    if (selectedAvailability !== "ALL" && s.availability !== selectedAvailability) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.staffId.toLowerCase().includes(q);
      const matchArea = s.serviceArea.toLowerCase().includes(q);
      const matchPhone = s.phone.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchArea && !matchPhone) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      phone: "+91 ",
      email: "",
      serviceArea: "Mysuru Central",
      specialization: "Routine & Difficult Vein Sampling",
      experience: "3 Years",
      vehicleType: "Electric Scooter (Cold Box)",
      status: "Active"
    });
    setEditStaffModal("add");
  };

  const handleOpenEdit = (s) => {
    setFormData({
      name: s.name,
      phone: s.phone,
      email: s.email,
      serviceArea: s.serviceArea,
      specialization: s.specialization,
      experience: s.experience,
      vehicleType: s.vehicleType,
      status: s.status
    });
    setEditStaffModal(s);
  };

  const handleSaveStaff = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert("Validation Error", "Please enter phlebotomist name and mobile number.");
      return;
    }

    if (editStaffModal === "add") {
      addStaff(formData);
    } else if (editStaffModal && editStaffModal.id) {
      updateStaff(editStaffModal.id, formData);
    }
    setEditStaffModal(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="bicycle" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Phlebotomists & Home Collection Staff</Text>
            <Text style={styles.topSub}>Fleet Roster · Cold-Chain Quality Assurance · {staff.length} Active Phlebotomists</Text>
          </View>
        </View>

        <Pressable style={styles.addStaffBtn} onPress={handleOpenAdd}>
          <Ionicons name="person-add" size={16} color={COLORS.white} />
          <Text style={styles.addStaffBtnText}>Onboard Phlebotomist</Text>
        </Pressable>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search phlebotomist name, ID, zone, mobile..."
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

        <View style={styles.availabilityChipsRow}>
          {["ALL", "AVAILABLE", "BUSY", "OFFLINE"].map(av => (
            <Pressable
              key={av}
              style={[styles.availChip, selectedAvailability === av && styles.availChipActive]}
              onPress={() => setSelectedAvailability(av)}
            >
              <Text style={[styles.availChipText, selectedAvailability === av && styles.availChipTextActive]}>
                {av === "ALL" ? "All Fleet" : av}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Staff Grid */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={styles.staffGrid}>
          {filteredStaff.map(s => {
            const assignedOrdersList = orders.filter(o => o.assignedStaff?.staffId === s.staffId || o.assignedStaff?.id === s.id);

            return (
              <View key={s.id} style={styles.staffCard}>
                <View style={styles.staffCardHeader}>
                  <View style={styles.staffAvatarWrap}>
                    <Ionicons name="person" size={22} color={COLORS.navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={styles.staffCardName}>{s.name}</Text>
                      <LabStatusBadge status={s.availability} size="small" />
                    </View>
                    <Text style={styles.staffCardId}>ID: {s.staffId} · {s.experience}</Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.staffDetailsBox}>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={13} color={COLORS.slate} />
                    <Text style={styles.detailTextBold}>{s.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.slate} />
                    <Text style={styles.detailText}>{s.serviceArea}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.teal} />
                    <Text style={styles.detailText}>{s.specialization}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cube-outline" size={13} color={COLORS.coral} />
                    <Text style={styles.detailText}>{s.vehicleType}</Text>
                  </View>
                </View>

                {/* Daily Workload Stats */}
                <View style={styles.statsStrip}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>ASSIGNED TODAY</Text>
                    <Text style={styles.statVal}>{s.todayAssignments}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>COMPLETED</Text>
                    <Text style={[styles.statVal, { color: COLORS.teal }]}>{s.completedCollections}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>RATING</Text>
                    <Text style={[styles.statVal, { color: "#D97706" }]}>{s.rating}★</Text>
                  </View>
                </View>

                {/* Availability Toggle Quick Controls */}
                <View style={styles.availabilityToggleRow}>
                  <Text style={styles.toggleLabel}>Status:</Text>
                  <View style={styles.toggleBtnGroup}>
                    {["AVAILABLE", "BUSY", "OFFLINE"].map(statusVal => (
                      <Pressable
                        key={statusVal}
                        style={[
                          styles.toggleBtn,
                          s.availability === statusVal && styles.toggleBtnActive
                        ]}
                        onPress={() => toggleStaffAvailability(s.id, statusVal)}
                      >
                        <Text style={[styles.toggleBtnText, s.availability === statusVal && styles.toggleBtnTextActive]}>
                          {statusVal.slice(0, 3)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.cardFooter}>
                  <Pressable
                    style={styles.viewTasksBtn}
                    onPress={() => setViewStaffModal(s)}
                  >
                    <Ionicons name="list-outline" size={14} color={COLORS.navy} />
                    <Text style={styles.viewTasksBtnText}>
                      View Tasks ({assignedOrdersList.length})
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(s)}
                  >
                    <Ionicons name="create-outline" size={15} color={COLORS.teal} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Staff Inspection & Assigned Orders Modal */}
      {viewStaffModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <View style={styles.staffAvatarWrap}>
                    <Ionicons name="person" size={20} color={COLORS.navy} />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{viewStaffModal.name} ({viewStaffModal.staffId})</Text>
                    <Text style={styles.modalSub}>{viewStaffModal.serviceArea} · {viewStaffModal.phone}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setViewStaffModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
                <View style={styles.staffDetailList}>
                  <Text style={styles.infoSectionTitle}>ASSIGNED HOME SAMPLE ORDERS TODAY:</Text>
                  {orders.filter(o => o.assignedStaff?.staffId === viewStaffModal.staffId || o.assignedStaff?.id === viewStaffModal.id).length === 0 ? (
                    <Text style={styles.emptyTasksText}>No active home collection orders currently assigned.</Text>
                  ) : (
                    orders
                      .filter(o => o.assignedStaff?.staffId === viewStaffModal.staffId || o.assignedStaff?.id === viewStaffModal.id)
                      .map(o => (
                        <Pressable
                          key={o.id}
                          style={styles.assignedOrderRow}
                          onPress={() => {
                            setViewStaffModal(null);
                            onSelectOrder && onSelectOrder(o.id);
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.assignedOrderTitle}>{o.id} · {o.patient.name}</Text>
                            <Text style={styles.assignedOrderAddress}>{o.patient.address}</Text>
                            <Text style={styles.assignedOrderTime}>Slot: {o.collectionSchedule?.timeSlot || "Scheduled"}</Text>
                          </View>
                          <LabStatusBadge status={o.orderStatus} size="small" />
                        </Pressable>
                      ))
                  )}
                </View>

                <View style={styles.coldChainBox}>
                  <Ionicons name="thermometer-outline" size={16} color={COLORS.teal} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coldChainTitle}>COLD-CHAIN CARRIER VERIFIED</Text>
                    <Text style={styles.coldChainText}>
                      Equipped with digital temperature logger box calibrated at 2°C - 8°C. Blood centrifuge kit carried.
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCloseBtn} onPress={() => setViewStaffModal(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Staff Modal */}
      {editStaffModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editStaffModal === "add" ? "Onboard New Phlebotomist" : `Edit Staff (${formData.name})`}
                </Text>
                <Pressable onPress={() => setEditStaffModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <View style={{ padding: 18, gap: 10 }}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(t) => setFormData(f => ({ ...f, name: t }))}
                  placeholder="e.g. Ramesh Nayak"
                />

                <Text style={styles.inputLabel}>Mobile Phone *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(t) => setFormData(f => ({ ...f, phone: t }))}
                  placeholder="+91 98450 12345"
                />

                <Text style={styles.inputLabel}>Primary Service Area / Zones</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.serviceArea}
                  onChangeText={(t) => setFormData(f => ({ ...f, serviceArea: t }))}
                  placeholder="e.g. Kuvempunagar & J.P. Nagar"
                />

                <Text style={styles.inputLabel}>Specialization</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.specialization}
                  onChangeText={(t) => setFormData(f => ({ ...f, specialization: t }))}
                  placeholder="e.g. Pediatric & Geriatric Venipuncture"
                />

                <Text style={styles.inputLabel}>Vehicle & Cold-Chain Box ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.vehicleType}
                  onChangeText={(t) => setFormData(f => ({ ...f, vehicleType: t }))}
                  placeholder="e.g. Electric Scooter (Cold Box #04)"
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditStaffModal(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSaveStaff}>
                  <Text style={styles.modalSaveBtnText}>Save Phlebotomist</Text>
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
  addStaffBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  addStaffBtnText: {
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
  availabilityChipsRow: {
    flexDirection: "row",
    gap: 6
  },
  availChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  availChipActive: {
    backgroundColor: COLORS.navy
  },
  availChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  availChipTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16
  },
  staffGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  staffCard: {
    width: "31.5%",
    minWidth: 300,
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
  staffCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  staffAvatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center"
  },
  staffCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  staffCardId: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  staffDetailsBox: {
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
  detailTextBold: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  detailText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  statsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 6
  },
  statCol: {
    alignItems: "center",
    flex: 1
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  statVal: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 1
  },
  availabilityToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  toggleBtnGroup: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    padding: 2
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  toggleBtnActive: {
    backgroundColor: COLORS.navy
  },
  toggleBtnText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.slate
  },
  toggleBtnTextActive: {
    color: COLORS.white
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10
  },
  viewTasksBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewTasksBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  editBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 6
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
    maxWidth: 540,
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
  staffDetailList: {
    gap: 8
  },
  infoSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  emptyTasksText: {
    fontSize: 11,
    color: COLORS.slate,
    fontStyle: "italic",
    paddingVertical: 8
  },
  assignedOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  assignedOrderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  assignedOrderAddress: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  assignedOrderTime: {
    fontSize: 10,
    color: COLORS.teal,
    fontWeight: "600",
    marginTop: 2
  },
  coldChainBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.tealLight,
    padding: 10,
    borderRadius: 8
  },
  coldChainTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal,
    marginBottom: 1
  },
  coldChainText: {
    fontSize: 10,
    color: COLORS.navy,
    lineHeight: 14
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
