const express = require("express");
const { v4: uuidv4 } = require("uuid");
const SupportTicket = require("../models/SupportTicket.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth.middleware");
const router = express.Router();

router.use(protect);

router.post("/", asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    ticketNumber: `TKT-${Date.now().toString().slice(-8)}-${uuidv4().slice(0, 4).toUpperCase()}`,
    user: req.user._id,
    order: req.body.order,
    subject: req.body.subject,
    category: req.body.category,
    messages: [{ sender: req.user._id, message: req.body.message }],
  });
  res.status(201).json({ success: true, data: ticket });
}));

router.get("/my", asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, data: tickets });
}));

module.exports = router;
