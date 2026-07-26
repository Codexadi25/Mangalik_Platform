require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../src/models/User.model");
const Product = require("../src/models/Product.model");
const Order = require("../src/models/Order.model");
const Vendor = require("../src/models/Vendor.model");
const SalesPartner = require("../src/models/SalesPartner.model");
const Category = require("../src/models/Category.model");
const BusinessSettings = require("../src/models/BusinessSettings.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mangalik";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Vendor.deleteMany({});
    await SalesPartner.deleteMany({});
    await Category.deleteMany({});
    await BusinessSettings.deleteMany({});

    console.log("Seeding Roles & Users...");

    const superAdmin = await User.create({
      name: "Mangalik Admin",
      email: "admin@mangalik.com",
      password: "password123",
      role: "superadmin",
      phone: "9999999999"
    });

    const rahulAdmin = await User.create({
      name: "Rahul Gupta",
      email: "Rahul.Dhanlaxmienterprises@gmail.com",
      password: "asdfghjkl",
      role: "admin",
      phone: "9876543210"
    });

    const settings = await BusinessSettings.create({
      businessName: "Mangalik",
      logoUrl: "https://example.com/mangalik-logo.png",
      supportEmail: "support@mangalik.com",
      supportPhone: "1800-MANGALIK",
      termsOfUsage: "The Business Owner agrees to the Terms of Usage and Policies of using the Software Custom Designed for them as per Indian Laws where the Software Designing Company is not liable in any type of Data breach or Business Loss because the System is completely govern and Administrated by them.",
      privacyPolicy: "We value your privacy. Developer Portal is only for Unlocking and Locking Capabilities of the System."
    });

    const vendorUser = await User.create({
      name: "Raju Pandit",
      email: "vendor@mangalik.com",
      password: "password123",
      role: "vendor",
      phone: "8888888888"
    });

    const vendorProfile = await Vendor.create({
      user: vendorUser._id,
      businessName: "Sacred Bells Emporium",
      storeDescription: "All kinds of Puja Samagri and Brass Idols.",
      contactNumber: "8888888888",
      address: { city: "Varanasi", state: "UP", country: "India" },
      status: "active"
    });

    const deliveryUser = await User.create({
      name: "Shyam Courier",
      email: "delivery@mangalik.com",
      password: "password123",
      role: "deliveryPartner",
      phone: "7777777777"
    });

    const salesPartnerUser = await User.create({
      name: "Astrologer Kashi",
      email: "sales@mangalik.com",
      password: "password123",
      role: "salesPartner",
      phone: "6666666666"
    });

    const spProfile = await SalesPartner.create({
      user: salesPartnerUser._id,
      referralCode: "KASHI108",
      commissionRate: 5
    });

    const customer1 = await User.create({
      name: "Pooja Sharma",
      email: "pooja@gmail.com",
      password: "password123",
      role: "user",
      phone: "5555555555"
    });

    const customer2 = await User.create({
      name: "Rahul Verma",
      email: "rahul@gmail.com",
      password: "password123",
      role: "user",
      phone: "4444444444"
    });

    console.log("Seeding Categories & Products...");
    const catPuja = await Category.create({ name: "Puja Samagri", slug: "puja-samagri" });
    const catIdols = await Category.create({ name: "Idols", slug: "idols" });

    const p1 = await Product.create({
      title: "Brass Puja Thali Set",
      slug: "brass-puja-thali",
      description: "Complete set with diya, bell, agarbatti stand.",
      basePrice: 1500,
      stock: 50,
      category: catPuja._id,
      vendor: vendorProfile._id,
      images: [{ url: "https://example.com/thali.jpg" }],
      isApprovedByAdmin: true
    });

    const p2 = await Product.create({
      title: "Organic Incense Sticks (100pcs)",
      slug: "organic-incense",
      description: "Sandalwood flavored pure incense sticks.",
      basePrice: 250,
      stock: 200,
      category: catPuja._id,
      vendor: vendorProfile._id,
      images: [{ url: "https://example.com/incense.jpg" }],
      isApprovedByAdmin: true
    });

    const p3 = await Product.create({
      title: "Ganesha Brass Idol (6 inch)",
      slug: "ganesha-brass-idol",
      description: "Beautifully crafted Lord Ganesha idol.",
      basePrice: 2100,
      stock: 15,
      category: catIdols._id,
      vendor: vendorProfile._id,
      images: [{ url: "https://example.com/ganesha.jpg" }],
      isApprovedByAdmin: true
    });

    console.log("Seeding Orders...");
    const order1 = await Order.create({
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      user: customer1._id,
      items: [
        {
          product: p1._id,
          title: p1.title,
          quantity: 1,
          price: p1.basePrice,
          vendor: vendorProfile._id
        },
        {
          product: p2._id,
          title: p2.title,
          quantity: 2,
          price: p2.basePrice,
          vendor: vendorProfile._id
        }
      ],
      shippingAddress: {
        fullName: "Pooja Sharma",
        phone: "5555555555",
        line1: "123 Temple Road",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001"
      },
      subtotal: 2000,
      total: 2000,
      paymentMethod: "cod",
      status: "delivered",
      statusHistory: [
        { status: "placed", changedBy: customer1._id, note: "Order placed" },
        { status: "confirmed", changedBy: vendorUser._id },
        { status: "shipped", changedBy: vendorUser._id },
        { status: "delivered", changedBy: deliveryUser._id }
      ],
      assignedDeliveryPartner: deliveryUser._id
    });

    const order2 = await Order.create({
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      user: customer2._id,
      items: [
        {
          product: p3._id,
          title: p3.title,
          quantity: 1,
          price: p3.basePrice,
          vendor: vendorProfile._id
        }
      ],
      shippingAddress: {
        fullName: "Rahul Verma",
        phone: "4444444444",
        line1: "456 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      },
      subtotal: 2100,
      total: 2100,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      status: "processing",
      salesPartnerRef: salesPartnerUser._id,
      commissionAmount: 105,
      statusHistory: [
        { status: "placed", changedBy: customer2._id, note: "Order placed via referral" },
        { status: "confirmed", changedBy: vendorUser._id }
      ],
      assignedDeliveryPartner: deliveryUser._id
    });

    console.log("Database Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
};

seedData();
