const mongoose = require("mongoose");

/**
 * ============================================================
 *  PLATFORM SETTINGS — SINGLETON DOCUMENT
 *  This is the single source of truth for the SUPERADMIN's
 *  override control over the entire Mangalik platform.
 *  Only one document should ever exist (enforced in service layer).
 * ============================================================
 */
const platformSettingsSchema = new mongoose.Schema(
  {
    // ---- Global kill-switch ----
    siteEnabled: { type: Boolean, default: true },
    maintenanceMessage: { type: String, default: "" },

    // ---- Per-feature toggles (checkout, ads, vendorPortal, salesPartnerProgram, reviews, wishlist, etc.) ----
    featureFlags: {
      type: Map,
      of: Boolean,
      default: {
        checkout: true,
        cod: true,
        razorpay: true,
        ads: true,
        vendorPortal: true,
        salesPartnerProgram: true,
        reviews: true,
        wishlist: true,
        coupons: true,
        liveChatSupport: true,
      },
    },

    // ---- Per-route disable map (route key -> enabled) e.g. "/products", "/checkout" ----
    disabledRoutes: { type: [String], default: [] },

    // ---- Client billing enforcement (superadmin only) ----
    billing: {
      isDuesCleared: { type: Boolean, default: true },
      lastPaymentDate: Date,
      nextDueDate: Date,
      autoDisableOnOverdue: { type: Boolean, default: true },
      overdueGraceDays: { type: Number, default: 7 },
    },

    // ---- Ads / Google AdSense control (superadmin master switch) ----
    ads: {
      googleAdsenseEnabled: { type: Boolean, default: true },
      adsenseClientId: { type: String, default: process.env.DEFAULT_ADSENSE_CLIENT_ID || "" },
      customBannersEnabled: { type: Boolean, default: true },
      adSlots: {
        type: Map,
        of: new mongoose.Schema(
          {
            enabled: { type: Boolean, default: true },
            type: { type: String, enum: ["google", "custom"], default: "google" },
            adUnitId: String,
            customImageUrl: String,
            customLinkUrl: String,
          },
          { _id: false }
        ),
        default: {},
      },
    },

    brand: {
      siteName: { type: String, default: "Mangalik" },
      tagline: { type: String, default: "A-Z Poojan Samagri for Every Sacred Ritual" },
      supportEmail: { type: String, default: "support@mangalik.store" },
      supportPhone: { type: String, default: "+91-00000-00000" },
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
