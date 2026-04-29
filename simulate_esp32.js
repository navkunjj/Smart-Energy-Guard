import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, remove, get, serverTimestamp } from "firebase/database";

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

// Trim history entries older than 10 minutes
const trimHistory = async () => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  const snap = await get(ref(db, 'history'));
  if (!snap.exists()) return;
  const updates = {};
  snap.forEach(child => {
    if (Number(child.key) < cutoff) updates[`history/${child.key}`] = null;
  });
  if (Object.keys(updates).length) update(ref(db, '/'), updates);
};

setInterval(() => {
  tick++;

  // Fluctuate loads slightly
  // Pole 1: 1 house (CS1)
  // Pole 2: 2 houses (CS2, CS3)
  const cs1 = 3.0 + (Math.sin(tick * 0.1) * 0.5);
  const cs2 = 2.5 + (Math.cos(tick * 0.15) * 0.3);
  const cs3 = 4.0 + (Math.sin(tick * 0.05) * 0.8);

  // Every 20 ticks, simulate a theft event for 5 ticks
  const isTheft = (tick % 20) > 15;
  const theftAmt = isTheft ? 2.5 : 0;

  // Pole 1 = House 1 only; Pole 2 = House 2 + House 3
  const pcs1 = cs1 + (isTheft ? 1.2 : 0);        // Pole 1 — 1 house
  const pcs2 = cs2 + cs3 + (isTheft ? 1.3 : 0);  // Pole 2 — 2 houses
  const main = pcs1 + pcs2 + theftAmt;

  const payload = {
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
    "status/theftStatus": isTheft ? "CRITICAL: Power Theft Detected!" : "System Normal",
  };

  // Write a history snapshot every 5 ticks (~10 seconds)
  if (tick % 5 === 0) {
    const ts = Date.now();
    payload[`history/${ts}/CS1`]  = +cs1.toFixed(3);
    payload[`history/${ts}/CS2`]  = +cs2.toFixed(3);
    payload[`history/${ts}/CS3`]  = +cs3.toFixed(3);
    payload[`history/${ts}/PCS1`] = +pcs1.toFixed(3);
    payload[`history/${ts}/PCS2`] = +pcs2.toFixed(3);
    payload[`history/${ts}/MCS`]  = +main.toFixed(3);
    trimHistory();
  }

  update(ref(db, '/'), payload)
    .then(() => console.log(`[Tick ${tick}] pushed | PCS1=${pcs1.toFixed(2)} PCS2=${pcs2.toFixed(2)} Main=${main.toFixed(2)} Theft=${isTheft}`))
    .catch(e => console.error(e));

}, 2000);
