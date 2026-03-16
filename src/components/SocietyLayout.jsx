import React from 'react';
import { Home, Zap, ArrowRight, Cable, ShieldAlert, Activity } from 'lucide-react';

const SocietyLayout = ({ readings, status }) => {
  const houses = [
    { id: 'house1', label: 'House 1', current: readings.house1 },
    { id: 'house2', label: 'House 2', current: readings.house2 },
    { id: 'house3', label: 'House 3', current: readings.house3 },
  ];

  const isTheft = (houseId) => status.theftDetected && status.location.includes(houseId);

  return (
    <div className="glass-card p-6 rounded-2xl h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Cable size={20} className="text-blue-400" />
          Society Layout Visualization
        </h3>
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="opacity-60">Normal</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> <span className="opacity-60">Theft</span></div>
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 py-6 md:py-10">
        {/* Main Transformer / Pole */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/20 border-2 border-blue-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Zap size={28} className="text-blue-400" />
          </div>
          <p className="mt-3 md:mt-4 text-[10px] md:text-xs font-black uppercase tracking-tighter text-center line-clamp-2 w-20 md:w-24">Main Pole</p>
          <p className="text-[10px] text-blue-400 font-bold">{readings.mainLine}A</p>
        </div>

        {/* Connection Lines Container (Desktop) */}
        <div className="hidden md:block absolute left-20 right-20 top-1/2 h-0.5 bg-gradient-to-r from-blue-500/50 via-[var(--card-border)] to-transparent"></div>
        
        {/* Connection Lines (Mobile) */}
        <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-[var(--card-border)]"></div>

        {/* Houses Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 w-full">
          {houses.map((house) => {
            const theft = isTheft(house.id);
            return (
              <div key={house.id} className="relative flex flex-col items-center">
                {/* Horizontal connection segment for visual flow (Desktop) */}
                <div className="hidden md:block absolute -top-12 left-1/2 w-0.5 h-12 bg-[var(--card-border)]"></div>
                
                <div className={`w-full relative z-10 p-4 md:p-6 rounded-2xl transition-all duration-500 border-2 ${
                  theft 
                  ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-blue-500/30'
                }`}>
                  <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0">
                    <Home size={28} className={`${theft ? 'text-rose-500' : 'opacity-40'} shrink-0 md:mb-4`} />
                    <div className="text-left md:text-center flex-1">
                      <p className="text-[11px] md:text-xs font-bold mb-0.5 md:mb-1">{house.label}</p>
                      <p className={`text-xs md:text-sm font-black ${theft ? 'text-rose-400' : 'text-emerald-500'}`}>
                        {house.current} <span className="text-[9px] md:text-[10px]">A</span>
                      </p>
                    </div>
                  </div>

                  {theft && (
                    <div className="absolute -top-2 -right-2 p-1 bg-rose-500 rounded-full text-white">
                      <ShieldAlert size={12} />
                    </div>
                  )}
                </div>
                
                {/* Mobile spacer line between houses if needed (managed by grid gap mostly, but we could add visual flow) */}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[var(--card-border)] grid grid-cols-2 gap-3 md:flex md:flex-wrap md:justify-center">
        <div className="px-3 py-2 md:px-4 md:py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-[10px] md:text-xs opacity-60">Voltage:</span>
          <span className="text-[11px] md:text-xs font-bold">{readings.voltage}V</span>
        </div>
        <div className="px-3 py-2 md:px-4 md:py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center gap-2">
          <Activity size={14} className="text-blue-400" />
          <span className="text-[10px] md:text-xs opacity-60">Total Load:</span>
          <span className="text-[11px] md:text-xs font-bold">{readings.totalPower}kW</span>
        </div>
      </div>
    </div>
  );
};

export default SocietyLayout;
