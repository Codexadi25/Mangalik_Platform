const admin = require("firebase-admin");
const logger = require("../utils/logger");

/**
 * Firebase Admin SDK — verifies ID tokens issued by the frontend's
 * Firebase Auth (Google Sign-In, Email/Password, Phone OTP).
 * The backend NEVER trusts a client-supplied UID; every protected
 * request re-verifies the Firebase ID token signature & expiry.
 */
if (!admin.apps.length) {
  try {
    const pKey = process.env.FIREBASE_PRIVATE_KEY || "";
    const isDummy = !pKey || pKey.includes("...") || pKey.includes("xxxxxx") || pKey.length < 100;
    
    if (isDummy) {
      logger.info("Firebase Admin SDK: Skip initialization (using placeholder credentials)");
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: pKey.replace(/"/g, "").replace(/\\n/g, "\n"),
        }),
      });
      logger.info("Firebase Admin SDK initialized");
    }
  } catch (error) {
    logger.warn("Firebase Admin SDK failed to initialize: " + error.message);
  }
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
