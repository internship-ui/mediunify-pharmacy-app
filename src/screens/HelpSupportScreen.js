import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

const FAQS = [
  {
    q: "How are Hub accounts and login credentials created?",
    a: "Hub accounts are directly configured and provisioned by the MediUnify Super Admin team. Self-registration is disabled for security and regulatory compliance. If your hub credentials need resetting or if you are onboarding a new 3rd-party hub location, please contact Super Admin support."
  },
  {
    q: "How does prescription routing work for Mysore & Partner Hubs?",
    a: "Incoming prescriptions are geo-routed automatically. Mysore region orders are fulfilled by the MediUnify Mysore Central Hub. Future external locations are routed to authorized 3rd-party partner hubs based on pincode and stock availability."
  },
  {
    q: "How do I verify a prescription before accepting?",
    a: "Open the order, tap the prescription image to zoom in, and verify the patient's name, doctor's registration number, date, and medicine dosage. If you need clarification on dosage, allergies, or brand substitutes, tap 'Call Patient' directly from the verification toolbar before accepting."
  },
  {
    q: "What should I do if a prescribed medicine is out of stock?",
    a: "If you cannot fulfill the prescription, tap 'Reject' and select 'Medicine Out of Stock'. The patient order will automatically re-route to an alternate fulfillment hub or partner in the network."
  },
  {
    q: "Why is the captain pickup OTP required?",
    a: "The 4-digit handover OTP ensures that medicines are handed over strictly to the designated MediUnify logistics captain, maintaining tamper-proof chain of custody for schedule H/H1 drugs."
  },
  {
    q: "When are daily hub order settlements paid out?",
    a: "Settlements are transferred automatically every night at 11:30 PM to your designated bank account via IMPS/NEFT without deduction."
  }
];

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const [expandedFaq, setExpandedFaq] = useState(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDetails, setTicketDetails] = useState("");

  const handleCallSupport = () => {
    Alert.alert("MediUnify Partner Support", "Dialing Pharmacy Partner Priority Helpline: +91 1800 419 8899");
  };

  const handleWhatsApp = () => {
    Alert.alert("Partner WhatsApp Desk", "Opening MediUnify Pharmacy Partner Care on WhatsApp (+91 99000 88222).");
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      Alert.alert("Incomplete Form", "Please fill in both the Subject and Description for your support ticket.");
      return;
    }
    Alert.alert(
      "Ticket Submitted (#TKT-" + Math.floor(1000 + Math.random() * 9000) + ")",
      "Our pharmacy partner success manager will contact you within 30 minutes.",
      [{ text: "OK", onPress: () => { setTicketSubject(""); setTicketDetails(""); } }]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        isDesktop && { maxWidth: 900, width: "100%", alignSelf: "center", paddingHorizontal: 24, paddingTop: 20 },
        isTablet && { maxWidth: 760, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingTop: 16 },
        { paddingBottom: Math.max(insets.bottom, 16) + 30 }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Contact Cards */}
      <View style={styles.contactRow}>
        <Pressable
          style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.85 }]}
          onPress={handleCallSupport}
        >
          <View style={[styles.iconCircle, { backgroundColor: COLORS.tealLight }]}>
            <Ionicons name="call" size={20} color={COLORS.teal} />
          </View>
          <Text style={styles.contactTitle}>Call Support</Text>
          <Text style={styles.contactSub}>24/7 Priority Line</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.85 }]}
          onPress={handleWhatsApp}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
          </View>
          <Text style={styles.contactTitle}>WhatsApp</Text>
          <Text style={styles.contactSub}>Instant Chat Desk</Text>
        </Pressable>
      </View>

      {/* Frequently Asked Questions */}
      <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>
      <View style={styles.faqList}>
        {FAQS.map((faq, index) => {
          const isExpanded = expandedFaq === index;
          return (
            <View key={index} style={styles.faqCard}>
              <Pressable
                style={styles.faqHeader}
                onPress={() => setExpandedFaq(isExpanded ? null : index)}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.slate}
                />
              </Pressable>
              {isExpanded && (
                <View style={styles.faqBody}>
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Raise a Support Ticket */}
      <Text style={styles.sectionHeader}>RAISE A SUPPORT TICKET</Text>
      <View style={styles.ticketCard}>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Issue Category / Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Settlement dispute, Delivery issue"
            placeholderTextColor={COLORS.slateLight}
            value={ticketSubject}
            onChangeText={setTicketSubject}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Detailed Description</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            placeholder="Please provide order ID or details of the issue..."
            placeholderTextColor={COLORS.slateLight}
            value={ticketDetails}
            onChangeText={setTicketDetails}
            multiline
          />
        </View>

        <Pressable style={styles.submitBtn} onPress={handleSubmitTicket}>
          <Ionicons name="paper-plane-outline" size={16} color={COLORS.white} />
          <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16 },
  contactRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  contactTitle: { fontSize: 14, fontWeight: "700", color: COLORS.navy },
  contactSub: { fontSize: 11, color: COLORS.slate, marginTop: 2 },

  sectionHeader: { fontSize: 11, fontWeight: "700", color: COLORS.slate, letterSpacing: 0.5, marginBottom: 10, marginTop: 6 },
  faqList: { gap: 8, marginBottom: 20 },
  faqCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden"
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    gap: 8
  },
  faqQuestion: { fontSize: 13, fontWeight: "600", color: COLORS.navy, flex: 1 },
  faqBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  faqAnswer: { fontSize: 12, color: COLORS.slate, lineHeight: 18 },

  ticketCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
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
    fontSize: 13,
    color: COLORS.navy
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 4
  },
  submitBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 }
});
