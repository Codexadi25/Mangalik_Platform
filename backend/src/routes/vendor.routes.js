const express = require("express");
const Vendor = require("../models/Vendor.model");
const Order = require("../models/Order.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

// Vendor: own profile & orders containing their products
router.get("/me", authorize("vendor"), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.user.vendorProfile);
  res.status(200).json({ success: true, data: vendor });
}));

router.get("/me/orders", authorize("vendor"), asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.vendor": req.user.vendorProfile }).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
}));

// Admin/Superadmin: manage all vendors
router.get("/", authorize("admin", "superadmin", "manager"), asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().populate("user", "name email phone");
  res.status(200).json({ success: true, data: vendors });
}));

router.patch("/:id/status", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive, isApproved: req.body.isApproved }, { new: true });
  res.status(200).json({ success: true, data: vendor });
}));

module.exports = router;
