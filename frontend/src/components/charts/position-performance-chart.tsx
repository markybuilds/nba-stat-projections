import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface PositionMetric {
  metric: string;
  value: number;
  positionAverage: number;
  percentile: number;
}

interface PositionPerformanceChartProps {
  data: PositionMetric[];
  position: string;
  isLoading?: boolean;
  height?: number;
}

const PositionPerformanceChart: React.FC<PositionPerformanceChartProps> = ({
  data,
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
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis type="number" domain={[0, 'auto']} />
          <YAxis
            dataKey="metric"
            type="category"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
            }}
            formatter={(value: number) => [value.toFixed(2), 'Value']}
          />
          <Legend />
          <Bar
            dataKey="value"
            name="Player Value"
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="positionAverage"
            name={`${position} Average`}
            fill="#94a3b8"
            radius={[0, 4, 4, 0]}
          />
          <ReferenceLine
            x={0}
            stroke="#64748b"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((metric) => (
          <div
            key={metric.metric}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-600">{metric.metric}</span>
            <span className="font-medium">
              {metric.percentile}th percentile
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionPerformanceChart; 