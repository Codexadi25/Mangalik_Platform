const mongoose = require("mongoose");

const salesPartnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referralCode: { type: String, required: true, unique: true },
    commissionPercent: { type: Number, default: 5 },
    totalEarned: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesPartner", salesPartnerSchema);
