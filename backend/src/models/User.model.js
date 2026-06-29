const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/roles");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
    },
    password: { type: String, minlength: 8, select: false }, // only used for legacy/email-password fallback
    firebaseUid: { type: String, unique: true, sparse: true, index: true },
    authProvider: {
      type: String,
      enum: ["password", "google.com", "phone", "internal"],
      default: "password",
    },
    photoURL: String,
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    // Scope references for staff-type roles
    vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    salesPartnerProfile: { type: mongoose.Schema.Types.ObjectId, ref: "SalesPartner" },
    deliveryZone: String,

    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,

    lastLoginAt: Date,
    lastLoginIp: String,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model("User", userSchema);
