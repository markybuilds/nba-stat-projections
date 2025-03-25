import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PlayerStats, ProjectedStats } from '@/types/stats';
import {
  getBaseChartOptions,
  generateComparisonData,
  lightTheme,
  darkTheme,
} from './utils/chartHelpers';
import {
  calculateProjectionAccuracy,
  calculateStatSummary,
  StatSummary,
} from './utils/dataTransformers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonBarChartProps {
  actualStats: PlayerStats[];
  projectedStats: ProjectedStats[];
  statKey: keyof PlayerStats;
  title: string;
  isDarkMode?: boolean;
  height?: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  actualStats,
  projectedStats,
  statKey,
  title,
  isDarkMode = false,
  height = 300,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const chartData = {
    labels: actualStats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Actual',
        data: actualStats.map(stat => stat[statKey] as number),
        backgroundColor: theme.backgroundColor[0],
        borderColor: theme.borderColor[0],
        borderWidth: 1,
      },
      {
        label: 'Projected',
        data: projectedStats.map(stat => stat[statKey] as number),
        backgroundColor: theme.backgroundColor[1],
        borderColor: theme.borderColor[1],
        borderWidth: 1,
      },
    ],
  };

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
    scales: {
      x: {
        stacked: false,
        grid: {
          color: theme.gridColor,
        },
        ticks: {
          color: theme.textColor,
        },
      },
      y: {
        stacked: false,
        grid: {
          color: theme.gridColor,
        },
        ticks: {
          color: theme.textColor,
        },
      },
    },
  };

  const accuracy = calculateProjectionAccuracy(actualStats, projectedStats, statKey);
  const actualSummary = calculateStatSummary(actualStats, statKey);
  const projectedSummary = calculateStatSummary(projectedStats, statKey);

  return (
    <div className="relative" style={{ height }}>
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        className="w-full h-full"
      />
      <div className="absolute top-0 right-0 p-4 bg-opacity-80 rounded-lg text-sm">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          <div className="font-semibold mb-2">
            Projection Accuracy: {accuracy}%
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Actual</div>
              <div>Avg: {actualSummary.average}</div>
              <div>Max: {actualSummary.max}</div>
              <div>Min: {actualSummary.min}</div>
            </div>
            <div>
              <div className="font-medium">Projected</div>
              <div>Avg: {projectedSummary.average}</div>
              <div>Max: {projectedSummary.max}</div>
              <div>Min: {projectedSummary.min}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span>Trend: </span>
            <span
              className={`ml-1 ${
                actualSummary.trend.trend === 'up'
                  ? 'text-green-500'
                  : actualSummary.trend.trend === 'down'
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {actualSummary.trend.trend === 'up' && '↑'}
              {actualSummary.trend.trend === 'down' && '↓'}
              {actualSummary.trend.trend === 'stable' && '→'}
              {' '}
              {Math.abs(actualSummary.trend.change).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 