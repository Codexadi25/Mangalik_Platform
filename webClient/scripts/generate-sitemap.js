import fs from "fs";
import path from "path";
import axios from "axios";

// This script should be run during the build process to generate an up-to-date sitemap
// e.g., node scripts/generate-sitemap.js

const BASE_URL = "https://www.mangalik.store";
const API_URL = "http://localhost:5000/api";

const STATIC_ROUTES = [
  "/",
  "/products",
  "/about",
  "/contact",
  "/help-support",
  "/faqs",
  "/terms-and-conditions",
  "/privacy-policy",
  "/refund-policy",
  "/shipping-policy",
];

const generateSitemap = async () => {
  try {
    console.log("Fetching products for sitemap...");
    const { data } = await axios.get(`${API_URL}/products?limit=1000`);
    const products = data.data;

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static routes
    for (const route of STATIC_ROUTES) {
      sitemap += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>
`;
    }

    // Add product routes
    for (const product of products) {
      if (product.isActive && product.isApprovedByAdmin) {
        sitemap += `  <url>
    <loc>${BASE_URL}/products/${product.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    const destPath = path.resolve(process.cwd(), "public/sitemap.xml");
    fs.writeFileSync(destPath, sitemap);
    console.log(`Sitemap generated successfully at ${destPath}`);
  } catch (error) {
    console.error("Failed to generate sitemap:", error.message);
    // Do not crash the build if API is down, just write the static map
  }
};

generateSitemap();
