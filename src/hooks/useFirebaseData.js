import { useState, useEffect } from 'react';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../config/firebase';

const roundVal = (v, n = 3) => (v != null ? +v.toFixed(n) : 0);

export const useFirebaseData = () => {
  const [readings, setReadings] = useState({
    mainLine: 0, house1: 0, house2: 0, house3: 0, voltage: 0, totalPower: 0, timestamp: null
  });

  const [status, setStatus] = useState({
    batteryVoltage: 0, esp32Online: false, ip: '—', location: 'Waiting...', ssid: '—',
    theftDetected: false, uptime: 0, wifiSignal: 0, wifiStatus: 'Disconnected', lastSeen: null, noData: true
  });

  const [controls, setControls] = useState({ led: 0, relay: 1, alarm: 0 });
  const [logs, setLogs] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('checking');
  const [lastDbPing, setLastDbPing] = useState(null);

  const [calibrationState, setCalibrationState] = useState({
    isRunning: false, progress: 0, phase: '', lastCalibrated: null
  });

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubConnected = onValue(connectedRef, (snap) => {
      setDbConnected(snap.val() === true);
      setConnectionQuality(snap.val() === true ? 'good' : 'poor');
      setLastDbPing(Date.now());
    });

    // Root listener — maps to ACTUAL database structure:
    //   /houses  → { house1: number, house2: number, house3: number }
    //   /status  → { batteryVoltage, mainCurrent, esp32Online, ip, ssid, ... }
    //   /voltage → number (top-level)
    const rootRef = ref(db, '/');
    const unsubRoot = onValue(rootRef, (snap) => {
      const allData = snap.val();
      if (!allData) return;

      const statusNode = allData.status || {};
      const houses = allData.houses || {};
      const topVoltage = allData.voltage || 0;

      // Status — spread all /status fields directly
      setStatus(prev => ({
        ...prev,
        ...statusNode,
        noData: false,
        theftDetected: statusNode.theftDetected === 1 || statusNode.theftDetected === true,
        lastSeen: statusNode.esp32LastSeen || Date.now()
      }));

      // Readings — house currents from /houses, mainCurrent from /status, voltage from root
      const mainCurrent = statusNode.mainCurrent || 0;
      const batteryV = statusNode.batteryVoltage || topVoltage || 0;

      setReadings({
        mainLine: roundVal(mainCurrent),
        house1: roundVal(houses.house1 || 0),
        house2: roundVal(houses.house2 || 0),
        house3: roundVal(houses.house3 || 0),
        voltage: roundVal(batteryV, 2),
        totalPower: roundVal(mainCurrent * batteryV, 2),
        timestamp: Date.now()
      });
    });

    const unsubControls = onValue(ref(db, 'controls'), (snap) => { if (snap.val()) setControls(snap.val()); });
    const unsubLogs = onValue(ref(db, 'logs'), (snap) => {
      if (snap.val()) {
        const list = Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })).reverse();
        setLogs(list.slice(0, 50));
      }
    });

    return () => { unsubConnected(); unsubRoot(); unsubControls(); unsubLogs(); };
  }, []);

  useEffect(() => {
    const itv = setInterval(() => {
      const isOnline = status.lastSeen && (Date.now() - status.lastSeen < 12000);
      if (status.esp32Online !== isOnline) {
        setStatus(prev => ({ ...prev, esp32Online: isOnline }));
        if (!isOnline) {
          setReadings({ mainLine: 0, house1: 0, house2: 0, house3: 0, voltage: 0, totalPower: 0, timestamp: Date.now() });
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
    readings, status, controls, logs, updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing, calibrationState, runCalibration
  };
};
