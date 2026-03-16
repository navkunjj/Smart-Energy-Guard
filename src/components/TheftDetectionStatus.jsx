import React from 'react';
import { ShieldAlert, ShieldCheck, Clock, MapPin, RefreshCw } from 'lucide-react';

const TheftDetectionStatus = ({ status, onReset }) => {
  const isTheft = status?.theftDetected === 1 || status?.theftDetected === true;

  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-500 border-2 ${
      isTheft ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'border-emerald-500/30'
    }`}>
      {/* Background Glow */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-20 ${
        isTheft ? 'bg-rose-500' : 'bg-emerald-500'
      }`}></div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
        <div className={`p-4 md:p-5 rounded-2xl ${
          isTheft ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
        }`}>
          {isTheft ? <ShieldAlert size={32} className="pulse-indicator md:w-[48px] md:h-[48px]" /> : <ShieldCheck size={32} className="md:w-[48px] md:h-[48px]" />}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className={`text-xl md:text-2xl font-black mb-1 ${isTheft ? 'text-rose-500' : 'text-emerald-500'}`}>
            {isTheft ? 'POWER THEFT DETECTED!' : 'SYSTEM SECURED'}
          </h2>
          <p className="opacity-60 text-[11px] md:text-sm font-medium uppercase tracking-widest leading-relaxed">
            {isTheft ? 'Unauthorized tapping detected on the network' : 'All lines operating within normal parameters'}
          </p>
        </div>

        {isTheft && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
              <MapPin size={16} className="text-rose-400" />
              <div>
                <p className="text-[10px] opacity-40 uppercase font-bold">Location</p>
                <p className="text-xs md:text-sm font-semibold">{status.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
              <Clock size={16} className="text-blue-400" />
              <div>
                <p className="text-[10px] opacity-40 uppercase font-bold">Time</p>
                <p className="text-xs md:text-sm font-semibold">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onReset}
          className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isTheft 
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
            : 'bg-[var(--card-bg)] opacity-60 hover:opacity-100 hover:bg-[var(--card-border)]'
          }`}
        >
          <RefreshCw size={18} />
          <span className="text-sm">Reset System</span>
        </button>
      </div>
    </div>
  );
};

export default TheftDetectionStatus;
