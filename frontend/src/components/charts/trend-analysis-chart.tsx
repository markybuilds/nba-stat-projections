import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  value: number;
  average: number;
}

interface TrendAnalysisChartProps {
  data: TrendDataPoint[];
  statistic: string;
  isLoading?: boolean;
  height?: number;
}

const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({
  data,
  statistic,
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
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
            className="text-sm"
          />
          <YAxis className="text-sm" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
            labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={`Player ${statistic}`}
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="average"
            name={`League Average ${statistic}`}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendAnalysisChart; 