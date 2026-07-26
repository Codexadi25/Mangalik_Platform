const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyFirebaseToken } = require("../config/firebase");
const { signTokens, refreshCookieOptions } = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken");

/**
 * POST /api/auth/firebase-login
 * Body: { idToken }
 * Flow: client authenticates with Firebase (Google / Email-Password /
 * Phone-OTP), then exchanges the resulting Firebase ID token here for
 * a Mangalik session (access + refresh JWT). Creates the User document
 * on first login ("sign-up on first sign-in" pattern).
 */
const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError(400, "idToken is required.");

  let decoded;
  if (idToken.startsWith("DEV_MOCK_TOKEN_") && process.env.NODE_ENV === "development") {
    const email = idToken.replace("DEV_MOCK_TOKEN_", "");
    decoded = { uid: `mock-uid-${email}`, email, email_verified: true, name: "Test User" };
  } else {
    decoded = await verifyFirebaseToken(idToken);
  }

  let user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user && decoded.email) {
    user = await User.findOne({ email: decoded.email });
    if (user) {
      user.firebaseUid = decoded.uid;
      await user.save();
    }
  }

  if (!user) {
    let referredByVendor = null;
    if (req.body.referralCode) {
      const Vendor = require("../models/Vendor.model");
      const matchedVendor = await Vendor.findOne({ referralCode: req.body.referralCode.toUpperCase() });
      if (matchedVendor) {
        referredByVendor = matchedVendor._id;
      }
    }

    user = await User.create({
      name: decoded.name || decoded.email?.split("@")[0] || "Mangalik User",
      email: decoded.email,
      phone: decoded.phone_number,
      firebaseUid: decoded.uid,
      photoURL: decoded.picture,
      authProvider: decoded.firebase?.sign_in_provider || "password",
      isEmailVerified: !!decoded.email_verified,
      isPhoneVerified: !!decoded.phone_number,
      referredByVendor,
    });
  }

  if (user.isSuspended) throw new ApiError(403, "Your account has been suspended. Contact support.");

  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  const { accessToken, refreshToken } = signTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photoURL: user.photoURL,
      },
    },
  });
});

/**
 * POST /api/auth/local-register
 * Fallback local registration (when Firebase is down).
 */
const localRegister = asyncHandler(async (req, res) => {
  const { name, identifier, password } = req.body;
  if (!name || !identifier || !password) throw new ApiError(400, "Name, email/phone, and password are required.");

  const isPhone = /^\+?[0-9]{10,15}$/.test(identifier);
  const email = isPhone ? undefined : identifier.toLowerCase().trim();
  const phone = isPhone ? identifier : undefined;

  let user = await User.findOne(isPhone ? { phone } : { email });
  if (user) throw new ApiError(400, isPhone ? "Phone number already in use." : "Email already in use.");

  let referredByVendor = null;
  if (req.body.referralCode) {
    const Vendor = require("../models/Vendor.model");
    const matchedVendor = await Vendor.findOne({ referralCode: req.body.referralCode.toUpperCase() });
    if (matchedVendor) {
      referredByVendor = matchedVendor._id;
    }
  }

  user = await User.create({
    name,
    email,
    phone,
    password, // Mongoose pre-save hook will hash this
    authProvider: "password",
    referredByVendor,
  });

  const { accessToken, refreshToken } = signTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});

/**
 * POST /api/auth/local-login
 * Fallback local login (when Firebase is down).
 */
const localLogin = asyncHandler(async (req, res) => {
  // We destructure email as fallback for backwards compatibility from frontend
  const { identifier, email: fallbackEmail, password } = req.body;
  const loginId = identifier || fallbackEmail;

  if (!loginId || !password) throw new ApiError(400, "Identifier (email or phone) and password are required.");

  const isPhone = /^\+?[0-9]{10,15}$/.test(loginId);
  const query = isPhone ? { phone: loginId } : { email: loginId.toLowerCase().trim() };

  const user = await User.findOne(query).select("+password");
  if (!user || !user.password) {
    console.log(`Failed login for ${loginId}: User not found or no password`);
    throw new ApiError(401, "Invalid credentials or account uses social login.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log(`Failed login for ${loginId}: Password mismatch.`);
    throw new ApiError(401, "Invalid credentials.");
  }

  if (user.isSuspended) throw new ApiError(403, "Your account has been suspended. Contact support.");

  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  const { accessToken, refreshToken: newRefresh } = signTokens(user);
  res.cookie("refreshToken", newRefresh, refreshCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      accessToken,
      refreshToken: newRefresh,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      },
    },
  });
});

/** POST /api/auth/refresh — rotates the access token using the httpOnly refresh cookie. */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];
  if (!token) throw new ApiError(401, "No refresh token provided.");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.isSuspended) throw new ApiError(401, "Session invalid.");

  const { accessToken, refreshToken: newRefresh } = signTokens(user);
  res.cookie("refreshToken", newRefresh, refreshCookieOptions);
  res.status(200).json({ success: true, data: { accessToken } });
});

/** POST /api/auth/logout */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.status(200).json({ success: true, message: "Logged out." });
});

/** GET /api/auth/me */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "category" }
  });
  res.status(200).json({ success: true, data: user });
});

module.exports = { firebaseLogin, localRegister, localLogin, refreshToken, logout, getMe };
