const { getSettings } = require("../middleware/platformControl.middleware");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /api/ads/config — PUBLIC endpoint consumed by the storefront's
 * <AdsBanner /> component. Returns only what the frontend needs to
 * render each ad slot (Google AdSense by default, or a custom
 * banner if superadmin has overridden that slot). No sensitive
 * platform settings are leaked here — this is a read-only, filtered
 * projection of PlatformSettings.ads.
 */
const getAdsConfig = asyncHandler(async (req, res) => {
  const settings = await getSettings();

  const adSlots = {};
  for (const [key, val] of settings.ads.adSlots.entries()) {
    adSlots[key] = val;
  }

  res.status(200).json({
    success: true,
    data: {
      googleAdsenseEnabled: settings.ads.googleAdsenseEnabled,
      adsenseClientId: settings.ads.adsenseClientId,
      customBannersEnabled: settings.ads.customBannersEnabled,
      adSlots,
    },
  });
});

module.exports = { getAdsConfig };
