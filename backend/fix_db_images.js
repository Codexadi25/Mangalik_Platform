require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const productImgMap = {
  "Sacred Kalawa (Moli) Pack of 5": "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=400&q=80",
  "Diwali Special Laxmi Pooja Kit": "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=400&q=80",
  "Organic Rose Dhoop Cones": "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=400&q=80",
  "Pure Sandalwood Hawan Samagri": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
  "Premium Rudra Abhishek Pooja Kit": "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=400&q=80"
};

const ProductSchema = new mongoose.Schema({
  title: String,
  images: [{ url: String, alt: String }]
}, { collection: 'products' });

const Product = mongoose.model('Product', ProductSchema);

async function run() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not found in env!");
    process.exit(1);
  }
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully.");

  const products = await Product.find({});
  console.log(`Found ${products.length} products.`);

  for (const p of products) {
    if (productImgMap[p.title]) {
      console.log(`Updating product: "${p.title}"`);
      p.images = [{
        url: productImgMap[p.title],
        alt: p.title
      }];
      await p.save();
      console.log(`Updated.`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(console.error);
