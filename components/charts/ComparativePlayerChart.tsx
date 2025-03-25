import { useRef, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  LinearScale,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { PlayerStats } from '@/types/stats';
import {
  getBaseChartOptions,
  lightTheme,
  darkTheme,
} from './utils/chartHelpers';
import {
  calculateStatSummary,
  normalizeStatValues,
} from './utils/dataTransformers';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

interface ComparativePlayerChartProps {
  players: {
    name: string;
    stats: PlayerStats[];
  }[];
  title: string;
  isDarkMode?: boolean;
  height?: number;
}

type StatCategory = 'overall' | 'scoring' | 'playmaking' | 'defense' | 'efficiency';

interface StatMetric {
  label: string;
  key: keyof PlayerStats;
  category: StatCategory;
  scale?: number;
}

const statMetrics: StatMetric[] = [
  { label: 'Points', key: 'points', category: 'scoring', scale: 50 },
  { label: 'FG%', key: 'fieldGoalPercentage', category: 'efficiency', scale: 100 },
  { label: '3P%', key: 'threePointPercentage', category: 'efficiency', scale: 100 },
  { label: 'FT%', key: 'freeThrowPercentage', category: 'efficiency', scale: 100 },
  { label: 'Rebounds', key: 'rebounds', category: 'overall', scale: 20 },
  { label: 'Assists', key: 'assists', category: 'playmaking', scale: 15 },
  { label: 'Steals', key: 'steals', category: 'defense', scale: 5 },
  { label: 'Blocks', key: 'blocks', category: 'defense', scale: 5 },
  { label: 'Turnovers', key: 'turnovers', category: 'playmaking', scale: 10 },
  { label: 'Minutes', key: 'minutes', category: 'overall', scale: 48 },
];

export const ComparativePlayerChart: React.FC<ComparativePlayerChartProps> = ({
  players,
  title,
  isDarkMode = false,
  height = 400,
}) => {
  const chartRef = useRef<ChartJS>(null);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>('overall');

  const filteredMetrics = statMetrics.filter(
    metric => selectedCategory === 'overall' || metric.category === selectedCategory
  );

  const calculatePlayerMetrics = (stats: PlayerStats[]) => {
    return filteredMetrics.map(metric => {
      const values = stats.map(stat => stat[metric.key] as number);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      return average / (metric.scale || 1);
    });
  };

  const chartData = {
    labels: filteredMetrics.map(metric => metric.label),
    datasets: players.map((player, index) => ({
      label: player.name,
      data: calculatePlayerMetrics(player.stats),
      backgroundColor: theme.backgroundColor[index % theme.backgroundColor.length],
      borderColor: theme.borderColor[index % theme.borderColor.length],
      borderWidth: 2,
      pointBackgroundColor: theme.borderColor[index % theme.borderColor.length],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: theme.borderColor[index % theme.borderColor.length],
    })),
  };

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
          font: {
            size: 12,
          },
        },
        ticks: {
          color: theme.textColor,
          backdropColor: 'transparent',
          stepSize: 0.2,
          max: 1,
        },
      },
    },
    plugins: {
      ...getBaseChartOptions(theme).plugins,
      title: {
        display: true,
        text: `${title} - ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Comparison`,
        color: theme.textColor,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const metric = filteredMetrics[context.dataIndex];
            const actualValue = value * (metric.scale || 1);
            return `${context.dataset.label}: ${actualValue.toFixed(1)}`;
          },
        },
      },
    },
  };

  const playerSummaries = players.map(player => {
    const summaries = filteredMetrics.map(metric => ({
      ...metric,
      summary: calculateStatSummary(player.stats, metric.key),
    }));
    return {
      name: player.name,
      summaries,
    };
  });

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute top-2 left-2 z-10">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as StatCategory)}
          className={`px-2 py-1 rounded text-sm ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
          }`}
        >
          <option value="overall">Overall</option>
          <option value="scoring">Scoring</option>
          <option value="playmaking">Playmaking</option>
          <option value="defense">Defense</option>
          <option value="efficiency">Efficiency</option>
        </select>
      </div>
      <Radar
        ref={chartRef}
        data={chartData}
        options={options}
        className="w-full h-full"
      />
      <div className="absolute top-2 right-2 p-4 bg-opacity-80 rounded-lg text-sm max-h-[calc(100%-20px)] overflow-y-auto">
        <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {playerSummaries.map((player, playerIndex) => (
            <div key={player.name} className={playerIndex > 0 ? 'mt-4' : ''}>
              <div className="font-medium">{player.name}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {player.summaries.map(stat => (
                  <div key={stat.key as string}>
                    <div>{stat.label}:</div>
                    <div className="flex items-center">
                      <span>{stat.summary.average.toFixed(1)}</span>
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
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 