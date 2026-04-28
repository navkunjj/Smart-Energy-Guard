import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';
import { detectTheft } from '../utils/theftDetection';

const roundVal = (v, n = 3) => (v != null ? +Number(v).toFixed(n) : 0);

export const useFirebaseData = (options = {}) => {
  const { tolerance = 0.2 } = options;
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
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubConnected = onValue(connectedRef, (snap) => {
      setDbConnected(snap.val() === true);
      setConnectionQuality(snap.val() === true ? 'good' : 'poor');
      setLastDbPing(Date.now());
    });

    // ── Root listener ────────────────────────────────────────────────────
    // Maps to ACTUAL database structure:
    //   /sensors → { house, poles, main }
    //   /status  → { voltage, batteryVoltage, ip, ssid, … }
    //   /history → { … }
    const rootRef = ref(db, '/');
    const unsubRoot = onValue(rootRef, (snap) => {
      const allData = snap.val();
      if (!allData) return;

      const statusNode = allData.status || {};
      const sensorsNode = allData.sensors || {};
      const rawHistory = allData.history || {};

      // ── Status ─────────────────────────────────────────────────
      setStatus(prev => ({
        ...prev,
        voltage: statusNode.voltage ?? 0,
        batteryVoltage: statusNode.batteryVoltage ?? 0,
        theftDetected: statusNode.theftDetected === 1 || statusNode.theftDetected === true,
        theftStatus: statusNode.theftStatus || '',
        wifiSignal: statusNode.wifiSignal ?? 0,
        ip: statusNode.ip || '',
        ssid: statusNode.ssid || '',
        lastSeen: statusNode.lastSeen || Date.now(),
        localLastSeen: Date.now(), // Tracks exact local reception time
        noData: false
      }));

      // ── Sensor readings ───────────────────────────────────────
      const newReadings = {
        CS1: roundVal(sensorsNode.house?.CS1 ?? 0),
        CS2: roundVal(sensorsNode.house?.CS2 ?? 0),
        CS3: roundVal(sensorsNode.house?.CS3 ?? 0),
        CS4: roundVal(sensorsNode.main?.MCS ?? 0),
        PCS1: roundVal(sensorsNode.poles?.PCS1 ?? 0),
        PCS2: roundVal(sensorsNode.poles?.PCS2 ?? 0),
        voltage: roundVal(statusNode.batteryVoltage ?? 0, 2),
        totalPower: roundVal((sensorsNode.main?.MCS ?? 0) * (statusNode.batteryVoltage ?? 0), 2),
        timestamp: Date.now(),
      };
      setReadings(newReadings);

      // ── History ───────────────────────────────────────────────
      const parsedHistory = Object.entries(rawHistory)
        .map(([ts, data]) => ({
          timestamp: Number(ts), // <--- INJECTED FOR SORTING
          time: new Date(Number(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          CS4: data.MCS ?? 0,
          PCS1: data.poleTotal ? (data.poleTotal / 2) : 0,
          PCS2: data.poleTotal ? (data.poleTotal / 2) : 0,
          ...data
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-30);
        
      setHistory(parsedHistory);

      // ── Client-side theft detection ────────────────────────────
      setTheft(detectTheft(newReadings, tolerance));
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
      const isOnline = status.localLastSeen && (Date.now() - status.localLastSeen < 10000); // 10 second limit
      if (status.esp32Online !== isOnline) {
        setStatus(prev => ({ ...prev, esp32Online: isOnline }));
        if (!isOnline) {
          set(ref(db, 'status/isOnline'), false);

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
  }, [status.localLastSeen, status.esp32Online]);

  const updateControl = (device, value) => { set(ref(db, `controls/${device}`), value ? 1 : 0); };
  const resetSystem = () => { set(ref(db, 'status/theftDetected'), 0); };

  const runCalibration = () => {
    set(ref(db, 'calibration/run'), true);
  };

  return {
    readings, theft, status, controls, logs, history,
    updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,
    
    // New exact requested structure
    sensors: {
      house: { CS1: readings.CS1, CS2: readings.CS2, CS3: readings.CS3 },
      poles: { PCS1: readings.PCS1, PCS2: readings.PCS2 },
      main: { MCS: readings.CS4 }
    }
  };
};
