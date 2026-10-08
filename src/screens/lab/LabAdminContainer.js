// MediUnify Lab Admin Responsive Master Shell & Navigation
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { useLab } from "../../context/LabContext";
import MediUnifyLogo from "../../components/MediUnifyLogo";

// Screens
import { LabDashboardScreen } from "./LabDashboardScreen";
import { LabOrdersScreen } from "./LabOrdersScreen";
import { LabTestCatalogueScreen } from "./LabTestCatalogueScreen";
import { LabCategoriesScreen } from "./LabCategoriesScreen";
import { LabCheckupPackagesScreen } from "./LabCheckupPackagesScreen";
import { LabHomeCollectionScreen } from "./LabHomeCollectionScreen";
import { LabSampleManagementScreen } from "./LabSampleManagementScreen";
import { LabPatientsScreen } from "./LabPatientsScreen";
import { LabCollectionStaffScreen } from "./LabCollectionStaffScreen";
import { LabCentersScreen } from "./LabCentersScreen";
import { LabReportsScreen } from "./LabReportsScreen";
import { LabBillingScreen } from "./LabBillingScreen";
import { LabPricingTATScreen } from "./LabPricingTATScreen";
import { LabSettingsScreen } from "./LabSettingsScreen";
import { LabOrderDetailDrawer } from "./LabOrderDetailDrawer";

