import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, Smartphone, Filter, Download, RefreshCw, Clock } from 'lucide-react';

const FILTERS = ['all', 'control', 'warning', 'success', 'info'];

const getIcon = (type) => {
  switch (type) {
    case 'danger':
    case 'warning': return <AlertTriangle size={14} className="text-rose-400" />;
    case 'control': return <Smartphone size={14} className="text-blue-400" />;
    case 'success': return <CheckCircle size={14} className="text-emerald-400" />;
    default: return <Info size={14} className="text-gray-400" />;
  }
};

const getBadgeClass = (type) => {
  switch (type) {
    case 'warning': case 'danger': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'control': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default: return 'bg-white/5 text-gray-400 border-white/10';
  }
};

const formatTime = (ts) => {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
};

const LogsPage = ({ logs }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter(log => {
    const matchType = activeFilter === 'all' || log.type === activeFilter;
    const matchSearch = !search || log.event?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? logs.length : logs.filter(l => l.type === f).length;
    return acc;
  }, {});

  return (
    <div>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">EVENT LOGS</h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            System Event Registry • {logs.length} total records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-indicator inline-block" />
            LIVE FEED
          </span>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                activeFilter === f
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
              }`}
            >
              {f} {counts[f] > 0 && <span className="ml-1 opacity-60">({counts[f]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/3 border-b border-white/10">
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? filtered.map((log, idx) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4 text-[10px] text-gray-600 font-mono">{filtered.length - idx}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                        {getIcon(log.type)}
                      </div>
                      <span className="text-sm text-gray-200 font-medium">{log.event}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-600" />
                      <span className="text-xs text-gray-500 font-mono">{formatTime(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${getBadgeClass(log.type)}`}>
                      {log.type || 'system'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-5 py-20 text-center">
                    <p className="text-gray-500 text-sm">No events match your filter.</p>
                    <p className="text-gray-600 text-xs mt-1">Try changing the filter or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-gray-600">Showing {filtered.length} of {logs.length} events</span>
            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">Last 50 records stored</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
