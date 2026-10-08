// MediUnify Lab Admin - Home Phlebotomy Collection & Field Logistics
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import LabBadge from "./LabBadge";

export function LabHomeCollectionScreen({ onSelectOrder }) {
  const {
    orders,
    staff,
    assignStaffToOrder,
    markSampleCollected,
    markSampleReceived
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");
  const [slotFilter, setSlotFilter] = useState("ALL");
  const [selectedHomeOrder, setSelectedHomeOrder] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Status Modal form state
  const [statusForm, setStatusForm] = useState({
    targetStatus: "COLLECTED",
    temperature: "Cold-chain (4.2°C)",
    notes: "Venipuncture completed smoothly without hemolysis."
  });

  // Filter only Home Collection orders
  const homeOrders = useMemo(() => {
    return orders.filter(o => o.type === "Home Collection" || o.address);
  }, [orders]);

  const filteredHomeOrders = useMemo(() => {
    return homeOrders.filter(o => {
      const matchSearch =
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.patient.phone.includes(searchQuery) ||
        (o.address && o.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusTab === "ALL" ||
        (statusTab === "SCHEDULED" && (o.orderStatus === "VERIFIED" || o.orderStatus === "COLLECTION SCHEDULED" || o.orderStatus === "NEW")) ||
        (statusTab === "COLLECTED" && o.orderStatus === "SAMPLE COLLECTED") ||
        (statusTab === "TRANSIT_RECEIVED" && (o.orderStatus === "SAMPLE RECEIVED" || o.orderStatus === "PROCESSING")) ||
        (statusTab === "COMPLETED" && (o.orderStatus === "COMPLETED" || o.orderStatus === "VERIFIED REPORT" || o.orderStatus === "REPORT READY"));

      const slot = o.collectionSchedule?.timeSlot || "";
      const matchSlot =
        slotFilter === "ALL" ||
        (slotFilter === "MORNING" && (slot.includes("06") || slot.includes("07") || slot.includes("08") || slot.includes("09") || slot.toLowerCase().includes("morning"))) ||
        (slotFilter === "MIDDAY" && (slot.includes("10") || slot.includes("11") || slot.includes("12") || slot.toLowerCase().includes("afternoon")));

      return matchSearch && matchStatus && matchSlot;
    });
  }, [homeOrders, searchQuery, statusTab, slotFilter]);

  // Top metrics
  const totalHomeCount = homeOrders.length;
  const scheduledCount = homeOrders.filter(o => o.orderStatus === "VERIFIED" || o.orderStatus === "COLLECTION SCHEDULED" || o.orderStatus === "NEW").length;
  const collectedCount = homeOrders.filter(o => o.orderStatus === "SAMPLE COLLECTED").length;
  const completedCount = homeOrders.filter(o => o.orderStatus === "COMPLETED" || o.orderStatus === "VERIFIED REPORT" || o.orderStatus === "REPORT READY" || o.orderStatus === "SAMPLE RECEIVED" || o.orderStatus === "PROCESSING").length;
  const availablePhlebos = staff.filter(s => s.availability === "AVAILABLE").length;

  const handleAssignPhlebotomist = (staffMember) => {
    if (!selectedHomeOrder) return;
    assignStaffToOrder(selectedHomeOrder.id, staffMember.id);
    setIsAssignModalOpen(false);
    setSelectedHomeOrder(null);
  };

  const handleUpdateStatusSubmit = () => {
    if (!selectedHomeOrder) return;
    if (statusForm.targetStatus === "COLLECTED") {
      markSampleCollected(selectedHomeOrder.id, null, {
        temperature: statusForm.temperature,
        notes: statusForm.notes
      });
    } else if (statusForm.targetStatus === "RECEIVED") {
      markSampleReceived(selectedHomeOrder.id, null, {
        notes: statusForm.notes
      });
    }
    setIsStatusModalOpen(false);
    setSelectedHomeOrder(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Field Logistics KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="bicycle" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{totalHomeCount}</Text>
            <Text style={styles.kpiLabel}>Today's Home Visits</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="time" size={20} color="#D97706" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{scheduledCount}</Text>
            <Text style={styles.kpiLabel}>Pending / Scheduled</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F0FDFA" }]}>
            <Ionicons name="color-fill" size={20} color={COLORS.teal} />
          </View>
          <View>
            <Text style={styles.kpiValue}>{collectedCount}</Text>
            <Text style={styles.kpiLabel}>Collected / In Transit</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{completedCount}</Text>
            <Text style={styles.kpiLabel}>Delivered to Lab</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F5F3FF" }]}>
            <Ionicons name="people" size={20} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{availablePhlebos} Available</Text>
            <Text style={styles.kpiLabel}>Field Phlebotomists</Text>
          </View>
        </View>
      </View>

      {/* Control Bar: Search & Filters */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search home visits by patient name, phone, address, or order #..."
            placeholderTextColor={COLORS.slate}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>

        {/* Status Tabs */}
        <View style={styles.filterPills}>
          {[
            { key: "ALL", label: "All Visits" },
            { key: "SCHEDULED", label: "Scheduled" },
            { key: "COLLECTED", label: "Collected" },
            { key: "TRANSIT_RECEIVED", label: "Hub In-Transit" },
            { key: "COMPLETED", label: "Completed" }
          ].map(tab => (
            <Pressable
              key={tab.key}
              style={[
                styles.filterPill,
                statusTab === tab.key && styles.filterPillActive
              ]}
              onPress={() => setStatusTab(tab.key)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusTab === tab.key && styles.filterPillTextActive
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Slot Filter */}
        <View style={styles.slotDropdown}>
          {["ALL", "MORNING", "MIDDAY"].map(s => (
            <Pressable
              key={s}
              style={[styles.slotPill, slotFilter === s && styles.slotPillActive]}
              onPress={() => setSlotFilter(s)}
            >
              <Text style={[styles.slotPillText, slotFilter === s && styles.slotPillTextActive]}>
                {s === "ALL" ? "All Slots" : s === "MORNING" ? "06:00 - 09:00 AM" : "09:00 - 12:00 PM"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Home Collection Bookings List */}
      <View style={styles.bookingsContainer}>
        {filteredHomeOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bicycle-outline" size={48} color={COLORS.slate} />
            <Text style={styles.emptyTitle}>No Home Visits Found</Text>
            <Text style={styles.emptySub}>No home phlebotomy visits match your active search or filters.</Text>
          </View>
        ) : (
          filteredHomeOrders.map(order => {
            const hasPhlebo = Boolean(order.assignedStaff);
            const isFasting = (order.preparation || "").toLowerCase().includes("fasting") || order.items?.some(i => (i.preparation || "").toLowerCase().includes("fasting"));

            return (
              <View key={order.id} style={styles.bookingCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={styles.orderIdBadge}>
                      <Text style={styles.orderIdText}>{order.id}</Text>
                    </View>
                    <View style={styles.slotBadge}>
                      <Ionicons name="time-outline" size={13} color="#2563EB" />
                      <Text style={styles.slotBadgeText}>
                        {order.collectionSchedule?.timeSlot || "07:00 AM - 08:00 AM"}
                      </Text>
                    </View>
                    {isFasting && (
                      <View style={styles.fastingBadge}>
                        <Ionicons name="alert-circle" size={13} color="#D97706" />
                        <Text style={styles.fastingBadgeText}>10-12 Hrs Fasting</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <LabBadge status={order.orderStatus} />
                    <Pressable
                      style={styles.drawerTriggerBtn}
                      onPress={() => onSelectOrder && onSelectOrder(order.id)}
                    >
                      <Ionicons name="open-outline" size={16} color={COLORS.navy} />
                    </Pressable>
                  </View>
                </View>

                {/* Patient & Address Info */}
                <View style={styles.cardBody}>
                  <View style={styles.patientSection}>
                    <View style={styles.patientAvatar}>
                      <Ionicons name="person" size={16} color={COLORS.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.patientName}>{order.patient.name}</Text>
                      <Text style={styles.patientDetails}>
                        {order.patient.age} Yrs • {order.patient.gender} • {order.patient.phone}
                      </Text>
                      <View style={styles.addressRow}>
                        <Ionicons name="location" size={14} color="#E11D48" />
                        <Text style={styles.addressText} numberOfLines={2}>
                          {order.address || order.patient.address || "Saraswathipuram, Mysuru"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Investigation Items & Tubes Box */}
                  <View style={styles.testsBox}>
                    <Text style={styles.testsBoxTitle}>Diagnostic Investigations Ordered:</Text>
                    <View style={styles.testTagsRow}>
                      {(order.items || []).map((item, idx) => (
                        <View key={idx} style={styles.testTag}>
                          <Text style={styles.testTagText}>{item.name}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Specimen Tubes Required */}
                    <View style={styles.tubesRow}>
                      <Text style={styles.tubesTitle}>Required Specimen Tubes:</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {(order.samples || [
                          { tubeType: "EDTA Tube (Purple Top)", color: "#7C3AED" },
                          { tubeType: "SST Gel Tube (Yellow Top)", color: "#D97706" }
                        ]).map((s, idx) => (
                          <View key={idx} style={styles.tubePill}>
                            <View style={[styles.tubeDot, { backgroundColor: s.color || "#2563EB" }]} />
                            <Text style={styles.tubePillText}>{s.tubeType || "Specimen Tube"}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Phlebotomist Assignment Box */}
                  <View style={styles.phleboBox}>
                    <View style={styles.phleboHeader}>
                      <Text style={styles.phleboTitle}>Assigned Field Phlebotomist</Text>
                      <Pressable
                        style={styles.reassignBtn}
                        onPress={() => {
                          setSelectedHomeOrder(order);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        <Ionicons name="swap-horizontal" size={13} color={COLORS.teal} />
                        <Text style={styles.reassignBtnText}>{hasPhlebo ? "Change Phlebotomist" : "Assign Phlebotomist"}</Text>
                      </Pressable>
                    </View>

                    {hasPhlebo ? (
                      <View style={styles.phleboDetailsRow}>
                        <View style={styles.phleboAvatar}>
                          <Ionicons name="bicycle" size={16} color={COLORS.teal} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.phleboName}>{order.assignedStaff.name}</Text>
                          <Text style={styles.phleboSub}>
                            {order.assignedStaff.phone} • {order.assignedStaff.vehicleType || "Two-Wheeler (Cold Box)"}
                          </Text>
                        </View>
                        <View style={styles.tempBadge}>
                          <Ionicons name="thermometer" size={13} color="#059669" />
                          <Text style={styles.tempBadgeText}>Cold Box: 4.2°C</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.unassignedBox}>
                        <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
                        <Text style={styles.unassignedText}>No phlebotomist assigned yet for this slot.</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Footer Operational Action Buttons */}
                <View style={styles.cardFooter}>
                  <Pressable
                    style={styles.footerActionBtn}
                    onPress={() => {
                      setSelectedHomeOrder(order);
                      setIsBarcodeModalOpen(true);
                    }}
                  >
                    <Ionicons name="barcode-outline" size={15} color={COLORS.navy} />
                    <Text style={styles.footerActionBtnText}>Barcode Labels</Text>
                  </Pressable>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {order.orderStatus !== "SAMPLE COLLECTED" && order.orderStatus !== "SAMPLE RECEIVED" && order.orderStatus !== "COMPLETED" && (
                      <Pressable
                        style={styles.collectBtn}
                        onPress={() => {
                          setSelectedHomeOrder(order);
                          setStatusForm({
                            targetStatus: "COLLECTED",
                            temperature: "Cold-chain (4.2°C)",
                            notes: "Venipuncture completed at home residence."
                          });
                          setIsStatusModalOpen(true);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={15} color={COLORS.white} />
                        <Text style={styles.collectBtnText}>Mark Collected</Text>
                      </Pressable>
                    )}

                    {order.orderStatus === "SAMPLE COLLECTED" && (
                      <Pressable
                        style={styles.receiveAtHubBtn}
                        onPress={() => {
                          setSelectedHomeOrder(order);
                          setStatusForm({
                            targetStatus: "RECEIVED",
                            temperature: "Cold-chain Verified (3.8°C)",
                            notes: "Specimen tubes received at Central Diagnostic Hub."
                          });
                          setIsStatusModalOpen(true);
                        }}
                      >
                        <Ionicons name="business" size={15} color={COLORS.white} />
                        <Text style={styles.receiveAtHubBtnText}>Receive at Hub</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* MODAL: Assign / Reassign Phlebotomist (Centered Modal) */}
      {isAssignModalOpen && selectedHomeOrder && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Assign Phlebotomist</Text>
                  <Text style={styles.modalSubtitle}>Order {selectedHomeOrder.id} • {selectedHomeOrder.patient.name}</Text>
                </View>
                <Pressable onPress={() => setIsAssignModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 380, padding: 16 }} showsVerticalScrollIndicator={false}>
                {staff.map(member => (
                  <Pressable
                    key={member.id}
                    style={styles.staffSelectRow}
                    onPress={() => handleAssignPhlebotomist(member)}
                  >
                    <View style={styles.staffAvatar}>
                      <Ionicons name="bicycle" size={18} color={COLORS.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.staffNameText}>{member.name}</Text>
                        <View style={[
                          styles.availPill,
                          member.availability === "AVAILABLE" ? styles.availPillGreen : styles.availPillYellow
                        ]}>
                          <Text style={[
                            styles.availPillText,
                            member.availability === "AVAILABLE" ? styles.availPillTextGreen : styles.availPillTextYellow
                          ]}>
                            {member.availability}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.staffSubText}>
                        {member.phone} • {member.serviceArea} • {member.todayAssignments} Trips Today
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.slate} />
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAssignModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Update Visit Status / Log Collection (Centered Modal) */}
      {isStatusModalOpen && selectedHomeOrder && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {statusForm.targetStatus === "COLLECTED" ? "Log Specimen Collection" : "Receive Specimen at Diagnostic Hub"}
                </Text>
                <Pressable onPress={() => setIsStatusModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.infoAlert}>
                  <Ionicons name="information-circle" size={18} color={COLORS.teal} />
                  <Text style={styles.infoAlertText}>
                    Order {selectedHomeOrder.id}: {selectedHomeOrder.patient.name} ({selectedHomeOrder.patient.phone})
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Cold-Chain Temperature Log</Text>
                  <TextInput
                    style={styles.textInput}
                    value={statusForm.temperature}
                    onChangeText={val => setStatusForm({ ...statusForm, temperature: val })}
                    placeholder="e.g. Cold-chain (4.2°C)"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Phlebotomist Notes / Observations</Text>
                  <TextInput
                    style={[styles.textInput, { height: 64 }]}
                    multiline
                    value={statusForm.notes}
                    onChangeText={val => setStatusForm({ ...statusForm, notes: val })}
                    placeholder="Enter venipuncture condition, patient tolerance..."
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsStatusModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleUpdateStatusSubmit}>
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Confirm Status Update</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Barcode Labels Generator (Centered Modal) */}
      {isBarcodeModalOpen && selectedHomeOrder && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxWidth: 540 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Specimen Tube Barcode Labels</Text>
                  <Text style={styles.modalSubtitle}>{selectedHomeOrder.id} • {selectedHomeOrder.patient.name}</Text>
                </View>
                <Pressable onPress={() => setIsBarcodeModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 400, padding: 20 }} showsVerticalScrollIndicator={false}>
                {(selectedHomeOrder.samples || [
                  { sampleId: "SMP-1001-1", tubeType: "EDTA Purple", barcode: "BC-1001-EDTA" },
                  { sampleId: "SMP-1001-2", tubeType: "SST Gel Yellow", barcode: "BC-1001-SST" }
                ]).map((sample, idx) => (
                  <View key={idx} style={styles.barcodeLabelCard}>
                    <View style={styles.labelTop}>
                      <Text style={styles.labelLabName}>MEDIUNIFY DIAGNOSTICS</Text>
                      <Text style={styles.labelTubeType}>{sample.tubeType}</Text>
                    </View>
                    <View style={styles.labelBarcodeBox}>
                      <Ionicons name="barcode-outline" size={40} color={COLORS.navy} />
                      <Text style={styles.barcodeNum}>{sample.barcode || `BC-${selectedHomeOrder.id.slice(4)}-0${idx + 1}`}</Text>
                    </View>
                    <View style={styles.labelBottom}>
                      <Text style={styles.labelPatient}>{selectedHomeOrder.patient.name} ({selectedHomeOrder.patient.age}Y/{selectedHomeOrder.patient.gender?.charAt(0)})</Text>
                      <Text style={styles.labelDate}>01-OCT-2026</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsBarcodeModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Close</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSaveBtn}
                  onPress={() => {
                    alert("Labels sent to portable Zebra barcode printer.");
                    setIsBarcodeModalOpen(false);
                  }}
                >
                  <Ionicons name="print-outline" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Print Barcode Labels</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  kpiRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  kpiIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.navy
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    height: 40,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.navy
  },
  filterPills: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    gap: 4
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  filterPillActive: {
    backgroundColor: COLORS.teal
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate
  },
  filterPillTextActive: {
    color: COLORS.white
  },
  slotDropdown: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
    gap: 4
  },
  slotPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  slotPillActive: {
    backgroundColor: COLORS.white
  },
  slotPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  slotPillTextActive: {
    color: COLORS.navy
  },
  bookingsContainer: {
    gap: 16,
    paddingBottom: 40
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  orderIdBadge: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  },
  slotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB"
  },
  fastingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  fastingBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706"
  },
  drawerTriggerBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  cardBody: {
    padding: 16,
    gap: 14
  },
  patientSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center"
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy
  },
  patientDetails: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4
  },
  addressText: {
    fontSize: 12,
    color: COLORS.navy,
    flex: 1
  },
  testsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  testsBoxTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  testTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  testTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  testTagText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "500"
  },
  tubesRow: {
    marginTop: 4,
    gap: 6
  },
  tubesTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  tubePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  tubeDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  tubePillText: {
    fontSize: 11,
    color: COLORS.navy
  },
  phleboBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12
  },
  phleboHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  phleboTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  reassignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  reassignBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.teal
  },
  phleboDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  phleboAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center"
  },
  phleboName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.navy
  },
  phleboSub: {
    fontSize: 11,
    color: COLORS.slate
  },
  tempBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  tempBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669"
  },
  unassignedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4
  },
  unassignedText: {
    fontSize: 12,
    color: "#D97706"
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#F8FAFC"
  },
  footerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  footerActionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy
  },
  collectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  collectBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white
  },
  receiveAtHubBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  receiveAtHubBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.slate
  },
  // Modal Styles (Centered)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#F8FAFC"
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.navy
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center"
  },
  modalBody: {
    padding: 20
  },
  infoAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDFA",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16
  },
  infoAlertText: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: "600"
  },
  formGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: 6
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.navy,
    backgroundColor: COLORS.white
  },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#F8FAFC"
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.slate
  },
  modalSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white
  },
  staffSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  staffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center"
  },
  staffNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.navy
  },
  availPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  availPillGreen: {
    backgroundColor: "#ECFDF5"
  },
  availPillYellow: {
    backgroundColor: "#FEF3C7"
  },
  availPillText: {
    fontSize: 10,
    fontWeight: "700"
  },
  availPillTextGreen: {
    color: "#059669"
  },
  availPillTextYellow: {
    color: "#D97706"
  },
  staffSubText: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  barcodeLabelCard: {
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    marginBottom: 12
  },
  labelTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    marginBottom: 6
  },
  labelLabName: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  labelTubeType: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  labelBarcodeBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4
  },
  barcodeNum: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
    letterSpacing: 1.5,
    marginTop: 2
  },
  labelBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 4,
    marginTop: 4
  },
  labelPatient: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  labelDate: {
    fontSize: 10,
    color: COLORS.slate
  }
});
