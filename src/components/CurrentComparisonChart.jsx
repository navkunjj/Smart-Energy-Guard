import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const CurrentComparisonChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Main Input (A)',
        data: data.map(d => d.CS4 ?? d.main ?? 0),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Poles Total (A)',
        data: data.map(d => (d.PCS1 ?? 0) + (d.PCS2 ?? 0)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        padding: 10,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} A`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 9 }, callback: v => v + 'A' },
      },
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default CurrentComparisonChart;
