// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAB1dAbYdufzyBZSlABDDOAJm-WPwvX-0M",
  authDomain: "traversal-3303c.firebaseapp.com",
  projectId: "traversal-3303c",
  storageBucket: "traversal-3303c.firebasestorage.app",
  messagingSenderId: "947850337838",
  appId: "1:947850337838:web:fffd25e18c7b1c453d49bf",
  measurementId: "G-G5BHJHENEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);