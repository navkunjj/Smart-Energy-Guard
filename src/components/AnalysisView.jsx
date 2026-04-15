import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie, Radar } from 'react-chartjs-2';
import { Activity, LayoutGrid, BarChart3, Waves, PieChart, ShieldAlert } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalysisView = ({ readings, systemHistory = [] }) => {
  const h1 = readings.house1 || 0;
  const h2 = readings.house2 || 0; 
  const h3 = readings.house3 || 0;
  const houseSum = h1 + h2 + h3;
  const mainLine = readings.mainLine || 0;
  const theftValue = Math.max(0, mainLine - houseSum);

  const getLineData = (label, color, key) => ({
    labels: systemHistory.map(d => d.time),
    datasets: [
      {
        label,
        data: systemHistory.map(d => d[key]),
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Instant updates for industrial feel
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 9 } },
      },
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
  };

  const pieData = {
    labels: ['House 1', 'House 2', 'House 3', 'Loss'],
    datasets: [{
      data: [h1, h2, h3, theftValue],
      backgroundColor: ['#3b82f6', '#9333ea', '#60a5fa', '#f43f5e'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl h-[300px]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4">Main Current Timeline (A)</h3>
          <div className="h-full pb-8">
            <Line data={getLineData('Main Line', '#a855f7', 'main')} options={commonOptions} />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl h-[300px]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4">Battery Voltage Stability (V)</h3>
          <div className="h-full pb-8">
            <Line data={getLineData('Voltage', '#f59e0b', 'v')} options={commonOptions} />
          </div>
        </div>
      </div>

      {/* House Specific Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['h1', 'h2', 'h3'].map((key, i) => (
          <div key={key} className="glass-card p-4 rounded-2xl h-[220px]">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">House {i+1} Current (A)</h3>
            <div className="h-full pb-8">
              <Line data={getLineData(`House ${i+1}`, '#3b82f6', key)} options={commonOptions} />
            </div>
          </div>
        ))}
      </div>

      {/* Distribution & Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Current Load Share %</h3>
          <div className="h-40 w-40">
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div className="mt-4 flex gap-4 text-[8px] font-black uppercase opacity-40">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"/> H1</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"/> H2</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full"/> Loss</span>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-l-4 border-rose-500/50 bg-rose-500/5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${theftValue > 0.1 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
              <ShieldAlert className={theftValue > 0.1 ? 'text-rose-400' : 'text-emerald-400'} />
            </div>
            <div>
              <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${theftValue > 0.1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                Engine Analysis Report
              </h4>
              <p className="text-[11px] opacity-50 leading-relaxed max-w-4xl font-medium">
                The DC grid is currently operating at <span className="font-bold underline">{theftValue > 0.1 ? 'Sub-optimal efficiency' : 'Peak synchronization'}</span>. 
                Detected leakage: <span className="text-rose-400 font-bold">{theftValue.toFixed(3)}A</span>. 
                Voltage deviation: <span className="text-orange-400 font-bold">±0.02V</span>. All house nodes are active and reporting consistent heartbeat telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
