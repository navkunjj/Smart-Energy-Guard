import React from 'react';
import { Power, Bell, Lightbulb, RotateCcw, Wifi, Database, Cpu, ShieldCheck, ShieldAlert, Activity, WifiOff } from 'lucide-react';


const ToggleSwitch = ({ isOn, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
      disabled
        ? 'bg-[var(--card-border)] opacity-40 cursor-not-allowed'
        : isOn ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-[var(--card-border)]'
    }`}
  >
    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isOn && !disabled ? 'translate-x-7' : 'translate-x-0'}`} />
  </button>
);

const ControlPage = ({ controls, updateControl, resetSystem, status, readings, theft }) => {
  const isOffline = !status?.esp32Online;

  const devices = [
    {
      id: 'led',
      label: 'System Indicator LED',
      desc: 'Visual status indicator on ESP32 board',
      icon: Lightbulb,
      color: 'yellow',
      activeClass: 'border-yellow-500/40 bg-yellow-500/5',
      iconClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    },
    {
      id: 'relay',
      label: 'Main Power Relay',
      desc: 'Controls the primary power distribution line',
      icon: Power,
      color: 'blue',
      activeClass: 'border-blue-500/40 bg-blue-500/5',
      iconClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'alarm',
      label: 'Theft Alarm',
      desc: 'Audible alarm for unauthorized power access',
      icon: Bell,
      color: 'rose',
      activeClass: 'border-rose-500/40 bg-rose-500/5',
      iconClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const theftStatus = [
    {
      label: 'Main (Input vs Poles)',
      value: isOffline ? '—' : (theft?.mainTheft ? 'MISMATCH' : 'OK'),
      icon: theft?.mainTheft && !isOffline ? ShieldAlert : ShieldCheck,
      ok: isOffline ? false : !theft?.mainTheft,
    },
    {
      label: 'Pole 1 (Total vs Houses)',
      value: isOffline ? '—' : (theft?.pole1Theft ? 'THEFT' : 'OK'),
      icon: theft?.pole1Theft && !isOffline ? ShieldAlert : ShieldCheck,
      ok: isOffline ? false : !theft?.pole1Theft,
    },
    {
      label: 'Pole 2 (Total vs House 3)',
      value: isOffline ? '—' : (theft?.pole2Theft ? 'THEFT' : 'OK'),
      icon: theft?.pole2Theft && !isOffline ? ShieldAlert : ShieldCheck,
      ok: isOffline ? false : !theft?.pole2Theft,
    },
  ];

  const systemStatus = [
    { label: 'WiFi Network', value: isOffline ? 'Disconnected' : status.wifiStatus, icon: Wifi, ok: !isOffline && status.wifiStatus === 'Connected' },
    { label: 'Firebase DB', value: isOffline ? 'Disconnected' : status.firebaseStatus, icon: Database, ok: !isOffline && status.firebaseStatus === 'Connected' },
    { label: 'Sensor Array', value: isOffline ? 'Inactive' : status.sensorStatus, icon: Cpu, ok: !isOffline && status.sensorStatus === 'Active' },
  ];

  // Zero out readings when offline
  const d = isOffline ? { CS1: 0, CS2: 0, CS3: 0, CS4: 0, PCS1: 0, PCS2: 0, voltage: 0, totalPower: 0 } : readings;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">DEVICE CONTROL</h1>
        <p className="opacity-40 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
          ESP32 Remote Management Panel
        </p>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div className="flex items-center gap-3 mb-6 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <WifiOff size={20} className="text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-400">Device Offline</p>
            <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-bold mt-0.5">
              All controls are disabled until the ESP32 reconnects
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Toggles */}
        <div className={`lg:col-span-2 space-y-4 ${isOffline ? 'opacity-50' : ''}`}>
          <h2 className="text-xs font-black opacity-40 uppercase tracking-widest mb-4">Device Toggles</h2>
          {devices.map((device) => {
            const isOn = isOffline ? false : controls[device.id] === 1;
            const Icon = device.icon;
            return (
              <div key={device.id} className={`glass-card p-5 rounded-2xl flex items-center gap-5 border transition-all duration-300 ${
                isOffline
                  ? 'border-[var(--card-border)]'
                  : isOn ? device.activeClass : 'border-[var(--card-border)]'
              }`}>
                <div className={`p-4 rounded-2xl border ${isOffline ? 'opacity-40 bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]' : device.iconClass}`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{device.label}</p>
                  <p className="text-xs opacity-40 mt-0.5">{device.desc}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      isOffline
                        ? 'bg-[var(--card-bg)] opacity-30 text-[var(--foreground)]'
                        : isOn ? 'bg-emerald-500/20 text-emerald-500 font-bold' : 'bg-[var(--card-bg)] opacity-30 text-[var(--foreground)]'
                    }`}>
                      {isOn ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                </div>
                <ToggleSwitch isOn={isOn} onChange={() => !isOffline && updateControl(device.id, !isOn)} disabled={isOffline} />
              </div>
            );
          })}

          {/* Emergency Reset */}
          <div className="glass-card p-5 rounded-2xl border border-[var(--card-border)]">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border ${isOffline ? 'opacity-40 bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]' : 'text-blue-500 bg-blue-500/10 border-blue-500/20'}`}>
                <RotateCcw size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">System Reinitialize</p>
                <p className="text-xs opacity-40 mt-0.5">Clears theft flags and resets all status signals</p>
                <p className="text-[10px] opacity-30 mt-1 uppercase font-bold tracking-widest">Emergency Action</p>
              </div>
              <button
                onClick={() => !isOffline && resetSystem()}
                disabled={isOffline}
                className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  isOffline
                    ? 'bg-[var(--card-bg)] border-[var(--card-border)] opacity-40 cursor-not-allowed text-[var(--muted)]'
                    : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 text-blue-500'
                }`}
              >
                Reinitialize
              </button>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          {/* Theft Detection Status */}
          <h2 className="text-xs font-black opacity-40 uppercase tracking-widest mb-4">Theft Detection</h2>
          {theftStatus.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`glass-card p-4 rounded-2xl flex items-center gap-4 ${
                !item.ok && !isOffline ? 'border border-rose-500/30 theft-glow' : ''
              }`}>
                <div className={`p-3 rounded-xl border ${item.ok ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] opacity-40 uppercase font-bold">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? '' : 'text-rose-500'}`}>{item.value}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-rose-500'} pulse-indicator`} />
              </div>
            );
          })}

          {/* System Status */}
          <h2 className="text-xs font-black opacity-40 uppercase tracking-widest mb-4 mt-6">System Status</h2>
          {systemStatus.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-card p-4 rounded-2xl flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${item.ok ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] opacity-40 uppercase font-bold">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? '' : 'text-rose-500'}`}>{item.value}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-rose-500'} pulse-indicator`} />
              </div>
            );
          })}

          {/* Live Readings Box */}
          <div className={`glass-card p-5 rounded-2xl mt-4 ${isOffline ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className={isOffline ? 'text-rose-500' : 'text-blue-500'} />
              <h3 className="text-xs font-black opacity-40 uppercase tracking-widest">Live Readings</h3>
              {isOffline && <span className="text-[9px] font-bold text-rose-400 uppercase ml-auto">Offline</span>}
            </div>
            <div className="space-y-3">
              {[
                { label: 'Main Input', value: `${d.CS4} A`, color: isOffline ? 'opacity-40' : 'text-amber-400' },
                { label: 'Pole 1', value: `${d.PCS1} A`, color: isOffline ? 'opacity-40' : 'text-blue-400' },
                { label: 'Pole 2', value: `${d.PCS2} A`, color: isOffline ? 'opacity-40' : 'text-cyan-400' },
                { label: 'House 1', value: `${d.CS1} A`, color: isOffline ? 'opacity-40' : 'text-indigo-400' },
                { label: 'House 2', value: `${d.CS2} A`, color: isOffline ? 'opacity-40' : 'text-violet-400' },
                { label: 'House 3', value: `${d.CS3} A`, color: isOffline ? 'opacity-40' : 'text-emerald-400' },
                { label: 'Voltage', value: `${d.voltage} V`, color: isOffline ? 'opacity-40' : 'text-purple-400' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-xs opacity-50 font-medium">{r.label}</span>
                  <span className={`text-xs font-bold font-mono ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPage;
