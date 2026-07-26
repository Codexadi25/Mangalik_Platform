const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

const { applySecurityMiddleware } = require("./middleware/security.middleware");
const { enforceGlobalKillSwitch } = require("./middleware/platformControl.middleware");
const { notFound, errorHandler } = require("./middleware/errorHandler.middleware");
const logger = require("./utils/logger");

const app = express();

app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// --- Core parsers ---
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// --- View Engine Setup ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// --- Security hardening stack (helmet, cors, hpp, sanitize, xss, compression, rate-limit) ---
applySecurityMiddleware(app);

// --- Real-time Network Monitoring ---
const { networkMonitor } = require('./middleware/networkMonitor.middleware');
app.use(networkMonitor);

// --- Request logging ---
app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => process.env.NODE_ENV === "test" || req.originalUrl.includes("/server-dashboard/metrics") || req.originalUrl.includes("/network-metrics"),
  })
);

// --- Health check (always reachable, bypasses kill-switch, used by load balancers) ---
app.get(["/health", "/api/health"], (req, res) => res.status(200).json({ status: "ok", service: "mangalik-api" }));

// --- Superadmin platform-wide kill-switch enforcement ---
// Auth routes must remain accessible so the superadmin can actually log in!
app.use("/api/auth", require("./routes/auth.routes"));

const { defenderGuard } = require("./middleware/defender.middleware");
app.use("/api", defenderGuard);

app.use("/api", enforceGlobalKillSwitch);

// --- Route mounting: single unified Express backend serving BOTH frontends ---
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/defender", require("./routes/defender.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/cms", require("./routes/cms.routes"));
app.use("/api/ads", require("./routes/ads.routes"));
app.use("/api/vendors", require("./routes/vendor.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/sales-partners", require("./routes/salesPartner.routes"));
app.use("/api/support", require("./routes/support.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/superadmin", require("./routes/superadmin.routes"));
app.use("/api/business-settings", require("./routes/businessSettings.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));

// --- Server Management (EJS) Routes (Superadmin only) ---
app.use("/admin", require("./routes/serverAdmin.routes"));

// Redirect root to the server dashboard
app.get("/", (req, res) => res.redirect("/admin/server-dashboard"));

// --- 404 + global error handler ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
