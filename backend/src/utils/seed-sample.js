require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category.model");
const Product = require("../models/Product.model");
const User = require("../models/User.model");
const Vendor = require("../models/Vendor.model");
const { ROLES } = require("../config/roles");

const run = async () => {
  await connectDB();
  console.log("Adding Sample Data...");

  // Create a sample Vendor
  let sampleVendorUser = await User.findOne({ email: "vendor@mangalik.store" });
  if (!sampleVendorUser) {
    sampleVendorUser = await User.create({
      name: "Om Samagri Suppliers",
      email: "vendor@mangalik.store",
      role: ROLES.VENDOR,
      authProvider: "internal",
    });
  }

  let sampleVendor = await Vendor.findOne({ user: sampleVendorUser._id });
  if (!sampleVendor) {
    sampleVendor = await Vendor.create({
      user: sampleVendorUser._id,
      businessName: "Om Samagri Suppliers",
      gstin: "22AAAAA0000A1Z5",
      isApproved: true,
      bankDetails: {
        accountName: "Om Samagri",
        accountNumber: "1234567890",
        ifscCode: "SBIN0001234",
        bankName: "SBI"
      }
    });
    sampleVendorUser.vendorProfile = sampleVendor._id;
    await sampleVendorUser.save();
  }

  const categories = await Category.find();
  const getCatId = (slug) => categories.find(c => c.slug === slug)?._id;

  const sampleProducts = [
    {
      title: "Premium Rudra Abhishek Pooja Kit",
      slug: "premium-rudra-abhishek-pooja-kit",
      description: "Complete samagri required for Rudra Abhishek including Bhasma, Gangajal, and rare herbs.",
      shortDescription: "Complete kit for Rudra Abhishek",
      category: getCatId("pooja-samagri-kits"),
      vendor: sampleVendor._id,
      basePrice: 1500,
      mrp: 2000,
      stock: 50,
      images: [{ url: "https://images.unsplash.com/photo-1594240722302-3c4ba73c4f74?q=80&w=800&auto=format&fit=crop", alt: "Rudra Abhishek" }],
      isActive: true,
      isFeatured: true,
      isApprovedByAdmin: true,
    },
    {
      title: "Pure Sandalwood Hawan Samagri",
      slug: "pure-sandalwood-hawan-samagri",
      description: "100% natural and pure sandalwood hawan samagri for home peace and prosperity.",
      shortDescription: "Pure sandalwood hawan samagri",
      category: getCatId("hawan-yagna-items"),
      vendor: sampleVendor._id,
      basePrice: 450,
      mrp: 600,
      stock: 100,
      images: [{ url: "https://images.unsplash.com/photo-1605342410385-bd3513a968bd?q=80&w=800&auto=format&fit=crop", alt: "Hawan Samagri" }],
      isActive: true,
      isApprovedByAdmin: true,
    },
    {
      title: "Brass Ganesha Murti (6 inch)",
      slug: "brass-ganesha-murti-6-inch",
      description: "Beautifully handcrafted 6-inch brass Ganesha idol for your home temple.",
      shortDescription: "6-inch Brass Ganesha Idol",
      category: getCatId("idols-murtis"),
      vendor: sampleVendor._id,
      basePrice: 1200,
      mrp: 1500,
      stock: 20,
      images: [{ url: "https://images.unsplash.com/photo-1621361546258-29be19001140?q=80&w=800&auto=format&fit=crop", alt: "Ganesha Idol" }],
      isActive: true,
      isFeatured: true,
      isApprovedByAdmin: true,
    },
    {
      title: "Organic Rose Dhoop Cones",
      slug: "organic-rose-dhoop-cones",
      description: "Charcoal-free organic rose scented dhoop cones. Long lasting fragrance.",
      shortDescription: "Charcoal-free rose dhoop",
      category: getCatId("incense-dhoop"),
      vendor: sampleVendor._id,
      basePrice: 150,
      mrp: 200,
      stock: 200,
      images: [{ url: "https://images.unsplash.com/photo-1598918239082-01966a3fb9fc?q=80&w=800&auto=format&fit=crop", alt: "Dhoop Cones" }],
      isActive: true,
      isApprovedByAdmin: true,
    },
    {
      title: "Diwali Special Laxmi Pooja Kit",
      slug: "diwali-special-laxmi-pooja-kit",
      description: "Everything you need for Diwali night Laxmi Pooja, carefully packed.",
      shortDescription: "Diwali Laxmi Pooja Kit",
      category: getCatId("festival-specials"),
      vendor: sampleVendor._id,
      basePrice: 850,
      mrp: 1200,
      stock: 0,
      images: [{ url: "https://images.unsplash.com/photo-1603823467664-839cc194fcab?q=80&w=800&auto=format&fit=crop", alt: "Diwali Kit" }],
      isActive: true,
      isApprovedByAdmin: true,
    },
    {
      title: "Sacred Kalawa (Moli) Pack of 5",
      slug: "sacred-kalawa-moli-pack",
      description: "Pure cotton holy red/yellow thread (Kalawa/Moli) for tying on wrist.",
      shortDescription: "Pack of 5 cotton Kalawa",
      category: getCatId("add-on-essentials"),
      vendor: sampleVendor._id,
      basePrice: 50,
      mrp: 100,
      stock: 500,
      isAddOnOnly: true,
      images: [{ url: "https://images.unsplash.com/photo-1596706913575-b46761005fbc?q=80&w=800&auto=format&fit=crop", alt: "Kalawa" }],
      isActive: true,
      isApprovedByAdmin: true,
    }
  ];

  for (const prod of sampleProducts) {
    if (!prod.category) continue;
    await Product.findOneAndUpdate({ slug: prod.slug }, prod, { upsert: true });
  }

  console.log("✔ Sample Products and Vendor seeded.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
