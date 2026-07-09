import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEwCF0QDLKrGKFsxoCss_SXa8z8-vmoyE",
  authDomain: "bloom-1d779.firebaseapp.com",
  projectId: "bloom-1d779",
  storageBucket: "bloom-1d779.firebasestorage.app",
  messagingSenderId: "1003281001106",
  appId: "1:1003281001106:web:c3bccc2de16e49497c144b",
  measurementId: "G-RJLVEZ2MEF",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
