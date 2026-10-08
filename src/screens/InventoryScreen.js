import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

const CATEGORIES = [
  "All",
  "Antibiotics",
  "Pain Relief",
  "Diabetes",
  "Cardiac",
  "Vitamins",
  "Gastro",
  "Respiratory",
  "First Aid"
];

const SORT_OPTIONS = [
  { key: "stock_asc", label: "Stock: Low → High", icon: "arrow-up" },
  { key: "stock_desc", label: "Stock: High → Low", icon: "arrow-down" },
  { key: "expiry_soon", label: "Expiring Soonest", icon: "time-outline" },
  { key: "name_asc", label: "Name (A-Z)", icon: "text-outline" }
];

export default function InventoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 375;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { inventory, quickAdjustStock, toggleInventoryItemStatus } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All"); // "All" | "LowStock" | "OutOfStock" | "ExpiringSoon" | "Healthy"
  const [sortBy, setSortBy] = useState("stock_asc"); // default to Low to High so low/out-of-stock appear first!

  // Compute key statistics
  const totalItems = inventory.length;

  const outOfStockList = useMemo(() => {
    return inventory.filter(i => i.stock === 0);
  }, [inventory]);

  const lowStockList = useMemo(() => {
    return inventory.filter(i => i.stock > 0 && i.stock <= (i.minStockThreshold || 15));
  }, [inventory]);

  const expiringSoonList = useMemo(() => {
    return inventory.filter(
      i => i.expiryDate && (i.expiryDate.startsWith("2026") || i.expiryDate.startsWith("2025"))
    );
  }, [inventory]);

  const healthyStockList = useMemo(() => {
    return inventory.filter(i => i.stock > (i.minStockThreshold || 15));
  }, [inventory]);

  const totalUnits = useMemo(() => {
    return inventory.reduce((sum, item) => sum + item.stock, 0);
  }, [inventory]);

  // Filter & Sort inventory
  const displayedInventory = useMemo(() => {
    let result = inventory.filter(item => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchGeneric = item.genericName?.toLowerCase().includes(q);
        const matchMfg = item.manufacturer?.toLowerCase().includes(q);
        const matchId = item.id?.toLowerCase().includes(q);
        const matchRack = item.rackLocation?.toLowerCase().includes(q);
        const matchBatch = item.batchNumber?.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchMfg && !matchId && !matchRack && !matchBatch) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter matching
      if (selectedFilter === "OutOfStock") {
        return item.stock === 0;
      }
      if (selectedFilter === "LowStock") {
        return item.stock > 0 && item.stock <= (item.minStockThreshold || 15);
      }
      if (selectedFilter === "ExpiringSoon") {
        return item.expiryDate && (item.expiryDate.startsWith("2026") || item.expiryDate.startsWith("2025"));
      }
      if (selectedFilter === "Healthy") {
        return item.stock > (item.minStockThreshold || 15);
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "stock_asc") {
        return a.stock - b.stock; // Low to High (0, 6, 8, 14, ...)
      }
      if (sortBy === "stock_desc") {
        return b.stock - a.stock; // High to Low (220, 190, 140, ...)
      }
      if (sortBy === "expiry_soon") {
        return (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999");
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [inventory, searchQuery, selectedCategory, selectedFilter, sortBy]);

  // Render individual item card
  const renderItem = ({ item }) => {
    const isOut = item.stock === 0;
    const isLow = !isOut && item.stock <= (item.minStockThreshold || 15);
    const isHealthy = !isOut && !isLow;
    const isExpiring = item.expiryDate && (item.expiryDate.startsWith("2026") || item.expiryDate.startsWith("2025"));

    // Calculate stock visual fill percentage (relative to minThreshold * 4)
    const maxReference = Math.max(item.minStockThreshold * 4, 100);
    const progressPercent = Math.min(100, Math.round((item.stock / maxReference) * 100));

    return (
      <View style={[styles.card, isOut && styles.cardOut, isLow && styles.cardLow]}>
        {/* Top Header: SKU Badge + Status Pill + Online Toggle */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.skuBadge}>
              <Text style={styles.skuBadgeText}>{item.id}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            {item.isScheduleH && (
              <View style={styles.rxBadge}>
                <Ionicons name="shield" size={10} color="#DC2626" />
                <Text style={styles.rxBadgeText}>Rx Schedule H</Text>
              </View>
            )}
          </View>

          <View style={styles.activeToggleWrap}>
            <Text style={[styles.activeStatusText, { color: item.isActive ? COLORS.teal : COLORS.slateLight }]}>
              {item.isActive ? "Active" : "Paused"}
            </Text>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleInventoryItemStatus(item.id)}
              trackColor={{ false: COLORS.line, true: COLORS.tealLight }}
              thumbColor={item.isActive ? COLORS.teal : COLORS.slateLight}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
          </View>
        </View>

        {/* Medicine Title & Formulation */}
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.genericName} numberOfLines={1}>
          <Text style={{ fontWeight: "700" }}>Salt:</Text> {item.genericName}
        </Text>
        <Text style={styles.mfgText}>Mfg: {item.manufacturer} · {item.unit}</Text>

        {/* Warehouse Rack / Picking Location Banner */}
        <View style={styles.locationBar}>
          <View style={styles.locationBarLeft}>
            <Ionicons name="location" size={13} color={COLORS.navy} />
            <Text style={styles.locationBarText}>{item.rackLocation}</Text>
          </View>
          <Text style={styles.batchBarText}>Batch: {item.batchNumber}</Text>
        </View>

        {/* Stock Level Display & Progress Indicator */}
        <View style={styles.stockStatusContainer}>
          <View style={styles.stockStatusTopRow}>
            <View style={styles.stockCountWrap}>
              <Text
                style={[
                  styles.stockNumberText,
                  isOut && { color: "#DC2626" },
                  isLow && { color: "#C2410C" },
                  isHealthy && { color: "#065F46" }
                ]}
              >
                {item.stock} <Text style={styles.stockUnitsLabel}>units available</Text>
              </Text>
              <Text
                style={[
                  styles.stockAlertText,
                  isOut && { color: "#DC2626", fontWeight: "800" },
                  isLow && { color: "#C2410C", fontWeight: "700" },
                  isHealthy && { color: COLORS.slate }
                ]}
              >
                {isOut ? "🔴 OUT OF STOCK" : isLow ? `⚠️ LOW STOCK (Min buffer: ${item.minStockThreshold})` : "🟢 IN STOCK (Ready for packing)"}
              </Text>
            </View>

            {/* Read-Only Stock Status Badge */}
            <View
              style={[
                styles.readOnlyBadge,
                isOut && { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
                isLow && { backgroundColor: "#FFEDD5", borderColor: "#FDBA74" },
                isHealthy && { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }
              ]}
            >
              <Ionicons
                name={isOut ? "close-circle" : isLow ? "alert-circle" : "checkmark-circle"}
                size={14}
                color={isOut ? "#DC2626" : isLow ? "#C2410C" : "#059669"}
              />
              <Text
                style={[
                  styles.readOnlyBadgeText,
                  isOut && { color: "#DC2626" },
                  isLow && { color: "#C2410C" },
                  isHealthy && { color: "#059669" }
                ]}
              >
                {isOut ? "0 Available" : `${item.stock} Units`}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
                isOut && { backgroundColor: "#DC2626" },
                isLow && { backgroundColor: COLORS.coral },
                isHealthy && { backgroundColor: COLORS.teal }
              ]}
            />
          </View>
        </View>

        {/* Expiry & Pricing Footer */}
        <View style={styles.cardFooter}>
          {/* Expiry alert tag */}
          <View style={[styles.expiryTag, isExpiring && styles.expiryTagUrgent]}>
            <Ionicons
              name={isExpiring ? "alert-circle" : "calendar-outline"}
              size={13}
              color={isExpiring ? "#DC2626" : COLORS.slate}
            />
            <Text style={[styles.expiryTagText, isExpiring && styles.expiryTagTextUrgent]}>
              {isExpiring ? `Expiring: ${item.expiryDate} (Action Needed)` : `Exp: ${item.expiryDate}`}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceSelling}>₹{item.sellingPrice.toFixed(2)}</Text>
            <Text style={styles.priceMrp}>MRP ₹{item.mrp.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, isDesktop && styles.innerContainerDesktop, isTablet && styles.innerContainerTablet]}>
        {/* 4 Interactive KPI Stock Level Tiles (2x2 grid for mobile) */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiGridContainer}>
            {/* Row 1 */}
            <View style={styles.kpiRow}>
              {/* Out of Stock Tile */}
              <Pressable
                style={({ pressed }) => [
                  styles.kpiTile,
                  selectedFilter === "OutOfStock" && styles.kpiTileActiveOut,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => setSelectedFilter(selectedFilter === "OutOfStock" ? "All" : "OutOfStock")}
              >
                <View style={styles.kpiTileHeader}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: "#FEE2E2" }]}>
                    <Ionicons name="close-circle" size={14} color="#DC2626" />
                  </View>
                  <Text style={[styles.kpiVal, { color: "#DC2626" }]}>{outOfStockList.length}</Text>
                </View>
                <Text style={styles.kpiLabel}>Out of Stock</Text>
              </Pressable>

              {/* Low Stock Alert Tile */}
              <Pressable
                style={({ pressed }) => [
                  styles.kpiTile,
                  selectedFilter === "LowStock" && styles.kpiTileActiveLow,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => setSelectedFilter(selectedFilter === "LowStock" ? "All" : "LowStock")}
              >
                <View style={styles.kpiTileHeader}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.coralLight }]}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.coral} />
                  </View>
                  <Text style={[styles.kpiVal, { color: "#C2410C" }]}>{lowStockList.length}</Text>
                </View>
                <Text style={styles.kpiLabel}>Low Stock Alert</Text>
              </Pressable>
            </View>

            {/* Row 2 */}
            <View style={styles.kpiRow}>
              {/* Expiring Soon Tile */}
              <Pressable
                style={({ pressed }) => [
                  styles.kpiTile,
                  selectedFilter === "ExpiringSoon" && styles.kpiTileActiveExp,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => setSelectedFilter(selectedFilter === "ExpiringSoon" ? "All" : "ExpiringSoon")}
              >
                <View style={styles.kpiTileHeader}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="time" size={14} color="#D97706" />
                  </View>
                  <Text style={[styles.kpiVal, { color: "#D97706" }]}>{expiringSoonList.length}</Text>
                </View>
                <Text style={styles.kpiLabel}>Expiring Soon</Text>
              </Pressable>

              {/* Healthy In-Stock Tile */}
              <Pressable
                style={({ pressed }) => [
                  styles.kpiTile,
                  selectedFilter === "Healthy" && styles.kpiTileActiveGood,
                  pressed && { opacity: 0.85 }
                ]}
                onPress={() => setSelectedFilter(selectedFilter === "Healthy" ? "All" : "Healthy")}
              >
                <View style={styles.kpiTileHeader}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: COLORS.tealLight }]}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.teal} />
                  </View>
                  <Text style={[styles.kpiVal, { color: COLORS.teal }]}>{healthyStockList.length}</Text>
                </View>
                <Text style={styles.kpiLabel}>Healthy Stock</Text>
              </Pressable>
            </View>
          </View>

          {/* Sub Header info bar */}
          <View style={styles.kpiSubRow}>
            <Text style={styles.kpiSubText}>
              Showing <Text style={{ fontWeight: "800", color: COLORS.navy }}>{displayedInventory.length}</Text> of {totalItems} SKUs ({totalUnits} units)
            </Text>
            {selectedFilter !== "All" && (
              <Pressable style={styles.clearFilterChip} onPress={() => setSelectedFilter("All")}>
                <Text style={styles.clearFilterChipText}>Filter: {selectedFilter} ✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={17} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicine, salt, batch, rack location..."
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

        {/* Sort By Pills (Low to High, High to Low, Expiring Soonest) */}
        <View style={styles.sortScrollWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            <Text style={styles.sortLabel}>SORT BY:</Text>
            {SORT_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
                onPress={() => setSortBy(opt.key)}
              >
                <Ionicons
                  name={opt.icon}
                  size={12}
                  color={sortBy === opt.key ? COLORS.white : COLORS.slate}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Pills */}
        <View style={styles.catScrollWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Main Stock List */}
        <FlatList
          data={displayedInventory}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 30 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={COLORS.slateLight} />
              <Text style={styles.emptyTitle}>No Medicines Found</Text>
              <Text style={styles.emptySub}>No stock records matching the current filter or search criteria.</Text>
              {(searchQuery.length > 0 || selectedFilter !== "All" || selectedCategory !== "All") && (
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedFilter("All");
                  }}
                >
                  <Text style={styles.resetBtnText}>Reset All Filters</Text>
                </Pressable>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  innerContainer: {
    flex: 1
  },
  innerContainerDesktop: {
    maxWidth: 1320,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 14
  },
  innerContainerTablet: {
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 8
  },

  // KPI Tiles
  kpiContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  kpiGridContainer: { gap: 8 },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpiTile: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center"
  },
  kpiTileActiveOut: { backgroundColor: "#FEE2E2", borderColor: "#DC2626" },
  kpiTileActiveLow: { backgroundColor: COLORS.coralLight, borderColor: COLORS.coral },
  kpiTileActiveExp: { backgroundColor: "#FEF3C7", borderColor: "#D97706" },
  kpiTileActiveGood: { backgroundColor: COLORS.tealLight, borderColor: COLORS.teal },

  kpiTileHeader: { flexDirection: "row", alignItems: "center", gap: 5 },
  kpiIconWrap: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  kpiVal: { fontSize: 15, fontWeight: "800", color: COLORS.navy },
  kpiLabel: { fontSize: 10, color: COLORS.slate, marginTop: 2, fontWeight: "700", textAlign: "center" },

  kpiSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  kpiSubText: { fontSize: 11, color: COLORS.slate },
  clearFilterChip: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  clearFilterChipText: { fontSize: 10, fontWeight: "700", color: COLORS.navy },

  listContent: {
    padding: 14
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.navy, padding: 0 },

  // Sort Scroll
  sortScrollWrap: { marginBottom: 6 },
  sortScroll: { paddingHorizontal: 14, alignItems: "center", gap: 6 },
  sortLabel: { fontSize: 10, fontWeight: "800", color: COLORS.slate, letterSpacing: 0.5, marginRight: 2 },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  sortChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  sortChipText: { fontSize: 11, fontWeight: "600", color: COLORS.slate },
  sortChipTextActive: { color: COLORS.white, fontWeight: "700" },

  // Categories Scroll
  catScrollWrap: { marginBottom: 4 },
  catScroll: { paddingHorizontal: 14, gap: 6 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#F1F5F9"
  },
  catChipActive: { backgroundColor: COLORS.tealLight },
  catChipText: { fontSize: 10, fontWeight: "700", color: COLORS.slate },
  catChipTextActive: { color: COLORS.teal },

  // Inventory Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardOut: {
    borderColor: "#FECACA",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    backgroundColor: "#FFFBFB"
  },
  cardLow: {
    borderColor: "#FED7AA",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
    backgroundColor: "#FFFDFB"
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  skuBadge: { backgroundColor: COLORS.navyLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  skuBadgeText: { fontSize: 10, fontWeight: "800", color: COLORS.navy },
  categoryBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryBadgeText: { fontSize: 10, fontWeight: "600", color: COLORS.slate },
  rxBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  rxBadgeText: { fontSize: 9, fontWeight: "800", color: "#DC2626" },

  activeToggleWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  activeStatusText: { fontSize: 10, fontWeight: "700" },

  medicineName: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  genericName: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  mfgText: { fontSize: 11, color: COLORS.slateLight, marginTop: 2 },

  // Location bar
  locationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8
  },
  locationBarLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationBarText: { fontSize: 11, fontWeight: "700", color: COLORS.navy },
  batchBarText: { fontSize: 10, color: COLORS.slate },

  // Stock status section
  stockStatusContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  stockStatusTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  stockCountWrap: { flex: 1 },
  stockNumberText: { fontSize: 18, fontWeight: "800" },
  stockUnitsLabel: { fontSize: 12, fontWeight: "500", color: COLORS.slate },
  stockAlertText: { fontSize: 10, marginTop: 2, letterSpacing: 0.3 },

  readOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  readOnlyBadgeText: {
    fontSize: 12,
    fontWeight: "800"
  },

  progressBarTrack: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden"
  },
  progressBarFill: { height: "100%", borderRadius: 3 },

  // Card Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  expiryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  expiryTagUrgent: { backgroundColor: "#FEE2E2" },
  expiryTagText: { fontSize: 11, color: COLORS.slate, fontWeight: "500" },
  expiryTagTextUrgent: { color: "#DC2626", fontWeight: "700" },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  priceSelling: { fontSize: 14, fontWeight: "800", color: COLORS.teal },
  priceMrp: { fontSize: 11, color: COLORS.slateLight, textDecorationLine: "line-through" },

  // Empty state
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: COLORS.navy, marginTop: 12 },
  emptySub: { fontSize: 12, color: COLORS.slate, marginTop: 4, textAlign: "center" },
  resetBtn: {
    marginTop: 14,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  resetBtnText: { color: COLORS.navy, fontSize: 12, fontWeight: "700" }
});
