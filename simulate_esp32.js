import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, serverTimestamp } from "firebase/database";

const config = {
  apiKey: "AIzaSyD_u4SAF_D8ms-dpZwkDasaOr5jPlRuHoY",
  databaseURL: "https://smart-energyguard-default-rtdb.firebaseio.com",
  projectId: "smart-energyguard"
};

const app = initializeApp(config);
const db = getDatabase(app);

console.log("Starting ESP32 Hardware Simulator...");
console.log("Pushing live mock data to Firebase every 2 seconds...");

let tick = 0;

setInterval(() => {
  tick++;
  
  // Fluctuate loads slightly
  const cs1 = 3.0 + (Math.sin(tick * 0.1) * 0.5);
  const cs2 = 2.5 + (Math.cos(tick * 0.15) * 0.3);
  const cs3 = 4.0 + (Math.sin(tick * 0.05) * 0.8);
  
  // Every 20 seconds, simulate a theft event for 5 seconds
  const isTheft = (tick % 20) > 15;
  const theftAmt = isTheft ? 2.5 : 0;
  
  const pcs1 = cs1 + cs2 + (isTheft ? 1.2 : 0); // Theft on pole 1
  const pcs2 = cs3 + (isTheft ? 1.3 : 0);       // Theft on pole 2
  const main = pcs1 + pcs2 + theftAmt;

  update(ref(db, '/'), {
    "sensors/house/CS1": cs1,
    "sensors/house/CS2": cs2,
    "sensors/house/CS3": cs3,
    "sensors/poles/PCS1": pcs1,
    "sensors/poles/PCS2": pcs2,
    "sensors/main/MCS": main,
    "status/isOnline": true,
    "status/lastSeen": serverTimestamp(),
    "status/batteryVoltage": 12.2 + Math.random() * 0.1,
    "status/wifiSignal": -45 - Math.floor(Math.random() * 5),
    "status/theftDetected": isTheft,
    "status/theftStatus": isTheft ? "CRITICAL: Power Theft Detected!" : "System Normal"
  }).then(() => {
    console.log(`[Tick ${tick}] Data pushed (Theft Active: ${isTheft})`);
  }).catch(e => console.error(e));

}, 2000);
