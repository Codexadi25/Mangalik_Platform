const jwt = require("jsonwebtoken");
const { verifyFirebaseToken } = require("../config/firebase");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Issues a short-lived ACCESS token + long-lived httpOnly REFRESH cookie.
 * Access tokens are kept in memory client-side (never localStorage) to
 * reduce XSS token-theft surface; refresh tokens are httpOnly+secure+sameSite.
 */
const signTokens = (user) => {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
  return { accessToken, refreshToken };
};

// true when NODE_ENV=production but the server is on localhost (local prod testing)
const isLocalProdTest = process.env.LOCAL_PROD_TEST === "true";

const refreshCookieOptions = {
  httpOnly: true,
  // Only require HTTPS when actually deployed on the live server
  secure: process.env.NODE_ENV === "production" && !isLocalProdTest,
  // strict breaks cross-origin cookie sending from localhost → use lax for local prod test
  sameSite: process.env.NODE_ENV === "production" && !isLocalProdTest ? "strict" : "lax",
  path: "/api/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Only pin the cookie domain when on the real live server (not local testing)
if (process.env.NODE_ENV === "production" && !isLocalProdTest && process.env.COOKIE_DOMAIN) {
  refreshCookieOptions.domain = process.env.COOKIE_DOMAIN;
}

/**
 * Primary auth guard. Accepts EITHER:
 *  - A Mangalik-issued JWT access token (normal session), OR
 *  - A fresh Firebase ID token (first login / token exchange flow)
 * On success attaches `req.user` (lean, lightweight, no password hash).
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) throw new ApiError(401, "Authentication required.");

  let userId;
  let role;

  try {
    // Try as internal Mangalik JWT first.
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    userId = decoded.sub;
    role = decoded.role;
  } catch (jwtErr) {
    // Fall back to Firebase ID token (e.g. just after social/phone login).
    try {
      const decodedFirebase = await verifyFirebaseToken(token);
      const user = await User.findOne({ firebaseUid: decodedFirebase.uid });
      if (!user) throw new ApiError(401, "No Mangalik account linked to this identity.");
      userId = user._id.toString();
      role = user.role;
    } catch (fbErr) {
      throw new ApiError(401, "Invalid or expired session. Please log in again.");
    }
  }

  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(401, "Account not found.");
  if (user.isSuspended) throw new ApiError(403, "Account suspended. Contact support.");
  if (user.role !== role) throw new ApiError(401, "Session role mismatch. Please log in again.");

  req.user = user;
  next();
});

/**
 * Authorization guard factory — restricts a route to specific roles.
 * Usage: router.get('/x', protect, authorize('admin','superadmin'), handler)
 */
const authorize = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Authentication required.");
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }
    next();
  });

/**
 * Permission guard — preferred over role-name checks for fine-grained
 * control. SUPERADMIN always passes (wildcard).
 */
const requirePermission = (...permissions) =>
  asyncHandler(async (req, res, next) => {
    const { hasPermission } = require("../config/roles");
    if (!req.user) throw new ApiError(401, "Authentication required.");
    const ok = permissions.some((p) => hasPermission(req.user.role, p));
    if (!ok) throw new ApiError(403, "Insufficient permissions for this resource.");
    next();
  });

/**
 * Optional auth — attaches req.user if a valid Bearer token exists,
 * but silently continues for unauthenticated public requests.
 * Use on routes that serve both public and admin traffic.
 */
const optionalProtect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return next(); // No token — treat as public
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.sub).select("-password");
    if (user && !user.isSuspended) req.user = user;
  } catch (e) {
    // Ignore invalid token — just treat as public request
  }
  next();
});

module.exports = { protect, authorize, requirePermission, signTokens, refreshCookieOptions, optionalProtect };
