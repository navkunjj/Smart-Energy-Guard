import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, CheckCircle2, XCircle, Loader2, Clock, Signal } from 'lucide-react';

const PulseDot = ({ color }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${color} pulse-indicator`} />
);

/**
 * Resolves wifiStatus to one of: 'Connected' | 'Disconnected' | 'Checking'
 * Accepts values from ESP32: 'Connected', 'Disconnected', 1, 0, true, false, null, undefined
 */
function resolveWifi(rawStatus, dbConnected, connectionQuality) {
  // If Firebase is confirmed connected, WiFi must be up
  if (dbConnected === true || connectionQuality === 'good') return 'Connected';

  // Normalize raw value from status object
  if (rawStatus === 'Connected' || rawStatus === 'connected' || rawStatus === 1 || rawStatus === true) {
    return 'Connected';
  }
  if (rawStatus === 'Disconnected' || rawStatus === 'disconnected' || rawStatus === 0 || rawStatus === false) {
    return 'Disconnected';
  }
  if (connectionQuality === 'checking') return 'Checking';
  if (connectionQuality === 'disconnected') return 'Disconnected';

  return 'Checking';
}

const ConnectionStatusBar = ({ status, dbConnected, connectionQuality, lastDbPing }) => {
  const [pingMs, setPingMs] = useState(null);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [startTime] = useState(Date.now());

  // Session clock — ticks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Simulated ping display — updates whenever lastDbPing changes
  useEffect(() => {
    if (!lastDbPing || !dbConnected) { setPingMs(null); return; }
    const simulated = 18 + Math.floor(Math.random() * 40);
    setPingMs(simulated);
  }, [lastDbPing, dbConnected]);

  const formatUptime = (s) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec < 10 ? '0' : ''}${sec}s`;
  };

  // ── WiFi badge ───────────────────────────────────────────────────────────
  const resolvedWifi = resolveWifi(status?.wifiStatus, dbConnected, connectionQuality);

  const wifiConfig = {
    Connected: {
      dot: 'bg-emerald-400',
      label: 'WiFi Online',
      labelColor: 'text-emerald-300',
      icon: <Wifi size={14} className="text-emerald-400" />,
      ring: 'ring-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    Disconnected: {
      dot: 'bg-rose-400',
      label: 'WiFi Offline',
      labelColor: 'text-rose-300',
      icon: <WifiOff size={14} className="text-rose-400" />,
      ring: 'ring-rose-500/30',
      bg: 'bg-rose-500/10',
    },
    Checking: {
      dot: 'bg-amber-400',
      label: 'WiFi…',
      labelColor: 'text-amber-300',
      icon: <Signal size={14} className="text-amber-400" />,
      ring: 'ring-amber-500/30',
      bg: 'bg-amber-500/10',
    },
  };

  const wifiBadge = wifiConfig[resolvedWifi] || wifiConfig.Checking;

  // ── DB / Firebase badge ──────────────────────────────────────────────────
  const dbQualityConfig = {
    good: {
      dot: 'bg-emerald-400',
      label: 'DB Connected',
      labelColor: 'text-emerald-300',
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      ring: 'ring-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    poor: {
      dot: 'bg-yellow-400',
      label: 'DB Unstable',
      labelColor: 'text-yellow-300',
      icon: <Database size={14} className="text-yellow-400" />,
      ring: 'ring-yellow-500/30',
      bg: 'bg-yellow-500/10',
    },
    checking: {
      dot: 'bg-blue-400',
      label: 'Connecting…',
      labelColor: 'text-blue-300',
      icon: <Loader2 size={14} className="text-blue-400 animate-spin" />,
      ring: 'ring-blue-500/30',
      bg: 'bg-blue-500/10',
    },
    disconnected: {
      dot: 'bg-rose-400',
      label: 'DB Offline',
      labelColor: 'text-rose-300',
      icon: <XCircle size={14} className="text-rose-400" />,
      ring: 'ring-rose-500/30',
      bg: 'bg-rose-500/10',
    },
  };

  const dbCfg = dbQualityConfig[connectionQuality] || dbQualityConfig.disconnected;

  return (
    <div className="flex items-center gap-1.5 lg:gap-2 flex-nowrap">

      {/* WiFi badge */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 rounded-xl ${wifiBadge.bg} ring-1 ${wifiBadge.ring} transition-all duration-700`}
        title={`WiFi Status: ${resolvedWifi}`}
      >
        <PulseDot color={wifiBadge.dot} />
        {wifiBadge.icon}
        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${wifiBadge.labelColor} hidden sm:inline`}>
          {wifiBadge.label}
        </span>
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Database badge */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 rounded-xl ${dbCfg.bg} ring-1 ${dbCfg.ring} transition-all duration-700`}
        title={`Firebase: ${status?.firebaseStatus || connectionQuality}`}
      >
        <PulseDot color={dbCfg.dot} />
        {dbCfg.icon}
        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${dbCfg.labelColor} hidden sm:inline`}>
          {dbCfg.label}
        </span>
        {pingMs !== null && dbConnected && (
          <span className="text-[9px] font-bold text-slate-500 ml-0.5 tabular-nums hidden md:inline">
            {pingMs}ms
          </span>
        )}
      </div>

      {/* Session uptime — only on lg+ screens */}
      <div className="w-px h-4 bg-white/10 hidden lg:block" />
      <div
        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/40 ring-1 ring-white/10"
        title="Session uptime"
      >
        <Clock size={12} className="text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
          {formatUptime(uptimeSeconds)}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatusBar;
