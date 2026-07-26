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
      gstPercent: product.gstPercent || 5,
      whatsInTheBox: product.whatsInTheBox || [],
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

  const BusinessSettings = require("../models/BusinessSettings.model");
  let bSettings = await BusinessSettings.findOne();
  if (!bSettings) {
    bSettings = await BusinessSettings.create({
      businessName: "Mangalik",
      businessLocation: "https://maps.app.goo.gl/EzBC1JZsobNbr1gy5",
      deliveryChargePerKm: 12,
      baseDeliveryDistanceLimit: 5,
      baseDeliveryCharge: 49
    });
  }

  let distance = 3;
  if (shippingAddress && shippingAddress.pincode) {
    const pin = parseInt(shippingAddress.pincode.toString().replace(/\D/g, "")) || 0;
    distance = 1 + (pin % 25); // consistently generate a distance between 1 and 25 km
  }

  let shippingFee = bSettings.baseDeliveryCharge;
  if (distance > bSettings.baseDeliveryDistanceLimit) {
    shippingFee += Math.round((distance - bSettings.baseDeliveryDistanceLimit) * bSettings.deliveryChargePerKm);
  }
  
  let discount = 0;
  let appliedCoupon = null;
  let appliedVendorRef = null;

  let isReferralUsed = false;
  if (couponCode) {
    const Coupon = require("../models/Coupon.model");
    const Vendor = require("../models/Vendor.model");
    
    // Check if it's a vendor referral code
    const vendorRef = await Vendor.findOne({ referralCode: couponCode.toUpperCase(), isActive: true });
    if (vendorRef) {
      // Flat 5% discount for using vendor referral
      discount = (subtotal * 5) / 100;
      appliedVendorRef = vendorRef;
      isReferralUsed = true;
    } else {
      // Validate normal coupon
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isActive && (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)) {
        if (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit) {
          if (coupon.type === "flat") discount = coupon.value;
          else if (coupon.type === "percentage") {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
          }
          appliedCoupon = coupon;
          if (coupon.vendor) {
            // If the coupon is linked to a vendor, assign commission attribution!
            const vendorObj = await Vendor.findById(coupon.vendor);
            if (vendorObj) {
              appliedVendorRef = vendorObj;
            }
          }
        }
      }
    }
  } else if (req.user.referredByVendor) {
    // If no coupon is passed, check if the user is checking out for the first time and has been referred by a vendor!
    const previousOrders = await Order.countDocuments({ user: req.user._id, status: { $ne: "cancelled" } });
    if (previousOrders === 0) {
      const Vendor = require("../models/Vendor.model");
      const vendorRef = await Vendor.findOne({ _id: req.user.referredByVendor, isActive: true });
      if (vendorRef) {
        // Avail benefit to customer: Flat 10% discount + simulated free gift item if order value >= 1000
        discount = (subtotal * 10) / 100;
        appliedVendorRef = vendorRef;
        isReferralUsed = true;
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
      salesPartnerRef: appliedVendorRef ? appliedVendorRef.user : null,
      commissionAmount: appliedVendorRef ? (discountedSubtotal * appliedVendorRef.commissionPercent) / 100 : 0,
      referredVendor: appliedVendorRef ? appliedVendorRef._id : null,
      isReferralUsed,
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
    salesPartnerRef: appliedVendorRef ? appliedVendorRef.user : null,
    commissionAmount: appliedVendorRef ? (discountedSubtotal * appliedVendorRef.commissionPercent) / 100 : 0,
    referredVendor: appliedVendorRef ? appliedVendorRef._id : null,
    isReferralUsed,
  });
  cart.items = [];
  await cart.save();

  const io = req.app.get("io");
  if (io) {
    io.to("staff-room").emit("order:new", {
      orderNumber: order.orderNumber,
      _id: order._id,
      total: order.total,
      user: { name: req.user?.name || "Guest" }
    });
  }

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

  const io2 = req.app.get("io");
  if (io2) {
    io2.to("staff-room").emit("order:new", {
      orderNumber: order.orderNumber,
      _id: order._id,
      total: order.total,
      user: { name: req.user?.name || "Guest" }
    });
  }

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
  
  const Shipment = require("../models/Shipment.model");
  const shipment = await Shipment.findOne({ order: order._id }).lean();
  
  res.status(200).json({ success: true, data: { ...order.toObject(), shipment } });
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

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone photoURL")
    .sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
});

