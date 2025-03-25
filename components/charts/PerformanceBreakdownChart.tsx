import { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PlayerStats } from '@/types/stats';
import {
  getBaseChartOptions,
  lightTheme,
  darkTheme,
} from './utils/chartHelpers';
import {
  calculateStatSummary,
  aggregateStatsByPeriod,
} from './utils/dataTransformers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceBreakdownChartProps {
  stats: PlayerStats[];
  title: string;
  isDarkMode?: boolean;
  height?: number;
}

type AggregationPeriod = 'week' | 'month' | 'season';
type StatCategory = 'scoring' | 'rebounds' | 'assists' | 'defense';

interface StatBreakdown {
  label: string;
  key: keyof PlayerStats;
  category: StatCategory;
}

const statBreakdowns: StatBreakdown[] = [
  { label: 'Points', key: 'points', category: 'scoring' },
  { label: 'Field Goal %', key: 'fieldGoalPercentage', category: 'scoring' },
  { label: 'Three Point %', key: 'threePointPercentage', category: 'scoring' },
  { label: 'Free Throw %', key: 'freeThrowPercentage', category: 'scoring' },
  { label: 'Offensive Rebounds', key: 'offensiveRebounds', category: 'rebounds' },
  { label: 'Defensive Rebounds', key: 'defensiveRebounds', category: 'rebounds' },
  { label: 'Total Rebounds', key: 'rebounds', category: 'rebounds' },
  { label: 'Assists', key: 'assists', category: 'assists' },
  { label: 'Steals', key: 'steals', category: 'defense' },
  { label: 'Blocks', key: 'blocks', category: 'defense' },
];

export const PerformanceBreakdownChart: React.FC<PerformanceBreakdownChartProps> = ({
  stats,
  title,
  isDarkMode = false,
  height = 400,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [selectedPeriod, setSelectedPeriod] = useState<AggregationPeriod>('week');
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>('scoring');

  const filteredStats = statBreakdowns.filter(stat => stat.category === selectedCategory);
  const aggregatedData = filteredStats.map(stat => {
    const periodData = aggregateStatsByPeriod(stats, stat.key, selectedPeriod);
    const summary = calculateStatSummary(stats, stat.key);
    return {
      ...stat,
      data: periodData,
      summary,
    };
  });

  const chartData = {
    labels: aggregatedData[0].data.map(d => d.date),
    datasets: aggregatedData.map((stat, index) => ({
      label: stat.label,
      data: stat.data.map(d => d.value),
      backgroundColor: theme.backgroundColor[index % theme.backgroundColor.length],
      borderColor: theme.borderColor[index % theme.borderColor.length],
      borderWidth: 1,
    })),
  };

  const options = {
    ...getBaseChartOptions(theme),
    plugins: {
      ...getBaseChartOptions(theme).plugins,
      title: {
        display: true,
        text: `${title} - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Breakdown`,
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

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as AggregationPeriod)}
          className={`px-2 py-1 rounded text-sm ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="season">Season</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as StatCategory)}
          className={`px-2 py-1 rounded text-sm ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          <option value="scoring">Scoring</option>
          <option value="rebounds">Rebounds</option>
          <option value="assists">Assists</option>
          <option value="defense">Defense</option>
        </select>
      </div>
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        className="w-full h-full"
      />
      <div className="absolute top-2 right-2 p-4 bg-opacity-80 rounded-lg text-sm">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {aggregatedData.map(stat => (
            <div key={stat.key as string} className="mb-1">
              <div className="font-medium">{stat.label}</div>
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <div>Avg: {stat.summary.average}</div>
                <div>Max: {stat.summary.max}</div>
                <div>Min: {stat.summary.min}</div>
                <div className="flex items-center">
                  <span>Trend: </span>
                  <span
                    className={`ml-1 ${
                      stat.summary.trend.trend === 'up'
                        ? 'text-green-500'
                        : stat.summary.trend.trend === 'down'
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {stat.summary.trend.trend === 'up' && '↑'}
                    {stat.summary.trend.trend === 'down' && '↓'}
                    {stat.summary.trend.trend === 'stable' && '→'}
                    {' '}
                    {Math.abs(stat.summary.trend.change).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 