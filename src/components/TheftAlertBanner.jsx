import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/* ── Main theft alert banner ─────────────────────────────────────── */
const TheftAlertBanner = ({ theft, isOffline }) => {
  if (isOffline || !theft.anyTheft) return null;

  const messages = [];
  if (theft.mainTheft) messages.push("Main Input Mismatch");
  if (theft.pole1Theft) messages.push("Theft at Pole 1");
  if (theft.pole2Theft) messages.push("Theft at Pole 2");

  let displayMessage = messages.length > 1
    ? "Multiple Thefts Detected Across System"
    : (messages[0] || "Suspicious Activity Detected");

  return (
    <div className="fixed top-20 right-4 lg:top-24 lg:right-6 z-[100] max-w-sm w-[calc(100%-2rem)] md:w-96 theft-banner rounded-2xl px-5 py-4 border border-rose-500/50 flex items-center gap-4 shadow-2xl shadow-rose-500/20 backdrop-blur-2xl bg-slate-900/95">
      <div className="p-2 bg-rose-500/20 rounded-xl shrink-0">
        <AlertTriangle size={22} className="text-rose-400 animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-0.5">
          ⚡ Active Theft Alert
        </h3>
        <p className="text-xs font-bold text-rose-300/90 truncate">
          {displayMessage}
        </p>
      </div>
    </div>
  );
};

export default TheftAlertBanner;
