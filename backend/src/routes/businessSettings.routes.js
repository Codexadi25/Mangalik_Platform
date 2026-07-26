const express = require("express");
const ctrl = require("../controllers/businessSettings.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/public", ctrl.getPublicSettings);

// Allow 'admin' (Business Owner) and 'superadmin' to access settings
router.use(protect, authorize("admin", "superadmin"));

router.get("/", ctrl.getSettings);
router.patch("/", ctrl.updateSettings);

module.exports = router;
