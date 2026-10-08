import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePharmacy } from "../context/PharmacyContext";
import { COLORS } from "../theme/colors";
import MediUnifyLogo from "../components/MediUnifyLogo";

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = usePharmacy();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 380;

  const [hubId, setHubId] = useState("HUB-MYS-01");
  const [password, setPassword] = useState("admin@mysore2026");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!hubId.trim() || !password.trim()) {
      Alert.alert("Missing Credentials", "Please enter both Hub ID and Password.");
      return;
    }
    login(hubId, password);
    navigation.replace("MainTabs");
  };

  const handleSelectHub = (selectedId, selectedPassword) => {
    setHubId(selectedId);
    setPassword(selectedPassword);
    login(selectedId, selectedPassword);
    navigation.replace("MainTabs");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 20, 24)
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.cardContainer,
            isSmallPhone && { padding: 18 }
          ]}
        >
          {/* Logo & Header */}
          <View style={styles.logoSection}>
            <MediUnifyLogo size="medium" showTagline={false} showBadge={false} />
            <Text style={styles.title}>Pharmacy Portal</Text>
            <Text style={styles.subtitle}>Sign in with your Hub credentials</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Hub ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hub ID</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="storefront-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. HUB-MYS-01"
                  placeholderTextColor={COLORS.slateLight}
                  value={hubId}
                  onChangeText={setHubId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.slate} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.slateLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ pressed }) => [
                    styles.eyeBtn,
                    Platform.OS === "web" && { cursor: "pointer" },
                    pressed && { opacity: 0.6 }
                  ]}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={COLORS.slate}
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginBtn,
                Platform.OS === "web" && { cursor: "pointer" },
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={18} color={COLORS.white} />
              <Text style={styles.loginBtnText}>Sign In</Text>
            </Pressable>
          </View>

          {/* Quick Demo Hub Access */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>QUICK DEMO HUBS</Text>
            <View style={styles.demoButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.demoBtn,
                  hubId === "HUB-MYS-01" && styles.demoBtnActive,
                  Platform.OS === "web" && { cursor: "pointer" },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => handleSelectHub("HUB-MYS-01", "admin@mysore2026")}
              >
                <Ionicons name="business" size={15} color={COLORS.teal} />
                <Text style={styles.demoBtnText}>Mysuru Central Hub</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.demoBtn,
                  hubId === "HUB-BLR-02" && styles.demoBtnActive,
                  Platform.OS === "web" && { cursor: "pointer" },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => handleSelectHub("HUB-BLR-02", "partner@blr2026")}
              >
                <Ionicons name="git-network-outline" size={15} color={COLORS.navy} />
                <Text style={styles.demoBtnText}>Bengaluru Partner Hub</Text>
              </Pressable>
            </View>
          </View>

          {/* Super Admin Notice Footer */}
          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.teal} />
            <Text style={styles.footerText}>
              Accounts are provisioned by Super Admin
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  cardContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 18
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.navy,
    marginTop: 8
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.slate,
    marginTop: 3
  },
  form: {
    gap: 16
  },
  inputGroup: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyMuted
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.navy,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  eyeBtn: {
    padding: 4
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 6,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15
  },
  demoSection: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.6,
    marginBottom: 10,
    textAlign: "center"
  },
  demoButtons: {
    gap: 8
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  demoBtnActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealLight
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navy
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20
  },
  footerText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "500"
  }
});