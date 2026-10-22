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
import * as XLSX from "xlsx";
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
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    inventory,
    restockItem,
    addInventoryItem,
    bulkUpdateStockFromExcel,
    currentUser,
    pharmacyProfile
  } = usePharmacy();

  const isThirdParty = !!(currentUser?.isThirdParty || pharmacyProfile?.isThirdParty || currentUser?.role === "third_party");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ================= EXCEL STOCK UPLOAD STATE =================
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelData, setExcelData] = useState(null);

  // ================= STOCK INWARD & NEW ITEM MODAL STATE =================
  const [isSingleEditModalOpen, setIsSingleEditModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("inward"); // "inward" | "new_item"
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [singleAddQty, setSingleAddQty] = useState("25");
  const [singleBatchNumber, setSingleBatchNumber] = useState("");
  const [singleExpiryDate, setSingleExpiryDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");

  // New Item Registration State
  const [newName, setNewName] = useState("");
  const [newGeneric, setNewGeneric] = useState("");
  const [newCategory, setNewCategory] = useState("Antibiotics");
  const [newManufacturer, setNewManufacturer] = useState("");
  const [newUnit, setNewUnit] = useState("Strip of 10 Tablets");
  const [newStock, setNewStock] = useState("40");
  const [newMinStock, setNewMinStock] = useState("10");
  const [newMrp, setNewMrp] = useState("120");
  const [newSellingPrice, setNewSellingPrice] = useState("105");
  const [newBatchNumber, setNewBatchNumber] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("2028-12");
  const [newRackLocation, setNewRackLocation] = useState("Rack B-01 / Shelf 2");
  const [newIsScheduleH, setNewIsScheduleH] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All"); // "All" | "LowStock" | "OutOfStock" | "ExpiringSoon" | "Healthy"
  const [sortBy, setSortBy] = useState("stock_asc");

  // ================= EXCEL BULK STOCK METHODS =================

  // 1. Download Pre-formatted Excel Template
  const handleDownloadExcelTemplate = () => {
    try {
      const headers = [
        "SKU",
        "Medicine Name",
        "Category",
        "Current Stock",
        "Stock to Add (+)",
        "New Total Stock (Override)",
        "Batch Number",
        "Expiry Date (YYYY-MM)",
        "Selling Price (INR)"
      ];

      const rows = inventory.map(item => [
        item.id,
        item.name,
        item.category || "General",
        item.stock,
        25, // default suggested addition
        "", // override blank
        item.batchNumber || "BAT-2026",
        item.expiryDate || "2027-12",
        item.sellingPrice || 100
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock_Update");
      XLSX.writeFile(workbook, `MediUnify_Stock_Template_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("✓ Excel stock template downloaded! Edit the quantities and upload to update.");
    } catch (err) {
      console.error("Template download error:", err);
      showToast("Could not download Excel template. Please try again.");
    }
  };

  // 2. Pick and Parse File from Disk
  const handlePickExcelFile = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv";
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          parseExcelFile(file);
        }
      };
      input.click();
    } else {
      Alert.alert("Excel Import", "Excel upload is supported on the web portal. Please use a desktop browser.");
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processSheetRows(json, file.name);
      } catch (err) {
        console.error("Error reading Excel:", err);
        Alert.alert("Parsing Error", "Could not parse Excel file. Please ensure it is a valid .xlsx or .csv spreadsheet.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 3. Process Sheet Rows and Reconcile with Inventory
  const processSheetRows = (rows, fileName) => {
    if (!rows || rows.length < 2) {
      Alert.alert("Empty File", "The uploaded sheet does not contain enough data rows.");
      return;
    }

    const headers = rows[0].map(h => String(h || "").trim().toLowerCase());

    const skuIdx = headers.findIndex(h => h.includes("sku") || h.includes("code") || h.includes("id"));
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("medicine"));
    const addQtyIdx = headers.findIndex(h => h.includes("add") || h.includes("inward") || h.includes("received") || h.includes("qty"));
    const newStockIdx = headers.findIndex(h => h.includes("new stock") || h.includes("total stock") || h.includes("override"));
    const batchIdx = headers.findIndex(h => h.includes("batch"));
    const expiryIdx = headers.findIndex(h => h.includes("expiry") || h.includes("exp"));

    const parsedItems = [];
    let matchedCount = 0;
    let unitsToAdd = 0;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawSku = skuIdx !== -1 ? String(row[skuIdx] || "").trim() : "";
      const rawName = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
      if (!rawSku && !rawName) continue;

      const matchedInv = inventory.find(i =>
        (rawSku && i.id.toUpperCase() === rawSku.toUpperCase()) ||
        (rawName && i.name.toLowerCase() === rawName.toLowerCase())
      );

      const addQty = addQtyIdx !== -1 && row[addQtyIdx] !== undefined && row[addQtyIdx] !== ""
        ? parseInt(row[addQtyIdx], 10)
        : undefined;

      const newStockVal = newStockIdx !== -1 && row[newStockIdx] !== undefined && row[newStockIdx] !== ""
        ? parseInt(row[newStockIdx], 10)
        : undefined;

      const batchNumber = batchIdx !== -1 ? String(row[batchIdx] || "").trim() : "";
      const expiryDate = expiryIdx !== -1 ? String(row[expiryIdx] || "").trim() : "";

      const currentStock = matchedInv ? matchedInv.stock : 0;
      let calculatedNewStock = currentStock;

      if (addQty !== undefined && !isNaN(addQty)) {
        calculatedNewStock = Math.max(0, currentStock + addQty);
        unitsToAdd += Math.max(0, addQty);
      } else if (newStockVal !== undefined && !isNaN(newStockVal)) {
        calculatedNewStock = Math.max(0, newStockVal);
        if (newStockVal > currentStock) {
          unitsToAdd += (newStockVal - currentStock);
        }
      } else {
        // Default demo increment if neither provided
        calculatedNewStock = currentStock + 25;
        unitsToAdd += 25;
      }

      if (matchedInv) matchedCount++;

      parsedItems.push({
        id: matchedInv ? matchedInv.id : rawSku,
        sku: rawSku || (matchedInv ? matchedInv.id : `ROW-${r}`),
        name: (matchedInv ? matchedInv.name : rawName) || "Unknown Item",
        category: matchedInv ? matchedInv.category : "General",
        matched: !!matchedInv,
        currentStock,
        addStockQty: addQty !== undefined && !isNaN(addQty) ? addQty : (calculatedNewStock - currentStock),
        newStock: calculatedNewStock,
        batchNumber: batchNumber || (matchedInv ? matchedInv.batchNumber : "BAT-NEW"),
        expiryDate: expiryDate || (matchedInv ? matchedInv.expiryDate : "2027-12")
      });
    }

    setExcelData({
      fileName,
      totalRows: parsedItems.length,
      matchedCount,
      unitsToAdd,
      items: parsedItems
    });
    setIsExcelModalOpen(true);
  };

  // 4. Quick Sample Sheet Demo (for 1-click testing without a local file)
  const handleLoadSampleSheet = () => {
    const sampleRows = [
      ["SKU", "Medicine Name", "Category", "Current Stock", "Add Stock Qty", "Batch Number", "Expiry Date"],
      ["TPMED-001", "Pan-D Capsule", "Gastro", 12, 35, "BAT-PAN-881", "2027-10"],
      ["TPMED-002", "Augmentin 625 Duo", "Antibiotics", 18, 40, "BAT-AUG-992", "2027-08"],
      ["TPMED-003", "Telma 40mg Tablet", "Cardiac", 25, 50, "BAT-TEL-310", "2028-02"],
      ["TPMED-004", "Glycomet-GP 2 Tablet", "Diabetes", 30, 45, "BAT-GLY-440", "2027-12"],
      ["TPMED-005", "Rosuvas 10mg Tablet", "Cardiac", 15, 30, "BAT-ROS-119", "2027-11"],
      ["TPMED-006", "Thyronorm 50mcg", "Endocrine", 20, 50, "BAT-THY-773", "2028-05"],
      ["TPMED-007", "Ascoril-LS Syrup 100ml", "Respiratory", 0, 50, "BAT-ASC-501", "2027-09"],
      ["TPMED-008", "Clexane 40mg Injection", "Cardiac", 6, 25, "BAT-CLE-662", "2027-06"],
      ["TPMED-009", "Foracort 200 Rotacaps", "Respiratory", 4, 30, "BAT-FOR-204", "2027-11"],
      ["TPMED-010", "Montair-LC Tablet", "Respiratory", 22, 40, "BAT-MON-331", "2028-01"],
      ["TPMED-011", "Shelcal 500 Tablet", "Vitamins", 35, 60, "BAT-SHE-904", "2028-04"],
      ["TPMED-012", "Dolo 650 Tablet", "Pain Relief", 50, 100, "BAT-DOL-102", "2028-06"]
    ];
    processSheetRows(sampleRows, "Distributor_Weekly_Inward_GRN.xlsx");
  };

  // 5. Confirm Bulk Update
  const handleConfirmBulkExcelUpdate = () => {
    if (!excelData || !excelData.items || excelData.items.length === 0) return;

    if (bulkUpdateStockFromExcel) {
      bulkUpdateStockFromExcel(excelData.items);
    }

    showToast(`✓ Stock updated successfully! +${excelData.unitsToAdd} units applied across ${excelData.matchedCount} medicines from Excel sheet.`);
    setIsExcelModalOpen(false);
    setExcelData(null);
  };

  // ================= SINGLE ITEM EDIT & NEW ITEM METHODS =================
  const handleOpenAddIndividualModal = (targetItem = null, tab = "inward") => {
    const itemToSelect = targetItem || selectedMedicine || displayedInventory[0] || inventory[0] || null;
    setSelectedMedicine(itemToSelect);
    setSingleAddQty("25");
    setSingleBatchNumber(itemToSelect?.batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setSingleExpiryDate(itemToSelect?.expiryDate || "2027-12");
    setIsDropdownOpen(false);
    setDropdownSearch("");
    setActiveModalTab(targetItem ? "inward" : tab);
    setNewBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsSingleEditModalOpen(true);
  };

  const handleConfirmSingleEdit = () => {
    if (!selectedMedicine) return;
    const qty = parseInt(singleAddQty, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid stock quantity greater than 0.");
      return;
    }

    if (restockItem) {
      restockItem(selectedMedicine.id, qty, singleBatchNumber, singleExpiryDate);
    }

    const newTotal = selectedMedicine.stock + qty;
    showToast(`✓ Added +${qty} units to ${selectedMedicine.name}. New balance: ${newTotal} units.`);
    setIsSingleEditModalOpen(false);
  };

  const handleAddNewItem = () => {
    if (!newName.trim()) {
      Alert.alert("Missing Name", "Please enter the medicine brand name.");
      return;
    }
    const initialQty = parseInt(newStock, 10);
    if (isNaN(initialQty) || initialQty < 0) {
      Alert.alert("Invalid Stock", "Please enter a valid initial stock quantity.");
      return;
    }

    if (addInventoryItem) {
      const created = addInventoryItem({
        name: newName.trim(),
        genericName: newGeneric.trim() || newName.trim(),
        category: newCategory,
        manufacturer: newManufacturer.trim() || "Generic Pharma",
        unit: newUnit.trim() || "Strip of 10 Tablets",
        stock: initialQty,
        minStockThreshold: parseInt(newMinStock, 10) || 10,
        mrp: parseFloat(newMrp) || 100,
        sellingPrice: parseFloat(newSellingPrice) || parseFloat(newMrp) || 100,
        batchNumber: newBatchNumber.trim() || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: newExpiryDate.trim() || "2028-12",
        rackLocation: newRackLocation.trim() || "Rack B-01 / Shelf 2",
        isScheduleH: newIsScheduleH
      });
      showToast(`✓ Registered new medicine "${created.name}" (${initialQty} units) to inventory!`);
    }

    setIsSingleEditModalOpen(false);
    setNewName("");
    setNewGeneric("");
    setNewStock("40");
  };

  const filteredDropdownMeds = useMemo(() => {
    if (!dropdownSearch.trim()) return inventory;
    const q = dropdownSearch.toLowerCase().trim();
    return inventory.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      (m.category && m.category.toLowerCase().includes(q))
    );
  }, [inventory, dropdownSearch]);

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

      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      if (selectedFilter === "OutOfStock") return item.stock === 0;
      if (selectedFilter === "LowStock") return item.stock > 0 && item.stock <= (item.minStockThreshold || 15);
      if (selectedFilter === "ExpiringSoon") return item.expiryDate && (item.expiryDate.startsWith("2026") || item.expiryDate.startsWith("2025"));
      if (selectedFilter === "Healthy") return item.stock > (item.minStockThreshold || 15);

      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === "stock_asc") return a.stock - b.stock;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      if (sortBy === "expiry_soon") return (a.expiryDate || "9999").localeCompare(b.expiryDate || "9999");
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [inventory, searchQuery, selectedCategory, selectedFilter, sortBy]);

  // Render individual item card
  const renderItem = ({ item }) => {
    const isOut = item.stock === 0;
    const isLow = !isOut && item.stock <= (item.minStockThreshold || 15);
    const isHealthy = !isOut && !isLow;
    const isExpiring = item.expiryDate && (item.expiryDate.startsWith("2026") || item.expiryDate.startsWith("2025"));

    const maxReference = Math.max((item.minStockThreshold || 15) * 4, 100);
    const progressPercent = Math.min(100, Math.round((item.stock / maxReference) * 100));

    return (
      <View style={[styles.card, isOut && styles.cardOut, isLow && styles.cardLow]}>
        {/* Top Header: SKU Badge + Status Pill */}
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
                {isOut ? "🔴 OUT OF STOCK" : isLow ? `⚠️ LOW STOCK (Min buffer: ${item.minStockThreshold || 15})` : "🟢 IN STOCK (Ready for packing)"}
              </Text>
            </View>

            {/* Clean, un-cramped Stock Badge & optional discrete Edit Stock chip */}
            <View style={styles.stockBadgeLockup}>
              <View
                style={[
                  styles.statusBadge,
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
                    styles.statusBadgeText,
                    isOut && { color: "#DC2626" },
                    isLow && { color: "#C2410C" },
                    isHealthy && { color: "#059669" }
                  ]}
                >
                  {isOut ? "0 Available" : `${item.stock} Units`}
                </Text>
              </View>

              {isThirdParty && (
                <Pressable
                  style={({ pressed }) => [
                    styles.cardEditStockBtn,
                    Platform.OS === "web" && { cursor: "pointer" },
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => handleOpenAddIndividualModal(item)}
                  hitSlop={6}
                >
                  <Ionicons name="create-outline" size={13} color={COLORS.teal} />
                  <Text style={styles.cardEditStockBtnText}>Edit</Text>
                </Pressable>
              )}
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

        {/* 4 KPI Stock Level Tiles */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiGridContainer}>
            <View style={styles.kpiRow}>
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

            <View style={styles.kpiRow}>
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

        {/* Search Bar Row & EXCEL BULK STOCK TOOLBAR for Multiple Pharmacy */}
        <View style={styles.toolbarRow}>
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

          {/* Multiple Pharmacy Inward Actions */}
          {isThirdParty && (
            <View style={styles.excelActionsGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.excelTemplateBtn,
                  Platform.OS === "web" && { cursor: "pointer" },
                  pressed && { opacity: 0.85 }
                ]}
                onPress={handleDownloadExcelTemplate}
              >
                <Ionicons name="download-outline" size={15} color={COLORS.navy} />
                <Text style={styles.excelTemplateBtnText}>Download Template</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.excelUploadPrimaryBtn,
                  Platform.OS === "web" && { cursor: "pointer" },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => {
                  setExcelData(null);
                  setIsExcelModalOpen(true);
                }}
              >
                <Ionicons name="document-text" size={16} color={COLORS.white} />
                <Text style={styles.excelUploadPrimaryBtnText}>Upload Stock Excel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.addIndividualStockBtn,
                  Platform.OS === "web" && { cursor: "pointer" },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => handleOpenAddIndividualModal()}
              >
                <Ionicons name="add-circle" size={16} color={COLORS.white} />
                <Text style={styles.addIndividualStockBtnText}>+ Add</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Sort By Pills */}
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
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== "web"}
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

      {/* ================= MODAL: EXCEL BULK STOCK UPDATE ================= */}
      <Modal visible={isExcelModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.excelModalCard, isDesktop && styles.excelModalCardDesktop]}>
            {/* Modal Header */}
            <View style={styles.excelModalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.excelBadgeRow}>
                  <View style={styles.excelBadgePill}>
                    <Ionicons name="document-text" size={12} color="#059669" />
                    <Text style={styles.excelBadgePillText}>EXCEL / CSV IMPORT</Text>
                  </View>
                  <Text style={styles.excelModalTitle}>Update Stock via Excel Sheet</Text>
                </View>
                <Text style={styles.excelModalSubtitle}>
                  Upload your inventory spreadsheet (.xlsx, .xls, .csv) to reconcile and update stock balances in bulk.
                </Text>
              </View>
              <Pressable onPress={() => setIsExcelModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={COLORS.navy} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {/* Dropzone & Picker Area */}
              <View style={styles.dropzoneContainer}>
                <View style={styles.dropzoneIconWrap}>
                  <Ionicons name="cloud-upload" size={36} color={COLORS.teal} />
                </View>
                <Text style={styles.dropzoneHeading}>
                  {excelData ? `Selected: ${excelData.fileName}` : "Upload Inventory Excel or CSV Spreadsheet"}
                </Text>
                <Text style={styles.dropzoneSub}>
                  Compatible with spreadsheets from Excel, Google Sheets, Marg, Tally, or ERP exports.
                </Text>

                <View style={styles.dropzoneBtnsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.browseFileBtn,
                      Platform.OS === "web" && { cursor: "pointer" },
                      pressed && { opacity: 0.85 }
                    ]}
                    onPress={handlePickExcelFile}
                  >
                    <Ionicons name="folder-open-outline" size={16} color={COLORS.white} />
                    <Text style={styles.browseFileBtnText}>Browse Excel File...</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.downloadTemplateInModalBtn,
                      Platform.OS === "web" && { cursor: "pointer" },
                      pressed && { opacity: 0.85 }
                    ]}
                    onPress={handleDownloadExcelTemplate}
                  >
                    <Ionicons name="download-outline" size={15} color={COLORS.navy} />
                    <Text style={styles.downloadTemplateInModalBtnText}>Download Blank Template</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.sampleInwardBtn,
                      Platform.OS === "web" && { cursor: "pointer" },
                      pressed && { opacity: 0.85 }
                    ]}
                    onPress={handleLoadSampleSheet}
                  >
                    <Ionicons name="flash-outline" size={15} color="#D97706" />
                    <Text style={styles.sampleInwardBtnText}>Load Sample Sheet (12 SKUs Demo)</Text>
                  </Pressable>
                </View>
              </View>

              {/* Parsed Reconciliation Preview */}
              {excelData && (
                <View style={styles.previewSection}>
                  {/* Summary KPI Cards */}
                  <View style={styles.previewKpiGrid}>
                    <View style={styles.previewKpiCard}>
                      <Text style={styles.previewKpiVal}>{excelData.matchedCount}</Text>
                      <Text style={styles.previewKpiLabel}>SKUs Matched</Text>
                    </View>
                    <View style={styles.previewKpiCard}>
                      <Text style={[styles.previewKpiVal, { color: COLORS.teal }]}>+{excelData.unitsToAdd}</Text>
                      <Text style={styles.previewKpiLabel}>Units to Inward</Text>
                    </View>
                    <View style={styles.previewKpiCard}>
                      <Text style={[styles.previewKpiVal, { color: "#10B981" }]}>
                        {excelData.items.filter(i => i.currentStock === 0 && i.newStock > 0).length}
                      </Text>
                      <Text style={styles.previewKpiLabel}>Out-of-Stock Resolved</Text>
                    </View>
                    <View style={styles.previewKpiCard}>
                      <Text style={[styles.previewKpiVal, { color: "#D97706" }]}>
                        {excelData.items.filter(i => i.currentStock > 0 && i.currentStock <= 15).length}
                      </Text>
                      <Text style={styles.previewKpiLabel}>Low-Stock Replenished</Text>
                    </View>
                  </View>

                  {/* Reconciliation Preview Table */}
                  <Text style={styles.tableHeading}>SHEET RECONCILIATION PREVIEW</Text>
                  <View style={styles.tableCard}>
                    {/* Table Header */}
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableTh, { flex: 1.2 }]}>SKU</Text>
                      <Text style={[styles.tableTh, { flex: 2.5 }]}>Medicine Name</Text>
                      <Text style={[styles.tableTh, { flex: 1, textAlign: "center" }]}>Current</Text>
                      <Text style={[styles.tableTh, { flex: 1.2, textAlign: "center" }]}>Inward (+)</Text>
                      <Text style={[styles.tableTh, { flex: 1.4, textAlign: "center" }]}>New Balance</Text>
                      <Text style={[styles.tableTh, { flex: 1.5 }]}>Batch #</Text>
                      <Text style={[styles.tableTh, { flex: 1.2 }]}>Expiry</Text>
                      <Text style={[styles.tableTh, { flex: 1, textAlign: "center" }]}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {excelData.items.map((rowItem, idx) => (
                      <View
                        key={rowItem.sku + idx}
                        style={[styles.tableDataRow, idx % 2 === 1 && { backgroundColor: "#F8FAFC" }]}
                      >
                        <Text style={[styles.tableTd, { flex: 1.2, fontWeight: "700", color: COLORS.navy }]}>
                          {rowItem.sku}
                        </Text>
                        <View style={{ flex: 2.5 }}>
                          <Text style={[styles.tableTd, { fontWeight: "600", color: COLORS.navyDark }]} numberOfLines={1}>
                            {rowItem.name}
                          </Text>
                          <Text style={{ fontSize: 10, color: COLORS.slate }}>{rowItem.category}</Text>
                        </View>
                        <Text style={[styles.tableTd, { flex: 1, textAlign: "center", color: rowItem.currentStock === 0 ? "#DC2626" : COLORS.slate }]}>
                          {rowItem.currentStock}
                        </Text>
                        <Text style={[styles.tableTd, { flex: 1.2, textAlign: "center", fontWeight: "700", color: COLORS.teal }]}>
                          +{rowItem.addStockQty}
                        </Text>
                        <Text style={[styles.tableTd, { flex: 1.4, textAlign: "center", fontWeight: "800", color: "#059669" }]}>
                          {rowItem.newStock} Units
                        </Text>
                        <Text style={[styles.tableTd, { flex: 1.5, fontSize: 11, color: COLORS.slate }]} numberOfLines={1}>
                          {rowItem.batchNumber}
                        </Text>
                        <Text style={[styles.tableTd, { flex: 1.2, fontSize: 11, color: COLORS.slate }]}>
                          {rowItem.expiryDate}
                        </Text>
                        <View style={{ flex: 1, alignItems: "center" }}>
                          <View style={styles.validStatusPill}>
                            <Text style={styles.validStatusPillText}>✓ Ready</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.excelModalFooter}>
              {excelData && (
                <Pressable
                  style={styles.clearSheetBtn}
                  onPress={() => setExcelData(null)}
                >
                  <Text style={styles.clearSheetBtnText}>Clear File</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }} />
              <Pressable
                style={styles.cancelModalBtn}
                onPress={() => setIsExcelModalOpen(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmBulkBtn,
                  !excelData && { backgroundColor: "#CBD5E1" }
                ]}
                disabled={!excelData}
                onPress={handleConfirmBulkExcelUpdate}
              >
                <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                <Text style={styles.confirmBulkBtnText}>
                  {excelData ? `Apply Stock Update (+${excelData.unitsToAdd} Units)` : "Select Excel File First"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD STOCK & REGISTER NEW ITEM ================= */}
      <Modal visible={isSingleEditModalOpen} animationType="fade" transparent onRequestClose={() => setIsSingleEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.singleModalCard, activeModalTab === "new_item" && { maxWidth: 540 }]}>
            {/* Modal Header */}
            <View style={styles.singleModalHeader}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.modalHeaderIconBox}>
                  <Ionicons
                    name={activeModalTab === "inward" ? "cube" : "add-circle"}
                    size={20}
                    color={COLORS.teal}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.singleModalTitle}>
                    {activeModalTab === "inward" ? "Update Stock" : "Register New Medicine"}
                  </Text>
                  <Text style={styles.singleModalSub}>
                    {activeModalTab === "inward"
                      ? "Inward batch inventory & update stock levels"
                      : "Add a brand new SKU to the pharmacy inventory"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setIsSingleEditModalOpen(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.modalCloseBtnCircle,
                  pressed && { backgroundColor: "#E2E8F0" }
                ]}
              >
                <Ionicons name="close" size={18} color={COLORS.slate} />
              </Pressable>
            </View>

            {/* Segmented Tab Switcher */}
            <View style={styles.tabSwitcherRow}>
              <Pressable
                style={[styles.modalTabBtn, activeModalTab === "inward" && styles.modalTabBtnActive]}
                onPress={() => setActiveModalTab("inward")}
              >
                <Ionicons
                  name="cube-outline"
                  size={15}
                  color={activeModalTab === "inward" ? COLORS.teal : COLORS.slate}
                />
                <Text style={[styles.modalTabBtnText, activeModalTab === "inward" && styles.modalTabBtnTextActive]}>
                  Inward Existing Stock
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalTabBtn, activeModalTab === "new_item" && styles.modalTabBtnActive]}
                onPress={() => {
                  setActiveModalTab("new_item");
                  setNewBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={15}
                  color={activeModalTab === "new_item" ? COLORS.teal : COLORS.slate}
                />
                <Text style={[styles.modalTabBtnText, activeModalTab === "new_item" && styles.modalTabBtnTextActive]}>
                  + Add New Medicine
                </Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {/* TAB 1: INWARD EXISTING STOCK */}
              {activeModalTab === "inward" && selectedMedicine && (
                <View style={styles.singleModalBody}>
                  {/* Selected Medicine Info Card */}
                  <View style={styles.medSelectCard}>
                    <View style={styles.medSelectCardTop}>
                      <View style={styles.medBadgeIcon}>
                        <Ionicons name="medkit" size={16} color={COLORS.teal} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.medSelectCardTitle} numberOfLines={1}>
                          {selectedMedicine.name}
                        </Text>
                        <Text style={styles.medSelectCardSub}>
                          SKU: {selectedMedicine.id} · {selectedMedicine.category}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.changeMedTriggerBtn}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <Text style={styles.changeMedTriggerText}>
                          {isDropdownOpen ? "Done" : "Change"}
                        </Text>
                        <Ionicons
                          name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                          size={13}
                          color={COLORS.teal}
                        />
                      </Pressable>
                    </View>

                    {/* Expandable Dropdown Search Menu */}
                    {isDropdownOpen && (
                      <View style={styles.dropdownMenuClean}>
                        <View style={styles.dropdownSearchBox}>
                          <Ionicons name="search" size={15} color={COLORS.slateLight} />
                          <TextInput
                            style={styles.dropdownSearchInputClean}
                            placeholder="Filter medicine by name or SKU..."
                            placeholderTextColor={COLORS.slateLight}
                            value={dropdownSearch}
                            onChangeText={setDropdownSearch}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </View>
                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                          {filteredDropdownMeds.map(med => (
                            <Pressable
                              key={med.id}
                              style={[
                                styles.dropdownItemClean,
                                selectedMedicine?.id === med.id && styles.dropdownItemCleanActive
                              ]}
                              onPress={() => {
                                setSelectedMedicine(med);
                                setSingleBatchNumber(med.batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`);
                                setSingleExpiryDate(med.expiryDate || "2027-12");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[
                                  styles.dropdownItemTitle,
                                  selectedMedicine?.id === med.id && { color: COLORS.teal, fontWeight: "800" }
                                ]}>
                                  {med.name}
                                </Text>
                                <Text style={styles.dropdownItemSubtitle}>{med.id} · {med.category}</Text>
                              </View>
                              <View style={styles.dropdownStockBadgeClean}>
                                <Text style={styles.dropdownStockTextClean}>{med.stock} Units</Text>
                              </View>
                            </Pressable>
                          ))}
                        </ScrollView>

                        {dropdownSearch.trim().length > 0 && (
                          <Pressable
                            style={styles.dropdownAddNewItemOption}
                            onPress={() => {
                              setNewName(dropdownSearch.trim());
                              setNewGeneric(dropdownSearch.trim());
                              setActiveModalTab("new_item");
                              setNewBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <Ionicons name="add-circle" size={15} color={COLORS.teal} />
                            <Text style={styles.dropdownAddNewItemOptionText}>
                              + Add "{dropdownSearch.trim()}" as New Medicine ➔
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Clean Stock Progression Impact Card */}
                  <View style={styles.stockProgressionCard}>
                    <View style={styles.progressionCol}>
                      <Text style={styles.progressionLabel}>CURRENT STOCK</Text>
                      <View style={styles.progressionValRow}>
                        <Text style={styles.progressionValCurrent}>{selectedMedicine.stock}</Text>
                        <Text style={styles.progressionUnit}>Units</Text>
                      </View>
                      <View style={[
                        styles.stockStatusBadge,
                        selectedMedicine.stock === 0 ? styles.badgeOutOfStock :
                        selectedMedicine.stock <= (selectedMedicine.minStockThreshold || 10) ? styles.badgeLowStock : styles.badgeHealthy
                      ]}>
                        <Text style={[
                          styles.stockStatusBadgeText,
                          selectedMedicine.stock === 0 ? { color: "#DC2626" } :
                          selectedMedicine.stock <= (selectedMedicine.minStockThreshold || 10) ? { color: COLORS.coral } : { color: COLORS.teal }
                        ]}>
                          {selectedMedicine.stock === 0 ? "Out of Stock" :
                           selectedMedicine.stock <= (selectedMedicine.minStockThreshold || 10) ? "Low Stock" : "In Stock"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressionArrowCol}>
                      <View style={styles.progressionArrowCircle}>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.teal} />
                      </View>
                      <View style={styles.inwardDeltaPill}>
                        <Text style={styles.inwardDeltaPillText}>
                          +{parseInt(singleAddQty, 10) || 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressionCol}>
                      <Text style={[styles.progressionLabel, { color: COLORS.teal }]}>NEW TOTAL</Text>
                      <View style={styles.progressionValRow}>
                        <Text style={styles.progressionValNew}>
                          {selectedMedicine.stock + (parseInt(singleAddQty, 10) || 0)}
                        </Text>
                        <Text style={[styles.progressionUnit, { color: COLORS.teal }]}>Units</Text>
                      </View>
                      <View style={styles.badgeUpdatedTotal}>
                        <Ionicons name="checkmark" size={10} color={COLORS.teal} style={{ marginRight: 2 }} />
                        <Text style={styles.badgeUpdatedTotalText}>Ready to Apply</Text>
                      </View>
                    </View>
                  </View>

                  {/* Quantity Stepper & Quick Presets */}
                  <View style={styles.cleanFormGroup}>
                    <View style={styles.cleanLabelRow}>
                      <Text style={styles.cleanFieldLabel}>QUANTITY TO ADD</Text>
                      <Text style={styles.cleanFieldHint}>Units entering inventory</Text>
                    </View>

                    {/* Stepper with - and + */}
                    <View style={styles.cleanStepperBox}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.cleanStepperBtn,
                          pressed && { backgroundColor: "#E2E8F0" }
                        ]}
                        onPress={() => {
                          const cur = parseInt(singleAddQty, 10) || 0;
                          setSingleAddQty(String(Math.max(1, cur - 1)));
                        }}
                      >
                        <Ionicons name="remove" size={18} color={COLORS.navyDark} />
                      </Pressable>

                      <View style={styles.cleanStepperInputWrap}>
                        <TextInput
                          style={styles.cleanStepperInput}
                          keyboardType="numeric"
                          value={singleAddQty}
                          onChangeText={(val) => {
                            const cleaned = val.replace(/[^0-9]/g, "");
                            setSingleAddQty(cleaned);
                          }}
                          placeholder="0"
                          placeholderTextColor={COLORS.slateLight}
                          selectTextOnFocus
                        />
                        <Text style={styles.cleanStepperSuffix}>Units</Text>
                      </View>

                      <Pressable
                        style={({ pressed }) => [
                          styles.cleanStepperBtn,
                          pressed && { backgroundColor: "#E2E8F0" }
                        ]}
                        onPress={() => {
                          const cur = parseInt(singleAddQty, 10) || 0;
                          setSingleAddQty(String(cur + 1));
                        }}
                      >
                        <Ionicons name="add" size={18} color={COLORS.navyDark} />
                      </Pressable>
                    </View>

                    {/* Quick Presets */}
                    <View style={styles.cleanPresetsRow}>
                      <Text style={styles.cleanPresetsHint}>Presets:</Text>
                      {[10, 25, 50, 100, 200].map(p => {
                        const isMatch = singleAddQty === String(p);
                        return (
                          <Pressable
                            key={p}
                            style={({ pressed }) => [
                              styles.cleanPresetPill,
                              isMatch && styles.cleanPresetPillActive,
                              pressed && { opacity: 0.8 }
                            ]}
                            onPress={() => setSingleAddQty(String(p))}
                          >
                            <Text style={[styles.cleanPresetPillText, isMatch && styles.cleanPresetPillTextActive]}>
                              +{p}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Batch Number & Expiry Date (Clean 2-column) */}
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                    <View style={[styles.cleanFormGroup, { flex: 1 }]}>
                      <Text style={styles.cleanFieldLabel}>BATCH NUMBER</Text>
                      <View style={styles.cleanInputWithIcon}>
                        <Ionicons name="barcode-outline" size={16} color={COLORS.slate} style={{ marginRight: 6 }} />
                        <TextInput
                          style={styles.cleanSubTextInput}
                          value={singleBatchNumber}
                          onChangeText={setSingleBatchNumber}
                          placeholder="e.g. GLN-5512"
                          placeholderTextColor={COLORS.slateLight}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <View style={[styles.cleanFormGroup, { flex: 1 }]}>
                      <Text style={styles.cleanFieldLabel}>EXPIRY DATE</Text>
                      <View style={styles.cleanInputWithIcon}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.slate} style={{ marginRight: 6 }} />
                        <TextInput
                          style={styles.cleanSubTextInput}
                          value={singleExpiryDate}
                          onChangeText={setSingleExpiryDate}
                          placeholder="YYYY-MM (e.g. 2027-12)"
                          placeholderTextColor={COLORS.slateLight}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 2: REGISTER NEW MEDICINE */}
              {activeModalTab === "new_item" && (
                <View style={styles.singleModalBody}>
                  {/* Medicine Brand Name */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>MEDICINE BRAND NAME *</Text>
                    <TextInput
                      style={styles.formTextInput}
                      placeholder="e.g., Azithral 500mg Tablet, Dolo 650"
                      placeholderTextColor={COLORS.slateLight}
                      value={newName}
                      onChangeText={setNewName}
                    />
                  </View>

                  {/* Generic / Salt Formulation */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>GENERIC / SALT FORMULATION *</Text>
                    <TextInput
                      style={styles.formTextInput}
                      placeholder="e.g., Azithromycin (500mg)"
                      placeholderTextColor={COLORS.slateLight}
                      value={newGeneric}
                      onChangeText={setNewGeneric}
                    />
                  </View>

                  {/* Category Pills */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>CATEGORY *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catSelectorRow}>
                      {CATEGORIES.filter(c => c !== "All").map(cat => (
                        <Pressable
                          key={cat}
                          style={[styles.catSelectorChip, newCategory === cat && styles.catSelectorChipActive]}
                          onPress={() => setNewCategory(cat)}
                        >
                          <Text style={[styles.catSelectorChipText, newCategory === cat && styles.catSelectorChipTextActive]}>
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Initial Stock & Min Stock */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[styles.formGroup, { flex: 1.2 }]}>
                      <Text style={styles.formLabel}>INITIAL STOCK (UNITS) *</Text>
                      <TextInput
                        style={styles.formTextInput}
                        keyboardType="numeric"
                        placeholder="40"
                        value={newStock}
                        onChangeText={setNewStock}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>MIN BUFFER ALERT</Text>
                      <TextInput
                        style={styles.formTextInput}
                        keyboardType="numeric"
                        placeholder="10"
                        value={newMinStock}
                        onChangeText={setNewMinStock}
                      />
                    </View>
                  </View>

                  {/* Manufacturer & Unit */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>MANUFACTURER</Text>
                      <TextInput
                        style={styles.formTextInput}
                        placeholder="e.g., Cipla Ltd, Alembic"
                        placeholderTextColor={COLORS.slateLight}
                        value={newManufacturer}
                        onChangeText={setNewManufacturer}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>PACKAGING UNIT</Text>
                      <TextInput
                        style={styles.formTextInput}
                        placeholder="Strip of 10 Tablets"
                        placeholderTextColor={COLORS.slateLight}
                        value={newUnit}
                        onChangeText={setNewUnit}
                      />
                    </View>
                  </View>

                  {/* Pricing: MRP & Selling Price */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>MRP (₹)</Text>
                      <TextInput
                        style={styles.formTextInput}
                        keyboardType="numeric"
                        placeholder="120.00"
                        value={newMrp}
                        onChangeText={setNewMrp}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>SELLING PRICE (₹) *</Text>
                      <TextInput
                        style={styles.formTextInput}
                        keyboardType="numeric"
                        placeholder="105.00"
                        value={newSellingPrice}
                        onChangeText={setNewSellingPrice}
                      />
                    </View>
                  </View>

                  {/* Batch Number & Expiry */}
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>BATCH NUMBER</Text>
                      <TextInput
                        style={styles.formTextInput}
                        placeholder="BAT-8821"
                        value={newBatchNumber}
                        onChangeText={setNewBatchNumber}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>EXPIRY DATE (YYYY-MM)</Text>
                      <TextInput
                        style={styles.formTextInput}
                        placeholder="2028-12"
                        value={newExpiryDate}
                        onChangeText={setNewExpiryDate}
                      />
                    </View>
                  </View>

                  {/* Rack Location & Schedule H */}
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <View style={[styles.formGroup, { flex: 1.2 }]}>
                      <Text style={styles.formLabel}>WAREHOUSE RACK</Text>
                      <TextInput
                        style={styles.formTextInput}
                        placeholder="Rack B-01 / Shelf 2"
                        value={newRackLocation}
                        onChangeText={setNewRackLocation}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginTop: 12 }]}>
                      <Pressable
                        style={[styles.rxTogglePill, newIsScheduleH && styles.rxTogglePillActive]}
                        onPress={() => setNewIsScheduleH(!newIsScheduleH)}
                      >
                        <Ionicons
                          name={newIsScheduleH ? "shield" : "shield-outline"}
                          size={14}
                          color={newIsScheduleH ? "#DC2626" : COLORS.slate}
                        />
                        <Text style={[styles.rxTogglePillText, newIsScheduleH && styles.rxTogglePillTextActive]}>
                          {newIsScheduleH ? "Rx Schedule H" : "Non-Schedule"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.singleModalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelModalBtn,
                  pressed && { backgroundColor: "#F1F5F9" }
                ]}
                onPress={() => setIsSingleEditModalOpen(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </Pressable>

              {activeModalTab === "inward" ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmSingleBtn,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                  ]}
                  onPress={handleConfirmSingleEdit}
                >
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                  <Text style={styles.confirmSingleBtnText}>
                    Confirm & Add Stock (+{parseInt(singleAddQty, 10) || 0} Units)
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmSingleBtn,
                    { backgroundColor: "#059669" },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                  ]}
                  onPress={handleAddNewItem}
                >
                  <Ionicons name="add-circle" size={16} color={COLORS.white} />
                  <Text style={styles.confirmSingleBtnText}>
                    + Register & Add Item ({parseInt(newStock, 10) || 0} Units)
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  innerContainer: { flex: 1, width: "100%" },
  innerContainerDesktop: { maxWidth: 1280, alignSelf: "center", width: "100%" },
  innerContainerTablet: { maxWidth: 900, alignSelf: "center", width: "100%" },

  // Toast
  toastBar: {
    backgroundColor: "#065F46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 14,
    marginTop: 8,
    gap: 8
  },
  toastBarText: { color: COLORS.white, fontSize: 13, fontWeight: "700", flex: 1 },

  // KPI Tiles
  kpiContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: 14,
    marginTop: 12,
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

  // Toolbar & Search
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    flexWrap: "wrap"
  },
  searchWrap: {
    flex: 1,
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.navy, padding: 0 },

  excelActionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  excelTemplateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  excelTemplateBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  excelUploadPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#059669",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  excelUploadPrimaryBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  addIndividualStockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  addIndividualStockBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },

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
  listContent: { padding: 14 },
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

  medicineName: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  genericName: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  mfgText: { fontSize: 11, color: COLORS.slateLight, marginTop: 2 },

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
  stockNumberText: { fontSize: 17, fontWeight: "800" },
  stockUnitsLabel: { fontSize: 12, fontWeight: "500", color: COLORS.slate },
  stockAlertText: { fontSize: 10, marginTop: 2, letterSpacing: 0.3 },

  stockBadgeLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  statusBadgeText: { fontSize: 12, fontWeight: "800" },

  cardEditStockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  cardEditStockBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
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
  resetBtnText: { color: COLORS.navy, fontSize: 12, fontWeight: "700" },

  // ================= EXCEL MODAL STYLES =================
  modalOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    ...(Platform.OS === "web" ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 } : {})
  },
  excelModalCard: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    ...(Platform.OS === "web" ? { maxHeight: "90vh", overflowY: "auto", zIndex: 100000 } : {})
  },
  excelModalCardDesktop: {
    maxWidth: 840
  },
  excelModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  excelBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  excelBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  excelBadgePillText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5
  },
  excelModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  excelModalSubtitle: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },

  // Dropzone
  dropzoneContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 16
  },
  dropzoneIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  dropzoneHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navyDark,
    textAlign: "center"
  },
  dropzoneSub: {
    fontSize: 11,
    color: COLORS.slate,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 420
  },
  dropzoneBtnsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
    justifyContent: "center"
  },
  browseFileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8
  },
  browseFileBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },
  downloadTemplateInModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8
  },
  downloadTemplateInModalBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  sampleInwardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8
  },
  sampleInwardBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309"
  },

  // Preview Section
  previewSection: {
    marginTop: 4
  },
  previewKpiGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  previewKpiCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    padding: 10,
    alignItems: "center"
  },
  previewKpiVal: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  previewKpiLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate,
    marginTop: 2,
    textAlign: "center"
  },

  tableHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.slate,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  tableCard: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    overflow: "hidden"
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  tableTh: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  tableDataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableTd: {
    fontSize: 11,
    color: COLORS.navyDark
  },
  validStatusPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  validStatusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D"
  },

  excelModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  clearSheetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  clearSheetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626"
  },
  cancelModalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cancelModalBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  confirmBulkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8
  },
  confirmBulkBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },

  // ================= SINGLE EDIT MODAL STYLES =================
  singleModalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    shadowColor: COLORS.navyDark,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    ...(Platform.OS === "web" ? { maxHeight: "90vh", overflowY: "auto", zIndex: 100000 } : {})
  },
  singleModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  modalHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center"
  },
  singleModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  singleModalSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  modalCloseBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },

  // Modal Tab Switcher Styles
  tabSwitcherRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    gap: 4
  },
  modalTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "transparent"
  },
  modalTabBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  modalTabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  modalTabBtnTextActive: {
    color: COLORS.teal,
    fontWeight: "800"
  },

  singleModalBody: {
    paddingVertical: 2
  },

  // Medicine Selector Card
  medSelectCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  medSelectCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  medBadgeIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center"
  },
  medSelectCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  medSelectCardSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  changeMedTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.tealLight
  },
  changeMedTriggerText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },

  // Dropdown styles
  dropdownMenuClean: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  dropdownSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8
  },
  dropdownSearchInputClean: {
    flex: 1,
    fontSize: 12,
    color: COLORS.navyDark,
    marginLeft: 6,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  dropdownItemClean: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  dropdownItemCleanActive: {
    backgroundColor: "#F0FDFA"
  },
  dropdownItemTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyDark
  },
  dropdownItemSubtitle: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  dropdownStockBadgeClean: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  dropdownStockTextClean: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },

  // Stock Progression Summary Card
  stockProgressionCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  progressionCol: {
    flex: 1,
    alignItems: "center"
  },
  progressionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slate,
    letterSpacing: 0.5,
    marginBottom: 3
  },
  progressionValRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 4
  },
  progressionValCurrent: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  progressionValNew: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.teal
  },
  progressionUnit: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  stockStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeOutOfStock: {
    backgroundColor: "#FEE2E2"
  },
  badgeLowStock: {
    backgroundColor: "#FEF3C7"
  },
  badgeHealthy: {
    backgroundColor: COLORS.tealLight
  },
  stockStatusBadgeText: {
    fontSize: 9,
    fontWeight: "800"
  },
  progressionArrowCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  progressionArrowCircle: {
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
  badgeUpdatedTotal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgeUpdatedTotalText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal
  },

  // Clean Quantity Form Field
  cleanFormGroup: {
    marginBottom: 12
  },
  cleanLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  cleanFieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.3
  },
  cleanFieldHint: {
    fontSize: 10,
    color: COLORS.slateLight,
    fontWeight: "600"
  },
  cleanStepperBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    overflow: "hidden"
  },
  cleanStepperBtn: {
    width: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9"
  },
  cleanStepperInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  cleanStepperInput: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navyDark,
    textAlign: "center",
    minWidth: 50,
    paddingVertical: 6,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  cleanStepperSuffix: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate,
    marginLeft: 4
  },
  cleanPresetsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8
  },
  cleanPresetsHint: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate,
    marginRight: 2
  },
  cleanPresetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  cleanPresetPillActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  cleanPresetPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy
  },
  cleanPresetPillTextActive: {
    color: COLORS.white
  },

  // Clean Inputs with Icon
  cleanInputWithIcon: {
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
  cleanSubTextInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.navyDark,
    fontWeight: "700",
    padding: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },

  // Legacy Form Styles for New Item Tab
  formGroup: { marginBottom: 10 },
  formLabel: { fontSize: 11, fontWeight: "700", color: COLORS.navy, marginBottom: 4 },
  formTextInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: COLORS.navyDark,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },

  singleModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  confirmSingleBtn: {
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
  },
  confirmSingleBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.white
  },

  dropdownAddNewItemOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDFA",
    borderTopWidth: 1,
    borderTopColor: "#CCFBF1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4
  },
  dropdownAddNewItemOptionText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.teal
  },

  catSelectorRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2
  },
  catSelectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  catSelectorChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal
  },
  catSelectorChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  catSelectorChipTextActive: {
    color: COLORS.white
  },

  rxTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line
  },
  rxTogglePillActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5"
  },
  rxTogglePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  rxTogglePillTextActive: {
    color: "#DC2626",
    fontWeight: "800"
  }
});
