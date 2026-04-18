import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LiveMonitoringCard from './components/LiveMonitoringCard';
import TheftDetectionStatus from './components/TheftDetectionStatus';
import SocietyLayout from './components/SocietyLayout';
import DeviceControls from './components/DeviceControls';
import RealTimeChart from './components/RealTimeChart';
import EventLog from './components/EventLog';
import HistoryLog from './components/HistoryLog';

import AnalyticsPage from './components/AnalyticsPage';
import ControlPage from './components/ControlPage';
import ESP32StatusCard from './components/ESP32StatusCard';
import ConnectionStatusBar from './components/ConnectionStatusBar';
import CalibrationPanel from './components/CalibrationPanel';
import ThemeToggle from './components/ThemeToggle';
import NotificationContainer from './components/NotificationToast';
import StatusGrid from './components/StatusGrid';
import CurrentComparisonChart from './components/CurrentComparisonChart';
import LoginScreen from './components/LoginScreen';
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
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('eg_auth') === 'true');

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    readings, status, controls, logs,
    updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,
  } = useFirebaseData();


  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!readings.timestamp || !status.esp32Online) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => {
      const totalHouses = Number((readings.house1 + readings.house2 + readings.house3).toFixed(3));
      return [...prev, {
        time,
        main: readings.mainLine,
        h1: readings.house1,
        h2: readings.house2,
        h3: readings.house3,
        total: totalHouses,
        voltage: readings.voltage,
      }].slice(-20);
    });
  }, [readings.timestamp, status.esp32Online]);

  const renderPage = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsPage readings={readings} history={history} />;
      case 'control':
        return (
          <ControlPage
            controls={controls}
            updateControl={updateControl}
            resetSystem={resetSystem}
            status={status}
            readings={readings}

          />
        );
      case 'history':
        return (
          <div className="h-[calc(100vh-140px)] w-full max-w-4xl mx-auto">
            <HistoryLog history={history} />
          </div>
        );
      default:
        return (
          <DashboardPage
            readings={readings}
            status={status}
            controls={controls}
            logs={logs}
            history={history}
            updateControl={updateControl}

            resetSystem={resetSystem}
            calibrationState={calibrationState}
            runCalibration={runCalibration}
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


    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Dashboard page
   ═══════════════════════════════════════════════════════════════════ */
function DashboardPage({
  readings, status, controls, logs, history,
  updateControl, resetSystem,
  calibrationState, runCalibration
}) {
  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">DASHBOARD</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${status.esp32Online ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            {status.esp32Online ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Compact Status + House Currents */}
      <div className="mb-6">
        <StatusGrid status={status} readings={readings} />
      </div>

      {/* Current Comparison Chart + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="glass-card p-4 lg:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Comparison</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[9px] opacity-30 font-bold uppercase">Main Grid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] opacity-30 font-bold uppercase">Houses Total</span>
              </div>
            </div>
          </div>
          <div className="h-56">
            <CurrentComparisonChart data={history} />
          </div>
        </div>

        <HistoryLog history={history} />
      </div>
    </>
  );
}

export default App;
