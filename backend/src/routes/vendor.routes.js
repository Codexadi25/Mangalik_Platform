const express = require("express");
const Vendor = require("../models/Vendor.model");
const Order = require("../models/Order.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

const User = require("../models/User.model");
const crypto = require("crypto");

router.use(protect);

router.post("/onboard", authorize("admin", "superadmin", "manager"), asyncHandler(async (req, res) => {
  const { name, email, phone, businessName, gstNumber, membershipPlan, password } = req.body;
  if (!email || !password || !businessName) throw new Error("Missing required fields");

  // Create User
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "vendor"
  });

  // Generate or use custom Referral Code
  let refCode = req.body.referralCode;
  if (!refCode) {
    refCode = "VEND-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  } else {
    refCode = refCode.toUpperCase().trim();
  }

  // Create Vendor
  const vendor = await Vendor.create({
    user: user._id,
    businessName,
    gstNumber,
    membershipPlan: membershipPlan || "Silver",
    referralCode: refCode,
    isApproved: true
  });

  // Link Vendor profile to User
  user.vendorProfile = vendor._id;
  await user.save();

  res.status(201).json({ success: true, data: vendor });
}));

// Vendor: own profile & orders containing their products
router.get("/me", authorize("vendor", "admin", "superadmin"), asyncHandler(async (req, res) => {
  let vendor;
  if (req.user.vendorProfile) {
    vendor = await Vendor.findById(req.user.vendorProfile);
  } else if (req.user.role === "admin" || req.user.role === "superadmin") {
    // If admin is previewing Vendor dashboard but has no profile, return the first vendor as mock data
    vendor = await Vendor.findOne();
  }
  res.status(200).json({ success: true, data: vendor });
}));

router.patch("/me/qr", authorize("vendor", "admin", "superadmin"), asyncHandler(async (req, res) => {
  if (!req.body.qrCodeSvg) throw new Error("Missing SVG data");
  let vendorId = req.user.vendorProfile;
  if (!vendorId && (req.user.role === "admin" || req.user.role === "superadmin")) {
    const firstVendor = await Vendor.findOne();
    if (firstVendor) vendorId = firstVendor._id;
  }
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    { qrCodeSvg: req.body.qrCodeSvg },
    { new: true }
  );
  res.status(200).json({ success: true, data: vendor });
}));

router.get("/me/orders", authorize("vendor"), asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.vendor": req.user.vendorProfile }).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
}));

router.patch("/me", authorize("vendor", "admin", "superadmin"), asyncHandler(async (req, res) => {
  let vendorId = req.user.vendorProfile;
  if (!vendorId && (req.user.role === "admin" || req.user.role === "superadmin")) {
    const firstVendor = await Vendor.findOne();
    if (firstVendor) vendorId = firstVendor._id;
  }
  const { businessName, gstNumber, membershipPlan, referralCode } = req.body;
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error("Vendor not found");

  if (businessName !== undefined) vendor.businessName = businessName;
  if (gstNumber !== undefined) vendor.gstNumber = gstNumber;
  
  // If plan is switched, update plan and allow setting custom referral code
  if (membershipPlan !== undefined) {
    vendor.membershipPlan = membershipPlan;
  }
  if (referralCode !== undefined) {
    vendor.referralCode = referralCode.toUpperCase().trim();
  }

  await vendor.save();
  res.status(200).json({ success: true, data: vendor });
}));

// Admin/Superadmin: manage all vendors
router.get("/", authorize("admin", "superadmin", "manager"), asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().populate("user", "name email phone");
  const Order = require("../models/Order.model");

  const enrichedVendors = await Promise.all(vendors.map(async (v) => {
    const orders = await Order.find({ referredVendor: v._id });
    const netSales = orders.filter(o => o.status !== "cancelled" && o.status !== "returned").reduce((sum, o) => sum + o.total, 0);
    const outstanding = orders.filter(o => o.paymentStatus === "pending" && o.status !== "cancelled").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    const claimed = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

    return {
      ...v.toObject(),
      netSalesGenerated: netSales,
      outstandingCommission: outstanding,
      claimedCommission: claimed
    };
  }));

  res.status(200).json({ success: true, data: enrichedVendors });
}));

router.patch("/:id/status", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive, isApproved: req.body.isApproved }, { new: true });
  res.status(200).json({ success: true, data: vendor });
}));

