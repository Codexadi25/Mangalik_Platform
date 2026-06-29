const mongoose = require("mongoose");

/**
 * Immutable audit trail for sensitive actions — especially every
 * SUPERADMIN action (kill-switches, route toggles, billing
 * enforcement) and every ADMIN action that affects money, staff,
 * or published content. Used for security review & dispute resolution.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: String,
    action: { type: String, required: true }, // e.g. "PLATFORM_DISABLE", "PRODUCT_UPDATE"
    targetType: String, // e.g. "Order", "Product", "PlatformSettings"
    targetId: String,
    metadata: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
