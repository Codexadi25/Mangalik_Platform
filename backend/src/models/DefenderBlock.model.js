const mongoose = require("mongoose");

const defenderBlockSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, index: true },
    deviceMac: { type: String, required: true, index: true },
    connectedAccounts: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "grace", "blocked", "whitelisted"],
      default: "active",
      index: true,
    },
    violationsCount: { type: Number, default: 0 },
    graceIncrements: { type: Number, default: 0 },
    currentGracePeriodMs: { type: Number, default: 300000 }, // 5 min default
    graceUntil: { type: Date, default: null },
    lastViolationAt: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DefenderBlock", defenderBlockSchema);
