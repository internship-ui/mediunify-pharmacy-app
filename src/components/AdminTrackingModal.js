import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function AdminTrackingModal({ visible, onClose }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 768;

  const {
    adminSplitTracking,
    currentTpOrders,
    currentTpProfile
  } = usePharmacy();

  // Find linked order in TP orders (EXT-ORD2001)
  const linkedTpOrder = currentTpOrders.find(o => o.originalOrderId === "ORD1001" || o.id === "EXT-ORD2001");
  const tpStatus = linkedTpOrder ? linkedTpOrder.status : adminSplitTracking.thirdPartyFulfilment.status;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, isDesktop && { maxWidth: 760 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.navy} />
                <Text style={styles.adminBadgeText}>SUPER ADMIN COMMAND CENTER</Text>
              </View>
              <Text style={styles.title}>Split Order Unified Tracking View</Text>
              <Text style={styles.sub}>
                Real-time tracking of patient order split across Central Hub and Multiple Pharmacy
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color={COLORS.navy} />
            </Pressable>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Primary Order Information Box */}
            <View style={styles.primaryOrderBox}>
              <View style={styles.primaryHeaderRow}>
                <View>
                  <Text style={styles.primaryOrderLabel}>ORIGINAL MASTER PRESCRIPTION ORDER</Text>
                  <Text style={styles.primaryOrderId}>#ORD1001 · Ravi Kumar</Text>
                  <Text style={styles.primaryPatientMeta}>
                    Age: 42 · Male · Kuvempunagar, Mysuru · Dr. S. K. Narang (MBBS)
                  </Text>
                </View>
                <View style={styles.splitIndicatorChip}>
                  <Ionicons name="git-branch" size={13} color="#1E40AF" />
                  <Text style={styles.splitIndicatorText}>Split Fulfilment (2 Deliveries)</Text>
                </View>
              </View>

              <View style={styles.unifiedStatsRow}>
                <View style={styles.statMiniCol}>
                  <Text style={styles.miniLabel}>ORDER TOTAL</Text>
                  <Text style={styles.miniVal}>₹639.48</Text>
                </View>
                <View style={styles.statMiniCol}>
                  <Text style={styles.miniLabel}>TOTAL MEDICINES</Text>
                  <Text style={styles.miniVal}>5 items</Text>
                </View>
                <View style={styles.statMiniCol}>
                  <Text style={styles.miniLabel}>PAYMENT</Text>
                  <Text style={[styles.miniVal, { color: "#16A34A" }]}>UPI Prepaid</Text>
                </View>
                <View style={styles.statMiniCol}>
                  <Text style={styles.miniLabel}>ADMIN ESCROW</Text>
                  <Text style={styles.miniVal}>Active</Text>
                </View>
              </View>
            </View>

            {/* Split Comparison Diagram / Cards */}
            <Text style={styles.sectionTitle}>UNIFIED FULFILMENT MATRIX</Text>

            {/* Part 1: Central Hub Fulfilment */}
            <View style={styles.fulfilmentCard}>
              <View style={styles.partHeader}>
                <View style={styles.partBadgeHub}>
                  <Ionicons name="business" size={13} color={COLORS.navy} />
                  <Text style={styles.partBadgeTextHub}>DELIVERY 1: CENTRAL HUB</Text>
                </View>
                <View style={[styles.liveStatusTag, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
                  <Ionicons name="bicycle" size={12} color="#1E40AF" />
                  <Text style={[styles.liveStatusText, { color: "#1E40AF" }]}>Dispatched / Out for Delivery</Text>
                </View>
              </View>

              <Text style={styles.facilityName}>MediUnify Central Fulfillment Hub (Mysuru)</Text>
              <Text style={styles.facilityMeta}>Facility ID: HUB-MYS-01 · In-House Stock Allocation</Text>

              <View style={styles.itemsTable}>
                <Text style={styles.itemsTableHead}>4 MEDICINES AVAILABLE & DISPATCHED IMMEDIATELY:</Text>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.itemRowName}>Paracetamol 500mg (Dolo) × 2</Text>
                  <Text style={styles.itemRowStatus}>Packed</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.itemRowName}>Cetzine 10mg Tablet × 1</Text>
                  <Text style={styles.itemRowStatus}>Packed</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.itemRowName}>Calcirol 60K Sachet × 1</Text>
                  <Text style={styles.itemRowStatus}>Packed</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.itemRowName}>Augmentin 625 Duo Tablet × 1</Text>
                  <Text style={styles.itemRowStatus}>Packed</Text>
                </View>
              </View>

              <View style={styles.courierRow}>
                <Ionicons name="navigate-outline" size={13} color={COLORS.slate} />
                <Text style={styles.courierText}>
                  Fleet Captain: Suresh B. (TVS Jupiter · KA-09-EA-4412) · Handover OTP: 4921 · ETA: 12 mins
                </Text>
              </View>
            </View>

            {/* Part 2: Third-Party Pharmacy (Live Dynamic) */}
            <View style={[styles.fulfilmentCard, styles.fulfilmentCardTp]}>
              <View style={styles.partHeader}>
                <View style={styles.partBadgeTp}>
                  <Ionicons name="medical" size={13} color={COLORS.teal} />
                  <Text style={styles.partBadgeTextTp}>DELIVERY 2: MULTIPLE PHARMACY STORE</Text>
                </View>

                {/* Dynamically mirrors the Third-Party status */}
                <View
                  style={[
                    styles.liveStatusTag,
                    tpStatus === "Pending Acceptance" && { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
                    tpStatus === "Accepted" && { backgroundColor: COLORS.tealLight, borderColor: "#B7E7E3" },
                    tpStatus === "Picking" && { backgroundColor: COLORS.coralLight, borderColor: "#FED7AA" },
                    tpStatus === "Packed" && { backgroundColor: COLORS.aquaLight, borderColor: "#A5F3FC" },
                    tpStatus === "Dispatched" && { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
                    tpStatus === "Delivered" && { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
                    tpStatus === "Rejected" && { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }
                  ]}
                >
                  <Ionicons
                    name={tpStatus === "Delivered" ? "checkmark-done-circle" : "sync"}
                    size={12}
                    color={
                      tpStatus === "Pending Acceptance" || tpStatus === "Rejected"
                        ? "#DC2626"
                        : tpStatus === "Delivered"
                        ? "#16A34A"
                        : COLORS.teal
                    }
                  />
                  <Text
                    style={[
                      styles.liveStatusText,
                      tpStatus === "Pending Acceptance" || tpStatus === "Rejected"
                        ? { color: "#DC2626" }
                        : tpStatus === "Delivered"
                        ? { color: "#16A34A" }
                        : { color: COLORS.teal }
                    ]}
                  >
                    {tpStatus}
                  </Text>
                </View>
              </View>

              <Text style={styles.facilityName}>{currentTpProfile.name}</Text>
              <Text style={styles.facilityMeta}>
                Partner ID: {currentTpProfile.id} · Pharmacist: {currentTpProfile.pharmacistName}
              </Text>

              <View style={[styles.itemsTable, { backgroundColor: "#F0FDF9", borderColor: "#CCFBF1" }]}>
                <Text style={[styles.itemsTableHead, { color: COLORS.teal }]}>
                  1 UNAVAILABLE ITEM ROUTED & ASSIGNED TO PARTNER:
                </Text>
                <View style={styles.itemRow}>
                  <Ionicons
                    name={
                      tpStatus === "Packed" || tpStatus === "Dispatched" || tpStatus === "Delivered"
                        ? "checkmark-circle"
                        : "time-outline"
                    }
                    size={14}
                    color={COLORS.teal}
                  />
                  <Text style={[styles.itemRowName, { fontWeight: "800" }]}>
                    Pan-D Capsule (40mg/30mg) × 1
                  </Text>
                  <Text style={[styles.itemRowStatus, { color: COLORS.teal }]}>
                    Batch: ALK-2026-90 (In Stock)
                  </Text>
                </View>
              </View>

              {/* Real-time sync note */}
              <View style={styles.syncNoteBox}>
                <Ionicons name="information-circle" size={14} color={COLORS.teal} />
                <Text style={styles.syncNoteText}>
                  Any status update by the third-party pharmacist (Accept, Pick, Pack, Dispatch, Deliver) immediately updates this unified Super Admin tracking record.
                </Text>
              </View>
            </View>

            {/* Reassignment Protocol */}
            <View style={styles.reassignProtocolCard}>
              <View style={styles.reassignHeader}>
                <Ionicons name="git-pull-request-outline" size={15} color={COLORS.navy} />
                <Text style={styles.reassignTitle}>Automated Fallback & Reassignment Protocol</Text>
              </View>
              <Text style={styles.reassignDesc}>
                If the third-party pharmacist flags insufficient stock or rejects the item, the MediUnify router automatically reassigns Item #5 to alternative nearby partner pharmacies:
              </Text>
              <View style={styles.altPartnerList}>
                <View style={styles.altPartnerRow}>
                  <Text style={styles.altPartnerName}>• MedPlus Chemist (TP-MEDPLUS-02)</Text>
                  <Text style={styles.altPartnerStock}>12 units available · 4.2 km</Text>
                </View>
                <View style={styles.altPartnerRow}>
                  <Text style={styles.altPartnerName}>• Apollo Partner Chemist (TP-APOLLO-03)</Text>
                  <Text style={styles.altPartnerStock}>8 units available · 6.1 km</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.closeModalBtn} onPress={onClose}>
              <Text style={styles.closeModalBtnText}>Close Admin Tracking View</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 25, 49, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    maxHeight: "92%",
    padding: 20,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 10
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  sub: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  bodyScroll: {
    marginVertical: 12
  },
  primaryOrderBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16
  },
  primaryHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8
  },
  primaryOrderLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  primaryOrderId: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.navyDark,
    marginTop: 2
  },
  primaryPatientMeta: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  splitIndicatorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  splitIndicatorText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF"
  },
  unifiedStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexWrap: "wrap",
    gap: 10
  },
  statMiniCol: {
    minWidth: 80
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.slateLight
  },
  miniVal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navyDark,
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.slate,
    letterSpacing: 0.6,
    marginBottom: 10
  },
  fulfilmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 12
  },
  fulfilmentCardTp: {
    borderColor: "#99F6E4",
    backgroundColor: "#FAFFFE"
  },
  partHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 6
  },
  partBadgeHub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  partBadgeTextHub: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.navy
  },
  partBadgeTp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  partBadgeTextTp: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal
  },
  liveStatusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: "800"
  },
  facilityName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  facilityMeta: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1,
    marginBottom: 8
  },
  itemsTable: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 5,
    marginBottom: 8
  },
  itemsTableHead: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  itemRowName: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navyDark
  },
  itemRowStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  courierText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "600"
  },
  syncNoteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F0FDF9",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CCFBF1"
  },
  syncNoteText: {
    flex: 1,
    fontSize: 10,
    color: "#0F766E",
    fontWeight: "600",
    lineHeight: 14
  },
  reassignProtocolCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  reassignHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  reassignTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  reassignDesc: {
    fontSize: 11,
    color: COLORS.slate,
    lineHeight: 15,
    marginBottom: 6
  },
  altPartnerList: {
    gap: 3
  },
  altPartnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  altPartnerName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navyMuted
  },
  altPartnerStock: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    alignItems: "flex-end"
  },
  closeModalBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8
  },
  closeModalBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800"
  }
});
