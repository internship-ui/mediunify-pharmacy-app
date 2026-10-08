// MediUnify Lab Status & Tag Badges
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";

export function LabStatusBadge({ status, size = "normal" }) {
  const getBadgeConfig = () => {
    switch (status) {
      case "NEW":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: "sparkles" };
      case "PENDING VERIFICATION":
        return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", icon: "time-outline" };
      case "VERIFIED":
        return { bg: COLORS.tealLight, text: COLORS.teal, border: "#A7F3D0", icon: "checkmark-circle" };
      case "COLLECTION SCHEDULED":
        return { bg: "#EDE9FE", text: "#7C3AED", border: "#DDD6FE", icon: "calendar-outline" };
      case "ASSIGNED":
        return { bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE", icon: "bicycle-outline" };
      case "SAMPLE COLLECTED":
        return { bg: COLORS.aquaLight, text: "#0E7490", border: "#A5F3FC", icon: "color-fill-outline" };
      case "SAMPLE RECEIVED":
        return { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7", icon: "cube-outline" };
      case "PROCESSING":
        return { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA", icon: "flask-outline" };
      case "REPORT PENDING":
        return { bg: "#FEF2F2", text: "#E11D48", border: "#FECDD3", icon: "document-text-outline" };
      case "REPORT READY":
        return { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", icon: "cloud-upload-outline" };
      case "UPLOADED":
        return { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", icon: "document-attach-outline" };
      case "UNDER REVIEW":
        return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", icon: "eye-outline" };
      case "VERIFIED REPORT":
        return { bg: "#ECFDF5", text: "#047857", border: "#6EE7B7", icon: "shield-checkmark" };
      case "COMPLETED":
        return { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1", icon: "checkmark-done-circle" };
      case "DELIVERED":
        return { bg: "#ECFDF5", text: "#047857", border: "#6EE7B7", icon: "paper-plane" };
      case "REJECTED":
      case "CANCELLED":
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", icon: "close-circle" };
      case "AVAILABLE":
        return { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7", icon: "ellipse" };
      case "BUSY":
        return { bg: "#FFF7ED", text: "#D97706", border: "#FED7AA", icon: "bicycle" };
      case "OFFLINE":
        return { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0", icon: "moon-outline" };
      case "Active":
        return { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7", icon: "checkmark-circle" };
      case "Inactive":
        return { bg: "#F1F5F9", text: "#94A3B8", border: "#CBD5E1", icon: "pause-circle" };
      default:
        return { bg: "#F1F5F9", text: COLORS.navy, border: COLORS.line, icon: "radio-button-on" };
    }
  };

  const config = getBadgeConfig();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 6 : 9,
          paddingVertical: isSmall ? 2 : 4
        }
      ]}
    >
      <Ionicons name={config.icon} size={isSmall ? 10 : 12} color={config.text} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeLabel, { color: config.text, fontSize: isSmall ? 10 : 11 }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start"
  },
  badgeLabel: {
    fontWeight: "700",
    letterSpacing: 0.3
  }
});
