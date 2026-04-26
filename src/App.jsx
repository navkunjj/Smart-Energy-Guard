import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HistoryLog from './components/HistoryLog';
import AnalyticsPage from './components/AnalyticsPage';
import ControlPage from './components/ControlPage';
import ConnectionStatusBar from './components/ConnectionStatusBar';
import ThemeToggle from './components/ThemeToggle';
import StatusGrid from './components/StatusGrid';
import CurrentComparisonChart from './components/CurrentComparisonChart';
import WiringDiagram from './components/WiringDiagram';
import TheftAlertBanner from './components/TheftAlertBanner';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import { useFirebaseData } from './hooks/useFirebaseData';
import { Cpu, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('eg_auth') === 'true');

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // ── Persistent App Settings ─────────────────────────────────────
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('eg_settings');
    return saved ? JSON.parse(saved) : {
      tolerance: 0.2,
      sirenEnabled: true,
      sirenTimeout: 60,
    };
  });

  const updateSettings = (key, val) => {
    setAppSettings(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem('eg_settings', JSON.stringify(next));
      return next;
    });
  };

  const {
    readings, theft, status, controls, logs, history,
    updateControl, resetSystem,
    dbConnected, connectionQuality, lastDbPing,
    calibrationState, runCalibration,
  } = useFirebaseData({ tolerance: appSettings.tolerance });

  const renderPage = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsPage readings={readings} history={history} theft={theft} />;
      case 'control':
        return (
          <ControlPage
            controls={controls}
            updateControl={updateControl}
            resetSystem={resetSystem}
            status={status}
            readings={readings}
            theft={theft}
          />
        );
      case 'history':
        return (
          <div className="h-[calc(100vh-140px)] w-full max-w-5xl mx-auto">
            <HistoryLog history={history} />
          </div>
        );
      case 'diagram':
        return (
          <div>
            <header className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">WIRING MAP</h1>
              <p className="opacity-40 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
                Interactive Network Topology & Current Flow
              </p>
            </header>
            <WiringDiagram readings={readings} theft={theft} isOffline={!status.esp32Online} />
          </div>
        );
      default:
        return (
          <DashboardPage
            readings={readings}
            theft={theft}
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
            SMART ENERGY GUARD • Node ID: ESP32-Z90
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
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 glass-card rounded-xl text-[var(--muted)] hover:text-blue-500 transition-colors relative shrink-0"
              >
                <SettingsIcon size={18} />
                {theft.anyTheft && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full pulse-indicator" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Theft Alert Banner ───────────────────────────────── */}
        <TheftAlertBanner 
          theft={theft} 
          isOffline={!status.esp32Online} 
          settings={appSettings}
        />

        {/* ── Page Content ───────────────────────────────────────── */}
        {renderPage()}

        {/* ── Settings Overlay ───────────────────────────────────── */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={appSettings}
          updateSettings={updateSettings}
          runCalibration={runCalibration}
          resetSystem={resetSystem}
          status={status}
        />

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-10 py-6 border-t border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="opacity-40 text-[11px] font-medium text-center">
            © 2026 Energy Guard Society. Smart Grid IoT Surveillance System.
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
  readings, theft, status, controls, logs, history,
  updateControl, resetSystem
}) {
  return (
    <div className="max-w-[1600px] mx-auto">
      <header className="mb-4 lg:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">DASHBOARD</h1>
          <p className="hidden md:block opacity-40 text-[10px] font-bold uppercase tracking-widest mt-1">Live Power Monitoring & Analytics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl border border-white/5">
          <span className={`w-2.5 h-2.5 rounded-full ${status.esp32Online ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            {status.esp32Online ? 'System Online' : 'System Offline'}
          </span>
        </div>
      </header>

      {/* Sensor Cards + Status */}
      <div className="mb-6 lg:mb-10">
        <StatusGrid status={status} readings={readings} theft={theft} />
      </div>

      {/* Wiring Diagram (inline on dashboard) */}
      <div className="mb-6 lg:mb-10">
        <WiringDiagram readings={readings} theft={theft} isOffline={!status.esp32Online} />
      </div>

      {/* Current Comparison Chart + Event Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
        <div className="xl:col-span-2 glass-card p-6 lg:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Current Comparison</h3>
              <p className="text-[10px] opacity-30 font-medium">Main Grid vs Total Pole Distribution (Amps)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">Main Input</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">Poles Total</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] lg:h-[400px]">
            <CurrentComparisonChart data={history} />
          </div>
        </div>

        <div className="xl:col-span-1">
          <HistoryLog history={history} />
        </div>
      </div>
    </div>
  );
}

export default App;
