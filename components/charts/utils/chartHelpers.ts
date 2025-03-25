import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { PlayerStats, ProjectedStats } from '@/types/stats';

export interface ChartTheme {
  backgroundColor: string[];
  borderColor: string[];
  gridColor: string;
  textColor: string;
}

export const lightTheme: ChartTheme = {
  backgroundColor: [
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 99, 132, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(255, 206, 86, 0.2)',
  ],
  borderColor: [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255, 206, 86, 1)',
  ],
  gridColor: 'rgba(0, 0, 0, 0.1)',
  textColor: '#2D3748',
};

export const darkTheme: ChartTheme = {
  backgroundColor: [
    'rgba(54, 162, 235, 0.3)',
    'rgba(255, 99, 132, 0.3)',
    'rgba(75, 192, 192, 0.3)',
    'rgba(255, 206, 86, 0.3)',
  ],
  borderColor: [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 206, 86, 0.8)',
  ],
  gridColor: 'rgba(255, 255, 255, 0.1)',
  textColor: '#E2E8F0',
};

export const getBaseChartOptions = (theme: ChartTheme): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: theme.textColor,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: theme.gridColor,
      },
      ticks: {
        color: theme.textColor,
      },
    },
    y: {
      grid: {
        color: theme.gridColor,
      },
      ticks: {
        color: theme.textColor,
      },
    },
  },
});

export const formatStatValue = (value: number): string => {
  if (value % 1 === 0) return value.toString();
  return value.toFixed(1);
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const generateTrendData = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats
): ChartData => {
  const labels = stats.map(stat => new Date(stat.date).toLocaleDateString());
  const data = stats.map(stat => stat[statKey] as number);

  return {
    labels,
    datasets: [
      {
        label: statKey,
        data,
        fill: false,
        borderColor: lightTheme.borderColor[0],
        tension: 0.1,
      },
    ],
  };
};

export const generateComparisonData = (
  playerStats: PlayerStats[],
  projectedStats: ProjectedStats[],
  statKey: keyof PlayerStats
): ChartData => {
  const labels = playerStats.map(stat => new Date(stat.date).toLocaleDateString());
  
  return {
    labels,
    datasets: [
      {
        label: 'Actual',
        data: playerStats.map(stat => stat[statKey] as number),
        backgroundColor: lightTheme.backgroundColor[0],
        borderColor: lightTheme.borderColor[0],
      },
      {
        label: 'Projected',
        data: projectedStats.map(stat => stat[statKey] as number),
        backgroundColor: lightTheme.backgroundColor[1],
        borderColor: lightTheme.borderColor[1],
      },
    ],
  };
};

export const generateRadarData = (stats: PlayerStats): ChartData => {
  const labels = ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks'];
  const data = [
    stats.points,
    stats.rebounds,
    stats.assists,
    stats.steals,
    stats.blocks,
  ];

  return {
    labels,
    datasets: [
      {
        label: 'Player Stats',
        data,
        backgroundColor: lightTheme.backgroundColor[0],
        borderColor: lightTheme.borderColor[0],
        pointBackgroundColor: lightTheme.borderColor[0],
      },
    ],
  };
};

export const generateHeatmapData = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats
): number[][] => {
  // Group stats by week and day
  const heatmapData: number[][] = Array(52)
    .fill(0)
    .map(() => Array(7).fill(0));

  stats.forEach(stat => {
    const date = new Date(stat.date);
    const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const day = date.getDay();
    heatmapData[week][day] = stat[statKey] as number;
  });

  return heatmapData;
}; 