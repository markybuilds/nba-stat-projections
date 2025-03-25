'use client'

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectionResponse } from "@/types";

interface PerformanceChartProps {
  projections: ProjectionResponse[];
}

export function PerformanceChart({ projections }: PerformanceChartProps) {
  // Sort projections by date (ascending)
  const sortedProjections = [...projections].sort((a, b) => {
    return new Date(a.game.game_date).getTime() - new Date(b.game.game_date).getTime();
  });

  // Extract data for charts
  const dates = sortedProjections.map(p => new Date(p.game.game_date).toLocaleDateString());
  const pointsData = sortedProjections.map(p => p.projection.projected_points);
  const assistsData = sortedProjections.map(p => p.projection.projected_assists);
  const reboundsData = sortedProjections.map(p => p.projection.projected_rebounds);
  const confidenceData = sortedProjections.map(p => p.projection.confidence_score);

  // Calculate max values for scaling
  const maxPoints = Math.max(...pointsData) * 1.1; // Add 10% for visual padding
  const maxAssists = Math.max(...assistsData) * 1.1;
  const maxRebounds = Math.max(...reboundsData) * 1.1;
  
  // Chart dimensions
  const chartWidth = 100; // Percentage width
  const chartHeight = 200; // Pixels
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate scales
  const xScale = (index: number) => `${(index / (dates.length - 1)) * innerWidth + padding.left}%`;
  const yScalePoints = (value: number) => innerHeight - (value / maxPoints) * innerHeight + padding.top;
  const yScaleAssists = (value: number) => innerHeight - (value / maxAssists) * innerHeight + padding.top;
  const yScaleRebounds = (value: number) => innerHeight - (value / maxRebounds) * innerHeight + padding.top;
  const yScaleConfidence = (value: number) => innerHeight - (value / 100) * innerHeight + padding.top;
  
  // Generate line paths
  const generateLinePath = (data: number[], yScale: (value: number) => number) => {
    if (data.length === 0) return "";
    
    return data.map((value, index) => {
      const x = xScale(index);
      const y = yScale(value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };
  
  // Generate area paths (for under the line)
  const generateAreaPath = (data: number[], yScale: (value: number) => number) => {
    if (data.length === 0) return "";
    
    const linePath = generateLinePath(data, yScale);
    const baseline = innerHeight + padding.top;
    return `${linePath} L ${xScale(data.length - 1)} ${baseline} L ${xScale(0)} ${baseline} Z`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Projections</CardTitle>
      </CardHeader>
      <CardContent>
        {projections.length > 1 ? (
          <Tabs defaultValue="points">
            <TabsList className="mb-4">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="rebounds">Rebounds</TabsTrigger>
              <TabsTrigger value="assists">Assists</TabsTrigger>
              <TabsTrigger value="confidence">Confidence</TabsTrigger>
            </TabsList>
            
            <TabsContent value="points" className="pt-4">
              <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 text-xs text-muted-foreground">
                  Points
                </div>
                
                {/* Y-axis ticks */}
                {[0, maxPoints * 0.25, maxPoints * 0.5, maxPoints * 0.75, maxPoints].map((tick, i) => (
                  <div key={i} className="absolute left-0 text-xs text-muted-foreground" 
                    style={{ top: `${yScalePoints(tick)}px` }}>
                    {Math.round(tick)}
                  </div>
                ))}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
                  {dates.map((date, i) => (
                    <div key={i} className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                      {date}
                    </div>
                  ))}
                </div>
                
                {/* Area under line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d={generateAreaPath(pointsData, yScalePoints)} 
                    fill="rgba(59, 130, 246, 0.1)" />
                  <path d={generateLinePath(pointsData, yScalePoints)} 
                    stroke="rgba(59, 130, 246, 1)" 
                    strokeWidth="2" 
                    fill="none" />
                  
                  {/* Data points */}
                  {pointsData.map((value, index) => (
                    <circle 
                      key={index} 
                      cx={xScale(index)} 
                      cy={yScalePoints(value)} 
                      r="4" 
                      fill="white" 
                      stroke="rgba(59, 130, 246, 1)" 
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </TabsContent>
            
            <TabsContent value="rebounds" className="pt-4">
              <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 text-xs text-muted-foreground">
                  Rebounds
                </div>
                
                {/* Y-axis ticks */}
                {[0, maxRebounds * 0.25, maxRebounds * 0.5, maxRebounds * 0.75, maxRebounds].map((tick, i) => (
                  <div key={i} className="absolute left-0 text-xs text-muted-foreground" 
                    style={{ top: `${yScaleRebounds(tick)}px` }}>
                    {Math.round(tick)}
                  </div>
                ))}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
                  {dates.map((date, i) => (
                    <div key={i} className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                      {date}
                    </div>
                  ))}
                </div>
                
                {/* Area under line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d={generateAreaPath(reboundsData, yScaleRebounds)} 
                    fill="rgba(16, 185, 129, 0.1)" />
                  <path d={generateLinePath(reboundsData, yScaleRebounds)} 
                    stroke="rgba(16, 185, 129, 1)" 
                    strokeWidth="2" 
                    fill="none" />
                  
                  {/* Data points */}
                  {reboundsData.map((value, index) => (
                    <circle 
                      key={index} 
                      cx={xScale(index)} 
                      cy={yScaleRebounds(value)} 
                      r="4" 
                      fill="white" 
                      stroke="rgba(16, 185, 129, 1)" 
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </TabsContent>
            
            <TabsContent value="assists" className="pt-4">
              <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 text-xs text-muted-foreground">
                  Assists
                </div>
                
                {/* Y-axis ticks */}
                {[0, maxAssists * 0.25, maxAssists * 0.5, maxAssists * 0.75, maxAssists].map((tick, i) => (
                  <div key={i} className="absolute left-0 text-xs text-muted-foreground" 
                    style={{ top: `${yScaleAssists(tick)}px` }}>
                    {Math.round(tick)}
                  </div>
                ))}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
                  {dates.map((date, i) => (
                    <div key={i} className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                      {date}
                    </div>
                  ))}
                </div>
                
                {/* Area under line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d={generateAreaPath(assistsData, yScaleAssists)} 
                    fill="rgba(249, 115, 22, 0.1)" />
                  <path d={generateLinePath(assistsData, yScaleAssists)} 
                    stroke="rgba(249, 115, 22, 1)" 
                    strokeWidth="2" 
                    fill="none" />
                  
                  {/* Data points */}
                  {assistsData.map((value, index) => (
                    <circle 
                      key={index} 
                      cx={xScale(index)} 
                      cy={yScaleAssists(value)} 
                      r="4" 
                      fill="white" 
                      stroke="rgba(249, 115, 22, 1)" 
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </TabsContent>
            
            <TabsContent value="confidence" className="pt-4">
              <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
                {/* Y-axis label */}
                <div className="absolute -left-10 top-1/2 -rotate-90 text-xs text-muted-foreground">
                  Confidence %
                </div>
                
                {/* Y-axis ticks */}
                {[0, 25, 50, 75, 100].map((tick, i) => (
                  <div key={i} className="absolute left-0 text-xs text-muted-foreground" 
                    style={{ top: `${yScaleConfidence(tick)}px` }}>
                    {tick}
                  </div>
                ))}
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
                  {dates.map((date, i) => (
                    <div key={i} className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                      {date}
                    </div>
                  ))}
                </div>
                
                {/* Area under line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d={generateAreaPath(confidenceData, yScaleConfidence)} 
                    fill="rgba(139, 92, 246, 0.1)" />
                  <path d={generateLinePath(confidenceData, yScaleConfidence)} 
                    stroke="rgba(139, 92, 246, 1)" 
                    strokeWidth="2" 
                    fill="none" />
                  
                  {/* Data points */}
                  {confidenceData.map((value, index) => (
                    <circle 
                      key={index} 
                      cx={xScale(index)} 
                      cy={yScaleConfidence(value)} 
                      r="4" 
                      fill="white" 
                      stroke="rgba(139, 92, 246, 1)" 
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Not enough data to generate performance charts
          </div>
        )}
      </CardContent>
    </Card>
  );
} 