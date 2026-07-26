const express = require("express");
const ctrl = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.post("/checkout", ctrl.checkout);
router.post("/verify-payment", ctrl.verifyPayment);
router.get("/my", ctrl.getMyOrders);
router.get("/", authorize("admin", "superadmin", "manager"), ctrl.getAllOrders);
router.get("/lifeline/search", authorize("admin", "superadmin", "manager", "agent"), ctrl.searchLifelineOrders);
router.post("/:id/issue", authorize("admin", "superadmin", "manager", "agent"), ctrl.reportIssue);
router.put("/:id/status", authorize("admin", "superadmin", "manager"), ctrl.updateOrderStatus);
router.patch("/:id", authorize("admin", "superadmin", "manager"), ctrl.updateOrderFields);
router.get("/:id", ctrl.getOrderById);
router.post("/:id/replace", ctrl.replaceOrder);

module.exports = router;
