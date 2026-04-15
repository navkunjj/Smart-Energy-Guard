import React from 'react';
import { 
  Battery, Wifi, MapPin, ShieldAlert, ShieldCheck, 
  Clock, Globe, Signal, Activity 
} from 'lucide-react';

const StatusGrid = ({ status, readings }) => {
  // Top row: 3 hero cards (most important at a glance)
  const heroCards = [
    {
      title: 'Battery',
      value: `${(status.batteryVoltage || readings?.voltage || 0).toFixed(1)}V`,
      icon: Battery,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      title: 'Security',
      value: status.theftDetected ? 'THEFT' : 'SECURE',
      icon: status.theftDetected ? ShieldAlert : ShieldCheck,
      color: status.theftDetected ? 'text-rose-400' : 'text-emerald-400',
      border: status.theftDetected ? 'border-rose-500/30' : 'border-emerald-500/20',
      pulse: status.theftDetected,
    },
    {
      title: 'Node',
      value: status.esp32Online ? 'ONLINE' : 'OFFLINE',
      icon: Activity,
      color: status.esp32Online ? 'text-emerald-400' : 'text-rose-400',
      border: status.esp32Online ? 'border-emerald-500/20' : 'border-rose-500/20',
    },
  ];

  // Bottom row: compact inline details
  const details = [
    { label: 'SSID', value: status.ssid || '—', icon: Wifi },
    { label: 'IP', value: status.ip || '—', icon: Globe },
    { label: 'Signal', value: `${status.wifiSignal || 0} dBm`, icon: Signal },
    { label: 'Uptime', value: typeof status.uptime === 'number' ? `${Math.floor(status.uptime / 60)}m ${status.uptime % 60}s` : '—', icon: Clock },
    { label: 'Location', value: status.location || '—', icon: MapPin },
    { label: 'WiFi', value: status.wifiStatus || '—', icon: Wifi },
  ];

  // House currents
  const houses = [
    { name: 'House 1', value: readings?.house1 || 0, color: 'bg-blue-500' },
    { name: 'House 2', value: readings?.house2 || 0, color: 'bg-purple-500' },
    { name: 'House 3', value: readings?.house3 || 0, color: 'bg-sky-500' },
  ];
  const maxCurrent = Math.max(readings?.house1 || 0, readings?.house2 || 0, readings?.house3 || 0, 1);

  return (
    <div className="space-y-4">
      {/* Hero cards — big, bold, few */}
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

      {/* House current bars — visual & compact */}
      <div className="glass-card rounded-2xl p-4 border border-white/5">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3">House Current Distribution</p>
        <div className="space-y-2.5">
          {houses.map((h, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase opacity-50 w-14 shrink-0">{h.name}</span>
              <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full ${h.color} rounded-full transition-all duration-700 ease-out`} 
                  style={{ width: `${Math.min((h.value / maxCurrent) * 100, 100)}%` }} 
                />
              </div>
              <span className="text-xs font-black tabular-nums w-16 text-right">{h.value.toFixed(2)} A</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail chips — single compact row */}
      <div className="flex flex-wrap gap-2">
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
