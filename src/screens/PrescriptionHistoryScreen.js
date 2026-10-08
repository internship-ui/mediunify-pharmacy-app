import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Modal,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function PrescriptionHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { orders } = usePharmacy();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRxImage, setSelectedRxImage] = useState(null);

  // Filter only orders with prescriptions
  const prescriptionOrders = orders.filter(o => o.type === "prescription" || o.prescriptionImage);

  const filteredOrders = prescriptionOrders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.doctorName && order.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === "All") return true;
    if (selectedFilter === "Active") return ["New", "Accepted", "Picking", "Packed", "CaptainAssigned"].includes(order.status);
    if (selectedFilter === "Completed") return ["HandedOver", "Delivered"].includes(order.status);
    if (selectedFilter === "Rejected") return order.status === "Rejected";
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, isDesktop && styles.innerContainerDesktop, isTablet && styles.innerContainerTablet]}>
        {/* Search Bar */}
        <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={17} color={COLORS.slate} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient, doctor, or Order ID..."
          placeholderTextColor={COLORS.slateLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS !== "ios" && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={COLORS.slate} />
          </Pressable>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {["All", "Active", "Completed", "Rejected"].map(filter => (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
              pressed && { opacity: 0.85 }
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Prescription List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 30 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
            <Text style={styles.emptySubtitle}>Try changing your search keywords or active filters</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.rxCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>{item.id} · {item.invoiceNo || "INV-2026"}</Text>
                <Text style={styles.patientName}>{item.patientName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === "Delivered" || item.status === "HandedOver" ? COLORS.tealLight : item.status === "Rejected" ? "#FDE8E8" : "#FFF1E8" }]}>
                <Text style={[styles.statusBadgeText, { color: item.status === "Delivered" || item.status === "HandedOver" ? COLORS.teal : item.status === "Rejected" ? "#DC2626" : COLORS.coral }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {item.doctorName && (
              <View style={styles.doctorInfoRow}>
                <Ionicons name="person-outline" size={14} color={COLORS.navy} />
                <Text style={styles.doctorInfoText}>{item.doctorName} · {item.clinicName}</Text>
              </View>
            )}

            {/* Thumbnail + Items preview */}
            <View style={styles.rxPreviewRow}>
              {item.prescriptionImage ? (
                <Pressable onPress={() => setSelectedRxImage(item.prescriptionImage)} style={styles.thumbnailWrap}>
                  <Image source={{ uri: item.prescriptionImage }} style={styles.rxThumbnail} />
                  <View style={styles.zoomOverlay}>
                    <Ionicons name="expand-outline" size={14} color={COLORS.white} />
                  </View>
                </Pressable>
              ) : (
                <View style={[styles.thumbnailWrap, styles.placeholderThumbnail]}>
                  <Ionicons name="cart-outline" size={24} color={COLORS.slateLight} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.prescribedTitle}>Prescribed Medicines ({item.items.length}):</Text>
                {item.items.slice(0, 3).map((med, idx) => (
                  <Text key={idx} style={styles.medItemText} numberOfLines={1}>
                    • {med.name} (x{med.qty})
                  </Text>
                ))}
                {item.items.length > 3 && (
                  <Text style={styles.moreMedsText}>+{item.items.length - 3} more items</Text>
                )}
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · ₹{item.totalAmount}
              </Text>
              <View style={styles.footerActions}>
                <Pressable
                  style={styles.invoiceBtn}
                  onPress={() => navigation.navigate("Invoice", { orderId: item.id })}
                >
                  <Ionicons name="receipt-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.invoiceBtnText}>Invoice</Text>
                </Pressable>
                <Pressable
                  style={styles.detailsBtn}
                  onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
                >
                  <Text style={styles.detailsBtnText}>Order Details</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      </View>

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedRxImage} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Prescription Document</Text>
            <Pressable onPress={() => setSelectedRxImage(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </Pressable>
          </View>
          {selectedRxImage && (
            <Image
              source={{ uri: selectedRxImage }}
              style={styles.modalFullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  innerContainer: { flex: 1 },
  innerContainerDesktop: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12
  },
  innerContainerTablet: {
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 8
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: COLORS.navy },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  filterChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  filterChipText: { fontSize: 12, fontWeight: "600", color: COLORS.slate },
  filterChipTextActive: { color: COLORS.white },

  rxCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontSize: 11, color: COLORS.slateLight, fontWeight: "600" },
  patientName: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },

  doctorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 8
  },
  doctorInfoText: { fontSize: 12, color: COLORS.navy, fontWeight: "500" },

  rxPreviewRow: { flexDirection: "row", gap: 12, marginTop: 12, alignItems: "center" },
  thumbnailWrap: {
    width: 65,
    height: 75,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.line,
    position: "relative"
  },
  placeholderThumbnail: { justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  rxThumbnail: { width: "100%", height: "100%" },
  zoomOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    padding: 2
  },

  prescribedTitle: { fontSize: 12, fontWeight: "700", color: COLORS.slate, marginBottom: 3 },
  medItemText: { fontSize: 12, color: COLORS.navy, marginVertical: 1 },
  moreMedsText: { fontSize: 11, color: COLORS.teal, fontWeight: "600", marginTop: 2 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  dateText: { fontSize: 12, color: COLORS.slate, fontWeight: "600" },
  footerActions: { flexDirection: "row", gap: 8 },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  invoiceBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.navy },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  detailsBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.white },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.navy, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: COLORS.slate, marginTop: 4, textAlign: "center" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(10, 20, 64, 0.95)", padding: 20, justifyContent: "center" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  closeBtn: { padding: 4 },
  modalFullImage: { width: "100%", height: "80%", borderRadius: 12 }
});
