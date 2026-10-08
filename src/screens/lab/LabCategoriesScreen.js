// MediUnify Lab Admin - Diagnostic Test Categories & Departments Management
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
import LabBadge from "./LabBadge";

export function LabCategoriesScreen() {
  const {
    categories,
    tests,
    addCategory,
    updateCategory,
    toggleCategoryStatus
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingTestsCat, setViewingTestsCat] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nablDiscipline: "",
    description: "",
    headOfDepartment: "",
    roomNumber: "",
    standardTAT: "6-8 Hours",
    storageTemp: "2°C - 8°C",
    sampleTypesStr: "Serum (SST Gel Tube), Whole Blood (EDTA)",
    color: "#0D9488"
  });

  // Calculate test counts per category dynamically
  const categoryStats = useMemo(() => {
    const counts = {};
    categories.forEach(cat => {
      // match by category code or category name substring
      const matched = tests.filter(t => {
        const tCat = (t.category || "").toLowerCase();
        const cName = (cat.name || "").toLowerCase();
        const cCode = (cat.code || "").toLowerCase();
        return (
          tCat.includes(cCode) ||
          cName.includes(tCat) ||
          (cat.testCodes && cat.testCodes.includes(t.testCode))
        );
      });
      counts[cat.id] = matched.length;
    });
    return counts;
  }, [categories, tests]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchSearch =
        !searchQuery ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.nablDiscipline.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat.status === "Active") ||
        (statusFilter === "INACTIVE" && cat.status !== "Active");

      return matchSearch && matchStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const openAddModal = () => {
    setFormData({
      code: "",
      name: "",
      nablDiscipline: "Clinical Pathology",
      description: "",
      headOfDepartment: "Dr. Arvind Rao (MD Pathology)",
      roomNumber: "Diagnostic Wing 1st Floor",
      standardTAT: "6-8 Hours",
      storageTemp: "2°C - 8°C",
      sampleTypesStr: "Serum (SST Gel Tube), Whole Blood (EDTA)",
      color: "#0D9488"
    });
    setIsNewModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      nablDiscipline: cat.nablDiscipline,
      description: cat.description,
      headOfDepartment: cat.headOfDepartment,
      roomNumber: cat.roomNumber,
      standardTAT: cat.standardTAT,
      storageTemp: cat.storageTemp,
      sampleTypesStr: (cat.sampleTypes || []).join(", "),
      color: cat.color || "#0D9488"
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Please provide both category name and code.");
      return;
    }
    const sampleTypesArr = formData.sampleTypesStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    addCategory({
      ...formData,
      sampleTypes: sampleTypesArr
    });
    setIsNewModalOpen(false);
  };

  const handleSaveEdit = () => {
    if (!selectedCategory) return;
    const sampleTypesArr = formData.sampleTypesStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    updateCategory(selectedCategory.id, {
      ...formData,
      sampleTypes: sampleTypesArr
    });
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  // Get tests mapped to a category for viewing modal
  const testsForViewingCat = useMemo(() => {
    if (!viewingTestsCat) return [];
    return tests.filter(t => {
      const tCat = (t.category || "").toLowerCase();
      const cName = (viewingTestsCat.name || "").toLowerCase();
      const cCode = (viewingTestsCat.code || "").toLowerCase();
      return (
        tCat.includes(cCode) ||
        cName.includes(tCat) ||
        (viewingTestsCat.testCodes && viewingTestsCat.testCodes.includes(t.testCode))
      );
    });
  }, [viewingTestsCat, tests]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* KPI Top Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="folder-open" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{categories.length}</Text>
            <Text style={styles.kpiLabel}>Total Categories</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F0FDFA" }]}>
            <Ionicons name="flask" size={20} color={COLORS.teal} />
          </View>
          <View>
            <Text style={styles.kpiValue}>{tests.length}</Text>
            <Text style={styles.kpiLabel}>Diagnostic Tests</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F5F3FF" }]}>
            <Ionicons name="time" size={20} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.kpiValue}>6.2 hrs</Text>
            <Text style={styles.kpiLabel}>Avg Department TAT</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="checkmark-done-circle" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.kpiValue}>100%</Text>
            <Text style={styles.kpiLabel}>NABL ISO 15189 Discipline</Text>
          </View>
        </View>
      </View>

      {/* Control Bar: Search, Status Filter & Add Button */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories by name, code or NABL discipline..."
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

        <View style={styles.filterPills}>
          {["ALL", "ACTIVE", "INACTIVE"].map(status => (
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

        <Pressable style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.addBtnText}>Add Category</Text>
        </Pressable>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesGrid}>
        {filteredCategories.map(cat => {
          const testCount = categoryStats[cat.id] || 0;
          return (
            <View key={cat.id} style={styles.categoryCard}>
              {/* Top Accent Strip */}
              <View style={[styles.cardHeaderStrip, { backgroundColor: cat.color || COLORS.teal }]} />

              <View style={styles.cardContent}>
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.codeAndIcon}>
                    <View style={[styles.catIconWrap, { backgroundColor: cat.bgLight || "#F0FDFA" }]}>
                      <Ionicons name={cat.iconName || "flask-outline"} size={20} color={cat.color || COLORS.teal} />
                    </View>
                    <View>
                      <View style={styles.codeBadge}>
                        <Text style={[styles.codeBadgeText, { color: cat.color || COLORS.teal }]}>{cat.code}</Text>
                      </View>
                      <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                    </View>
                  </View>
                  <LabBadge status={cat.status} />
                </View>

                {/* Description */}
                <Text style={styles.categoryDesc} numberOfLines={2}>
                  {cat.description}
                </Text>

                {/* Info Metadata Box */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Ionicons name="ribbon-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.metaLabel}>NABL Discipline:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{cat.nablDiscipline}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.metaLabel}>Head of Dept:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{cat.headOfDepartment}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.metaLabel}>Location:</Text>
                    <Text style={styles.metaValue}>{cat.roomNumber}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.metaLabel}>Standard TAT:</Text>
                    <Text style={styles.metaValueBold}>{cat.standardTAT}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="thermometer-outline" size={14} color={COLORS.slate} />
                    <Text style={styles.metaLabel}>Storage Temp:</Text>
                    <Text style={styles.metaValue}>{cat.storageTemp}</Text>
                  </View>
                </View>

                {/* Specimen Tags */}
                <View style={styles.sampleTypesRow}>
                  <Text style={styles.sampleTypeTitle}>Specimens:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    {(cat.sampleTypes || []).map((st, i) => (
                      <View key={i} style={styles.samplePill}>
                        <Text style={styles.samplePillText}>{st}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Footer Controls */}
                <View style={styles.cardFooter}>
                  <Pressable
                    style={styles.viewTestsBtn}
                    onPress={() => setViewingTestsCat(cat)}
                  >
                    <Ionicons name="list" size={14} color={COLORS.navy} />
                    <Text style={styles.viewTestsBtnText}>{testCount} Tests Mapped</Text>
                  </Pressable>

                  <View style={styles.actionIconGroup}>
                    <Pressable
                      style={styles.actionIconBtn}
                      onPress={() => openEditModal(cat)}
                    >
                      <Ionicons name="create-outline" size={16} color={COLORS.navy} />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionIconBtn,
                        cat.status === "Active" ? styles.deactivateBtn : styles.activateBtn
                      ]}
                      onPress={() => toggleCategoryStatus(cat.id)}
                    >
                      <Ionicons
                        name={cat.status === "Active" ? "pause-outline" : "play-outline"}
                        size={16}
                        color={cat.status === "Active" ? "#D97706" : "#059669"}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* MODAL: View Mapped Tests (Clean Centered Modal) */}
      {viewingTestsCat && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.viewTestsModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={[styles.catIconWrap, { backgroundColor: viewingTestsCat.bgLight || "#F0FDFA" }]}>
                    <Ionicons name={viewingTestsCat.iconName || "flask"} size={20} color={viewingTestsCat.color || COLORS.teal} />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{viewingTestsCat.name}</Text>
                    <Text style={styles.modalSubtitle}>Mapped Diagnostic Tests ({testsForViewingCat.length})</Text>
                  </View>
                </View>
                <Pressable onPress={() => setViewingTestsCat(null)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {testsForViewingCat.length === 0 ? (
                  <View style={styles.emptyTestsBox}>
                    <Ionicons name="file-tray-outline" size={36} color={COLORS.slate} />
                    <Text style={styles.emptyTestsText}>No individual tests mapped to this department yet.</Text>
                  </View>
                ) : (
                  testsForViewingCat.map(t => (
                    <View key={t.id} style={styles.testItemRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Text style={styles.testItemCode}>{t.testCode}</Text>
                          <Text style={styles.testItemName}>{t.testName}</Text>
                        </View>
                        <Text style={styles.testItemSub}>{t.tubeContainer} • {t.sampleRequired}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text style={styles.testItemPrice}>₹{t.suggestedMysuruPrice}</Text>
                        <Text style={styles.testItemTat}>TAT: {t.tat}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalPrimaryBtn} onPress={() => setViewingTestsCat(null)}>
                  <Text style={styles.modalPrimaryBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Add / Edit Category (Clean Centered Modal) */}
      {(isNewModalOpen || isEditModalOpen) && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isNewModalOpen ? "Add Diagnostic Department" : `Edit Category: ${formData.code}`}
                </Text>
                <Pressable
                  onPress={() => {
                    setIsNewModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                  }}
                  style={styles.closeIconBtn}
                >
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Category Code *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. HEM, BIO, END"
                      value={formData.code}
                      onChangeText={val => setFormData({ ...formData, code: val.toUpperCase() })}
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Department Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Hematology & Clinical Pathology"
                      value={formData.name}
                      onChangeText={val => setFormData({ ...formData, name: val })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>NABL ISO 15189 Discipline</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Clinical Biochemistry, Medical Microbiology"
                    value={formData.nablDiscipline}
                    onChangeText={val => setFormData({ ...formData, nablDiscipline: val })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Description & Scope</Text>
                  <TextInput
                    style={[styles.textInput, { height: 64 }]}
                    multiline
                    placeholder="Brief description of clinical scope..."
                    value={formData.description}
                    onChangeText={val => setFormData({ ...formData, description: val })}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Head of Department</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Dr. Arvind Rao"
                      value={formData.headOfDepartment}
                      onChangeText={val => setFormData({ ...formData, headOfDepartment: val })}
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Room / Wing Location</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Lab Block A - Room 102"
                      value={formData.roomNumber}
                      onChangeText={val => setFormData({ ...formData, roomNumber: val })}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Standard SLA TAT</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 4-6 Hours"
                      value={formData.standardTAT}
                      onChangeText={val => setFormData({ ...formData, standardTAT: val })}
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Specimen Storage Temp</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 2°C - 8°C"
                      value={formData.storageTemp}
                      onChangeText={val => setFormData({ ...formData, storageTemp: val })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Sample Types (comma-separated)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Whole Blood (EDTA), Serum (SST), Urine"
                    value={formData.sampleTypesStr}
                    onChangeText={val => setFormData({ ...formData, sampleTypesStr: val })}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setIsNewModalOpen(false);
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                  }}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSaveBtn}
                  onPress={isNewModalOpen ? handleSaveAdd : handleSaveEdit}
                >
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>
                    {isNewModalOpen ? "Create Category" : "Save Changes"}
                  </Text>
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
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  kpiCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  kpiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.navy
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    height: 42,
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
    paddingHorizontal: 12,
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    paddingBottom: 40
  },
  categoryCard: {
    width: "48.5%",
    minWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden"
  },
  cardHeaderStrip: {
    height: 4,
    width: "100%"
  },
  cardContent: {
    padding: 16
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8
  },
  codeAndIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  codeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: "700"
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.navy
  },
  categoryDesc: {
    fontSize: 12,
    color: COLORS.slate,
    lineHeight: 18,
    marginBottom: 12
  },
  metaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.slate,
    width: 96
  },
  metaValue: {
    fontSize: 12,
    color: COLORS.navy,
    flex: 1
  },
  metaValueBold: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.teal,
    flex: 1
  },
  sampleTypesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14
  },
  sampleTypeTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  samplePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6
  },
  samplePillText: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: "500"
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12
  },
  viewTestsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewTestsBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy
  },
  actionIconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center"
  },
  deactivateBtn: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7"
  },
  activateBtn: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5"
  },
  // Modal Styles (Centered)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 580,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
  viewTestsModalCard: {
    width: "100%",
    maxWidth: 620,
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
    padding: 20,
    maxHeight: 460
  },
  formRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14
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
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.navy,
    backgroundColor: COLORS.white
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
    paddingVertical: 9,
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
    paddingVertical: 9,
    borderRadius: 8
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white
  },
  testItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  testItemCode: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal,
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  testItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.navy
  },
  testItemSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  testItemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  testItemTat: {
    fontSize: 11,
    color: COLORS.slate
  },
  emptyTestsBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 10
  },
  emptyTestsText: {
    fontSize: 13,
    color: COLORS.slate
  }
});
