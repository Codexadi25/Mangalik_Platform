const crypto = require("crypto");
const BusinessSettings = require("../models/BusinessSettings.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// A static symmetric key for demonstration, ideally from process.env
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.createHash('sha256').update('mangalik-secure-key').digest();

const encryptPayload = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    encrypted,
    authTag
  };
};

const decryptPayload = (ivHex, encryptedHex, authTagHex) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await BusinessSettings.findOne();
  if (!settings) {
    settings = await BusinessSettings.create({ businessName: "Mangalik" });
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

exports.getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await BusinessSettings.findOne();
  if (!settings) {
    settings = await BusinessSettings.create({ businessName: "Mangalik" });
  }
  
  res.status(200).json({
    success: true,
    data: {
      businessName: settings.businessName,
      logoUrl: settings.logoUrl,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      businessLocation: settings.businessLocation,
    }
  });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const { businessName, logoUrl, supportEmail, supportPhone } = req.body;

  let settings = await BusinessSettings.findOne();
  if (!settings) settings = new BusinessSettings();

  if (businessName) settings.businessName = businessName;
  if (logoUrl) settings.logoUrl = logoUrl;
  if (supportEmail) settings.supportEmail = supportEmail;
  if (supportPhone) settings.supportPhone = supportPhone;

  if (req.body.businessLocation !== undefined) settings.businessLocation = req.body.businessLocation;
  if (req.body.deliveryChargePerKm !== undefined) settings.deliveryChargePerKm = Number(req.body.deliveryChargePerKm);
  if (req.body.baseDeliveryDistanceLimit !== undefined) settings.baseDeliveryDistanceLimit = Number(req.body.baseDeliveryDistanceLimit);
  if (req.body.baseDeliveryCharge !== undefined) settings.baseDeliveryCharge = Number(req.body.baseDeliveryCharge);

  if (req.user && req.user.role === "superadmin") {
    const { subscriptionPlan, subscriptionCost, subscriptionProvider, subscriptionStatus, governedBy } = req.body;
    if (subscriptionPlan !== undefined) settings.subscriptionPlan = subscriptionPlan;
    if (subscriptionCost !== undefined) settings.subscriptionCost = subscriptionCost;
    if (subscriptionProvider !== undefined) settings.subscriptionProvider = subscriptionProvider;
    if (subscriptionStatus !== undefined) settings.subscriptionStatus = subscriptionStatus;
    if (governedBy !== undefined) settings.governedBy = governedBy;
  }

  await settings.save();

  res.status(200).json({ success: true, message: "Settings securely updated.", data: settings });
});
