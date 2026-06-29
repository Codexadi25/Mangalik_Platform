/**
 * ============================================================
 *  MANGALIK — ROLE & PERMISSION MATRIX
 * ============================================================
 * Roles are hierarchical for UI/UX purposes only — actual
 * authorization is always permission-based, never role-name
 * based, so behaviour cannot be "spoofed" by renaming a role.
 *
 *  SUPERADMIN  → Aditya Tech & Devoops / platform owner & dev team.
 *                Full control of EVERY route, feature flag, billing
 *                switch, and kill-switch. Invisible to the business
 *                owner in the dashboard UI — appears merely as
 *                "System" in audit logs, never branded as a vendor
 *                of the client.
 *  ADMIN       → The client / business owner. Sees themself as the
 *                full owner of the platform, with control over
 *                catalog, orders, vendors, staff, payments, content,
 *                and ads — EXCEPT platform kill-switches, billing
 *                enforcement, and infra-level configuration, which
 *                remain exclusively with SUPERADMIN.
 *  VENDOR      → Pooja-samagri suppliers managing their own catalog,
 *                stock, and vendor-specific orders.
 *  MANAGER     → Operations staff: oversees orders, inventory,
 *                vendor coordination, and supports admin.
 *  AGENT       → Customer support / sales agents: tickets, leads,
 *                order assistance, refund initiation (no approval).
 *  DELIVERY_PARTNER → Fulfilment staff: assigned orders, route,
 *                proof-of-delivery, COD collection.
 *  SALES_PARTNER → Affiliate / referral partners: commission
 *                tracking, referral links, payouts.
 *  USER        → End customers shopping on the storefront.
 * ============================================================
 */

const ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  VENDOR: "vendor",
  MANAGER: "manager",
  AGENT: "agent",
  DELIVERY_PARTNER: "deliveryPartner",
  SALES_PARTNER: "salesPartner",
  USER: "user",
});

const ROLE_HIERARCHY = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.VENDOR,
  ROLES.AGENT,
  ROLES.SALES_PARTNER,
  ROLES.DELIVERY_PARTNER,
  ROLES.USER,
];

/** Granular permission keys used across controllers/middleware. */
const PERMISSIONS = Object.freeze({
  // Platform / infra (SUPERADMIN exclusive)
  PLATFORM_KILL_SWITCH: "platform:kill_switch",
  PLATFORM_BILLING_ENFORCEMENT: "platform:billing_enforcement",
  PLATFORM_FEATURE_FLAGS: "platform:feature_flags",
  PLATFORM_ROUTE_TOGGLE: "platform:route_toggle",
  PLATFORM_IMPERSONATE: "platform:impersonate",
  PLATFORM_AUDIT_LOG_VIEW: "platform:audit_log_view",
  PLATFORM_SERVER_CONFIG: "platform:server_config",
  PLATFORM_ADS_KEYS_MANAGE: "platform:ads_keys_manage",

  // Business management (ADMIN + SUPERADMIN)
  CATALOG_MANAGE: "catalog:manage",
  ORDERS_MANAGE: "orders:manage",
  ORDERS_REFUND_APPROVE: "orders:refund_approve",
  VENDORS_MANAGE: "vendors:manage",
  STAFF_MANAGE: "staff:manage",
  CONTENT_MANAGE: "content:manage",
  ADS_BANNER_MANAGE: "ads:banner_manage",
  PAYMENTS_VIEW: "payments:view",
  ANALYTICS_VIEW: "analytics:view",
  COUPONS_MANAGE: "coupons:manage",

  // Vendor scope
  VENDOR_OWN_CATALOG: "vendor:own_catalog",
  VENDOR_OWN_ORDERS: "vendor:own_orders",
  VENDOR_PAYOUT_VIEW: "vendor:payout_view",

  // Manager scope
  INVENTORY_MANAGE: "inventory:manage",
  ORDER_OPS: "orders:ops",

  // Agent scope
  SUPPORT_TICKETS: "support:tickets",
  ORDERS_ASSIST: "orders:assist",
  REFUND_INITIATE: "orders:refund_initiate",

  // Delivery partner scope
  DELIVERY_ASSIGNED_ORDERS: "delivery:assigned_orders",
  DELIVERY_POD_UPLOAD: "delivery:pod_upload",
  DELIVERY_COD_COLLECT: "delivery:cod_collect",

  // Sales partner scope
  REFERRAL_LINKS: "referral:links",
  COMMISSION_VIEW: "commission:view",

  // Customer scope
  SELF_PROFILE: "self:profile",
  SELF_ORDERS: "self:orders",
  SELF_CART: "self:cart",
  SELF_WISHLIST: "self:wishlist",
});

/** Role → permission map. SUPERADMIN implicitly has ALL permissions (see hasPermission). */
const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: ["*"], // wildcard — every permission, always
  [ROLES.ADMIN]: [
    PERMISSIONS.CATALOG_MANAGE,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_REFUND_APPROVE,
    PERMISSIONS.VENDORS_MANAGE,
    PERMISSIONS.STAFF_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.ADS_BANNER_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.COUPONS_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
  ],
  [ROLES.VENDOR]: [
    PERMISSIONS.VENDOR_OWN_CATALOG,
    PERMISSIONS.VENDOR_OWN_ORDERS,
    PERMISSIONS.VENDOR_PAYOUT_VIEW,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.ORDER_OPS,
    PERMISSIONS.VENDORS_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.AGENT]: [
    PERMISSIONS.SUPPORT_TICKETS,
    PERMISSIONS.ORDERS_ASSIST,
    PERMISSIONS.REFUND_INITIATE,
  ],
  [ROLES.DELIVERY_PARTNER]: [
    PERMISSIONS.DELIVERY_ASSIGNED_ORDERS,
    PERMISSIONS.DELIVERY_POD_UPLOAD,
    PERMISSIONS.DELIVERY_COD_COLLECT,
  ],
  [ROLES.SALES_PARTNER]: [
    PERMISSIONS.REFERRAL_LINKS,
    PERMISSIONS.COMMISSION_VIEW,
  ],
  [ROLES.USER]: [
    PERMISSIONS.SELF_PROFILE,
    PERMISSIONS.SELF_ORDERS,
    PERMISSIONS.SELF_CART,
    PERMISSIONS.SELF_WISHLIST,
  ],
};

/** Returns true if `role` carries `permission` (wildcard-aware). */
const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(permission);
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};
