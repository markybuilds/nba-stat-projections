import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PlayerStats } from '@/types/stats';
import {
  getBaseChartOptions,
  generateTrendData,
  lightTheme,
  darkTheme,
} from './utils/chartHelpers';
import {
  calculateMovingAverage,
  calculateStatSummary,
  StatSummary,
} from './utils/dataTransformers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceTrendChartProps {
  stats: PlayerStats[];
  statKey: keyof PlayerStats;
  title: string;
  isDarkMode?: boolean;
  height?: number;
  showMovingAverage?: boolean;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  stats,
  statKey,
  title,
  isDarkMode = false,
  height = 300,
  showMovingAverage = true,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const chartData: ChartData = {
    labels: stats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: title,
        data: stats.map(stat => stat[statKey] as number),
        borderColor: theme.borderColor[0],
        backgroundColor: theme.backgroundColor[0],
        tension: 0.1,
      },
    ],
  };

  if (showMovingAverage) {
    const movingAverageData = calculateMovingAverage(
      stats.map(stat => stat[statKey] as number),
      5
    );

    chartData.datasets.push({
      label: '5-Game Moving Average',
      data: movingAverageData,
      borderColor: theme.borderColor[1],
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      tension: 0.1,
    });
  }

  const options = {
    ...getBaseChartOptions(theme),
    plugins: {
      ...getBaseChartOptions(theme).plugins,
      title: {
        display: true,
        text: title,
        color: theme.textColor,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const statSummary: StatSummary = calculateStatSummary(stats, statKey);

  return (
    <div className="relative" style={{ height }}>
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        className="w-full h-full"
      />
      <div className="absolute top-0 right-0 p-4 bg-opacity-80 rounded-lg text-sm">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          <div>Avg: {statSummary.average}</div>
          <div>Max: {statSummary.max}</div>
          <div>Min: {statSummary.min}</div>
          <div className="flex items-center mt-1">
            <span>Trend: </span>
            <span
              className={`ml-1 ${
                statSummary.trend.trend === 'up'
                  ? 'text-green-500'
                  : statSummary.trend.trend === 'down'
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {statSummary.trend.trend === 'up' && '↑'}
              {statSummary.trend.trend === 'down' && '↓'}
              {statSummary.trend.trend === 'stable' && '→'}
              {' '}
              {Math.abs(statSummary.trend.change).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 