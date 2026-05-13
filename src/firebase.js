// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAaFiJCvxQZwIdcvHvtjV3VLb-YuMZLQxk",
  authDomain: "smart-weld-b4c44.firebaseapp.com",
  projectId: "smart-weld-b4c44",
  storageBucket: "smart-weld-b4c44.firebasestorage.app",
  messagingSenderId: "285659832607",
  appId: "1:285659832607:web:580f50d7dbca409a83102a",
  measurementId: "G-NXL6JXPQGH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export functions for auth
export { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup };