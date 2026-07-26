import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

/**
 * Firebase client config. These values (apiKey etc.) are NOT
 * secret — Firebase web config is meant to be public; real
 * protection comes from Firebase Security Rules + our backend's
 * server-side ID-token verification (see backend/src/config/firebase.js).
 * Values are injected via Vite env vars at build time.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signupWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const setupRecaptcha = (containerId) =>
  new RecaptchaVerifier(auth, containerId, { size: "invisible" });

export const loginWithPhone = (phoneNumber, recaptchaVerifier) =>
  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

export const logoutFirebase = () => signOut(auth);
