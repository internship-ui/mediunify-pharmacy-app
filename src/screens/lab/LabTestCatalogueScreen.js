// MediUnify Lab Test Catalogue Screen
import React, { useState, useMemo } from "react";
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
import { LAB_CATEGORIES, SAMPLE_CONTAINER_TYPES } from "../../data/labMasterData";
import { LabStatusBadge } from "./LabBadge";

export function LabTestCatalogueScreen() {
  const { tests, addTest, updateTest, toggleTestStatus } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSampleFilter, setSelectedSampleFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Modals
  const [viewTestModal, setViewTestModal] = useState(null); // test object
  const [editTestModal, setEditTestModal] = useState(null); // null, 'add', or test object

  // Form State
  const [formData, setFormData] = useState({
    testName: "",
    testCode: "",
    category: LAB_CATEGORIES[0],
    panelType: "Individual",
    sampleRequired: "Blood (SST / Gel)",
    tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
    preparation: "No fasting required.",
    tat: "4-6 Hours",
    cpt: "150",
    suggestedMysuruPrice: "350",
    status: "Active",
    clinicalNotes: "",
    includedParameters: [{ name: "", range: "", unit: "" }]
  });

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      if (selectedCategory !== "ALL" && test.category !== selectedCategory) return false;
      if (selectedSampleFilter !== "ALL" && !test.sampleRequired.includes(selectedSampleFilter)) return false;
      if (selectedStatusFilter !== "ALL" && test.status !== selectedStatusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = test.testName.toLowerCase().includes(q);
        const matchCode = test.testCode.toLowerCase().includes(q);
        const matchCat = test.category.toLowerCase().includes(q);
        const matchPrep = test.preparation.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat && !matchPrep) return false;
      }
      return true;
    });
  }, [tests, selectedCategory, selectedSampleFilter, selectedStatusFilter, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      testName: "",
      testCode: `TST-${Math.floor(100 + Math.random() * 900)}`,
      category: LAB_CATEGORIES[0],
      panelType: "Individual",
      sampleRequired: "Blood (SST / Gel)",
      tubeContainer: "SST / Gel Tube (Yellow Top - 4ml)",
      preparation: "No fasting required.",
      tat: "4-6 Hours",
      cpt: "150",
      suggestedMysuruPrice: "350",
      status: "Active",
      clinicalNotes: "",
      includedParameters: [{ name: "", range: "", unit: "" }]
    });
    setEditTestModal("add");
  };

  const handleOpenEdit = (test) => {
    setFormData({
      testName: test.testName,
      testCode: test.testCode,
      category: test.category,
      panelType: test.panelType || "Individual",
      sampleRequired: test.sampleRequired,
      tubeContainer: test.tubeContainer,
      preparation: test.preparation,
      tat: test.tat,
      cpt: String(test.cpt || 0),
      suggestedMysuruPrice: String(test.suggestedMysuruPrice || 0),
      status: test.status,
      clinicalNotes: test.clinicalNotes || "",
      includedParameters: test.includedParameters?.length ? [...test.includedParameters] : [{ name: test.testName, range: "Normal", unit: "" }]
    });
    setEditTestModal(test);
  };

  const handleSaveTest = () => {
    if (!formData.testName.trim()) {
      Alert.alert("Validation Error", "Please enter the diagnostic test name.");
      return;
    }

    if (editTestModal === "add") {
      addTest(formData);
    } else if (editTestModal && editTestModal.id) {
      updateTest(editTestModal.id, formData);
    }
    setEditTestModal(null);
  };

  const handleAddParamRow = () => {
    setFormData(prev => ({
      ...prev,
      includedParameters: [...prev.includedParameters, { name: "", range: "", unit: "" }]
    }));
  };

  const handleUpdateParamRow = (idx, field, val) => {
    setFormData(prev => {
      const updated = [...prev.includedParameters];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, includedParameters: updated };
    });
  };

  const handleRemoveParamRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      includedParameters: prev.includedParameters.filter((_, i) => i !== idx)
    }));
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Actions Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="flask" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Test Master Catalogue</Text>
            <Text style={styles.topSub}>NABL Diagnostic Master · {tests.length} Standard Test Profiles</Text>
          </View>
        </View>

        <Pressable style={styles.addTestBtn} onPress={handleOpenAdd}>
          <Ionicons name="add-circle" size={16} color={COLORS.white} />
          <Text style={styles.addTestBtnText}>Add Diagnostic Test</Text>
        </Pressable>
      </View>

      {/* Filter & Search Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search test name, code, clinical prep, category..."
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

        {/* Categories Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <Pressable
            style={[styles.categoryChip, selectedCategory === "ALL" && styles.categoryChipActive]}
            onPress={() => setSelectedCategory("ALL")}
          >
            <Text style={[styles.categoryChipText, selectedCategory === "ALL" && styles.categoryChipTextActive]}>
              All Categories ({tests.length})
            </Text>
          </Pressable>
          {LAB_CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tests Table */}
      <ScrollView style={styles.tableScroll} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 2.6 }]}>TEST NAME & CODE</Text>
            <Text style={[styles.th, { flex: 1.8 }]}>CATEGORY</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>SPECIMEN & TUBE</Text>
            <Text style={[styles.th, { flex: 2.2 }]}>PATIENT PREPARATION</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>TAT</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>PRICE (CPT)</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1.4, textAlign: "right" }]}>ACTIONS</Text>
          </View>

          {filteredTests.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="flask-outline" size={36} color={COLORS.slateLight} />
              <Text style={styles.emptyTitle}>No matching diagnostic tests</Text>
              <Text style={styles.emptySub}>Adjust your category or search filter.</Text>
            </View>
          ) : (
            filteredTests.map((test, idx) => (
              <View key={test.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                {/* Test Name & Code */}
                <View style={{ flex: 2.6 }}>
                  <Text style={styles.testNameText}>{test.testName}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <Text style={styles.testCodeText}>Code: {test.testCode}</Text>
                    <View style={styles.panelTypeChip}>
                      <Text style={styles.panelTypeText}>{test.panelType || "Individual"}</Text>
                    </View>
                  </View>
                </View>

                {/* Category */}
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.categoryText}>{test.category}</Text>
                </View>

                {/* Specimen & Container */}
                <View style={{ flex: 1.6 }}>
                  <Text style={styles.specimenText}>{test.sampleRequired}</Text>
                  <Text style={styles.tubeText} numberOfLines={1}>{test.tubeContainer}</Text>
                </View>

                {/* Preparation */}
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.prepText} numberOfLines={2}>{test.preparation}</Text>
                </View>

                {/* TAT */}
                <View style={{ flex: 1.1 }}>
                  <Text style={styles.tatText}>{test.tat}</Text>
                </View>

                {/* Price & CPT */}
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.priceText}>₹{test.suggestedMysuruPrice}</Text>
                  {test.cpt > 0 && <Text style={styles.cptText}>CPT: ₹{test.cpt}</Text>}
                </View>

                {/* Status */}
                <View style={{ flex: 1.1 }}>
                  <LabStatusBadge status={test.status} size="small" />
                </View>

                {/* Actions */}
                <View style={{ flex: 1.4, flexDirection: "row", justifyContent: "flex-end", gap: 6 }}>
                  <Pressable
                    style={styles.actionIconBtn}
                    onPress={() => setViewTestModal(test)}
                  >
                    <Ionicons name="eye-outline" size={15} color={COLORS.navy} />
                  </Pressable>
                  <Pressable
                    style={styles.actionIconBtn}
                    onPress={() => handleOpenEdit(test)}
                  >
                    <Ionicons name="create-outline" size={15} color={COLORS.teal} />
                  </Pressable>
                  <Pressable
                    style={[styles.actionIconBtn, test.status === "Active" ? styles.disableBtn : styles.enableBtn]}
                    onPress={() => toggleTestStatus(test.id)}
                  >
                    <Ionicons
                      name={test.status === "Active" ? "pause-outline" : "play-outline"}
                      size={14}
                      color={test.status === "Active" ? "#DC2626" : "#059669"}
                    />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* View Test Details Modal */}
      {viewTestModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.viewModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <Ionicons name="flask" size={20} color={COLORS.teal} />
                  <View>
                    <Text style={styles.modalTitle}>{viewTestModal.testName}</Text>
                    <Text style={styles.modalSub}>Code: {viewTestModal.testCode} · {viewTestModal.category}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setViewTestModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
                {/* Clinical Specimen Box */}
                <View style={styles.specimenBox}>
                  <View style={styles.specimenBoxItem}>
                    <Text style={styles.specimenBoxLabel}>SAMPLE REQUIRED</Text>
                    <Text style={styles.specimenBoxVal}>{viewTestModal.sampleRequired}</Text>
                  </View>
                  <View style={styles.specimenBoxItem}>
                    <Text style={styles.specimenBoxLabel}>CONTAINER / TUBE</Text>
                    <Text style={styles.specimenBoxVal}>{viewTestModal.tubeContainer}</Text>
                  </View>
                  <View style={styles.specimenBoxItem}>
                    <Text style={styles.specimenBoxLabel}>TURNAROUND TIME</Text>
                    <Text style={styles.specimenBoxVal}>{viewTestModal.tat}</Text>
                  </View>
                </View>

                {/* Patient Prep Box */}
                <View style={styles.prepDetailBox}>
                  <Ionicons name="information-circle" size={16} color="#B45309" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prepDetailTitle}>PATIENT PREPARATION INSTRUCTIONS</Text>
                    <Text style={styles.prepDetailText}>{viewTestModal.preparation}</Text>
                  </View>
                </View>

                {/* Commercial Pricing */}
                <View style={styles.pricingStrip}>
                  <View>
                    <Text style={styles.pricingStripLabel}>SUGGESTED MYSURU PRICE</Text>
                    <Text style={styles.pricingStripVal}>₹{viewTestModal.suggestedMysuruPrice}</Text>
                  </View>
                  {viewTestModal.cpt > 0 && (
                    <View>
                      <Text style={styles.pricingStripLabel}>APPROX CPT PER TEST</Text>
                      <Text style={styles.pricingStripVal}>₹{viewTestModal.cpt}</Text>
                    </View>
                  )}
                  <LabStatusBadge status={viewTestModal.status} />
                </View>

                {/* Parameters List */}
                <View style={styles.paramsModalSection}>
                  <Text style={styles.paramsModalTitle}>
                    INCLUDED PARAMETERS & NORMAL BIOLOGICAL RANGES ({viewTestModal.includedParameters?.length || 0}):
                  </Text>
                  <View style={styles.paramsTable}>
                    {viewTestModal.includedParameters?.map((p, idx) => (
                      <View key={idx} style={[styles.paramTableRow, idx % 2 === 1 && styles.paramTableRowAlt]}>
                        <Text style={styles.paramNameText}>{p.name}</Text>
                        <Text style={styles.paramRangeText}>{p.range} {p.unit || ""}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {viewTestModal.clinicalNotes ? (
                  <View style={styles.clinicalNotesBox}>
                    <Text style={styles.clinicalNotesTitle}>CLINICAL & METHODOLOGY NOTE</Text>
                    <Text style={styles.clinicalNotesText}>{viewTestModal.clinicalNotes}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.editFromViewBtn} onPress={() => {
                  const t = viewTestModal;
                  setViewTestModal(null);
                  handleOpenEdit(t);
                }}>
                  <Ionicons name="create-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.editFromViewBtnText}>Edit Test</Text>
                </Pressable>
                <Pressable style={styles.modalCloseBtn} onPress={() => setViewTestModal(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Test Modal */}
      {editTestModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.editModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={editTestModal === "add" ? "add-circle" : "create"} size={20} color={COLORS.teal} />
                  <Text style={styles.modalTitle}>
                    {editTestModal === "add" ? "Add New Diagnostic Test" : `Edit Test (${formData.testCode})`}
                  </Text>
                </View>
                <Pressable onPress={() => setEditTestModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ padding: 18, gap: 12 }}>
                <Text style={styles.sectionFormTitle}>1. Basic Information</Text>
                <View style={styles.formRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>Test Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.testName}
                      onChangeText={(t) => setFormData(f => ({ ...f, testName: t }))}
                      placeholder="e.g. Complete Blood Count (CBC)"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Test Code</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.testCode}
                      onChangeText={(t) => setFormData(f => ({ ...f, testCode: t }))}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.category}
                      onChangeText={(t) => setFormData(f => ({ ...f, category: t }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Panel Type</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.panelType}
                      onChangeText={(t) => setFormData(f => ({ ...f, panelType: t }))}
                      placeholder="Individual / Panel"
                    />
                  </View>
                </View>

                <Text style={[styles.sectionFormTitle, { marginTop: 10 }]}>2. Specimen & Clinical Preparation</Text>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Sample Required</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.sampleRequired}
                      onChangeText={(t) => setFormData(f => ({ ...f, sampleRequired: t }))}
                      placeholder="e.g. Blood (EDTA)"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Tube / Container</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.tubeContainer}
                      onChangeText={(t) => setFormData(f => ({ ...f, tubeContainer: t }))}
                      placeholder="e.g. EDTA Tube (Purple Top)"
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.inputLabel}>Patient Preparation Instructions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={formData.preparation}
                    onChangeText={(t) => setFormData(f => ({ ...f, preparation: t }))}
                    multiline
                    placeholder="e.g. 8-10 hours strict fasting / Morning sample preferred"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Turnaround Time (TAT)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.tat}
                      onChangeText={(t) => setFormData(f => ({ ...f, tat: t }))}
                      placeholder="e.g. 4-6 Hours"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Suggested Mysuru Price (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.suggestedMysuruPrice}
                      onChangeText={(t) => setFormData(f => ({ ...f, suggestedMysuruPrice: t }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Approx CPT (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.cpt}
                      onChangeText={(t) => setFormData(f => ({ ...f, cpt: t }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Parameters Editor */}
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={styles.sectionFormTitle}>3. Included Parameters ({formData.includedParameters.length})</Text>
                    <Pressable style={styles.addParamBtn} onPress={handleAddParamRow}>
                      <Ionicons name="add" size={14} color={COLORS.teal} />
                      <Text style={styles.addParamBtnText}>Add Parameter</Text>
                    </Pressable>
                  </View>

                  {formData.includedParameters.map((param, pIdx) => (
                    <View key={pIdx} style={styles.paramEditRow}>
                      <TextInput
                        style={[styles.textInput, { flex: 2 }]}
                        placeholder="Parameter Name"
                        value={param.name}
                        onChangeText={(t) => handleUpdateParamRow(pIdx, "name", t)}
                      />
                      <TextInput
                        style={[styles.textInput, { flex: 2 }]}
                        placeholder="Ref Range (e.g. 70-99)"
                        value={param.range}
                        onChangeText={(t) => handleUpdateParamRow(pIdx, "range", t)}
                      />
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder="Unit"
                        value={param.unit}
                        onChangeText={(t) => handleUpdateParamRow(pIdx, "unit", t)}
                      />
                      <Pressable style={styles.removeParamBtn} onPress={() => handleRemoveParamRow(pIdx)}>
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditTestModal(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSaveTest}>
                  <Text style={styles.modalSaveBtnText}>Save Diagnostic Test</Text>
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
    borderBottomColor: COLORS.line
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
  addTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  addTestBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  filterBar: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    gap: 8
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
  categoryScroll: {
    gap: 6,
    paddingVertical: 2
  },
  categoryChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  categoryChipActive: {
    backgroundColor: COLORS.navy
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: "700"
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
  testNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  testCodeText: {
    fontSize: 10,
    color: COLORS.slate,
    fontWeight: "600"
  },
  panelTypeChip: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  panelTypeText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.navy
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  specimenText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  tubeText: {
    fontSize: 9,
    color: COLORS.slate,
    marginTop: 1
  },
  prepText: {
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 14
  },
  tatText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  priceText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.teal
  },
  cptText: {
    fontSize: 9,
    color: COLORS.slateLight
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  disableBtn: {
    backgroundColor: "#FEE2E2"
  },
  enableBtn: {
    backgroundColor: "#ECFDF5"
  },
  emptyWrap: {
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
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  viewModalCard: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden"
  },
  editModalCard: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  specimenBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },
  specimenBoxItem: {
    flex: 1
  },
  specimenBoxLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  specimenBoxVal: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  prepDetailBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  prepDetailTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#B45309",
    marginBottom: 2
  },
  prepDetailText: {
    fontSize: 11,
    color: "#92400E",
    lineHeight: 15
  },
  pricingStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.tealLight,
    padding: 12,
    borderRadius: 8
  },
  pricingStripLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  pricingStripVal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 2
  },
  paramsModalSection: {
    gap: 6
  },
  paramsModalTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  paramsTable: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden"
  },
  paramTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  paramTableRowAlt: {
    backgroundColor: "#F8FAFC"
  },
  paramNameText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  paramRangeText: {
    fontSize: 10,
    color: COLORS.slate
  },
  clinicalNotesBox: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 6
  },
  clinicalNotesTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.navy,
    marginBottom: 2
  },
  clinicalNotesText: {
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 14
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: "#F8FAFC"
  },
  editFromViewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  editFromViewBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  modalCloseBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalCloseBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  sectionFormTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.navy,
    letterSpacing: 0.5
  },
  formRow: {
    flexDirection: "row",
    gap: 10
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate,
    marginBottom: 4
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navy
  },
  addParamBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  addParamBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal
  },
  paramEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  removeParamBtn: {
    padding: 6
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  modalSaveBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white
  }
});
