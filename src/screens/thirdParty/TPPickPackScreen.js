import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePharmacy } from "../../context/PharmacyContext";
import { COLORS } from "../../theme/colors";

export default function TPPickPackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const { currentTpOrders } = usePharmacy();

  // Orders that are in preparation or packed
  const pickPackOrders = currentTpOrders.filter(
    o => o.status === "Accepted" || o.status === "Picking" || o.status === "Packed"
  );

  const renderItem = ({ item }) => {
    const isPacked = item.status === "Packed";
    const allPicked = item.items.every(i => i.picked);

    return (
      <View style={[styles.card, isPacked && styles.cardPacked]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLockup}>
            <Text style={styles.orderId}>{item.id}</Text>
            {item.isSplitOrder && (
              <View style={styles.splitBadge}>
                <Ionicons name="git-branch" size={11} color={COLORS.teal} />
                <Text style={styles.splitBadgeText}>Split Part ({item.originalOrderId})</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusPill,
              isPacked ? { backgroundColor: COLORS.aquaLight, borderColor: "#A5F3FC" } : { backgroundColor: COLORS.coralLight, borderColor: "#FED7AA" }
            ]}
          >
            <Text style={[styles.statusPillText, isPacked ? { color: COLORS.navy } : { color: COLORS.coral }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.patientMeta}>
          Patient: {item.patientName} · {item.deliveryAddressArea}
        </Text>

        {/* Medicines Checklist */}
        <View style={styles.medsBox}>
          <Text style={styles.medsBoxTitle}>MEDICINES TO PICK & PACK ({item.items.length}):</Text>
          {item.items.map((m, idx) => (
            <View key={idx} style={styles.medRow}>
              <Ionicons
                name={m.picked ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={m.picked ? COLORS.teal : COLORS.slate}
              />
              <Text style={[styles.medName, m.picked && { color: "#166534" }]}>
                {m.name} ({m.strength || m.dosageForm}) × {m.quantity}
              </Text>
              <Text style={styles.batchTag}>Batch: {m.allocatedBatch || "Verified"}</Text>
            </View>
          ))}
        </View>

        {isPacked && item.packagingPouchId && (
          <View style={styles.pouchBanner}>
            <Ionicons name="shield-checkmark" size={14} color="#0D9488" />
            <Text style={styles.pouchText}>
              Sealed in Security Pouch #{item.packagingPouchId} (Tamper Seal: {item.tamperSealNumber || "Verified"})
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.pickStatusNotice}>
            {isPacked
              ? "Ready for fleet pickup"
              : allPicked
              ? "All items picked · Ready to seal"
              : `${item.items.filter(i => i.picked).length}/${item.items.length} items picked`}
          </Text>
          <Pressable
            style={styles.openFulfilBtn}
            onPress={() => navigation.navigate("TPOrderDetail", { orderId: item.id })}
          >
            <Text style={styles.openFulfilBtnText}>
              {isPacked ? "View Details" : "Open Pick & Pack Desk"}
            </Text>
            <Ionicons name="arrow-forward" size={13} color={COLORS.white} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topHeader, isDesktop && styles.topHeaderDesktop]}>
        <View>
          <Text style={styles.pageTitle}>Pick & Pack Workstation</Text>
          <Text style={styles.pageSub}>
            Verify medicine batches, pick items from shelves, and seal in tamper-evident security pouches
          </Text>
        </View>
      </View>

      <FlatList
        data={pickPackOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && { maxWidth: 1080, width: "100%", alignSelf: "center" },
          { paddingBottom: Math.max(insets.bottom, 16) + 32 }
        ]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="bag-check-outline" size={48} color={COLORS.slateLight} />
            <Text style={styles.emptyTitle}>No orders in picking queue</Text>
            <Text style={styles.emptySub}>
              Accept new incoming external orders to begin picking and packaging.
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
  cardPacked: {
    borderColor: "#A5F3FC",
    backgroundColor: "#F8FEFF"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  headerLockup: {
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  patientMeta: {
    fontSize: 12,
    color: COLORS.slate,
    marginBottom: 10
  },
  medsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10
  },
  medsBoxTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.slateLight,
    letterSpacing: 0.5
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  medName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyDark
  },
  batchTag: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  pouchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDFA",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 10
  },
  pouchText: {
    fontSize: 11,
    color: "#0F766E",
    fontWeight: "600",
    flex: 1
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexWrap: "wrap",
    gap: 8
  },
  pickStatusNotice: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navyMuted
  },
  openFulfilBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6
  },
  openFulfilBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.white
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
