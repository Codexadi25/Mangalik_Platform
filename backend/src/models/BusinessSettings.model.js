const mongoose = require("mongoose");

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    logoUrl: { type: String },
    supportEmail: { type: String },
    supportPhone: { type: String },
    termsOfUsage: { type: String },
    privacyPolicy: { type: String },
    subscriptionPlan: { type: String, default: "Custom Plan" },
    subscriptionCost: { type: Number, default: 69999 },
    subscriptionProvider: { type: String, default: "Aditya Tech & Devoops" },
    subscriptionStatus: { type: String, default: "Active" },
    governedBy: { type: String, default: "Dhanlaxmi Enterprises" },
    businessLocation: { type: String, default: "https://maps.app.goo.gl/EzBC1JZsobNbr1gy5" },
    deliveryChargePerKm: { type: Number, default: 12 },
    baseDeliveryDistanceLimit: { type: Number, default: 5 },
    baseDeliveryCharge: { type: Number, default: 49 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessSettings", businessSettingsSchema);
