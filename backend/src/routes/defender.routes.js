const express = require("express");
const DefenderBlock = require("../models/DefenderBlock.model");
const User = require("../models/User.model");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

// Only admin and superadmin can manage server defender
router.use(protect, authorize("admin", "superadmin"));

/**
 * GET /api/defender
 * Query params: q (search by IP, MAC, or email)
 */
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { ip: { $regex: regex } },
        { deviceMac: { $regex: regex } },
        { connectedAccounts: { $in: [regex] } }
      ];
    }

    const records = await DefenderBlock.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Defender fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch defender records." });
  }
});

/**
 * POST /api/defender/status
 * Body: { id, status }
 */
router.post("/status", async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !["active", "blocked", "whitelisted"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid record ID or status." });
    }

    const record = await DefenderBlock.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    const oldStatus = record.status;
    record.status = status;
    
    if (status === "active" || status === "whitelisted") {
      record.graceIncrements = 0;
      record.currentGracePeriodMs = 300000;
      record.graceUntil = null;

      // Re-enable suspended accounts associated with this record
      if (oldStatus === "blocked" && record.connectedAccounts.length > 0) {
        await User.updateMany(
          { email: { $in: record.connectedAccounts } },
          { $set: { isSuspended: false } }
        );
      }
    } else if (status === "blocked") {
      // Suspend associated accounts
      if (record.connectedAccounts.length > 0) {
        await User.updateMany(
          { email: { $in: record.connectedAccounts } },
          { $set: { isSuspended: true } }
        );
      }
    }

    await record.save();
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status." });
  }
});

module.exports = router;
