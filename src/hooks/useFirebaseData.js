import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';
import { detectTheft } from '../utils/theftDetection';

const roundVal = (v, n = 3) => (v != null ? +Number(v).toFixed(n) : 0);

// How long with no data before declaring offline (ms)
// ESP32 sends every ~5-7s; give a generous 20s buffer for network jitter
const OFFLINE_TIMEOUT_MS = 20000;

export const useFirebaseData = (options = {}) => {
  const { tolerance = 0.3 } = options;

  // ── Use a ref for last-seen time so the heartbeat ALWAYS reads the latest value
  // (avoids stale-closure bug where the interval captures an old state snapshot)
  const lastSeenRef = useRef(null);

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

  const [controls, setControls] = useState({ led: 0, relay: 1, relay1: 0, relay2: 0, alarm: 0 });
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

    // ── Root listener ──────────────────────────────────────────────────────
    // Maps to ACTUAL database structure:
    //   /sensors → { house, poles, main }
    //   /status  → { voltage, batteryVoltage, ip, ssid, … }
    // History is built CLIENT-SIDE from live readings (no /history Firebase node needed)
    const rootRef = ref(db, '/');
    const unsubRoot = onValue(rootRef, (snap) => {
      const allData = snap.val();
      if (!allData) return;

      const statusNode  = allData.status  || {};
      const sensorsNode = allData.sensors || {};

      // ── Stamp the exact moment data arrived locally (written to ref, not state)
      lastSeenRef.current = Date.now();

      // ── Status ───────────────────────────────────────────────────
      setStatus(prev => ({
        ...prev,
        voltage:       statusNode.voltage ?? statusNode.Voltage ?? 0,
        theftDetected: statusNode.theftDetected === 1 || statusNode.theftDetected === true,
        theftStatus:   statusNode.theftStatus    || '',
        wifiSignal:    statusNode.wifiSignal     ?? 0,
        ip:            statusNode.ip             || '',
        ssid:          statusNode.ssid           || '',
        lastSeen:      statusNode.lastSeen       || Date.now(),
        esp32Online:   true,   // data just arrived → definitely online
        noData:        false,
      }));

      // ── Sensor readings ──────────────────────────────────────────
      const newReadings = {
        CS1:        roundVal(sensorsNode.house?.CS1 ?? 0),
        CS2:        roundVal(sensorsNode.house?.CS2 ?? 0),
        CS3:        roundVal(sensorsNode.house?.CS3 ?? 0),
        CS4:        roundVal(sensorsNode.main?.MCS  ?? 0),
        PCS1:       roundVal(sensorsNode.poles?.PCS1 ?? 0),
        PCS2:       roundVal(sensorsNode.poles?.PCS2 ?? 0),
        voltage:    roundVal(statusNode.voltage ?? statusNode.Voltage ?? 0, 2),
        totalPower: roundVal((sensorsNode.main?.MCS ?? 0) * (statusNode.voltage ?? statusNode.Voltage ?? 0), 2),
        timestamp:  Date.now(),
      };
      setReadings(newReadings);

      // ── History: client-side ring buffer (max 60 points) ─────────
      const snapshot = {
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        CS1: newReadings.CS1, CS2: newReadings.CS2, CS3: newReadings.CS3,
        CS4: newReadings.CS4, PCS1: newReadings.PCS1, PCS2: newReadings.PCS2,
      };
      setHistory(prev => [...prev.slice(-59), snapshot]);

      // ── Client-side theft detection ──────────────────────────────
      const theftResult = detectTheft(newReadings, tolerance);
      setTheft(theftResult);

      // ── Auto relay cutoff on pole theft ─────────────────────────
      // Relay 1 → Pole 1 supply; Relay 2 → Pole 2 supply
      // 1 = relay energised (cuts power), 0 = relay off (power flows)
      set(ref(db, 'controls/relay1'), theftResult.pole1Theft ? 1 : 0);
      set(ref(db, 'controls/relay2'), theftResult.pole2Theft ? 1 : 0);
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

  // ── Offline heartbeat ────────────────────────────────────────────────────
  // Reads lastSeenRef (always fresh) instead of status state (stale in closure).
  // Only declares offline after OFFLINE_TIMEOUT_MS of zero data from ESP32.
  useEffect(() => {
    const itv = setInterval(() => {
      const sinceLastData = lastSeenRef.current ? Date.now() - lastSeenRef.current : Infinity;
      const isOnline = sinceLastData < OFFLINE_TIMEOUT_MS;

      setStatus(prev => {
        if (prev.esp32Online === isOnline) return prev; // no change — skip re-render

        if (!isOnline) {
          // ESP32 gone offline — write to Firebase and zero out readings
          set(ref(db, 'status/isOnline'), false);
          setReadings({ CS1: 0, CS2: 0, CS3: 0, CS4: 0, PCS1: 0, PCS2: 0, voltage: 0, totalPower: 0, timestamp: Date.now() });
          setTheft({ mainTheft: false, pole1Theft: false, pole2Theft: false, anyTheft: false, details: [] });
          return {
            ...prev,
            esp32Online:    false,
            batteryVoltage: 0,
            wifiSignal:     0,
            uptime:         0,
            wifiStatus:     'Disconnected',
            sensorStatus:   'Inactive',
            firebaseStatus: 'Disconnected',
            theftDetected:  false,
          };
        }

        return { ...prev, esp32Online: true };
      });
    }, 5000); // check every 5 seconds

    return () => clearInterval(itv);
  }, []); // ← empty deps: no stale closure, reads ref directly

  const updateControl = (device, value) => { set(ref(db, `controls/${device}`), value ? 1 : 0); };
  const resetSystem   = () => { set(ref(db, 'status/theftDetected'), 0); };
  const runCalibration = () => { set(ref(db, 'calibration/run'), true); };

  return {
    readings, theft, status, controls, logs, history,
    updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,

    sensors: {
      house: { CS1: readings.CS1, CS2: readings.CS2, CS3: readings.CS3 },
      poles: { PCS1: readings.PCS1, PCS2: readings.PCS2 },
      main:  { MCS: readings.CS4 },
    },
  };
};
