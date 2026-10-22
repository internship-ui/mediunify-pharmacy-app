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
  const { loginAsHub, loginAsMultiplePharmacy, loginAsThirdParty, login } = usePharmacy();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 960;
  const isTablet = (width >= 600 && width < 960) || (Platform.OS !== "web" && width >= 600);
  const isSmallPhone = width < 360;

  // Mobile App Active Tab & Dropdown State (Central Hub vs Pharmacy Network)
  const [activeTab, setActiveTab] = useState("hub"); // "hub" | "network"
  const [showHubDropdown, setShowHubDropdown] = useState(false);
  const [showTpDropdown, setShowTpDropdown] = useState(false);

  // Pharmacy Hub State
  const [hubId, setHubId] = useState("HUB-MYS-01");
  const [hubPassword, setHubPassword] = useState("admin@mysore2026");
  const [showHubPassword, setShowHubPassword] = useState(false);

  // Multiple Pharmacy State
  const [tpPharmacyId, setTpPharmacyId] = useState("TP-APEX-01");
  const [tpPassword, setTpPassword] = useState("partner@apex2026");
  const [showTpPassword, setShowTpPassword] = useState(false);

  // Login Handlers
  const handleHubLogin = () => {
    if (!hubId.trim() || !hubPassword.trim()) {
      Alert.alert("Missing Credentials", "Please enter both Hub ID and Password.");
      return;
    }
    (loginAsHub || login)(hubId, hubPassword);
    navigation.replace("MainTabs");
  };

  const handleThirdPartyLogin = () => {
    if (!tpPharmacyId.trim() || !tpPassword.trim()) {
      Alert.alert("Missing Credentials", "Please enter both Pharmacy Store ID and Password.");
      return;
    }
    (loginAsMultiplePharmacy || loginAsThirdParty)(tpPharmacyId, tpPassword);
    navigation.replace("MainTabs");
  };

  const handleSelectDemoHub = (id, pwd) => {
    setHubId(id);
    setHubPassword(pwd);
    (loginAsHub || login)(id, pwd);
    navigation.replace("MainTabs");
  };

  const handleSelectDemoTp = (id, pwd) => {
    setTpPharmacyId(id);
    setTpPassword(pwd);
    (loginAsMultiplePharmacy || loginAsThirdParty)(id, pwd);
    navigation.replace("MainTabs");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, !isDesktop && styles.mobileOuterContainer]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          !isDesktop && styles.mobileScrollContent,
          {
            paddingTop: Math.max(insets.top + (isDesktop ? 20 : 12), 20),
            paddingBottom: Math.max(insets.bottom + 24, 32)
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isDesktop ? (
          /* ========================================================================= */
          /* WEB APPLICATION (DESKTOP): DUAL CARD WORKFLOW UNTOUCHED                   */
          /* ========================================================================= */
          <>
            {/* Main Brand Header Section */}
            <View style={styles.headerSection}>
              <MediUnifyLogo size="medium" showTagline={false} showBadge={false} />
              <Text style={styles.mainTitle}>Pharmacy Operations Portal</Text>
              <Text style={styles.mainSubtitle}>
                Select your operational role to access assigned workflows and services
              </Text>
            </View>

            {/* Dual Login Cards: Side-by-side on Web/Desktop */}
            <View style={[styles.cardsWrapper, styles.cardsWrapperDesktop]}>
              {/* ================= CARD 1: PHARMACY HUB ================= */}
              <View style={[styles.card, styles.cardHalf]}>
                {/* Top Pill / Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.roleBadge, { backgroundColor: COLORS.navyLight }]}>
                    <Ionicons name="business" size={13} color={COLORS.navy} />
                    <Text style={[styles.roleBadgeText, { color: COLORS.navy }]}>
                      CENTRAL FULFILMENT HUB
                    </Text>
                  </View>
                  <View style={styles.statusDotRow}>
                    <View style={[styles.liveDot, { backgroundColor: COLORS.teal }]} />
                    <Text style={styles.liveDotText}>Live Hub</Text>
                  </View>
                </View>

                {/* Title & Description */}
                <View style={styles.titleWrap}>
                  <Text style={styles.cardTitle}>Pharmacy Hub</Text>
                  <Text style={styles.cardDesc}>
                    Manage and dispatch prescription orders from the Central Fulfillment Hub.
                  </Text>
                </View>

                {/* Inputs */}
                <View style={styles.formGroup}>
                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Hub ID</Text>
                    <View style={styles.inputRow}>
                      <Ionicons name="storefront-outline" size={17} color={COLORS.slate} />
                      <TextInput
                        style={styles.textInput}
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

                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputRow}>
                      <Ionicons name="lock-closed-outline" size={17} color={COLORS.slate} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter hub password"
                        placeholderTextColor={COLORS.slateLight}
                        value={hubPassword}
                        onChangeText={setHubPassword}
                        secureTextEntry={!showHubPassword}
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={handleHubLogin}
                      />
                      <Pressable
                        onPress={() => setShowHubPassword(!showHubPassword)}
                        style={({ pressed }) => [
                          styles.eyeButton,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.6 }
                        ]}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showHubPassword ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color={COLORS.slate}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Required Login Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      styles.hubBtnBg,
                      Platform.OS === "web" && { cursor: "pointer" },
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                    ]}
                    onPress={handleHubLogin}
                  >
                    <Ionicons name="log-in-outline" size={18} color={COLORS.white} />
                    <Text style={styles.primaryBtnText}>Login as Pharmacy Hub</Text>
                  </Pressable>

                  {/* Demo Quick Logins */}
                  <View style={styles.quickAccessSection}>
                    <Text style={styles.quickAccessTitle}>DEMO HUB PROFILES</Text>
                    <View style={styles.demoPillRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.demoPill,
                          hubId === "HUB-MYS-01" && styles.demoPillActive,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleSelectDemoHub("HUB-MYS-01", "admin@mysore2026")}
                      >
                        <Ionicons name="business" size={13} color={COLORS.teal} />
                        <Text style={styles.demoPillText} numberOfLines={1}>
                          Mysuru Central Hub (HUB-MYS-01)
                        </Text>
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.demoPill,
                          hubId === "HUB-BLR-02" && styles.demoPillActive,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleSelectDemoHub("HUB-BLR-02", "partner@blr2026")}
                      >
                        <Ionicons name="git-network-outline" size={13} color={COLORS.navy} />
                        <Text style={styles.demoPillText} numberOfLines={1}>
                          Bengaluru Partner Hub (HUB-BLR-02)
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              {/* ================= CARD 2: MULTIPLE PHARMACY ================= */}
              <View style={[styles.card, styles.cardThirdParty, styles.cardHalf]}>
                {/* Top Pill / Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.roleBadge, { backgroundColor: COLORS.tealLight }]}>
                    <Ionicons name="storefront" size={13} color={COLORS.teal} />
                    <Text style={[styles.roleBadgeText, { color: COLORS.teal }]}>
                      MULTIPLE PHARMACY NETWORK
                    </Text>
                  </View>
                  <View style={styles.statusDotRow}>
                    <View style={[styles.liveDot, { backgroundColor: "#10B981" }]} />
                    <Text style={styles.liveDotText}>Active Stores</Text>
                  </View>
                </View>

                {/* Title & Description */}
                <View style={styles.titleWrap}>
                  <Text style={styles.cardTitle}>Multiple Pharmacy</Text>
                  <Text style={styles.cardDesc}>
                    Manage retail branch stock, medicine orders, and local store fulfillment.
                  </Text>
                </View>

                {/* Inputs */}
                <View style={styles.formGroup}>
                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Pharmacy Store ID</Text>
                    <View style={styles.inputRow}>
                      <Ionicons name="medical-outline" size={17} color={COLORS.teal} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. TP-APEX-01 or PHARM-01"
                        placeholderTextColor={COLORS.slateLight}
                        value={tpPharmacyId}
                        onChangeText={setTpPharmacyId}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputRow}>
                      <Ionicons name="lock-closed-outline" size={17} color={COLORS.slate} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter pharmacy password"
                        placeholderTextColor={COLORS.slateLight}
                        value={tpPassword}
                        onChangeText={setTpPassword}
                        secureTextEntry={!showTpPassword}
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={handleThirdPartyLogin}
                      />
                      <Pressable
                        onPress={() => setShowTpPassword(!showTpPassword)}
                        style={({ pressed }) => [
                          styles.eyeButton,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.6 }
                        ]}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showTpPassword ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color={COLORS.slate}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Required Login Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      styles.tpBtnBg,
                      Platform.OS === "web" && { cursor: "pointer" },
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                    ]}
                    onPress={handleThirdPartyLogin}
                  >
                    <Ionicons name="storefront-outline" size={18} color={COLORS.white} />
                    <Text style={styles.primaryBtnText}>Login as Multiple Pharmacy</Text>
                  </Pressable>

                  {/* Demo Quick Logins */}
                  <View style={styles.quickAccessSection}>
                    <Text style={styles.quickAccessTitle}>DEMO MULTIPLE PHARMACIES</Text>
                    <View style={styles.demoPillRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.demoPill,
                          tpPharmacyId === "TP-APEX-01" && styles.demoPillActiveTp,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleSelectDemoTp("TP-APEX-01", "partner@apex2026")}
                      >
                        <Ionicons name="medkit" size={13} color={COLORS.teal} />
                        <Text style={styles.demoPillText} numberOfLines={1}>
                          Apex Pharmacy Store (TP-APEX-01)
                        </Text>
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.demoPill,
                          tpPharmacyId === "TP-MEDPLUS-02" && styles.demoPillActiveTp,
                          Platform.OS === "web" && { cursor: "pointer" },
                          pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleSelectDemoTp("TP-MEDPLUS-02", "partner@medplus2026")}
                      >
                        <Ionicons name="bandage-outline" size={13} color={COLORS.navy} />
                        <Text style={styles.demoPillText} numberOfLines={1}>
                          MedPlus Pharmacy Store (TP-MEDPLUS-02)
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Super Admin Provisioning Footnote */}
            <View style={styles.footerInfo}>
              <Ionicons name="shield-checkmark" size={15} color={COLORS.teal} />
              <Text style={styles.footerInfoText}>
                Pharmacy credentials & partner onboarding are securely provisioned by MediUnify Super Admin.
              </Text>
            </View>
          </>
        ) : (
          /* ========================================================================= */
          /* MOBILE & TABLET APP: RESPONSIVE MODERN LOGIN VIEW                         */
          /* ========================================================================= */
          <View style={[styles.mobileContainer, isTablet && styles.tabletContainer]}>
            {/* Main Brand Header Section */}
            <View style={[styles.mobileHeaderSection, isTablet && styles.tabletHeaderSection]}>
              <MediUnifyLogo size={isTablet ? "medium" : "small"} showTagline={false} showBadge={false} />
              <Text style={[styles.mobileMainTitle, isTablet && styles.tabletMainTitle]}>
                Pharmacy Operations Portal
              </Text>
              <Text style={[styles.mobileMainSubtitle, isTablet && styles.tabletMainSubtitle]}>
                Select your operational role to access assigned workflows and services
              </Text>
            </View>

            {/* Role Switcher Tabs */}
            <View style={[styles.mobileTabBarContainer, isTablet && styles.tabletTabBarContainer]}>
              <Pressable
                style={({ pressed }) => [
                  styles.mobileTabButton,
                  isTablet && styles.tabletTabButton,
                  Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => setActiveTab("hub")}
              >
                <Text
                  style={[
                    styles.mobileTabText,
                    isSmallPhone && styles.mobileTabTextSmall,
                    isTablet && styles.tabletTabText,
                    activeTab === "hub" && styles.mobileTabTextActive
                  ]}
                >
                  CENTRAL HUB
                </Text>
                {activeTab === "hub" && (
                  <View style={[styles.mobileTabIndicator, isTablet && styles.tabletTabIndicator]} />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.mobileTabButton,
                  isTablet && styles.tabletTabButton,
                  Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => setActiveTab("network")}
              >
                <Text
                  style={[
                    styles.mobileTabText,
                    isSmallPhone && styles.mobileTabTextSmall,
                    isTablet && styles.tabletTabText,
                    activeTab === "network" && styles.mobileTabTextActive
                  ]}
                >
                  PHARMACY NETWORK
                </Text>
                {activeTab === "network" && (
                  <View style={[styles.mobileTabIndicator, isTablet && styles.tabletTabIndicator]} />
                )}
              </Pressable>
            </View>

            {/* Active Role Card */}
            <View style={[styles.mobileCard, isTablet && styles.tabletCard]}>
              {activeTab === "hub" ? (
                /* CENTRAL HUB FORM */
                <View style={styles.mobileFormGroup}>
                  {/* Card Header */}
                  <View style={[styles.mobileCardHeader, isTablet && styles.tabletCardHeader]}>
                    <View style={[styles.mobileRoleBadgeIconWrap, isTablet && styles.tabletRoleBadgeIconWrap]}>
                      <Ionicons name="newspaper-outline" size={isTablet ? 22 : 20} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mobileCardRoleTitle, isTablet && styles.tabletCardRoleTitle]}>
                        Role: Central Fulfilment Hub
                      </Text>
                      <Text style={[styles.mobileCardRoleSub, isTablet && styles.tabletCardRoleSub]}>
                        Manage and dispatch orders from the Hub.
                      </Text>
                    </View>
                  </View>

                  {/* Hub ID Field */}
                  <View style={styles.mobileFieldWrap}>
                    <Text style={[styles.mobileFieldLabel, isTablet && styles.tabletFieldLabel]}>Hub ID</Text>
                    <View style={[styles.mobileInputBox, isTablet && styles.tabletInputBox]}>
                      <Ionicons name="storefront-outline" size={17} color="#64748B" style={styles.mobileInputLeftIcon} />
                      <TextInput
                        style={[styles.mobileTextInput, isTablet && styles.tabletTextInput]}
                        value={hubId}
                        onChangeText={setHubId}
                        placeholder="HUB-MYS-01"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.mobileFieldWrap}>
                    <Text style={[styles.mobileFieldLabel, isTablet && styles.tabletFieldLabel]}>Password</Text>
                    <View style={[styles.mobileInputBox, isTablet && styles.tabletInputBox]}>
                      <Ionicons name="lock-closed-outline" size={16} color="#64748B" style={styles.mobileInputLeftIcon} />
                      <TextInput
                        style={[styles.mobileTextInput, isTablet && styles.tabletTextInput]}
                        value={hubPassword}
                        onChangeText={setHubPassword}
                        placeholder="••••••••••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showHubPassword}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowHubPassword(!showHubPassword)}
                        style={styles.mobileEyeBtn}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showHubPassword ? "eye-off-outline" : "eye-outline"}
                          size={17}
                          color="#64748B"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Primary Action Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.mobilePrimaryBtn,
                      isTablet && styles.tabletPrimaryBtn,
                      Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                    ]}
                    onPress={handleHubLogin}
                  >
                    <Ionicons name="log-in-outline" size={isTablet ? 20 : 18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={[styles.mobilePrimaryBtnText, isTablet && styles.tabletPrimaryBtnText]}>
                      Login as Pharmacy Hub
                    </Text>
                  </Pressable>

                  {/* Demo Hub Profiles Section */}
                  <View style={styles.mobileDemoSection}>
                    <View style={styles.mobileDemoDividerRow}>
                      <View style={styles.mobileDemoDividerLine} />
                      <Text style={styles.mobileDemoHeaderTitle}>DEMO HUB PROFILES</Text>
                      <View style={styles.mobileDemoDividerLine} />
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.mobileDropdownSelector,
                        isTablet && styles.tabletDropdownSelector,
                        Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                        pressed && { opacity: 0.9 }
                      ]}
                      onPress={() => setShowHubDropdown(!showHubDropdown)}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                        <View style={[styles.mobileDemoPillIconWrap, isTablet && styles.tabletDemoPillIconWrap]}>
                          <Ionicons name="business" size={14} color="#0D9488" />
                        </View>
                        <Text style={[styles.mobileDropdownText, isTablet && styles.tabletDropdownText]} numberOfLines={1}>
                          {hubId === "HUB-BLR-02" ? "Bengaluru Partner Hub" : "Mysuru Central Hub"}
                        </Text>
                      </View>
                      <Ionicons
                        name={showHubDropdown ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#64748B"
                      />
                    </Pressable>

                    {showHubDropdown && (
                      <View style={styles.mobileDropdownMenu}>
                        <Pressable
                          style={[
                            styles.mobileDropdownItem,
                            isTablet && styles.tabletDropdownItem,
                            hubId === "HUB-MYS-01" && styles.mobileDropdownItemActive
                          ]}
                          onPress={() => {
                            setHubId("HUB-MYS-01");
                            setHubPassword("admin@mysore2026");
                            setShowHubDropdown(false);
                          }}
                        >
                          <Ionicons name="business" size={15} color="#0D9488" />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.mobileDropdownItemTitle, isTablet && styles.tabletDropdownItemTitle]}>
                              Mysuru Central Hub
                            </Text>
                            <Text style={[styles.mobileDropdownItemSub, isTablet && styles.tabletDropdownItemSub]}>
                              HUB-MYS-01 · Lead Pharmacist
                            </Text>
                          </View>
                          {hubId === "HUB-MYS-01" && (
                            <Ionicons name="checkmark-circle" size={17} color="#0D9488" />
                          )}
                        </Pressable>

                        <Pressable
                          style={[
                            styles.mobileDropdownItem,
                            isTablet && styles.tabletDropdownItem,
                            hubId === "HUB-BLR-02" && styles.mobileDropdownItemActive
                          ]}
                          onPress={() => {
                            setHubId("HUB-BLR-02");
                            setHubPassword("partner@blr2026");
                            setShowHubDropdown(false);
                          }}
                        >
                          <Ionicons name="business-outline" size={15} color="#0E3B43" />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.mobileDropdownItemTitle, isTablet && styles.tabletDropdownItemTitle]}>
                              Bengaluru Partner Hub
                            </Text>
                            <Text style={[styles.mobileDropdownItemSub, isTablet && styles.tabletDropdownItemSub]}>
                              HUB-BLR-02 · Operations
                            </Text>
                          </View>
                          {hubId === "HUB-BLR-02" && (
                            <Ionicons name="checkmark-circle" size={17} color="#0D9488" />
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                /* PHARMACY NETWORK FORM */
                <View style={styles.mobileFormGroup}>
                  {/* Card Header */}
                  <View style={[styles.mobileCardHeader, isTablet && styles.tabletCardHeader]}>
                    <View style={[styles.mobileRoleBadgeIconWrap, isTablet && styles.tabletRoleBadgeIconWrap]}>
                      <Ionicons name="storefront-outline" size={isTablet ? 22 : 20} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mobileCardRoleTitle, isTablet && styles.tabletCardRoleTitle]}>
                        Role: Pharmacy Network
                      </Text>
                      <Text style={[styles.mobileCardRoleSub, isTablet && styles.tabletCardRoleSub]}>
                        Manage retail branch stock, medicine orders, and local store fulfillment.
                      </Text>
                    </View>
                  </View>

                  {/* Pharmacy Store ID Field */}
                  <View style={styles.mobileFieldWrap}>
                    <Text style={[styles.mobileFieldLabel, isTablet && styles.tabletFieldLabel]}>
                      Pharmacy Store ID
                    </Text>
                    <View style={[styles.mobileInputBox, isTablet && styles.tabletInputBox]}>
                      <Ionicons name="storefront-outline" size={17} color="#64748B" style={styles.mobileInputLeftIcon} />
                      <TextInput
                        style={[styles.mobileTextInput, isTablet && styles.tabletTextInput]}
                        value={tpPharmacyId}
                        onChangeText={setTpPharmacyId}
                        placeholder="TP-APEX-01"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.mobileFieldWrap}>
                    <Text style={[styles.mobileFieldLabel, isTablet && styles.tabletFieldLabel]}>Password</Text>
                    <View style={[styles.mobileInputBox, isTablet && styles.tabletInputBox]}>
                      <Ionicons name="lock-closed-outline" size={16} color="#64748B" style={styles.mobileInputLeftIcon} />
                      <TextInput
                        style={[styles.mobileTextInput, isTablet && styles.tabletTextInput]}
                        value={tpPassword}
                        onChangeText={setTpPassword}
                        placeholder="••••••••••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showTpPassword}
                        autoCapitalize="none"
                      />
                      <Pressable
                        onPress={() => setShowTpPassword(!showTpPassword)}
                        style={styles.mobileEyeBtn}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={showTpPassword ? "eye-off-outline" : "eye-outline"}
                          size={17}
                          color="#64748B"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Primary Action Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.mobilePrimaryBtn,
                      isTablet && styles.tabletPrimaryBtn,
                      Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
                    ]}
                    onPress={handleThirdPartyLogin}
                  >
                    <Ionicons name="log-in-outline" size={isTablet ? 20 : 18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={[styles.mobilePrimaryBtnText, isTablet && styles.tabletPrimaryBtnText]}>
                      Login as Pharmacy Network
                    </Text>
                  </Pressable>

                  {/* Demo Pharmacy Profiles Section */}
                  <View style={styles.mobileDemoSection}>
                    <View style={styles.mobileDemoDividerRow}>
                      <View style={styles.mobileDemoDividerLine} />
                      <Text style={styles.mobileDemoHeaderTitle}>DEMO PHARMACY PROFILES</Text>
                      <View style={styles.mobileDemoDividerLine} />
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.mobileDropdownSelector,
                        isTablet && styles.tabletDropdownSelector,
                        Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                        pressed && { opacity: 0.9 }
                      ]}
                      onPress={() => setShowTpDropdown(!showTpDropdown)}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                        <View style={[styles.mobileDemoPillIconWrap, isTablet && styles.tabletDemoPillIconWrap]}>
                          <Ionicons name="medkit" size={14} color="#0D9488" />
                        </View>
                        <Text style={[styles.mobileDropdownText, isTablet && styles.tabletDropdownText]} numberOfLines={1}>
                          {tpPharmacyId === "TP-MEDPLUS-02" ? "MedPlus Pharmacy Store" : "Apex Pharmacy Store"}
                        </Text>
                      </View>
                      <Ionicons
                        name={showTpDropdown ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#64748B"
                      />
                    </Pressable>

                    {showTpDropdown && (
                      <View style={styles.mobileDropdownMenu}>
                        <Pressable
                          style={[
                            styles.mobileDropdownItem,
                            isTablet && styles.tabletDropdownItem,
                            tpPharmacyId === "TP-APEX-01" && styles.mobileDropdownItemActive
                          ]}
                          onPress={() => {
                            setTpPharmacyId("TP-APEX-01");
                            setTpPassword("partner@apex2026");
                            setShowTpDropdown(false);
                          }}
                        >
                          <Ionicons name="medkit" size={15} color="#0D9488" />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.mobileDropdownItemTitle, isTablet && styles.tabletDropdownItemTitle]}>
                              Apex Pharmacy Store
                            </Text>
                            <Text style={[styles.mobileDropdownItemSub, isTablet && styles.tabletDropdownItemSub]}>
                              TP-APEX-01 · Electronic City
                            </Text>
                          </View>
                          {tpPharmacyId === "TP-APEX-01" && (
                            <Ionicons name="checkmark-circle" size={17} color="#0D9488" />
                          )}
                        </Pressable>

                        <Pressable
                          style={[
                            styles.mobileDropdownItem,
                            isTablet && styles.tabletDropdownItem,
                            tpPharmacyId === "TP-MEDPLUS-02" && styles.mobileDropdownItemActive
                          ]}
                          onPress={() => {
                            setTpPharmacyId("TP-MEDPLUS-02");
                            setTpPassword("partner@medplus2026");
                            setShowTpDropdown(false);
                          }}
                        >
                          <Ionicons name="bandage-outline" size={15} color="#0E3B43" />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.mobileDropdownItemTitle, isTablet && styles.tabletDropdownItemTitle]}>
                              MedPlus Pharmacy Store
                            </Text>
                            <Text style={[styles.mobileDropdownItemSub, isTablet && styles.tabletDropdownItemSub]}>
                              TP-MEDPLUS-02 · Kuvempunagar
                            </Text>
                          </View>
                          {tpPharmacyId === "TP-MEDPLUS-02" && (
                            <Ionicons name="checkmark-circle" size={17} color="#0D9488" />
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Link to Toggle Role */}
            <Pressable
              style={({ pressed }) => [
                styles.mobileBottomSwitchBtn,
                isTablet && styles.tabletBottomSwitchBtn,
                Platform.OS === "web" && { outlineStyle: "none", cursor: "pointer" },
                pressed && { opacity: 0.75 }
              ]}
              onPress={() => setActiveTab(activeTab === "hub" ? "network" : "hub")}
            >
              <Text style={[styles.mobileBottomSwitchText, isTablet && styles.tabletBottomSwitchText]}>
                {activeTab === "hub" ? "SWITCH ROLE TO: PHARMACY NETWORK" : "SWITCH ROLE TO: CENTRAL HUB"}
              </Text>
            </Pressable>
          </View>
        )}
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
    alignItems: "center",
    paddingHorizontal: 16
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
    maxWidth: 680,
    paddingHorizontal: 12
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.navyDark,
    marginTop: 10,
    textAlign: "center"
  },
  mainSubtitle: {
    fontSize: 14,
    color: COLORS.slate,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 20
  },
  cardsWrapper: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "column",
    gap: 20
  },
  cardsWrapperDesktop: {
    maxWidth: 960,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 24
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 26,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    justifyContent: "space-between"
  },
  cardThirdParty: {
    borderColor: "#99F6E4"
  },
  cardHalf: {
    flex: 1
  },
  cardCompact: {
    padding: 20
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    height: 32
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  liveDotText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.slate
  },
  titleWrap: {
    marginBottom: 16,
    minHeight: 68,
    justifyContent: "flex-start"
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.navyDark,
    letterSpacing: -0.3
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.slate,
    marginTop: 5,
    lineHeight: 19
  },
  formGroup: {
    gap: 13
  },
  inputField: {
    gap: 6
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.navyMuted,
    lineHeight: 16
  },
  inputRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.line
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 14,
    color: COLORS.navy,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  eyeButton: {
    padding: 6
  },
  primaryBtn: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  hubBtnBg: {
    backgroundColor: COLORS.navy
  },
  tpBtnBg: {
    backgroundColor: COLORS.teal
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14
  },
  quickAccessSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  quickAccessTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 14
  },
  demoPillRow: {
    gap: 8
  },
  demoPill: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.line
  },
  demoPillActive: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navyLight
  },
  demoPillActiveTp: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.tealLight
  },
  demoPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.navy,
    flex: 1
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 28,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  footerInfoText: {
    fontSize: 12,
    color: COLORS.slate,
    fontWeight: "600"
  },

  /* ========================================================================= */
  /* Mobile App Specific Styles (Exact Replica of Attached Image)             */
  /* ========================================================================= */
  mobileOuterContainer: {
    backgroundColor: "#FFFFFF"
  },
  mobileContainer: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center"
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  mobileHeaderSection: {
    alignItems: "center",
    marginBottom: 16
  },
  mobileMainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: -0.2
  },
  mobileMainSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 290
  },
  mobileTabBarContainer: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 16
  },
  mobileTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  mobileTabText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.5
  },
  mobileTabTextActive: {
    fontWeight: "800",
    color: "#0E3B43"
  },
  mobileTabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: "#0E3B43"
  },
  mobileCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#0E3B43",
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: "#0E3B43",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  mobileRoleBadgeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center"
  },
  mobileCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  mobileCardRoleTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0E3B43"
  },
  mobileCardRoleSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15
  },
  mobileFormGroup: {
    gap: 14
  },
  mobileFieldWrap: {
    gap: 6
  },
  mobileFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155"
  },
  mobileInputBox: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12
  },
  mobileInputLeftIcon: {
    marginRight: 8
  },
  mobileTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "600",
    padding: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  mobileEyeBtn: {
    padding: 6
  },
  mobilePrimaryBtn: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 10,
    marginTop: 6,
    shadowColor: "#0D9488",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  mobilePrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  mobileDemoSection: {
    marginTop: 16,
    gap: 10
  },
  mobileDemoDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  mobileDemoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0"
  },
  mobileDemoHeaderTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8
  },
  mobileDropdownSelector: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12
  },
  mobileDemoPillIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center"
  },
  mobileDropdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A"
  },
  mobileDropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4
  },
  mobileDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  mobileDropdownItemActive: {
    backgroundColor: "#F0FDFA"
  },
  mobileDropdownItemTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  mobileDropdownItemSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1
  },
  mobileBottomSwitchBtn: {
    marginTop: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  mobileBottomSwitchText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0E3B43",
    letterSpacing: 0.8,
    textAlign: "center"
  },

  /* Tablet & Responsive Tab Enhancements */
  tabletContainer: {
    maxWidth: 500,
    width: "100%"
  },
  tabletHeaderSection: {
    marginBottom: 20
  },
  tabletMainTitle: {
    fontSize: 22,
    marginTop: 10
  },
  tabletMainSubtitle: {
    fontSize: 13.5,
    maxWidth: 420,
    lineHeight: 19
  },
  tabletTabBarContainer: {
    marginBottom: 20
  },
  tabletTabButton: {
    paddingVertical: 13
  },
  tabletTabText: {
    fontSize: 14,
    letterSpacing: 0.8
  },
  mobileTabTextSmall: {
    fontSize: 11,
    letterSpacing: 0.2
  },
  tabletTabIndicator: {
    height: 3
  },
  tabletCard: {
    paddingHorizontal: 28,
    paddingVertical: 28,
    borderRadius: 24,
    shadowRadius: 20
  },
  tabletCardHeader: {
    marginBottom: 18,
    paddingBottom: 16
  },
  tabletRoleBadgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12
  },
  tabletCardRoleTitle: {
    fontSize: 16
  },
  tabletCardRoleSub: {
    fontSize: 12.5,
    lineHeight: 17
  },
  tabletFieldLabel: {
    fontSize: 13
  },
  tabletInputBox: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14
  },
  tabletTextInput: {
    fontSize: 14.5
  },
  tabletPrimaryBtn: {
    height: 50,
    borderRadius: 12,
    marginTop: 8
  },
  tabletPrimaryBtnText: {
    fontSize: 15
  },
  tabletDemoPillIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8
  },
  tabletDropdownSelector: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14
  },
  tabletDropdownText: {
    fontSize: 14
  },
  tabletDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  tabletDropdownItemTitle: {
    fontSize: 13.5
  },
  tabletDropdownItemSub: {
    fontSize: 11.5
  },
  tabletBottomSwitchBtn: {
    marginTop: 26,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24
  },
  tabletBottomSwitchText: {
    fontSize: 12.5,
    letterSpacing: 1
  }
});