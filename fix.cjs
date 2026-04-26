const fs = require('fs');
const path = './src/components/WiringDiagram.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `const normalColor   = '#3b82f6'; // blue
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
        {isOffline ? '—' : \`\${value.toFixed(2)}A\`}
      </text>
    </g>
  );
};

const WiringDiagram = ({ readings, theft, isOffline }) => {
  const { CS1 = 0, CS2 = 0, CS3 = 0, CS4 = 0, PCS1 = 0, PCS2 = 0, voltage = 0 } = readings || {};

  const mainWire  = theft?.mainTheft  ? theftColor : normalColor;
  const pole1Wire = theft?.pole1Theft ? theftColor : normalColor;
  const pole2Wire = theft?.pole2Theft ? theftColor : normalColor;`;

content = content.replace(/const WiringDiagram =[\s\S]*?(?=return \()/m, replacement + '\n\n  ');
content = content.replace(/<Wire /g, '<Wire isOffline={isOffline} ');
content = content.replace(/<NodeBox /g, '<NodeBox isOffline={isOffline} ');

fs.writeFileSync(path, content);
console.log('Fixed WiringDiagram.jsx');
