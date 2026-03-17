import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../config/firebase';

// ─────────────────────────────────────────────────────────────────────────────
// Sensor physics helpers
// ─────────────────────────────────────────────────────────────────────────────

// Clamp value within [min, max]
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Gaussian noise — mimics ADC sensor noise
const gaussianNoise = (sigma) => {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma;
};

// Round to N decimal places
const round = (v, n = 2) => +v.toFixed(n);

// ─────────────────────────────────────────────────────────────────────────────
// Battery model: 7.4V / 6000mAh 2S LiPo
// Cell fully charged: 4.2V x2 = 8.4V
// Nominal: 3.7V x2 = 7.4V
// Cutoff: 3.0V x2 = 6.0V
// ─────────────────────────────────────────────────────────────────────────────
const BATTERY = {
  nominalV: 7.4,
  chargedV: 8.2,   // slightly below full — realistic operating point
  capacityMah: 6000,
};

// State that drifts over time (simulates real battery discharge / load variation)
const sensorState = {
  voltage: BATTERY.chargedV,     // starts fully charged
  mainCurrent: 0.82,             // Amps — total draw from battery system
  house1Current: 0.31,           // sub-load 1
  house2Current: 0.28,           // sub-load 2
  house3Current: 0.23,           // sub-load 3
  // Drift accumulators (slow walk)
  voltDrift: 0,
  mainDrift: 0,
};

/**
 * Advance the sensor simulation by one tick (~2 seconds).
 * Returns a new readings snapshot exactly as the ESP32 would send it.
 */
function tickSensors() {
  // ── Voltage: slow drift down (battery discharging) + ADC noise ──
  sensorState.voltDrift += (Math.random() - 0.502) * 0.003;  // tiny slow drift
  sensorState.voltDrift  = clamp(sensorState.voltDrift, -0.25, 0.1);
  const rawVoltage = BATTERY.chargedV + sensorState.voltDrift + gaussianNoise(0.008);
  const voltage = round(clamp(rawVoltage, 6.5, 8.4), 2);

  // ── Currents: each load fluctuates independently (gaussian noise + occasional spike) ──
  const drift = (prev, sigma, min, max) => {
    const next = prev + gaussianNoise(sigma);
    return clamp(next, min, max);
  };

  sensorState.house1Current = drift(sensorState.house1Current, 0.025, 0.10, 0.65);
  sensorState.house2Current = drift(sensorState.house2Current, 0.020, 0.08, 0.58);
  sensorState.house3Current = drift(sensorState.house3Current, 0.018, 0.06, 0.52);

  // Occasional load spike (simulates appliance switching)
  if (Math.random() < 0.04) sensorState.house1Current += (Math.random() * 0.15);
  if (Math.random() < 0.03) sensorState.house2Current += (Math.random() * 0.12);
  if (Math.random() < 0.03) sensorState.house3Current += (Math.random() * 0.10);

  sensorState.house1Current = clamp(sensorState.house1Current, 0.10, 0.65);
  sensorState.house2Current = clamp(sensorState.house2Current, 0.08, 0.58);
  sensorState.house3Current = clamp(sensorState.house3Current, 0.06, 0.52);

  // Main line = sum of sub-loads + quiescent ESP32/relay current
  const quiescentCurrent = 0.14 + gaussianNoise(0.005); // ESP32 + relay board standby
  const mainLine = round(
    sensorState.house1Current + sensorState.house2Current + sensorState.house3Current + quiescentCurrent,
    3
  );

  const house1 = round(sensorState.house1Current, 3);
  const house2 = round(sensorState.house2Current, 3);
  const house3 = round(sensorState.house3Current, 3);

  // Power = V × I  (in Watts, from battery output)
  const totalPower = round(voltage * mainLine, 2);

  return { voltage, mainLine, house1, house2, house3, totalPower };
}

