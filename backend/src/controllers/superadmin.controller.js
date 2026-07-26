const PlatformSettings = require("../models/PlatformSettings.model");
const AuditLog = require("../models/AuditLog.model");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const { invalidateSettingsCache, getSettings } = require("../middleware/platformControl.middleware");

const writeAudit = (req, action, targetType, targetId, metadata = {}) =>
  AuditLog.create({
    actor: req.user._id,
    actorRole: req.user.role,
    action,
    targetType,
    targetId,
    metadata,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

/** GET /api/superadmin/settings */
const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/kill-switch
 * Body: { siteEnabled: boolean, maintenanceMessage?: string }
 * Instantly enables/disables the ENTIRE platform (both storefront
 * and dashboard APIs) — e.g. for unpaid client dues.
 */
const setGlobalKillSwitch = asyncHandler(async (req, res) => {
  const { siteEnabled, maintenanceMessage } = req.body;
  const settings = await PlatformSettings.findOneAndUpdate(
    {},
    { siteEnabled, maintenanceMessage, updatedBy: req.user._id },
    { new: true, upsert: true }
  );
  invalidateSettingsCache();
  await writeAudit(req, "PLATFORM_KILL_SWITCH", "PlatformSettings", settings._id, { siteEnabled });
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/feature-flags
 * Body: { key: "checkout", value: false }
 * Disables a single feature/module platform-wide without touching
 * the rest of the site.
 */
const setFeatureFlag = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  const settings = await PlatformSettings.findOne();
  settings.featureFlags.set(key, value);
  settings.updatedBy = req.user._id;
  await settings.save();
  invalidateSettingsCache();
  await writeAudit(req, "PLATFORM_FEATURE_FLAG_SET", "PlatformSettings", settings._id, { key, value });
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/billing
 * Used to enforce or release a billing-related disable, independent
 * of the client/admin's own dashboard view (admin never sees this
 * as a "billing" action — it just appears as a generic disabled state).
 */
const updateBillingEnforcement = asyncHandler(async (req, res) => {
  const { isDuesCleared, nextDueDate, autoDisableOnOverdue, overdueGraceDays } = req.body;
  const settings = await PlatformSettings.findOneAndUpdate(
    {},
    {
      "billing.isDuesCleared": isDuesCleared,
      "billing.nextDueDate": nextDueDate,
      "billing.autoDisableOnOverdue": autoDisableOnOverdue,
      "billing.overdueGraceDays": overdueGraceDays,
      "billing.lastPaymentDate": isDuesCleared ? new Date() : undefined,
      updatedBy: req.user._id,
    },
    { new: true, upsert: true }
  );
  invalidateSettingsCache();
  await writeAudit(req, "PLATFORM_BILLING_UPDATE", "PlatformSettings", settings._id, req.body);
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/ads
 * Master control of Google AdSense + custom ad banners. By default
 * Google Ads render across the platform; only superadmin can disable
 * AdSense, swap individual slots to custom banners, or change keys.
 */
const updateAdsConfig = asyncHandler(async (req, res) => {
  const { googleAdsenseEnabled, adsenseClientId, customBannersEnabled, adSlots } = req.body;
  const settings = await PlatformSettings.findOne();

  if (googleAdsenseEnabled !== undefined) settings.ads.googleAdsenseEnabled = googleAdsenseEnabled;
  if (adsenseClientId !== undefined) settings.ads.adsenseClientId = adsenseClientId;
  if (customBannersEnabled !== undefined) settings.ads.customBannersEnabled = customBannersEnabled;
  if (adSlots) {
    Object.entries(adSlots).forEach(([slotKey, slotConfig]) => {
      settings.ads.adSlots.set(slotKey, slotConfig);
    });
  }
  settings.updatedBy = req.user._id;
  await settings.save();
  invalidateSettingsCache();
  await writeAudit(req, "PLATFORM_ADS_CONFIG_UPDATE", "PlatformSettings", settings._id, req.body);
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/route-toggle
 * Body: { route: "/checkout", disabled: true }
 * Disables an entire frontend route/page across the storefront.
 */
const toggleRoute = asyncHandler(async (req, res) => {
  const { route, disabled } = req.body;
  const settings = await PlatformSettings.findOne();
  const set = new Set(settings.disabledRoutes);
  disabled ? set.add(route) : set.delete(route);
  settings.disabledRoutes = Array.from(set);
  settings.updatedBy = req.user._id;
  await settings.save();
  invalidateSettingsCache();
  await writeAudit(req, "PLATFORM_ROUTE_TOGGLE", "PlatformSettings", settings._id, { route, disabled });
  res.status(200).json({ success: true, data: settings });
});

/**
 * PATCH /api/superadmin/users/:id/suspend
 * Suspends/un-suspends ANY user, including admins (the client) and
 * vendors/staff. This is the account-level kill-switch.
 */
const setUserSuspension = asyncHandler(async (req, res) => {
  const { isSuspended, suspensionReason } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended, suspensionReason },
    { new: true }
  );
  await writeAudit(req, "USER_SUSPENSION_SET", "User", user._id, { isSuspended, suspensionReason });
  res.status(200).json({ success: true, data: user });
});

/** GET /api/superadmin/audit-logs */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = await AuditLog.find()
    .populate("actor", "name email role")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.status(200).json({ success: true, data: logs });
});

module.exports = {
  getPlatformSettings,
  setGlobalKillSwitch,
  setFeatureFlag,
  updateBillingEnforcement,
  updateAdsConfig,
  toggleRoute,
  setUserSuspension,
  getAuditLogs,
};
