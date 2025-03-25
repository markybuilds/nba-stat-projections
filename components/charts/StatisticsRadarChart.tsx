import { useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { PlayerStats } from '@/types/stats';
import {
  getBaseChartOptions,
  generateRadarData,
  lightTheme,
  darkTheme,
} from './utils/chartHelpers';
import { normalizeStatValues } from './utils/dataTransformers';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface StatisticsRadarChartProps {
  stats: PlayerStats;
  comparisonStats?: PlayerStats;
  title: string;
  isDarkMode?: boolean;
  height?: number;
}

export const StatisticsRadarChart: React.FC<StatisticsRadarChartProps> = ({
  stats,
  comparisonStats,
  title,
  isDarkMode = false,
  height = 300,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const statKeys = ['points', 'rebounds', 'assists', 'steals', 'blocks'];
  const labels = ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks'];

  // Normalize values between 0 and 1 for better visualization
  const normalizedStats = statKeys.map(key => {
    const value = stats[key as keyof PlayerStats] as number;
    const comparisonValue = comparisonStats 
      ? comparisonStats[key as keyof PlayerStats] as number
      : 0;
    const maxValue = Math.max(value, comparisonValue);
    return value / (maxValue || 1);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Player Stats',
        data: normalizedStats,
        backgroundColor: theme.backgroundColor[0],
        borderColor: theme.borderColor[0],
        borderWidth: 2,
        pointBackgroundColor: theme.borderColor[0],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.borderColor[0],
      },
    ],
  };

  if (comparisonStats) {
    const normalizedComparison = statKeys.map(key => {
      const value = comparisonStats[key as keyof PlayerStats] as number;
      const playerValue = stats[key as keyof PlayerStats] as number;
      const maxValue = Math.max(value, playerValue);
      return value / (maxValue || 1);
    });

    chartData.datasets.push({
      label: 'Comparison Stats',
      data: normalizedComparison,
      backgroundColor: theme.backgroundColor[1],
      borderColor: theme.borderColor[1],
      borderWidth: 2,
      pointBackgroundColor: theme.borderColor[1],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: theme.borderColor[1],
    });
  }

  const options = {
    ...getBaseChartOptions(theme),
    scales: {
      r: {
        angleLines: {
          color: theme.gridColor,
        },
        grid: {
          color: theme.gridColor,
        },
        pointLabels: {
          color: theme.textColor,
        },
        ticks: {
          color: theme.textColor,
          backdropColor: 'transparent',
        },
      },
    },
    plugins: {
      ...getBaseChartOptions(theme).plugins,
      title: {
        display: true,
        text: title,
        color: theme.textColor,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const actualValue = stats[statKeys[context.dataIndex] as keyof PlayerStats];
            return `${context.dataset.label}: ${actualValue}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative" style={{ height }}>
      <Radar
        ref={chartRef}
        data={chartData}
        options={options}
        className="w-full h-full"
      />
      <div className="absolute top-0 right-0 p-4 bg-opacity-80 rounded-lg text-sm">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {statKeys.map((key, index) => (
            <div key={key} className="flex justify-between">
              <span>{labels[index]}:</span>
              <span className="ml-2 font-semibold">
                {stats[key as keyof PlayerStats]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 