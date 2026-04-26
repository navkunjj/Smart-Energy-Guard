import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_u4SAF_D8ms-dpZwkDasaOr5jPlRuHoY",
  authDomain: "smart-energyguard.firebaseapp.com",
  databaseURL: "https://smart-energyguard-default-rtdb.firebaseio.com",
  projectId: "smart-energyguard",
  storageBucket: "smart-energyguard.firebasestorage.app",
  messagingSenderId: "976323223515",
  appId: "1:976323223515:web:36c955924bbff1a9e491fe",
  measurementId: "G-2ZXW5YQ5YY"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
