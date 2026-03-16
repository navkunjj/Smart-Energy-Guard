import React from 'react';
import { Info, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

const EventLog = ({ logs }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'danger':
      case 'warning': return <AlertTriangle size={14} className="text-rose-400" />;
      case 'control': return <Smartphone size={14} className="text-blue-400" />;
      case 'success': return <CheckCircle size={14} className="text-emerald-400" />;
      default: return <Info size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider">System Event Registry</h3>
        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
          LIVE FEED
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--background)] z-10 transition-colors">
            <tr>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Event</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Timestamp</th>
              <th className="p-3 text-[10px] font-black opacity-40 uppercase">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--card-border)] transition-colors group">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] group-hover:bg-[var(--card-border)] transition-colors">
                      {getIcon(log.type)}
                    </div>
                    <span className="text-xs font-medium opacity-80">{log.event}</span>
                  </div>
                </td>
                <td className="p-3 text-[10px] opacity-40 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="p-3">
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 border border-[var(--card-border)] px-1.5 py-0.5 rounded">
                    {log.type || 'SYSTEM'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="p-20 text-center opacity-30 text-xs italic">
                  Waiting for system events...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventLog;
