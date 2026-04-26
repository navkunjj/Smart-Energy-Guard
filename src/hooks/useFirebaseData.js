import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';
import { detectTheft } from '../utils/theftDetection';

const roundVal = (v, n = 3) => (v != null ? +Number(v).toFixed(n) : 0);

export const useFirebaseData = () => {
  const [readings, setReadings] = useState({
    CS1: 0, CS2: 0, CS3: 0, CS4: 0, PCS1: 0, PCS2: 0,
    voltage: 0, totalPower: 0, timestamp: null,
  });

  const [theft, setTheft] = useState({
    mainTheft: false, pole1Theft: false, pole2Theft: false, anyTheft: false, details: [],
  });

  const [status, setStatus] = useState({
    batteryVoltage: 0, esp32Online: false, ip: '—', location: 'Waiting...', ssid: '—',
    theftDetected: false, uptime: 0, wifiSignal: 0, wifiStatus: 'Disconnected',
    lastSeen: null, noData: true, sensorStatus: 'Inactive',
  });

  const [controls, setControls] = useState({ led: 0, relay: 1, alarm: 0 });
  const [logs, setLogs] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('checking');
  const [lastDbPing, setLastDbPing] = useState(null);

  const [calibrationState, setCalibrationState] = useState({
    isRunning: false, progress: 0, phase: '', lastCalibrated: null,
  });

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubConnected = onValue(connectedRef, (snap) => {
      setDbConnected(snap.val() === true);
      setConnectionQuality(snap.val() === true ? 'good' : 'poor');
      setLastDbPing(Date.now());
    });

    // ── Root listener ────────────────────────────────────────────────────
    // Maps to ACTUAL database structure:
    //   /sensors → { CS1, CS2, CS3, CS4, PCS1, PCS2 }
    //   /status  → { batteryVoltage, esp32Online, ip, ssid, … }
    //   /voltage → number (top-level, optional fallback)
    //
    // Backwards-compat: also checks /houses for old keys (house1→CS1 etc.)
    const rootRef = ref(db, '/');
    const unsubRoot = onValue(rootRef, (snap) => {
      const allData = snap.val();
      if (!allData) return;

      const statusNode  = allData.status  || {};
      const sensorsNode = allData.sensors || {};
      const housesNode  = allData.houses  || {};
      const topVoltage  = allData.voltage || 0;

      // ── Status ─────────────────────────────────────────────────
      setStatus(prev => ({
        ...prev,
        ...statusNode,
        noData: false,
        theftDetected: statusNode.theftDetected === 1 || statusNode.theftDetected === true,
        lastSeen: statusNode.esp32LastSeen || Date.now(),
      }));

      // ── Sensor readings (prefer /sensors, fallback to /houses) ─
      const CS1  = roundVal(sensorsNode.CS1  ?? housesNode.house1 ?? 0);
      const CS2  = roundVal(sensorsNode.CS2  ?? housesNode.house2 ?? 0);
      const CS3  = roundVal(sensorsNode.CS3  ?? housesNode.house3 ?? 0);
      const CS4  = roundVal(sensorsNode.CS4  ?? statusNode.mainCurrent ?? 0);
      const PCS1 = roundVal(sensorsNode.PCS1 ?? 0);
      const PCS2 = roundVal(sensorsNode.PCS2 ?? 0);

      const batteryV = statusNode.batteryVoltage || topVoltage || 0;

      const newReadings = {
        CS1, CS2, CS3, CS4, PCS1, PCS2,
        voltage: roundVal(batteryV, 2),
        totalPower: roundVal(CS4 * batteryV, 2),
        timestamp: Date.now(),
      };

      setReadings(newReadings);

      // ── Client-side theft detection ────────────────────────────
      setTheft(detectTheft(newReadings));
    });

    const unsubControls = onValue(ref(db, 'controls'), (snap) => {
      if (snap.val()) setControls(snap.val());
    });

    const unsubLogs = onValue(ref(db, 'logs'), (snap) => {
      if (snap.val()) {
        const list = Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })).reverse();
        setLogs(list.slice(0, 50));
      }
    });

    return () => { unsubConnected(); unsubRoot(); unsubControls(); unsubLogs(); };
  }, []);

  // ── Offline heartbeat ──────────────────────────────────────────────────
  useEffect(() => {
    const itv = setInterval(() => {
      const isOnline = status.lastSeen && (Date.now() - status.lastSeen < 12000);
      if (status.esp32Online !== isOnline) {
        setStatus(prev => ({ ...prev, esp32Online: isOnline }));
        if (!isOnline) {
          // Force database update to sync offline state globally
          set(ref(db, 'status/esp32Online'), false);

          setReadings({
            CS1: 0, CS2: 0, CS3: 0, CS4: 0, PCS1: 0, PCS2: 0,
            voltage: 0, totalPower: 0, timestamp: Date.now(),
          });
          setTheft({ mainTheft: false, pole1Theft: false, pole2Theft: false, anyTheft: false, details: [] });
          setStatus(prev => ({
            ...prev,
            esp32Online: false,
            batteryVoltage: 0,
            wifiSignal: 0,
            uptime: 0,
            wifiStatus: 'Disconnected',
            sensorStatus: 'Inactive',
            firebaseStatus: 'Disconnected',
            theftDetected: false,
          }));
        }
      }
    }, 5000);
    return () => clearInterval(itv);
  }, [status.lastSeen]);

  const updateControl = (device, value) => { set(ref(db, `controls/${device}`), value ? 1 : 0); };
  const resetSystem = () => { set(ref(db, 'status/theftDetected'), 0); };

  const runCalibration = () => {
    setCalibrationState({ isRunning: true, progress: 0, phase: 'sampling' });
    setTimeout(() => setCalibrationState({ isRunning: false, progress: 100, phase: 'done' }), 2000);
  };

  return {
    readings, theft, status, controls, logs, updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing, calibrationState, runCalibration,
  };
};
