import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD_u4SAF_D8ms-dpZwkDasaOr5jPlRuHoY",
  authDomain: "smart-energyguard.firebaseapp.com",
  databaseURL: "https://smart-energyguard-default-rtdb.firebaseio.com",
  projectId: "smart-energyguard",
  storageBucket: "smart-energyguard.firebasestorage.app",
  messagingSenderId: "976323223515",
  appId: "1:976323223515:web:36c955924bbff1a9e491fe"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function initDB() {
  console.log("Connecting to Firebase...");
  try {
    await set(ref(db, '/'), {
      sensors: {
        CS1: 0.0,
        CS2: 0.0,
        CS3: 0.0,
        CS4: 0.0,
        PCS1: 0.0,
        PCS2: 0.0
      },
      status: {
        batteryVoltage: 7.4,
        esp32Online: false,
        ip: "192.168.1.100",
        ssid: "Network",
        theftDetected: 0,
        uptime: 0,
        wifiSignal: -50,
        wifiStatus: "Connected",
        esp32LastSeen: Date.now()
      },
      controls: {
        led: 0,
        relay: 1,
        alarm: 0
      },
      logs: {
        initial_log: {
          timestamp: Date.now(),
          event: "Database architecture initialized",
          level: "info"
        }
      }
    });
    console.log("✅ Database initialized successfully with all parameters!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initDB();
