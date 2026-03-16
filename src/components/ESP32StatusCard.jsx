import React from 'react';
import { Wifi, Cpu, Clock, Signal, AlertTriangle } from 'lucide-react';

const ESP32StatusCard = ({ status }) => {
  const isOnline = status?.esp32Online || false;
  const wifiSignal = status?.wifiSignal || 0;
  
  // Calculate wifi strength styling
  let signalColor = 'text-gray-500';
  let signalClass = 'bg-gray-500/10 border-gray-500/20';
  let signalLabel = 'Unknown';
  
  if (isOnline) {
    if (wifiSignal > -60) {
      signalColor = 'text-emerald-400';
      signalClass = 'bg-emerald-500/10 border-emerald-500/20';
      signalLabel = 'Strong';
    } else if (wifiSignal >= -70) {
      signalColor = 'text-yellow-400';
      signalClass = 'bg-yellow-500/10 border-yellow-500/20';
      signalLabel = 'Medium';
    } else if (wifiSignal < -70 && wifiSignal !== 0) {
      signalColor = 'text-rose-400';
      signalClass = 'bg-rose-500/10 border-rose-500/20';
      signalLabel = 'Weak';
    }
  }

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const mins = Math.floor(secondsAgo / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-lg relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-colors duration-1000 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            <Cpu size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">ESP32 Status</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Core Module</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          {isOnline && <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Signal size={16} className={isOnline ? signalColor : 'text-gray-500'} />
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Wi-Fi Signal</span>
          </div>
          {isOnline ? (
            <div className="flex items-end gap-2">
              <span className={`text-xl font-black ${signalColor}`}>{wifiSignal} <span className="text-xs font-semibold text-gray-500">dBm</span></span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${signalClass} mb-1 flex items-center gap-1`}>
                {signalLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-gray-600">--</span>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-4 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Heartbeat</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{formatLastSeen(status?.esp32LastSeen)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Last Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESP32StatusCard;
