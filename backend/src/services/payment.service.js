const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/** Creates a Razorpay order for a given amount (in INR, converted to paise). */
const createRazorpayOrder = async ({ amount, receipt, notes = {} }) => {
  return razorpayInstance.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes,
  });
};

/**
 * Verifies the HMAC-SHA256 signature returned by Razorpay's Checkout
 * callback. This is the critical anti-tampering step — NEVER trust a
 * "payment successful" message from the client without this check.
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
};

/** Verifies the signature on incoming Razorpay webhooks (server-to-server). */
const verifyWebhookSignature = (rawBody, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
};

module.exports = { razorpayInstance, createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature };
