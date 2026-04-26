import React from 'react';
import { Cloud, Cpu, BatteryMedium, AlertTriangle } from 'lucide-react';

const normalColor   = '#3b82f6'; // blue
const theftColor    = '#f43f5e'; // rose
const dimColor      = 'rgba(148,163,184,0.2)';
const gridLineColor = 'rgba(255,255,255,0.03)';

// Helper for drawing wires with right angles. 
// Always define (x1, y1) as the SOURCE and (x2, y2) as the DESTINATION so the animation flows correctly.
const Wire = ({ x1, y1, x2, y2, color, dashed, animated = true, isOffline }) => (
  <line 
    x1={x1} y1={y1} x2={x2} y2={y2} 
    stroke={isOffline ? dimColor : color} 
    strokeWidth={2.5}
    strokeDasharray={dashed ? "6 6" : "none"}
    className={animated && !isOffline && !dashed ? 'wire-flow' : ''} 
    strokeLinecap="round" 
  />
);

// Reusable node box
const NodeBox = ({ x, y, label, sublabel, value, isTheft, width = 90, height = 56, isOffline }) => {
  const borderColor = isTheft ? theftColor : normalColor;
  const fillColor = isTheft ? 'rgba(244,63,94,0.08)' : 'rgba(59,130,246,0.06)';
  const rx = x - width / 2;
  const ry = y - height / 2;

  return (
    <g>
      {!isOffline && isTheft && (
        <rect x={rx - 2} y={ry - 2} width={width + 4} height={height + 4} rx={8} fill="none" stroke={theftColor} strokeWidth={2} className="animate-pulse" opacity={0.6} />
      )}
      <rect x={rx} y={ry} width={width} height={height} rx={8} fill={isOffline ? 'rgba(30,41,59,0.4)' : fillColor} stroke={isOffline ? dimColor : borderColor} strokeWidth={1.5} />
      <text x={x} y={y - 8} textAnchor="middle" className="fill-[var(--muted)]" style={{ fontSize: 11, fontWeight: 800 }}>{label}</text>
      {sublabel && <text x={x} y={y + 4} textAnchor="middle" className="fill-[var(--muted)] opacity-50" style={{ fontSize: 9 }}>{sublabel}</text>}
      <text x={x} y={y + 18} textAnchor="middle" className={isTheft ? 'fill-rose-400' : 'fill-[var(--foreground)]'} style={{ fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>
        {isOffline ? '—' : `${value.toFixed(2)}A`}
      </text>
    </g>
  );
};

const WiringDiagram = ({ readings, theft, isOffline }) => {
  const { CS1 = 0, CS2 = 0, CS3 = 0, CS4 = 0, PCS1 = 0, PCS2 = 0, voltage = 0 } = readings || {};

  const mainWire  = theft?.mainTheft  ? theftColor : normalColor;
  const pole1Wire = theft?.pole1Theft ? theftColor : normalColor;
  const pole2Wire = theft?.pole2Theft ? theftColor : normalColor;

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-8 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">System Architecture & Wiring Map</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] opacity-40 font-bold uppercase">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[10px] opacity-40 font-bold uppercase">Theft Detected</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flow-forward {
          to { stroke-dashoffset: -24; }
        }
        .wire-flow {
          stroke-dasharray: 8 6;
          animation: flow-forward 0.8s linear infinite;
        }
      `}</style>

      {/* SVG Layout designed bottom-to-top with straight right-angled wiring */}
      <div className="w-full overflow-x-auto scrollbar-none flex justify-center">
        <svg viewBox="0 0 800 520" className="w-full min-w-[700px] max-w-4xl" style={{ maxHeight: '70vh' }}>
          
          {/* ── Background Zones ──────────────────────────────────────── */}
          {/* Pole 1 Zone (Left) */}
          <rect x={40} y={40} width={340} height={220} rx={12} fill="rgba(255,255,255,0.01)" stroke={gridLineColor} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={210} y={245} textAnchor="middle" className="fill-[var(--muted)] opacity-20" style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.2em' }}>POLE 1 ZONE</text>
          
          {/* Pole 2 Zone (Right) */}
          <rect x={420} y={40} width={340} height={220} rx={12} fill="rgba(255,255,255,0.01)" stroke={gridLineColor} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={590} y={245} textAnchor="middle" className="fill-[var(--muted)] opacity-20" style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.2em' }}>POLE 2 ZONE</text>


          {/* ── Vertical Wiring Bottom-to-Top ─────────────────────────── */}
          
          {/* Battery to VS */}
          <Wire isOffline={isOffline} x1={400} y1={460} x2={400} y2={420} color={mainWire} />
          {/* VS to CS4 */}
          <Wire isOffline={isOffline} x1={400} y1={420} x2={400} y2={350} color={mainWire} />
          {/* CS4 to Main Split */}
          <Wire isOffline={isOffline} x1={400} y1={350} x2={400} y2={300} color={mainWire} />

          {/* Main Split to Poles */}
          <Wire isOffline={isOffline} x1={400} y1={300} x2={210} y2={300} color={mainWire} /> {/* Left to Pole 1 */}
          <Wire isOffline={isOffline} x1={400} y1={300} x2={590} y2={300} color={mainWire} /> {/* Right to Pole 2 */}

          {/* Up to PCS Nodes */}
          <Wire isOffline={isOffline} x1={210} y1={300} x2={210} y2={220} color={mainWire} />
          <Wire isOffline={isOffline} x1={590} y1={300} x2={590} y2={220} color={mainWire} />

          {/* Pole 1 (PCS1) Split */}
          <Wire isOffline={isOffline} x1={210} y1={220} x2={210} y2={160} color={pole1Wire} />
          <Wire isOffline={isOffline} x1={210} y1={160} x2={110} y2={160} color={pole1Wire} /> {/* Left to H1 */}
          <Wire isOffline={isOffline} x1={210} y1={160} x2={310} y2={160} color={pole1Wire} /> {/* Right to H2 */}
          <Wire isOffline={isOffline} x1={110} y1={160} x2={110} y2={90} color={pole1Wire} /> {/* Up to H1 */}
          <Wire isOffline={isOffline} x1={310} y1={160} x2={310} y2={90} color={pole1Wire} /> {/* Up to H2 */}

          {/* Pole 1 Theft Wire (only drawn if theft) */}
          {theft?.pole1Theft && (
            <Wire isOffline={isOffline} x1={210} y1={160} x2={210} y2={90} color={theftColor} />
          )}

          {/* Pole 2 (PCS2) Split */}
          <Wire isOffline={isOffline} x1={590} y1={220} x2={590} y2={160} color={pole2Wire} />
          <Wire isOffline={isOffline} x1={590} y1={160} x2={530} y2={160} color={pole2Wire} /> {/* Left to H3 */}
          <Wire isOffline={isOffline} x1={530} y1={160} x2={530} y2={90} color={pole2Wire} /> {/* Up to H3 */}

          {/* Pole 2 Theft Wire (only drawn if theft) */}
          {theft?.pole2Theft && (
            <>
              <Wire isOffline={isOffline} x1={590} y1={160} x2={650} y2={160} color={theftColor} />
              <Wire isOffline={isOffline} x1={650} y1={160} x2={650} y2={90} color={theftColor} />
            </>
          )}

          {/* Auxiliary Components to VS */}
          <Wire isOffline={isOffline} x1={520} y1={420} x2={400} y2={420} color={normalColor} animated={false} /> {/* ESP32 to VS */}
          <Wire isOffline={isOffline} x1={660} y1={420} x2={600} y2={420} color={dimColor} dashed animated={false} /> {/* Firebase to ESP32 */}


          {/* ── System Components (Bottom) ────────────────────────────── */}
          
          {/* Battery / Source */}
          <rect x={350} y={460} width={100} height={50} rx={8} fill="rgba(255,255,255,0.03)" stroke={dimColor} strokeWidth={1.5} />
          <text x={400} y={485} textAnchor="middle" className="fill-[var(--foreground)]" style={{ fontSize: 14, fontWeight: 900 }}>
            {isOffline ? '—' : `${voltage.toFixed(1)}V`}
          </text>
          <text x={365} y={485} textAnchor="middle" className="fill-[var(--muted)] opacity-60" style={{ fontSize: 14, fontWeight: 900 }}>+</text>
          <text x={435} y={485} textAnchor="middle" className="fill-[var(--muted)] opacity-60" style={{ fontSize: 14, fontWeight: 900 }}>-</text>
          <text x={400} y={450} textAnchor="middle" className="fill-[var(--muted)] opacity-50" style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>POWER SOURCE</text>
          
          {/* ESP32 */}
          <rect x={520} y={390} width={80} height={60} rx={8} fill="rgba(59,130,246,0.05)" stroke={normalColor} strokeWidth={1.5} />
          <text x={560} y={425} textAnchor="middle" className="fill-[var(--foreground)]" style={{ fontSize: 14, fontWeight: 900 }}>ESP32</text>
          
          {/* Firebase Cloud */}
          <path d="M690,440 a15,15 0 0,1 15,-15 a20,20 0 0,1 35,0 a15,15 0 0,1 10,25 a15,15 0 0,1 -15,10 l-35,0 a15,15 0 0,1 -10,-20 z" 
                fill="rgba(59,130,246,0.02)" stroke={dimColor} strokeWidth={1.5} />
          <text x={720} y={445} textAnchor="middle" className="fill-blue-400" style={{ fontSize: 11, fontWeight: 800 }}>Firebase</text>


          {/* ── Junction Nodes ───────────────────────────────────────── */}
          
          {/* VS Junction */}
          <circle cx={400} cy={420} r={5} fill={mainWire} />
          <text x={385} y={415} textAnchor="end" className="fill-[var(--foreground)]" style={{ fontSize: 11, fontWeight: 900 }}>VS</text>

          {/* Split Junctions */}
          <circle cx={400} cy={300} r={4} fill={mainWire} />
          <circle cx={210} cy={160} r={4} fill={pole1Wire} />
          <circle cx={590} cy={160} r={4} fill={pole2Wire} />


          {/* ── Main & Pole Sensor Nodes ─────────────────────────────── */}
          
          <NodeBox isOffline={isOffline} x={400} y={350} label="Main Input" value={CS4} isTheft={theft?.mainTheft} />
          <NodeBox isOffline={isOffline} x={210} y={220} label="Pole 1" value={PCS1} isTheft={theft?.pole1Theft} />
          <NodeBox isOffline={isOffline} x={590} y={220} label="Pole 2" value={PCS2} isTheft={theft?.pole2Theft} />


          {/* ── End Nodes (Houses & Theft Loads) ────────────────────── */}
          
          {/* Pole 1 - Houses */}
          <NodeBox isOffline={isOffline} x={110} y={90} label="House 1" value={CS1} isTheft={theft?.pole1Theft} />
          <NodeBox isOffline={isOffline} x={310} y={90} label="House 2" value={CS2} isTheft={theft?.pole1Theft} />
          
          {/* Pole 1 - Theft Load (Only visible on theft) */}
          {theft?.pole1Theft && !isOffline && (
            <g transform={`translate(210, 90)`} className="animate-pulse">
              <circle cx={0} cy={0} r={28} fill="rgba(244,63,94,0.1)" stroke={theftColor} strokeWidth={2} />
              <AlertTriangle x={-12} y={-18} size={24} className="text-rose-500" />
              <text x={0} y={42} textAnchor="middle" className="fill-rose-400" style={{ fontSize: 10, fontWeight: 900 }}>THEFT LOAD</text>
            </g>
          )}

          {/* Pole 2 - House */}
          <NodeBox isOffline={isOffline} x={530} y={90} label="House 3" value={CS3} isTheft={theft?.pole2Theft} />
          
          {/* Pole 2 - Theft Load (Only visible on theft) */}
          {theft?.pole2Theft && !isOffline && (
            <g transform={`translate(650, 90)`} className="animate-pulse">
              <circle cx={0} cy={0} r={28} fill="rgba(244,63,94,0.1)" stroke={theftColor} strokeWidth={2} />
              <AlertTriangle x={-12} y={-18} size={24} className="text-rose-500" />
              <text x={0} y={42} textAnchor="middle" className="fill-rose-400" style={{ fontSize: 10, fontWeight: 900 }}>THEFT LOAD</text>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};

export default WiringDiagram;
