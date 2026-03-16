import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// NOTE: These are placeholder credentials. 
// The user will need to replace these with their actual Firebase config.
const firebaseConfig = {
  apiKey: "AIzaSyCsJM3gUaydTBoLPZyALTJiUkZyHR0K69g",
  authDomain: "esp32test-198b8.firebaseapp.com",
  databaseURL: "https://esp32test-198b8-default-rtdb.firebaseio.com",
  projectId: "esp32test-198b8",
  storageBucket: "esp32test-198b8.firebasestorage.app",
  messagingSenderId: "1006960615391",
  appId: "1:1006960615391:web:b40d27306e38eb47dfae6a",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
