import React from 'react';
import { Clock } from 'lucide-react';

const HistoryLog = ({ history }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">System History</h3>
        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
          HISTORY FEED
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--background)] z-10 transition-colors">
            <tr>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Time</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Main (A)</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">H1</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">H2</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">H3</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Total (A)</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Volts (V)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {[...history].reverse().map((entry, idx) => (
              <tr key={idx} className="hover:bg-[var(--card-border)] transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="opacity-40" />
                    <span className="text-xs font-mono opacity-80">{entry.time}</span>
                  </div>
                </td>
                <td className="p-3 text-xs font-mono">{entry.main}</td>
                <td className="p-3 text-xs font-mono">{entry.h1}</td>
                <td className="p-3 text-xs font-mono">{entry.h2}</td>
                <td className="p-3 text-xs font-mono">{entry.h3}</td>
                <td className="p-3 text-xs font-mono text-blue-400">{entry.total ?? '—'}</td>
                <td className="p-3 text-xs font-mono text-amber-400">{entry.voltage ?? '—'}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="7" className="p-20 text-center opacity-30 text-xs italic">
                  No history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryLog;
