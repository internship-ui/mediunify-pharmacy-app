// MediUnify Lab Sample Management Screen
import React, { useState, useMemo } from "react";
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
import { useLab, SAMPLE_STATUSES } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";

export function LabSampleManagementScreen({ onSelectOrder }) {
  const {
    orders,
    staff,
    centers,
    activeCenterId,
    markSampleCollected,
    markSampleReceived,
    rejectSample
  } = useLab();

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("ALL");
  const [selectedCenterFilter, setSelectedCenterFilter] = useState("ALL");

  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState(null); // { orderId, sampleId }
  const [rejectReason, setRejectReason] = useState("Hemolysed sample");
  const [rejectNotes, setRejectNotes] = useState("");

  // Flatten all samples from all orders
  const allSamples = useMemo(() => {
    const list = [];
    orders.forEach(order => {
      (order.samples || []).forEach(sample => {
        list.push({
          ...sample,
          orderId: order.id,
          patientName: order.patient?.name || "Patient",
          patientPhone: order.patient?.phone || "",
          orderBookingType: order.bookingType,
          orderTestTitle: order.itemTitle,
          orderCenterName: order.centerName,
          orderCenterId: order.centerId
        });
      });
    });
    return list;
  }, [orders]);

  const filteredSamples = useMemo(() => {
    return allSamples.filter(s => {
      if (activeCenterId !== "ALL" && s.orderCenterId !== activeCenterId) return false;
      if (selectedCenterFilter !== "ALL" && s.orderCenterId !== selectedCenterFilter) return false;
      if (selectedStatus !== "ALL" && s.sampleStatus !== selectedStatus) return false;
      if (selectedStaffFilter !== "ALL" && !s.collectionStaff.includes(selectedStaffFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSampleId = s.sampleId.toLowerCase().includes(q);
        const matchOrderId = s.orderId.toLowerCase().includes(q);
        const matchPatient = s.patientName.toLowerCase().includes(q);
        const matchBarcode = s.barcode?.toLowerCase().includes(q);
        const matchType = s.sampleType.toLowerCase().includes(q);
        if (!matchSampleId && !matchOrderId && !matchPatient && !matchBarcode && !matchType) return false;
      }
      return true;
    });
  }, [allSamples, activeCenterId, selectedCenterFilter, selectedStatus, selectedStaffFilter, searchQuery]);

  const handleConfirmRejection = () => {
    if (rejectModal) {
      rejectSample(rejectModal.orderId, rejectModal.sampleId, rejectReason, rejectNotes);
      setRejectModal(null);
      setRejectNotes("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="color-fill" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Physical Sample & Specimen Management</Text>
            <Text style={styles.topSub}>Cold-Chain Logistics & Accessioning Tracking · {allSamples.length} Active Specimens</Text>
          </View>
        </View>

        <Pressable
          style={styles.scanBtn}
          onPress={() => Alert.alert("Barcode Accessioning", "Accessioning scanner connected. Ready to scan sample tubes.")}
        >
          <Ionicons name="barcode-outline" size={16} color={COLORS.navy} />
          <Text style={styles.scanBtnText}>Scan Accession Barcode</Text>
        </Pressable>
      </View>

      {/* Status Tabs Bar */}
      <View style={styles.statusTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScroll}>
          <Pressable
            style={[styles.statusTabBtn, selectedStatus === "ALL" && styles.statusTabBtnActive]}
            onPress={() => setSelectedStatus("ALL")}
          >
            <Text style={[styles.statusTabText, selectedStatus === "ALL" && styles.statusTabTextActive]}>
              All Samples ({allSamples.length})
            </Text>
          </Pressable>
          {SAMPLE_STATUSES.map(st => {
            const count = allSamples.filter(s => s.sampleStatus === st).length;
            return (
              <Pressable
                key={st}
                style={[styles.statusTabBtn, selectedStatus === st && styles.statusTabBtnActive]}
                onPress={() => setSelectedStatus(st)}
              >
                <Text style={[styles.statusTabText, selectedStatus === st && styles.statusTabTextActive]}>
                  {st}
                </Text>
                <View style={[styles.statusTabBadge, selectedStatus === st && styles.statusTabBadgeActive]}>
                  <Text style={[styles.statusTabBadgeText, selectedStatus === st && styles.statusTabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sample ID, order ID, barcode, patient name, tube type..."
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
      </View>

      {/* Samples Table */}
      <ScrollView style={styles.tableScroll} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1.2 }]}>SAMPLE ID</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>ORDER ID</Text>
            <Text style={[styles.th, { flex: 2 }]}>PATIENT</Text>
            <Text style={[styles.th, { flex: 2.2 }]}>SPECIMEN & TUBE TYPE</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>BARCODE</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>COLLECTION STAFF</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>COLLECTION TIME</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1.6, textAlign: "right" }]}>ACTIONS</Text>
          </View>

          {filteredSamples.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="color-fill-outline" size={36} color={COLORS.slateLight} />
              <Text style={styles.emptyTitle}>No matching specimens found</Text>
              <Text style={styles.emptySub}>All physical samples match current filters.</Text>
            </View>
          ) : (
            filteredSamples.map((sample, idx) => (
              <View key={`${sample.orderId}-${sample.sampleId}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                {/* Sample ID */}
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.sampleIdText}>{sample.sampleId}</Text>
                </View>

                {/* Order ID */}
                <View style={{ flex: 1.2 }}>
                  <Pressable onPress={() => onSelectOrder && onSelectOrder(sample.orderId)}>
                    <Text style={styles.orderIdLink}>{sample.orderId}</Text>
                  </Pressable>
                </View>

                {/* Patient */}
                <View style={{ flex: 2 }}>
                  <Text style={styles.patientName}>{sample.patientName}</Text>
                  <Text style={styles.patientPhone}>{sample.patientPhone}</Text>
                </View>

                {/* Specimen & Tube */}
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.sampleType}>{sample.sampleType}</Text>
                  <Text style={styles.sampleTube} numberOfLines={1}>{sample.tubeContainer}</Text>
                </View>

                {/* Barcode */}
                <View style={{ flex: 1.4 }}>
                  <View style={styles.barcodeBox}>
                    <Ionicons name="barcode-outline" size={12} color={COLORS.navy} />
                    <Text style={styles.barcodeText}>{sample.barcode || "BAR-8801"}</Text>
                  </View>
                </View>

                {/* Collection Staff */}
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.staffText}>{sample.collectionStaff}</Text>
                </View>

                {/* Collection Time */}
                <View style={{ flex: 1.4 }}>
                  <Text style={styles.timeText}>{sample.collectionTime}</Text>
                  <Text style={styles.tempText}>{sample.temperature || "2-8°C"}</Text>
                </View>

                {/* Status */}
                <View style={{ flex: 1.6 }}>
                  <LabStatusBadge status={sample.sampleStatus} size="small" />
                  {sample.rejectionReason && (
                    <Text style={styles.rejectReasonSnippet} numberOfLines={1}>
                      Reason: {sample.rejectionReason}
                    </Text>
                  )}
                </View>

                {/* Actions */}
                <View style={{ flex: 1.6, flexDirection: "row", justifyContent: "flex-end", gap: 6, alignItems: "center" }}>
                  {sample.sampleStatus === "ASSIGNED" && (
                    <Pressable
                      style={[styles.miniActionBtn, styles.collectBtn]}
                      onPress={() => markSampleCollected(sample.orderId, sample.sampleId)}
                    >
                      <Ionicons name="checkmark" size={12} color={COLORS.white} />
                      <Text style={styles.miniActionBtnText}>Collected</Text>
                    </Pressable>
                  )}

                  {sample.sampleStatus === "COLLECTED" && (
                    <Pressable
                      style={[styles.miniActionBtn, styles.receiveBtn]}
                      onPress={() => markSampleReceived(sample.orderId, sample.sampleId)}
                    >
                      <Ionicons name="cube-outline" size={12} color={COLORS.white} />
                      <Text style={styles.miniActionBtnText}>Receive</Text>
                    </Pressable>
                  )}

                  {sample.sampleStatus !== "REJECTED" && sample.sampleStatus !== "COMPLETED" && (
                    <Pressable
                      style={[styles.miniActionBtn, styles.rejectBtn]}
                      onPress={() => setRejectModal({ orderId: sample.orderId, sampleId: sample.sampleId })}
                    >
                      <Ionicons name="close" size={12} color="#DC2626" />
                      <Text style={[styles.miniActionBtnText, { color: "#DC2626" }]}>Reject</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.iconViewBtn}
                    onPress={() => onSelectOrder && onSelectOrder(sample.orderId)}
                  >
                    <Ionicons name="chevron-forward" size={14} color={COLORS.navy} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Reject Specimen Modal */}
      {rejectModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="warning" size={18} color="#DC2626" />
                <Text style={styles.modalTitle}>Reject Specimen ({rejectModal.sampleId})</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>NABL Standard Rejection Reason</Text>
                {[
                  "Insufficient sample quantity (QNS)",
                  "Wrong container / tube used",
                  "Hemolysed sample",
                  "Leakage during transit",
                  "Improper collection / Clotted EDTA",
                  "Missing barcode label",
                  "Other"
                ].map(r => (
                  <Pressable
                    key={r}
                    style={[styles.reasonOption, rejectReason === r && styles.reasonOptionSelected]}
                    onPress={() => setRejectReason(r)}
                  >
                    <Ionicons
                      name={rejectReason === r ? "radio-button-on" : "radio-button-off"}
                      size={16}
                      color={rejectReason === r ? "#DC2626" : COLORS.slate}
                    />
                    <Text style={[styles.reasonText, rejectReason === r && styles.reasonTextSelected]}>{r}</Text>
                  </Pressable>
                ))}

                <Text style={[styles.inputLabel, { marginTop: 8 }]}>Corrective Action / Phlebotomist Notes</Text>
                <TextInput
                  style={styles.textInput}
                  value={rejectNotes}
                  onChangeText={setRejectNotes}
                  placeholder="e.g. Recollection scheduled for tomorrow 7:00 AM"
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setRejectModal(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalConfirmBtn} onPress={handleConfirmRejection}>
                  <Text style={styles.modalConfirmBtnText}>Confirm Rejection</Text>
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
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  statusTabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  statusTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8
  },
  statusTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  statusTabBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  statusTabTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  statusTabBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  statusTabBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  statusTabBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slate
  },
  statusTabBadgeTextActive: {
    color: COLORS.white
  },
  filterBar: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  searchWrap: {
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
  tableScroll: {
    flex: 1
  },
  tableContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden"
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  th: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA"
  },
  sampleIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  orderIdLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  patientName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  patientPhone: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  sampleType: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy
  },
  sampleTube: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  barcodeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  barcodeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy
  },
  staffText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  timeText: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: "600"
  },
  tempText: {
    fontSize: 9,
    color: COLORS.teal,
    fontWeight: "700"
  },
  rejectReasonSnippet: {
    fontSize: 9,
    color: "#DC2626",
    marginTop: 2
  },
  miniActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4
  },
  collectBtn: {
    backgroundColor: COLORS.teal
  },
  receiveBtn: {
    backgroundColor: COLORS.navy
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  miniActionBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white
  },
  iconViewBtn: {
    padding: 4
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.navy
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.slate
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
    maxWidth: 500,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 8
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626"
  },
  modalBody: {
    gap: 8
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  reasonOptionSelected: {
    backgroundColor: "#FEF2F2"
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.navy
  },
  reasonTextSelected: {
    fontWeight: "700",
    color: "#DC2626"
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 10
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
  modalConfirmBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalConfirmBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  }
});