export default function LabAdminContainer({ navigation }) {
  const {
    orders,
    centers,
    activeCenterId,
    setActiveCenterId,
    labNotifications,
    markLabNotificationRead,
    markAllLabNotificationsRead
  } = useLab();

  const [activeScreen, setActiveScreen] = useState("Dashboard");
  const [ordersSubTab, setOrdersSubTab] = useState("ALL");
  const [packagesSubTab, setPackagesSubTab] = useState("popular");
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [isPackagesExpanded, setIsPackagesExpanded] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showCenterDropdown, setShowCenterDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Status counts for navigation badges
  const newOrdersCount = orders.filter(o => o.orderStatus === "NEW").length;
  const pendingVerifCount = orders.filter(o => o.orderStatus === "PENDING VERIFICATION").length;
  const collectionScheduledCount = orders.filter(o => o.orderStatus === "COLLECTION SCHEDULED" || o.orderStatus === "VERIFIED").length;
  const sampleCollectedCount = orders.filter(o => o.orderStatus === "SAMPLE COLLECTED").length;
  const processingCount = orders.filter(o => o.orderStatus === "PROCESSING").length;
  const reportPendingCount = orders.filter(o => o.orderStatus === "REPORT PENDING").length;
  const reportReadyCount = orders.filter(o => o.orderStatus === "REPORT READY" || o.orderStatus === "VERIFIED REPORT").length;
  const unreadNotifsCount = labNotifications.filter(n => !n.read).length;

  const activeCenter = centers.find(c => c.id === activeCenterId) || {
    name: "All Diagnostic Centers (Mysuru & BLR)",
    centerCode: "ALL-NET"
  };

  const handleNavigate = (screenName, subParam = "ALL") => {
    setActiveScreen(screenName);
    if (screenName === "Orders") {
      setOrdersSubTab(subParam);
    } else if (screenName === "CheckupPackages") {
      setPackagesSubTab(subParam === "curated" ? "curated" : "popular");
    }
  };

  return (
    <View style={styles.shell}>
      {/* Left Sidebar */}
      <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
        {/* Brand Header */}
        <View style={styles.sidebarBrand}>
          <MediUnifyLogo size="small" variant="horizontal" showTagline={false} />
          <View style={styles.labModuleTag}>
            <Ionicons name="flask" size={11} color={COLORS.teal} />
            <Text style={styles.labModuleTagText}>LAB ADMIN</Text>
          </View>
        </View>

        {/* Center Switcher Pill in Sidebar */}
        <Pressable
          style={styles.centerPill}
          onPress={() => setShowCenterDropdown(!showCenterDropdown)}
        >
          <View style={styles.centerPillIconWrap}>
            <Ionicons name="business" size={14} color={COLORS.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.centerPillCode}>{activeCenter.centerCode || "ALL CENTERS"}</Text>
            <Text style={styles.centerPillName} numberOfLines={1}>{activeCenter.shortName || activeCenter.name}</Text>
          </View>
          <Ionicons name="chevron-down" size={14} color={COLORS.slate} />
        </Pressable>

        {/* Center Selection Dropdown */}
        {showCenterDropdown && (
          <View style={styles.centerDropdown}>
            <Pressable
              style={[styles.dropdownItem, activeCenterId === "ALL" && styles.dropdownItemActive]}
              onPress={() => {
                setActiveCenterId("ALL");
                setShowCenterDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>All Diagnostic Centers</Text>
            </Pressable>
            {centers.map(c => (
              <Pressable
                key={c.id}
                style={[styles.dropdownItem, activeCenterId === c.id && styles.dropdownItemActive]}
                onPress={() => {
                  setActiveCenterId(c.id);
                  setShowCenterDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Navigation Items List */}
        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          {/* Dashboard */}
          <Pressable
            style={[styles.navItem, activeScreen === "Dashboard" && styles.navItemActive]}
            onPress={() => setActiveScreen("Dashboard")}
          >
            <Ionicons
              name={activeScreen === "Dashboard" ? "grid" : "grid-outline"}
              size={18}
              color={activeScreen === "Dashboard" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "Dashboard" && styles.navItemTextActive]}>
              Dashboard
            </Text>
          </Pressable>

          {/* Orders Parent */}
          <View style={styles.navGroup}>
            <Pressable
              style={[styles.navItem, activeScreen === "Orders" && styles.navItemActive]}
              onPress={() => {
                setActiveScreen("Orders");
                setIsOrdersExpanded(!isOrdersExpanded);
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <Ionicons
                  name={activeScreen === "Orders" ? "receipt" : "receipt-outline"}
                  size={18}
                  color={activeScreen === "Orders" ? COLORS.teal : COLORS.slate}
                />
                <Text style={[styles.navItemText, activeScreen === "Orders" && styles.navItemTextActive]}>
                  Orders
                </Text>
              </View>
              {newOrdersCount > 0 && (
                <View style={styles.navBadgeAlert}>
                  <Text style={styles.navBadgeAlertText}>{newOrdersCount}</Text>
                </View>
              )}
              <Ionicons
                name={isOrdersExpanded ? "chevron-down" : "chevron-forward"}
                size={14}
                color={COLORS.slate}
              />
            </Pressable>

            {/* Orders Sub-Items */}
            {isOrdersExpanded && (
              <View style={styles.subNavList}>
                {[
                  { key: "ALL", label: "All Orders", count: orders.length },
                  { key: "NEW", label: "New", count: newOrdersCount, alert: newOrdersCount > 0 },
                  { key: "PENDING VERIFICATION", label: "Pending Verification", count: pendingVerifCount },
                  { key: "COLLECTION SCHEDULED", label: "Sample Collection", count: collectionScheduledCount },
                  { key: "SAMPLE COLLECTED", label: "Sample Collected", count: sampleCollectedCount },
                  { key: "PROCESSING", label: "Processing", count: processingCount },
                  { key: "REPORT PENDING", label: "Report Pending", count: reportPendingCount },
                  { key: "REPORT READY", label: "Report Ready", count: reportReadyCount },
                  { key: "COMPLETED", label: "Completed", count: orders.filter(o => o.orderStatus === "COMPLETED").length },
                  { key: "CANCELLED", label: "Cancelled", count: orders.filter(o => o.orderStatus === "CANCELLED").length }
                ].map(sub => (
                  <Pressable
                    key={sub.key}
                    style={[
                      styles.subNavItem,
                      activeScreen === "Orders" && ordersSubTab === sub.key && styles.subNavItemActive
                    ]}
                    onPress={() => {
                      setActiveScreen("Orders");
                      setOrdersSubTab(sub.key);
                    }}
                  >
                    <Text style={[
                      styles.subNavItemText,
                      activeScreen === "Orders" && ordersSubTab === sub.key && styles.subNavItemTextActive
                    ]}>
                      {sub.label}
                    </Text>
                    {sub.count > 0 && (
                      <View style={[styles.subCountBadge, sub.alert && styles.subCountBadgeAlert]}>
                        <Text style={[styles.subCountBadgeText, sub.alert && styles.subCountBadgeTextAlert]}>
                          {sub.count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Test Catalogue */}
          <Pressable
            style={[styles.navItem, activeScreen === "TestCatalogue" && styles.navItemActive]}
            onPress={() => setActiveScreen("TestCatalogue")}
          >
            <Ionicons
              name={activeScreen === "TestCatalogue" ? "flask" : "flask-outline"}
              size={18}
              color={activeScreen === "TestCatalogue" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "TestCatalogue" && styles.navItemTextActive]}>
              Test Catalogue
            </Text>
          </Pressable>

          {/* Test Categories */}
          <Pressable
            style={[styles.navItem, activeScreen === "TestCategories" && styles.navItemActive]}
            onPress={() => setActiveScreen("TestCategories")}
          >
            <Ionicons
              name={activeScreen === "TestCategories" ? "folder-open" : "folder-open-outline"}
              size={18}
              color={activeScreen === "TestCategories" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "TestCategories" && styles.navItemTextActive]}>
              Test Categories
            </Text>
          </Pressable>

          {/* Checkup Packages Parent */}
          <View style={styles.navGroup}>
            <Pressable
              style={[styles.navItem, activeScreen === "CheckupPackages" && styles.navItemActive]}
              onPress={() => {
                setActiveScreen("CheckupPackages");
                setIsPackagesExpanded(!isPackagesExpanded);
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <Ionicons
                  name={activeScreen === "CheckupPackages" ? "cube" : "cube-outline"}
                  size={18}
                  color={activeScreen === "CheckupPackages" ? COLORS.teal : COLORS.slate}
                />
                <Text style={[styles.navItemText, activeScreen === "CheckupPackages" && styles.navItemTextActive]}>
                  Checkup Packages
                </Text>
              </View>
              <Ionicons
                name={isPackagesExpanded ? "chevron-down" : "chevron-forward"}
                size={14}
                color={COLORS.slate}
              />
            </Pressable>

            {isPackagesExpanded && (
              <View style={styles.subNavList}>
                <Pressable
                  style={[
                    styles.subNavItem,
                    activeScreen === "CheckupPackages" && packagesSubTab === "popular" && styles.subNavItemActive
                  ]}
                  onPress={() => {
                    setActiveScreen("CheckupPackages");
                    setPackagesSubTab("popular");
                  }}
                >
                  <Text style={[
                    styles.subNavItemText,
                    activeScreen === "CheckupPackages" && packagesSubTab === "popular" && styles.subNavItemTextActive
                  ]}>
                    Popular Checkups
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.subNavItem,
                    activeScreen === "CheckupPackages" && packagesSubTab === "curated" && styles.subNavItemActive
                  ]}
                  onPress={() => {
                    setActiveScreen("CheckupPackages");
                    setPackagesSubTab("curated");
                  }}
                >
                  <Text style={[
                    styles.subNavItemText,
                    activeScreen === "CheckupPackages" && packagesSubTab === "curated" && styles.subNavItemTextActive
                  ]}>
                    Curated Checkups
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Home Collection */}
          <Pressable
            style={[styles.navItem, activeScreen === "HomeCollection" && styles.navItemActive]}
            onPress={() => setActiveScreen("HomeCollection")}
          >
            <Ionicons
              name={activeScreen === "HomeCollection" ? "bicycle" : "bicycle-outline"}
              size={18}
              color={activeScreen === "HomeCollection" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "HomeCollection" && styles.navItemTextActive]}>
              Home Collection
            </Text>
            {collectionScheduledCount > 0 && (
              <View style={styles.navBadgeAlert}>
                <Text style={styles.navBadgeAlertText}>{collectionScheduledCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Sample Management */}
          <Pressable
            style={[styles.navItem, activeScreen === "SampleManagement" && styles.navItemActive]}
            onPress={() => setActiveScreen("SampleManagement")}
          >
            <Ionicons
              name={activeScreen === "SampleManagement" ? "color-fill" : "color-fill-outline"}
              size={18}
              color={activeScreen === "SampleManagement" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "SampleManagement" && styles.navItemTextActive]}>
              Sample Management
            </Text>
          </Pressable>

          {/* Patient Management */}
          <Pressable
            style={[styles.navItem, activeScreen === "PatientManagement" && styles.navItemActive]}
            onPress={() => setActiveScreen("PatientManagement")}
          >
            <Ionicons
              name={activeScreen === "PatientManagement" ? "people" : "people-outline"}
              size={18}
              color={activeScreen === "PatientManagement" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "PatientManagement" && styles.navItemTextActive]}>
              Patient Management
            </Text>
          </Pressable>

          {/* Collection Staff */}
          <Pressable
            style={[styles.navItem, activeScreen === "CollectionStaff" && styles.navItemActive]}
            onPress={() => setActiveScreen("CollectionStaff")}
          >
            <Ionicons
              name={activeScreen === "CollectionStaff" ? "id-card" : "id-card-outline"}
              size={18}
              color={activeScreen === "CollectionStaff" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "CollectionStaff" && styles.navItemTextActive]}>
              Collection Staff
            </Text>
          </Pressable>

          {/* Lab Centers */}
          <Pressable
            style={[styles.navItem, activeScreen === "LabCenters" && styles.navItemActive]}
            onPress={() => setActiveScreen("LabCenters")}
          >
            <Ionicons
              name={activeScreen === "LabCenters" ? "business" : "business-outline"}
              size={18}
              color={activeScreen === "LabCenters" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "LabCenters" && styles.navItemTextActive]}>
              Lab Centers
            </Text>
          </Pressable>

          {/* Reports */}
          <Pressable
            style={[styles.navItem, activeScreen === "Reports" && styles.navItemActive]}
            onPress={() => setActiveScreen("Reports")}
          >
            <Ionicons
              name={activeScreen === "Reports" ? "document-text" : "document-text-outline"}
              size={18}
              color={activeScreen === "Reports" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "Reports" && styles.navItemTextActive]}>
              Reports
            </Text>
            {reportPendingCount > 0 && (
              <View style={[styles.navBadgeAlert, { backgroundColor: "#E11D48" }]}>
                <Text style={styles.navBadgeAlertText}>{reportPendingCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Billing & Payments */}
          <Pressable
            style={[styles.navItem, activeScreen === "BillingPayments" && styles.navItemActive]}
            onPress={() => setActiveScreen("BillingPayments")}
          >
            <Ionicons
              name={activeScreen === "BillingPayments" ? "receipt" : "receipt-outline"}
              size={18}
              color={activeScreen === "BillingPayments" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "BillingPayments" && styles.navItemTextActive]}>
              Billing & Payments
            </Text>
          </Pressable>

          {/* Pricing & TAT */}
          <Pressable
            style={[styles.navItem, activeScreen === "PricingTAT" && styles.navItemActive]}
            onPress={() => setActiveScreen("PricingTAT")}
          >
            <Ionicons
              name={activeScreen === "PricingTAT" ? "pricetag" : "pricetag-outline"}
              size={18}
              color={activeScreen === "PricingTAT" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "PricingTAT" && styles.navItemTextActive]}>
              Pricing & TAT
            </Text>
          </Pressable>

          {/* Settings */}
          <Pressable
            style={[styles.navItem, activeScreen === "Settings" && styles.navItemActive]}
            onPress={() => setActiveScreen("Settings")}
          >
            <Ionicons
              name={activeScreen === "Settings" ? "settings" : "settings-outline"}
              size={18}
              color={activeScreen === "Settings" ? COLORS.teal : COLORS.slate}
            />
            <Text style={[styles.navItemText, activeScreen === "Settings" && styles.navItemTextActive]}>
              Settings
            </Text>
          </Pressable>
        </ScrollView>

        {/* Sidebar Footer / Module Switcher */}
        <View style={styles.sidebarFooter}>
          <Pressable
            style={styles.switchModuleBtn}
            onPress={() => navigation && navigation.navigate("Dashboard")}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.navy} />
            <Text style={styles.switchModuleText}>Switch to Pharmacy Hub</Text>
          </Pressable>

          <Pressable
            style={styles.logoutBtn}
            onPress={() => navigation && navigation.replace("Login")}
          >
            <Ionicons name="log-out-outline" size={16} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content Pane */}
      <View style={styles.mainPane}>
        {/* Top Header Bar */}
        <View style={styles.topHeaderBar}>
          <View style={styles.topHeaderLeft}>
            <Text style={styles.screenHeadingTitle}>
              {activeScreen === "Dashboard" && "Laboratory Operations Dashboard"}
              {activeScreen === "Orders" && "Lab Order Management & Fulfilment"}
              {activeScreen === "TestCatalogue" && "Diagnostic Test Master Catalogue"}
              {activeScreen === "TestCategories" && "Diagnostic Departments & Categories"}
              {activeScreen === "CheckupPackages" && `${packagesSubTab === "popular" ? "Popular" : "Curated"} Checkup Packages`}
              {activeScreen === "HomeCollection" && "Home Phlebotomy & Field Fleet Logistics"}
              {activeScreen === "SampleManagement" && "Physical Specimen Tracking & Accessioning"}
              {activeScreen === "PatientManagement" && "Patient Directory & Diagnostic Profiles"}
              {activeScreen === "CollectionStaff" && "Phlebotomists & Field Fleet"}
              {activeScreen === "LabCenters" && "Diagnostic Processing Centers & Hubs"}
              {activeScreen === "Reports" && "Pathology Reports Desk & Verification"}
              {activeScreen === "BillingPayments" && "Diagnostic Invoicing & Payment Settlements"}
              {activeScreen === "PricingTAT" && "Pricing & Turnaround Time Benchmark"}
              {activeScreen === "Settings" && "Laboratory Configuration & Compliance"}
            </Text>
          </View>

          <View style={styles.topHeaderRight}>
            {/* Quick Notification Bell */}
            <Pressable
              style={styles.notifBtn}
              onPress={() => setShowNotifPanel(!showNotifPanel)}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.navy} />
              {unreadNotifsCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
                </View>
              )}
            </Pressable>

            {/* Admin Profile Pill */}
            <View style={styles.profilePill}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={14} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.profileName}>Dr. Arvind Rao</Text>
                <Text style={styles.profileRole}>Lead Pathologist</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Popup Dropdown */}
        {showNotifPanel && (
          <View style={styles.notifPanel}>
            <View style={styles.notifPanelHeader}>
              <Text style={styles.notifPanelTitle}>Lab Operational Alerts</Text>
              <Pressable onPress={markAllLabNotificationsRead}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 260 }}>
              {labNotifications.map(n => (
                <Pressable
                  key={n.id}
                  style={[styles.notifItem, !n.read && styles.notifItemUnread]}
                  onPress={() => {
                    markLabNotificationRead(n.id);
                    if (n.orderId) setSelectedOrderId(n.orderId);
                  }}
                >
                  <Ionicons
                    name={n.type === "order" ? "receipt-outline" : n.type === "report" ? "document-text-outline" : "bicycle-outline"}
                    size={16}
                    color={COLORS.teal}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Render Active Screen */}
        <View style={styles.screenRenderer}>
          {activeScreen === "Dashboard" && (
            <LabDashboardScreen
              onNavigate={handleNavigate}
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "Orders" && (
            <LabOrdersScreen
              initialStatus={ordersSubTab}
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "TestCatalogue" && (
            <LabTestCatalogueScreen />
          )}

          {activeScreen === "TestCategories" && (
            <LabCategoriesScreen />
          )}

          {activeScreen === "CheckupPackages" && (
            <LabCheckupPackagesScreen
              initialTab={packagesSubTab}
            />
          )}

          {activeScreen === "HomeCollection" && (
            <LabHomeCollectionScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "SampleManagement" && (
            <LabSampleManagementScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "PatientManagement" && (
            <LabPatientsScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "CollectionStaff" && (
            <LabCollectionStaffScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "LabCenters" && (
            <LabCentersScreen />
          )}

          {activeScreen === "Reports" && (
            <LabReportsScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "BillingPayments" && (
            <LabBillingScreen
              onSelectOrder={setSelectedOrderId}
            />
          )}

          {activeScreen === "PricingTAT" && (
            <LabPricingTATScreen />
          )}

          {activeScreen === "Settings" && (
            <LabSettingsScreen />
          )}
        </View>
      </View>

      {/* Global Order Detail Drawer Modal */}
      {selectedOrderId && (
        <LabOrderDetailDrawer
          visible={Boolean(selectedOrderId)}
          onClose={() => setSelectedOrderId(null)}
          orderId={selectedOrderId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    minHeight: "100%"
  },
  sidebar: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.line,
    display: "flex",
    flexDirection: "column"
  },
  sidebarCollapsed: {
    width: 70
  },
  sidebarBrand: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  labModuleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  labModuleTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal,
    letterSpacing: 0.5
  },
  centerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  centerPillIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center"
  },
  centerPillCode: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.teal
  },
  centerPillName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  centerDropdown: {
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginTop: -8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  dropdownItemActive: {
    backgroundColor: COLORS.tealLight
  },
  dropdownItemText: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: "600"
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2
  },
  navItemActive: {
    backgroundColor: COLORS.navyLight
  },
  navItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.navyMuted,
    flex: 1
  },
  navItemTextActive: {
    color: COLORS.navy,
    fontWeight: "800"
  },
  navBadgeAlert: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 16,
    alignItems: "center"
  },
  navBadgeAlertText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800"
  },
  navGroup: {
    marginBottom: 2
  },
  subNavList: {
    paddingLeft: 28,
    paddingVertical: 2,
    gap: 2
  },
  subNavItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  subNavItemActive: {
    backgroundColor: COLORS.tealLight
  },
  subNavItemText: {
    fontSize: 11,
    color: COLORS.slate,
    fontWeight: "600"
  },
  subNavItemTextActive: {
    color: COLORS.teal,
    fontWeight: "800"
  },
  subCountBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8
  },
  subCountBadgeAlert: {
    backgroundColor: "#FEE2E2"
  },
  subCountBadgeText: {
    fontSize: 9,
    color: COLORS.slate,
    fontWeight: "700"
  },
  subCountBadgeTextAlert: {
    color: "#DC2626"
  },
  sidebarFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    gap: 6
  },
  switchModuleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  switchModuleText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  logoutText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626"
  },
  mainPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  topHeaderBar: {
    height: 56,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  topHeaderLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  screenHeadingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.navy
  },
  topHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  notifBtn: {
    position: "relative",
    padding: 6
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.coral,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  notifBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800"
  },
  profilePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line
  },
  profileAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center"
  },
  profileName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  profileRole: {
    fontSize: 9,
    color: COLORS.teal,
    fontWeight: "600"
  },
  notifPanel: {
    position: "absolute",
    top: 58,
    right: 20,
    width: 320,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    padding: 12
  },
  notifPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 6
  },
  notifPanelTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.navy
  },
  markAllText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.teal
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC"
  },
  notifItemUnread: {
    backgroundColor: COLORS.tealLight,
    paddingHorizontal: 4,
    borderRadius: 4
  },
  notifTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.navy
  },
  notifMsg: {
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 1
  },
  notifTime: {
    fontSize: 9,
    color: COLORS.slateLight,
    marginTop: 2
  },
  screenRenderer: {
    flex: 1
  }
});
