const express = require("express");
const multer = require("multer");
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  serveProductImage,
} = require("../controllers/product.controller");
const { protect, authorize, optionalProtect } = require("../middleware/auth.middleware");
const { cacheRoute } = require("../middleware/cache.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

router.get("/", optionalProtect, getProducts);
router.get("/image/:id", serveProductImage);
router.get("/:slug", getProductBySlug);

router.post("/upload", protect, authorize("vendor", "admin", "superadmin"), upload.single("image"), uploadProductImage);
router.post("/", protect, authorize("vendor", "admin", "superadmin"), createProduct);
router.patch("/:id", protect, authorize("vendor", "admin", "superadmin"), updateProduct);
router.delete("/:id", protect, authorize("vendor", "admin", "superadmin"), deleteProduct);

module.exports = router;
