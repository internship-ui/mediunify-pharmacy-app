import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Inhaler / Rotacaps",
  "Injection",
  "Sachet",
  "Ointment / Gel",
  "Drops"
];

export default function TPInventoryScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    currentTpProfile,
    currentTpInventory,
    tpAddMedicine,
    tpUpdateMedicine,
    tpAdjustStock,
    tpRecordStockReceived,
    tpToggleMedicineAvailability,
    tpDeleteMedicine
  } = usePharmacy();

  const initialFilter = route?.params?.filter || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDosageForm, setSelectedDosageForm] = useState("All");
  const [activeTab, setActiveTab] = useState(initialFilter); // "All" | "LowStock" | "OutOfStock" | "ExpiringSoon" | "Expired" | "Unavailable"

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
  const [adjustTargetMedicine, setAdjustTargetMedicine] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState("Physical inventory cycle count");

  const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState(false);
  const [receiveTargetMedicine, setReceiveTargetMedicine] = useState(null);
  const [receivedQty, setReceivedQty] = useState("25");
  const [receiveBatch, setReceiveBatch] = useState("");
  const [receiveExpiry, setReceiveExpiry] = useState("");
  const [receiveInvoice, setReceiveInvoice] = useState("");
  const [receiveSupplier, setReceiveSupplier] = useState("Authorized Pharma Distributor");

  // In-screen feedback toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Form states for Add/Edit
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formStrength, setFormStrength] = useState("");
  const [formDosageForm, setFormDosageForm] = useState("Tablet");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formBatchNumber, setFormBatchNumber] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("2027-12");
  const [formStock, setFormStock] = useState("30");
  const [formMinStock, setFormMinStock] = useState("10");
  const [formUnitPrice, setFormUnitPrice] = useState("120.00");
  const [formRackLocation, setFormRackLocation] = useState("Section A-01");
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formScheduleH, setFormScheduleH] = useState(true);

  // Compute stats
  const totalCount = currentTpInventory.length;
  const outOfStockCount = currentTpInventory.filter(i => i.stock === 0).length;
  const lowStockCount = currentTpInventory.filter(i => i.stock > 0 && i.stock <= (i.minStockThreshold || 10)).length;
  const expiredCount = currentTpInventory.filter(i =>
    i.expiryDate && (i.expiryDate.startsWith("2025") || i.expiryDate.startsWith("2024") || i.expiryDate.startsWith("2023"))
  ).length;
  const nearExpiryCount = currentTpInventory.filter(i =>
    i.expiryDate && (i.expiryDate.startsWith("2026-10") || i.expiryDate.startsWith("2026-11") || i.expiryDate.startsWith("2026-12"))
  ).length;
  const unavailableCount = currentTpInventory.filter(i => i.isAvailableForFulfilment === false).length;

  // Filtered Inventory
  const filteredList = useMemo(() => {
    return currentTpInventory.filter(item => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchMfg = item.manufacturer?.toLowerCase().includes(q);
        const matchBatch = item.batchNumber?.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchMfg && !matchBatch && !matchId) return false;
      }

      // Dosage Form
      if (selectedDosageForm !== "All" && item.dosageForm !== selectedDosageForm) {
        return false;
      }

      // Tabs
      const isExpired = item.expiryDate && (
        item.expiryDate.startsWith("2025") || item.expiryDate.startsWith("2024") || item.expiryDate.startsWith("2023")
      );
      const isNearExpiry = item.expiryDate && (
        item.expiryDate.startsWith("2026-10") || item.expiryDate.startsWith("2026-11") || item.expiryDate.startsWith("2026-12")
      );
      const isLow = item.stock > 0 && item.stock <= (item.minStockThreshold || 10);
      const isOut = item.stock === 0;

      if (activeTab === "LowStock") return isLow;
      if (activeTab === "OutOfStock") return isOut;
      if (activeTab === "Expired") return isExpired;
      if (activeTab === "ExpiringSoon") return isNearExpiry;
      if (activeTab === "Unavailable") return item.isAvailableForFulfilment === false;

      return true;
    });
  }, [currentTpInventory, searchQuery, selectedDosageForm, activeTab]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormName("");
    setFormBrand("");
    setFormStrength("");
    setFormDosageForm("Tablet");
    setFormManufacturer("");
    setFormBatchNumber("BAT-" + Math.floor(1000 + Math.random() * 9000));
    setFormExpiryDate("2027-12");
    setFormStock("25");
    setFormMinStock("10");
    setFormUnitPrice("95.00");
    setFormRackLocation("Section A-01");
    setFormIsAvailable(true);
    setFormScheduleH(true);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingMedicine(item);
    setFormName(item.name);
    setFormBrand(item.brand || item.name);
    setFormStrength(item.strength || "");
    setFormDosageForm(item.dosageForm || "Tablet");
    setFormManufacturer(item.manufacturer || "");
    setFormBatchNumber(item.batchNumber || "");
    setFormExpiryDate(item.expiryDate || "");
    setFormStock(String(item.stock));
    setFormMinStock(String(item.minStockThreshold || 10));
    setFormUnitPrice(String(item.unitPrice || ""));
    setFormRackLocation(item.rackLocation || "");
    setFormIsAvailable(item.isAvailableForFulfilment !== false);
    setFormScheduleH(Boolean(item.isScheduleH));
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveMedicine = () => {
    if (!formName.trim()) {
      Alert.alert("Validation Error", "Medicine name is required.");
      return;
    }
    const parsedStock = parseInt(formStock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      Alert.alert("Validation Error", "Available stock quantity must be 0 or greater.");
      return;
    }
    const parsedPrice = parseFloat(formUnitPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Validation Error", "Unit price must be greater than 0.");
      return;
    }
    if (!formBatchNumber.trim()) {
      Alert.alert("Validation Error", "Batch number is mandatory for regulatory compliance.");
      return;
    }
    if (!formExpiryDate.trim()) {
      Alert.alert("Validation Error", "Expiry date (YYYY-MM) is mandatory.");
      return;
    }

    const medData = {
      name: formName.trim(),
      brand: formBrand.trim() || formName.trim(),
      strength: formStrength.trim(),
      dosageForm: formDosageForm,
      manufacturer: formManufacturer.trim() || "Generic Pharma",
      batchNumber: formBatchNumber.trim(),
      expiryDate: formExpiryDate.trim(),
      stock: parsedStock,
      minStockThreshold: parseInt(formMinStock, 10) || 10,
      unitPrice: parsedPrice,
      rackLocation: formRackLocation.trim(),
      isAvailableForFulfilment: formIsAvailable,
      isScheduleH: formScheduleH
    };

    if (editingMedicine) {
      tpUpdateMedicine(editingMedicine.id, medData);
    } else {
      tpAddMedicine(medData);
    }

    setIsAddEditModalOpen(false);
  };

  // Quick stock adjust modal
  const handleOpenStockAdjust = (item) => {
    setAdjustTargetMedicine(item);
    setAdjustDelta(0);
    setAdjustReason("Physical count verification");
    setIsStockAdjustModalOpen(true);
  };

  const handleApplyStockAdjust = () => {
    if (!adjustTargetMedicine) return;
    tpAdjustStock(adjustTargetMedicine.id, adjustDelta, adjustReason);
    setIsStockAdjustModalOpen(false);
  };

  // Receive / Add Stock Handlers
  const handleOpenReceiveStock = (item) => {
    setReceiveTargetMedicine(item);
    setReceivedQty("25");
    setReceiveBatch(item.batchNumber || "BAT-" + Math.floor(1000 + Math.random() * 9000));
    setReceiveExpiry(item.expiryDate || "2027-12");
    setReceiveInvoice("INV-GRN-" + Math.floor(1000 + Math.random() * 9000));
    setReceiveSupplier("Authorized Pharma Distributor");
    setIsReceiveStockModalOpen(true);
  };

  const handleOpenGlobalAddStock = () => {
    const defaultMed = receiveTargetMedicine || currentTpInventory[0] || null;
    if (defaultMed) {
      handleOpenReceiveStock(defaultMed);
    } else {
      handleOpenAdd();
    }
  };

  const handleSetPresetQty = (amount) => {
    setReceivedQty(String(amount));
  };

  const handleIncrementQty = (delta) => {
    const currentVal = parseInt(receivedQty, 10) || 0;
    const nextVal = Math.max(1, currentVal + delta);
    setReceivedQty(String(nextVal));
  };

  const handleApplyReceiveStock = () => {
    if (!receiveTargetMedicine) {
      Alert.alert("Selection Error", "Please select a medicine to add stock to.");
      return;
    }
    const qty = parseInt(receivedQty, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Validation Error", "Please enter a valid stock quantity greater than 0.");
      return;
    }
    const currentStock = receiveTargetMedicine.stock || 0;
    const newStock = currentStock + qty;
    const medName = receiveTargetMedicine.name;

    tpRecordStockReceived(receiveTargetMedicine.id, {
      receivedQty: qty,
      batchNumber: receiveBatch,
      expiryDate: receiveExpiry,
      invoiceNo: receiveInvoice,
      supplier: receiveSupplier
    });
    setIsReceiveStockModalOpen(false);
    showToast(`✓ Added +${qty} units to ${medName}. New stock balance: ${newStock} units.`);
  };

  // Render Medicine Item Card
  const renderMedicineItem = ({ item }) => {
    const isExpired = item.expiryDate && (
      item.expiryDate.startsWith("2025") || item.expiryDate.startsWith("2024") || item.expiryDate.startsWith("2023")
    );
    const isNearExpiry = item.expiryDate && (
      item.expiryDate.startsWith("2026-10") || item.expiryDate.startsWith("2026-11") || item.expiryDate.startsWith("2026-12")
    );
    const isOutOfStock = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock <= (item.minStockThreshold || 10);
    const isUnavailable = item.isAvailableForFulfilment === false;

    return (
      <View style={[styles.medicineCard, isExpired && styles.cardExpired, isUnavailable && styles.cardUnavailable]}>
        {/* Top Header */}
        <View style={styles.cardTopRow}>
          <View style={styles.medNameCol}>
            <View style={styles.nameLockup}>
              <Text style={styles.medName}>{item.name}</Text>
              {item.isScheduleH && (
                <View style={styles.rxBadge}>
                  <Text style={styles.rxBadgeText}>Rx</Text>
                </View>
              )}
            </View>
            <Text style={styles.medBrand}>
              Brand: {item.brand || item.name} · {item.strength || ""} · {item.dosageForm}
            </Text>
            <Text style={styles.medMfg}>Mfg: {item.manufacturer}</Text>
          </View>

          {/* Status Badges */}
          <View style={styles.statusBadgesCol}>
            {isExpired ? (
              <View style={[styles.statusBadge, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
                <Ionicons name="close-circle" size={11} color="#DC2626" />
                <Text style={[styles.statusBadgeText, { color: "#DC2626" }]}>EXPIRED · BLOCKED</Text>
              </View>
            ) : isOutOfStock ? (
              <View style={[styles.statusBadge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                <Ionicons name="alert-circle" size={11} color="#DC2626" />
                <Text style={[styles.statusBadgeText, { color: "#DC2626" }]}>OUT OF STOCK</Text>
              </View>
            ) : isLowStock ? (
              <View style={[styles.statusBadge, { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }]}>
                <Ionicons name="warning" size={11} color="#D97706" />
                <Text style={[styles.statusBadgeText, { color: "#D97706" }]}>LOW STOCK</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
                <Ionicons name="checkmark-circle" size={11} color="#16A34A" />
                <Text style={[styles.statusBadgeText, { color: "#16A34A" }]}>IN STOCK</Text>
              </View>
            )}

            {isNearExpiry && !isExpired && (
              <View style={[styles.statusBadge, { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", marginTop: 4 }]}>
                <Ionicons name="time" size={11} color="#EA580C" />
                <Text style={[styles.statusBadgeText, { color: "#EA580C" }]}>NEAR EXPIRY</Text>
              </View>
            )}

            {isUnavailable && (
              <View style={[styles.statusBadge, { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1", marginTop: 4 }]}>
                <Ionicons name="ban" size={11} color={COLORS.slate} />
                <Text style={[styles.statusBadgeText, { color: COLORS.slate }]}>FULFILMENT DISABLED</Text>
              </View>
            )}
          </View>
        </View>

        {/* Required Fields Detail Grid */}
        <View style={styles.fieldsGrid}>
          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>AVAILABLE QTY</Text>
            <Text style={[styles.fieldValueBold, isOutOfStock && { color: "#DC2626" }, isLowStock && { color: "#D97706" }]}>
              {item.stock} units
            </Text>
          </View>

          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>MIN STOCK LEVEL</Text>
            <Text style={styles.fieldValue}>{item.minStockThreshold || 10} units</Text>
          </View>

          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>BATCH NUMBER</Text>
            <Text style={styles.fieldValueCode}>{item.batchNumber}</Text>
          </View>

          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>EXPIRY DATE</Text>
            <Text style={[styles.fieldValue, isExpired && { color: "#DC2626", fontWeight: "800" }, isNearExpiry && { color: "#EA580C" }]}>
              {item.expiryDate} {isExpired ? "(Expired)" : ""}
            </Text>
          </View>

          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>UNIT PRICE</Text>
            <Text style={styles.fieldValuePrice}>₹{parseFloat(item.unitPrice).toFixed(2)}</Text>
          </View>

          <View style={styles.fieldCell}>
            <Text style={styles.fieldLabel}>RACK LOCATION</Text>
            <Text style={styles.fieldValue}>{item.rackLocation || "Shelf A-1"}</Text>
          </View>
        </View>

        {/* Compliance Warning for Expired Medicine */}
        {isExpired && (
          <View style={styles.expiredAlertBanner}>
            <Ionicons name="shield-alert" size={14} color="#991B1B" />
            <Text style={styles.expiredAlertText}>
              Expired stock is automatically blocked from being allocated to incoming patient orders. Please quarantine or return to supplier.
            </Text>
          </View>
        )}

        {/* Last Audit Note */}
        {item.adjustmentReason ? (
          <View style={styles.auditNoteRow}>
            <Ionicons name="document-text-outline" size={12} color={COLORS.slateLight} />
            <Text style={styles.auditNoteText} numberOfLines={1}>
              Audit: {item.adjustmentReason} · {item.lastStockAdjusted || "Recently"}
            </Text>
          </View>
        ) : null}

        {/* Action Buttons Row */}
        <View style={styles.cardActionsRow}>
          {/* Prominent Primary Button: Add Stock */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              styles.addStockActionBtn,
              Platform.OS === "web" && { cursor: "pointer" },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => handleOpenReceiveStock(item)}
          >
            <Ionicons name="add-circle" size={14} color={COLORS.white} />
            <Text style={styles.addStockActionBtnText}>+ Add Stock</Text>
          </Pressable>

          {/* Quick Adjust */}
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
            onPress={() => handleOpenStockAdjust(item)}
          >
            <Ionicons name="swap-vertical" size={13} color={COLORS.navy} />
            <Text style={styles.actionBtnText}>Adjust (±)</Text>
          </Pressable>

          {/* Toggle Availability */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              isUnavailable && { backgroundColor: COLORS.tealLight, borderColor: "#B7E7E3" },
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => tpToggleMedicineAvailability(item.id)}
          >
            <Ionicons
              name={isUnavailable ? "checkmark-circle-outline" : "ban-outline"}
              size={13}
              color={isUnavailable ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.actionBtnText, isUnavailable && { color: COLORS.teal }]}>
              {isUnavailable ? "Enable" : "Disable"}
            </Text>
          </Pressable>

          {/* Edit Details */}
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
            onPress={() => handleOpenEdit(item)}
          >
            <Ionicons name="pencil" size={13} color={COLORS.slate} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Feedback Toast */}
      {toastMessage ? (
        <View style={styles.toastBar}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
          <Text style={styles.toastBarText} numberOfLines={2}>
            {toastMessage}
          </Text>
          <Pressable onPress={() => setToastMessage(null)} hitSlop={8}>
            <Ionicons name="close" size={16} color={COLORS.white} />
          </Pressable>
        </View>
      ) : null}

      {/* Top Banner & Header */}
      <View style={[styles.topHeaderWrap, isDesktop && styles.topHeaderWrapDesktop]}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageTitle}>Pharmacy Inventory Management</Text>
          <Text style={styles.pageSubtitle}>
            Branch stock catalogue for {currentTpProfile.name} (ID: {currentTpProfile.id})
          </Text>
        </View>

        <View style={styles.headerActionsRow}>
          {/* Primary Action Button: + Add Stock */}
          <Pressable
            style={({ pressed }) => [
              styles.headerAddStockBtn,
              Platform.OS === "web" && { cursor: "pointer" },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleOpenGlobalAddStock}
          >
            <Ionicons name="cube-outline" size={16} color={COLORS.white} />
            <Text style={styles.headerAddStockBtnText}>+ Add Stock</Text>
          </Pressable>

          {/* Secondary Action Button: Register SKU */}
          <Pressable
            style={({ pressed }) => [
              styles.headerAddMedOutlineBtn,
              Platform.OS === "web" && { cursor: "pointer" },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleOpenAdd}
          >
            <Ionicons name="add" size={16} color={COLORS.navy} />
            <Text style={styles.headerAddMedOutlineBtnText}>+ Register Medicine</Text>
          </Pressable>
        </View>
      </View>

      {/* Multiple Pharmacy Exclusive Banner */}
      <View style={styles.exclusiveBanner}>
        <View style={styles.exclusiveBannerPill}>
          <Ionicons name="storefront" size={12} color={COLORS.teal} />
          <Text style={styles.exclusiveBannerPillText}>MULTIPLE PHARMACY EXCLUSIVE</Text>
        </View>
        <Text style={styles.exclusiveBannerText}>
          Inward stock additions and branch catalog management are enabled exclusively for Multiple Pharmacy stores. Central Hub operates strictly in fulfillment routing.
        </Text>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.kpiScroll,
            isDesktop && { maxWidth: 1320, width: "100%", justifyContent: "space-between" }
          ]}
        >
          <Pressable
            style={[styles.kpiChip, activeTab === "All" && styles.kpiChipActive]}
            onPress={() => setActiveTab("All")}
          >
            <Text style={styles.kpiLabel}>Total SKUs</Text>
            <Text style={styles.kpiValue}>{totalCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.kpiChip, activeTab === "LowStock" && styles.kpiChipActive]}
            onPress={() => setActiveTab("LowStock")}
          >
            <Text style={[styles.kpiLabel, { color: "#D97706" }]}>Low Stock</Text>
            <Text style={[styles.kpiValue, { color: "#D97706" }]}>{lowStockCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.kpiChip, activeTab === "OutOfStock" && styles.kpiChipActive]}
            onPress={() => setActiveTab("OutOfStock")}
          >
            <Text style={[styles.kpiLabel, { color: "#DC2626" }]}>Out of Stock</Text>
            <Text style={[styles.kpiValue, { color: "#DC2626" }]}>{outOfStockCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.kpiChip, activeTab === "ExpiringSoon" && styles.kpiChipActive]}
            onPress={() => setActiveTab("ExpiringSoon")}
          >
            <Text style={[styles.kpiLabel, { color: "#EA580C" }]}>Expiring Soon</Text>
            <Text style={[styles.kpiValue, { color: "#EA580C" }]}>{nearExpiryCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.kpiChip, activeTab === "Expired" && styles.kpiChipActive]}
            onPress={() => setActiveTab("Expired")}
          >
            <Text style={[styles.kpiLabel, { color: "#991B1B" }]}>Expired (Blocked)</Text>
            <Text style={[styles.kpiValue, { color: "#991B1B" }]}>{expiredCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.kpiChip, activeTab === "Unavailable" && styles.kpiChipActive]}
            onPress={() => setActiveTab("Unavailable")}
          >
            <Text style={styles.kpiLabel}>Unavailable</Text>
            <Text style={styles.kpiValue}>{unavailableCount}</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Search & Dosage Form Filter */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicine name, brand, batch, manufacturer..."
            placeholderTextColor={COLORS.slateLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dosageScroll}>
          <Pressable
            style={[styles.dosagePill, selectedDosageForm === "All" && styles.dosagePillActive]}
            onPress={() => setSelectedDosageForm("All")}
          >
            <Text style={[styles.dosagePillText, selectedDosageForm === "All" && styles.dosagePillTextActive]}>
              All Forms
            </Text>
          </Pressable>
          {DOSAGE_FORMS.map(df => (
            <Pressable
              key={df}
              style={[styles.dosagePill, selectedDosageForm === df && styles.dosagePillActive]}
              onPress={() => setSelectedDosageForm(df)}
            >
              <Text style={[styles.dosagePillText, selectedDosageForm === df && styles.dosagePillTextActive]}>
                {df}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Main Inventory FlatList */}
      <FlatList
        data={filteredList}
        keyExtractor={item => item.id}
        renderItem={renderMedicineItem}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && { maxWidth: 1320, width: "100%", alignSelf: "center" },
          { paddingBottom: Math.max(insets.bottom, 16) + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="cube-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No medicines found</Text>
            <Text style={styles.emptySub}>
              {searchQuery || activeTab !== "All"
                ? "Try adjusting your search query or filter tab."
                : "Add your first medicine to start fulfilling orders."}
            </Text>
            <Pressable style={styles.emptyAddBtn} onPress={handleOpenAdd}>
              <Text style={styles.emptyAddBtnText}>Add Medicine</Text>
            </Pressable>
          </View>
        }
      />

      {/* ================= MODAL: ADD / EDIT MEDICINE ================= */}
      <Modal visible={isAddEditModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDesktop && { maxWidth: 640 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingMedicine ? `Edit Medicine (${editingMedicine.id})` : "Add Medicine to Inventory"}
                </Text>
                <Text style={styles.modalSub}>
                  Specific to {currentTpProfile.name}
                </Text>
              </View>
              <Pressable onPress={() => setIsAddEditModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGrid}>
                {/* Medicine Name */}
                <View style={styles.formColFull}>
                  <Text style={styles.fLabel}>Medicine Name *</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. Pan-D Capsule"
                    placeholderTextColor={COLORS.slateLight}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>

                {/* Brand & Strength */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Brand Name</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. Pan-D"
                    placeholderTextColor={COLORS.slateLight}
                    value={formBrand}
                    onChangeText={setFormBrand}
                  />
                </View>

                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Strength</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. 40mg/30mg"
                    placeholderTextColor={COLORS.slateLight}
                    value={formStrength}
                    onChangeText={setFormStrength}
                  />
                </View>

                {/* Dosage Form */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Dosage Form *</Text>
                  <View style={styles.dosagePickerWrap}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {DOSAGE_FORMS.map(df => (
                        <Pressable
                          key={df}
                          style={[styles.smallPill, formDosageForm === df && styles.smallPillActive]}
                          onPress={() => setFormDosageForm(df)}
                        >
                          <Text style={[styles.smallPillText, formDosageForm === df && styles.smallPillTextActive]}>
                            {df}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Manufacturer */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Manufacturer</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. Alkem Laboratories Ltd"
                    placeholderTextColor={COLORS.slateLight}
                    value={formManufacturer}
                    onChangeText={setFormManufacturer}
                  />
                </View>

                {/* Batch Number & Expiry Date */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Batch Number *</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. ALK-2026-90"
                    placeholderTextColor={COLORS.slateLight}
                    value={formBatchNumber}
                    onChangeText={setFormBatchNumber}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Expiry Date (YYYY-MM) *</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. 2027-11"
                    placeholderTextColor={COLORS.slateLight}
                    value={formExpiryDate}
                    onChangeText={setFormExpiryDate}
                  />
                </View>

                {/* Stock & Min Stock Level */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Available Stock Quantity *</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. 35"
                    placeholderTextColor={COLORS.slateLight}
                    value={formStock}
                    onChangeText={setFormStock}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Minimum Stock Level</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. 10"
                    placeholderTextColor={COLORS.slateLight}
                    value={formMinStock}
                    onChangeText={setFormMinStock}
                    keyboardType="numeric"
                  />
                </View>

                {/* Unit Price & Rack Location */}
                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Unit Price (₹) *</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. 198.00"
                    placeholderTextColor={COLORS.slateLight}
                    value={formUnitPrice}
                    onChangeText={setFormUnitPrice}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formColHalf}>
                  <Text style={styles.fLabel}>Rack / Storage Location</Text>
                  <TextInput
                    style={styles.fInput}
                    placeholder="e.g. Section C-01 / Shelf 2"
                    placeholderTextColor={COLORS.slateLight}
                    value={formRackLocation}
                    onChangeText={setFormRackLocation}
                  />
                </View>

                {/* Toggle Available for Fulfilment */}
                <View style={styles.formColFull}>
                  <Pressable
                    style={styles.checkboxRow}
                    onPress={() => setFormIsAvailable(!formIsAvailable)}
                  >
                    <Ionicons
                      name={formIsAvailable ? "checkbox" : "square-outline"}
                      size={20}
                      color={formIsAvailable ? COLORS.teal : COLORS.slate}
                    />
                    <Text style={styles.checkboxLabel}>
                      Available for external order fulfilment (MediUnify routed orders)
                    </Text>
                  </Pressable>
                </View>

                {/* Toggle Schedule H */}
                <View style={styles.formColFull}>
                  <Pressable
                    style={styles.checkboxRow}
                    onPress={() => setFormScheduleH(!formScheduleH)}
                  >
                    <Ionicons
                      name={formScheduleH ? "checkbox" : "square-outline"}
                      size={20}
                      color={formScheduleH ? COLORS.navy : COLORS.slate}
                    />
                    <Text style={styles.checkboxLabel}>
                      Schedule H Prescription Drug (Requires verified doctor prescription)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsAddEditModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveBtn} onPress={handleSaveMedicine}>
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                <Text style={styles.saveBtnText}>Save Medicine</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: QUICK STOCK ADJUSTMENT ================= */}
      <Modal visible={isStockAdjustModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 440 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Stock Adjustment</Text>
                <Text style={styles.modalSub}>{adjustTargetMedicine?.name}</Text>
              </View>
              <Pressable onPress={() => setIsStockAdjustModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={COLORS.navy} />
              </Pressable>
            </View>

            <View style={styles.adjustBody}>
              <Text style={styles.currentStockText}>
                Current Stock: <Text style={{ fontWeight: "800", color: COLORS.navyDark }}>{adjustTargetMedicine?.stock} units</Text>
              </Text>

              <View style={styles.deltaControlRow}>
                <Pressable
                  style={styles.deltaBtn}
                  onPress={() => setAdjustDelta(prev => prev - 5)}
                >
                  <Text style={styles.deltaBtnText}>-5</Text>
                </Pressable>
                <Pressable
                  style={styles.deltaBtn}
                  onPress={() => setAdjustDelta(prev => prev - 1)}
                >
                  <Text style={styles.deltaBtnText}>-1</Text>
                </Pressable>

                <View style={styles.deltaDisplay}>
                  <Text style={[styles.deltaDisplayText, adjustDelta > 0 && { color: "#16A34A" }, adjustDelta < 0 && { color: "#DC2626" }]}>
                    {adjustDelta > 0 ? `+${adjustDelta}` : adjustDelta}
                  </Text>
                </View>

                <Pressable
                  style={styles.deltaBtn}
                  onPress={() => setAdjustDelta(prev => prev + 1)}
                >
                  <Text style={styles.deltaBtnText}>+1</Text>
                </Pressable>
                <Pressable
                  style={styles.deltaBtn}
                  onPress={() => setAdjustDelta(prev => prev + 5)}
                >
                  <Text style={styles.deltaBtnText}>+5</Text>
                </Pressable>
              </View>

              <Text style={styles.newResultStock}>
                New Stock Balance: {Math.max(0, (adjustTargetMedicine?.stock || 0) + adjustDelta)} units
              </Text>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fLabel}>Reason for Adjustment *</Text>
                <TextInput
                  style={styles.fInput}
                  value={adjustReason}
                  onChangeText={setAdjustReason}
                  placeholder="e.g. Physical inventory count, damaged item, etc."
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsStockAdjustModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveBtn} onPress={handleApplyStockAdjust}>
                <Text style={styles.saveBtnText}>Update Balance</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD STOCK TO INVENTORY (MULTIPLE PHARMACY EXCLUSIVE) ================= */}
      <Modal visible={isReceiveStockModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <View style={styles.exclusiveModalBadge}>
                    <Text style={styles.exclusiveModalBadgeText}>MULTIPLE PHARMACY</Text>
                  </View>
                  <Text style={styles.modalTitle}>Add Stock to Store</Text>
                </View>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {receiveTargetMedicine ? `${receiveTargetMedicine.name} (${receiveTargetMedicine.strength || "Standard"})` : "Select a medicine"}
                </Text>
              </View>
              <Pressable onPress={() => setIsReceiveStockModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={COLORS.navy} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <View style={styles.receiveBody}>
                {/* Medicine Picker Chips (when multiple items exist) */}
                <View>
                  <Text style={styles.fLabel}>SELECT MEDICINE *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {currentTpInventory.map(med => (
                      <Pressable
                        key={med.id}
                        style={[
                          styles.medSelectChip,
                          receiveTargetMedicine?.id === med.id && styles.medSelectChipActive
                        ]}
                        onPress={() => {
                          setReceiveTargetMedicine(med);
                          setReceiveBatch(med.batchNumber || "");
                          setReceiveExpiry(med.expiryDate || "");
                        }}
                      >
                        <Text
                          style={[
                            styles.medSelectChipText,
                            receiveTargetMedicine?.id === med.id && styles.medSelectChipTextActive
                          ]}
                          numberOfLines={1}
                        >
                          {med.name} ({med.stock} in stock)
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Live Stock Calculation Preview Card */}
                {receiveTargetMedicine ? (
                  <View style={styles.stockPreviewCard}>
                    <View style={styles.stockPreviewCol}>
                      <Text style={styles.stockPreviewLabel}>CURRENT STOCK</Text>
                      <View style={styles.stockPreviewValRow}>
                        <Text style={styles.stockPreviewVal}>{receiveTargetMedicine.stock}</Text>
                        <Text style={styles.stockPreviewUnit}>Units</Text>
                      </View>
                      <View style={[
                        styles.tpStockPill,
                        receiveTargetMedicine.stock === 0 ? styles.tpStockPillOut :
                        receiveTargetMedicine.stock <= 10 ? styles.tpStockPillLow : styles.tpStockPillOk
                      ]}>
                        <Text style={[
                          styles.tpStockPillText,
                          receiveTargetMedicine.stock === 0 ? { color: "#DC2626" } :
                          receiveTargetMedicine.stock <= 10 ? { color: COLORS.coral } : { color: COLORS.teal }
                        ]}>
                          {receiveTargetMedicine.stock === 0 ? "Out of Stock" :
                           receiveTargetMedicine.stock <= 10 ? "Low Stock" : "In Stock"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.stockArrowCol}>
                      <View style={styles.stockArrowCircle}>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.teal} />
                      </View>
                      <View style={styles.inwardDeltaPill}>
                        <Text style={styles.inwardDeltaPillText}>
                          +{parseInt(receivedQty, 10) || 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.stockPreviewCol}>
                      <Text style={[styles.stockPreviewLabel, { color: COLORS.teal }]}>NEW TOTAL</Text>
                      <View style={styles.stockPreviewValRow}>
                        <Text style={[styles.stockPreviewVal, { color: COLORS.teal }]}>
                          {(receiveTargetMedicine.stock || 0) + (parseInt(receivedQty, 10) || 0)}
                        </Text>
                        <Text style={[styles.stockPreviewUnit, { color: COLORS.teal }]}>Units</Text>
                      </View>
                      <View style={styles.tpStockReadyPill}>
                        <Ionicons name="checkmark" size={10} color={COLORS.teal} style={{ marginRight: 2 }} />
                        <Text style={styles.tpStockReadyPillText}>Ready to Apply</Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* Quantity Input with Stepper */}
                <View style={styles.receiveField}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fLabel}>QUANTITY TO ADD</Text>
                    <Text style={styles.fSubLabel}>Units received from vendor</Text>
                  </View>
                  <View style={styles.stepperWrap}>
                    <Pressable
                      style={({ pressed }) => [styles.stepperBtn, pressed && { backgroundColor: "#E2E8F0" }]}
                      onPress={() => handleIncrementQty(-1)}
                    >
                      <Ionicons name="remove" size={18} color={COLORS.navyDark} />
                    </Pressable>
                    <View style={styles.stepperInputWrap}>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="numeric"
                        value={receivedQty}
                        onChangeText={(val) => {
                          const cleaned = val.replace(/[^0-9]/g, "");
                          setReceivedQty(cleaned);
                        }}
                        placeholder="0"
                        placeholderTextColor={COLORS.slateLight}
                        selectTextOnFocus
                      />
                      <Text style={styles.stepperSuffix}>Units</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.stepperBtn, pressed && { backgroundColor: "#E2E8F0" }]}
                      onPress={() => handleIncrementQty(1)}
                    >
                      <Ionicons name="add" size={18} color={COLORS.navyDark} />
                    </Pressable>
                  </View>

                  {/* Quick Preset Pills */}
                  <View style={styles.quickPillsRow}>
                    <Text style={styles.quickPillsHeading}>Presets:</Text>
                    {[10, 25, 50, 100, 200].map(preset => {
                      const isActive = receivedQty === String(preset);
                      return (
                        <Pressable
                          key={preset}
                          style={({ pressed }) => [
                            styles.quickQtyChip,
                            isActive && styles.quickQtyChipActive,
                            pressed && { opacity: 0.8 }
                          ]}
                          onPress={() => handleSetPresetQty(preset)}
                        >
                          <Text
                            style={[
                              styles.quickQtyChipText,
                              isActive && styles.quickQtyChipTextActive
                            ]}
                          >
                            +{preset}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Batch Number & Expiry Date Row */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={[styles.receiveField, { flex: 1 }]}>
                    <Text style={styles.fLabel}>BATCH NUMBER</Text>
                    <View style={styles.fInputWithIcon}>
                      <Ionicons name="barcode-outline" size={16} color={COLORS.slate} style={{ marginRight: 6 }} />
                      <TextInput
                        style={styles.fInputClean}
                        value={receiveBatch}
                        onChangeText={setReceiveBatch}
                        placeholder="e.g. BAT-9912"
                        placeholderTextColor={COLORS.slateLight}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={[styles.receiveField, { flex: 1 }]}>
                    <Text style={styles.fLabel}>EXPIRY DATE</Text>
                    <View style={styles.fInputWithIcon}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.slate} style={{ marginRight: 6 }} />
                      <TextInput
                        style={styles.fInputClean}
                        value={receiveExpiry}
                        onChangeText={setReceiveExpiry}
                        placeholder="YYYY-MM (e.g. 2028-06)"
                        placeholderTextColor={COLORS.slateLight}
                      />
                    </View>
                  </View>
                </View>

                {/* Supplier & Invoice */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[styles.receiveField, { flex: 1 }]}>
                    <Text style={styles.fLabel}>SUPPLIER / DISTRIBUTOR</Text>
                    <TextInput
                      style={styles.fInput}
                      value={receiveSupplier}
                      onChangeText={setReceiveSupplier}
                      placeholder="e.g. Authorized Pharma Distributor"
                    />
                  </View>

                  <View style={[styles.receiveField, { flex: 1 }]}>
                    <Text style={styles.fLabel}>INVOICE / CHALLAN #</Text>
                    <TextInput
                      style={styles.fInput}
                      value={receiveInvoice}
                      onChangeText={setReceiveInvoice}
                      placeholder="e.g. INV-9912-KA"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setIsReceiveStockModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  styles.saveBtnAddStock,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleApplyReceiveStock}
              >
                <Ionicons name="cube" size={16} color={COLORS.white} />
                <Text style={styles.saveBtnText}>
                  Confirm & Add Stock (+{parseInt(receivedQty, 10) || 0} Units)
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topHeaderWrap: {
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  topHeaderWrapDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14
  },
  headerLeft: {
    flex: 1
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  pageSubtitle: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  addMedicineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    shadowColor: COLORS.teal,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  addMedicineBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  kpiContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 8
  },
  kpiScroll: {
    paddingHorizontal: 16,
    gap: 10
  },
  kpiChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center"
  },
  kpiChipActive: {
    backgroundColor: COLORS.tealLight,
    borderColor: COLORS.teal
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark,
    marginTop: 2
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: COLORS.bg
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.navyDark,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  dosageScroll: {
    gap: 8
  },
  dosagePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  dosagePillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy
  },
  dosagePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  dosagePillTextActive: {
    color: COLORS.white,
    fontWeight: "700"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12
  },
  medicineCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardExpired: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFFDFD"
  },
  cardUnavailable: {
    opacity: 0.85,
    backgroundColor: "#FAFBFB"
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  medNameCol: {
    flex: 1,
    paddingRight: 12
  },
  nameLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  medName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  rxBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  rxBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#DC2626"
  },
  medBrand: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted,
    marginTop: 2
  },
  medMfg: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  statusBadgesCol: {
    alignItems: "flex-end"
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  fieldsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
    marginBottom: 10
  },
  fieldCell: {
    width: "30%",
    minWidth: 95
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyDark,
    marginTop: 2
  },
  fieldValueBold: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark,
    marginTop: 1
  },
  fieldValueCode: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 2
  },
  fieldValuePrice: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.teal,
    marginTop: 2
  },
  expiredAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 8
  },
  expiredAlertText: {
    fontSize: 11,
    color: "#991B1B",
    fontWeight: "600",
    flex: 1,
    lineHeight: 15
  },
  auditNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10
  },
  auditNoteText: {
    fontSize: 11,
    color: COLORS.slate,
    fontStyle: "italic"
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.slate,
    textAlign: "center",
    maxWidth: 280
  },
  emptyAddBtn: {
    marginTop: 8,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 25, 44, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
    shadowColor: COLORS.navy,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  modalFormScroll: {
    maxHeight: 460
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  formColFull: {
    width: "100%"
  },
  formColHalf: {
    width: "48%"
  },
  fLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navyMuted,
    marginBottom: 5
  },
  fInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.navyDark,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  dosagePickerWrap: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 6
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  smallPillActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  smallPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate
  },
  smallPillTextActive: {
    color: COLORS.white,
    fontWeight: "800"
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted,
    flex: 1
  },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  adjustBody: {
    gap: 12
  },
  currentStockText: {
    fontSize: 13,
    color: COLORS.slate
  },
  deltaControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10
  },
  deltaBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center"
  },
  deltaBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navy
  },
  deltaDisplay: {
    minWidth: 60,
    alignItems: "center"
  },
  deltaDisplayText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  newResultStock: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy,
    textAlign: "center"
  },
  receiveBody: {
    gap: 10
  },
  receiveField: {
    gap: 4
  },

  // Add Stock Highlight Button on Card
  addStockActionBtn: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.tealDark,
    paddingHorizontal: 12
  },
  addStockActionBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800"
  },

  // Feedback Toast
  toastBar: {
    backgroundColor: "#065F46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10
  },
  toastBarText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    flex: 1
  },

  // Header Actions Row
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  headerAddStockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  headerAddStockBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },
  headerAddMedOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8
  },
  headerAddMedOutlineBtnText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "700"
  },

  // Exclusive Banner
  exclusiveBanner: {
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#CCFBF1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  exclusiveBannerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  exclusiveBannerPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  exclusiveBannerText: {
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "500",
    flex: 1,
    minWidth: 260
  },

  // Modal Extras
  exclusiveModalBadge: {
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  exclusiveModalBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  medSelectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  medSelectChipActive: {
    backgroundColor: COLORS.tealLight,
    borderColor: COLORS.teal
  },
  medSelectChipText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "600"
  },
  medSelectChipTextActive: {
    color: COLORS.teal,
    fontWeight: "800"
  },
  stockPreviewCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  stockPreviewCol: {
    flex: 1,
    alignItems: "center"
  },
  stockPreviewLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slate,
    letterSpacing: 0.5,
    marginBottom: 3
  },
  stockPreviewValRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 4
  },
  stockPreviewVal: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  stockPreviewUnit: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  tpStockPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  tpStockPillOut: {
    backgroundColor: "#FEE2E2"
  },
  tpStockPillLow: {
    backgroundColor: "#FEF3C7"
  },
  tpStockPillOk: {
    backgroundColor: COLORS.tealLight
  },
  tpStockPillText: {
    fontSize: 9,
    fontWeight: "800"
  },
  stockArrowCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  stockArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  inwardDeltaPill: {
    marginTop: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10
  },
  inwardDeltaPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal
  },
  tpStockReadyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  tpStockReadyPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  fSubLabel: {
    fontSize: 10,
    color: COLORS.slateLight,
    fontWeight: "600"
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    overflow: "hidden"
  },
  stepperBtn: {
    width: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  stepperInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  stepperInput: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navyDark,
    textAlign: "center",
    minWidth: 50,
    paddingVertical: 6,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  stepperSuffix: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate,
    marginLeft: 4
  },
  quickPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8
  },
  quickPillsHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate,
    marginRight: 2
  },
  quickQtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  quickQtyChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  quickQtyChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  quickQtyChipTextActive: {
    color: COLORS.white
  },
  fInputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4
  },
  fInputClean: {
    flex: 1,
    fontSize: 12,
    color: COLORS.navyDark,
    fontWeight: "700",
    padding: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  saveBtnAddStock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  }
});
