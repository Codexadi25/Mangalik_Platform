/**
 * One-time seed script: creates the initial PlatformSettings singleton,
 * default CMS pages, root product categories, and a SUPERADMIN account
 * for Aditya Tech & Devoops (the platform owner/dev team).
 * Run: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const PlatformSettings = require("../models/PlatformSettings.model");
const CmsPage = require("../models/CmsPage.model");
const Category = require("../models/Category.model");
const User = require("../models/User.model");
const { ROLES } = require("../config/roles");

const defaultCmsPages = [
  { key: "terms_and_conditions", title: "Terms & Conditions", content: "<p>Content to be finalized.</p>" },
  { key: "privacy_policy", title: "Privacy Policy", content: "<p>Content to be finalized.</p>" },
  { key: "refund_policy", title: "Refund & Cancellation Policy", content: "<p>Content to be finalized.</p>" },
  { key: "shipping_policy", title: "Shipping Policy", content: "<p>Content to be finalized.</p>" },
  { key: "about_us", title: "About Mangalik", content: "<p>Mangalik provides A-Z poojan samagri for every Hindu ritual, yagna, and hawan.</p>" },
  { key: "contact_us", title: "Contact Us", content: "<p>Reach us at support@mangalik.store</p>" },
  { key: "help_support", title: "Help & Support", content: "<p>Browse our FAQs or raise a support ticket.</p>" },
  {
    key: "faqs",
    title: "Frequently Asked Questions",
    faqItems: [
      { question: "What is Mangalik?", answer: "Mangalik is an online platform offering A-Z poojan samagri for every kind of pooja, yagna, and hawan.", order: 1 },
      { question: "Do you offer Cash on Delivery?", answer: "Yes, COD is available on eligible orders.", order: 2 },
      { question: "How can I track my order?", answer: "Use the Track Order page with your order number, or check your account's Orders section.", order: 3 },
    ],
  },
];

const rootCategories = [
  { name: "Pooja Samagri Kits", slug: "pooja-samagri-kits" },
  { name: "Hawan & Yagna Items", slug: "hawan-yagna-items" },
  { name: "Idols & Murtis", slug: "idols-murtis" },
  { name: "Incense & Dhoop", slug: "incense-dhoop" },
  { name: "Festival Specials", slug: "festival-specials" },
  { name: "Add-On Essentials", slug: "add-on-essentials" }, // Kalawa, Bhaan, Dhatura, Mishri, Batasha, etc.
];

const run = async () => {
  await connectDB();

  await PlatformSettings.findOneAndUpdate({}, {}, { upsert: true });
  console.log("✔ PlatformSettings singleton ensured.");

  for (const page of defaultCmsPages) {
    await CmsPage.findOneAndUpdate({ key: page.key }, page, { upsert: true });
  }
  console.log("✔ Default CMS pages seeded.");

  for (const cat of rootCategories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log("✔ Root categories seeded.");

  const superadminEmail = process.env.SUPERADMIN_MASTER_EMAIL;
  if (superadminEmail) {
    await User.findOneAndUpdate(
      { email: superadminEmail },
      { name: "Aditya Tech & Devoops", email: superadminEmail, role: ROLES.SUPERADMIN, authProvider: "internal" },
      { upsert: true }
    );
    console.log(`✔ Superadmin ensured for ${superadminEmail}`);
  }

  console.log("\nSeed complete.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
