import { PlayerStats, ProjectedStats } from '@/types/stats';

export interface StatTrend {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StatSummary {
  average: number;
  max: number;
  min: number;
  trend: StatTrend;
}

export const calculateMovingAverage = (
  data: number[],
  windowSize: number
): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(Number(average.toFixed(2)));
  }
  return result;
};

export const calculateStatSummary = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats
): StatSummary => {
  const values = stats.map(stat => stat[statKey] as number);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  // Calculate trend using last 5 games
  const recentValues = values.slice(-5);
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  const previousValues = values.slice(-10, -5);
  const previousAvg = previousValues.length ? 
    previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length : 
    recentAvg;
  
  const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  const trend: StatTrend = {
    value: recentAvg,
    change,
    trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
  };

  return {
    average: Number(average.toFixed(2)),
    max,
    min,
    trend,
  };
};

export const normalizeStatValues = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats
): number[] => {
  const values = stats.map(stat => stat[statKey] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values.map(value => 
    max === min ? 0.5 : (value - min) / (max - min)
  );
};

export const calculateProjectionAccuracy = (
  actualStats: PlayerStats[],
  projectedStats: ProjectedStats[],
  statKey: keyof PlayerStats
): number => {
  const pairs = actualStats.map((actual, index) => ({
    actual: actual[statKey] as number,
    projected: projectedStats[index] ? projectedStats[index][statKey] as number : null,
  })).filter(pair => pair.projected !== null);

  if (pairs.length === 0) return 0;

  const errors = pairs.map(pair => 
    Math.abs((pair.projected! - pair.actual) / pair.actual)
  );
  
  const averageError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  return Number((100 * (1 - averageError)).toFixed(2));
};

export const aggregateStatsByPeriod = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats,
  period: 'week' | 'month' | 'season'
): { date: string; value: number }[] => {
  const grouped = new Map<string, number[]>();
  
  stats.forEach(stat => {
    const date = new Date(stat.date);
    let key: string;
    
    switch (period) {
      case 'week':
        key = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      case 'season':
        key = date.getFullYear().toString();
        break;
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(stat[statKey] as number);
  });
  
  return Array.from(grouped.entries()).map(([date, values]) => ({
    date,
    value: Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2)),
  }));
};

export const predictNextValue = (
  stats: PlayerStats[],
  statKey: keyof PlayerStats
): number => {
  const values = stats.map(stat => stat[statKey] as number);
  const movingAvg = calculateMovingAverage(values, 5);
  const trend = movingAvg[movingAvg.length - 1] - movingAvg[movingAvg.length - 2];
  return Number((movingAvg[movingAvg.length - 1] + trend).toFixed(2));
}; 