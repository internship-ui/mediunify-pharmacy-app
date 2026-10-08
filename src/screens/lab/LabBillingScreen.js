// MediUnify Lab Admin - Billing, Payments & Tax Invoices Management
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

export function LabBillingScreen({ onSelectOrder }) {
  const {
    invoices,
    recordPayment,
    applyDiscount
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Payment Form State
  const [payForm, setPayForm] = useState({
    amountPaid: "",
    paymentMode: "UPI / PhonePe",
    transactionRef: "",
    notes: "Settled via UPI QR code."
  });

  // Discount Form State
  const [discountForm, setDiscountForm] = useState({
    discountPercent: "10",
    discountAmount: "",
    reason: "Senior Citizen Clinical Discount"
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        !searchQuery ||
        inv.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.patientPhone.includes(searchQuery) ||
        (inv.transactionRef && inv.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL" ||
        inv.paymentStatus === statusFilter;

      const matchMode =
        modeFilter === "ALL" ||
        (inv.paymentMode || "").toLowerCase().includes(modeFilter.toLowerCase());

      return matchSearch && matchStatus && matchMode;
    });
  }, [invoices, searchQuery, statusFilter, modeFilter]);

  // Top financial totals
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.netAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
  const paidCount = invoices.filter(i => i.paymentStatus === "PAID").length;

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPayForm({
      amountPaid: String(inv.balanceDue || inv.netAmount),
      paymentMode: "UPI / PhonePe",
      transactionRef: `UPI-${Date.now().toString().slice(-8)}`,
      notes: "Settlement received."
    });
    setIsPayModalOpen(true);
  };

  const openDiscountModal = (inv) => {
    setSelectedInvoice(inv);
    setDiscountForm({
      discountPercent: "10",
      discountAmount: "",
      reason: "Promotional Diagnostic Waiver"
    });
    setIsDiscountModalOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amt = parseFloat(payForm.amountPaid) || 0;
    if (amt <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    recordPayment(selectedInvoice.invoiceId, {
      amountPaid: amt,
      paymentMode: payForm.paymentMode,
      transactionRef: payForm.transactionRef,
      notes: payForm.notes
    });

    setIsPayModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleApplyDiscount = () => {
    if (!selectedInvoice) return;
    const pct = parseFloat(discountForm.discountPercent) || 0;
    const amt = parseFloat(discountForm.discountAmount) || 0;

    applyDiscount(selectedInvoice.invoiceId, {
      discountPercent: pct,
      discountAmount: amt,
      reason: discountForm.reason
    });

    setIsDiscountModalOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Financial KPI Summary Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F0FDFA" }]}>
            <Ionicons name="wallet" size={20} color={COLORS.teal} />
          </View>
          <View>
            <Text style={styles.kpiValue}>₹{totalBilled.toLocaleString("en-IN")}</Text>
            <Text style={styles.kpiLabel}>Total Invoiced Amount</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.kpiValue}>₹{totalCollected.toLocaleString("en-IN")}</Text>
            <Text style={styles.kpiLabel}>Collected Payments ({paidCount})</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
          </View>
          <View>
            <Text style={[styles.kpiValue, { color: "#DC2626" }]}>₹{totalBalanceDue.toLocaleString("en-IN")}</Text>
            <Text style={styles.kpiLabel}>Outstanding Dues</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="pie-chart" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiValue}>UPI: 58% | Card: 26%</Text>
            <Text style={styles.kpiLabel}>Digital Payment Split</Text>
          </View>
        </View>
      </View>

      {/* Control Bar: Search & Status Filters */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoice #, order ID, patient name, or transaction ref..."
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

        {/* Status Filter Pills */}
        <View style={styles.filterPills}>
          {["ALL", "PAID", "PARTIAL", "PENDING"].map(status => (
            <Pressable
              key={status}
              style={[
                styles.filterPill,
                statusFilter === status && styles.filterPillActive
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === status && styles.filterPillTextActive
                ]}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Payment Mode Pills */}
        <View style={styles.filterPills}>
          {["ALL", "UPI", "Card", "Cash"].map(mode => (
            <Pressable
              key={mode}
              style={[
                styles.filterPill,
                modeFilter === mode && styles.filterPillActive
              ]}
              onPress={() => setModeFilter(mode)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  modeFilter === mode && styles.filterPillTextActive
                ]}
              >
                {mode === "ALL" ? "All Modes" : mode}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Invoices Table */}
      <View style={styles.tableCard}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thText, { flex: 1.4 }]}>INVOICE & DATE</Text>
          <Text style={[styles.thText, { flex: 1.6 }]}>PATIENT / ORDER</Text>
          <Text style={[styles.thText, { flex: 2 }]}>INVESTIGATION SUMMARY</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: "right" }]}>AMOUNT / NET</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: "center" }]}>PAYMENT STATUS</Text>
          <Text style={[styles.thText, { flex: 1.5, textAlign: "center" }]}>ACTIONS</Text>
        </View>

        {/* Table Body */}
        {filteredInvoices.length === 0 ? (
          <View style={styles.emptyTable}>
            <Ionicons name="receipt-outline" size={40} color={COLORS.slate} />
            <Text style={styles.emptyText}>No invoices match the selected filter criteria.</Text>
          </View>
        ) : (
          filteredInvoices.map(inv => {
            const isPaid = inv.paymentStatus === "PAID";
            const isPartial = inv.paymentStatus === "PARTIAL";

            return (
              <View key={inv.invoiceId} style={styles.tableRow}>
                {/* Invoice ID & Date */}
                <View style={{ flex: 1.4 }}>
                  <Text style={styles.invoiceIdText}>{inv.invoiceId}</Text>
                  <Text style={styles.dateText}>{inv.date}</Text>
                  {inv.b2bPartner && (
                    <View style={styles.b2bBadge}>
                      <Text style={styles.b2bBadgeText}>B2B / Insurance</Text>
                    </View>
                  )}
                </View>

                {/* Patient & Order */}
                <View style={{ flex: 1.6 }}>
                  <Text style={styles.patientName}>{inv.patientName}</Text>
                  <Text style={styles.patientPhone}>{inv.patientPhone}</Text>
                  <Pressable
                    style={styles.orderLinkRow}
                    onPress={() => onSelectOrder && onSelectOrder(inv.orderId)}
                  >
                    <Ionicons name="link-outline" size={11} color={COLORS.teal} />
                    <Text style={styles.orderLinkText}>{inv.orderId}</Text>
                  </Pressable>
                </View>

                {/* Investigation Summary */}
                <View style={{ flex: 2, paddingRight: 8 }}>
                  {(inv.items || []).map((it, idx) => (
                    <Text key={idx} style={styles.itemSummaryText} numberOfLines={1}>
                      • {it.description}
                    </Text>
                  ))}
                  <Text style={styles.modeSubText}>Mode: {inv.paymentMode}</Text>
                </View>

                {/* Amount / Net / Balance */}
                <View style={{ flex: 1.2, alignItems: "flex-end" }}>
                  <Text style={styles.netAmountText}>₹{inv.netAmount}</Text>
                  {inv.discountAmount > 0 && (
                    <Text style={styles.discountText}>-₹{inv.discountAmount} Off</Text>
                  )}
                  {inv.balanceDue > 0 ? (
                    <Text style={styles.balanceDueText}>Due: ₹{inv.balanceDue}</Text>
                  ) : (
                    <Text style={styles.clearedText}>Fully Paid</Text>
                  )}
                </View>

                {/* Payment Status Badge */}
                <View style={{ flex: 1.2, alignItems: "center" }}>
                  <View style={[
                    styles.statusBadge,
                    isPaid ? styles.statusBadgePaid : isPartial ? styles.statusBadgePartial : styles.statusBadgePending
                  ]}>
                    <Ionicons
                      name={isPaid ? "checkmark-circle" : isPartial ? "time" : "alert-circle"}
                      size={12}
                      color={isPaid ? "#059669" : isPartial ? "#D97706" : "#DC2626"}
                    />
                    <Text style={[
                      styles.statusBadgeText,
                      isPaid ? styles.statusTextPaid : isPartial ? styles.statusTextPartial : styles.statusTextPending
                    ]}>
                      {inv.paymentStatus}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {!isPaid && (
                    <Pressable
                      style={styles.payBtn}
                      onPress={() => openPaymentModal(inv)}
                    >
                      <Ionicons name="card" size={13} color={COLORS.white} />
                      <Text style={styles.payBtnText}>Pay</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.invoiceBtn}
                    onPress={() => {
                      setSelectedInvoice(inv);
                      setIsInvoiceModalOpen(true);
                    }}
                  >
                    <Ionicons name="receipt-outline" size={14} color={COLORS.navy} />
                    <Text style={styles.invoiceBtnText}>Invoice</Text>
                  </Pressable>

                  {!isPaid && (
                    <Pressable
                      style={styles.discountBtn}
                      onPress={() => openDiscountModal(inv)}
                    >
                      <Ionicons name="pricetag-outline" size={13} color="#7C3AED" />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* MODAL: Record / Update Payment (Centered Modal) */}
      {isPayModalOpen && selectedInvoice && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Record Lab Payment</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedInvoice.invoiceId} • {selectedInvoice.patientName} (Due: ₹{selectedInvoice.balanceDue})
                  </Text>
                </View>
                <Pressable onPress={() => setIsPayModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Payment Amount (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={payForm.amountPaid}
                    onChangeText={val => setPayForm({ ...payForm, amountPaid: val })}
                    placeholder="Enter amount"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Payment Mode</Text>
                  <View style={styles.modeSelectRow}>
                    {["UPI / PhonePe", "Credit Card (POS)", "Cash at Center", "Corporate / Insurance"].map(mode => (
                      <Pressable
                        key={mode}
                        style={[
                          styles.modeSelectPill,
                          payForm.paymentMode === mode && styles.modeSelectPillActive
                        ]}
                        onPress={() => setPayForm({ ...payForm, paymentMode: mode })}
                      >
                        <Text style={[
                          styles.modeSelectPillText,
                          payForm.paymentMode === mode && styles.modeSelectPillTextActive
                        ]}>
                          {mode}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Transaction Reference ID / UPI Ref</Text>
                  <TextInput
                    style={styles.textInput}
                    value={payForm.transactionRef}
                    onChangeText={val => setPayForm({ ...payForm, transactionRef: val })}
                    placeholder="e.g. UPI-49028172601 or Cash Receipt"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Notes / Remarks</Text>
                  <TextInput
                    style={styles.textInput}
                    value={payForm.notes}
                    onChangeText={val => setPayForm({ ...payForm, notes: val })}
                    placeholder="e.g. Settled at Kuvempunagar desk"
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsPayModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleRecordPayment}>
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Confirm Settlement</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Apply Discount / Waiver (Centered Modal) */}
      {isDiscountModalOpen && selectedInvoice && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Apply Diagnostic Discount</Text>
                  <Text style={styles.modalSubtitle}>{selectedInvoice.invoiceId} • Subtotal: ₹{selectedInvoice.subTotal}</Text>
                </View>
                <Pressable onPress={() => setIsDiscountModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Discount Percentage (%)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={discountForm.discountPercent}
                      onChangeText={val => setDiscountForm({ ...discountForm, discountPercent: val, discountAmount: "" })}
                      placeholder="e.g. 10"
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Or Flat Amount (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={discountForm.discountAmount}
                      onChangeText={val => setDiscountForm({ ...discountForm, discountAmount: val, discountPercent: "" })}
                      placeholder="e.g. 250"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Discount Reason / Authority</Text>
                  <TextInput
                    style={styles.textInput}
                    value={discountForm.reason}
                    onChangeText={val => setDiscountForm({ ...discountForm, reason: val })}
                    placeholder="e.g. Senior Citizen Waiver approved by Lab Director"
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsDiscountModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleApplyDiscount}>
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Apply Discount</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Formal Tax Invoice PDF Preview (Centered Modal) */}
      {isInvoiceModalOpen && selectedInvoice && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxWidth: 640 }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Tax Invoice & Diagnostic Bill</Text>
                  <Text style={styles.modalSubtitle}>{selectedInvoice.invoiceId} • SAC Code 999312</Text>
                </View>
                <Pressable onPress={() => setIsInvoiceModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              {/* Bill Body Container */}
              <ScrollView style={{ maxHeight: 460, padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Lab Letterhead */}
                <View style={styles.invoiceLetterhead}>
                  <View>
                    <Text style={styles.invoiceLabName}>MEDIUNIFY DIAGNOSTIC LABORATORIES</Text>
                    <Text style={styles.invoiceLabSub}>NABL Accredited Reference Laboratory (ISO 15189:2022)</Text>
                    <Text style={styles.invoiceLabSub}>GSTIN: 29AABCM1234F1Z8 • Mysuru Hub, Karnataka</Text>
                  </View>
                  <View style={styles.invoiceIdPill}>
                    <Text style={styles.invoiceIdPillText}>{selectedInvoice.invoiceId}</Text>
                  </View>
                </View>

                {/* Patient & Invoice Meta Row */}
                <View style={styles.patientBillInfoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billSectionLabel}>BILLED TO:</Text>
                    <Text style={styles.billPatientName}>{selectedInvoice.patientName}</Text>
                    <Text style={styles.billPatientSub}>UHID: {selectedInvoice.uhid || "MU-UHID-8821"}</Text>
                    <Text style={styles.billPatientSub}>{selectedInvoice.patientPhone}</Text>
                    <Text style={styles.billPatientSub}>{selectedInvoice.patientAddress}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.billSectionLabel}>INVOICE DETAILS:</Text>
                    <Text style={styles.billDetailText}>Date: {selectedInvoice.date}</Text>
                    <Text style={styles.billDetailText}>Order Ref: {selectedInvoice.orderId}</Text>
                    <Text style={styles.billDetailText}>Mode: {selectedInvoice.paymentMode}</Text>
                    <Text style={styles.billDetailText}>Ref: {selectedInvoice.transactionRef || "N/A"}</Text>
                  </View>
                </View>

                {/* Items Table */}
                <View style={styles.billItemsTable}>
                  <View style={styles.billTableHeader}>
                    <Text style={[styles.billThText, { flex: 2.5 }]}>INVESTIGATION / SERVICE</Text>
                    <Text style={[styles.billThText, { flex: 1, textAlign: "center" }]}>SAC</Text>
                    <Text style={[styles.billThText, { flex: 1, textAlign: "right" }]}>RATE (₹)</Text>
                    <Text style={[styles.billThText, { flex: 1, textAlign: "right" }]}>TOTAL (₹)</Text>
                  </View>

                  {(selectedInvoice.items || []).map((it, idx) => (
                    <View key={idx} style={styles.billTableRow}>
                      <Text style={[styles.billItemName, { flex: 2.5 }]}>{it.description}</Text>
                      <Text style={[styles.billItemCode, { flex: 1, textAlign: "center" }]}>{it.hsnSac || "999312"}</Text>
                      <Text style={[styles.billItemPrice, { flex: 1, textAlign: "right" }]}>₹{it.unitPrice}</Text>
                      <Text style={[styles.billItemPrice, { flex: 1, textAlign: "right", fontWeight: "700" }]}>₹{it.total}</Text>
                    </View>
                  ))}
                </View>

                {/* Financial Totals Breakdown */}
                <View style={styles.totalsBox}>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Subtotal</Text>
                    <Text style={styles.totalLineValue}>₹{selectedInvoice.subTotal}</Text>
                  </View>
                  {selectedInvoice.discountAmount > 0 && (
                    <View style={styles.totalLine}>
                      <Text style={[styles.totalLineLabel, { color: "#059669" }]}>Discount Applied</Text>
                      <Text style={[styles.totalLineValue, { color: "#059669" }]}>-₹{selectedInvoice.discountAmount}</Text>
                    </View>
                  )}
                  {selectedInvoice.homeCollectionFee > 0 && (
                    <View style={styles.totalLine}>
                      <Text style={styles.totalLineLabel}>Home Phlebotomy Fee</Text>
                      <Text style={styles.totalLineValue}>₹{selectedInvoice.homeCollectionFee}</Text>
                    </View>
                  )}
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Healthcare Diagnostic GST (Exempt)</Text>
                    <Text style={styles.totalLineValue}>₹0.00</Text>
                  </View>
                  <View style={[styles.totalLine, styles.netTotalLine]}>
                    <Text style={styles.netTotalLabel}>Net Payable Amount</Text>
                    <Text style={styles.netTotalValue}>₹{selectedInvoice.netAmount}</Text>
                  </View>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Amount Received</Text>
                    <Text style={[styles.totalLineValue, { color: "#059669", fontWeight: "700" }]}>₹{selectedInvoice.paidAmount}</Text>
                  </View>
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Balance Outstanding</Text>
                    <Text style={[styles.totalLineValue, { color: selectedInvoice.balanceDue > 0 ? "#DC2626" : "#059669", fontWeight: "700" }]}>
                      ₹{selectedInvoice.balanceDue}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsInvoiceModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Close</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSaveBtn}
                  onPress={() => {
                    alert(`Tax invoice ${selectedInvoice.invoiceId} downloaded.`);
                    setIsInvoiceModalOpen(false);
                  }}
                >
                  <Ionicons name="print-outline" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Print / Download Tax Invoice</Text>
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
    minWidth: 170,
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
  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 40
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  thText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate,
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  invoiceIdText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  dateText: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  b2bBadge: {
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4
  },
  b2bBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2563EB"
  },
  patientName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.navy
  },
  patientPhone: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  orderLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3
  },
  orderLinkText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.teal
  },
  itemSummaryText: {
    fontSize: 12,
    color: COLORS.navy,
    lineHeight: 16
  },
  modeSubText: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 3
  },
  netAmountText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  discountText: {
    fontSize: 10,
    color: "#059669",
    marginTop: 1
  },
  balanceDueText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
    marginTop: 2
  },
  clearedText: {
    fontSize: 11,
    color: "#059669",
    marginTop: 2
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgePaid: {
    backgroundColor: "#ECFDF5"
  },
  statusBadgePartial: {
    backgroundColor: "#FEF3C7"
  },
  statusBadgePending: {
    backgroundColor: "#FEF2F2"
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  statusTextPaid: {
    color: "#059669"
  },
  statusTextPartial: {
    color: "#D97706"
  },
  statusTextPending: {
    color: "#DC2626"
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white
  },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  discountBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
    gap: 10
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.slate
  },
  // Centered Modal Styles
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
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  formGroupHalf: {
    flex: 1
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
  modeSelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  modeSelectPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.border
  },
  modeSelectPillActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  modeSelectPillText: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: "500"
  },
  modeSelectPillTextActive: {
    color: COLORS.white,
    fontWeight: "600"
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
  // Tax Invoice PDF Card Styles
  invoiceLetterhead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    paddingBottom: 12,
    marginBottom: 16
  },
  invoiceLabName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  invoiceLabSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  invoiceIdPill: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  invoiceIdPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  },
  patientBillInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  billSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  billPatientName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  billPatientSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  billDetailText: {
    fontSize: 11,
    color: COLORS.navy,
    marginTop: 2
  },
  billItemsTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16
  },
  billTableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  billThText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  billTableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  billItemName: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: "500"
  },
  billItemCode: {
    fontSize: 11,
    color: COLORS.slate
  },
  billItemPrice: {
    fontSize: 12,
    color: COLORS.navy
  },
  totalsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 14,
    gap: 6
  },
  totalLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  totalLineLabel: {
    fontSize: 12,
    color: COLORS.slate
  },
  totalLineValue: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: "600"
  },
  netTotalLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    marginTop: 4
  },
  netTotalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  netTotalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.teal
  }
});
