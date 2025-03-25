"use client";

import { useMemo, Suspense, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TodayGames } from "@/components/dashboard/today-games";
import { TodayProjections } from "@/components/dashboard/today-projections";
import { Game, ProjectionResponse } from "@/types";
import { useRealTimeGames } from "@/lib/use-real-time-games";
import { useRealTimeProjections } from "@/lib/use-real-time-projections";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useToast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";

// Dynamically import the chart components
const PositionChart = dynamic(
  () => import("@/components/dashboard/position-chart").then(mod => mod.PositionChart),
  {
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="animate-pulse h-full w-full bg-gray-200 rounded" />
      </div>
    ),
    ssr: false
  }
);

interface DashboardClientProps {
  initialGames: Game[];
  initialProjections: ProjectionResponse[];
  initialErrors: {
    games: Error | null;
    projections: Error | null;
  };
}

export default function DashboardClient({ 
  initialGames, 
  initialProjections,
  initialErrors
}: DashboardClientProps) {
  const { toast } = useToast();
  
  // Use real-time games hook
  const { 
    games, 
    lastUpdate: gamesLastUpdate,
    isLive: gamesIsLive,
    refreshGames
  } = useRealTimeGames({
    initialData: initialGames,
    date: new Date().toISOString().split('T')[0] // Today's date
  });

  // Use real-time projections hook
  const { 
    projections, 
    lastUpdate: projectionsLastUpdate,
    isLive: projectionsIsLive,
    refreshProjections
  } = useRealTimeProjections({
    initialData: initialProjections
  });
  
  // Prepare data for summary charts
  const playerStats = useMemo(() => {
    if (!projections.length) return [];
    
    // Group players by position
    const guards = projections.filter(p => 
      p.player.position?.includes('G'));
    const forwards = projections.filter(p => 
      p.player.position?.includes('F'));
    const centers = projections.filter(p => 
      p.player.position?.includes('C'));
    
    // Calculate average points per position
    return [
      { 
        name: 'Guards', 
        points: Math.round(
          guards.reduce((acc, p) => acc + p.projection.projected_points, 0) / 
          (guards.length || 1)
        )
      },
      { 
        name: 'Forwards', 
        points: Math.round(
          forwards.reduce((acc, p) => acc + p.projection.projected_points, 0) / 
          (forwards.length || 1)
        )
      },
      { 
        name: 'Centers', 
        points: Math.round(
          centers.reduce((acc, p) => acc + p.projection.projected_points, 0) / 
          (centers.length || 1)
        )
      },
    ];
  }, [projections]);
  
  // Calculate average confidence score
  const avgConfidence = useMemo(() => {
    if (!projections.length) return "N/A";
    return `${Math.round(
      projections.reduce((acc, p) => acc + p.projection.confidence_score, 0) / 
      projections.length
    )}%`;
  }, [projections]);
  
  // Calculate average projected points
  const avgPoints = useMemo(() => {
    if (!projections.length) return "N/A";
    return Math.round(
      projections.reduce((acc, p) => acc + p.projection.projected_points, 0) / 
      projections.length
    );
  }, [projections]);

  // Handle refresh all data
  const handleRefresh = useCallback(async () => {
    // Refresh both games and projections
    const gamesResult = await refreshGames();
    const projectionsResult = await refreshProjections();
    
    // Show toast with status
    if (gamesResult && projectionsResult) {
      toast({
        title: "Data Refreshed",
        description: "Latest games and projections data loaded",
        duration: 3000,
      });
    } else {
      toast({
        title: "Refresh Incomplete",
        description: "There was an issue refreshing some data",
        variant: "destructive", 
        duration: 3000,
      });
    }
  }, [refreshGames, refreshProjections, toast]);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh All Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <span className="text-lg">Games Today</span>
              {gamesIsLive && (
                <Badge variant="outline" className="ml-2 gap-1 px-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs">Live</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Scheduled NBA games
              {gamesLastUpdate && (
                <span className="text-xs block mt-1">
                  Updated: {format(gamesLastUpdate, 'HH:mm:ss')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{games.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <span className="text-lg">Players Projected</span>
              {projectionsIsLive && (
                <Badge variant="outline" className="ml-2 gap-1 px-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs">Live</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              With stat projections
              {projectionsLastUpdate && (
                <span className="text-xs block mt-1">
                  Updated: {format(projectionsLastUpdate, 'HH:mm:ss')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projections.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Projected Points</CardTitle>
            <CardDescription>Per player today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Confidence</CardTitle>
            <CardDescription>Projection accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgConfidence}</div>
          </CardContent>
        </Card>
      </div>
      
      {playerStats.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Average Projected Points by Position</CardTitle>
            <CardDescription>Comparing projections across player positions</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="h-64 w-full flex items-center justify-center">
                <div className="animate-pulse h-full w-full bg-gray-200 rounded" />
              </div>
            }>
              <PositionChart data={playerStats} />
            </Suspense>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TodayGames 
          games={games} 
          isLoading={false} 
          error={initialErrors.games}
        />
        {/* Additional dashboard cards could go here */}
      </div>
      
      <TodayProjections 
        projections={projections} 
        isLoading={false} 
        error={initialErrors.projections} 
      />
      
      {/* Mobile instructions for pull-to-refresh */}
      <div className="md:hidden text-center text-xs text-muted-foreground pt-0 pb-4 mt-4">
        Pull down to refresh all data
      </div>
    </PullToRefresh>
  );
} 