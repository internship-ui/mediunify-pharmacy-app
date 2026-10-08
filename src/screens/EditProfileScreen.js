import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { pharmacyProfile, updatePharmacyProfile } = usePharmacy();

  const [name, setName] = useState(pharmacyProfile.name);
  const [facilityName, setFacilityName] = useState(pharmacyProfile.facilityName || pharmacyProfile.name);
  const [ownerName, setOwnerName] = useState(pharmacyProfile.ownerName);
  const [licenseNumber, setLicenseNumber] = useState(pharmacyProfile.licenseNumber);
  const [gstin, setGstin] = useState(pharmacyProfile.gstin);
  const [phone, setPhone] = useState(pharmacyProfile.phone);
  const [alternatePhone, setAlternatePhone] = useState(pharmacyProfile.alternatePhone || "");
  const [email, setEmail] = useState(pharmacyProfile.email);
  const [address, setAddress] = useState(pharmacyProfile.address);
  const [area, setArea] = useState(pharmacyProfile.area);
  const [city, setCity] = useState(pharmacyProfile.city);
  const [pincode, setPincode] = useState(pharmacyProfile.pincode);
  const [openingHours, setOpeningHours] = useState(pharmacyProfile.openingHours);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Hub Name cannot be empty.");
      return;
    }
    updatePharmacyProfile({
      name,
      facilityName,
      ownerName,
      licenseNumber,
      gstin,
      phone,
      alternatePhone,
      email,
      address,
      area,
      city,
      pincode,
      openingHours
    });
    Alert.alert("Hub Profile Updated", "Hub operational details and dispatch configurations have been saved.", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && { maxWidth: 900, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
          isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
          { paddingBottom: Math.max(insets.bottom, 16) + 30 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Super Admin Notice */}
        <View style={styles.adminBadgeCard}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.adminBadgeTitle}>Managed by MediUnify Super Admin</Text>
            <Text style={styles.adminBadgeText}>
              Hub ID: <Text style={{ fontWeight: "700" }}>{pharmacyProfile.id}</Text> · {pharmacyProfile.hubType || "Central Fulfillment Hub"}
            </Text>
          </View>
        </View>

        {/* Business Details Section */}
        <Text style={styles.sectionHeader}>HUB IDENTITY & REGULATORY DETAILS</Text>
        <View style={styles.formGroup}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Hub Display Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Facility & Warehouse Name</Text>
            <TextInput style={styles.input} value={facilityName} onChangeText={setFacilityName} />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Lead Pharmacist / Hub In-Charge</Text>
            <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Drug License (20B/21B)</Text>
              <TextInput style={styles.input} value={licenseNumber} onChangeText={setLicenseNumber} />
            </View>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>GSTIN</Text>
              <TextInput style={styles.input} value={gstin} onChangeText={setGstin} autoCapitalize="characters" />
            </View>
          </View>
        </View>

        {/* Contact & Location Section */}
        <Text style={styles.sectionHeader}>LOCATION & OPERATIONAL CONTACT</Text>
        <View style={styles.formGroup}>
          <View style={styles.rowTwo}>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Hub Primary Phone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Dispatch Hotline</Text>
              <TextInput style={styles.input} value={alternatePhone} onChangeText={setAlternatePhone} keyboardType="phone-pad" />
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Hub Official Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Hub Facility Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Industrial Area / Zone</Text>
            <TextInput style={styles.input} value={area} onChangeText={setArea} />
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.inputWrap, { flex: 1.2 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={[styles.inputWrap, { flex: 0.9 }]}>
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Operating / Dispatch Hours</Text>
            <TextInput style={styles.input} value={openingHours} onChangeText={setOpeningHours} />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={18} color={COLORS.white} />
          <Text style={styles.saveButtonText}>Save Hub Configurations</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  statusTitle: { fontSize: 15, fontWeight: "700", color: COLORS.navy },
  statusSub: { fontSize: 12, color: COLORS.slate, marginTop: 2 },

  adminBadgeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.tealLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18
  },
  adminBadgeTitle: { fontSize: 12, fontWeight: "700", color: COLORS.navy },
  adminBadgeText: { fontSize: 11, color: COLORS.slate, marginTop: 1 },

  sectionHeader: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 8, marginTop: 6 },
  formGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12
  },

  inputWrap: { gap: 4 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: COLORS.slate },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.navy
  },

  rowTwo: { flexDirection: "row", gap: 10 },
  rowThree: { flexDirection: "row", gap: 8 },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 8
  },
  saveButtonText: { color: COLORS.white, fontSize: 15, fontWeight: "700" }
});
