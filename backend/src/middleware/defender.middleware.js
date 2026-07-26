const DefenderBlock = require("../models/DefenderBlock.model");
const User = require("../models/User.model");
const logger = require("../utils/logger");

/**
 * Extracts a device identifier. Fallback to IP if header/cookie is missing.
 */
function getDeviceMac(req) {
  return req.headers["x-device-mac"] || req.cookies?.device_mac || `MOCK-MAC-${req.ip.replace(/[^a-zA-Z0-9]/g, "")}`;
}

/**
 * Global guard middleware to check if IP/MAC or connected accounts are blocked or in grace period.
 */
const defenderGuard = async (req, res, next) => {
  try {
    const ip = req.ip;
    const deviceMac = getDeviceMac(req);
    const userEmail = req.user?.email || req.body?.email || req.body?.identifier;

    // Check if any record is blocked or whitelisted
    const blockRecord = await DefenderBlock.findOne({
      $or: [
        { ip },
        { deviceMac },
        ...(userEmail ? [{ connectedAccounts: userEmail }] : [])
      ]
    });

    if (blockRecord) {
      if (blockRecord.status === "whitelisted") {
        return next();
      }

      if (blockRecord.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Blocked under Suspicious & Fraudulent Activities. Please contact support to whitelist."
        });
      }

      if (blockRecord.status === "grace") {
        const now = Date.now();
        if (blockRecord.graceUntil && now < blockRecord.graceUntil.getTime()) {
          // Breach during grace period -> trigger escalation!
          blockRecord.violationsCount += 1;
          blockRecord.lastViolationAt = new Date();

          if (blockRecord.graceIncrements < 3) {
            blockRecord.graceIncrements += 1;
            // random rate increase multiplier between 1.5 and 2.5
            const multiplier = 1.5 + Math.random();
            blockRecord.currentGracePeriodMs = Math.round(blockRecord.currentGracePeriodMs * multiplier);
            blockRecord.graceUntil = new Date(Date.now() + blockRecord.currentGracePeriodMs);
            await blockRecord.save();

            const secondsRemaining = Math.ceil((blockRecord.graceUntil.getTime() - Date.now()) / 1000);
            return res.status(429).json({
              success: false,
              message: `Suspicious activity detected. Cooldown period increased. Retry in ${secondsRemaining}s.`
            });
          } else {
            // Reached max grace increments -> Permanent Block
            blockRecord.status = "blocked";
            blockRecord.reason = "Max rate limit violations during grace period exceeded.";
            await blockRecord.save();

            // Suspend connected user accounts
            if (blockRecord.connectedAccounts && blockRecord.connectedAccounts.length > 0) {
              await User.updateMany(
                { email: { $in: blockRecord.connectedAccounts } },
                { $set: { isSuspended: true } }
              );
              logger.warn(`Defender: Suspended accounts connected to blocked IP/MAC: ${blockRecord.connectedAccounts.join(", ")}`);
            }

            return res.status(403).json({
              success: false,
              message: "Device and connected accounts blocked under Suspicious & Fraudulent Activities."
            });
          }
        } else {
          // Grace period elapsed -> Cool down to active status
          blockRecord.status = "active";
          blockRecord.graceIncrements = 0;
          blockRecord.currentGracePeriodMs = 300000; // Reset to 5 min
          blockRecord.graceUntil = null;
          await blockRecord.save();
        }
      }
    }
    next();
  } catch (error) {
    logger.error("Defender guard error:", error);
    next();
  }
};

/**
 * Handle rate limit violations to log them and place the device on grace cooldown.
 */
const handleRateLimitViolation = async (req) => {
  try {
    const ip = req.ip;
    const deviceMac = getDeviceMac(req);
    const userEmail = req.user?.email || req.body?.email || req.body?.identifier;

    let blockRecord = await DefenderBlock.findOne({ $or: [{ ip }, { deviceMac }] });

    if (!blockRecord) {
      blockRecord = new DefenderBlock({
        ip,
        deviceMac,
        status: "grace",
        violationsCount: 1,
        graceIncrements: 0,
        currentGracePeriodMs: 300000, // 5 min
        graceUntil: new Date(Date.now() + 300000),
        reason: "Initial rate limit threshold breached."
      });
    } else {
      if (blockRecord.status === "whitelisted") return;

      blockRecord.violationsCount += 1;
      blockRecord.lastViolationAt = new Date();

      if (blockRecord.status === "active") {
        blockRecord.status = "grace";
        blockRecord.graceUntil = new Date(Date.now() + blockRecord.currentGracePeriodMs);
      } else if (blockRecord.status === "grace") {
        // Increment grace period
        if (blockRecord.graceIncrements < 3) {
          blockRecord.graceIncrements += 1;
          const multiplier = 1.5 + Math.random();
          blockRecord.currentGracePeriodMs = Math.round(blockRecord.currentGracePeriodMs * multiplier);
          blockRecord.graceUntil = new Date(Date.now() + blockRecord.currentGracePeriodMs);
        } else {
          blockRecord.status = "blocked";
          blockRecord.reason = "Max rate limit violations reached.";
        }
      }
    }

    // Associate email/phone if available
    if (userEmail && !blockRecord.connectedAccounts.includes(userEmail)) {
      blockRecord.connectedAccounts.push(userEmail);
    }

    await blockRecord.save();

    // If blocked, suspend accounts immediately
    if (blockRecord.status === "blocked" && blockRecord.connectedAccounts.length > 0) {
      await User.updateMany(
        { email: { $in: blockRecord.connectedAccounts } },
        { $set: { isSuspended: true } }
      );
    }
  } catch (error) {
    logger.error("Failed to handle rate limit violation:", error);
  }
};

module.exports = {
  defenderGuard,
  handleRateLimitViolation,
  getDeviceMac
};
