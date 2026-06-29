const express = require("express");
const Order = require("../models/Order.model");
const SupportTicket = require("../models/SupportTicket.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

// Manager: operations overview
router.get("/manager/orders", authorize("manager", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const orders = await Order.find().sort("-createdAt").limit(200);
  res.status(200).json({ success: true, data: orders });
}));

// Agent: assigned support tickets
router.get("/agent/tickets", authorize("agent", "manager", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const filter = req.user.role === "agent" ? { assignedAgent: req.user._id } : {};
  const tickets = await SupportTicket.find(filter).sort("-createdAt");
  res.status(200).json({ success: true, data: tickets });
}));

router.post("/agent/tickets/:id/reply", authorize("agent", "manager", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  ticket.messages.push({ sender: req.user._id, message: req.body.message });
  ticket.status = "in_progress";
  await ticket.save();
  res.status(200).json({ success: true, data: ticket });
}));

// Delivery partner: assigned orders
router.get("/delivery/orders", authorize("deliveryPartner", "manager", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const filter = req.user.role === "deliveryPartner" ? { assignedDeliveryPartner: req.user._id } : {};
  const orders = await Order.find(filter).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
}));

router.patch("/delivery/orders/:id/status", authorize("deliveryPartner", "manager", "admin", "superadmin"), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, changedBy: req.user._id, note: req.body.note });
  if (req.body.status === "delivered") {
    order.proofOfDelivery = { imageUrl: req.body.proofImageUrl, signedAt: new Date() };
    if (order.paymentMethod === "cod") order.codCollected = true;
  }
  await order.save();
  res.status(200).json({ success: true, data: order });
}));

module.exports = router;
