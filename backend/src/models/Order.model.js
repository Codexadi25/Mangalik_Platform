const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: String,
    title: String, // snapshot at time of order
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    addOns: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        quantity: Number,
        price: Number,
      },
    ],
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    shippingFee: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
      index: true,
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],

    assignedDeliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    proofOfDelivery: { imageUrl: String, signedAt: Date },
    codCollected: { type: Boolean, default: false },

    salesPartnerRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commissionAmount: Number,

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
