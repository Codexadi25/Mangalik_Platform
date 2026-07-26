const PlatformSettings = require("../models/PlatformSettings.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * ============================================================
 *  PLATFORM CONTROL ENFORCEMENT
 *  This is the SUPERADMIN-only kill-switch layer. It runs on
 *  every request (after auth) and checks a single, cached
 *  PlatformSettings document that ONLY superadmin-role users
 *  can write to (enforced again at the route layer).
 *
 *  Capabilities controlled here:
 *   - Whole-site maintenance mode (e.g. unpaid dues)
 *   - Per-route / per-feature disable (route key map)
 *   - Per-page disable (e.g. disable "Ads", "Checkout")
 *   - Vendor/Admin account-level suspension cascades
 *
 *  The business owner (ADMIN role) sees none of this — from
 *  their dashboard, a disabled feature simply does not appear,
 *  with no indication that it was switched off externally.
 * ============================================================
 */

let cachedSettings = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 30 * 1000; // 30s — fast enough for near-real-time kill switches

const getSettings = async () => {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiresAt) return cachedSettings;

  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  cachedSettings = settings;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return settings;
};

/** Call after mutating settings from a superadmin route to bust the cache immediately. */
const invalidateSettingsCache = () => {
  cachedSettings = null;
  cacheExpiresAt = 0;
};

/**
 * Global gate — blocks the ENTIRE platform (storefront + dashboard APIs)
 * except for superadmin routes, when `siteEnabled` is false.
 */
const enforceGlobalKillSwitch = asyncHandler(async (req, res, next) => {
  const settings = await getSettings();

  // Superadmin routes must always remain reachable, even during full lockdown.
  if (req.path.startsWith("/api/superadmin")) return next();

  if (!settings.siteEnabled) {
    // Attempt to decode the user's role from the token to allow superadmins to bypass lockdown
    let isSuperAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const User = require("../models/User.model");
        const user = await User.findById(decoded.sub);
        if (user && user.role === "superadmin") {
          isSuperAdmin = true;
        }
      } catch (err) {
        // Silently ignore token errors; they will be caught by actual auth guards later
      }
    }

    if (isSuperAdmin) {
      return next();
    }

    throw new ApiError(
      503,
      settings.maintenanceMessage ||
        "This service is temporarily unavailable. Please contact the platform administrator."
    );
  }
  next();
});

/**
 * Feature/route-level gate. Pass the feature key registered in
 * PlatformSettings.featureFlags (e.g. "checkout", "ads", "vendorPortal").
 */
const requireFeatureEnabled = (featureKey) =>
  asyncHandler(async (req, res, next) => {
    const settings = await getSettings();
    const flag = settings.featureFlags?.get
      ? settings.featureFlags.get(featureKey)
      : settings.featureFlags?.[featureKey];

    if (flag === false) {
      throw new ApiError(403, "This feature is currently disabled by the platform.");
    }
    next();
  });

module.exports = {
  getSettings,
  invalidateSettingsCache,
  enforceGlobalKillSwitch,
  requireFeatureEnabled,
};
