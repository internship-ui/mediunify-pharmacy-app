import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";

export default function TPDispatchDeliveryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const {
    currentTpOrders,
    tpDispatchOrder,
    tpDeliverOrder
  } = usePharmacy();

  const [otpInputs, setOtpInputs] = useState({});

  // Filter orders that are packed, dispatched, or delivered
  const dispatchOrders = currentTpOrders.filter(
    o => o.status === "Packed" || o.status === "Dispatched" || o.status === "Delivered"
  );

  const handleDispatch = (order) => {
    tpDispatchOrder(order.id, {
      captain: {
        id: "CAP-TP-01",
        name: "Kiran Gowda",
        phone: "+91 98455 22110",
        vehicle: "Honda Activa · KA-05-MN-2022",
        etaMins: 10
      }
    });
    Alert.alert("Fleet Handover Complete", `Order #${order.id} is handed over to Captain Kiran Gowda and marked Out for Delivery.`);
  };

  const handleDeliver = (order) => {
    const entered = otpInputs[order.id] || order.handoverOtp;
    const res = tpDeliverOrder(order.id, { enteredOtp: entered, proofNote: "Direct recipient confirmation" });
    if (res.success) {
      Alert.alert("Delivered", `Order #${order.id} marked as Delivered successfully!`);
    } else {
      Alert.alert("Verification Error", res.message);
    }
  };

  const renderItem = ({ item }) => {
    const isPacked = item.status === "Packed";
    const isDispatched = item.status === "Dispatched";
    const isDelivered = item.status === "Delivered";

    return (
      <View style={[styles.card, isDelivered && styles.cardDelivered]}>
        <View style={styles.cardHeader}>
          <View>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>{item.id}</Text>
              {item.isSplitOrder && (
                <View style={styles.splitBadge}>
                  <Text style={styles.splitBadgeText}>Split Part ({item.originalOrderId})</Text>
                </View>
              )}
            </View>
            <Text style={styles.patientSub}>
              {item.patientName} · {item.deliveryAddressArea}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isPacked && { backgroundColor: COLORS.aquaLight, borderColor: "#A5F3FC" },
              isDispatched && { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
              isDelivered && { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isPacked && { color: COLORS.navy },
                isDispatched && { color: "#1E40AF" },
                isDelivered && { color: "#166534" }
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Security Pouch Details */}
        <View style={styles.pouchBox}>
          <View style={styles.pouchRow}>
            <Ionicons name="bag-check" size={15} color={COLORS.teal} />
            <Text style={styles.pouchText}>
              Security Pouch: <Text style={{ fontWeight: "800", color: COLORS.navyDark }}>{item.packagingPouchId || "POUCH-APEX-88210"}</Text>
            </Text>
            <Text style={styles.sealText}>Seal: {item.tamperSealNumber || "SEAL-KA-9901"}</Text>
          </View>
        </View>

        {/* Fleet Captain info */}
        {item.captain ? (
          <View style={styles.captainBox}>
            <Ionicons name="bicycle" size={20} color={COLORS.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.captainName}>Captain: {item.captain.name}</Text>
              <Text style={styles.captainVehicle}>{item.captain.vehicle} · {item.captain.phone}</Text>
            </View>
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>HANDOVER OTP</Text>
              <Text style={styles.otpCode}>{item.handoverOtp || "4921"}</Text>
            </View>
          </View>
        ) : null}

        {/* Action Buttons based on status */}
        <View style={styles.actionsWrap}>
          {isPacked && (
            <Pressable style={styles.dispatchActionBtn} onPress={() => handleDispatch(item)}>
              <Ionicons name="paper-plane" size={15} color={COLORS.white} />
              <Text style={styles.dispatchActionBtnText}>Handover to Fleet & Mark Dispatched</Text>
            </Pressable>
          )}

          {isDispatched && (
            <View style={styles.deliverInputRow}>
              <TextInput
                style={styles.otpInput}
                placeholder={`Demo OTP: ${item.handoverOtp || "4921"}`}
                placeholderTextColor={COLORS.slateLight}
                value={otpInputs[item.id] || ""}
                onChangeText={(text) => setOtpInputs(prev => ({ ...prev, [item.id]: text }))}
                keyboardType="numeric"
              />
              <Pressable style={styles.deliverActionBtn} onPress={() => handleDeliver(item)}>
                <Ionicons name="checkmark-done" size={15} color={COLORS.white} />
                <Text style={styles.deliverActionBtnText}>Confirm Delivery</Text>
              </Pressable>
            </View>
          )}

          {isDelivered && (
            <View style={styles.deliveredProofRow}>
              <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
              <Text style={styles.deliveredProofText}>
                Fulfilment completed on {item.deliveredAt || "Today"}. OTP verified.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topHeader, isDesktop && styles.topHeaderDesktop]}>
        <View>
          <Text style={styles.pageTitle}>Dispatch & Delivery Fleet</Text>
          <Text style={styles.pageSub}>
            Track tamper-sealed package handovers, delivery captains, and patient OTP confirmations
          </Text>
        </View>
      </View>

      <FlatList
        data={dispatchOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && { maxWidth: 1080, width: "100%", alignSelf: "center" },
          { paddingBottom: Math.max(insets.bottom, 16) + 32 }
        ]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="bicycle-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No orders in dispatch queue</Text>
            <Text style={styles.emptySub}>
              Packed orders will appear here for fleet pickup and OTP delivery.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line
  },
  topHeaderDesktop: {
    paddingHorizontal: 24,
    paddingVertical: 14
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  pageSub: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardDelivered: {
    borderColor: "#BBF7D0",
    backgroundColor: "#FBFDFB"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  orderId: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.navyDark
  },
  splitBadge: {
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  splitBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  patientSub: {
    fontSize: 12,
    color: COLORS.slate,
    marginTop: 2
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800"
  },
  pouchBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10
  },
  pouchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  pouchText: {
    fontSize: 12,
    color: COLORS.navyMuted
  },
  sealText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.teal
  },
  captainBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 10
  },
  captainName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  captainVehicle: {
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1
  },
  otpBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE"
  },
  otpLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.slateLight
  },
  otpCode: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.teal,
    letterSpacing: 1
  },
  actionsWrap: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line
  },
  dispatchActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.teal,
    paddingVertical: 10,
    borderRadius: 8
  },
  dispatchActionBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800"
  },
  deliverInputRow: {
    flexDirection: "row",
    gap: 8
  },
  otpInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navyDark,
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {})
  },
  deliverActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  deliverActionBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800"
  },
  deliveredProofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4
  },
  deliveredProofText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "600"
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.navyDark
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.slate,
    textAlign: "center",
    maxWidth: 280
  }
});
