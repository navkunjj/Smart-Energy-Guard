import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Activity, Zap, TrendingUp, Home, GitBranch } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler, ArcElement
);

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: true, labels: { color: 'rgba(148, 163, 184, 0.7)', font: { size: 11 }, boxWidth: 12 } },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.95)',
      titleColor: '#94a3b8', bodyColor: '#fff',
      borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10,
    },
  },
  scales: {
    y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: 'rgba(148, 163, 184, 0.7)', font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { color: 'rgba(148, 163, 184, 0.7)', font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 } },
  },
};

const AnalyticsPage = ({ readings, history = [], theft }) => {
  const labels = history.map(d => d.time);

  // ── Chart 1: Main vs Poles Total vs Pole 1 vs Pole 2 ────────────
  const mainVsPolesData = {
    labels,
    datasets: [
      {
        label: 'Main Input',
        data: history.map(d => d.CS4 ?? 0),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.08)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
      {
        label: 'Poles Total',
        data: history.map(d => (d.PCS1 ?? 0) + (d.PCS2 ?? 0)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.06)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
      {
        label: 'Pole 1',
        data: history.map(d => d.PCS1 ?? 0),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.06)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
      {
        label: 'Pole 2',
        data: history.map(d => d.PCS2 ?? 0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.06)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
    ],
  };

  // ── Chart 2: PCS1 vs CS1 — Pole 1 check (1 house) ──────────────
  const pole1CompareData = {
    labels,
    datasets: [
      {
        label: 'Pole 1 Total',
        data: history.map(d => d.PCS1 ?? 0),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
      {
        label: 'House 1 Load',
        data: history.map(d => d.CS1 ?? 0),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.06)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
    ],
  };

  // ── Chart 3: PCS2 vs (CS2 + CS3) — Pole 2 check (2 houses) ─────
  const pole2CompareData = {
    labels,
    datasets: [
      {
        label: 'Pole 2 Total',
        data: history.map(d => d.PCS2 ?? 0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.08)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
      {
        label: 'Pole 2 Loads (H2+H3)',
        data: history.map(d => (d.CS2 ?? 0) + (d.CS3 ?? 0)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.06)',
        fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
      },
    ],
  };

  // ── Doughnut: load distribution (all 3 houses) ──────────────────
  const doughnutData = {
    labels: ['House 1 (Pole 1)', 'House 2 (Pole 2)', 'House 3 (Pole 2)'],
    datasets: [{
      data: [readings.CS1 || 0, readings.CS2 || 0, readings.CS3 || 0],
      backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(20,184,166,0.8)', 'rgba(16,185,129,0.8)'],
      borderColor: ['#6366f1', '#14b8a6', '#10b981'],
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: 'rgba(148, 163, 184, 0.7)', font: { size: 11 }, boxWidth: 12, padding: 16 } },
      tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#94a3b8', bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
    },
  };

  // ── Bar chart: all sensors (hierarchical order: Main → Pole1 → H1 → Pole2 → H2 → H3)
  const barData = {
    labels: ['Main Input', 'Pole 1', 'House 1', 'Pole 2', 'House 2', 'House 3'],
    datasets: [{
      label: 'Current (A)',
      data: [readings.CS4, readings.PCS1, readings.CS1, readings.PCS2, readings.CS2, readings.CS3],
      backgroundColor: [
        'rgba(244,63,94,0.7)',   // Main Input  — rose
        'rgba(59,130,246,0.7)', // Pole 1      — blue
        'rgba(99,102,241,0.7)', // House 1     — indigo
        'rgba(245,158,11,0.7)', // Pole 2      — amber
        'rgba(20,184,166,0.7)', // House 2     — teal
        'rgba(16,185,129,0.7)', // House 3     — emerald
      ],
      borderColor: ['#f43f5e', '#3b82f6', '#6366f1', '#f59e0b', '#14b8a6', '#10b981'],
      borderWidth: 2, borderRadius: 8,
    }],
  };

  const barOptions = {
    ...lineOptions,
    plugins: { ...lineOptions.plugins, legend: { display: false } },
  };

  const totalLoad = (readings.CS1 || 0) + (readings.CS2 || 0) + (readings.CS3 || 0);

  // ── Stat Cards ──────────────────────────────────────────────────
  const statCards = [
    { label: 'Main Input', value: `${readings.CS4 || 0}`, unit: 'A', icon: Zap, color: 'rose' },
    { label: 'Pole 1 (1 House)', value: `${readings.PCS1 || 0}`, unit: 'A', icon: GitBranch, color: 'blue' },
    { label: 'Pole 2 (2 Houses)', value: `${readings.PCS2 || 0}`, unit: 'A', icon: GitBranch, color: 'cyan' },
    { label: 'Total Loads', value: `${totalLoad.toFixed(2)}`, unit: 'A', icon: Home, color: 'green' },
  ];

  const colorMap = {
    blue: 'border-blue-500/30 text-blue-500 bg-blue-500/10',
    green: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
    rose: 'border-rose-500/30 text-rose-500 bg-rose-500/10',
    cyan: 'border-cyan-500/30 text-cyan-500 bg-cyan-500/10',
    purple: 'border-purple-500/30 text-purple-500 bg-purple-500/10',
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">ANALYTICS</h1>
        <p className="opacity-40 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
          Multi-Level Current Comparison & Theft Analysis
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium opacity-40 uppercase tracking-wider mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold">{card.value}</h3>
                    <span className="text-sm font-medium opacity-40">{card.unit}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${colorMap[card.color]}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Comparison: Main vs Poles vs Individual ──────── */}
      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">Main Input vs Poles Breakdown</h3>
          {theft?.mainTheft && (
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 uppercase animate-pulse">
              ⚠ Mismatch
            </span>
          )}
        </div>
        <div className="h-64">
          <Line data={mainVsPolesData} options={lineOptions} />
        </div>
      </div>

      {/* ── Pole-Level Comparisons ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`glass-card p-6 rounded-2xl ${theft?.pole1Theft ? 'border border-rose-500/30' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Pole 1 Total vs House 1</h3>
            {theft?.pole1Theft && (
              <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 uppercase animate-pulse">
                ⚠ Pole 1
              </span>
            )}
          </div>
          <div className="h-56">
            <Line data={pole1CompareData} options={lineOptions} />
          </div>
        </div>

        <div className={`glass-card p-6 rounded-2xl ${theft?.pole2Theft ? 'border border-rose-500/30' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Pole 2 Total vs Houses 2 &amp; 3</h3>
            {theft?.pole2Theft && (
              <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 uppercase animate-pulse">
                ⚠ Pole 2
              </span>
            )}
          </div>
          <div className="h-56">
            <Line data={pole2CompareData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* ── Distribution Charts ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">All Sensors — Comparative Load</h3>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Load Distribution</h3>
          <div className="flex-1 relative min-h-[200px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center mt-[-20px]">
                <p className="text-xs opacity-40 uppercase font-bold">Total</p>
                <p className="text-xl font-black">{totalLoad.toFixed(1)}A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
