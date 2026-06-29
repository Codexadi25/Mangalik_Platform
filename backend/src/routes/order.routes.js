const express = require("express");
const ctrl = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.post("/checkout", ctrl.checkout);
router.post("/verify-payment", ctrl.verifyPayment);
router.get("/my", ctrl.getMyOrders);
router.get("/:id", ctrl.getOrderById);
router.post("/:id/replace", ctrl.replaceOrder);

module.exports = router;
