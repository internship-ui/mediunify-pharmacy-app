import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

const LOGO_IMG = require("../../assets/logo.png");

export default function MediUnifyLogo({
  size = "medium",
  showTagline = true,
  variant = "vertical",
  showBadge = true,
  isDark = false,
  style
}) {
  const isLarge = size === "large";
  const isSmall = size === "small";

  // Dimensions based on logo aspect ratio (1.5:1 / 3:2)
  const imageDimensions = isLarge
    ? { width: 260, height: 173 }
    : isSmall
    ? { width: 135, height: 90 }
    : { width: 195, height: 130 };

  const horizontalImageDimensions = isLarge
    ? { width: 180, height: 70 }
    : isSmall
    ? { width: 115, height: 44 }
    : { width: 145, height: 55 };

  if (variant === "horizontal") {
    return (
      <View style={[styles.horizontalContainer, style]}>
        <View style={[styles.logoCardCompact, isDark && styles.logoCardDark]}>
          <Image
            source={LOGO_IMG}
            style={[styles.logoImage, horizontalImageDimensions]}
            resizeMode="contain"
          />
        </View>

        {showBadge && (
          <View style={styles.partnerBadge}>
            <Ionicons name="medkit" size={10} color={COLORS.teal} style={{ marginRight: 3 }} />
            <Text style={styles.partnerBadgeText}>PHARMACY</Text>
          </View>
        )}
      </View>
    );
  }

  // Default Vertical Lockup
  return (
    <View style={[styles.verticalContainer, style]}>
      <View style={[styles.logoCard, isDark && styles.logoCardDark]}>
        <Image
          source={LOGO_IMG}
          style={[styles.logoImage, imageDimensions]}
          resizeMode="contain"
        />
      </View>

      {showBadge && (
        <View style={styles.pharmacyPill}>
          <Ionicons name="medkit" size={12} color={COLORS.teal} />
          <Text style={styles.pharmacyPillText}>PHARMACY PARTNER PORTAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  horizontalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  logoCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  logoCardCompact: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  logoCardDark: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },

  logoImage: {
    maxWidth: "100%"
  },

  pharmacyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 160, 0.2)"
  },
  pharmacyPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.6
  },

  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(14, 165, 160, 0.25)"
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  }
});