// Admin/Superadmin: Update detailed vendor properties & commission
router.patch("/:id/details", authorize("admin", "superadmin", "manager"), asyncHandler(async (req, res) => {
  const { name, email, phone, businessName, gstNumber, commissionPercent } = req.body;
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new Error("Vendor not found");

  if (businessName !== undefined) vendor.businessName = businessName;
  if (gstNumber !== undefined) vendor.gstNumber = gstNumber;
  if (commissionPercent !== undefined) vendor.commissionPercent = Number(commissionPercent);
  if (req.body.membershipPlan !== undefined) vendor.membershipPlan = req.body.membershipPlan;
  if (req.body.referralCode !== undefined) vendor.referralCode = req.body.referralCode.toUpperCase().trim();
  await vendor.save();

  if (vendor.user) {
    const user = await User.findById(vendor.user);
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      await user.save();
    }
  }

  res.status(200).json({ success: true, data: vendor });
}));

// Admin/Superadmin: Link Vendor to Coupon
router.post("/:id/link-coupon", authorize("admin", "superadmin", "manager"), asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  if (!couponCode) throw new Error("Coupon code is required");
  const Coupon = require("../models/Coupon.model");
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
  if (!coupon) throw new Error("Coupon not found");

  coupon.vendor = req.params.id;
  await coupon.save();

  res.status(200).json({ success: true, message: "Coupon linked to vendor successfully.", data: coupon });
}));

// Admin/Superadmin: Get vendor performance analytics (Monthly, Quarterly, Semi-Annually, Annually)
router.get("/:id/performance", authorize("admin", "superadmin", "manager", "vendor"), asyncHandler(async (req, res) => {
  const vendorId = req.params.id;
  const { basis } = req.query; // "monthly" | "quarterly" | "semiannually" | "annually"

  const vendorObj = await Vendor.findById(vendorId).populate("user");
  if (!vendorObj) throw new Error("Vendor not found");

  // Determine date filter based on basis
  const now = new Date();
  let startDate = new Date();
  if (basis === "quarterly") {
    startDate.setMonth(now.getMonth() - 3);
  } else if (basis === "semiannually") {
    startDate.setMonth(now.getMonth() - 6);
  } else if (basis === "annually") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    // default monthly
    startDate.setMonth(now.getMonth() - 1);
  }

  const query = {
    referredVendor: vendorId,
    createdAt: { $gte: startDate }
  };

  const orders = await Order.find(query).populate("user");
  const usersJoined = await User.find({ referredByVendor: vendorId, createdAt: { $gte: startDate } });

  const ordersPlaced = orders.length;
  const successfulDeliveries = orders.filter(o => o.status === "delivered").length;
  const orderCancellation = orders.filter(o => o.status === "cancelled").length;
  const complaints = orders.filter(o => o.status === "returned" || o.status === "replacement_requested").length;
  const netSales = orders.filter(o => o.status !== "cancelled" && o.status !== "returned").reduce((sum, o) => sum + o.total, 0);

  // Outstanding commission calculations
  const totalCommissionEarned = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const outstandingCommission = orders.filter(o => o.paymentStatus === "pending" && o.status !== "cancelled").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      basis,
      referralsCount: ordersPlaced,
      ordersPlaced,
      successfulDeliveries,
      ordersWithComplaints: complaints,
      orderCancellation,
      netSalesGenerated: netSales,
      netUsersJoined: usersJoined.length,
      netOutstandingCommission: outstandingCommission,
      receivedCommission: totalCommissionEarned
    }
  });
}));

// Get all coupons linked to a specific vendor
router.get("/:id/coupons", authorize("admin", "superadmin", "manager", "vendor"), asyncHandler(async (req, res) => {
  const Coupon = require("../models/Coupon.model");
  const coupons = await Coupon.find({ vendor: req.params.id }).sort("-createdAt");
  res.status(200).json({ success: true, data: coupons });
}));

// Admin/Superadmin: Delete a vendor and associated User
router.delete("/:id", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new Error("Vendor not found");

  if (vendor.user) {
    await User.findByIdAndDelete(vendor.user);
  }

  const Coupon = require("../models/Coupon.model");
  await Coupon.updateMany({ vendor: req.params.id }, { $unset: { vendor: 1 } });

  await vendor.deleteOne();
  res.status(200).json({ success: true, message: "Vendor deleted successfully." });
}));

module.exports = router;
