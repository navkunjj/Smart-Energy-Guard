import React from 'react';
import { AlertTriangle } from 'lucide-react';

const normalColor   = '#3b82f6'; // blue
const theftColor    = '#f43f5e'; // rose
const dimColor      = 'rgba(148,163,184,0.2)';
const gridLineColor = 'rgba(255,255,255,0.03)';

// Straight wire helper — animation flows from source to destination
const Wire = ({ x1, y1, x2, y2, color, dashed, animated = true, isOffline }) => (
  <line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={isOffline ? dimColor : color}
    strokeWidth={2.5}
    strokeDasharray={dashed ? '6 6' : 'none'}
    className={animated && !isOffline && !dashed ? 'wire-flow' : ''}
    strokeLinecap="round"
  />
);

// Reusable sensor node box
const NodeBox = ({ x, y, label, value, isTheft, width = 90, height = 56, isOffline }) => {
  const borderColor = isTheft ? theftColor : normalColor;
  const fillColor   = isTheft ? 'rgba(244,63,94,0.08)' : 'rgba(59,130,246,0.06)';
  const rx = x - width / 2;
  const ry = y - height / 2;

  return (
    <g>
      {!isOffline && isTheft && (
        <rect x={rx - 2} y={ry - 2} width={width + 4} height={height + 4} rx={8}
          fill="none" stroke={theftColor} strokeWidth={2} className="animate-pulse" opacity={0.6} />
      )}
      <rect x={rx} y={ry} width={width} height={height} rx={8}
        fill={isOffline ? 'rgba(30,41,59,0.4)' : fillColor}
        stroke={isOffline ? dimColor : borderColor} strokeWidth={1.5} />
      <text x={x} y={y - 8} textAnchor="middle" className="fill-[var(--muted)]"
        style={{ fontSize: 11, fontWeight: 800 }}>{label}</text>
      <text x={x} y={y + 18} textAnchor="middle"
        className={isTheft ? 'fill-rose-400' : 'fill-[var(--foreground)]'}
        style={{ fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>
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

  // ── Layout constants ────────────────────────────────────────────────────
  // SVG viewBox: 0 0 860 530
  //
  // Horizontal centres:
  //   Pole 1 zone  (narrow — 1 house):  x = 50 … 270   centre 160
  //   Pole 2 zone  (wide  — 2 houses):  x = 310 … 820  centre 565
  //
  // Vertical layers (bottom → top):
  //   460 – Power Source
  //   415 – VS junction / ESP32 / Firebase
  //   355 – Main Sensor (CS4)
  //   295 – Main Split junction
  //   220 – Pole sensors (PCS1 @ 160, PCS2 @ 565)
  //   155 – House split junctions
  //    75 – House nodes

  return (
    <div className="glass-card rounded-2xl p-4 lg:p-8 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
          System Architecture &amp; Wiring Map
        </h3>
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

      <div className="w-full overflow-x-auto scrollbar-none flex justify-center">
        {/*
          viewBox: 860 × 530
          Pole 1 zone: x 40–270  (1 house — narrow)
          Pole 2 zone: x 310–820 (2 houses — wide)
        */}
        <svg viewBox="0 0 860 530" className="w-full min-w-[700px] max-w-5xl" style={{ maxHeight: '72vh' }}>

          {/* ── Background zones ─────────────────────────────────────── */}
          {/* Pole 1 — narrow (1 house) */}
          <rect x={40}  y={40} width={230} height={230} rx={12}
            fill="rgba(255,255,255,0.01)" stroke={gridLineColor} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={155} y={255} textAnchor="middle" className="fill-[var(--muted)] opacity-20"
            style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.2em' }}>POLE 1 ZONE</text>

          {/* Pole 2 — wide (2 houses) */}
          <rect x={310} y={40} width={510} height={230} rx={12}
            fill="rgba(255,255,255,0.01)" stroke={gridLineColor} strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={565} y={255} textAnchor="middle" className="fill-[var(--muted)] opacity-20"
            style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.2em' }}>POLE 2 ZONE</text>


          {/* ── Bottom layer: Source → VS → CS4 → Main split ─────────── */}

          {/* Power Source → VS */}
          <Wire isOffline={isOffline} x1={430} y1={465} x2={430} y2={415} color={mainWire} />
          {/* VS → CS4 */}
          <Wire isOffline={isOffline} x1={430} y1={415} x2={430} y2={355} color={mainWire} />
          {/* CS4 → Main split */}
          <Wire isOffline={isOffline} x1={430} y1={355} x2={430} y2={295} color={mainWire} />

          {/* Main split → Pole 1 PCS (left, x=160) */}
          <Wire isOffline={isOffline} x1={430} y1={295} x2={160} y2={295} color={mainWire} />
          <Wire isOffline={isOffline} x1={160} y1={295} x2={160} y2={220} color={mainWire} />

          {/* Main split → Pole 2 PCS (right, x=565) */}
          <Wire isOffline={isOffline} x1={430} y1={295} x2={565} y2={295} color={mainWire} />
          <Wire isOffline={isOffline} x1={565} y1={295} x2={565} y2={220} color={mainWire} />


          {/* ── Pole 1 wiring: 1 house (House 1) ─────────────────────── */}
          {/* PCS1 → House 1 (straight up, same x=160) */}
          <Wire isOffline={isOffline} x1={160} y1={220} x2={160} y2={155} color={pole1Wire} />
          <Wire isOffline={isOffline} x1={160} y1={155} x2={160} y2={75}  color={pole1Wire} />

          {/* Pole 1 theft wire (extra illegal tap) */}
          {theft?.pole1Theft && (
            <>
              <Wire isOffline={isOffline} x1={160} y1={155} x2={80} y2={155}  color={theftColor} />
              <Wire isOffline={isOffline} x1={80}  y1={155} x2={80} y2={75}   color={theftColor} />
            </>
          )}


          {/* ── Pole 2 wiring: 2 houses (House 2 @ 460, House 3 @ 670) ── */}
          {/* PCS2 → split junction at y=155 */}
          <Wire isOffline={isOffline} x1={565} y1={220} x2={565} y2={155} color={pole2Wire} />
          {/* split → House 2 (left) */}
          <Wire isOffline={isOffline} x1={565} y1={155} x2={460} y2={155} color={pole2Wire} />
          <Wire isOffline={isOffline} x1={460} y1={155} x2={460} y2={75}  color={pole2Wire} />
          {/* split → House 3 (right) */}
          <Wire isOffline={isOffline} x1={565} y1={155} x2={670} y2={155} color={pole2Wire} />
          <Wire isOffline={isOffline} x1={670} y1={155} x2={670} y2={75}  color={pole2Wire} />

          {/* Pole 2 theft wire */}
          {theft?.pole2Theft && (
            <>
              <Wire isOffline={isOffline} x1={565} y1={155} x2={790} y2={155} color={theftColor} />
              <Wire isOffline={isOffline} x1={790} y1={155} x2={790} y2={75}  color={theftColor} />
            </>
          )}


          {/* ── Auxiliary wires (ESP32 & Firebase) ───────────────────── */}
          <Wire isOffline={isOffline} x1={560} y1={415} x2={430} y2={415} color={normalColor} animated={false} />
          <Wire isOffline={isOffline} x1={700} y1={415} x2={640} y2={415} color={dimColor} dashed animated={false} />


          {/* ── Power Source ─────────────────────────────────────────── */}
          <rect x={380} y={465} width={100} height={50} rx={8}
            fill="rgba(255,255,255,0.03)" stroke={dimColor} strokeWidth={1.5} />
          <text x={430} y={490} textAnchor="middle" className="fill-[var(--foreground)]"
            style={{ fontSize: 14, fontWeight: 900 }}>
            {isOffline ? '—' : `${voltage.toFixed(1)}V`}
          </text>
          <text x={395} y={490} textAnchor="middle" className="fill-[var(--muted)] opacity-60"
            style={{ fontSize: 14, fontWeight: 900 }}>+</text>
          <text x={465} y={490} textAnchor="middle" className="fill-[var(--muted)] opacity-60"
            style={{ fontSize: 14, fontWeight: 900 }}>-</text>
          <text x={430} y={460} textAnchor="middle" className="fill-[var(--muted)] opacity-50"
            style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>POWER SOURCE</text>

          {/* ── ESP32 ─────────────────────────────────────────────────── */}
          <rect x={560} y={390} width={80} height={55} rx={8}
            fill="rgba(59,130,246,0.05)" stroke={normalColor} strokeWidth={1.5} />
          <text x={600} y={423} textAnchor="middle" className="fill-[var(--foreground)]"
            style={{ fontSize: 13, fontWeight: 900 }}>ESP32</text>

          {/* ── Firebase cloud ────────────────────────────────────────── */}
          <path d="M730,440 a15,15 0 0,1 15,-15 a20,20 0 0,1 35,0 a15,15 0 0,1 10,25 a15,15 0 0,1 -15,10 l-35,0 a15,15 0 0,1 -10,-20 z"
            fill="rgba(59,130,246,0.02)" stroke={dimColor} strokeWidth={1.5} />
          <text x={760} y={445} textAnchor="middle" className="fill-blue-400"
            style={{ fontSize: 11, fontWeight: 800 }}>Firebase</text>


          {/* ── Junction dots ─────────────────────────────────────────── */}
          <circle cx={430} cy={415} r={5} fill={mainWire} />
          <text x={415} y={410} textAnchor="end" className="fill-[var(--foreground)]"
            style={{ fontSize: 11, fontWeight: 900 }}>VS</text>

          <circle cx={430} cy={295} r={4} fill={mainWire} />
          {/* Pole 1 house split (single house, no branch dot needed visually) */}
          <circle cx={160} cy={155} r={4} fill={pole1Wire} />
          {/* Pole 2 house split */}
          <circle cx={565} cy={155} r={4} fill={pole2Wire} />


          {/* ── Main sensor ───────────────────────────────────────────── */}
          <NodeBox isOffline={isOffline} x={430} y={355} label="Main Input" value={CS4} isTheft={theft?.mainTheft} />

          {/* ── Pole sensors ──────────────────────────────────────────── */}
          <NodeBox isOffline={isOffline} x={160} y={220} label="Pole 1"    value={PCS1} isTheft={theft?.pole1Theft} />
          <NodeBox isOffline={isOffline} x={565} y={220} label="Pole 2"    value={PCS2} isTheft={theft?.pole2Theft} />


          {/* ── Pole 1 Houses (1 house) ───────────────────────────────── */}
          <NodeBox isOffline={isOffline} x={160} y={75} label="House 1" value={CS1} isTheft={theft?.pole1Theft} />

          {/* Pole 1 theft load indicator */}
          {theft?.pole1Theft && !isOffline && (
            <g transform="translate(80, 75)" className="animate-pulse">
              <circle cx={0} cy={0} r={28} fill="rgba(244,63,94,0.1)" stroke={theftColor} strokeWidth={2} />
              <AlertTriangle x={-12} y={-18} size={24} className="text-rose-500" />
              <text x={0} y={42} textAnchor="middle" className="fill-rose-400"
                style={{ fontSize: 10, fontWeight: 900 }}>THEFT LOAD</text>
            </g>
          )}


          {/* ── Pole 2 Houses (2 houses) ──────────────────────────────── */}
          <NodeBox isOffline={isOffline} x={460} y={75} label="House 2" value={CS2} isTheft={theft?.pole2Theft} />
          <NodeBox isOffline={isOffline} x={670} y={75} label="House 3" value={CS3} isTheft={theft?.pole2Theft} />

          {/* Pole 2 theft load indicator */}
          {theft?.pole2Theft && !isOffline && (
            <g transform="translate(790, 75)" className="animate-pulse">
              <circle cx={0} cy={0} r={28} fill="rgba(244,63,94,0.1)" stroke={theftColor} strokeWidth={2} />
              <AlertTriangle x={-12} y={-18} size={24} className="text-rose-500" />
              <text x={0} y={42} textAnchor="middle" className="fill-rose-400"
                style={{ fontSize: 10, fontWeight: 900 }}>THEFT LOAD</text>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};

export default WiringDiagram;
