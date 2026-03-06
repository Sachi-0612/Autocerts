// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB8ih7XzhpsOf92DKOm8lwTxbSawlVDw-0",
  authDomain: "autocerts-12f98.firebaseapp.com",
  projectId: "autocerts-12f98",
  storageBucket: "autocerts-12f98.firebasestorage.app",
  messagingSenderId: "213834601992",
  appId: "1:213834601992:web:165705b27333f664d7e3bd",
  measurementId: "G-SL6L8LC406"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;