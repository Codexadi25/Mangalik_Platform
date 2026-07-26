const express = require("express");
const { getPage, updatePage, togglePage } = require("../controllers/cms.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { cacheRoute } = require("../middleware/cache.middleware");

const router = express.Router();

router.get("/:key", cacheRoute(3600), getPage);
router.patch("/:key", protect, authorize("admin", "superadmin"), updatePage);
router.patch("/:key/toggle", protect, authorize("superadmin"), togglePage);

module.exports = router;
