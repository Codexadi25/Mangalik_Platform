const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const logger = require("../utils/logger");

/**
 * ============================================================
 *  SECURITY MIDDLEWARE STACK
 *  Layered defence used on every request entering the API:
 *   1. Helmet            → secure HTTP headers (CSP, HSTS, etc.)
 *   2. CORS allow-list    → only known frontends may call the API
 *   3. HPP                → HTTP parameter-pollution protection
 *   4. Mongo sanitize      → strips $ and . operators (NoSQL injection)
 *   5. XSS clean          → strips malicious script payloads from input
 *   6. Compression         → gzip/br responses
 *   7. Rate limiting       → brute-force & DDoS mitigation
 *   8. Speed limiting      → progressive slow-down under load
 * ============================================================
 */

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (no origin) only in development.
    if (!origin && process.env.NODE_ENV !== "production") return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
    return callback(new Error("Not allowed by CORS policy"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
  maxAge: 600,
};

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.googletagmanager.com",
        "https://pagead2.googlesyndication.com",
        "https://www.gstatic.com",
        "https://apis.google.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https:"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.mangalik.store"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://googleads.g.doubleclick.net"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // required for some ad/embed iframes
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/** General API rate limiter — DDoS / brute-force mitigation. */
const apiLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit hit: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json(options.message);
  },
});

/** Strict limiter for auth endpoints — anti credential-stuffing / phishing fallout. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

/** Progressive slow-down for high-frequency offenders (layered with rate limiting). */
const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000,
  delayAfter: 100,
  delayMs: (hits) => hits * 100,
});

/** Applies the full hardening stack to an Express app instance. */
const applySecurityMiddleware = (app) => {
  app.use(helmetConfig);
  app.use(cors(corsOptions));
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(compression());
  app.use("/api", apiLimiter);
  app.use("/api", speedLimiter);
  app.disable("x-powered-by");
};

module.exports = {
  applySecurityMiddleware,
  authLimiter,
  corsOptions,
};
