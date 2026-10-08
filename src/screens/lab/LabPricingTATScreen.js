// MediUnify Lab Pricing & Turnaround Time (TAT) Management Screen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import { LabStatusBadge } from "./LabBadge";

export function LabPricingTATScreen() {
  const {
    tests,
    popularPackages,
    curatedPackages,
    updatePricingAndTAT,
    toggleTestStatus,
    togglePackageStatus
  } = useLab();

  const [activeTab, setActiveTab] = useState("tests"); // 'tests' or 'packages'
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal
  const [editingItem, setEditingItem] = useState(null); // { type: 'test' | 'package', data }
  const [editPrice, setEditPrice] = useState("");
  const [editTat, setEditTat] = useState("");
  const [editCpt, setEditCpt] = useState("");

  const allPackages = [...popularPackages, ...curatedPackages];

  const filteredTests = tests.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return t.testName.toLowerCase().includes(q) || t.testCode.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredPackages = allPackages.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.packageName.toLowerCase().includes(q) || p.packageCode.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenEdit = (type, item) => {
    setEditingItem({ type, item });
    setEditPrice(String(item.suggestedMysuruPrice || ""));
    setEditTat(String(item.tat || ""));
    setEditCpt(String(item.cpt || ""));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const priceVal = parseFloat(editPrice) || 0;

    if (editingItem.type === "test") {
      updatePricingAndTAT("test", editingItem.item.id, {
        suggestedMysuruPrice: priceVal,
        tat: editTat || editingItem.item.tat,
        cpt: parseFloat(editCpt) || 0
      });
    } else {
      updatePricingAndTAT("package", editingItem.item.id, {
        suggestedMysuruPrice: priceVal,
        tat: editTat || editingItem.item.tat
      });
    }

    setEditingItem(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="pricetags" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Pricing & Turnaround Time (TAT) Master</Text>
            <Text style={styles.topSub}>Mysuru Benchmark Pricing & CPT Reference Standards</Text>
          </View>
        </View>

        <View style={styles.tabToggleGroup}>
          <Pressable
            style={[styles.toggleBtn, activeTab === "tests" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("tests")}
          >
            <Text style={[styles.toggleBtnText, activeTab === "tests" && styles.toggleBtnTextActive]}>
              TEST PRICING ({tests.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, activeTab === "packages" && styles.toggleBtnActive]}
            onPress={() => setActiveTab("packages")}
          >
            <Text style={[styles.toggleBtnText, activeTab === "packages" && styles.toggleBtnTextActive]}>
              PACKAGE PRICING ({allPackages.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === "tests" ? "individual tests" : "checkup packages"} by name or code...`}
            placeholderTextColor={COLORS.slateLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Tables Content */}
      <ScrollView style={styles.tableScroll} contentContainerStyle={{ padding: 16 }}>
        {activeTab === "tests" ? (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 2.8 }]}>DIAGNOSTIC TEST NAME</Text>
              <Text style={[styles.th, { flex: 1.8 }]}>CATEGORY</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>SUGGESTED MYSURU PRICE</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>APPROX. CPT</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>STANDARD TAT</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.4, textAlign: "right" }]}>ACTIONS</Text>
            </View>

            {filteredTests.map((t, idx) => (
              <View key={t.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                <View style={{ flex: 2.8 }}>
                  <Text style={styles.rowTitle}>{t.testName}</Text>
                  <Text style={styles.rowCode}>Code: {t.testCode}</Text>
                </View>

                <View style={{ flex: 1.8 }}>
                  <Text style={styles.rowCat}>{t.category}</Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={styles.rowPrice}>₹{t.suggestedMysuruPrice}</Text>
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text style={styles.rowCpt}>{t.cpt ? `₹${t.cpt}` : "—"}</Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={styles.rowTat}>{t.tat}</Text>
                </View>

                <View style={{ flex: 1.1 }}>
                  <LabStatusBadge status={t.status} size="small" />
                </View>

                <View style={{ flex: 1.4, flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
                  <Pressable style={styles.editBtn} onPress={() => handleOpenEdit("test", t)}>
                    <Ionicons name="create-outline" size={14} color={COLORS.navy} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, t.status === "Active" ? styles.disableBtn : styles.enableBtn]}
                    onPress={() => toggleTestStatus(t.id)}
                  >
                    <Ionicons
                      name={t.status === "Active" ? "pause-outline" : "play-outline"}
                      size={13}
                      color={t.status === "Active" ? "#DC2626" : "#059669"}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 2.8 }]}>PACKAGE NAME & CODE</Text>
              <Text style={[styles.th, { flex: 1.8 }]}>CATEGORY</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>TESTS COUNT</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>SUGGESTED MYSURU PRICE</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>REFERENCE SUM VALUE</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>TAT</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.4, textAlign: "right" }]}>ACTIONS</Text>
            </View>

            {filteredPackages.map((p, idx) => (
              <View key={p.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                <View style={{ flex: 2.8 }}>
                  <Text style={styles.rowTitle}>{p.packageName}</Text>
                  <Text style={styles.rowCode}>Code: {p.packageCode}</Text>
                </View>

                <View style={{ flex: 1.8 }}>
                  <Text style={styles.rowCat}>{p.category}</Text>
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text style={styles.rowTestCount}>{p.testIds?.length || 1} Tests</Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={styles.rowPrice}>₹{p.suggestedMysuruPrice}</Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={styles.rowRefPrice}>₹{p.referenceOriginalPrice || 3500}</Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={styles.rowTat}>{p.tat || "12-24h"}</Text>
                </View>

                <View style={{ flex: 1.1 }}>
                  <LabStatusBadge status={p.status} size="small" />
                </View>

                <View style={{ flex: 1.4, flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
                  <Pressable style={styles.editBtn} onPress={() => handleOpenEdit("package", p)}>
                    <Ionicons name="create-outline" size={14} color={COLORS.navy} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, p.status === "Active" ? styles.disableBtn : styles.enableBtn]}
                    onPress={() => togglePackageStatus(p.id)}
                  >
                    <Ionicons
                      name={p.status === "Active" ? "pause-outline" : "play-outline"}
                      size={13}
                      color={p.status === "Active" ? "#DC2626" : "#059669"}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Quick Edit Price & TAT Modal */}
      {editingItem && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="pricetag" size={18} color={COLORS.teal} />
                <Text style={styles.modalTitle}>
                  Update Pricing & TAT: {editingItem.item.testName || editingItem.item.packageName}
                </Text>
              </View>

              <View style={{ gap: 10, paddingVertical: 10 }}>
                <Text style={styles.inputLabel}>Suggested Mysuru Price (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Turnaround Time (TAT) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editTat}
                  onChangeText={setEditTat}
                  placeholder="e.g. 4-6 Hours"
                />

                {editingItem.type === "test" && (
                  <>
                    <Text style={styles.inputLabel}>Approximate CPT (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editCpt}
                      onChangeText={setEditCpt}
                      keyboardType="numeric"
                    />
                  </>
                )}
              </View>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditingItem(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSaveEdit}>
                  <Text style={styles.modalSaveBtnText}>Save Updates</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexWrap: "wrap",
    gap: 12
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy
  },
  topSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  tabToggleGroup: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 3,
    borderRadius: 8
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  toggleBtnActive: {
    backgroundColor: COLORS.navy
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  toggleBtnTextActive: {
    color: COLORS.white
  },
  filterBar: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA"
  },
  rowTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  rowCode: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  rowCat: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  rowTestCount: {
    fontSize: 11,
    color: COLORS.teal,
    fontWeight: "700"
  },
  rowPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.teal
  },
  rowRefPrice: {
    fontSize: 11,
    color: COLORS.slateLight,
    textDecorationLine: "line-through"
  },
  rowCpt: {
    fontSize: 11,
    color: COLORS.slate
  },
  rowTat: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: "600"
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6
  },
  disableBtn: {
    backgroundColor: "#FEE2E2"
  },
  enableBtn: {
    backgroundColor: "#ECFDF5"
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 8
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 10
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  modalSaveBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  }
});
