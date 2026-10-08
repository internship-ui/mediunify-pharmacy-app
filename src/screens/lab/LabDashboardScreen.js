// MediUnify Lab Dashboard Screen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";

export function LabDashboardScreen({ onNavigate, onSelectOrder }) {
  const {
    orders,
    staff,
    centers,
    activeCenterId,
    dateFilter,
    setDateFilter
  } = useLab();

  const [localDateFilter, setLocalDateFilter] = useState("Today");

  // Filter orders by center if selected
  const filteredOrders = orders.filter(o => {
    if (activeCenterId !== "ALL" && o.centerId !== activeCenterId) return false;
    return true;
  });

  // Calculate top operational metrics
  const totalOrdersCount = filteredOrders.length;
  const newOrdersCount = filteredOrders.filter(o => o.orderStatus === "NEW").length;
  const pendingVerificationCount = filteredOrders.filter(o => o.orderStatus === "PENDING VERIFICATION").length;
  const sampleCollectionPendingCount = filteredOrders.filter(o => o.orderStatus === "VERIFIED" || o.orderStatus === "COLLECTION SCHEDULED").length;
  const samplesCollectedCount = filteredOrders.filter(o => o.orderStatus === "SAMPLE COLLECTED" || o.orderStatus === "SAMPLE RECEIVED").length;
  const processingCount = filteredOrders.filter(o => o.orderStatus === "PROCESSING").length;
  const reportsPendingCount = filteredOrders.filter(o => o.orderStatus === "REPORT PENDING").length;
  const reportsReadyCount = filteredOrders.filter(o => o.orderStatus === "REPORT READY" || o.orderStatus === "VERIFIED REPORT").length;
  const completedCount = filteredOrders.filter(o => o.orderStatus === "COMPLETED").length;

  const topMetricCards = [
    { label: "Total Orders", count: totalOrdersCount, icon: "file-tray-full", color: COLORS.navy, tab: "ALL" },
    { label: "New Bookings", count: newOrdersCount, icon: "sparkles", color: "#1D4ED8", tab: "NEW", alert: newOrdersCount > 0 },
    { label: "Pending Verification", count: pendingVerificationCount, icon: "time", color: "#D97706", tab: "PENDING VERIFICATION" },
    { label: "Collection Pending", count: sampleCollectionPendingCount, icon: "bicycle", color: "#7C3AED", tab: "COLLECTION SCHEDULED" },
    { label: "Samples Collected", count: samplesCollectedCount, icon: "color-fill", color: COLORS.teal, tab: "SAMPLE COLLECTED" },
    { label: "Processing Assays", count: processingCount, icon: "flask", color: "#EA580C", tab: "PROCESSING" },
    { label: "Reports Pending", count: reportsPendingCount, icon: "document-text", color: "#E11D48", tab: "REPORT PENDING" },
    { label: "Reports Ready", count: reportsReadyCount, icon: "shield-checkmark", color: "#16A34A", tab: "REPORT READY" },
    { label: "Completed", count: completedCount, icon: "checkmark-done-circle", color: "#334155", tab: "COMPLETED" }
  ];

  // Specific Sub-Lists
  const todayOrders = filteredOrders.slice(0, 5);
  const sampleCollections = filteredOrders.filter(o => o.orderStatus === "COLLECTION SCHEDULED" || o.orderStatus === "SAMPLE COLLECTED");
  const reportsPendingList = filteredOrders.filter(o => o.orderStatus === "REPORT PENDING" || o.orderStatus === "REPORT READY");
  const recentlyCompleted = filteredOrders.filter(o => o.orderStatus === "COMPLETED");

  const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Custom Date"];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date Filter Bar & Live Operation Status */}
      <View style={styles.topControlRow}>
        <View style={styles.liveIndicatorWrap}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE LAB OPERATIONS · NABL ACCREDITED SPECIMEN TRACKING</Text>
        </View>

        <View style={styles.dateFilterGroup}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.navy} />
          {dateOptions.map(option => (
            <Pressable
              key={option}
              style={[
                styles.dateOptionBtn,
                localDateFilter === option && styles.dateOptionBtnActive
              ]}
              onPress={() => setLocalDateFilter(option)}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  localDateFilter === option && styles.dateOptionTextActive
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 9 Top Operational Metrics Cards */}
      <View style={styles.metricsGrid}>
        {topMetricCards.map((card, idx) => (
          <Pressable
            key={idx}
            style={[
              styles.metricCard,
              { borderLeftColor: card.color },
              card.alert && styles.metricCardAlert
            ]}
            onPress={() => onNavigate && onNavigate("Orders", card.tab)}
          >
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: `${card.color}15` }]}>
                <Ionicons name={card.icon} size={18} color={card.color} />
              </View>
              {card.alert && (
                <View style={styles.actionPill}>
                  <Text style={styles.actionPillText}>Action Req</Text>
                </View>
              )}
            </View>
            <Text style={styles.metricCount}>{card.count}</Text>
            <Text style={styles.metricLabel}>{card.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Main Operational Sections Grid */}
      <View style={styles.sectionRow}>
        {/* Section A: Today's Orders Queue */}
        <View style={[styles.cardBox, { flex: 3 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="list" size={18} color={COLORS.navy} />
              <Text style={styles.cardTitle}>Today's Operational Orders</Text>
            </View>
            <Pressable onPress={() => onNavigate && onNavigate("Orders", "ALL")}>
              <Text style={styles.viewAllText}>View All ({filteredOrders.length}) →</Text>
            </Pressable>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.2 }]}>ORDER ID</Text>
            <Text style={[styles.th, { flex: 2 }]}>PATIENT</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>PACKAGE / TEST</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>TYPE</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>ACTION</Text>
          </View>

          {todayOrders.map((order, idx) => (
            <Pressable
              key={order.id}
              style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
              onPress={() => onSelectOrder && onSelectOrder(order.id)}
            >
              <Text style={[styles.tdBold, { flex: 1.2 }]}>{order.id}</Text>
              <View style={{ flex: 2 }}>
                <Text style={styles.tdPatientName}>{order.patient.name}</Text>
                <Text style={styles.tdPatientSub}>{order.patient.age}y/{order.patient.gender} · {order.patient.phone}</Text>
              </View>
              <View style={{ flex: 2.5 }}>
                <Text style={styles.tdTestName} numberOfLines={1}>{order.itemTitle}</Text>
                <Text style={styles.tdTestSub}>{order.category}</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.tdBookingType}>{order.bookingType === "Home Sample Collection" ? "Home Visit" : "Lab Visit"}</Text>
              </View>
              <View style={{ flex: 1.8 }}>
                <LabStatusBadge status={order.orderStatus} size="small" />
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <View style={styles.viewRowBtn}>
                  <Text style={styles.viewRowBtnText}>Details</Text>
                  <Ionicons name="chevron-forward" size={12} color={COLORS.navy} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Section E: Phlebotomist / Staff Availability */}
        <View style={[styles.cardBox, { flex: 2 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="bicycle" size={18} color={COLORS.teal} />
              <Text style={styles.cardTitle}>Phlebotomist Fleet Status</Text>
            </View>
            <Pressable onPress={() => onNavigate && onNavigate("CollectionStaff")}>
              <Text style={styles.viewAllText}>Manage Fleet →</Text>
            </Pressable>
          </View>

          <View style={styles.staffList}>
            {staff.map(s => (
              <View key={s.id} style={styles.staffRow}>
                <View style={styles.staffAvatar}>
                  <Ionicons name="person" size={16} color={COLORS.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={styles.staffName}>{s.name}</Text>
                    <LabStatusBadge status={s.availability} size="small" />
                  </View>
                  <Text style={styles.staffSub}>{s.serviceArea}</Text>
                  <Text style={styles.staffAssignments}>
                    Today: <Text style={{ fontWeight: "700", color: COLORS.navy }}>{s.todayAssignments} Active</Text> · {s.completedCollections} Completed
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Secondary Operational Sections Grid */}
      <View style={styles.sectionRow}>
        {/* Section B: Today's Sample Collections & Cold Chain */}
        <View style={[styles.cardBox, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="color-fill" size={18} color="#7C3AED" />
              <Text style={styles.cardTitle}>Sample Collections & Dispatch</Text>
            </View>
            <Pressable onPress={() => onNavigate && onNavigate("SampleManagement")}>
              <Text style={styles.viewAllText}>View All Samples →</Text>
            </Pressable>
          </View>

          {sampleCollections.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>All scheduled collections up to date.</Text>
            </View>
          ) : (
            sampleCollections.map((o, idx) => (
              <Pressable
                key={o.id}
                style={[styles.subListItem, idx > 0 && styles.subListItemBorder]}
                onPress={() => onSelectOrder && onSelectOrder(o.id)}
              >
                <View style={styles.subListHeader}>
                  <Text style={styles.subListTitle}>{o.id} · {o.patient.name}</Text>
                  <LabStatusBadge status={o.orderStatus} size="small" />
                </View>
                <Text style={styles.subListDesc}>
                  Slot: {o.collectionSchedule?.timeSlot || "Morning"} · Phlebotomist: {o.assignedStaff?.name || "Unassigned"}
                </Text>
                <Text style={styles.subListMeta}>
                  Tubes: {o.samples.map(s => s.sampleType).join(", ")}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Section C: Reports Pending Pathologist Review */}
        <View style={[styles.cardBox, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text" size={18} color="#E11D48" />
              <Text style={styles.cardTitle}>Pathology Reports Review</Text>
            </View>
            <Pressable onPress={() => onNavigate && onNavigate("Reports")}>
              <Text style={styles.viewAllText}>Reports Desk →</Text>
            </Pressable>
          </View>

          {reportsPendingList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No reports pending pathologist review.</Text>
            </View>
          ) : (
            reportsPendingList.map((o, idx) => (
              <Pressable
                key={o.id}
                style={[styles.subListItem, idx > 0 && styles.subListItemBorder]}
                onPress={() => onSelectOrder && onSelectOrder(o.id)}
              >
                <View style={styles.subListHeader}>
                  <Text style={styles.subListTitle}>{o.id} · {o.patient.name}</Text>
                  <LabStatusBadge status={o.orderStatus} size="small" />
                </View>
                <Text style={styles.subListDesc}>{o.itemTitle}</Text>
                <Text style={styles.subListMeta}>
                  Awaiting: {o.orderStatus === "REPORT PENDING" ? "PDF Upload & Param Entry" : "Pathologist Digital Signature"}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Section D: Recently Completed Orders */}
        <View style={[styles.cardBox, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
              <Text style={styles.cardTitle}>Recently Dispatched Reports</Text>
            </View>
            <Pressable onPress={() => onNavigate && onNavigate("Reports")}>
              <Text style={styles.viewAllText}>Vault →</Text>
            </Pressable>
          </View>

          {recentlyCompleted.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No completed reports in this window.</Text>
            </View>
          ) : (
            recentlyCompleted.map((o, idx) => (
              <Pressable
                key={o.id}
                style={[styles.subListItem, idx > 0 && styles.subListItemBorder]}
                onPress={() => onSelectOrder && onSelectOrder(o.id)}
              >
                <View style={styles.subListHeader}>
                  <Text style={styles.subListTitle}>{o.id} · {o.patient.name}</Text>
                  <LabStatusBadge status="DELIVERED" size="small" />
                </View>
                <Text style={styles.subListDesc}>{o.itemTitle}</Text>
                <Text style={styles.subListMeta}>
                  Dispatched to {o.patient.phone} via WhatsApp & SMS
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>

      {/* Section F & G: Order Status Distribution & Booking Trends */}
      <View style={styles.sectionRow}>
        {/* Section F: Order Status Distribution */}
        <View style={[styles.cardBox, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="pie-chart-outline" size={18} color={COLORS.navy} />
              <Text style={styles.cardTitle}>Order Status Stage Distribution</Text>
            </View>
          </View>
          <View style={styles.distributionBox}>
            {[
              { label: "New / Verification", count: newOrdersCount + pendingVerificationCount, total: totalOrdersCount, color: "#1D4ED8" },
              { label: "Sample Scheduling & Collection", count: sampleCollectionPendingCount + samplesCollectedCount, total: totalOrdersCount, color: COLORS.teal },
              { label: "Processing in Lab", count: processingCount, total: totalOrdersCount, color: "#EA580C" },
              { label: "Reporting & Verification", count: reportsPendingCount + reportsReadyCount, total: totalOrdersCount, color: "#E11D48" },
              { label: "Delivered / Completed", count: completedCount, total: totalOrdersCount, color: "#16A34A" }
            ].map((item, idx) => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <View key={idx} style={styles.distRow}>
                  <View style={styles.distLabelRow}>
                    <Text style={styles.distLabel}>{item.label}</Text>
                    <Text style={styles.distCount}>{item.count} orders ({pct}%)</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section G: Checkup Package Booking Trends */}
        <View style={[styles.cardBox, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="trending-up-outline" size={18} color={COLORS.teal} />
              <Text style={styles.cardTitle}>Popular vs Curated Package Trends</Text>
            </View>
          </View>
          <View style={styles.trendsBox}>
            <View style={styles.trendTile}>
              <View style={styles.trendTileHeader}>
                <Ionicons name="star" size={16} color="#D97706" />
                <Text style={styles.trendTileTitle}>Popular Checkup Master Packages</Text>
              </View>
              <Text style={styles.trendTileDesc}>
                Top demand: <Text style={{ fontWeight: "700", color: COLORS.navy }}>Novus Executive Essentials (POP-EXE-01)</Text> & Senior Citizen Comprehensive.
              </Text>
            </View>

            <View style={styles.trendTile}>
              <View style={styles.trendTileHeader}>
                <Ionicons name="heart" size={16} color={COLORS.coral} />
                <Text style={styles.trendTileTitle}>Curated Wellness & Deficiencies</Text>
              </View>
              <Text style={styles.trendTileDesc}>
                Top demand: <Text style={{ fontWeight: "700", color: COLORS.navy }}>Vitamin & Nutrition Profile (CUR-LSW-01)</Text> & Hair Fall Assessment.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40
  },
  topControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12
  },
  liveIndicatorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#A7F3D0"
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981"
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  dateFilterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.card,
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  dateOptionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  dateOptionBtnActive: {
    backgroundColor: COLORS.navy
  },
  dateOptionText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  dateOptionTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1
  },
  metricCardAlert: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A"
  },
  metricCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  actionPill: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  actionPillText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "800"
  },
  metricCount: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 2
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate,
    marginTop: 2
  },
  sectionRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap"
  },
  cardBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    minWidth: 280
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4
  },
  th: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA"
  },
  tdBold: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  tdPatientName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  tdPatientSub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  tdTestName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted
  },
  tdTestSub: {
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 1
  },
  tdBookingType: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: "600"
  },
  viewRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  viewRowBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy
  },
  staffList: {
    gap: 10
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navyLight,
    alignItems: "center",
    justifyContent: "center"
  },
  staffName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  staffSub: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  staffAssignments: {
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 2
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 20
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.slateLight
  },
  subListItem: {
    paddingVertical: 8
  },
  subListItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  subListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subListTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  subListDesc: {
    fontSize: 11,
    color: COLORS.navyMuted,
    marginTop: 2
  },
  subListMeta: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  distributionBox: {
    gap: 12
  },
  distRow: {
    gap: 4
  },
  distLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  distLabel: {
    fontSize: 11,
    color: COLORS.navyMuted,
    fontWeight: "600"
  },
  distCount: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3
  },
  trendsBox: {
    gap: 10
  },
  trendTile: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
    gap: 4
  },
  trendTileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  trendTileTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  trendTileDesc: {
    fontSize: 11,
    color: COLORS.slate,
    lineHeight: 15
  }
});
