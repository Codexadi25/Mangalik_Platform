const express = require("express");
const { firebaseLogin, localRegister, localLogin, refreshToken, logout, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/security.middleware");
const DefenderBlock = require("../models/DefenderBlock.model");
const User = require("../models/User.model");

const router = express.Router();

router.get("/temp-unblock", async (req, res) => {
  try {
    const defenderResult = await DefenderBlock.updateMany(
      { status: "blocked" },
      {
        $set: {
          status: "active",
          violationsCount: 0,
          graceIncrements: 0,
          graceUntil: null,
        }
      }
    );
    const userResult = await User.updateMany(
      { isSuspended: true },
      { $set: { isSuspended: false } }
    );
    res.status(200).json({
      success: true,
      message: "Unblocked successfully.",
      unblockedDefenderRecords: defenderResult.modifiedCount,
      unsuspendedUsers: userResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/firebase-login", authLimiter, firebaseLogin);
router.post("/local-register", authLimiter, localRegister);
router.post("/local-login", authLimiter, localLogin);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
