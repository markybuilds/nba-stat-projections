'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTeams, useTodayGames, useTodayProjections } from '@/hooks/use-swr-hooks';
import { TeamLogo } from '@/components/ui/team-logo';
import { PlayerAvatar } from '@/components/ui/player-avatar';

/**
 * Example component demonstrating SWR hooks usage
 */
export function SWRExample() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">SWR Data Fetching Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TeamsList />
        <TodayGames />
        <TopProjections />
      </div>
    </div>
  );
}

/**
 * Teams list component using SWR
 */
function TeamsList() {
  const { data: teams, error, isLoading } = useTeams();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>NBA Teams</CardTitle>
        <CardDescription>Using static SWR configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load teams data</AlertDescription>
          </Alert>
        ) : teams?.length === 0 ? (
          <p className="text-muted-foreground">No teams found</p>
        ) : (
          <div className="space-y-2">
            {teams?.slice(0, 10).map((team) => (
              <div key={team.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                <TeamLogo teamId={team.id} size="sm" className="h-5 w-5" />
                <span>{team.full_name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Today's games component using SWR
 */
function TodayGames() {
  const { data: games, error, isLoading } = useTodayGames();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Games</CardTitle>
        <CardDescription>Using real-time SWR configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load games data</AlertDescription>
          </Alert>
        ) : games?.length === 0 ? (
          <p className="text-muted-foreground">No games scheduled for today</p>
        ) : (
          <div className="space-y-3">
            {games?.slice(0, 5).map((game) => (
              <div key={game.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                  <TeamLogo teamId={game.home_team_id} size="sm" />
                  <span className="text-sm">vs</span>
                  <TeamLogo teamId={game.visitor_team_id} size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(game.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Top projections component using SWR
 */
function TopProjections() {
  const { data: projections, error, isLoading } = useTodayProjections();
  
  // Sort by projected points (highest first)
  const sortedProjections = React.useMemo(() => {
    if (!projections) return [];
    return [...projections].sort((a, b) => b.projected_points - a.projected_points);
  }, [projections]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Projections</CardTitle>
        <CardDescription>Using dynamic SWR configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load projections data</AlertDescription>
          </Alert>
        ) : sortedProjections.length === 0 ? (
          <p className="text-muted-foreground">No projections available for today</p>
        ) : (
          <div className="space-y-3">
            {sortedProjections.slice(0, 5).map((projection) => (
              <div key={projection.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-2">
                  <PlayerAvatar 
                    playerId={projection.player_id} 
                    playerName={projection.player?.full_name || ''} 
                    teamId={projection.player?.team_id || ''}
                    size="sm"
                  />
                  <span>{projection.player?.full_name}</span>
                </div>
                <div className="font-semibold">
                  {projection.projected_points.toFixed(1)} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 