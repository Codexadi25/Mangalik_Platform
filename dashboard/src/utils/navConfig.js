/**
 * ============================================================
 *  ROLE-AWARE NAVIGATION REGISTRY
 *  This is the heart of the dashboard's "templating engine"
 *  behaviour: a single shell (DashboardLayout) renders different
 *  navigation + widgets purely based on the logged-in user's role,
 *  with NO separate codebase per role.
 *
 *  IMPORTANT: SUPERADMIN sees an entirely separate, additional
 *  "Platform Control" section that ADMIN never sees — even though
 *  both technically "see the whole dashboard". ADMIN's view is
 *  capped to business-operational concerns only, reinforcing the
 *  illusion (to the client) that they hold full ownership.
 * ============================================================
 */

export const NAV_BY_ROLE = {
  superadmin: [
    { label: "Overview", path: "/superadmin/overview", icon: "Dashboard" },
    { label: "Platform Control", path: "/superadmin/platform-control", icon: "Settings" },
    { label: "Billing Enforcement", path: "/superadmin/billing", icon: "Payments" },
    { label: "Ads & AdSense Keys", path: "/superadmin/ads", icon: "Campaign" },
    { label: "Route / Feature Toggles", path: "/superadmin/feature-flags", icon: "ToggleOn" },
    { label: "User & Role Management", path: "/superadmin/users", icon: "People" },
    { label: "Audit Logs", path: "/superadmin/audit-logs", icon: "History" },
    // Superadmin also inherits full visibility into every admin module below:
    { label: "Catalog", path: "/admin/catalog", icon: "Inventory2" },
    { label: "Orders", path: "/admin/orders", icon: "ShoppingBag" },
    { label: "Vendors", path: "/admin/vendors", icon: "Storefront" },
    { label: "Staff", path: "/admin/staff", icon: "Badge" },
    { label: "Content (CMS)", path: "/admin/cms", icon: "Article" },
  ],
  admin: [
    { label: "Overview", path: "/admin/overview", icon: "Dashboard" },
    { label: "Catalog", path: "/admin/catalog", icon: "Inventory2" },
    { label: "Orders", path: "/admin/orders", icon: "ShoppingBag" },
    { label: "Vendors", path: "/admin/vendors", icon: "Storefront" },
    { label: "Staff", path: "/admin/staff", icon: "Badge" },
    { label: "Coupons", path: "/admin/coupons", icon: "LocalOffer" },
    { label: "Ads & Banners", path: "/admin/ads-banner", icon: "Campaign" },
    { label: "Content (CMS)", path: "/admin/cms", icon: "Article" },
    { label: "Analytics", path: "/admin/analytics", icon: "BarChart" },
    { label: "Payments", path: "/admin/payments", icon: "Payments" },
  ],
  manager: [
    { label: "Overview", path: "/manager/overview", icon: "Dashboard" },
    { label: "Orders Ops", path: "/manager/orders", icon: "ShoppingBag" },
    { label: "Inventory", path: "/manager/inventory", icon: "Inventory2" },
    { label: "Vendors", path: "/manager/vendors", icon: "Storefront" },
  ],
  vendor: [
    { label: "My Catalog", path: "/vendor/catalog", icon: "Inventory2" },
    { label: "My Orders", path: "/vendor/orders", icon: "ShoppingBag" },
    { label: "Payouts", path: "/vendor/payouts", icon: "Payments" },
  ],
  agent: [
    { label: "Support Tickets", path: "/agent/tickets", icon: "SupportAgent" },
    { label: "Orders Assist", path: "/agent/orders", icon: "ShoppingBag" },
  ],
  deliveryPartner: [
    { label: "Assigned Orders", path: "/delivery/orders", icon: "LocalShipping" },
  ],
  salesPartner: [
    { label: "Referral Links", path: "/sales-partner/referrals", icon: "Share" },
    { label: "Commissions", path: "/sales-partner/commissions", icon: "Payments" },
  ],
};
