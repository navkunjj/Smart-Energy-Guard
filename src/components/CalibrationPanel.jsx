import React from 'react';
import { FlaskConical, CheckCircle2, Loader2, Sliders, RefreshCw, Activity } from 'lucide-react';

const phaseLabels = {
  sampling: 'Sampling sensor readings…',
  computing: 'Computing offset corrections…',
  applying: 'Applying calibration offsets…',
  done: 'Calibration complete!',
};

const phaseColors = {
  sampling: 'text-blue-400',
  computing: 'text-purple-400',
  applying: 'text-yellow-400',
  done: 'text-emerald-400',
};

const CalibrationPanel = ({ calibrationState, runCalibration }) => {
  const { isRunning, progress, phase, lastCalibrated, offsets } = calibrationState;

  const formatTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const hasOffsets = offsets && Object.values(offsets).some(v => v !== 0);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-indigo-500/20 blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sensor Calibration</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
              {lastCalibrated ? `Last run: ${formatTime(lastCalibrated)}` : 'Never calibrated'}
            </p>
          </div>
        </div>

        <button
          onClick={runCalibration}
          disabled={isRunning}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 w-full sm:w-auto
            ${isRunning
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 hover:text-white cursor-pointer'
            }`}
        >
          {isRunning
            ? <Loader2 size={12} className="animate-spin" />
            : <RefreshCw size={12} className={!isRunning && phase === 'done' ? 'text-emerald-400' : ''} />
          }
          {isRunning ? 'Running…' : 'Run Calibration'}
        </button>
      </div>

      {/* Progress bar (shown while running or just done) */}
      {(isRunning || phase === 'done') && (
        <div className="mb-5 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${phaseColors[phase] || 'text-slate-400'}`}>
              {isRunning && <Loader2 size={10} className="animate-spin" />}
              {phase === 'done' && <CheckCircle2 size={10} />}
              {phaseLabels[phase] || ''}
            </span>
            <span className="text-[10px] font-black text-slate-400">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                phase === 'done'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Offsets display */}
      {hasOffsets && (
        <div className="relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
            <Activity size={10} className="text-slate-500" />
            Applied Calibration Offsets
          </p>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
            {Object.entries(offsets).map(([key, val]) => (
              <div
                key={key}
                className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors flex flex-col items-center sm:items-start"
              >
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                  {key === 'mainLine' ? 'Main' : key === 'house1' ? 'H-1' : key === 'house2' ? 'H-2' : key === 'house3' ? 'H-3' : 'Volt'}
                </p>
                <p className={`text-xs sm:text-sm font-black ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {val >= 0 ? '+' : ''}{val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idle description */}
      {!isRunning && phase !== 'done' && !hasOffsets && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 border border-white/5 relative z-10">
          <FlaskConical size={20} className="text-slate-500 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Run calibration to sample sensor readings, compute offset corrections, and improve accuracy of current &amp; voltage measurements.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalibrationPanel;
