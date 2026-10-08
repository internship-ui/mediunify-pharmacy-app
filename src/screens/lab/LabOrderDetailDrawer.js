// MediUnify Lab Order Detail Dialog (Clean Centered UI - No Sliding)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";
import { LabReportPreviewModal } from "./LabReportPreviewModal";

export function LabOrderDetailDrawer({ visible, onClose, orderId }) {
  const {
    orders,
    testsMap,
    staff,
    centers,
    verifyOrder,
    scheduleCollection,
    assignStaffToOrder,
    markSampleCollected,
    markSampleReceived,
    rejectSample,
    startProcessing,
    markReportPending,
    uploadReport,
    verifyReport,
    sendReportToPatient,
    cancelOrder
  } = useLab();

  const [activeTab, setActiveTab] = useState("overview"); // overview, tests, samples, timeline
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalMode, setReportModalMode] = useState("view"); // view, verify

  // Action Sub-Modals
  const [actionModal, setActionModal] = useState(null); // 'schedule', 'assignStaff', 'rejectSample', 'cancelOrder'
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("Today");
  const [scheduleSlot, setScheduleSlot] = useState("07:00 AM - 08:00 AM");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("Hemolysed sample");
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");

  const order = orders.find(o => o.id === orderId);
  if (!visible || !order) return null;

  const patient = order.patient || {};
  const report = order.report || {};
  const samples = order.samples || [];
  const timeline = order.timeline || [];
  const testIds = order.testIds || [];
  const includedTests = testIds.map(id => testsMap[id]).filter(Boolean);

  const handleVerify = () => {
    verifyOrder(order.id);
  };

  const handleOpenScheduleModal = () => {
    const availableStaff = staff.filter(s => s.availability === "AVAILABLE");
    setSelectedStaffId(availableStaff[0]?.staffId || staff[0]?.staffId || "");
    setActionModal("schedule");
  };

  const handleConfirmSchedule = () => {
    scheduleCollection(order.id, {
      scheduledDate: scheduleDate,
      timeSlot: scheduleSlot,
      staffId: selectedStaffId,
      notes: scheduleNotes
    });
    setActionModal(null);
  };

  const handleOpenAssignStaff = () => {
    setSelectedStaffId(staff[0]?.staffId || "");
    setActionModal("assignStaff");
  };

  const handleConfirmAssignStaff = () => {
    if (selectedStaffId) {
      assignStaffToOrder(order.id, selectedStaffId);
    }
    setActionModal(null);
  };

  const handleMarkCollected = () => {
    markSampleCollected(order.id);
  };

  const handleMarkReceived = () => {
    markSampleReceived(order.id);
  };

  const handleStartProcessing = () => {
    startProcessing(order.id);
  };

  const handleMarkReportPending = () => {
    markReportPending(order.id);
  };

  const handleUploadReport = () => {
    uploadReport(order.id, {
      reportId: `RPT-30${order.id.slice(-2)}`,
      pdfUrl: `novus_lab_report_${order.id}.pdf`,
      notes: "Pathology values compiled into LIS."
    });
  };

  const handleVerifyReport = () => {
    verifyReport(order.id, {
      verifiedBy: "Dr. Arvind Rao (MD Pathology)",
      notes: "NABL Quality standards verified."
    });
  };

  const handleSendToPatient = () => {
    sendReportToPatient(order.id, "WhatsApp & SMS");
  };

  const handleOpenRejectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    setActionModal("rejectSample");
  };

  const handleConfirmRejectSample = () => {
    if (selectedSampleId) {
      rejectSample(order.id, selectedSampleId, rejectReason, rejectNotes);
    }
    setActionModal(null);
  };

  const handleConfirmCancelOrder = () => {
    cancelOrder(order.id, cancelReasonText || "Cancelled by administrator");
    setActionModal(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        {/* Backdrop overlay pressable to dismiss */}
        <Pressable style={styles.backdropOverlay} onPress={onClose} />

        <View style={styles.drawerCard}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderLeft}>
              <View style={styles.orderIdBadge}>
                <Ionicons name="receipt-outline" size={15} color={COLORS.navy} />
                <Text style={styles.orderIdText}>{order.id}</Text>
              </View>
              <LabStatusBadge status={order.orderStatus} />
              <View style={[styles.bookingTypeChip, { backgroundColor: order.bookingType === "Home Sample Collection" ? COLORS.aquaLight : "#F1F5F9" }]}>
                <Ionicons
                  name={order.bookingType === "Home Sample Collection" ? "home-outline" : "business-outline"}
                  size={12}
                  color={order.bookingType === "Home Sample Collection" ? "#0891B2" : COLORS.navy}
                />
                <Text style={[styles.bookingTypeText, { color: order.bookingType === "Home Sample Collection" ? "#0891B2" : COLORS.navy }]}>
                  {order.bookingType}
                </Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.slate} />
            </Pressable>
          </View>

          {/* Contextual Action Bar */}
          <View style={styles.contextActionBar}>
            <Text style={styles.contextActionLabel}>OPERATIONAL ACTION:</Text>
            
            {order.orderStatus === "NEW" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleVerify}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Verify Order</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.dangerBtn]} onPress={() => setActionModal("cancelOrder")}>
                  <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                  <Text style={styles.dangerBtnText}>Reject / Cancel</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "PENDING VERIFICATION" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleVerify}>
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Approve & Verify Order</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.dangerBtn]} onPress={() => setActionModal("cancelOrder")}>
                  <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                  <Text style={styles.dangerBtnText}>Reject</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "VERIFIED" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleOpenScheduleModal}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Schedule Collection & Assign Staff</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleOpenAssignStaff}>
                  <Ionicons name="person-add-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.secondaryBtnText}>Assign Staff</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "COLLECTION SCHEDULED" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleMarkCollected}>
                  <Ionicons name="color-fill-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Mark Sample Collected</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleOpenScheduleModal}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.secondaryBtnText}>Reschedule</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "SAMPLE COLLECTED" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleMarkReceived}>
                  <Ionicons name="cube-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Mark Sample Received at Lab</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "SAMPLE RECEIVED" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleStartProcessing}>
                  <Ionicons name="flask-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Start Processing on Analyzers</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "PROCESSING" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleMarkReportPending}>
                  <Ionicons name="document-text-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Mark Report Pending</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "REPORT PENDING" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleUploadReport}>
                  <Ionicons name="cloud-upload-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Generate Diagnostic Report</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "REPORT READY" && (
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, styles.primaryBtn]}
                  onPress={() => {
                    setReportModalMode("verify");
                    setShowReportModal(true);
                  }}
                >
                  <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Verify Report (Pathologist)</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.secondaryBtn]}
                  onPress={() => {
                    setReportModalMode("view");
                    setShowReportModal(true);
                  }}
                >
                  <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.secondaryBtnText}>Preview Report</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "VERIFIED REPORT" && (
              <View style={styles.actionRow}>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSendToPatient}>
                  <Ionicons name="paper-plane-outline" size={14} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Send to Patient (WhatsApp/SMS)</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.secondaryBtn]}
                  onPress={() => {
                    setReportModalMode("view");
                    setShowReportModal(true);
                  }}
                >
                  <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.secondaryBtnText}>View NABL PDF</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "COMPLETED" && (
              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, styles.secondaryBtn]}
                  onPress={() => {
                    setReportModalMode("view");
                    setShowReportModal(true);
                  }}
                >
                  <Ionicons name="document-text-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.secondaryBtnText}>View Diagnostic Report</Text>
                </Pressable>
              </View>
            )}

            {order.orderStatus === "CANCELLED" && (
              <View style={styles.cancelledNotice}>
                <Ionicons name="information-circle-outline" size={15} color="#DC2626" />
                <Text style={styles.cancelledText}>
                  Order cancelled. {order.cancellationReason || "Customer cancellation"}.
                </Text>
              </View>
            )}
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabNav}>
            <Pressable
              style={[styles.tabNavItem, activeTab === "overview" && styles.tabNavItemActive]}
              onPress={() => setActiveTab("overview")}
            >
              <Ionicons name="grid-outline" size={14} color={activeTab === "overview" ? COLORS.teal : COLORS.slate} />
              <Text style={[styles.tabNavText, activeTab === "overview" && styles.tabNavTextActive]}>Overview</Text>
            </Pressable>

            <Pressable
              style={[styles.tabNavItem, activeTab === "tests" && styles.tabNavItemActive]}
              onPress={() => setActiveTab("tests")}
            >
              <Ionicons name="flask-outline" size={14} color={activeTab === "tests" ? COLORS.teal : COLORS.slate} />
              <Text style={[styles.tabNavText, activeTab === "tests" && styles.tabNavTextActive]}>
                Tests ({includedTests.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabNavItem, activeTab === "samples" && styles.tabNavItemActive]}
              onPress={() => setActiveTab("samples")}
            >
              <Ionicons name="color-fill-outline" size={14} color={activeTab === "samples" ? COLORS.teal : COLORS.slate} />
              <Text style={[styles.tabNavText, activeTab === "samples" && styles.tabNavTextActive]}>
                Samples ({samples.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabNavItem, activeTab === "timeline" && styles.tabNavItemActive]}
              onPress={() => setActiveTab("timeline")}
            >
              <Ionicons name="git-commit-outline" size={14} color={activeTab === "timeline" ? COLORS.teal : COLORS.slate} />
              <Text style={[styles.tabNavText, activeTab === "timeline" && styles.tabNavTextActive]}>
                Timeline ({timeline.length})
              </Text>
            </Pressable>
          </View>

          {/* Modal Scroll Content */}
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {activeTab === "overview" && (
              <View style={styles.tabContentGrid}>
                {/* Patient Details Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="person-outline" size={15} color={COLORS.navy} />
                    <Text style={styles.sectionTitle}>PATIENT DETAILS</Text>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>NAME</Text>
                      <Text style={styles.fieldValueBold}>{patient.name}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>UHID / ID</Text>
                      <Text style={styles.fieldValue}>{patient.id || "PID-4821"}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>AGE / GENDER</Text>
                      <Text style={styles.fieldValue}>{patient.age} Yrs · {patient.gender}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>PHONE</Text>
                      <Text style={styles.fieldValueBold}>{patient.phone}</Text>
                    </View>
                    <View style={[styles.infoField, { width: "100%" }]}>
                      <Text style={styles.fieldLabel}>ADDRESS</Text>
                      <Text style={styles.fieldValue}>{patient.address}</Text>
                    </View>
                  </View>
                </View>

                {/* Order & Payment Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="receipt-outline" size={15} color={COLORS.navy} />
                    <Text style={styles.sectionTitle}>ORDER & PAYMENT</Text>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>PACKAGE / TEST</Text>
                      <Text style={styles.fieldValueBold}>{order.itemTitle}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>BOOKING TIME</Text>
                      <Text style={styles.fieldValue}>{order.bookingDate}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>SCHEDULED SLOT</Text>
                      <Text style={styles.fieldValue}>{order.preferredDate} ({order.preferredTime})</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>CENTER</Text>
                      <Text style={styles.fieldValue}>{order.centerName}</Text>
                    </View>
                    <View style={styles.infoField}>
                      <Text style={styles.fieldLabel}>PAYMENT</Text>
                      <Text style={[styles.fieldValueBold, { color: order.paymentStatus === "Paid" ? "#059669" : "#DC2626" }]}>
                        {order.paymentStatus} · ₹{order.totalAmount}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Assigned Phlebotomist Card */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="bicycle-outline" size={15} color={COLORS.navy} />
                    <Text style={styles.sectionTitle}>ASSIGNED PHLEBOTOMIST</Text>
                  </View>
                  {order.assignedStaff ? (
                    <View style={styles.staffInfoRow}>
                      <View style={styles.staffAvatar}>
                        <Ionicons name="person" size={18} color={COLORS.teal} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.staffName}>{order.assignedStaff.name} ({order.assignedStaff.staffId})</Text>
                        <Text style={styles.staffPhone}>{order.assignedStaff.phone}</Text>
                      </View>
                      <Pressable style={styles.reassignBtn} onPress={handleOpenAssignStaff}>
                        <Text style={styles.reassignBtnText}>Reassign</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.emptyStaffBox}>
                      <Text style={styles.emptyStaffText}>No staff assigned yet.</Text>
                      <Pressable style={styles.assignNowBtn} onPress={handleOpenAssignStaff}>
                        <Text style={styles.assignNowBtnText}>Assign Phlebotomist</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            )}

            {activeTab === "tests" && (
              <View style={styles.testsTabContainer}>
                {includedTests.map((test, idx) => (
                  <View key={test.id || idx} style={styles.testItemCard}>
                    <View style={styles.testItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.testItemTitle}>{idx + 1}. {test.testName}</Text>
                        <Text style={styles.testItemCategory}>{test.category} · Code: {test.testCode}</Text>
                      </View>
                      <Text style={styles.testItemPriceText}>₹{test.suggestedMysuruPrice}</Text>
                    </View>

                    <View style={styles.testMetaStrip}>
                      <Text style={styles.testMetaText}><Text style={{ fontWeight: "700" }}>Sample:</Text> {test.sampleRequired}</Text>
                      <Text style={styles.testMetaText}><Text style={{ fontWeight: "700" }}>Tube:</Text> {test.tubeContainer}</Text>
                      <Text style={styles.testMetaText}><Text style={{ fontWeight: "700" }}>TAT:</Text> {test.tat}</Text>
                    </View>

                    <View style={styles.prepBox}>
                      <Ionicons name="nutrition-outline" size={13} color="#D97706" />
                      <Text style={styles.prepText}><Text style={{ fontWeight: "700" }}>Prep:</Text> {test.preparation}</Text>
                    </View>

                    {test.includedParameters && (
                      <View style={styles.paramGrid}>
                        {test.includedParameters.map((param, pIdx) => (
                          <View key={pIdx} style={styles.paramTag}>
                            <Text style={styles.paramTagName}>{param.name}</Text>
                            {param.range ? <Text style={styles.paramTagRange}>Ref: {param.range} {param.unit || ""}</Text> : null}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeTab === "samples" && (
              <View style={styles.samplesTabContainer}>
                {samples.map((sample, idx) => (
                  <View key={sample.sampleId || idx} style={styles.sampleCard}>
                    <View style={styles.sampleCardHeader}>
                      <View>
                        <Text style={styles.sampleIdBadge}>{sample.sampleId}</Text>
                        <Text style={styles.sampleTypeName}>{sample.sampleType}</Text>
                        <Text style={styles.sampleTubeName}>{sample.tubeContainer}</Text>
                      </View>
                      <LabStatusBadge status={sample.sampleStatus} size="small" />
                    </View>

                    <View style={styles.sampleDetailGrid}>
                      <Text style={styles.sampleDetailVal}>Barcode: <Text style={{ fontWeight: "700", color: COLORS.teal }}>{sample.barcode || "BAR-8801"}</Text></Text>
                      <Text style={styles.sampleDetailVal}>Staff: {sample.collectionStaff}</Text>
                      <Text style={styles.sampleDetailVal}>Temp: {sample.temperature || "2-8°C"}</Text>
                    </View>

                    {sample.sampleStatus !== "REJECTED" && sample.sampleStatus !== "COMPLETED" && (
                      <Pressable
                        style={styles.sampleRejectBtn}
                        onPress={() => handleOpenRejectSample(sample.sampleId)}
                      >
                        <Text style={styles.sampleRejectBtnText}>Reject Specimen</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeTab === "timeline" && (
              <View style={styles.timelineContainer}>
                {timeline.map((step, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineHeaderRow}>
                      <LabStatusBadge status={step.status} size="small" />
                      <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>
                    </View>
                    <Text style={styles.timelineResponsible}>By: {step.responsiblePerson || "Authorized Staff"}</Text>
                    {step.notes ? <Text style={styles.timelineNotes}>{step.notes}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Schedule Collection Modal */}
      {actionModal === "schedule" && (
        <Modal visible transparent animationType="fade">
          <View style={styles.subModalBackdrop}>
            <View style={styles.subModalCard}>
              <Text style={styles.subModalTitle}>Schedule Collection & Assign Staff</Text>
              
              <View style={{ gap: 8, marginVertical: 10 }}>
                <Text style={styles.inputLabel}>Select Phlebotomist</Text>
                {staff.map(s => (
                  <Pressable
                    key={s.id}
                    style={[styles.staffOptionRow, selectedStaffId === s.staffId && styles.staffOptionRowSelected]}
                    onPress={() => setSelectedStaffId(s.staffId)}
                  >
                    <Text style={styles.staffOptionName}>{s.name} ({s.staffId}) - {s.serviceArea}</Text>
                  </Pressable>
                ))}

                <Text style={styles.inputLabel}>Date & Time Slot</Text>
                <TextInput
                  style={styles.textInput}
                  value={scheduleSlot}
                  onChangeText={setScheduleSlot}
                  placeholder="e.g. 07:00 AM - 08:00 AM"
                />
              </View>

              <View style={styles.subModalFooter}>
                <Pressable style={styles.subModalCancelBtn} onPress={() => setActionModal(null)}>
                  <Text style={styles.subModalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.subModalConfirmBtn} onPress={handleConfirmSchedule}>
                  <Text style={styles.subModalConfirmText}>Confirm Schedule</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Assign Staff Modal */}
      {actionModal === "assignStaff" && (
        <Modal visible transparent animationType="fade">
          <View style={styles.subModalBackdrop}>
            <View style={styles.subModalCard}>
              <Text style={styles.subModalTitle}>Assign Phlebotomist</Text>
              <View style={{ gap: 6, marginVertical: 10 }}>
                {staff.map(s => (
                  <Pressable
                    key={s.id}
                    style={[styles.staffOptionRow, selectedStaffId === s.staffId && styles.staffOptionRowSelected]}
                    onPress={() => setSelectedStaffId(s.staffId)}
                  >
                    <Text style={styles.staffOptionName}>{s.name} ({s.serviceArea})</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.subModalFooter}>
                <Pressable style={styles.subModalCancelBtn} onPress={() => setActionModal(null)}>
                  <Text style={styles.subModalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.subModalConfirmBtn} onPress={handleConfirmAssignStaff}>
                  <Text style={styles.subModalConfirmText}>Assign</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Reject Sample Modal */}
      {actionModal === "rejectSample" && (
        <Modal visible transparent animationType="fade">
          <View style={styles.subModalBackdrop}>
            <View style={styles.subModalCard}>
              <Text style={[styles.subModalTitle, { color: "#DC2626" }]}>Reject Specimen ({selectedSampleId})</Text>
              <View style={{ gap: 6, marginVertical: 10 }}>
                {["Hemolysed sample", "Insufficient sample quantity (QNS)", "Wrong container", "Leakage", "Clotted EDTA"].map(r => (
                  <Pressable
                    key={r}
                    style={[styles.staffOptionRow, rejectReason === r && { borderColor: "#DC2626", backgroundColor: "#FEF2F2" }]}
                    onPress={() => setRejectReason(r)}
                  >
                    <Text style={{ fontSize: 12, color: rejectReason === r ? "#DC2626" : COLORS.navy, fontWeight: "600" }}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.subModalFooter}>
                <Pressable style={styles.subModalCancelBtn} onPress={() => setActionModal(null)}>
                  <Text style={styles.subModalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.subModalConfirmBtn, { backgroundColor: "#DC2626" }]} onPress={handleConfirmRejectSample}>
                  <Text style={styles.subModalConfirmText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Cancel Order Modal */}
      {actionModal === "cancelOrder" && (
        <Modal visible transparent animationType="fade">
          <View style={styles.subModalBackdrop}>
            <View style={styles.subModalCard}>
              <Text style={[styles.subModalTitle, { color: "#DC2626" }]}>Cancel Order ({order.id})</Text>
              <TextInput
                style={[styles.textInput, { height: 60, marginVertical: 10 }]}
                value={cancelReasonText}
                onChangeText={setCancelReasonText}
                placeholder="Cancellation reason"
              />
              <View style={styles.subModalFooter}>
                <Pressable style={styles.subModalCancelBtn} onPress={() => setActionModal(null)}>
                  <Text style={styles.subModalCancelText}>Back</Text>
                </Pressable>
                <Pressable style={[styles.subModalConfirmBtn, { backgroundColor: "#DC2626" }]} onPress={handleConfirmCancelOrder}>
                  <Text style={styles.subModalConfirmText}>Cancel Order</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Report Modal */}
      <LabReportPreviewModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        order={order}
        isVerifying={reportModalMode === "verify"}
        onVerify={() => {
          handleVerifyReport();
          setShowReportModal(false);
        }}
        onReject={() => setShowReportModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawerBackdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end"
  },
  backdropOverlay: {
    flex: 1
  },
  drawerCard: {
    width: "100%",
    maxWidth: 680,
    height: "100%",
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.line
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  topHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  orderIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  bookingTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  bookingTypeText: {
    fontSize: 10,
    fontWeight: "700"
  },
  closeBtn: {
    padding: 4
  },
  contextActionBar: {
    backgroundColor: COLORS.navyDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  contextActionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  primaryBtn: {
    backgroundColor: COLORS.teal
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },
  secondaryBtn: {
    backgroundColor: COLORS.white
  },
  secondaryBtnText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: "700"
  },
  dangerBtn: {
    backgroundColor: "#FEF2F2"
  },
  dangerBtnText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700"
  },
  cancelledNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  cancelledText: {
    color: "#FCA5A5",
    fontSize: 11
  },
  tabNav: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingHorizontal: 12
  },
  tabNavItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  tabNavItemActive: {
    borderBottomColor: COLORS.teal
  },
  tabNavText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  tabNavTextActive: {
    color: COLORS.teal,
    fontWeight: "800"
  },
  modalScroll: {
    flex: 1
  },
  modalScrollContent: {
    padding: 16,
    gap: 12
  },
  tabContentGrid: {
    gap: 10
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8
  },
  infoField: {
    width: "50%",
    paddingRight: 8
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.slateLight,
    marginBottom: 1
  },
  fieldValueBold: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  fieldValue: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  staffInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 6
  },
  staffAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center"
  },
  staffName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  staffPhone: {
    fontSize: 10,
    color: COLORS.slate
  },
  reassignBtn: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  reassignBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy
  },
  emptyStaffBox: {
    alignItems: "center",
    padding: 8,
    gap: 4
  },
  emptyStaffText: {
    fontSize: 11,
    color: COLORS.slate
  },
  assignNowBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  assignNowBtnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700"
  },
  testsTabContainer: {
    gap: 8
  },
  testItemCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  testItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  testItemTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  testItemCategory: {
    fontSize: 10,
    color: COLORS.slate
  },
  testItemPriceText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.teal
  },
  testMetaStrip: {
    flexDirection: "row",
    gap: 10
  },
  testMetaText: {
    fontSize: 10,
    color: COLORS.navyMuted
  },
  prepBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    padding: 6,
    borderRadius: 4
  },
  prepText: {
    fontSize: 10,
    color: "#92400E"
  },
  paramGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4
  },
  paramTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  paramTagName: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.navy
  },
  paramTagRange: {
    fontSize: 8,
    color: COLORS.slate
  },
  samplesTabContainer: {
    gap: 8
  },
  sampleCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 6
  },
  sampleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sampleIdBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy
  },
  sampleTypeName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  sampleTubeName: {
    fontSize: 9,
    color: COLORS.slate
  },
  sampleDetailGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sampleDetailVal: {
    fontSize: 10,
    color: COLORS.navyMuted
  },
  sampleRejectBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  sampleRejectBtnText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#DC2626"
  },
  timelineContainer: {
    gap: 8
  },
  timelineItem: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal
  },
  timelineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  timelineTimestamp: {
    fontSize: 10,
    color: COLORS.slate
  },
  timelineResponsible: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: "600",
    marginTop: 2
  },
  timelineNotes: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  subModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  subModalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 16
  },
  subModalTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
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
  staffOptionRow: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "#F8FAFC"
  },
  staffOptionRowSelected: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealLight
  },
  staffOptionName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  subModalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10
  },
  subModalCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  subModalCancelText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  subModalConfirmBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  subModalConfirmText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white
  }
});
