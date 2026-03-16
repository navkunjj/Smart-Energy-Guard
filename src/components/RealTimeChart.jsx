import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimeChart = ({ data, label, color = 'rgba(59, 130, 246, 0.5)' }) => {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: label,
        data: data.map(d => d.value),
        fill: true,
        borderColor: color.replace('0.5', '1'),
        backgroundColor: color,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(128, 128, 128, 0.1)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.7)',
          font: { size: 10 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.7)',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RealTimeChart;
