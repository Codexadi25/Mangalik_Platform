const admin = require("firebase-admin");
const logger = require("../utils/logger");

/**
 * Firebase Admin SDK — verifies ID tokens issued by the frontend's
 * Firebase Auth (Google Sign-In, Email/Password, Phone OTP).
 * The backend NEVER trusts a client-supplied UID; every protected
 * request re-verifies the Firebase ID token signature & expiry.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
  logger.info("Firebase Admin SDK initialized");
}

/**
 * Verifies a Firebase ID token and returns the decoded payload.
 * Throws on invalid / expired / tampered tokens.
 */
const verifyFirebaseToken = async (idToken) => {
  return admin.auth().verifyIdToken(idToken, true); // checkRevoked = true
};

const revokeFirebaseSessions = async (uid) => {
  return admin.auth().revokeRefreshTokens(uid);
};

module.exports = { admin, verifyFirebaseToken, revokeFirebaseSessions };
