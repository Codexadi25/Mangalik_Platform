const express = require("express");
const Category = require("../models/Category.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("order");
  res.status(200).json({ success: true, data: categories });
}));

router.post("/", protect, authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
}));

router.patch("/:id", protect, authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, data: category });
}));

module.exports = router;
