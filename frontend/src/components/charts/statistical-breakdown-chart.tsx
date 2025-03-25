import React, { useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatBreakdown {
  category: string;
  value: number;
  details?: {
    label: string;
    value: number;
    percentage: number;
  }[];
}

interface StatisticalBreakdownChartProps {
  data: StatBreakdown[];
  title: string;
  isLoading?: boolean;
  height?: number;
}

const StatisticalBreakdownChart: React.FC<StatisticalBreakdownChartProps> = ({
  data,
  title,
  isLoading = false,
  height = 400,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any[] | null>(null);

  const handleBarClick = useCallback((entry: any) => {
    const category = entry.category;
    const details = data.find(item => item.category === category)?.details;
    if (details) {
      setSelectedCategory(category);
      setDrillDownData(details);
    }
  }, [data]);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
    setDrillDownData(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1',
    '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedCategory ? `${title}: ${selectedCategory}` : title}
        </h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        )}
      </div>
      
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {!selectedCategory ? (
            <BarChart
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
                dataKey="category"
                tick={{ fill: '#64748b', fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                name="Value"
                onClick={handleBarClick}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={drillDownData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#64748b', fontSize: 12 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="value"
                name="Value"
                fill="#3b82f6"
                fillOpacity={0.8}
              />
              <Bar
                yAxisId="right"
                dataKey="percentage"
                name="Percentage"
                fill="#f59e0b"
                fillOpacity={0.8}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {selectedCategory && drillDownData && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drillDownData.map((detail) => (
            <div
              key={detail.label}
              className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <h4 className="text-sm font-medium text-gray-600">{detail.label}</h4>
              <div className="mt-2 flex justify-between items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {detail.value}
                </p>
                <p className="text-sm text-gray-500">
                  {detail.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatisticalBreakdownChart; 