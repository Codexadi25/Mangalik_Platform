const CryptoJS = require("crypto-js");

/**
 * AES-256 encryption helpers for sensitive at-rest fields
 * (bank account numbers, IFSC, UPI IDs, Razorpay webhook payload
 * caching, etc.) — defence-in-depth beyond MongoDB's own
 * encryption-at-rest on Atlas.
 */
const SECRET = process.env.ENCRYPTION_SECRET_KEY || "fallback_dev_key_change_me";

const encrypt = (plainText) => CryptoJS.AES.encrypt(plainText, SECRET).toString();

const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
