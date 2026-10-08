// MediUnify Lab Orders Management Screen
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab, ORDER_STATUSES } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";

export function LabOrdersScreen({ initialStatus = "ALL", onSelectOrder }) {
  const {
    orders,
    staff,
    centers,
    activeCenterId
  } = useLab();

  const [selectedStatus, setSelectedStatus] = useState(initialStatus || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("ALL");
  const [selectedCenterFilter, setSelectedCenterFilter] = useState("ALL");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Global center filter
      if (activeCenterId !== "ALL" && order.centerId !== activeCenterId) return false;
      // Local center dropdown
      if (selectedCenterFilter !== "ALL" && order.centerId !== selectedCenterFilter) return false;

      // Status filter
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "Sample Collection") {
          if (order.orderStatus !== "VERIFIED" && order.orderStatus !== "COLLECTION SCHEDULED") return false;
        } else if (selectedStatus === "Report Pending") {
          if (order.orderStatus !== "REPORT PENDING") return false;
        } else if (selectedStatus === "Report Ready") {
          if (order.orderStatus !== "REPORT READY" && order.orderStatus !== "VERIFIED REPORT") return false;
        } else if (order.orderStatus !== selectedStatus) {
          return false;
        }
      }

      // Booking type filter
      if (selectedBookingType !== "ALL" && order.bookingType !== selectedBookingType) return false;

      // Payment filter
      if (selectedPaymentStatus !== "ALL" && order.paymentStatus !== selectedPaymentStatus) return false;

      // Staff filter
      if (selectedStaffFilter !== "ALL") {
        if (!order.assignedStaff || (order.assignedStaff.staffId !== selectedStaffFilter && order.assignedStaff.id !== selectedStaffFilter)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = order.id.toLowerCase().includes(query);
        const matchPatient = order.patient?.name?.toLowerCase().includes(query);
        const matchPhone = order.patient?.phone?.toLowerCase().includes(query);
        const matchTest = order.itemTitle?.toLowerCase().includes(query);
        const matchBarcode = order.samples?.some(s => s.barcode?.toLowerCase().includes(query));
        if (!matchId && !matchPatient && !matchPhone && !matchTest && !matchBarcode) return false;
      }

      return true;
    });
  }, [orders, activeCenterId, selectedStatus, selectedBookingType, selectedPaymentStatus, selectedCenterFilter, selectedStaffFilter, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSearchQuery("");
    setSelectedBookingType("ALL");
    setSelectedPaymentStatus("ALL");
    setSelectedCenterFilter("ALL");
    setSelectedStaffFilter("ALL");
    setPage(1);
  };

  // Status Tab options with dynamic counts
  const statusTabs = [
    { key: "ALL", label: "All Orders", count: orders.length },
    { key: "NEW", label: "New", count: orders.filter(o => o.orderStatus === "NEW").length },
    { key: "PENDING VERIFICATION", label: "Pending Verification", count: orders.filter(o => o.orderStatus === "PENDING VERIFICATION").length },
    { key: "COLLECTION SCHEDULED", label: "Sample Collection", count: orders.filter(o => o.orderStatus === "COLLECTION SCHEDULED" || o.orderStatus === "VERIFIED").length },
    { key: "SAMPLE COLLECTED", label: "Sample Collected", count: orders.filter(o => o.orderStatus === "SAMPLE COLLECTED").length },
    { key: "SAMPLE RECEIVED", label: "Sample Received", count: orders.filter(o => o.orderStatus === "SAMPLE RECEIVED").length },
    { key: "PROCESSING", label: "Processing", count: orders.filter(o => o.orderStatus === "PROCESSING").length },
    { key: "REPORT PENDING", label: "Report Pending", count: orders.filter(o => o.orderStatus === "REPORT PENDING").length },
    { key: "REPORT READY", label: "Report Ready", count: orders.filter(o => o.orderStatus === "REPORT READY" || o.orderStatus === "VERIFIED REPORT").length },
    { key: "COMPLETED", label: "Completed", count: orders.filter(o => o.orderStatus === "COMPLETED").length },
    { key: "CANCELLED", label: "Cancelled", count: orders.filter(o => o.orderStatus === "CANCELLED").length }
  ];

  return (
    <View style={styles.container}>
      {/* Top Status Tabs Bar */}
      <View style={styles.statusTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScroll}>
          {statusTabs.map(tab => (
            <Pressable
              key={tab.key}
              style={[
                styles.statusTabBtn,
                selectedStatus === tab.key && styles.statusTabBtnActive
              ]}
              onPress={() => {
                setSelectedStatus(tab.key);
                setPage(1);
              }}
            >
              <Text style={[styles.statusTabText, selectedStatus === tab.key && styles.statusTabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.statusTabBadge, selectedStatus === tab.key && styles.statusTabBadgeActive]}>
                <Text style={[styles.statusTabBadgeText, selectedStatus === tab.key && styles.statusTabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Filter & Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID, Patient Name, Phone, Test Name, Barcode..."
            placeholderTextColor={COLORS.slateLight}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(1);
            }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>

        {/* Dropdown Filters */}
        <View style={styles.filterChipsRow}>
          {/* Booking Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Type:</Text>
            {["ALL", "Home Sample Collection", "Lab Visit"].map(type => (
              <Pressable
                key={type}
                style={[
                  styles.filterChip,
                  selectedBookingType === type && styles.filterChipActive
                ]}
                onPress={() => {
                  setSelectedBookingType(type);
                  setPage(1);
                }}
              >
                <Text style={[styles.filterChipText, selectedBookingType === type && styles.filterChipTextActive]}>
                  {type === "ALL" ? "All Types" : type === "Home Sample Collection" ? "Home Visit" : "Lab Visit"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Payment Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Payment:</Text>
            {["ALL", "Paid", "Pending", "Refunded"].map(pay => (
              <Pressable
                key={pay}
                style={[
                  styles.filterChip,
                  selectedPaymentStatus === pay && styles.filterChipActive
                ]}
                onPress={() => {
                  setSelectedPaymentStatus(pay);
                  setPage(1);
                }}
              >
                <Text style={[styles.filterChipText, selectedPaymentStatus === pay && styles.filterChipTextActive]}>
                  {pay === "ALL" ? "All Payments" : pay}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Reset Filters Button */}
          <Pressable style={styles.resetBtn} onPress={handleResetFilters}>
            <Ionicons name="refresh-outline" size={14} color={COLORS.slate} />
            <Text style={styles.resetBtnText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* Orders Table */}
      <ScrollView style={styles.tableScroll} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tableContainer}>
          {/* Table Column Headers */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1.1 }]}>ORDER ID</Text>
            <Text style={[styles.th, { flex: 2.2 }]}>PATIENT DETAILS</Text>
            <Text style={[styles.th, { flex: 2.4 }]}>TEST / PACKAGE</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>BOOKING TYPE</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>CENTER</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>DATES</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>PAYMENT</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>STAFF</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>ACTION</Text>
          </View>

          {paginatedOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={36} color={COLORS.slateLight} />
              <Text style={styles.emptyTitle}>No matching lab orders found</Text>
              <Text style={styles.emptySub}>Try adjusting your search query, status tab, or active filters.</Text>
              <Pressable style={styles.emptyResetBtn} onPress={handleResetFilters}>
                <Text style={styles.emptyResetBtnText}>Clear All Filters</Text>
              </Pressable>
            </View>
          ) : (
            paginatedOrders.map((order, idx) => (
              <Pressable
                key={order.id}
                style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                onPress={() => onSelectOrder && onSelectOrder(order.id)}
              >
                {/* Order ID & Price */}
                <View style={{ flex: 1.1 }}>
                  <Text style={styles.orderIdText}>{order.id}</Text>
                  <Text style={styles.orderAmountText}>₹{order.totalAmount}</Text>
                </View>

                {/* Patient Info */}
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.patientNameText}>{order.patient.name}</Text>
                  <Text style={styles.patientSubText}>
                    {order.patient.age}y / {order.patient.gender} · {order.patient.phone}
                  </Text>
                  <Text style={styles.patientAddressText} numberOfLines={1}>
                    {order.patient.address}
                  </Text>
                </View>

                {/* Test / Package */}
                <View style={{ flex: 2.4 }}>
                  <Text style={styles.testTitleText} numberOfLines={1}>{order.itemTitle}</Text>
                  <Text style={styles.testCategoryText}>{order.category}</Text>
                  <Text style={styles.testCountText}>{order.testIds?.length || 1} Tests Included</Text>
                </View>

                {/* Booking Type */}
                <View style={{ flex: 1.4 }}>
                  <View style={[styles.typeBadge, { backgroundColor: order.bookingType === "Home Sample Collection" ? COLORS.aquaLight : "#F1F5F9" }]}>
                    <Ionicons
                      name={order.bookingType === "Home Sample Collection" ? "home-outline" : "business-outline"}
                      size={11}
                      color={order.bookingType === "Home Sample Collection" ? "#0891B2" : COLORS.navy}
                    />
                    <Text style={[styles.typeBadgeText, { color: order.bookingType === "Home Sample Collection" ? "#0891B2" : COLORS.navy }]}>
                      {order.bookingType === "Home Sample Collection" ? "Home Visit" : "Lab Visit"}
                    </Text>
                  </View>
                </View>

                {/* Center */}
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.centerNameText} numberOfLines={1}>{order.centerName}</Text>
                </View>

                {/* Dates */}
                <View style={{ flex: 1.4 }}>
                  <Text style={styles.dateLabel}>Booked: {order.bookingDate.replace("Today, ", "")}</Text>
                  <Text style={styles.dateSub}>Slot: {order.preferredDate} ({order.preferredTime.slice(0, 8)})</Text>
                </View>

                {/* Payment */}
                <View style={{ flex: 1.2 }}>
                  <View style={[styles.payChip, { backgroundColor: order.paymentStatus === "Paid" ? "#ECFDF5" : "#FEF2F2" }]}>
                    <Text style={[styles.payChipText, { color: order.paymentStatus === "Paid" ? "#059669" : "#DC2626" }]}>
                      {order.paymentStatus}
                    </Text>
                  </View>
                </View>

                {/* Order Status */}
                <View style={{ flex: 1.6 }}>
                  <LabStatusBadge status={order.orderStatus} size="small" />
                </View>

                {/* Assigned Staff */}
                <View style={{ flex: 1.6 }}>
                  {order.assignedStaff ? (
                    <View style={styles.staffPill}>
                      <Ionicons name="person" size={11} color={COLORS.navy} />
                      <Text style={styles.staffPillText} numberOfLines={1}>{order.assignedStaff.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.unassignedText}>Unassigned</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={{ flex: 1.2, alignItems: "flex-end" }}>
                  <Pressable
                    style={styles.detailsBtn}
                    onPress={() => onSelectOrder && onSelectOrder(order.id)}
                  >
                    <Text style={styles.detailsBtnText}>View</Text>
                    <Ionicons name="chevron-forward" size={12} color={COLORS.navy} />
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Pagination Bar */}
        <View style={styles.paginationBar}>
          <Text style={styles.paginationText}>
            Showing <Text style={{ fontWeight: "700", color: COLORS.navy }}>{paginatedOrders.length}</Text> of{" "}
            <Text style={{ fontWeight: "700", color: COLORS.navy }}>{filteredOrders.length}</Text> orders
          </Text>

          <View style={styles.pageButtonsRow}>
            <Pressable
              style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              disabled={page === 1}
              onPress={() => setPage(p => Math.max(1, p - 1))}
            >
              <Ionicons name="chevron-back" size={14} color={page === 1 ? COLORS.slateLight : COLORS.navy} />
              <Text style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}>Prev</Text>
            </Pressable>

            <Text style={styles.pageNumberText}>
              Page {page} of {totalPages}
            </Text>

            <Pressable
              style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
              disabled={page === totalPages}
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <Text style={[styles.pageBtnText, page === totalPages && styles.pageBtnTextDisabled]}>Next</Text>
              <Ionicons name="chevron-forward" size={14} color={page === totalPages ? COLORS.slateLight : COLORS.navy} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  statusTabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  statusTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  statusTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  statusTabBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy
  },
  statusTabText: {
    fontSize: 12,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    gap: 10
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
  filterChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  filterChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  filterChipActive: {
    backgroundColor: COLORS.tealLight,
    borderWidth: 1,
    borderColor: COLORS.teal
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  filterChipTextActive: {
    color: COLORS.teal,
    fontWeight: "700"
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  resetBtnText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "600"
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA"
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  orderAmountText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal,
    marginTop: 2
  },
  patientNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  patientSubText: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  patientAddressText: {
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 1
  },
  testTitleText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted
  },
  testCategoryText: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  testCountText: {
    fontSize: 9,
    color: COLORS.teal,
    fontWeight: "700",
    marginTop: 1
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700"
  },
  centerNameText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  dateLabel: {
    fontSize: 10,
    color: COLORS.slate,
    fontWeight: "600"
  },
  dateSub: {
    fontSize: 9,
    color: COLORS.slateLight,
    marginTop: 1
  },
  payChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  payChipText: {
    fontSize: 10,
    fontWeight: "800"
  },
  staffPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start"
  },
  staffPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.navy
  },
  unassignedText: {
    fontSize: 10,
    color: COLORS.slateLight,
    fontStyle: "italic"
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  emptyContainer: {
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
  emptyResetBtn: {
    marginTop: 8,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  emptyResetBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },
  paginationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4
  },
  paginationText: {
    fontSize: 12,
    color: COLORS.slate
  },
  pageButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  pageBtnDisabled: {
    opacity: 0.5
  },
  pageBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  pageBtnTextDisabled: {
    color: COLORS.slateLight
  },
  pageNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  }
});
