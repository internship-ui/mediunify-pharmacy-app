import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { PharmacyProvider } from "./src/context/PharmacyContext";
import AppNavigator from "./src/navigation/AppNavigator";

// ── Web / GitHub Pages URL Integrity Patch ──
// Prevents React Navigation from stripping '/mediunify-pharmacy-app' base path on web
if (typeof window !== "undefined" && window.history) {
  const BASE = "/mediunify-pharmacy-app";
  const isGH =
    window.location.hostname.includes("github.io") ||
    window.location.pathname.startsWith(BASE);

  if (isGH) {
    // 1. Restore deep link if redirected through 404 fallback
    try {
      const redirect = sessionStorage.getItem("mediunify_redirect");
      if (redirect) {
        sessionStorage.removeItem("mediunify_redirect");
        if (redirect !== window.location.href) {
          window.history.replaceState(null, "", redirect);
        }
      }
    } catch (e) {}

    // 2. Intercept pushState & replaceState so React Navigation cannot drop the repository subpath
    const fixUrl = (url) => {
      if (!url) return `${BASE}/`;
      const s = String(url);
      if (s.startsWith("http://") || s.startsWith("https://")) {
        try {
          const parsed = new URL(s);
          if (!parsed.pathname.startsWith(BASE)) {
            parsed.pathname = `${BASE}${parsed.pathname === "/" ? "" : parsed.pathname}`;
            return parsed.toString();
          }
          return s;
        } catch (e) {
          return s;
        }
      }
      if (s === "/" || s === "") {
        return `${BASE}/`;
      }
      if (s.startsWith("/") && !s.startsWith(BASE)) {
        return `${BASE}${s}`;
      }
      if (!s.startsWith("/") && !s.startsWith(BASE)) {
        return `${BASE}/${s}`;
      }
      return s;
    };

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = function (state, title, url) {
      return origPush(state, title, fixUrl(url));
    };

    window.history.replaceState = function (state, title, url) {
      return origReplace(state, title, fixUrl(url));
    };
  }
}

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