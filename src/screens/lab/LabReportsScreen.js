// MediUnify Lab Report Management & Verification Screen
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
import { useLab } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";
import { LabReportPreviewModal } from "./LabReportPreviewModal";

export function LabReportsScreen({ onSelectOrder }) {
  const {
    orders,
    uploadReport,
    verifyReport,
    rejectReport,
    sendReportToPatient
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [previewOrder, setPreviewOrder] = useState(null);
  const [isVerifyingMode, setIsVerifyingMode] = useState(false);
  const [uploadModalOrder, setUploadModalOrder] = useState(null);
  const [rejectReportModalOrder, setRejectReportModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("Values inconsistent with clinical history / QC flag");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Flatten reports list
  const reportsList = useMemo(() => {
    return orders
      .filter(o => o.report && o.orderStatus !== "CANCELLED")
      .map(o => ({
        ...o.report,
        orderId: o.id,
        patientName: o.patient?.name,
        patientPhone: o.patient?.phone,
        testTitle: o.itemTitle,
        sampleId: o.samples?.[0]?.sampleId || "SMP-2001",
        fullOrder: o
      }));
  }, [orders]);

  const filteredReports = useMemo(() => {
    return reportsList.filter(r => {
      if (selectedStatus !== "ALL" && r.reportStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchReportId = r.reportId?.toLowerCase().includes(q);
        const matchOrderId = r.orderId.toLowerCase().includes(q);
        const matchPatient = r.patientName?.toLowerCase().includes(q);
        const matchTest = r.testTitle?.toLowerCase().includes(q);
        if (!matchReportId && !matchOrderId && !matchPatient && !matchTest) return false;
      }
      return true;
    });
  }, [reportsList, selectedStatus, searchQuery]);

  const handleOpenUpload = (orderObj) => {
    setUploadModalOrder(orderObj);
  };

  const handleConfirmUpload = () => {
    if (uploadModalOrder) {
      uploadReport(uploadModalOrder.id, {
        reportId: `RPT-30${uploadModalOrder.id.slice(-2)}`,
        pdfUrl: `novus_report_${uploadModalOrder.id}.pdf`,
        notes: "Pathology analyzer values compiled."
      });
      setUploadModalOrder(null);
    }
  };

  const handleOpenVerify = (orderObj) => {
    setPreviewOrder(orderObj);
    setIsVerifyingMode(true);
  };

  const handleConfirmVerification = (orderId) => {
    verifyReport(orderId, {
      verifiedBy: "Dr. Arvind Rao (MD Pathology)",
      notes: "NABL Quality assurance verified."
    });
    setPreviewOrder(null);
  };

  const handleOpenRejectReport = (orderObj) => {
    setRejectReportModalOrder(orderObj);
  };

  const handleConfirmRejectReport = () => {
    if (rejectReportModalOrder) {
      rejectReport(rejectReportModalOrder.id, {
        reason: rejectionReason,
        notes: rejectionNotes
      });
      setRejectReportModalOrder(null);
      setRejectionNotes("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="document-text" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Pathology & Diagnostic Reports Desk</Text>
            <Text style={styles.topSub}>Pathologist Sign-off · Digital Verification & Patient Dispatch</Text>
          </View>
        </View>

        <View style={styles.topStatsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Ready for Verification:</Text>
            <Text style={[styles.statPillVal, { color: "#D97706" }]}>
              {reportsList.filter(r => r.reportStatus === "UPLOADED" || r.reportStatus === "UNDER REVIEW").length}
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillLabel}>Verified Today:</Text>
            <Text style={[styles.statPillVal, { color: "#059669" }]}>
              {reportsList.filter(r => r.reportStatus === "VERIFIED" || r.reportStatus === "DELIVERED").length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.statusTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScroll}>
          {["ALL", "PENDING", "UPLOADED", "UNDER REVIEW", "VERIFIED", "DELIVERED", "REJECTED"].map(st => (
            <Pressable
              key={st}
              style={[styles.statusTabBtn, selectedStatus === st && styles.statusTabBtnActive]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text style={[styles.statusTabText, selectedStatus === st && styles.statusTabTextActive]}>
                {st === "ALL" ? "All Reports" : st}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search report ID, order ID, patient name, diagnostic test..."
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

      {/* Reports Table */}
      <ScrollView style={styles.tableScroll} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1.2 }]}>REPORT ID</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>ORDER ID</Text>
            <Text style={[styles.th, { flex: 2.2 }]}>PATIENT</Text>
            <Text style={[styles.th, { flex: 2.4 }]}>DIAGNOSTIC TEST / PACKAGE</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>SAMPLE ID</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>REPORT STATUS</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>VERIFIED BY</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>DELIVERY STATUS</Text>
            <Text style={[styles.th, { flex: 1.8, textAlign: "right" }]}>ACTIONS</Text>
          </View>

          {filteredReports.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={36} color={COLORS.slateLight} />
              <Text style={styles.emptyTitle}>No matching reports in this view</Text>
              <Text style={styles.emptySub}>Select a different status tab or clear your search.</Text>
            </View>
          ) : (
            filteredReports.map((report, idx) => (
              <View key={`${report.orderId}-${idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                {/* Report ID */}
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.reportIdText}>{report.reportId || "RPT-PEND"}</Text>
                </View>

                {/* Order ID */}
                <View style={{ flex: 1.2 }}>
                  <Pressable onPress={() => onSelectOrder && onSelectOrder(report.orderId)}>
                    <Text style={styles.orderIdLink}>{report.orderId}</Text>
                  </Pressable>
                </View>

                {/* Patient */}
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.patientName}>{report.patientName}</Text>
                  <Text style={styles.patientPhone}>{report.patientPhone}</Text>
                </View>

                {/* Test / Package */}
                <View style={{ flex: 2.4 }}>
                  <Text style={styles.testTitle} numberOfLines={1}>{report.testTitle}</Text>
                  <Text style={styles.uploadDate}>{report.uploadedDate ? `Uploaded: ${report.uploadedDate}` : "Not Uploaded Yet"}</Text>
                </View>

                {/* Sample ID */}
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.sampleIdBadge}>{report.sampleId}</Text>
                </View>

                {/* Report Status */}
                <View style={{ flex: 1.4 }}>
                  <LabStatusBadge status={report.reportStatus} size="small" />
                </View>

                {/* Verified By */}
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.verifiedByText} numberOfLines={1}>{report.verifiedBy || "Pending Pathologist"}</Text>
                </View>

                {/* Delivery Status */}
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.deliveryText} numberOfLines={1}>{report.deliveryStatus || "Not Dispatched"}</Text>
                </View>

                {/* Actions */}
                <View style={{ flex: 1.8, flexDirection: "row", justifyContent: "flex-end", gap: 6, alignItems: "center" }}>
                  {report.reportStatus === "PENDING" && (
                    <Pressable
                      style={[styles.actionBtn, styles.uploadBtn]}
                      onPress={() => handleOpenUpload(report.fullOrder)}
                    >
                      <Ionicons name="cloud-upload-outline" size={12} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>Upload</Text>
                    </Pressable>
                  )}

                  {(report.reportStatus === "UPLOADED" || report.reportStatus === "UNDER REVIEW") && (
                    <Pressable
                      style={[styles.actionBtn, styles.verifyBtn]}
                      onPress={() => handleOpenVerify(report.fullOrder)}
                    >
                      <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                      <Text style={styles.actionBtnText}>Verify</Text>
                    </Pressable>
                  )}

                  {(report.reportStatus === "VERIFIED" || report.reportStatus === "DELIVERED") && (
                    <Pressable
                      style={[styles.actionBtn, styles.sendBtn]}
                      onPress={() => sendReportToPatient(report.orderId)}
                    >
                      <Ionicons name="paper-plane-outline" size={12} color={COLORS.teal} />
                      <Text style={[styles.actionBtnText, { color: COLORS.teal }]}>Send</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.previewIconBtn}
                    onPress={() => {
                      setPreviewOrder(report.fullOrder);
                      setIsVerifyingMode(false);
                    }}
                  >
                    <Ionicons name="eye-outline" size={15} color={COLORS.navy} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Simulated Upload Report Modal */}
      {uploadModalOrder && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="cloud-upload" size={20} color={COLORS.teal} />
                <Text style={styles.modalTitle}>Compile & Upload Report ({uploadModalOrder.id})</Text>
              </View>

              <View style={{ gap: 12, paddingVertical: 12 }}>
                <Text style={styles.modalSubText}>
                  Order: <Text style={{ fontWeight: "700" }}>{uploadModalOrder.itemTitle}</Text> for patient{" "}
                  <Text style={{ fontWeight: "700" }}>{uploadModalOrder.patient.name}</Text>.
                </Text>

                <View style={styles.uploadDropzone}>
                  <Ionicons name="document-attach-outline" size={32} color={COLORS.teal} />
                  <Text style={styles.dropzoneTitle}>Novus Pathology LIS Autopopulate</Text>
                  <Text style={styles.dropzoneSub}>Simulate diagnostic analyzer parameter injection & PDF generator.</Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setUploadModalOrder(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalConfirmBtn} onPress={handleConfirmUpload}>
                  <Text style={styles.modalConfirmBtnText}>Generate & Upload Report</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* PDF Diagnostic Report Preview Modal */}
      <LabReportPreviewModal
        visible={Boolean(previewOrder)}
        onClose={() => setPreviewOrder(null)}
        order={previewOrder}
        isVerifying={isVerifyingMode}
        onVerify={handleConfirmVerification}
        onReject={(orderId) => {
          setPreviewOrder(null);
          handleOpenRejectReport(previewOrder);
        }}
      />

      {/* Reject Report Modal */}
      {rejectReportModalOrder && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="warning" size={18} color="#DC2626" />
                <Text style={[styles.modalTitle, { color: "#DC2626" }]}>
                  Reject Report for Re-assay ({rejectReportModalOrder.id})
                </Text>
              </View>

              <View style={{ gap: 10, paddingVertical: 10 }}>
                <Text style={styles.inputLabel}>Pathologist Rejection Reason</Text>
                {[
                  "Values inconsistent with clinical history / QC flag",
                  "Critical value requires repeat dilution assay",
                  "Hemolysis interference detected on spectrophotometry",
                  "Typographical error in parameter unit",
                  "Other"
                ].map(r => (
                  <Pressable
                    key={r}
                    style={[styles.reasonOption, rejectionReason === r && styles.reasonOptionSelected]}
                    onPress={() => setRejectionReason(r)}
                  >
                    <Ionicons
                      name={rejectionReason === r ? "radio-button-on" : "radio-button-off"}
                      size={16}
                      color={rejectionReason === r ? "#DC2626" : COLORS.slate}
                    />
                    <Text style={[styles.reasonText, rejectionReason === r && styles.reasonTextSelected]}>{r}</Text>
                  </Pressable>
                ))}

                <Text style={styles.inputLabel}>Pathologist Bench Note</Text>
                <TextInput
                  style={styles.textInput}
                  value={rejectionNotes}
                  onChangeText={setRejectionNotes}
                  placeholder="e.g. Run 1:2 dilution on Cobas c501"
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setRejectReportModalOrder(null)}>
                  <Text style={styles.modalCancelBtnText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalConfirmBtn, { backgroundColor: "#DC2626" }]}
                  onPress={handleConfirmRejectReport}
                >
                  <Text style={styles.modalConfirmBtnText}>Reject Report</Text>
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
    borderBottomColor: COLORS.line,
    flexWrap: "wrap",
    gap: 12
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
  topStatsRow: {
    flexDirection: "row",
    gap: 10
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  statPillLabel: {
    fontSize: 11,
    color: COLORS.slate
  },
  statPillVal: {
    fontSize: 13,
    fontWeight: "800"
  },
  statusTabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  statusTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6
  },
  statusTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F8FAFC"
  },
  statusTabBtnActive: {
    backgroundColor: COLORS.navy
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
  reportIdText: {
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
  testTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted
  },
  uploadDate: {
    fontSize: 9,
    color: COLORS.slateLight,
    marginTop: 1
  },
  sampleIdBadge: {
    fontSize: 10,
    color: COLORS.navy,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  verifiedByText: {
    fontSize: 11,
    color: COLORS.navy
  },
  deliveryText: {
    fontSize: 10,
    color: COLORS.slate
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  uploadBtn: {
    backgroundColor: COLORS.teal
  },
  verifyBtn: {
    backgroundColor: "#059669"
  },
  sendBtn: {
    backgroundColor: COLORS.tealLight
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white
  },
  previewIconBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 4
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
    maxWidth: 520,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 8
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  modalSubText: {
    fontSize: 12,
    color: COLORS.slate
  },
  uploadDropzone: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tealLight,
    borderWidth: 2,
    borderColor: "#A7F3D0",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 24,
    gap: 6
  },
  dropzoneTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  dropzoneSub: {
    fontSize: 11,
    color: COLORS.slate
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
    fontSize: 11,
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
    marginTop: 14,
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
    backgroundColor: COLORS.teal,
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
