// MediUnify Lab Diagnostic Report Preview Modal
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import MediUnifyLogo from "../../components/MediUnifyLogo";

export function LabReportPreviewModal({ visible, onClose, order, onVerify, onReject, isVerifying = false }) {
  if (!visible || !order) return null;

  const report = order.report || {};
  const patient = order.patient || {};
  const results = report.parameterResults || [
    { name: "Hemoglobin (Hb)", value: "14.2", range: "13.0 - 17.0", unit: "g/dL", flag: "Normal" },
    { name: "Total Leucocyte Count (WBC)", value: "7,800", range: "4,000 - 11,000", unit: "/cumm", flag: "Normal" },
    { name: "Platelet Count", value: "245,000", range: "150,000 - 450,000", unit: "/cumm", flag: "Normal" },
    { name: "Fasting Blood Glucose", value: "94", range: "70 - 99", unit: "mg/dL", flag: "Normal" },
    { name: "Glycosylated Hb (HbA1c)", value: "5.4", range: "< 5.7%", unit: "%", flag: "Normal" },
    { name: "Total Cholesterol", value: "182", range: "< 200", unit: "mg/dL", flag: "Desirable" },
    { name: "Triglycerides", value: "138", range: "< 150", unit: "mg/dL", flag: "Normal" },
    { name: "Serum Creatinine", value: "0.85", range: "0.7 - 1.3", unit: "mg/dL", flag: "Normal" },
    { name: "SGPT / ALT", value: "28", range: "10 - 45", unit: "U/L", flag: "Normal" },
    { name: "TSH Ultrasensitive", value: "2.14", range: "0.35 - 4.94", unit: "uIU/mL", flag: "Normal" }
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="document-text" size={20} color={COLORS.teal} />
              <View>
                <Text style={styles.headerTitle}>NABL Accredited Diagnostic Report</Text>
                <Text style={styles.headerSub}>Report ID: {report.reportId || "RPT-" + order.id.slice(4)} · Order: {order.id}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.printBtn} onPress={() => {}}>
                <Ionicons name="print-outline" size={16} color={COLORS.navy} />
                <Text style={styles.printBtnText}>Print / Export PDF</Text>
              </Pressable>
              <Pressable style={styles.closeIconBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color={COLORS.slate} />
              </Pressable>
            </View>
          </View>

          {/* Document Body (Simulated Medical Sheet) */}
          <ScrollView style={styles.docScroll} contentContainerStyle={styles.docContainer}>
            <View style={styles.documentPaper}>
              {/* Lab Letterhead */}
              <View style={styles.letterhead}>
                <View style={styles.letterheadLeft}>
                  <MediUnifyLogo size="small" variant="horizontal" showTagline={false} />
                  <Text style={styles.labSubheading}>NOVUS CENTRAL PATHOLOGY & MOLECULAR REFERENCE LAB</Text>
                  <Text style={styles.labAddress}>Plot 42, Sayyaji Rao Road, Mandi Mohalla, Mysuru - 570001 · Ph: +91 821 245 8800</Text>
                </View>
                <View style={styles.letterheadRight}>
                  <View style={styles.nablBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#047857" />
                    <Text style={styles.nablText}>NABL ACCREDITED (MC-4192)</Text>
                  </View>
                  <Text style={styles.isoText}>ISO 15189:2022 Certified Medical Laboratory</Text>
                  <Text style={styles.barcodeText}>||| | ||||| || |||| ||||| | ||</Text>
                  <Text style={styles.barcodeLabel}>{order.samples?.[0]?.barcode || "BAR-SMP-8801"}</Text>
                </View>
              </View>

              <View style={styles.dividerThick} />

              {/* Patient & Order Demographics Box */}
              <View style={styles.demographicsGrid}>
                <View style={styles.demoCol}>
                  <Text style={styles.demoLabel}>PATIENT NAME</Text>
                  <Text style={styles.demoValueBold}>{patient.name}</Text>
                  <Text style={styles.demoSub}>Age / Gender: {patient.age} Yrs / {patient.gender}</Text>
                  <Text style={styles.demoSub}>UHID / Patient ID: {patient.id || "PID-4821"}</Text>
                </View>

                <View style={styles.demoCol}>
                  <Text style={styles.demoLabel}>ORDER DETAILS</Text>
                  <Text style={styles.demoValue}>{order.itemTitle}</Text>
                  <Text style={styles.demoSub}>Referred By: Self / Dr. Consult</Text>
                  <Text style={styles.demoSub}>Sample Type: {order.samples?.[0]?.sampleType || "Blood / Serum"}</Text>
                </View>

                <View style={styles.demoCol}>
                  <Text style={styles.demoLabel}>COLLECTION & REPORTING</Text>
                  <Text style={styles.demoSub}>Collected: {order.collectionSchedule?.scheduledDate || "Today, 07:30 AM"}</Text>
                  <Text style={styles.demoSub}>Received: {order.timeline?.find(t => t.status === "SAMPLE RECEIVED")?.timestamp || "Today, 08:15 AM"}</Text>
                  <Text style={styles.demoSub}>Reported: {report.uploadedDate || "Today, 09:30 AM"}</Text>
                </View>
              </View>

              <View style={styles.dividerThin} />

              {/* Test Name Header */}
              <View style={styles.testSectionHeader}>
                <Text style={styles.testSectionTitle}>{order.itemTitle.toUpperCase()}</Text>
                <Text style={styles.testSectionCode}>CODE: {order.packageCode || "DIAG-01"}</Text>
              </View>

              {/* Results Table */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>TEST PARAMETER</Text>
                <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>RESULT</Text>
                <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>UNIT</Text>
                <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>BIOLOGICAL REF. RANGE</Text>
                <Text style={[styles.th, { flex: 0.8, textAlign: "center" }]}>FLAG</Text>
              </View>

              {results.map((item, idx) => {
                const isAbnormal = item.flag && item.flag !== "Normal" && item.flag !== "Desirable";
                return (
                  <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tdParam, { flex: 2 }]}>{item.name}</Text>
                    <Text style={[styles.tdResult, { flex: 1, textAlign: "center", color: isAbnormal ? "#DC2626" : COLORS.navy, fontWeight: isAbnormal ? "800" : "600" }]}>
                      {item.value}
                    </Text>
                    <Text style={[styles.tdUnit, { flex: 1, textAlign: "center" }]}>{item.unit || "—"}</Text>
                    <Text style={[styles.tdRange, { flex: 1.5, textAlign: "right" }]}>{item.range}</Text>
                    <View style={{ flex: 0.8, alignItems: "center" }}>
                      {isAbnormal ? (
                        <View style={styles.abnormalChip}>
                          <Text style={styles.abnormalChipText}>{item.flag}</Text>
                        </View>
                      ) : (
                        <Text style={styles.normalText}>Normal</Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Notes & Interpretation */}
              <View style={styles.interpretationBox}>
                <Text style={styles.interpTitle}>PATHOLOGY CLINICAL INTERPRETATION</Text>
                <Text style={styles.interpText}>
                  {report.notes || "Assays evaluated on fully automated clinical chemistry and chemiluminescence analyzers calibrated with internal & external third-party controls. Biological reference intervals established as per CLSI guidelines."}
                </Text>
              </View>

              {/* Signatures & Footer */}
              <View style={styles.signatureRow}>
                <View style={styles.sigCol}>
                  <Text style={styles.sigName}>Kiran B. (M.Sc MLT)</Text>
                  <Text style={styles.sigTitle}>Senior Medical Lab Technologist</Text>
                </View>

                <View style={styles.sigColCenter}>
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={32} color={COLORS.navy} />
                    <Text style={styles.qrText}>Scan to Verify NABL Authenticity</Text>
                  </View>
                </View>

                <View style={styles.sigColRight}>
                  <View style={styles.signatureStamp}>
                    <Text style={styles.stampText}>DIGITALLY SIGNED & VERIFIED</Text>
                  </View>
                  <Text style={styles.sigName}>{report.verifiedBy || "Dr. Arvind Rao (MD Pathology)"}</Text>
                  <Text style={styles.sigTitle}>Consultant Pathologist & Lab Director</Text>
                  <Text style={styles.sigReg}>KMC Reg No: 58921</Text>
                </View>
              </View>

              <View style={styles.footerNote}>
                <Text style={styles.footerNoteText}>
                  *** End of Diagnostic Report · Novus Central Pathology · MediUnify Health Systems ***
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer (for Pathologist verification mode or viewing) */}
          <View style={styles.footerBar}>
            {isVerifying ? (
              <View style={styles.verifyActionRow}>
                <Pressable
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => onReject && onReject(order.id)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.rejectBtnText}>Reject / Request Re-test</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, styles.verifyBtn]}
                  onPress={() => onVerify && onVerify(order.id)}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.white} />
                  <Text style={styles.verifyBtnText}>Approve & Digitally Sign Report</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.standardFooter}>
                <Text style={styles.statusIndicator}>
                  Report Status: <Text style={{ fontWeight: "800", color: COLORS.teal }}>{report.reportStatus || "UPLOADED"}</Text>
                </Text>
                <Pressable style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Close Preview</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalCard: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "92%",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    display: "flex",
    flexDirection: "column"
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.navyDark,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B"
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.slateLight,
    marginTop: 2
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  closeIconBtn: {
    padding: 4
  },
  docScroll: {
    flex: 1,
    backgroundColor: "#E2E8F0"
  },
  docContainer: {
    padding: 16,
    alignItems: "center"
  },
  documentPaper: {
    width: "100%",
    maxWidth: 780,
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  letterhead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  letterheadLeft: {
    flex: 1
  },
  labSubheading: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 6,
    letterSpacing: 0.5
  },
  labAddress: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 2
  },
  letterheadRight: {
    alignItems: "flex-end"
  },
  nablBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  nablText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#047857"
  },
  isoText: {
    fontSize: 9,
    color: COLORS.slate,
    marginTop: 3
  },
  barcodeText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    color: COLORS.navy,
    marginTop: 4
  },
  barcodeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.slate
  },
  dividerThick: {
    height: 3,
    backgroundColor: COLORS.navy,
    marginVertical: 10
  },
  demographicsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 10
  },
  demoCol: {
    flex: 1
  },
  demoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  demoValueBold: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  demoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  demoSub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 2
  },
  dividerThin: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 12
  },
  testSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8
  },
  testSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  testSectionCode: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4
  },
  th: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navyMuted
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA"
  },
  tdParam: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  tdResult: {
    fontSize: 11
  },
  tdUnit: {
    fontSize: 10,
    color: COLORS.slate
  },
  tdRange: {
    fontSize: 10,
    color: COLORS.slate
  },
  normalText: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "600"
  },
  abnormalChip: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  abnormalChipText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#DC2626"
  },
  interpretationBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal
  },
  interpTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 2
  },
  interpText: {
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 14
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  sigCol: {
    flex: 1
  },
  sigColCenter: {
    flex: 1,
    alignItems: "center"
  },
  sigColRight: {
    flex: 1,
    alignItems: "flex-end"
  },
  sigName: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  sigTitle: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  sigReg: {
    fontSize: 9,
    color: COLORS.slateLight,
    marginTop: 1
  },
  signatureStamp: {
    borderWidth: 1,
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  stampText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#047857"
  },
  qrPlaceholder: {
    alignItems: "center"
  },
  qrText: {
    fontSize: 8,
    color: COLORS.slate,
    marginTop: 2
  },
  footerNote: {
    marginTop: 20,
    alignItems: "center"
  },
  footerNoteText: {
    fontSize: 9,
    color: COLORS.slateLight,
    fontStyle: "italic"
  },
  footerBar: {
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  verifyActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626"
  },
  verifyBtn: {
    backgroundColor: COLORS.teal
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white
  },
  standardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusIndicator: {
    fontSize: 13,
    color: COLORS.slate
  },
  closeBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8
  },
  closeBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700"
  }
});
