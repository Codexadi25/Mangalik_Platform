const Product = require("../models/Product.model");
const Media = require("../models/Media.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/** GET /api/products — public storefront listing with search, filter, pagination */
const getProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 24, sort = "-createdAt", admin } = req.query;

  // When called from admin dashboard, bypass public filters
  const isAdminMode = admin === "true" && req.user && ["superadmin", "admin", "manager"].includes(req.user.role);
  const filter = isAdminMode ? {} : { isActive: true, isApprovedByAdmin: true };
  
  if (q) {
    let regex;
    try {
      regex = new RegExp(q, "i");
    } catch (e) {
      const escaped = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      regex = new RegExp(escaped, "i");
    }
    filter.$or = [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { tags: { $in: [regex] } }
    ];
  }
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

/** POST /api/products/upload - Upload a single product image to MongoDB */
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an image file.");
  }
  const media = await Media.create({
    filename: req.file.originalname,
    contentType: req.file.mimetype,
    data: req.file.buffer,
  });

  const imageUrl = `${req.protocol}://${req.get("host")}/api/products/image/${media._id}`;
  
  res.status(200).json({
    success: true,
    url: imageUrl,
    mediaId: media._id,
  });
});

/** GET /api/products/image/:id - Retrieve binary image data from MongoDB and serve it */
const serveProductImage = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) {
    throw new ApiError(404, "Image not found.");
  }
  res.set("Content-Type", media.contentType);
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.send(media.data);
});

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  serveProductImage,
};
