const express = require("express");
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

router.post("/", protect, authorize("vendor", "admin", "superadmin"), createProduct);
router.patch("/:id", protect, authorize("vendor", "admin", "superadmin"), updateProduct);
router.delete("/:id", protect, authorize("vendor", "admin", "superadmin"), deleteProduct);

module.exports = router;
