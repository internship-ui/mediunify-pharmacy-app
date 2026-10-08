// MediUnify Lab Checkup Packages Screen (Popular Checkups & Curated Checkups)
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
import { LabStatusBadge } from "./LabBadge";

export function LabCheckupPackagesScreen({ initialTab = "popular" }) {
  const {
    tests,
    testsMap,
    popularPackages,
    curatedPackages,
    addPackage,
    updatePackage,
    duplicatePackage,
    togglePackageStatus,
    addTestToPackage,
    removeTestFromPackage
  } = useLab();

  const [activeTab, setActiveTab] = useState(initialTab || "popular"); // 'popular' or 'curated'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals
  const [viewPackageModal, setViewPackageModal] = useState(null); // package object
  const [editPackageModal, setEditPackageModal] = useState(null); // null, 'add', or package object
  const [showAddTestDropdown, setShowAddTestDropdown] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    packageCode: "",
    packageName: "",
    category: "Full Body Wellness",
    suggestedMysuruPrice: "1999",
    referenceOriginalPrice: "3800",
    tat: "12-24 Hours",
    sampleRequired: "Blood (EDTA, SST), Urine",
    tubeContainer: "EDTA (Purple Top) + SST (Yellow Top)",
    preparation: "8-10 hours strict overnight fasting.",
    clinicalPricingNote: "",
    status: "Active",
    testIds: []
  });

  const currentPackageList = activeTab === "popular" ? popularPackages : curatedPackages;

  const filteredPackages = useMemo(() => {
    return currentPackageList.filter(pkg => {
      if (selectedCategory !== "ALL" && pkg.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = pkg.packageName.toLowerCase().includes(q);
        const matchCode = pkg.packageCode.toLowerCase().includes(q);
        const matchCat = pkg.category.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat) return false;
      }
      return true;
    });
  }, [currentPackageList, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set();
    currentPackageList.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [currentPackageList]);

  const handleOpenAdd = () => {
    const isPop = activeTab === "popular";
    setFormData({
      packageCode: `${isPop ? "POP" : "CUR"}-${Math.floor(100 + Math.random() * 900)}`,
      packageName: "",
      category: isPop ? "Executive Health Checkup" : "Lifestyle & Wellness",
      suggestedMysuruPrice: "2499",
      referenceOriginalPrice: "4800",
      tat: "12-24 Hours",
      sampleRequired: "Blood & Urine",
      tubeContainer: "EDTA + SST Tubes",
      preparation: "8-10 hours overnight fasting required.",
      clinicalPricingNote: "",
      status: "Active",
      testIds: ["TEST-CBC", "TEST-FBS", "TEST-LIPID"]
    });
    setEditPackageModal("add");
  };

  const handleOpenEdit = (pkg) => {
    setFormData({
      packageCode: pkg.packageCode,
      packageName: pkg.packageName,
      category: pkg.category,
      suggestedMysuruPrice: String(pkg.suggestedMysuruPrice || 0),
      referenceOriginalPrice: String(pkg.referenceOriginalPrice || 0),
      tat: pkg.tat || "12-24 Hours",
      sampleRequired: pkg.sampleRequired || "Blood & Urine",
      tubeContainer: pkg.tubeContainer || "EDTA + SST Tubes",
      preparation: pkg.preparation || "Overnight fasting.",
      clinicalPricingNote: pkg.clinicalPricingNote || "",
      status: pkg.status,
      testIds: [...(pkg.testIds || [])]
    });
    setEditPackageModal(pkg);
  };

  const handleSavePackage = () => {
    if (!formData.packageName.trim()) {
      Alert.alert("Validation Error", "Please enter package name.");
      return;
    }

    if (editPackageModal === "add") {
      addPackage(formData, activeTab === "popular");
    } else if (editPackageModal && editPackageModal.id) {
      updatePackage(editPackageModal.id, formData);
    }
    setEditPackageModal(null);
  };

  const handleDuplicate = (pkg) => {
    const dup = duplicatePackage(pkg.id);
    if (dup) {
      Alert.alert("Package Duplicated", `Created ${dup.packageName} (${dup.packageCode})`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Popular vs Curated Switcher */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Ionicons name="cube" size={20} color={COLORS.navy} />
          <View>
            <Text style={styles.topTitle}>Checkup Master Packages</Text>
            <Text style={styles.topSub}>Excel Client Master Data · Curated Diagnostic Bundles</Text>
          </View>
        </View>

        <Pressable style={styles.addPackageBtn} onPress={handleOpenAdd}>
          <Ionicons name="add-circle" size={16} color={COLORS.white} />
          <Text style={styles.addPackageBtnText}>Create Package</Text>
        </Pressable>
      </View>

      {/* Main Mode Tabs: POPULAR CHECKUPS vs CURATED CHECKUPS */}
      <View style={styles.tabNavRow}>
        <Pressable
          style={[styles.tabBtn, activeTab === "popular" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("popular");
            setSelectedCategory("ALL");
          }}
        >
          <Ionicons
            name="star"
            size={16}
            color={activeTab === "popular" ? COLORS.white : COLORS.slate}
          />
          <Text style={[styles.tabBtnText, activeTab === "popular" && styles.tabBtnTextActive]}>
            POPULAR CHECKUPS ({popularPackages.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === "curated" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("curated");
            setSelectedCategory("ALL");
          }}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={activeTab === "curated" ? COLORS.white : COLORS.slate}
          />
          <Text style={[styles.tabBtnText, activeTab === "curated" && styles.tabBtnTextActive]}>
            CURATED CHECKUPS ({curatedPackages.length})
          </Text>
        </Pressable>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === "popular" ? "Popular" : "Curated"} packages by name, code, clinical category...`}
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

        {/* Categories Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <Pressable
            style={[styles.categoryChip, selectedCategory === "ALL" && styles.categoryChipActive]}
            onPress={() => setSelectedCategory("ALL")}
          >
            <Text style={[styles.categoryChipText, selectedCategory === "ALL" && styles.categoryChipTextActive]}>
              All ({currentPackageList.length})
            </Text>
          </Pressable>
          {categories.map(cat => (
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

      {/* Package Grid / List */}
      <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
        <View style={styles.packageCardGrid}>
          {filteredPackages.map(pkg => {
            const includedTestObjs = (pkg.testIds || []).map(id => testsMap[id]).filter(Boolean);
            const totalRefPrice = includedTestObjs.reduce((sum, t) => sum + (t.suggestedMysuruPrice || 0), 0);
            const savings = Math.max(0, (pkg.referenceOriginalPrice || totalRefPrice) - pkg.suggestedMysuruPrice);

            return (
              <View key={pkg.id} style={styles.pkgCard}>
                {/* Package Card Header */}
                <View style={styles.pkgCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.codePill}>
                      <Text style={styles.codePillText}>{pkg.packageCode}</Text>
                      <Text style={styles.categoryBadge}>{pkg.category}</Text>
                    </View>
                    <Text style={styles.pkgName}>{pkg.packageName}</Text>
                  </View>
                  <LabStatusBadge status={pkg.status} size="small" />
                </View>

                {/* Package Pricing Strip */}
                <View style={styles.priceContainer}>
                  <View>
                    <Text style={styles.priceLabel}>SUGGESTED MYSURU PRICE</Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                      <Text style={styles.pkgPrice}>₹{pkg.suggestedMysuruPrice}</Text>
                      <Text style={styles.pkgRefPrice}>₹{pkg.referenceOriginalPrice || totalRefPrice}</Text>
                    </View>
                  </View>
                  {savings > 0 && (
                    <View style={styles.savingsChip}>
                      <Text style={styles.savingsText}>Save ₹{savings}</Text>
                    </View>
                  )}
                </View>

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="flask-outline" size={13} color={COLORS.navy} />
                    <Text style={styles.metaText}><Text style={{ fontWeight: "700" }}>{includedTestObjs.length}</Text> Test Panels</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={13} color={COLORS.navy} />
                    <Text style={styles.metaText}>TAT: {pkg.tat || "12-24h"}</Text>
                  </View>
                </View>

                {/* Included Tests Preview List */}
                <View style={styles.testTagsContainer}>
                  <Text style={styles.testTagsLabel}>INCLUDED DIAGNOSTIC TESTS:</Text>
                  <View style={styles.testTagsWrap}>
                    {includedTestObjs.slice(0, 5).map((t, idx) => (
                      <View key={idx} style={styles.testTagPill}>
                        <Text style={styles.testTagPillText}>{t.testName.split("(")[0].trim()}</Text>
                      </View>
                    ))}
                    {includedTestObjs.length > 5 && (
                      <View style={[styles.testTagPill, { backgroundColor: COLORS.navyLight }]}>
                        <Text style={[styles.testTagPillText, { color: COLORS.navy, fontWeight: "800" }]}>
                          +{includedTestObjs.length - 5} More
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {pkg.clinicalPricingNote ? (
                  <Text style={styles.clinicalNote} numberOfLines={2}>
                    {pkg.clinicalPricingNote}
                  </Text>
                ) : null}

                {/* Action Buttons Footer */}
                <View style={styles.cardFooter}>
                  <Pressable
                    style={styles.viewDetailBtn}
                    onPress={() => setViewPackageModal(pkg)}
                  >
                    <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
                    <Text style={styles.viewDetailBtnText}>View Details & Mapping</Text>
                  </Pressable>

                  <View style={styles.actionGroupRight}>
                    <Pressable
                      style={styles.cardActionIconBtn}
                      onPress={() => handleOpenEdit(pkg)}
                    >
                      <Ionicons name="create-outline" size={15} color={COLORS.teal} />
                    </Pressable>
                    <Pressable
                      style={styles.cardActionIconBtn}
                      onPress={() => handleDuplicate(pkg)}
                    >
                      <Ionicons name="copy-outline" size={15} color={COLORS.navy} />
                    </Pressable>
                    <Pressable
                      style={[styles.cardActionIconBtn, pkg.status === "Active" ? styles.disableBtn : styles.enableBtn]}
                      onPress={() => togglePackageStatus(pkg.id)}
                    >
                      <Ionicons
                        name={pkg.status === "Active" ? "pause-outline" : "play-outline"}
                        size={14}
                        color={pkg.status === "Active" ? "#DC2626" : "#059669"}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Package Details & Test Mapping Modal */}
      {viewPackageModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.packageModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <Ionicons name="cube" size={20} color={COLORS.teal} />
                  <View>
                    <Text style={styles.modalTitle}>{viewPackageModal.packageName}</Text>
                    <Text style={styles.modalSub}>
                      Code: {viewPackageModal.packageCode} · {viewPackageModal.category}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => setViewPackageModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ padding: 18, gap: 14 }}>
                {/* Package Info Banner */}
                <View style={styles.packageBanner}>
                  <View style={styles.packageBannerItem}>
                    <Text style={styles.packageBannerLabel}>SUGGESTED MYSURU PRICE</Text>
                    <Text style={styles.packageBannerVal}>₹{viewPackageModal.suggestedMysuruPrice}</Text>
                  </View>
                  <View style={styles.packageBannerItem}>
                    <Text style={styles.packageBannerLabel}>REFERENCE SUM VALUE</Text>
                    <Text style={styles.packageBannerValStrike}>
                      ₹{viewPackageModal.referenceOriginalPrice || 3500}
                    </Text>
                  </View>
                  <View style={styles.packageBannerItem}>
                    <Text style={styles.packageBannerLabel}>TURNAROUND TIME</Text>
                    <Text style={styles.packageBannerVal}>{viewPackageModal.tat || "12-24 Hours"}</Text>
                  </View>
                  <LabStatusBadge status={viewPackageModal.status} />
                </View>

                {/* Preparation Instructions */}
                <View style={styles.prepDetailBox}>
                  <Ionicons name="information-circle" size={16} color="#B45309" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prepDetailTitle}>PATIENT PREPARATION PROTOCOL</Text>
                    <Text style={styles.prepDetailText}>
                      {viewPackageModal.preparation || "10-12 hours fasting required."}
                    </Text>
                  </View>
                </View>

                {/* Included Tests Table with Mapping Tools */}
                <View style={styles.mappingSection}>
                  <View style={styles.mappingSectionHeader}>
                    <Text style={styles.mappingSectionTitle}>
                      INCLUDED TESTS & SPECIMEN REQUIREMENTS ({viewPackageModal.testIds?.length || 0}):
                    </Text>
                    <Pressable
                      style={styles.addTestToPkgBtn}
                      onPress={() => setShowAddTestDropdown(!showAddTestDropdown)}
                    >
                      <Ionicons name="add" size={14} color={COLORS.teal} />
                      <Text style={styles.addTestToPkgBtnText}>Add Test from Catalogue</Text>
                    </Pressable>
                  </View>

                  {/* Add Test from Catalogue Dropdown */}
                  {showAddTestDropdown && (
                    <View style={styles.testCatalogueDropdown}>
                      <Text style={styles.dropdownHeader}>Select test from Master Catalogue:</Text>
                      <ScrollView style={{ maxHeight: 180 }}>
                        {tests
                          .filter(t => !viewPackageModal.testIds?.includes(t.id))
                          .map(t => (
                            <Pressable
                              key={t.id}
                              style={styles.dropdownRow}
                              onPress={() => {
                                addTestToPackage(viewPackageModal.id, t.id);
                                setViewPackageModal(prev => ({
                                  ...prev,
                                  testIds: [...(prev.testIds || []), t.id]
                                }));
                                setShowAddTestDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownTestName}>{t.testName}</Text>
                              <Text style={styles.dropdownPrice}>₹{t.suggestedMysuruPrice}</Text>
                            </Pressable>
                          ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Tests Mapping List */}
                  <View style={styles.testsMappingList}>
                    {(viewPackageModal.testIds || []).map((testId, idx) => {
                      const testObj = testsMap[testId];
                      if (!testObj) return null;

                      return (
                        <View key={testId} style={styles.testMapRow}>
                          <View style={styles.testMapIndex}>
                            <Text style={styles.testMapIndexText}>#{idx + 1}</Text>
                          </View>
                          <View style={{ flex: 2 }}>
                            <Text style={styles.testMapName}>{testObj.testName}</Text>
                            <Text style={styles.testMapCategory}>{testObj.category} · Code: {testObj.testCode}</Text>
                            <Text style={styles.testMapParams}>
                              {testObj.includedParameters?.length || 1} Parameters ({testObj.includedParameters?.map(p => p.name).slice(0, 3).join(", ")})
                            </Text>
                          </View>

                          <View style={{ flex: 1.5 }}>
                            <Text style={styles.testMapSample}>{testObj.sampleRequired}</Text>
                            <Text style={styles.testMapTube}>{testObj.tubeContainer}</Text>
                          </View>

                          <View style={{ flex: 0.8, alignItems: "flex-end" }}>
                            <Text style={styles.testMapPrice}>₹{testObj.suggestedMysuruPrice}</Text>
                            <Pressable
                              style={styles.removeTestBtn}
                              onPress={() => {
                                removeTestFromPackage(viewPackageModal.id, testId);
                                setViewPackageModal(prev => ({
                                  ...prev,
                                  testIds: prev.testIds.filter(id => id !== testId)
                                }));
                              }}
                            >
                              <Ionicons name="trash-outline" size={14} color="#DC2626" />
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {viewPackageModal.clinicalPricingNote ? (
                  <View style={styles.clinicalNotesBox}>
                    <Text style={styles.clinicalNotesTitle}>CLINICAL & PRICING RATIONALE</Text>
                    <Text style={styles.clinicalNotesText}>{viewPackageModal.clinicalPricingNote}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.editFromViewBtn}
                  onPress={() => {
                    const p = viewPackageModal;
                    setViewPackageModal(null);
                    handleOpenEdit(p);
                  }}
                >
                  <Ionicons name="create-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.editFromViewBtnText}>Edit Package Details</Text>
                </Pressable>
                <Pressable style={styles.modalCloseBtn} onPress={() => setViewPackageModal(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Package Modal */}
      {editPackageModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.editModalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name={editPackageModal === "add" ? "add-circle" : "create"} size={20} color={COLORS.teal} />
                  <Text style={styles.modalTitle}>
                    {editPackageModal === "add"
                      ? `Create ${activeTab === "popular" ? "Popular" : "Curated"} Checkup Package`
                      : `Edit Package (${formData.packageCode})`}
                  </Text>
                </View>
                <Pressable onPress={() => setEditPackageModal(null)}>
                  <Ionicons name="close" size={20} color={COLORS.slate} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ padding: 18, gap: 12 }}>
                <Text style={styles.sectionFormTitle}>1. Package Master Information</Text>
                <View style={styles.formRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>Package Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.packageName}
                      onChangeText={(t) => setFormData(f => ({ ...f, packageName: t }))}
                      placeholder="e.g. Novus Executive Essentials"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Package Code</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.packageCode}
                      onChangeText={(t) => setFormData(f => ({ ...f, packageCode: t }))}
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
                    <Text style={styles.inputLabel}>Turnaround Time (TAT)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.tat}
                      onChangeText={(t) => setFormData(f => ({ ...f, tat: t }))}
                    />
                  </View>
                </View>

                <Text style={[styles.sectionFormTitle, { marginTop: 10 }]}>2. Commercial Pricing</Text>
                <View style={styles.formRow}>
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
                    <Text style={styles.inputLabel}>Reference Market Value (₹)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.referenceOriginalPrice}
                      onChangeText={(t) => setFormData(f => ({ ...f, referenceOriginalPrice: t }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.inputLabel}>Preparation Instructions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={formData.preparation}
                    onChangeText={(t) => setFormData(f => ({ ...f, preparation: t }))}
                    multiline
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Clinical & Pricing Note</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={formData.clinicalPricingNote}
                    onChangeText={(t) => setFormData(f => ({ ...f, clinicalPricingNote: t }))}
                    multiline
                    placeholder="Clinical rationale, parameters covered, target age group..."
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditPackageModal(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSavePackage}>
                  <Text style={styles.modalSaveBtnText}>Save Checkup Package</Text>
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
  addPackageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  addPackageBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700"
  },
  tabNavRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 12
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC"
  },
  tabBtnActive: {
    backgroundColor: COLORS.navy
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate
  },
  tabBtnTextActive: {
    color: COLORS.white
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
    backgroundColor: COLORS.teal
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
  gridScroll: {
    flex: 1
  },
  gridContent: {
    padding: 16
  },
  packageCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  pkgCard: {
    width: "48%",
    minWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12
  },
  pkgCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  codePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  codePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.navy,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  categoryBadge: {
    fontSize: 10,
    color: COLORS.slate,
    fontWeight: "600"
  },
  pkgName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.navy
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  pkgPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.teal
  },
  pkgRefPrice: {
    fontSize: 12,
    color: COLORS.slateLight,
    textDecorationLine: "line-through"
  },
  savingsChip: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  savingsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#047857"
  },
  metaRow: {
    flexDirection: "row",
    gap: 14
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 11,
    color: COLORS.navyMuted
  },
  testTagsContainer: {
    gap: 6
  },
  testTagsLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  testTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  testTagPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  testTagPillText: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: "600"
  },
  clinicalNote: {
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 14
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    marginTop: 4
  },
  viewDetailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewDetailBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  actionGroupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  cardActionIconBtn: {
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  packageModalCard: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: "hidden"
  },
  editModalCard: {
    width: "100%",
    maxWidth: 680,
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
  packageBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.tealLight,
    padding: 14,
    borderRadius: 8
  },
  packageBannerItem: {
    gap: 2
  },
  packageBannerLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  packageBannerVal: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navy
  },
  packageBannerValStrike: {
    fontSize: 14,
    color: COLORS.slate,
    textDecorationLine: "line-through"
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
  mappingSection: {
    gap: 8
  },
  mappingSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  mappingSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  addTestToPkgBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  addTestToPkgBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal
  },
  testCatalogueDropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  dropdownHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slate,
    marginBottom: 6
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  dropdownTestName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  dropdownPrice: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  testsMappingList: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden"
  },
  testMapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    backgroundColor: COLORS.white,
    gap: 10
  },
  testMapIndex: {
    width: 24,
    alignItems: "center"
  },
  testMapIndexText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slate
  },
  testMapName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  testMapCategory: {
    fontSize: 9,
    color: COLORS.slate,
    marginTop: 1
  },
  testMapParams: {
    fontSize: 9,
    color: COLORS.teal,
    fontWeight: "600",
    marginTop: 1
  },
  testMapSample: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.navy
  },
  testMapTube: {
    fontSize: 9,
    color: COLORS.slate,
    marginTop: 1
  },
  testMapPrice: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.teal
  },
  removeTestBtn: {
    padding: 4,
    marginTop: 2
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
