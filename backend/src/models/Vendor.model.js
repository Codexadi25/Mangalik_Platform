const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    gstNumber: String,
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },
    commissionPercent: { type: Number, default: 10 },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // admin/superadmin can disable a vendor instantly
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
