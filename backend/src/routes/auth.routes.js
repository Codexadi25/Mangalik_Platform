const express = require("express");
const { firebaseLogin, localRegister, localLogin, refreshToken, logout, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/security.middleware");

const router = express.Router();

router.post("/firebase-login", authLimiter, firebaseLogin);
router.post("/local-register", authLimiter, localRegister);
router.post("/local-login", authLimiter, localLogin);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
