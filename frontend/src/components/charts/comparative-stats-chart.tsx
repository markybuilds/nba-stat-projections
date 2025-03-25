import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface StatComparison {
  stat: string;
  player: number;
  leagueAvg: number;
  positionAvg: number;
}

interface ComparativeStatsChartProps {
  data: StatComparison[];
  playerName: string;
  position: string;
  isLoading?: boolean;
  height?: number;
}

const ComparativeStatsChart: React.FC<ComparativeStatsChartProps> = ({
  data,
  playerName,
  position,
  isLoading = false,
  height = 400
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid className="stroke-gray-200" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          <Radar
            name={playerName}
            dataKey="player"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            name="League Average"
            dataKey="leagueAvg"
            stroke="#94a3b8"
            fill="#cbd5e1"
            fillOpacity={0.3}
          />
          <Radar
            name={`${position} Average`}
            dataKey="positionAvg"
            stroke="#059669"
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparativeStatsChart; 