const searchLifelineOrders = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const dbQuery = {};
  if (query) {
    dbQuery.$or = [
      { orderNumber: { $regex: query, $options: "i" } }
    ];
  }
  
  const orders = await Order.find(dbQuery)
    .populate("user")
    .populate("items.vendor")
    .populate("assignedDeliveryPartner")
    .populate("salesPartnerRef")
    .sort("-createdAt")
    .limit(20);
    
  res.status(200).json({ success: true, data: orders });
});

const reportIssue = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  
  const { notes, newStatus, attributeFault } = req.body;
  if (notes) {
    order.notes = (order.notes || "") + "\n[" + new Date().toISOString() + " Issue reported: " + notes + " (Fault: " + (attributeFault || "None") + ")]";
  }
  if (newStatus) {
    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: "Issue Reported by Staff: " + (notes || ""),
      changedBy: req.user._id,
    });
  }
  
  await order.save();
  res.status(200).json({ success: true, data: order, message: "Issue reported successfully." });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  const { status, rejectionReason, deliveryPartnerName, trackingId } = req.body;
  if (!status) throw new ApiError(400, "Status is required.");

  let historyNote = "Status updated by admin/staff.";

  if (status === "cancelled") {
    if (!rejectionReason) {
      throw new ApiError(400, "Rejection reason is required to reject order.");
    }
    order.rejectionReason = rejectionReason;
    historyNote = `Order rejected. Reason: ${rejectionReason}`;
  } else if (status === "confirmed") {
    historyNote = "Order accepted and confirmed.";
  } else if (status === "processing") {
    historyNote = "Inventory check completed internally. Invoice & Bills prepared.";
  } else if (status === "packed") {
    const partner = deliveryPartnerName || "Shadowfax";
    const trkId = trackingId || "TRK-" + partner.toUpperCase() + "-" + Math.random().toString(36).substring(2, 11).toUpperCase();
    
    const Shipment = require("../models/Shipment.model");
    await Shipment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        shipmentId: "SHP-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
        trackingId: trkId,
        deliveryPartnerName: partner,
        status: "assigned",
      },
      { upsert: true, new: true }
    );
    historyNote = `Order packed. Alerts sent to recipient with bills and tracking ID: ${trkId}`;
  } else if (status === "shipped") {
    order.invoiceAttached = true;
    historyNote = "Order marked shipped. Delivery details attached to shipment.";
  } else if (status === "out_for_delivery") {
    const Shipment = require("../models/Shipment.model");
    await Shipment.findOneAndUpdate(
      { order: order._id },
      { status: "picked_up" }
    );
    historyNote = "Order picked up by delivery partner and is out for delivery.";
  }

  order.status = status;
  order.statusHistory.push({
    status,
    note: historyNote,
    changedBy: req.user._id,
  });

  await order.save();

  // Return the populated order with shipment
  const ShipmentModel = require("../models/Shipment.model");
  const shipment = await ShipmentModel.findOne({ order: order._id }).lean();

  res.status(200).json({
    success: true,
    data: { ...order.toObject(), shipment },
    message: "Order status updated successfully."
  });
});

const updateOrderFields = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  Object.assign(order, req.body);
  await order.save();

  const Shipment = require("../models/Shipment.model");
  const shipment = await Shipment.findOne({ order: order._id }).lean();

  res.status(200).json({
    success: true,
    data: { ...order.toObject(), shipment },
    message: "Order updated successfully."
  });
});

module.exports = { checkout, verifyPayment, getMyOrders, getOrderById, replaceOrder, getAllOrders, searchLifelineOrders, reportIssue, updateOrderStatus, updateOrderFields };
