const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/** GET /api/products — public storefront listing with search, filter, pagination */
const getProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 24, sort = "-createdAt" } = req.query;

  const filter = { isActive: true, isApprovedByAdmin: true };
  if (q) filter.$text = { $search: q };
  if (category) {
    const CategoryModel = require("../models/Category.model");
    const cat = await CategoryModel.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else return res.status(200).json({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0 } });
  }
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

/** GET /api/products/:slug — single product with populated add-ons */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate("category", "name slug")
    .populate("addOns.product", "title basePrice images stock")
    .lean();

  if (!product) throw new ApiError(404, "Product not found.");
  res.status(200).json({ success: true, data: product });
});

/** POST /api/products — vendor/admin/superadmin create product */
const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user._id };

  // Vendors' products require admin approval before going live.
  if (req.user.role === "vendor") {
    payload.vendor = req.user.vendorProfile;
    payload.isApprovedByAdmin = false;
  } else {
    payload.isApprovedByAdmin = true;
  }

  const product = await Product.create(payload);
  res.status(201).json({ success: true, data: product });
});

/** PATCH /api/products/:id */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  if (req.user.role === "vendor" && String(product.vendor) !== String(req.user.vendorProfile)) {
    throw new ApiError(403, "You can only edit your own products.");
  }

  Object.assign(product, req.body);
  await product.save();
  res.status(200).json({ success: true, data: product });
});

/** DELETE /api/products/:id */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");
  if (req.user.role === "vendor" && String(product.vendor) !== String(req.user.vendorProfile)) {
    throw new ApiError(403, "You can only delete your own products.");
  }
  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product removed." });
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