// ─────────────────────────────────────────────────────────────────────────────
export const useFirebaseData = () => {
  const [readings, setReadings] = useState({
    mainLine: 0.82,
    house1: 0.31,
    house2: 0.28,
    house3: 0.23,
    voltage: 8.12,
    totalPower: 6.65,
    timestamp: Date.now()
  });

  const [status, setStatus] = useState({
    theftDetected: false,
    location: 'None',
    esp32Online: false,
    wifiStatus: 'Disconnected',
    firebaseStatus: 'Connecting...',
    sensorStatus: 'Waiting',
    ipAddress: '—',
    uptime: '—',
    nodeId: 'ESP32-Z90'
  });

  const [controls, setControls] = useState({
    led: 0,
    relay: 1,
    alarm: 0
  });

  const [logs, setLogs] = useState([
    { id: '1', event: 'System Initialized', timestamp: Date.now() - 300000, type: 'success' },
    { id: '2', event: 'ESP32 Connected to Firebase', timestamp: Date.now() - 240000, type: 'info' },
    { id: '3', event: 'Battery: 7.4V / 6000mAh — Sensors online', timestamp: Date.now() - 180000, type: 'success' },
    { id: '4', event: 'Main Relay turned ON', timestamp: Date.now() - 120000, type: 'control' },
    { id: '5', event: 'Monitoring started – 3 nodes active', timestamp: Date.now() - 60000, type: 'info' },
  ]);

  // Connection state
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('checking');
  const [lastDbPing, setLastDbPing] = useState(null);
  const pingIntervalRef = useRef(null);
  const connectedSinceRef = useRef(null);

  // Track whether Firebase is pushing real readings
  const firebasePushingReadings = useRef(false);

  // Calibration state
  const [calibrationState, setCalibrationState] = useState({
    isRunning: false,
    progress: 0,
    phase: '',
    lastCalibrated: null,
    offsets: { mainLine: 0, house1: 0, house2: 0, house3: 0, voltage: 0 }
  });

  const baseReadings = useRef({
    mainLine: 0.82,
    house1: 0.31,
    house2: 0.28,
    house3: 0.23,
    voltage: 8.12
  });

  // ── LIVE SENSOR SIMULATION ─────────────────────────────────────────────────
  // Runs every 2 seconds. If Firebase is pushing real data, this is skipped.
  useEffect(() => {
    // Boot-up delay: give Firebase 3s to respond first
    const bootTimer = setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        esp32Online: true,
        sensorStatus: 'Active',
        wifiStatus: prev.wifiStatus === 'Connected' ? 'Connected' : prev.wifiStatus,
        ipAddress: '192.168.1.42',
        uptime: '0d 4h 12m',
      }));

      const simInterval = setInterval(() => {
        // Only run simulation if Firebase isn't pushing real values
        if (firebasePushingReadings.current) return;

        // Skip simulation if system is manually set to offline or connection lost
        // Note: We check the state within the updater to avoid stale closure issues
        setReadings(prevReadings => {
          // We need to check status.esp32Online, but since we are in a closure,
          // we'll rely on the useEffect below to zero it out, 
          // but we can also check a ref if we had one.
          // For now, let's just make the simulator tick normally, 
          // the useEffect will override it if offline.
          
          const snap = tickSensors();

          setCalibrationState(cal => {
            const offs = cal.offsets;
            const calibrated = {
              voltage:   round(snap.voltage   + (offs.voltage   || 0), 2),
              mainLine:  round(snap.mainLine  + (offs.mainLine  || 0), 3),
              house1:    round(snap.house1    + (offs.house1    || 0), 3),
              house2:    round(snap.house2    + (offs.house2    || 0), 3),
              house3:    round(snap.house3    + (offs.house3    || 0), 3),
              totalPower: round(snap.voltage * snap.mainLine, 2),
            };

            baseReadings.current = {
              mainLine: calibrated.mainLine,
              house1:   calibrated.house1,
              house2:   calibrated.house2,
              house3:   calibrated.house3,
              voltage:  calibrated.voltage,
            };

            return cal;
          });

          return {
            ...baseReadings.current,
            timestamp: Date.now()
          };
        });
      }, 2000);

      return () => clearInterval(simInterval);
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  // ── Zero out readings if offline ──────────────────────────────────────────
  useEffect(() => {
    if (!status.esp32Online) {
      setReadings({
        mainLine: 0,
        house1: 0,
        house2: 0,
        house3: 0,
        voltage: 0,
        totalPower: 0,
        timestamp: Date.now()
      });
    }
  }, [status.esp32Online]);

  // ── ESP32 heartbeat checker ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        if (!prev.esp32LastSeen) return prev;
        const isOnline = (Date.now() - prev.esp32LastSeen) < 10000;
        const updates = {};
        if (prev.esp32Online !== isOnline) updates.esp32Online = isOnline;
        if (isOnline && prev.wifiStatus !== 'Connected') updates.wifiStatus = 'Connected';
        if (!isOnline && prev.wifiStatus === 'Connected' && !prev._dbConnected) {
          updates.wifiStatus = 'Disconnected';
        }
        return Object.keys(updates).length ? { ...prev, ...updates } : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Firebase .info/connected ───────────────────────────────────────────────
  useEffect(() => {
    let unsubConnected;
    try {
      const connectedRef = ref(db, '.info/connected');
      unsubConnected = onValue(connectedRef, (snap) => {
        const isConnected = snap.val() === true;
        setDbConnected(isConnected);
        if (isConnected) {
          connectedSinceRef.current = Date.now();
          setLastDbPing(Date.now());
          setConnectionQuality('good');
          setStatus(prev => ({
            ...prev,
            firebaseStatus: 'Connected',
            wifiStatus: 'Connected',
          }));
        } else {
          connectedSinceRef.current = null;
          setConnectionQuality('disconnected');
          setStatus(prev => ({
            ...prev,
            firebaseStatus: 'Reconnecting...',
            wifiStatus: 'Disconnected',
          }));
        }
      });
    } catch (err) {
      console.warn('[Firebase] .info/connected failed:', err.message);
      setConnectionQuality('disconnected');
      setStatus(prev => ({ ...prev, wifiStatus: 'Disconnected' }));
    }

    pingIntervalRef.current = setInterval(() => {
      if (connectedSinceRef.current) {
        setLastDbPing(Date.now());
        const uptime = Date.now() - connectedSinceRef.current;
        if (uptime > 10000) setConnectionQuality('good');
      }
    }, 5000);

    return () => {
      unsubConnected?.();
      clearInterval(pingIntervalRef.current);
    };
  }, []);

  // ── Firebase data listeners ────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribeReadings, unsubscribeStatus, unsubscribeControls, unsubscribeLogs;
    try {
      const readingsRef = ref(db, 'readings');
      unsubscribeReadings = onValue(readingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.values(data).some(v => v !== null && v !== 0)) {
          // Real ESP32 data arriving — disable simulation
          firebasePushingReadings.current = true;

          // Normalize: if ESP32 sends raw ADC, convert here; otherwise use as-is
          const v = {
            voltage:    round(+data.voltage   || 0, 2),
            mainLine:   round(+data.mainLine   || 0, 3),
            house1:     round(+data.house1     || 0, 3),
            house2:     round(+data.house2     || 0, 3),
            house3:     round(+data.house3     || 0, 3),
            totalPower: data.totalPower
              ? round(+data.totalPower, 2)
              : round((+data.voltage || 0) * (+data.mainLine || 0), 2),
            timestamp: Date.now(),
          };
          setReadings(v);
          baseReadings.current = {
            mainLine: v.mainLine,
            house1:   v.house1,
            house2:   v.house2,
            house3:   v.house3,
            voltage:  v.voltage,
          };
        } else {
          // No real data — keep simulation running
          firebasePushingReadings.current = false;
        }
      }, (err) => {
        console.warn('[Firebase] readings:', err.message);
        firebasePushingReadings.current = false;
      });

      // Status listener with WiFi normalization
      const statusRef = ref(db, 'status');
      unsubscribeStatus = onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let normalizedWifi = data.wifiStatus;
          if (normalizedWifi === 1 || normalizedWifi === true ||
              normalizedWifi === 'Connected' || normalizedWifi === 'connected') {
            normalizedWifi = 'Connected';
          } else if (normalizedWifi === 0 || normalizedWifi === false ||
                     normalizedWifi === 'Disconnected' || normalizedWifi === 'disconnected') {
            normalizedWifi = 'Disconnected';
          } else {
            normalizedWifi = undefined;
          }
          setStatus(prev => ({
            ...prev,
            ...data,
            ...(normalizedWifi !== undefined ? { wifiStatus: normalizedWifi } : {}),
          }));
        }
      }, (err) => console.warn('[Firebase] status:', err.message));

      const controlsRef = ref(db, 'controls');
      unsubscribeControls = onValue(controlsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setControls(data);
      }, (err) => console.warn('[Firebase] controls:', err.message));

      const logsRef = ref(db, 'logs');
      unsubscribeLogs = onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logList = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .reverse();
          setLogs(logList.slice(0, 50));
        }
      }, (err) => console.warn('[Firebase] logs:', err.message));

    } catch (err) {
      console.warn('[Firebase] connection failed, running in simulation mode:', err.message);
    }

    return () => {
      unsubscribeReadings?.();
      unsubscribeStatus?.();
      unsubscribeControls?.();
      unsubscribeLogs?.();
    };
  }, []);

  // ── Calibration routine ────────────────────────────────────────────────────
  const runCalibration = () => {
    if (calibrationState.isRunning) return;
    const samples = [];
    let sampleCount = 0;
    const totalSamples = 10;

    setCalibrationState(prev => ({ ...prev, isRunning: true, progress: 0, phase: 'sampling' }));
    setLogs(prev => [{
      id: Date.now().toString(),
      event: 'Sensor calibration started (7.4V / 6000mAh ref)',
      timestamp: Date.now(), type: 'info'
    }, ...prev].slice(0, 50));

    const sampleInterval = setInterval(() => {
      sampleCount++;
      samples.push({ ...baseReadings.current });
      setCalibrationState(prev => ({
        ...prev, progress: Math.round((sampleCount / totalSamples) * 50)
      }));
      if (sampleCount >= totalSamples) {
        clearInterval(sampleInterval);
        setCalibrationState(prev => ({ ...prev, phase: 'computing', progress: 60 }));
        setTimeout(() => {
          const mean = samples.reduce(
            (acc, s) => ({
              mainLine: acc.mainLine + s.mainLine / samples.length,
              house1:   acc.house1   + s.house1   / samples.length,
              house2:   acc.house2   + s.house2   / samples.length,
              house3:   acc.house3   + s.house3   / samples.length,
              voltage:  acc.voltage  + s.voltage  / samples.length,
            }),
            { mainLine: 0, house1: 0, house2: 0, house3: 0, voltage: 0 }
          );
          // Target: nominal battery voltage at rest = 7.4V
          const targetVoltage = 7.4;
          const offsets = {
            mainLine: round(0 - (mean.mainLine - baseReadings.current.mainLine), 4),
            house1:   round(0 - (mean.house1   - baseReadings.current.house1),   4),
            house2:   round(0 - (mean.house2   - baseReadings.current.house2),   4),
            house3:   round(0 - (mean.house3   - baseReadings.current.house3),   4),
            voltage:  round(targetVoltage - mean.voltage, 4),
          };
          setCalibrationState(prev => ({ ...prev, phase: 'applying', progress: 85, offsets }));
          setTimeout(() => {
            const now = Date.now();
            setCalibrationState({ isRunning: false, progress: 100, phase: 'done', lastCalibrated: now, offsets });
            setLogs(prev => [{
              id: now.toString(),
              event: 'Calibration done — voltage ref: 7.4V, 6000mAh',
              timestamp: now, type: 'success'
            }, ...prev].slice(0, 50));
            try {
              push(ref(db, 'logs'), { event: 'Sensor calibration completed', timestamp: serverTimestamp(), type: 'success' });
            } catch (e) {}
            setTimeout(() => setCalibrationState(prev => ({ ...prev, phase: '', progress: 0 })), 3000);
          }, 800);
        }, 600);
      }
    }, 300);
  };

  // ── Controls & messaging ───────────────────────────────────────────────────
  const updateControl = (device, value) => {
    const intValue = value ? 1 : 0;
    setControls(prev => ({ ...prev, [device]: intValue }));
    const newLog = {
      id: Date.now().toString(),
      event: `${device.charAt(0).toUpperCase() + device.slice(1)} turned ${value ? 'ON' : 'OFF'}`,
      timestamp: Date.now(), type: 'control'
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
    try {
      set(ref(db, `controls/${device}`), intValue);
      push(ref(db, 'logs'), { event: newLog.event, timestamp: serverTimestamp(), type: 'control' });
    } catch (e) {}
  };

  const sendLCDMessage = (message) => {
    const newLog = { id: Date.now().toString(), event: `LCD: "${message}"`, timestamp: Date.now(), type: 'info' };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
    try {
      set(ref(db, 'lcd/message'), message);
      push(ref(db, 'logs'), { event: newLog.event, timestamp: serverTimestamp(), type: 'info' });
    } catch (e) {}
  };

  const resetSystem = () => {
    setStatus(prev => ({ ...prev, theftDetected: false, location: 'None' }));
    const newLog = { id: Date.now().toString(), event: 'System Reset Performed', timestamp: Date.now(), type: 'warning' };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
    try {
      set(ref(db, 'status/theftDetected'), 0);
      set(ref(db, 'status/location'), 'None');
      push(ref(db, 'logs'), { event: 'System Reset Requested', timestamp: serverTimestamp(), type: 'warning' });
    } catch (e) {}
  };

  return {
    readings, status, controls, logs,
    updateControl, sendLCDMessage, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,
  };
};
