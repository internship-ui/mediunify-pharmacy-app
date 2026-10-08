import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { PharmacyProvider } from "./src/context/PharmacyContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    // Non-blocking background font load
    Font.loadAsync({
      ...Ionicons.font,
      ...FontAwesome.font,
      ...MaterialCommunityIcons.font,
      ...MaterialIcons.font
    }).catch((e) => console.warn("Font preloading error:", e));
  }, []);

  return (
    <SafeAreaProvider>
      <PharmacyProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PharmacyProvider>
    </SafeAreaProvider>
  );
}