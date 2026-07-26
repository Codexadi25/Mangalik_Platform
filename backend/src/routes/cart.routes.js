const express = require("express");
const Cart = require("../models/Cart.model");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  } else {
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product != null);
    if (cart.items.length !== originalLength) {
      await cart.save();
    }
  }
  res.status(200).json({ success: true, data: cart });
}));

router.post("/add", asyncHandler(async (req, res) => {
  const { productId, quantity = 1, addOns = [] } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => String(i.product) === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, addOns });
  }
  await cart.save();
  cart = await Cart.findById(cart._id).populate("items.product");
  cart.items = cart.items.filter(item => item.product != null);
  res.status(200).json({ success: true, data: cart });
}));

router.patch("/item/:productId", asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  const item = cart.items.find((i) => String(i.product) === req.params.productId);
  if (item) item.quantity = quantity;
  await cart.save();
  cart = await Cart.findById(cart._id).populate("items.product");
  cart.items = cart.items.filter(item => item.product != null);
  res.status(200).json({ success: true, data: cart });
}));

router.delete("/item/:productId", asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter((i) => String(i.product) !== req.params.productId);
  await cart.save();
  cart = await Cart.findById(cart._id).populate("items.product");
  cart.items = cart.items.filter(item => item.product != null);
  res.status(200).json({ success: true, data: cart });
}));

module.exports = router;
