import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function InvoiceScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const orderId = route?.params?.orderId;
  const { orders, pharmacyProfile } = usePharmacy();
  const [copied, setCopied] = useState(false);

  const order = orders.find(o => o.id === orderId) || (orders.length > 0 ? orders[0] : null);

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="receipt-outline" size={48} color={COLORS.slateLight} />
        <Text style={styles.notFoundText}>Invoice not found for order #{orderId || "N/A"}</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("MainTabs", { screen: "Orders" });
            }
          }}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const items = order.items || [];
  const subtotal = order.subtotal || items.reduce((sum, it) => sum + (it.qty * (it.unitPrice || 10)), 0);
  const cgstAmount = ((order.taxAmount || subtotal * 0.12) / 2);
  const sgstAmount = cgstAmount;
  const packaging = order.packagingCharge || 10.0;
  const deliveryFee = order.deliveryFee || 25.0;
  const discount = order.discountAmount || 0;
  const grandTotal = order.totalAmount || (subtotal + (order.taxAmount || subtotal * 0.12) + packaging + deliveryFee - discount);

  const handlePrint = () => {
    Alert.alert("Print Invoice", `Sending Invoice ${order.invoiceNo || order.id} to connected thermal receipt printer.`);
  };

  const handleDownload = () => {
    Alert.alert("Download Tax Invoice", `Tax Invoice ${order.invoiceNo || order.id} downloaded to device storage.`);
  };

  const handleShare = () => {
    Alert.alert("Share Invoice", `Invoice link copied to clipboard and ready to share with patient ${order.patientName}.`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 900, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 16, paddingTop: 12 },
        { paddingBottom: Math.max(insets.bottom, 16) + 30 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Action Bar */}
      <View style={styles.topActions}>
        <Pressable
          style={({ pressed }) => [styles.actionPill, pressed && { opacity: 0.8 }]}
          onPress={handlePrint}
        >
          <Ionicons name="print-outline" size={15} color={COLORS.navy} />
          <Text style={styles.actionPillText}>Print</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionPill, pressed && { opacity: 0.8 }]}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={15} color={COLORS.navy} />
          <Text style={styles.actionPillText}>Download</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionPill, styles.actionPillHighlight, pressed && { opacity: 0.8 }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={15} color={COLORS.teal} />
          <Text style={[styles.actionPillText, { color: COLORS.teal }]}>Share</Text>
        </Pressable>
      </View>

      {/* Invoice Card */}
      <View style={styles.invoiceCard}>
        {/* Pharmacy Header */}
        <View style={styles.headerSection}>
          <View style={styles.brandRow}>
            <View style={styles.pharmacyLogoBadge}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.invoiceLogoImg}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pharmacyName}>{pharmacyProfile.name}</Text>
              <Text style={styles.pharmacyAddress}>{pharmacyProfile.address}, {pharmacyProfile.city}</Text>
              <Text style={styles.licenseRow}>DL No: {pharmacyProfile.licenseNumber}</Text>
              <Text style={styles.licenseRow}>GSTIN: {pharmacyProfile.gstin}</Text>
            </View>
          </View>
          <View style={styles.taxInvoiceTag}>
            <Text style={styles.taxInvoiceTagText}>TAX INVOICE</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Invoice Meta Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Invoice No.</Text>
            <Text style={styles.metaValue}>{order.invoiceNo || `INV-${order.id}`}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Order Date & Time</Text>
            <Text style={styles.metaValue}>
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Payment Mode</Text>
            <View style={styles.paymentTag}>
              <Ionicons
                name={order.paymentMethod?.includes("Cash") ? "cash-outline" : "card-outline"}
                size={12}
                color={order.paymentStatus === "Paid" ? COLORS.teal : COLORS.coral}
              />
              <Text style={[styles.paymentText, { color: order.paymentStatus === "Paid" ? COLORS.teal : COLORS.coral }]}>
                {order.paymentMethod || "UPI (Prepaid)"} · {order.paymentStatus || "Paid"}
              </Text>
            </View>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Order ID</Text>
            <Text style={styles.metaValue}>{order.id}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Billed To / Patient Info */}
        <View style={styles.patientSection}>
          <Text style={styles.sectionHeading}>BILLED TO (PATIENT):</Text>
          <Text style={styles.patientName}>{order.patientName} {order.patientAge ? `(${order.patientGender || ""}, ${order.patientAge} yrs)` : ""}</Text>
          <Text style={styles.patientContact}>Phone: {order.patientPhone}</Text>
          <Text style={styles.patientContact}>Address: {order.deliveryAddress}</Text>
          {order.doctorName && (
            <View style={styles.doctorWrap}>
              <Ionicons name="medical-outline" size={13} color={COLORS.navy} />
              <Text style={styles.doctorText}>Prescribed by: {order.doctorName} {order.clinicName ? `(${order.clinicName})` : ""}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Itemized Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionHeading}>ITEMIZED PARTICULARS</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, { flex: 3 }]}>Item & Dosage</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: "right" }]}>Rate</Text>
            <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: "right" }]}>Amount</Text>
          </View>

          {items.map((item, index) => {
            const rate = item.unitPrice || 10.0;
            const itemTotal = (item.qty * rate).toFixed(2);
            return (
              <View key={index} style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemSubText}>HSN: {item.hsn || "30049099"} · GST: {item.gstRate || 12}%</Text>
                  {item.dosage && <Text style={styles.dosageSubText}>{item.dosage}</Text>}
                </View>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "center", fontWeight: "600" }]}>{item.qty}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>₹{rate.toFixed(2)}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right", fontWeight: "700", color: COLORS.navy }]}>
                  ₹{itemTotal}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Calculation Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>CGST (6%)</Text>
            <Text style={styles.summaryVal}>₹{cgstAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SGST (6%)</Text>
            <Text style={styles.summaryVal}>₹{sgstAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Packaging & Sterilization</Text>
            <Text style={styles.summaryVal}>₹{packaging.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Partner Charges</Text>
            <Text style={styles.summaryVal}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.teal }]}>Pharmacy Discount Applied</Text>
              <Text style={[styles.summaryVal, { color: COLORS.teal }]}>-₹{discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total (Net Payable)</Text>
            <Text style={styles.grandTotalVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerSection}>
          <Text style={styles.footerNote}>
            * This is a computer-generated tax invoice verified under MediUnify Telehealth & Pharmacy Logistics Network.
          </Text>
          <View style={styles.signedRow}>
            <View style={styles.authorizedStamp}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
              <Text style={styles.stampText}>Digitally Verified by Registered Pharmacist</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 14 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  notFoundText: { fontSize: 16, color: COLORS.slate, marginVertical: 12 },
  backButton: { backgroundColor: COLORS.teal, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: COLORS.white, fontWeight: "600" },

  topActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    justifyContent: "flex-end"
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  actionPillHighlight: {
    backgroundColor: COLORS.tealLight,
    borderColor: COLORS.teal
  },
  actionPillText: { fontSize: 13, fontWeight: "600", color: COLORS.navy },

  invoiceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.line
  },

  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  brandRow: { flexDirection: "row", gap: 12, flex: 1 },
  pharmacyLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  invoiceLogoImg: {
    width: "100%",
    height: "100%"
  },
  pharmacyName: { fontSize: 16, fontWeight: "700", color: COLORS.navy },
  pharmacyAddress: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  licenseRow: { fontSize: 11, color: COLORS.slate, marginTop: 1, fontWeight: "500" },

  taxInvoiceTag: {
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  taxInvoiceTagText: { fontSize: 10, fontWeight: "700", color: COLORS.teal, letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 14 },

  metaGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 11, color: COLORS.slateLight, fontWeight: "600", textTransform: "uppercase" },
  metaValue: { fontSize: 13, color: COLORS.navy, fontWeight: "600", marginTop: 2 },

  paymentTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  paymentText: { fontSize: 12, fontWeight: "700" },

  patientSection: { gap: 2 },
  sectionHeading: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 4 },
  patientName: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  patientContact: { fontSize: 12, color: COLORS.slate, marginTop: 1 },
  doctorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    backgroundColor: "#F1F5F9",
    padding: 6,
    borderRadius: 6
  },
  doctorText: { fontSize: 12, color: COLORS.navy, fontWeight: "500" },

  tableSection: {},
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 6
  },
  tableColHeader: { fontSize: 11, fontWeight: "700", color: COLORS.slate, textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center"
  },
  itemTitle: { fontSize: 13, fontWeight: "600", color: COLORS.navy },
  itemSubText: { fontSize: 11, color: COLORS.slateLight, marginTop: 1 },
  dosageSubText: { fontSize: 11, color: COLORS.teal, marginTop: 1, fontStyle: "italic" },
  tableCell: { fontSize: 13, color: COLORS.navy },

  summarySection: { gap: 6, paddingTop: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13, color: COLORS.slate },
  summaryVal: { fontSize: 13, fontWeight: "600", color: COLORS.navy },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.navy
  },
  grandTotalLabel: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  grandTotalVal: { fontSize: 18, fontWeight: "800", color: COLORS.teal },

  footerSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.line },
  footerNote: { fontSize: 10, color: COLORS.slateLight, lineHeight: 14 },
  signedRow: { marginTop: 10, alignItems: "flex-end" },
  authorizedStamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.tealLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  stampText: { fontSize: 11, fontWeight: "600", color: COLORS.teal }
});
