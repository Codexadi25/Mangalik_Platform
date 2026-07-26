require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category.model");
const Product = require("../models/Product.model");
const CmsPage = require("../models/CmsPage.model");

const seedDatabase = async () => {
  await connectDB();

  console.log("Seeding data...");

  // 1. Clear existing sample data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await CmsPage.deleteMany({ key: "home" });

  // 2. Insert Categories
  const categoriesData = [
    { name: "Pooja Samagri Kits", slug: "pooja-samagri-kits", isActive: true },
    { name: "Hawan & Yagna Items", slug: "hawan-yagna-items", isActive: true },
    { name: "Idols & Murtis", slug: "idols-murtis", isActive: true },
    { name: "Incense & Dhoop", slug: "incense-dhoop", isActive: true },
    { name: "Festival Specials", slug: "festival-specials", isActive: true },
    { name: "Add-On Essentials", slug: "add-on-essentials", isActive: true },
  ];
  
  const createdCategories = await Category.insertMany(categoriesData);
  console.log("Categories seeded!");

  // Map category slugs to IDs
  const catMap = {};
  createdCategories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // 3. Insert Products
  const productsData = [
    // Pooja Samagri Kits
    {
      title: "Rudra Abhishek Kit",
      slug: "rudra-abhishek-kit",
      description: "Complete Rudra Abhishek Pooja Samagri Kit including Gangajal, Bhasma, Belpatra, and more.",
      shortDescription: "Complete kit for Rudra Abhishek.",
      category: catMap["pooja-samagri-kits"],
      basePrice: 1500,
      mrp: 2000,
      stock: 50,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1590076214535-373f71c4c954?auto=format&fit=crop&q=80&w=400", alt: "Pooja Kit" }]
    },
    {
      title: "Satyanarayan Pooja Kit",
      slug: "satyanarayan-pooja-kit",
      description: "All essentials for Satyanarayan Katha including panchamrit ingredients, supari, and haldi.",
      shortDescription: "Essentials for Satyanarayan Katha.",
      category: catMap["pooja-samagri-kits"],
      basePrice: 900,
      mrp: 1200,
      stock: 80,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?auto=format&fit=crop&q=80&w=400", alt: "Satyanarayan Kit" }]
    },
    {
      title: "Griha Pravesh Pooja Kit",
      slug: "griha-pravesh-kit",
      description: "Complete home-warming pooja kit including kalash, coconut, and rangoli colors.",
      shortDescription: "Home-warming pooja kit.",
      category: catMap["pooja-samagri-kits"],
      basePrice: 2200,
      mrp: 2800,
      stock: 35,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1635314787948-47702f306be3?auto=format&fit=crop&q=80&w=400", alt: "Griha Pravesh Kit" }]
    },

    // Hawan & Yagna Items
    {
      title: "Hawan Wood (Mango)",
      slug: "hawan-wood-mango",
      description: "Pure and dry mango wood (Aam ki lakdi) specially sourced for Hawan and Yagna.",
      shortDescription: "Pure mango wood for Hawan.",
      category: catMap["hawan-yagna-items"],
      basePrice: 250,
      mrp: 350,
      stock: 100,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400", alt: "Hawan Wood" }]
    },
    {
      title: "Copper Hawan Kund",
      slug: "copper-hawan-kund",
      description: "Heavy-duty pure copper Hawan Kund for performing traditional yagnas.",
      shortDescription: "Pure copper Hawan Kund.",
      category: catMap["hawan-yagna-items"],
      basePrice: 850,
      mrp: 1100,
      stock: 45,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1605296831093-b827e4fa8f21?auto=format&fit=crop&q=80&w=400", alt: "Hawan Kund" }]
    },
    {
      title: "Navagraha Samidha Set",
      slug: "navagraha-samidha-set",
      description: "Set of 9 specific holy woods required for Navagraha Shanti Hawan.",
      shortDescription: "Holy woods for Navagraha Hawan.",
      category: catMap["hawan-yagna-items"],
      basePrice: 350,
      mrp: 450,
      stock: 60,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1590076214535-373f71c4c954?auto=format&fit=crop&q=80&w=400", alt: "Navagraha Samidha" }]
    },

    // Idols & Murtis
    {
      title: "Brass Ganesha Idol",
      slug: "brass-ganesha-idol",
      description: "Beautifully handcrafted 6-inch Brass Ganesha idol for your home temple.",
      shortDescription: "Handcrafted 6-inch Brass Ganesha.",
      category: catMap["idols-murtis"],
      basePrice: 1200,
      mrp: 1800,
      stock: 20,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?auto=format&fit=crop&q=80&w=400", alt: "Ganesha Idol" }]
    },
    {
      title: "Marble Shivling with Nandi",
      slug: "marble-shivling-nandi",
      description: "Pure white Makrana marble Shivling with a small Nandi idol for daily worship.",
      shortDescription: "White marble Shivling.",
      category: catMap["idols-murtis"],
      basePrice: 2500,
      mrp: 3200,
      stock: 12,
      isActive: true,
      isApprovedByAdmin: true,
      images: [{ url: "https://images.unsplash.com/photo-1608976213797-0487428807d9?auto=format&fit=crop&q=80&w=400", alt: "Marble Shivling" }]
    },
    {
      title: "Laxmi Narayan Brass Idol",
      slug: "laxmi-narayan-brass-idol",
      description: "Detailed brass murti of Lord Vishnu and Goddess Laxmi for prosperity.",
      shortDescription: "Brass murti of Laxmi Narayan.",
      category: catMap["idols-murtis"],
      basePrice: 3200,
      mrp: 4500,
      stock: 8,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400", alt: "Laxmi Narayan Idol" }]
    },

    // Incense & Dhoop
    {
      title: "Premium Sandalwood Dhoop",
      slug: "premium-sandalwood-dhoop",
      description: "100% natural sandalwood dhoop sticks for a divine and calming atmosphere.",
      shortDescription: "Natural sandalwood dhoop sticks.",
      category: catMap["incense-dhoop"],
      basePrice: 150,
      mrp: 200,
      stock: 200,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1608976213797-0487428807d9?auto=format&fit=crop&q=80&w=400", alt: "Dhoop Sticks" }]
    },
    {
      title: "Rose Agarbatti (500g)",
      slug: "rose-agarbatti-500g",
      description: "Long-lasting sweet rose scented agarbatti hand-rolled for daily pooja.",
      shortDescription: "Sweet rose scented agarbatti.",
      category: catMap["incense-dhoop"],
      basePrice: 220,
      mrp: 300,
      stock: 150,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1635314787948-47702f306be3?auto=format&fit=crop&q=80&w=400", alt: "Rose Agarbatti" }]
    },
    {
      title: "Sambrani Cups (Box of 24)",
      slug: "sambrani-cups-24",
      description: "Pure loban sambrani cups that purify the air and create a temple-like ambiance.",
      shortDescription: "Pure loban sambrani cups.",
      category: catMap["incense-dhoop"],
      basePrice: 180,
      mrp: 250,
      stock: 250,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1605296831093-b827e4fa8f21?auto=format&fit=crop&q=80&w=400", alt: "Sambrani Cups" }]
    },

    // Festival Specials
    {
      title: "Diwali Laxmi Pooja Samagri",
      slug: "diwali-laxmi-pooja-samagri",
      description: "Comprehensive kit for Diwali Laxmi Pooja containing 45+ essential items.",
      shortDescription: "Comprehensive kit for Diwali.",
      category: catMap["festival-specials"],
      basePrice: 2500,
      mrp: 3000,
      stock: 30,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1635314787948-47702f306be3?auto=format&fit=crop&q=80&w=400", alt: "Diwali Kit" }]
    },
    {
      title: "Navratri Kalash Sthapana Kit",
      slug: "navratri-kalash-kit",
      description: "Includes earthen pot, barley seeds, chunri, and all essentials for Navratri Ghatasthapana.",
      shortDescription: "Essentials for Navratri Ghatasthapana.",
      category: catMap["festival-specials"],
      basePrice: 850,
      mrp: 1100,
      stock: 75,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1590076214535-373f71c4c954?auto=format&fit=crop&q=80&w=400", alt: "Navratri Kit" }]
    },
    {
      title: "Karwa Chauth Thali Set",
      slug: "karwa-chauth-thali-set",
      description: "Beautifully decorated steel thali, channi (sieve), and karwa (pot) for Karwa Chauth.",
      shortDescription: "Decorated thali for Karwa Chauth.",
      category: catMap["festival-specials"],
      basePrice: 650,
      mrp: 800,
      stock: 60,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?auto=format&fit=crop&q=80&w=400", alt: "Karwa Chauth Thali" }]
    },

    // Add-On Essentials
    {
      title: "Pure Cow Ghee (500ml)",
      slug: "pure-cow-ghee-500ml",
      description: "100% Pure Desi Cow Ghee for lighting diyas and offering in Hawan.",
      shortDescription: "Pure Cow Ghee for diya and hawan.",
      category: catMap["add-on-essentials"],
      basePrice: 450,
      mrp: 550,
      stock: 150,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1605296831093-b827e4fa8f21?auto=format&fit=crop&q=80&w=400", alt: "Cow Ghee" }]
    },
    {
      title: "Moli / Kalawa (Set of 10)",
      slug: "moli-kalawa-set",
      description: "Sacred red and yellow thread used in all Hindu rituals for tying on the wrist.",
      shortDescription: "Sacred red and yellow thread.",
      category: catMap["add-on-essentials"],
      basePrice: 120,
      mrp: 150,
      stock: 300,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=400", alt: "Kalawa" }]
    },
    {
      title: "Roli and Chawal Set",
      slug: "roli-chawal-set",
      description: "Premium kumkum (roli) and unbroken rice (akshat) packed in small glass jars.",
      shortDescription: "Premium kumkum and unbroken rice.",
      category: catMap["add-on-essentials"],
      basePrice: 90,
      mrp: 120,
      stock: 400,
      isActive: true,
      images: [{ url: "https://images.unsplash.com/photo-1608976213797-0487428807d9?auto=format&fit=crop&q=80&w=400", alt: "Roli Chawal" }]
    }
  ];

  await Product.insertMany(productsData);
  console.log("Products seeded!");

  // 4. Insert CMS Data for Home Page
  const homeCmsData = {
    key: "home",
    title: "Home Page",
    content: JSON.stringify({
      hero: {
        title: "A-Z Poojan Samagri,",
        subtitle: "Delivered with Devotion",
        description: "From Rudra Abhishek to Griha Pravesh — every sacred item for every ritual, sourced with purity and shipped across India."
      }
    }),
    isEnabled: true
  };

  await CmsPage.create(homeCmsData);
  console.log("CMS Home Data seeded!");

  console.log("Database seeded successfully!");
  process.exit();
};

seedDatabase().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
