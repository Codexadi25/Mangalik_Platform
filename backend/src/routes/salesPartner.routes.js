const express = require("express");
const SalesPartner = require("../models/SalesPartner.model");
const Order = require("../models/Order.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("salesPartner", "admin", "superadmin"));

router.get("/me", asyncHandler(async (req, res) => {
  const partner = await SalesPartner.findOne({ user: req.user._id });
  res.status(200).json({ success: true, data: partner });
}));

router.get("/me/commissions", asyncHandler(async (req, res) => {
  const orders = await Order.find({ salesPartnerRef: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
}));

module.exports = router;
