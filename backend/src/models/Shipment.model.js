const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    shipmentId: { type: String, required: true, unique: true },
    trackingId: { type: String, required: true },
    deliveryPartnerName: { type: String, required: true }, // e.g. Porter, Shadowfax, Pidge
    partnerPhone: String,
    vehiclePlateNo: String,
    status: { type: String, enum: ["assigned", "picked_up", "in_transit", "delivered"], default: "assigned" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
