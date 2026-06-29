const Coupon = require("../models/Coupon.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Public/User: Validate a coupon before checkout
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;
  if (!code) throw new ApiError(400, "Coupon code is required");

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isActive) {
    throw new ApiError(400, "Invalid or inactive coupon code.");
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) throw new ApiError(400, "Coupon is not active yet.");
  if (coupon.validTill && now > coupon.validTill) throw new ApiError(400, "Coupon has expired.");

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit reached.");
  }

  if (orderValue < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`);
  }

  let discountAmount = 0;
  if (coupon.type === "flat") {
    discountAmount = coupon.value;
  } else if (coupon.type === "percentage") {
    discountAmount = (orderValue * coupon.value) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  res.status(200).json({ success: true, data: { discountAmount, code: coupon.code, type: coupon.type, value: coupon.value } });
});

// Admin: Get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.status(200).json({ success: true, data: coupons });
});

// Admin: Create coupon
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// Admin: Toggle active status
const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.status(200).json({ success: true, data: coupon });
});

module.exports = { validateCoupon, getAllCoupons, createCoupon, toggleCoupon };
