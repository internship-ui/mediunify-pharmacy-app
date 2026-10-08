// MediUnify Lab Admin - Patient Management & Diagnostic Health Directory
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

export function LabPatientsScreen({ onSelectOrder }) {
  const {
    patients,
    addPatient,
    updatePatient
  } = useLab();

  const [searchQuery, setSearchQuery] = useState("");
  const [cohortFilter, setCohortFilter] = useState("ALL");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    bloodGroup: "O+",
    address: "",
    pincode: "570001",
    cohortTagsStr: "Routine Checkup",
    clinicalAlerts: "No specific clinical precautions required.",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "Spouse"
  });

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCohort =
        cohortFilter === "ALL" ||
        (p.cohortTags || []).some(t => t.toLowerCase().includes(cohortFilter.toLowerCase()));

      return matchSearch && matchCohort;
    });
  }, [patients, searchQuery, cohortFilter]);

  // Summary Metrics
  const totalPatients = patients.length;
  const chronicCount = patients.filter(p => (p.cohortTags || []).some(t => t.toLowerCase().includes("diabetic") || t.toLowerCase().includes("cardiac") || t.toLowerCase().includes("thyroid"))).length;
  const seniorCount = patients.filter(p => p.age >= 60 || (p.cohortTags || []).some(t => t.toLowerCase().includes("senior"))).length;
  const totalRevenueAll = patients.reduce((acc, p) => acc + (p.totalSpent || 0), 0);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      age: "35",
      gender: "Male",
      phone: "+91 ",
      email: "",
      bloodGroup: "O+",
      address: "Mysuru, Karnataka",
      pincode: "570001",
      cohortTagsStr: "Routine Checkup",
      clinicalAlerts: "None",
      emergencyName: "Primary Contact",
      emergencyPhone: "+91 ",
      emergencyRelation: "Family"
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (pat) => {
    setIsEditing(true);
    setSelectedPatient(pat);
    setFormData({
      name: pat.name,
      age: String(pat.age),
      gender: pat.gender,
      phone: pat.phone,
      email: pat.email || "",
      bloodGroup: pat.bloodGroup || "O+",
      address: pat.address,
      pincode: pat.pincode || "570001",
      cohortTagsStr: (pat.cohortTags || []).join(", "),
      clinicalAlerts: pat.clinicalAlerts || "",
      emergencyName: pat.emergencyContact?.name || "",
      emergencyPhone: pat.emergencyContact?.phone || "",
      emergencyRelation: pat.emergencyContact?.relation || "Family"
    });
    setIsAddEditModalOpen(true);
  };

  const openProfileModal = (pat) => {
    setSelectedPatient(pat);
    setIsProfileModalOpen(true);
  };

  const handleSavePatient = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please provide at least patient name and contact phone number.");
      return;
    }

    const tagsArr = formData.cohortTagsStr
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const emergencyObj = {
      name: formData.emergencyName,
      phone: formData.emergencyPhone,
      relation: formData.emergencyRelation
    };

    if (isEditing && selectedPatient) {
      updatePatient(selectedPatient.id, {
        name: formData.name,
        age: parseInt(formData.age, 10) || 30,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        pincode: formData.pincode,
        cohortTags: tagsArr,
        clinicalAlerts: formData.clinicalAlerts,
        emergencyContact: emergencyObj
      });
    } else {
      addPatient({
        name: formData.name,
        age: parseInt(formData.age, 10) || 30,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        pincode: formData.pincode,
        cohortTags: tagsArr,
        clinicalAlerts: formData.clinicalAlerts,
        emergencyContact: emergencyObj
      });
    }

    setIsAddEditModalOpen(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Patient Demographics KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="people" size={20} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{totalPatients}</Text>
            <Text style={styles.kpiLabel}>Registered Lab Patients</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="heart" size={20} color="#D97706" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{chronicCount}</Text>
            <Text style={styles.kpiLabel}>Chronic / Diabetic Care</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#F5F3FF" }]}>
            <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.kpiValue}>{seniorCount}</Text>
            <Text style={styles.kpiLabel}>Senior Citizens (60+)</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconWrap, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="cash" size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.kpiValue}>₹{totalRevenueAll.toLocaleString("en-IN")}</Text>
            <Text style={styles.kpiLabel}>Cumulative Lab Billing</Text>
          </View>
        </View>
      </View>

      {/* Control Bar: Search, Cohort Filter & Add Button */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.slate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient name, UHID, phone number or address..."
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
          {[
            { key: "ALL", label: "All Patients" },
            { key: "diabetic", label: "Diabetic" },
            { key: "cardiac", label: "Cardiac" },
            { key: "senior", label: "Senior" },
            { key: "women", label: "Maternal" }
          ].map(tab => (
            <Pressable
              key={tab.key}
              style={[
                styles.filterPill,
                cohortFilter === tab.key && styles.filterPillActive
              ]}
              onPress={() => setCohortFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  cohortFilter === tab.key && styles.filterPillTextActive
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="person-add" size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>New Patient</Text>
        </Pressable>
      </View>

      {/* Patients Table / Grid */}
      <View style={styles.tableCard}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thText, { flex: 2 }]}>PATIENT & UHID</Text>
          <Text style={[styles.thText, { flex: 1.2 }]}>DEMOGRAPHICS</Text>
          <Text style={[styles.thText, { flex: 1.5 }]}>CONTACT & ADDRESS</Text>
          <Text style={[styles.thText, { flex: 1.5 }]}>COHORTS & TAGS</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: "right" }]}>VISITS & SPEND</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: "center" }]}>ACTIONS</Text>
        </View>

        {/* Table Body */}
        {filteredPatients.length === 0 ? (
          <View style={styles.emptyTable}>
            <Ionicons name="people-outline" size={40} color={COLORS.slate} />
            <Text style={styles.emptyText}>No patient records match the search filter.</Text>
          </View>
        ) : (
          filteredPatients.map(pat => (
            <View key={pat.id} style={styles.tableRow}>
              {/* Patient & UHID */}
              <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {pat.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </Text>
                </View>
                <View>
                  <Text style={styles.patientName}>{pat.name}</Text>
                  <View style={styles.uhidPill}>
                    <Text style={styles.uhidText}>{pat.uhid}</Text>
                  </View>
                </View>
              </View>

              {/* Demographics */}
              <View style={{ flex: 1.2 }}>
                <Text style={styles.demoText}>{pat.age} Yrs • {pat.gender}</Text>
                <View style={styles.bloodBadge}>
                  <Ionicons name="water" size={11} color="#DC2626" />
                  <Text style={styles.bloodBadgeText}>{pat.bloodGroup || "O+"}</Text>
                </View>
              </View>

              {/* Contact & Address */}
              <View style={{ flex: 1.5 }}>
                <Text style={styles.phoneText}>{pat.phone}</Text>
                <Text style={styles.addressText} numberOfLines={1}>{pat.address}</Text>
              </View>

              {/* Cohorts & Tags */}
              <View style={{ flex: 1.5, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {(pat.cohortTags || ["Routine"]).map((tag, idx) => (
                  <View key={idx} style={styles.cohortTag}>
                    <Text style={styles.cohortTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Visits & Spend */}
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.spendText}>₹{(pat.totalSpent || 0).toLocaleString("en-IN")}</Text>
                <Text style={styles.visitsText}>{pat.totalVisits || 1} Orders</Text>
              </View>

              {/* Actions */}
              <View style={{ flex: 1.2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Pressable
                  style={styles.actionBtnProfile}
                  onPress={() => openProfileModal(pat)}
                >
                  <Ionicons name="eye-outline" size={14} color={COLORS.navy} />
                  <Text style={styles.actionBtnProfileText}>Profile</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtnEdit}
                  onPress={() => openEditModal(pat)}
                >
                  <Ionicons name="create-outline" size={15} color={COLORS.slate} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* MODAL: Patient Health Profile & Diagnostic History (Centered Modal) */}
      {isProfileModalOpen && selectedPatient && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxWidth: 640 }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.patientAvatar, { width: 44, height: 44, borderRadius: 22 }]}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.white }}>
                      {selectedPatient.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{selectedPatient.name}</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedPatient.uhid} • Registered {selectedPatient.registrationDate}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => setIsProfileModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              {/* Modal Body */}
              <ScrollView style={{ maxHeight: 460, padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Demographics Overview Card */}
                <View style={styles.profileSectionBox}>
                  <Text style={styles.sectionTitle}>Demographic & Clinical Profile</Text>
                  <View style={styles.profileGrid}>
                    <View style={styles.profileGridItem}>
                      <Text style={styles.pLabel}>Age / Gender</Text>
                      <Text style={styles.pValue}>{selectedPatient.age} Years • {selectedPatient.gender}</Text>
                    </View>
                    <View style={styles.profileGridItem}>
                      <Text style={styles.pLabel}>Blood Group</Text>
                      <Text style={[styles.pValue, { color: "#DC2626", fontWeight: "700" }]}>{selectedPatient.bloodGroup}</Text>
                    </View>
                    <View style={styles.profileGridItem}>
                      <Text style={styles.pLabel}>Phone Number</Text>
                      <Text style={styles.pValue}>{selectedPatient.phone}</Text>
                    </View>
                    <View style={styles.profileGridItem}>
                      <Text style={styles.pLabel}>Email</Text>
                      <Text style={styles.pValue}>{selectedPatient.email || "N/A"}</Text>
                    </View>
                    <View style={[styles.profileGridItem, { width: "100%" }]}>
                      <Text style={styles.pLabel}>Residential Address</Text>
                      <Text style={styles.pValue}>{selectedPatient.address} (Pincode: {selectedPatient.pincode || "570001"})</Text>
                    </View>
                  </View>
                </View>

                {/* Clinical Precaution Alert */}
                {selectedPatient.clinicalAlerts && (
                  <View style={styles.alertBox}>
                    <Ionicons name="warning-outline" size={18} color="#D97706" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Clinical Phlebotomy Precaution</Text>
                      <Text style={styles.alertDesc}>{selectedPatient.clinicalAlerts}</Text>
                    </View>
                  </View>
                )}

                {/* Emergency Contact */}
                {selectedPatient.emergencyContact && (
                  <View style={styles.emergencyBox}>
                    <Ionicons name="call-outline" size={16} color="#059669" />
                    <Text style={styles.emergencyText}>
                      Emergency Contact: <Text style={{ fontWeight: "700" }}>{selectedPatient.emergencyContact.name}</Text> ({selectedPatient.emergencyContact.relation}) - {selectedPatient.emergencyContact.phone}
                    </Text>
                  </View>
                )}

                {/* Diagnostic Test Order History */}
                <View style={[styles.profileSectionBox, { marginTop: 14 }]}>
                  <Text style={styles.sectionTitle}>Past Diagnostic Orders & Reports</Text>
                  {(selectedPatient.recentOrders || []).length === 0 ? (
                    <Text style={styles.noHistoryText}>No past lab records on file.</Text>
                  ) : (
                    (selectedPatient.recentOrders || []).map((ord, idx) => (
                      <View key={idx} style={styles.historyRow}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={styles.historyOrderId}>{ord.orderId}</Text>
                            <Text style={styles.historyDate}>{ord.date}</Text>
                            <View style={styles.historyTypeBadge}>
                              <Text style={styles.historyTypeBadgeText}>{ord.type}</Text>
                            </View>
                          </View>
                          <Text style={styles.historySummary}>{ord.testSummary}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 6 }}>
                          <Text style={styles.historyAmount}>₹{ord.amount}</Text>
                          <Pressable
                            style={styles.viewReportHistoryBtn}
                            onPress={() => {
                              setIsProfileModalOpen(false);
                              if (onSelectOrder) onSelectOrder(ord.orderId);
                            }}
                          >
                            <Ionicons name="document-text-outline" size={12} color={COLORS.navy} />
                            <Text style={styles.viewReportHistoryBtnText}>View Order</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setIsProfileModalOpen(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Close</Text>
                </Pressable>
                <Pressable
                  style={styles.modalSaveBtn}
                  onPress={() => {
                    setIsProfileModalOpen(false);
                    openEditModal(selectedPatient);
                  }}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>Edit Profile</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Add / Edit Patient (Centered Modal) */}
      {isAddEditModalOpen && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? `Edit Patient Profile: ${formData.name}` : "Register New Diagnostic Patient"}
                </Text>
                <Pressable onPress={() => setIsAddEditModalOpen(false)} style={styles.closeIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.navy} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ramesh Hegde"
                      value={formData.name}
                      onChangeText={val => setFormData({ ...formData, name: val })}
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 98450 00000"
                      value={formData.phone}
                      onChangeText={val => setFormData({ ...formData, phone: val })}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formGroupThird}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 42"
                      value={formData.age}
                      onChangeText={val => setFormData({ ...formData, age: val })}
                    />
                  </View>
                  <View style={styles.formGroupThird}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Male / Female"
                      value={formData.gender}
                      onChangeText={val => setFormData({ ...formData, gender: val })}
                    />
                  </View>
                  <View style={styles.formGroupThird}>
                    <Text style={styles.inputLabel}>Blood Group</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. O+, B+, A-"
                      value={formData.bloodGroup}
                      onChangeText={val => setFormData({ ...formData, bloodGroup: val })}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="patient@gmail.com"
                    value={formData.email}
                    onChangeText={val => setFormData({ ...formData, email: val })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Full Residential Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Door #, Street, Locality, Mysuru"
                    value={formData.address}
                    onChangeText={val => setFormData({ ...formData, address: val })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Cohort Categories (comma-separated)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Diabetic Care, Senior Citizen, Cardiac Care"
                    value={formData.cohortTagsStr}
                    onChangeText={val => setFormData({ ...formData, cohortTagsStr: val })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Clinical Phlebotomy Precautions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 56 }]}
                    multiline
                    placeholder="e.g. Requires 12 hr fasting, fragile veins, allergy..."
                    value={formData.clinicalAlerts}
                    onChangeText={val => setFormData({ ...formData, clinicalAlerts: val })}
                  />
                </View>

                {/* Emergency Contact */}
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Emergency Contact Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Sunita (Wife)"
                      value={formData.emergencyName}
                      onChangeText={val => setFormData({ ...formData, emergencyName: val })}
                    />
                  </View>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.inputLabel}>Emergency Phone</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 98450 11111"
                      value={formData.emergencyPhone}
                      onChangeText={val => setFormData({ ...formData, emergencyPhone: val })}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setIsAddEditModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleSavePatient}>
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  <Text style={styles.modalSaveBtnText}>{isEditing ? "Save Changes" : "Register Patient"}</Text>
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
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  kpiCard: {
    flex: 1,
    minWidth: 170,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  kpiIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.navy
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap"
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    height: 40,
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
    paddingHorizontal: 10,
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
  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 40
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  thText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate,
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center"
  },
  patientAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white
  },
  patientName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.navy
  },
  uhidPill: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2
  },
  uhidText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate
  },
  demoText: {
    fontSize: 12,
    color: COLORS.navy
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4
  },
  bloodBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626"
  },
  phoneText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy
  },
  addressText: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  cohortTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  cohortTagText: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: "500"
  },
  spendText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.navy
  },
  visitsText: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 2
  },
  actionBtnProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6
  },
  actionBtnProfileText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.navy
  },
  actionBtnEdit: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
    gap: 10
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.slate
  },
  // Centered Modal Styles
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
  profileSectionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  profileGridItem: {
    width: "48%"
  },
  pLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate
  },
  pValue: {
    fontSize: 12,
    color: COLORS.navy,
    marginTop: 2
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    padding: 10,
    borderRadius: 8,
    marginTop: 12
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706"
  },
  alertDesc: {
    fontSize: 11,
    color: "#92400E",
    marginTop: 2
  },
  emergencyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  emergencyText: {
    fontSize: 11,
    color: "#065F46"
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  historyOrderId: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.slate
  },
  historyTypeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3
  },
  historyTypeBadgeText: {
    fontSize: 9,
    color: "#1D4ED8",
    fontWeight: "600"
  },
  historySummary: {
    fontSize: 12,
    color: COLORS.navy,
    marginTop: 2
  },
  historyAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navy
  },
  viewReportHistoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  viewReportHistoryBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.navy
  },
  noHistoryText: {
    fontSize: 12,
    color: COLORS.slate,
    fontStyle: "italic"
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  formGroupHalf: {
    flex: 1
  },
  formGroupThird: {
    flex: 1
  },
  formGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: 5
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 8,
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
    paddingVertical: 8,
    borderRadius: 8
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white
  }
});
