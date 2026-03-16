import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Activity, Zap, TrendingUp, TrendingDown, Home } from 'lucide-react';

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

const barOptions = {
  ...lineOptions,
  plugins: { ...lineOptions.plugins, legend: { display: false } },
};

const AnalyticsPage = ({ readings, chartHistory }) => {
  const [houseHistory, setHouseHistory] = useState({ h1: [], h2: [], h3: [] });

  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHouseHistory(prev => ({
      h1: [...prev.h1, { time, value: readings.house1 }].slice(-20),
      h2: [...prev.h2, { time, value: readings.house2 }].slice(-20),
      h3: [...prev.h3, { time, value: readings.house3 }].slice(-20),
    }));
  }, [readings.timestamp]);

  const labels = houseHistory.h1.map(d => d.time);

  const multiLineData = {
    labels,
    datasets: [
      { label: 'House 1', data: houseHistory.h1.map(d => d.value), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
      { label: 'House 2', data: houseHistory.h2.map(d => d.value), borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.08)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
      { label: 'House 3', data: houseHistory.h3.map(d => d.value), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
    ],
  };

  const barData = {
    labels: ['House 1', 'House 2', 'House 3'],
    datasets: [{
      label: 'Current (A)',
      data: [readings.house1, readings.house2, readings.house3],
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(168,85,247,0.7)', 'rgba(16,185,129,0.7)'],
      borderColor: ['#3b82f6', '#a855f7', '#10b981'],
      borderWidth: 2, borderRadius: 8,
    }],
  };

  const doughnutData = {
    labels: ['House 1', 'House 2', 'House 3'],
    datasets: [{
      data: [readings.house1, readings.house2, readings.house3],
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(168,85,247,0.8)', 'rgba(16,185,129,0.8)'],
      borderColor: ['#3b82f6', '#a855f7', '#10b981'],
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

  const totalCurrent = readings.house1 + readings.house2 + readings.house3;

  const statCards = [
    { label: 'Total Load Current', value: `${readings.mainLine}`, unit: 'A', icon: Zap, color: 'blue', trend: +1.2 },
    { label: 'Grid Voltage', value: `${readings.voltage}`, unit: 'V', icon: Activity, color: 'purple', trend: -0.3 },
    { label: 'Network Power', value: `${readings.totalPower}`, unit: 'kW', icon: TrendingUp, color: 'green', trend: +2.1 },
    { label: 'Sum of Houses', value: `${totalCurrent.toFixed(2)}`, unit: 'A', icon: Home, color: 'orange', trend: 0 },
  ];

  const colorMap = {
    blue: 'border-blue-500/30 text-blue-500 bg-blue-500/10',
    green: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
    orange: 'border-orange-500/30 text-orange-500 bg-orange-500/10',
    purple: 'border-purple-500/30 text-purple-500 bg-purple-500/10',
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">ANALYTICS</h1>
        <p className="opacity-40 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
          Real-Time Power Consumption Analysis
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
              {card.trend !== 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${card.trend > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                    {card.trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {Math.abs(card.trend)}%
                  </div>
                  <span className="text-[10px] opacity-40 uppercase font-medium">vs last hour</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Per-House Current (Live)</h3>
          <div className="h-64">
            <Line data={multiLineData} options={lineOptions} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Load Distribution</h3>
          <div className="flex-1 relative min-h-[200px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center mt-[-20px]">
                <p className="text-xs opacity-40 uppercase font-bold">Total</p>
                <p className="text-xl font-black">{totalCurrent.toFixed(1)}A</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Comparative House Load (Current)</h3>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Main Line Power Trend</h3>
          <div className="h-56">
            <Line
              data={{
                labels: (chartHistory.power || []).map(d => d.time),
                datasets: [{
                  label: 'Total Power (kW)',
                  data: (chartHistory.power || []).map(d => d.value),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2,
                }],
              }}
              options={lineOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
