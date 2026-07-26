const express = require("express");
const DefenderBlock = require("../models/DefenderBlock.model");
const User = require("../models/User.model");
const { protect, authorize } = require("../middleware/auth.middleware");
const router = express.Router();

// Only admin and superadmin can manage server defender
router.use(protect, authorize("admin", "superadmin"));

router.get("/attack-logs", async (req, res) => {
  const fs = require("fs");
  const path = require("path");
  let attacks = [];
  try {
    const logPath = path.join(__dirname, "../../logs/combined.log");
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, "utf8").trim().split("\n").filter(Boolean);
      const suspicious = lines.filter(l => l.includes("429") || l.includes("403") || l.includes("401") || l.includes("Unauthorized") || l.includes("RateLimit")).slice(-50);
      attacks = suspicious.reverse().map(line => {
        const ipMatch = line.match(/\d+\.\d+\.\d+\.\d+/);
        let timestamp = new Date().toISOString();
        try {
          const parsed = JSON.parse(line);
          if (parsed.timestamp) timestamp = parsed.timestamp;
        } catch {}
        return {
          ip: ipMatch ? ipMatch[0] : "Unknown IP",
          type: "Suspicious Activity / Rate Limit",
          timestamp,
          action: "Blocked"
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch attack logs:", err);
  }
  res.status(200).json({ success: true, data: attacks });
});

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
