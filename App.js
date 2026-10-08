import React, { useEffect, useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet, Text, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { PharmacyProvider } from "./src/context/PharmacyContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/theme/colors";

const LOGO_IMG = require("./assets/logo.png");

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload vector icon fonts to eliminate icon flicker and layout shift
        await Font.loadAsync({
          ...Ionicons.font,
          ...FontAwesome.font,
          ...MaterialCommunityIcons.font,
          ...MaterialIcons.font
        });
      } catch (e) {
        console.warn("Font preloading error:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashLogoCard}>
          <Image source={LOGO_IMG} style={styles.splashLogo} resizeMode="contain" />
        </View>
        <View style={styles.splashBrandRow}>
          <Text style={styles.splashMedi}>Medi</Text>
          <Text style={styles.splashUnify}>Unify</Text>
          <View style={styles.splashHubBadge}>
            <Text style={styles.splashHubBadgeText}>HUB</Text>
          </View>
        </View>
        <Text style={styles.splashSubtitle}>Fulfillment & Pharmacy Management System</Text>
        <ActivityIndicator size="small" color={COLORS.teal} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PharmacyProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PharmacyProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  splashLogoCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 16
  },
  splashLogo: {
    width: "100%",
    height: "100%"
  },
  splashBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  splashMedi: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3
  },
  splashUnify: {
    color: "#00C2CB",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3
  },
  splashHubBadge: {
    backgroundColor: "rgba(0, 184, 148, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(0, 184, 148, 0.5)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6
  },
  splashHubBadgeText: {
    color: "#7BC96F",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  splashSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center"
  }
});