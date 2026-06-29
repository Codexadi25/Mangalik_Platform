const mongoose = require("mongoose");

/**
 * Add-on schema — represents items like Kalawa, Bhaan, Dhatura, Flowers,
 * Panchamrit Samagri, Charna Amrit Samagri, Mishri, Batasha, etc. that
 * customers can attach to a primary product (e.g. "Rudra Abhishek
 * Poojan Samagri Kit"). Add-ons are themselves lightweight catalog
 * entries with their own price/stock so they can also sell standalone.
 */
const addOnRefSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    isDefaultIncluded: { type: Boolean, default: false }, // bundled free with base product
    maxQuantity: { type: Number, default: 5 },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    name: String, // e.g. "250g", "500g", "1kg"
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 300 },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: String, lowercase: true, trim: true }],

    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },

    images: [{ url: String, alt: String }],

    basePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    gstPercent: { type: Number, default: 5 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },

    variants: [variantSchema],
    addOns: [addOnRefSchema], // available add-ons for this product
    isAddOnOnly: { type: Boolean, default: false }, // true for items like Kalawa sold mainly as add-ons

    poojaTypes: [{ type: String, trim: true }], // e.g. ["Rudra Abhishek", "Satyanarayan Katha", "Griha Pravesh"]

    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String,
      keywords: [String],
    },

    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true }, // can be force-disabled by admin/superadmin
    isFeatured: { type: Boolean, default: false },
    isApprovedByAdmin: { type: Boolean, default: false }, // vendor-submitted products need approval

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1, isFeatured: -1 });

module.exports = mongoose.model("Product", productSchema);
