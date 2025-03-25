'use client';

import React, { useState } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types for the StatsBreakdownChart component
export interface StatCategory {
  key: string;
  label: string;
  description?: string;
  formatter?: (value: number) => string;
}

export interface StatBreakdownData {
  [key: string]: number;
  name: string;
}

export interface StatCategoryGroup {
  id: string;
  label: string;
  categories: StatCategory[];
}

export interface StatsBreakdownChartProps {
  data: StatBreakdownData[];
  categoryGroups: StatCategoryGroup[];
  title?: string;
  description?: string;
  className?: string;
  maxValue?: number | 'auto';
  enableLabels?: boolean;
  gridLevels?: number;
  colorScheme?: string[];
}

/**
 * StatsBreakdownChart component for visualizing multi-dimensional statistics.
 * Uses a radar/spider chart to compare multiple stats across different entities.
 */
export function StatsBreakdownChart({
  data,
  categoryGroups,
  title = 'Statistical Breakdown',
  description,
  className = '',
  maxValue = 'auto',
  enableLabels = true,
  gridLevels = 5,
  colorScheme = ['#60a5fa', '#f97316', '#10b981', '#8b5cf6', '#ec4899']
}: StatsBreakdownChartProps) {
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>(
    categoryGroups[0]?.id || ''
  );

  // Get the currently selected category group
  const currentGroup = categoryGroups.find(group => group.id === selectedCategoryGroup);
  
  // Format the data for the radar chart
  const formattedData = currentGroup ? data.map(item => {
    const formattedItem: { [key: string]: string | number } = { name: item.name };
    
    // Add each stat from the current category group
    currentGroup.categories.forEach(category => {
      formattedItem[category.key] = item[category.key] || 0;
    });
    
    return formattedItem;
  }) : [];
  
  // Define the keys for the radar chart based on the selected category group
  const keys = currentGroup?.categories.map(cat => cat.key) || [];
  
  // Define the index for the radar chart
  const indexBy = 'name';
  
  // Handle empty data state
  if (data.length === 0 || categoryGroups.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No data available for visualization</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {categoryGroups.length > 1 && (
            <Select
              value={selectedCategoryGroup}
              onValueChange={setSelectedCategoryGroup}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select statistics" />
              </SelectTrigger>
              <SelectContent>
                {categoryGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveRadar
            data={formattedData}
            keys={keys}
            indexBy={indexBy}
            valueFormat=">-.2f"
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            borderColor={{ from: 'color' }}
            gridLabelOffset={36}
            dotSize={10}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            colors={colorScheme}
            blendMode="multiply"
            motionConfig="gentle"
            legends={[
              {
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#666',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#000'
                    }
                  }
                ]
              }
            ]}
            theme={{
              tooltip: {
                container: {
                  background: '#333',
                  color: '#fff',
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  padding: '8px 12px',
                }
              }
            }}
            gridLevels={gridLevels}
            maxValue={maxValue}
            gridShape="circular"
            enableDots={true}
            dotLabel="value"
            dotLabelYOffset={-12}
            enableDotLabel={enableLabels}
            sliceTooltip={({ data, key, value }) => {
              const category = currentGroup?.categories.find(cat => cat.key === key);
              const formatter = category?.formatter || (v => v.toFixed(2));
              return (
                <div className="bg-background-900 text-foreground p-2 rounded shadow-lg">
                  <strong>{data.name}: {category?.label || key}</strong>
                  <div>Value: {formatter(value as number)}</div>
                  {category?.description && (
                    <div className="text-xs mt-1 max-w-xs">{category.description}</div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsBreakdownChart; 