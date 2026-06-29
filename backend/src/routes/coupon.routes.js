const express = require("express");
const { validateCoupon, getAllCoupons, createCoupon, toggleCoupon } = require("../controllers/coupon.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/validate", protect, validateCoupon);

router.use(protect, authorize("admin", "superadmin"));
router.route("/")
  .get(getAllCoupons)
  .post(createCoupon);
  
router.patch("/:id/toggle", toggleCoupon);

module.exports = router;
