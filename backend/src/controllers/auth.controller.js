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
    user = await User.create({
      name: decoded.name || decoded.email?.split("@")[0] || "Mangalik User",
      email: decoded.email,
      phone: decoded.phone_number,
      firebaseUid: decoded.uid,
      photoURL: decoded.picture,
      authProvider: decoded.firebase?.sign_in_provider || "password",
      isEmailVerified: !!decoded.email_verified,
      isPhoneVerified: !!decoded.phone_number,
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
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email, and password are required.");

  let user = await User.findOne({ email });
  if (user) throw new ApiError(400, "Email already in use.");

  user = await User.create({
    name,
    email,
    password, // Mongoose pre-save hook will hash this
    authProvider: "password",
  });

  const { accessToken, refreshToken } = signTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !user.password) {
    console.log(`Failed login for ${email}: User not found or no password`);
    throw new ApiError(401, "Invalid credentials or account uses social login.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log(`Failed login for ${email}: Password mismatch. Received password length: ${password.length}`);
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
  const token = req.cookies?.refreshToken;
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
  res.status(200).json({ success: true, data: req.user });
});

module.exports = { firebaseLogin, localRegister, localLogin, refreshToken, logout, getMe };
