import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LiveMonitoringCard from './components/LiveMonitoringCard';
import TheftDetectionStatus from './components/TheftDetectionStatus';
import SocietyLayout from './components/SocietyLayout';
import DeviceControls from './components/DeviceControls';
import RealTimeChart from './components/RealTimeChart';
import EventLog from './components/EventLog';
import LCDMessageSender from './components/LCDMessageSender';
import AnalyticsPage from './components/AnalyticsPage';
import ControlPage from './components/ControlPage';
import LogsPage from './components/LogsPage';
import ESP32StatusCard from './components/ESP32StatusCard';
import ConnectionStatusBar from './components/ConnectionStatusBar';
import CalibrationPanel from './components/CalibrationPanel';
import ThemeToggle from './components/ThemeToggle';
import NotificationContainer from './components/NotificationToast';
import { useFirebaseData } from './hooks/useFirebaseData';
import {
  Activity,
  Zap,
  Waves,
  Cpu,
  BatteryMedium,
  Bell,
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    readings, status, controls, logs,
    updateControl, sendLCDMessage, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,
  } = useFirebaseData();

  const [notifications, setNotifications] = useState([]);
  const prevControls = React.useRef(controls);
  const prevTheft = React.useRef(status.theftDetected);
  const prevOnline = React.useRef(status.esp32Online);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Watch for Control Changes
  useEffect(() => {
    Object.keys(controls).forEach(key => {
      if (prevControls.current && controls[key] !== prevControls.current[key]) {
        addNotification(`${key.toUpperCase()} state changed to ${controls[key] === 1 ? 'ON' : 'OFF'}`, key);
      }
    });
    prevControls.current = controls;
  }, [controls]);

  // Watch for Theft Alerts
  useEffect(() => {
    if (status.theftDetected && !prevTheft.current) {
      addNotification(`SECURITY ALERT: Power theft detected at ${status.location}!`, 'theft');
    }
    prevTheft.current = status.theftDetected;
  }, [status.theftDetected, status.location]);

  // Watch for Connection Status
  useEffect(() => {
    if (status.esp32Online !== prevOnline.current && prevOnline.current !== undefined) {
      addNotification(`System ${status.esp32Online ? 'is now ONLINE' : 'has gone OFFLINE'}`, status.esp32Online ? 'success' : 'error');
    }
    prevOnline.current = status.esp32Online;
  }, [status.esp32Online]);

  // Watch for Calibration Completion
  useEffect(() => {
    if (calibrationState.phase === 'done') {
      addNotification('Sensor calibration completed successfully', 'success');
    }
  }, [calibrationState.phase]);

  const [chartHistory, setChartHistory] = useState({ current: [], power: [] });
  const [houseHistory, setHouseHistory] = useState({ h1: [], h2: [], h3: [] });

  useEffect(() => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    setChartHistory(prev => ({
      current: [...prev.current, { time, value: readings.mainLine }].slice(-20),
      power:   [...prev.power,   { time, value: readings.totalPower }].slice(-20),
    }));
    setHouseHistory(prev => ({
      h1: [...prev.h1, { time, value: readings.house1 }].slice(-20),
      h2: [...prev.h2, { time, value: readings.house2 }].slice(-20),
      h3: [...prev.h3, { time, value: readings.house3 }].slice(-20),
    }));
  }, [readings.timestamp]);

  const renderPage = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsPage readings={readings} chartHistory={chartHistory} houseHistory={houseHistory} />;
      case 'control':
        return (
          <ControlPage
            controls={controls}
            updateControl={updateControl}
            resetSystem={() => {
              resetSystem();
              addNotification('System Reinitialization Signal Sent', 'warning');
            }}
            status={status}
            readings={readings}
            sendLCDMessage={(msg) => {
              sendLCDMessage(msg);
              addNotification(`LCD Broadcast: "${msg}"`, 'info');
            }}
          />
        );
      case 'logs':
        return <LogsPage logs={logs} />;
      default:
        return (
          <DashboardPage
            readings={readings}
            status={status}
            controls={controls}
            logs={logs}
            chartHistory={chartHistory}
            updateControl={updateControl}
            sendLCDMessage={(msg) => {
              sendLCDMessage(msg);
              addNotification(`LCD Broadcast sent: "${msg}"`, 'info');
            }}
            resetSystem={() => {
              resetSystem();
              addNotification('System reset request sent', 'warning');
            }}
            calibrationState={calibrationState}
            runCalibration={() => {
              runCalibration();
              addNotification('Self-calibration routine started', 'info');
            }}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen industrial-grid">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      {/*
        Desktop: offset by sidebar width (lg:ml-64)
        Mobile:  no offset, top padding for mobile navbar, bottom padding for tab bar
      */}
      <main className="flex-1 lg:ml-64 pt-[60px] lg:pt-0 pb-[72px] lg:pb-0 px-4 md:px-6 lg:px-8 py-4 lg:py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-3 mb-6 lg:mb-8 pt-2 lg:pt-0">
          <p className="opacity-40 font-medium uppercase tracking-[0.2em] text-[9px]">
            Energy Guard Society • Node ID: ESP32-Z90
          </p>

          {/* Status bar row — scrollable on very small screens */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-2xl shrink-0">
              <ConnectionStatusBar
                status={status}
                dbConnected={dbConnected}
                connectionQuality={connectionQuality}
                lastDbPing={lastDbPing}
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl shrink-0">
              <Cpu size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {status.sensorStatus}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              
              <button className="p-2.5 glass-card rounded-xl text-[var(--muted)] hover:text-blue-500 transition-colors relative shrink-0">
                <Bell size={18} />
                {status.theftDetected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full pulse-indicator" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Page Content ───────────────────────────────────────── */}
        {renderPage()}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-10 py-6 border-t border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="opacity-40 text-[11px] font-medium text-center">
            © 2026 Energy Guard Society. Industrial IoT Surveillance System.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-40">
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Docs</span>
            <span className="w-1 h-1 bg-[var(--muted)] rounded-full opacity-20" />
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Support</span>
            <span className="w-1 h-1 bg-[var(--muted)] rounded-full opacity-20" />
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Privacy</span>
          </div>
        </footer>
      </main>

      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Dashboard page
   ═══════════════════════════════════════════════════════════════════ */
function DashboardPage({
  readings, status, controls, logs, chartHistory,
  updateControl, sendLCDMessage, resetSystem,
  calibrationState, runCalibration
}) {
  const batteryPct = Math.max(0, Math.min(100,
    Math.round(((readings.voltage - 6.0) / (8.4 - 6.0)) * 100)
  ));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">DASHBOARD</h1>
      </header>

      {/* ESP32 hardware status indicator */}
      <div className="mb-6 lg:mb-8">
        <ESP32StatusCard status={status} />
      </div>

      {/* Stats grid — 2 cols on phones, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <LiveMonitoringCard
          title="Battery Voltage"
          value={readings.voltage ?? 0}
          unit="V DC"
          icon={Zap}
          color="blue"
          liveFlash
        />
        <LiveMonitoringCard
          title="Total Current"
          value={readings.mainLine ? (readings.mainLine * 1000).toFixed(0) : 0}
          unit="mA"
          icon={Waves}
          color="purple"
          liveFlash
        />
        <LiveMonitoringCard
          title="Output Power"
          value={readings.totalPower ?? 0}
          unit="W"
          icon={Activity}
          color="green"
          liveFlash
        />
        <LiveMonitoringCard
          title="Battery Level"
          value={batteryPct}
          unit="%"
          icon={BatteryMedium}
          color="orange"
          liveFlash
        />
      </div>



      {/* Society map + device controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-8">
        <div className="lg:col-span-2">
          <SocietyLayout readings={readings} status={status} />
        </div>
        <div className="space-y-4 lg:space-y-8">
          <DeviceControls
            controls={controls}
            updateControl={updateControl}
            resetSystem={resetSystem}
          />
          <LCDMessageSender onSend={sendLCDMessage} />
        </div>
      </div>

      {/* Charts + event log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="glass-card p-4 lg:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider">
              Live Load Profiling
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] opacity-40 font-bold uppercase">Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] opacity-40 font-bold uppercase">Power</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <RealTimeChart data={chartHistory.current} label="Main Current (A)" color="rgba(59, 130, 246, 0.2)" />
            <RealTimeChart data={chartHistory.power}   label="Total Power (W)"  color="rgba(16, 185, 129, 0.2)" />
          </div>
        </div>

        <EventLog logs={logs} />
      </div>
    </>
  );
}

export default App;
