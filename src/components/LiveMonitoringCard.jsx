import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const LiveMonitoringCard = ({ title, value, unit, icon: Icon, trend, color, liveFlash }) => {
  const colorMap = {
    blue:   'border-blue-500/30   text-blue-400   bg-blue-500/10',
    green:  'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    orange: 'border-orange-500/30  text-orange-400  bg-orange-500/10',
    purple: 'border-purple-500/30  text-purple-400  bg-purple-500/10',
    red:    'border-rose-500/30    text-rose-400    bg-rose-500/10',
  };

  // Flash ring on value update
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!liveFlash) return;
    if (prevValue.current !== value) {
      prevValue.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [value, liveFlash]);

  // Format: if numeric, show to 2 decimal places
  const displayValue = typeof value === 'number' ? value : value;

  return (
    <div
      className={`glass-card p-5 rounded-2xl group hover:border-[var(--hover-border)] transition-all duration-300 relative overflow-hidden
        ${flash ? 'ring-1 ring-emerald-400/60' : 'ring-1 ring-transparent'}`}
      style={{ transition: 'ring-color 0.4s ease' }}
    >
      {/* Live pulse dot — top right corner */}
      {liveFlash && (
        <span
          className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full transition-colors duration-300
            ${flash ? 'bg-emerald-400 scale-125' : 'bg-[var(--muted)]/40'}`}
          style={{ transition: 'background-color 0.3s, transform 0.3s' }}
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-60 uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3
              className={`text-2xl font-bold transition-colors duration-300 tabular-nums
                ${flash ? 'text-emerald-400' : 'group-hover:text-blue-500'}`}
            >
              {displayValue}
            </h3>
            <span className="text-sm font-medium opacity-50">{unit}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          <Icon size={20} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {trend > 0
              ? <TrendingUp size={12} className="mr-1" />
              : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
          <span className="text-[10px] text-gray-500 uppercase font-medium">vs last hour</span>
        </div>
      )}

      {/* Subtle live data indicator bar at bottom */}
      {liveFlash && (
        <div
          className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-500
            ${flash ? 'w-full bg-emerald-400/60' : 'w-0 bg-transparent'}`}
        />
      )}
    </div>
  );
};

export default LiveMonitoringCard;
