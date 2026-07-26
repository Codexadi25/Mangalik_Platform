const express = require("express");
const ctrl = require("../controllers/superadmin.controller");
const dashCtrl = require("../controllers/dashboard.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Allow both admin and superadmin to view overview stats
router.get("/overview", protect, authorize("admin", "superadmin"), dashCtrl.getOverviewStats);

// EVERY route here is locked to the superadmin role ONLY — not even
// "admin" (the client/business owner) can access this namespace.
router.use(protect, authorize("superadmin"));
router.get("/settings", ctrl.getPlatformSettings);
router.patch("/kill-switch", ctrl.setGlobalKillSwitch);
router.patch("/feature-flags", ctrl.setFeatureFlag);
router.patch("/billing", ctrl.updateBillingEnforcement);
router.patch("/ads", ctrl.updateAdsConfig);
router.patch("/route-toggle", ctrl.toggleRoute);
router.patch("/users/:id/suspend", ctrl.setUserSuspension);
router.get("/audit-logs", ctrl.getAuditLogs);
router.get("/system-logs", ctrl.getSystemLogs);

module.exports = router;
