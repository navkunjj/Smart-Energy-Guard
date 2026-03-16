import React, { useState } from 'react';
import { Power, Bell, Lightbulb, RotateCcw, MessageSquareText, Send, Wifi, Database, Cpu, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import LCDMessageSender from './LCDMessageSender';

const ToggleSwitch = ({ isOn, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${isOn ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
  >
    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isOn ? 'translate-x-7' : 'translate-x-0'}`} />
  </button>
);

const ControlPage = ({ controls, updateControl, resetSystem, status, readings, sendLCDMessage }) => {
  const devices = [
    {
      id: 'led',
      label: 'System Indicator LED',
      desc: 'Visual status indicator on ESP32 board',
      icon: Lightbulb,
      color: 'yellow',
      activeClass: 'border-yellow-500/40 bg-yellow-500/5',
      iconClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },
    {
      id: 'relay',
      label: 'Main Power Relay',
      desc: 'Controls the primary power distribution line',
      icon: Power,
      color: 'blue',
      activeClass: 'border-blue-500/40 bg-blue-500/5',
      iconClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'alarm',
      label: 'Theft Alarm',
      desc: 'Audible alarm for unauthorized power access',
      icon: Bell,
      color: 'rose',
      activeClass: 'border-rose-500/40 bg-rose-500/5',
      iconClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  const statusItems = [
    { label: 'WiFi Network', value: status.wifiStatus, icon: Wifi, ok: status.wifiStatus === 'Connected' },
    { label: 'Firebase DB', value: status.firebaseStatus, icon: Database, ok: status.firebaseStatus === 'Connected' },
    { label: 'Sensor Array', value: status.sensorStatus, icon: Cpu, ok: status.sensorStatus === 'Active' },
    { label: 'Theft Status', value: status.theftDetected ? 'ALERT' : 'Secure', icon: status.theftDetected ? ShieldAlert : ShieldCheck, ok: !status.theftDetected },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">DEVICE CONTROL</h1>
        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
          ESP32 Remote Management Panel
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Toggles */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Device Toggles</h2>
          {devices.map((device) => {
            const isOn = controls[device.id] === 1;
            const Icon = device.icon;
            return (
              <div key={device.id} className={`glass-card p-5 rounded-2xl flex items-center gap-5 border transition-all duration-300 ${isOn ? device.activeClass : 'border-white/5'}`}>
                <div className={`p-4 rounded-2xl border ${device.iconClass}`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{device.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{device.desc}</p>
                  <div className="mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'}`}>
                      {isOn ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                </div>
                <ToggleSwitch isOn={isOn} onChange={() => updateControl(device.id, !isOn)} />
              </div>
            );
          })}

          {/* Emergency Reset */}
          <div className="glass-card p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl border text-blue-400 bg-blue-500/10 border-blue-500/20">
                <RotateCcw size={28} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">System Reinitialize</p>
                <p className="text-xs text-gray-500 mt-0.5">Clears theft flags and resets all status signals</p>
                <p className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">Emergency Action</p>
              </div>
              <button
                onClick={resetSystem}
                className="px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-sm font-bold transition-all"
              >
                Reinitialize
              </button>
            </div>
          </div>

          {/* LCD Message Sender */}
          <div className="mt-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">LCD Broadcast</h2>
            <LCDMessageSender onSend={sendLCDMessage} />
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">System Status</h2>

          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-card p-4 rounded-2xl flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${item.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? 'text-white' : 'text-rose-400'}`}>{item.value}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-rose-500'} pulse-indicator`} />
              </div>
            );
          })}

          {/* Live Readings Box */}
          <div className="glass-card p-5 rounded-2xl mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-blue-400" />
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Readings</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Main Line', value: `${readings.mainLine} A`, color: 'text-blue-400' },
                { label: 'Voltage', value: `${readings.voltage} V`, color: 'text-purple-400' },
                { label: 'Total Power', value: `${readings.totalPower} kW`, color: 'text-emerald-400' },
                { label: 'House 1', value: `${readings.house1} A`, color: 'text-blue-300' },
                { label: 'House 2', value: `${readings.house2} A`, color: 'text-purple-300' },
                { label: 'House 3', value: `${readings.house3} A`, color: 'text-emerald-300' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">{r.label}</span>
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
