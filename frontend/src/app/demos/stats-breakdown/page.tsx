'use client';

import React from 'react';
import { StatsBreakdownChart, StatCategoryGroup, StatBreakdownData } from '@/components/charts/stats-breakdown-chart';

// Sample player stat categories
const playerStatCategories: StatCategoryGroup[] = [
  {
    id: 'offense',
    label: 'Offensive Stats',
    categories: [
      { key: 'pts', label: 'Points', description: 'Average points per game' },
      { key: 'ast', label: 'Assists', description: 'Average assists per game' },
      { key: 'fg_pct', label: 'FG%', description: 'Field goal percentage', formatter: v => `${(v * 100).toFixed(1)}%` },
      { key: 'fg3_pct', label: '3PT%', description: '3-point percentage', formatter: v => `${(v * 100).toFixed(1)}%` },
      { key: 'ft_pct', label: 'FT%', description: 'Free throw percentage', formatter: v => `${(v * 100).toFixed(1)}%` },
    ]
  },
  {
    id: 'defense',
    label: 'Defensive Stats',
    categories: [
      { key: 'reb', label: 'Rebounds', description: 'Average rebounds per game' },
      { key: 'stl', label: 'Steals', description: 'Average steals per game' },
      { key: 'blk', label: 'Blocks', description: 'Average blocks per game' },
      { key: 'dreb', label: 'Def Rebounds', description: 'Average defensive rebounds per game' },
      { key: 'def_rating', label: 'Def Rating', description: 'Defensive rating (lower is better)' },
    ]
  },
  {
    id: 'efficiency',
    label: 'Efficiency Metrics',
    categories: [
      { key: 'per', label: 'PER', description: 'Player Efficiency Rating' },
      { key: 'ts_pct', label: 'TS%', description: 'True Shooting Percentage', formatter: v => `${(v * 100).toFixed(1)}%` },
      { key: 'usg_pct', label: 'USG%', description: 'Usage Percentage', formatter: v => `${(v * 100).toFixed(1)}%` },
      { key: 'ortg', label: 'ORtg', description: 'Offensive Rating' },
      { key: 'drtg', label: 'DRtg', description: 'Defensive Rating' },
    ]
  }
];

// Sample player data (2023-24 season stats for some top NBA players, normalized for radar chart)
const samplePlayerData: StatBreakdownData[] = [
  {
    name: 'Nikola Jokić',
    // Offensive stats
    pts: 26.1,
    ast: 9.0,
    fg_pct: 0.581,
    fg3_pct: 0.352,
    ft_pct: 0.818,
    // Defensive stats
    reb: 12.0,
    stl: 1.4,
    blk: 0.9,
    dreb: 9.4,
    def_rating: 110.8,
    // Efficiency
    per: 31.9,
    ts_pct: 0.648,
    usg_pct: 0.304,
    ortg: 129.0,
    drtg: 110.8
  },
  {
    name: 'Giannis Antetokounmpo',
    // Offensive stats
    pts: 30.4,
    ast: 6.5,
    fg_pct: 0.617,
    fg3_pct: 0.273,
    ft_pct: 0.654,
    // Defensive stats
    reb: 11.5,
    stl: 1.2,
    blk: 1.1,
    dreb: 8.5,
    def_rating: 112.1,
    // Efficiency
    per: 33.0,
    ts_pct: 0.648,
    usg_pct: 0.342,
    ortg: 121.9,
    drtg: 112.1
  },
  {
    name: 'Luka Dončić',
    // Offensive stats
    pts: 33.9,
    ast: 9.8,
    fg_pct: 0.499,
    fg3_pct: 0.384,
    ft_pct: 0.785,
    // Defensive stats
    reb: 9.2,
    stl: 1.4,
    blk: 0.5,
    dreb: 7.3,
    def_rating: 114.2,
    // Efficiency
    per: 30.0,
    ts_pct: 0.620,
    usg_pct: 0.377,
    ortg: 119.6,
    drtg: 114.2
  },
  {
    name: 'Anthony Edwards',
    // Offensive stats
    pts: 25.9,
    ast: 5.1,
    fg_pct: 0.462,
    fg3_pct: 0.359,
    ft_pct: 0.825,
    // Defensive stats
    reb: 5.4,
    stl: 1.3,
    blk: 0.5,
    dreb: 4.5,
    def_rating: 111.8,
    // Efficiency
    per: 19.2,
    ts_pct: 0.572,
    usg_pct: 0.325,
    ortg: 112.5,
    drtg: 111.8
  }
];

export default function StatsBreakdownDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Player Stats Breakdown</h1>
      
      <div className="mb-12">
        <p className="mb-4 text-slate-600">
          This demo showcases a radar chart visualization of NBA player statistics.
          Use the dropdown to toggle between different stat categories.
        </p>
        
        <StatsBreakdownChart
          data={samplePlayerData}
          categoryGroups={playerStatCategories}
          title="NBA Star Player Comparison (2023-24)"
          description="Comparing key statistics across top NBA players"
          className="w-full max-w-4xl mx-auto"
        />
      </div>
      
      <div className="bg-slate-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About This Visualization</h3>
        <p className="text-sm text-slate-600">
          This radar chart allows for quick multi-dimensional comparisons across players.
          Stats are shown in their raw values (not normalized) to provide accurate comparisons.
          Hover over any data point for more details, or switch between stat categories using the dropdown.
        </p>
      </div>
    </div>
  );
} 