import React from 'react';
import { Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { isWithinTolerance } from '../utils/theftDetection';

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
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Main</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Pole 1</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Pole 2</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">House 1</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">House 2</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">House 3</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {[...history].reverse().map((entry, idx) => {
              const mainOk  = isWithinTolerance(entry.CS4 || 0, (entry.PCS1 || 0) + (entry.PCS2 || 0));
              const pole1Ok = isWithinTolerance(entry.PCS1 || 0, (entry.CS1 || 0) + (entry.CS2 || 0));
              const pole2Ok = isWithinTolerance(entry.PCS2 || 0, entry.CS3 || 0);
              const allOk   = mainOk && pole1Ok && pole2Ok;

              return (
                <tr key={idx} className={`hover:bg-[var(--card-border)] transition-colors ${!allOk ? 'bg-rose-500/5' : ''}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="opacity-40" />
                      <span className="text-xs font-mono opacity-80">{entry.time}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs font-mono text-amber-400">{(entry.CS4 ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-xs font-mono text-blue-400">{(entry.PCS1 ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-xs font-mono text-cyan-400">{(entry.PCS2 ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-xs font-mono">{(entry.CS1 ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-xs font-mono">{(entry.CS2 ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-xs font-mono">{(entry.CS3 ?? 0).toFixed(2)}</td>
                  <td className="p-3">
                    {allOk ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase">
                        <ShieldCheck size={12} /> OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase">
                        <ShieldAlert size={12} />
                        {!mainOk ? 'Main' : !pole1Ok ? 'P1' : 'P2'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr>
                <td colSpan="8" className="p-20 text-center opacity-30 text-xs italic">
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
