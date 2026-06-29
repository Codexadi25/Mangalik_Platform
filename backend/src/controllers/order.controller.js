const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order.model");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createRazorpayOrder, verifyPaymentSignature } = require("../services/payment.service");
const { getSettings } = require("../middleware/platformControl.middleware");

const generateOrderNumber = () => `MGK-${Date.now().toString().slice(-8)}-${uuidv4().slice(0, 4).toUpperCase()}`;

/** Builds order line items from the user's cart, with live price re-verification. */
const buildOrderItemsFromCart = async (cart) => {
  let subtotal = 0;
  const items = [];

  for (const ci of cart.items) {
    const product = await Product.findById(ci.product);
    if (!product || !product.isActive) continue;

    const price = product.basePrice;
    subtotal += price * ci.quantity;

    const addOns = [];
    for (const a of ci.addOns || []) {
      const addOnProduct = await Product.findById(a.product);
      if (!addOnProduct) continue;
      subtotal += addOnProduct.basePrice * a.quantity;
      addOns.push({
        product: addOnProduct._id,
        title: addOnProduct.title,
        quantity: a.quantity,
        price: addOnProduct.basePrice,
      });
    }

    items.push({
      product: product._id,
      title: product.title,
      image: product.images?.[0]?.url,
      quantity: ci.quantity,
      price,
      addOns,
      vendor: product.vendor,
    });
  }

  return { items, subtotal };
};

/** POST /api/orders/checkout — initiates checkout (Razorpay order or direct COD order). */
const checkout = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (settings.featureFlags.get("checkout") === false) {
    throw new ApiError(403, "Checkout is currently unavailable. Please try again later.");
  }

  const { paymentMethod, shippingAddress } = req.body;
  if (paymentMethod === "cod" && settings.featureFlags.get("cod") === false) {
    throw new ApiError(403, "Cash on Delivery is currently unavailable.");
  }
  if (paymentMethod === "razorpay" && settings.featureFlags.get("razorpay") === false) {
    throw new ApiError(403, "Online payment is currently unavailable.");
  }

  const { couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty.");

  const { items, subtotal } = await buildOrderItemsFromCart(cart);
  if (items.length === 0) throw new ApiError(400, "No valid items found in cart.");

  const shippingFee = subtotal > 999 ? 0 : 79;
  
  let discount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const Coupon = require("../models/Coupon.model");
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isActive && (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {
      if (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) {
        if (coupon.type === "flat") discount = coupon.value;
        else if (coupon.type === "percentage") {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        }
        appliedCoupon = coupon;
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gstAmount = Math.round(discountedSubtotal * 0.05 * 100) / 100;
  const total = discountedSubtotal + shippingFee + gstAmount;
  const orderNumber = generateOrderNumber();

  if (paymentMethod === "razorpay") {
    const rzpOrder = await createRazorpayOrder({ amount: total, receipt: orderNumber });
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      shippingFee,
      gstAmount,
      total,
      paymentMethod,
      paymentStatus: "pending",
      razorpay: { orderId: rzpOrder.id },
    });
    return res.status(201).json({
      success: true,
      data: { order, razorpayOrderId: rzpOrder.id, razorpayKeyId: process.env.RAZORPAY_KEY_ID },
    });
  }

  // COD flow
  const order = await Order.create({
    orderNumber,
    user: req.user._id,
    items,
    shippingAddress,
    subtotal,
    discount,
    couponCode: appliedCoupon?.code,
    shippingFee,
    gstAmount,
    total,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "confirmed",
  });
  cart.items = [];
  await cart.save();
  res.status(201).json({ success: true, data: { order } });
});

/** POST /api/orders/verify-payment — verifies Razorpay signature & confirms order. */
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const valid = verifyPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if (!valid) throw new ApiError(400, "Payment verification failed. Possible tampering detected.");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found.");

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.razorpay.paymentId = razorpayPaymentId;
  order.razorpay.signature = razorpaySignature;
  order.statusHistory.push({ status: "confirmed", changedBy: req.user._id });
  await order.save();

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(200).json({ success: true, message: "Payment verified successfully.", data: order });
});

/** GET /api/orders/my — customer's own order history */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
});

/** GET /api/orders/:id */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  const isOwner = String(order.user) === String(req.user._id);
  const isStaff = ["admin", "superadmin", "manager", "agent", "deliveryPartner"].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, "Not authorized to view this order.");
  res.status(200).json({ success: true, data: order });
});

const replaceOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  if (String(order.user) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to replace this order.");
  }
  if (order.status !== "delivered") {
    throw new ApiError(400, "Only delivered orders can be replaced.");
  }

  order.status = "replacement_requested";
  order.statusHistory.push({
    status: "replacement_requested",
    note: reason || "User requested replacement",
    changedBy: req.user._id,
  });
  await order.save();

  res.status(200).json({ success: true, data: order, message: "Replacement requested successfully." });
});

module.exports = { checkout, verifyPayment, getMyOrders, getOrderById, replaceOrder };
