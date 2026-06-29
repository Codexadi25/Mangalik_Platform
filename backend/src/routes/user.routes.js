const express = require("express");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

router.patch("/me", asyncHandler(async (req, res) => {
  const { name, addresses } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, addresses }, { new: true });
  res.status(200).json({ success: true, data: user });
}));

router.post("/me/wishlist/:productId", asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(req.params.productId)) user.wishlist.push(req.params.productId);
  await user.save();
  res.status(200).json({ success: true, data: user.wishlist });
}));

// Admin/Superadmin staff management
router.get("/", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.status(200).json({ success: true, data: users });
}));

router.patch("/:id/role", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.status(200).json({ success: true, data: user });
}));

module.exports = router;
