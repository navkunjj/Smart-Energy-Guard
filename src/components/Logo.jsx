import React from 'react';

const Logo = ({ size = 40, showText = true, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div style={{ width: size, height: size }} className="shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          
          {/* Main Circle Ring */}
          <path 
            d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10" 
            stroke="url(#logoGradient)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill="none"
          />
          
          {/* Lightning Bolt */}
          <path 
            d="M55 25 L35 55 H50 L45 75 L65 45 H50 Z" 
            fill="url(#logoGradient)" 
          />
          
          {/* The Leaf */}
          <path 
            d="M60 65 C75 65 85 50 85 40 C75 40 60 50 60 65" 
            fill="#10B981" 
          />
          <path 
            d="M60 65 L85 40" 
            stroke="#065F46" 
            strokeWidth="1" 
            opacity="0.3"
          />

          {/* Decorative Dots */}
          <circle cx="35" cy="78" r="3" fill="#0F172A" />
          <circle cx="28" cy="72" r="4" fill="#0F172A" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className="text-sm font-black leading-none tracking-tight">
            SMART <span className="text-emerald-500">ENERGY</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] flex-1 bg-current opacity-20" />
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">GUARD</p>
            <div className="h-[1px] flex-1 bg-current opacity-20" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
