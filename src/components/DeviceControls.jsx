import React from 'react';
import { Power, Bell, RotateCcw, Lightbulb } from 'lucide-react';

const DeviceControls = ({ controls, updateControl, resetSystem }) => {
  const controlButtons = [
    { id: 'led', label: 'Sys LED', icon: Lightbulb, color: 'text-yellow-400', activeBg: 'bg-yellow-400/20 border-yellow-400/50' },
    { id: 'relay', label: 'Relay', icon: Power, color: 'text-blue-400', activeBg: 'bg-blue-400/20 border-blue-400/50' },
    { id: 'alarm', label: 'Alarm', icon: Bell, color: 'text-rose-400', activeBg: 'bg-rose-400/20 border-rose-400/50' },
  ];

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl">
      <h3 className="text-[10px] md:text-sm font-bold opacity-40 uppercase tracking-widest mb-4 md:mb-6">System Controls</h3>
      
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-2 gap-3 md:gap-4">
        {controlButtons.map((btn) => {
          const isActive = controls[btn.id] === 1;
          const Icon = btn.icon;
          
          return (
            <button
              key={btn.id}
              onClick={() => updateControl(btn.id, !isActive)}
              className={`p-3 md:p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 md:gap-3 ${
                isActive 
                ? `${btn.activeBg} shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--hover-border)]'
              }`}
            >
              <div className={`p-2.5 md:p-3 rounded-xl ${isActive ? 'bg-white/10' : 'bg-[var(--card-bg)] opacity-40'}`}>
                <Icon size={20} className={isActive ? btn.color : ''} />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase opacity-40 mb-0.5">{btn.label}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[var(--foreground)]' : 'opacity-40'}`}>
                  {isActive ? 'ON' : 'OFF'}
                </p>
              </div>
            </button>
          );
        })}
        
        <button
          onClick={resetSystem}
          className="p-3 md:p-4 rounded-2xl border bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--hover-bg)] hover:border-[var(--hover-border)] transition-all flex flex-col items-center gap-2 md:gap-3 col-span-2 xs:col-span-1 md:col-span-2 mt-1 md:mt-2"
        >
          <div className="p-2.5 md:p-3 rounded-xl bg-blue-600/20 text-blue-400">
            <RotateCcw size={20} />
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase opacity-40 mb-0.5">Emergency</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">RESET</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DeviceControls;
