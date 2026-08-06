const express = require("express");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

router.patch("/me", asyncHandler(async (req, res) => {
  const { name, email, phone, whatsApp, password, addresses } = req.body;
  const user = await User.findById(req.user._id);
  
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email ? email.toLowerCase().trim() : "";
  if (phone !== undefined) user.phone = phone;
  if (whatsApp !== undefined) user.whatsApp = whatsApp;
  if (addresses !== undefined) user.addresses = addresses;
  if (password !== undefined) user.password = password; // pre-save hook handles hashing

  await user.save();
  res.status(200).json({ success: true, data: user });
}));

router.post("/me/wishlist/:productId", asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(req.params.productId)) {
    user.wishlist.push(req.params.productId);
  } else {
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
  }
  await user.save();
  const updatedUser = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "category" }
  });
  res.status(200).json({ success: true, data: updatedUser.wishlist });
}));

// Admin/Superadmin staff management
router.get("/", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  // Filter out regular users and superadmins
  const users = await User.find({ role: { $nin: ["user", "superadmin"] } })
    .select("-password")
    .sort("-createdAt");
  res.status(200).json({ success: true, data: users });
}));

router.patch("/:id/role", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const { role, permissions } = req.body;
  
  // Security check: Admins cannot grant superadmin
  if (role === "superadmin" && req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Only SuperAdmins can grant SuperAdmin access." });
  }

  const updates = {};
  if (role) updates.role = role;
  if (permissions) updates.permissions = permissions;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.status(200).json({ success: true, data: user });
}));

router.patch("/:id/password", authorize("admin", "superadmin"), asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

  // Security check: Admins cannot change superadmin passwords
  if (targetUser.role === "superadmin" && req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Cannot change SuperAdmin password." });
  }

  targetUser.password = newPassword;
  await targetUser.save(); // relies on pre-save hook to hash

  res.status(200).json({ success: true, message: "Password updated successfully." });
}));

router.get("/:id/history", authorize("admin", "superadmin", "manager", "agent"), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("vendorProfile salesPartnerProfile");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const Order = require("../models/Order.model");
  
  let historyData = {};
  if (user.role === "user") {
    const activeOrders = await Order.find({ user: user._id, status: { $ne: "cancelled" } });
    const totalOrders = await Order.countDocuments({ user: user._id });
    const canceledOrders = await Order.countDocuments({ user: user._id, status: "cancelled" });
    const totalSpent = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const netMargin = Math.round(activeOrders.reduce((sum, o) => sum + (o.subtotal * 0.15 - (o.discount || 0)), 0));
    historyData = { totalOrders, canceledOrders, totalSpent, netMargin };
  } else if (user.role === "vendor" || user.vendorProfile) {
    const vendorProfileId = user.vendorProfile?._id || user._id;
    const Vendor = require("../models/Vendor.model");
    const vendor = await Vendor.findOne({ $or: [{ _id: vendorProfileId }, { user: user._id }] });
    const vendorId = vendor ? vendor._id : vendorProfileId;

    const vendorOrders = await Order.find({ "items.vendor": vendorId, status: { $ne: "cancelled" } });
    const totalOrdersCount = await Order.countDocuments({ "items.vendor": vendorId });
    
    let netSales = 0;
    for (const o of vendorOrders) {
      for (const item of o.items) {
        if (String(item.vendor) === String(vendorId)) {
          netSales += item.price * item.quantity;
        }
      }
    }
    const commissionPercent = vendor ? (vendor.commissionPercent || 10) : 10;
    const netCommission = Math.round((netSales * commissionPercent) / 100);
    const outstandingPayment = netSales - netCommission;
    const netMargin = outstandingPayment;
    
    historyData = {
      vendorOrders: totalOrdersCount,
      netSales,
      netCommission,
      outstandingPayment,
      netMargin
    };
  } else if (user.role === "deliveryPartner") {
    const deliveredOrders = await Order.countDocuments({ assignedDeliveryPartner: user._id, status: "delivered" });
    historyData = { deliveredOrders };
  }

  res.status(200).json({ success: true, data: { user, history: historyData } });
}));

module.exports = router;
