import React from 'react';
import {
  Battery, Wifi, MapPin, ShieldAlert, ShieldCheck,
  Clock, Globe, Signal, Activity, WifiOff, Zap
} from 'lucide-react';

const StatusGrid = ({ status, readings, theft }) => {
  const isOffline = !status?.esp32Online;

  // Zero out displayed readings when offline
  const d = isOffline
    ? { CS1: 0, CS2: 0, CS3: 0, CS4: 0, PCS1: 0, PCS2: 0, voltage: 0 }
    : readings;

  // ── Hero Cards ──────────────────────────────────────────────────
  const heroCards = [
    {
      title: 'Battery',
      value: isOffline ? '0.0V' : `${(status.batteryVoltage || d?.voltage || 0).toFixed(1)}V`,
      icon: Battery,
      color: isOffline ? 'text-rose-400 opacity-50' : 'text-blue-400',
      border: isOffline ? 'border-rose-500/20' : 'border-blue-500/20',
    },
    {
      title: 'Security',
      value: isOffline ? '—' : (theft?.anyTheft ? 'THEFT' : 'SECURE'),
      icon: isOffline ? WifiOff : (theft?.anyTheft ? ShieldAlert : ShieldCheck),
      color: isOffline ? 'text-rose-400 opacity-50' : (theft?.anyTheft ? 'text-rose-400' : 'text-emerald-400'),
      border: isOffline ? 'border-rose-500/20' : (theft?.anyTheft ? 'border-rose-500/30' : 'border-emerald-500/20'),
      pulse: !isOffline && theft?.anyTheft,
    },
    {
      title: 'Node',
      value: status.esp32Online ? 'ONLINE' : 'OFFLINE',
      icon: Activity,
      color: status.esp32Online ? 'text-emerald-400' : 'text-rose-400',
      border: status.esp32Online ? 'border-emerald-500/20' : 'border-rose-500/20',
    },
  ];

  // ── Sensor card definitions (grouped by pole) ───────────────────
  const sensorGroups = [
    {
      label: 'Main',
      isTheft: theft?.mainTheft,
      sensors: [
        { name: 'Main Input', desc: 'Total System Load', value: d.CS4 || 0, color: 'bg-amber-500', textColor: 'text-amber-400' },
      ],
    },
    {
      label: 'Pole 1',
      isTheft: theft?.pole1Theft,
      sensors: [
        { name: 'Pole 1', desc: 'Total Current', value: d.PCS1 || 0, color: 'bg-blue-500', textColor: 'text-blue-400' },
        { name: 'House 1', desc: 'Load', value: d.CS1 || 0, color: 'bg-indigo-500', textColor: 'text-indigo-400' },
      ],
    },
    {
      label: 'Pole 2',
      isTheft: theft?.pole2Theft,
      sensors: [
        { name: 'Pole 2', desc: 'Total Current', value: d.PCS2 || 0, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
        { name: 'House 2', desc: 'Load', value: d.CS2 || 0, color: 'bg-teal-500', textColor: 'text-teal-400' },
        { name: 'House 3', desc: 'Load', value: d.CS3 || 0, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
      ],
    },
  ];

  // ── Detail chips ────────────────────────────────────────────────
  const details = [
    { label: 'SSID', value: isOffline ? '—' : (status.ssid || '—'), icon: Wifi },
    { label: 'IP', value: isOffline ? '—' : (status.ip || '—'), icon: Globe },
    { label: 'Signal', value: isOffline ? '0 dBm' : `${status.wifiSignal || 0} dBm`, icon: Signal },
    { label: 'Uptime', value: isOffline ? '—' : (typeof status.uptime === 'number' ? `${Math.floor(status.uptime / 60)}m ${status.uptime % 60}s` : '—'), icon: Clock },
    { label: 'WiFi', value: isOffline ? 'Disconnected' : (status.wifiStatus || '—'), icon: Wifi },
  ];

  const maxCurrent = Math.max(d.CS1 || 0, d.CS2 || 0, d.CS3 || 0, d.PCS1 || 0, d.PCS2 || 0, d.CS4 || 0, 0.5);

  return (
    <div className="space-y-4">
      {/* ── Hero cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {heroCards.map((card, i) => (
          <div key={i} className={`glass-card rounded-2xl p-4 border ${card.border} text-center transition-all hover:scale-[1.02]`}>
            <card.icon size={20} className={`${card.color} mx-auto mb-2 ${card.pulse ? 'animate-pulse' : ''}`} />
            <div className={`text-xl font-black tracking-tight ${card.color} ${card.pulse ? 'animate-pulse' : ''}`}>
              {card.value}
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* ── Sensor Groups (Pole-based) ─────────────────────────── */}
      {sensorGroups.map((group, gi) => (
        <div
          key={gi}
          className={`glass-card rounded-2xl p-4 border transition-all duration-500 ${
            !isOffline && group.isTheft
              ? 'border-rose-500/40 theft-glow'
              : 'border-white/5'
          } ${isOffline ? 'opacity-50' : ''}`}
        >
          {/* Group header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
              {group.label}
              {isOffline && <span className="text-rose-400 ml-2">• Offline</span>}
            </p>
            {!isOffline && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                group.isTheft
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {group.isTheft ? '🔴 Theft' : '🟢 Normal'}
              </span>
            )}
          </div>

          {/* Sensor bars */}
          <div className="space-y-2.5">
            {group.sensors.map((s, si) => (
              <div key={si} className="flex items-center gap-3">
                <div className="flex flex-col w-16 shrink-0">
                  <span className={`text-[11px] font-black ${s.textColor}`}>{s.name}</span>
                  <span className="text-[8px] font-bold uppercase opacity-30 leading-tight">{s.desc}</span>
                </div>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-700 ease-out ${
                      !isOffline && group.isTheft ? 'opacity-80' : ''
                    }`}
                    style={{ width: `${Math.min((s.value / maxCurrent) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-black tabular-nums w-16 text-right ${
                  !isOffline && group.isTheft ? 'text-rose-400' : ''
                }`}>
                  {s.value.toFixed(2)} A
                </span>
              </div>
            ))}
          </div>

          {/* Theft location message */}
          {!isOffline && group.isTheft && (
            <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-400" />
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
                ⚠ Theft at {group.label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* ── Detail chips ───────────────────────────────────────── */}
      <div className={`flex flex-wrap gap-2 ${isOffline ? 'opacity-50' : ''}`}>
        {details.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-lg border border-white/5 text-[10px]">
            <d.icon size={12} className="opacity-30" />
            <span className="font-bold uppercase opacity-40">{d.label}:</span>
            <span className="font-black truncate max-w-[100px]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusGrid;
