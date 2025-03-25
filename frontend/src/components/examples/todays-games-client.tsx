'use client';

import { useTodaysGames } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamLogo } from '@/components/ui/team-logo';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating SWR usage with real-time data
 * This is a client component that uses SWR to fetch and cache today's games with auto-refresh
 */
export function TodaysGamesClient() {
  const { games, isLoading, isError, isValidating } = useTodaysGames();

  if (isError) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Today's Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            Error loading games data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Today's Games
          {isValidating && (
            <Badge variant="outline" className="ml-2 bg-yellow-50">
              Updating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No games scheduled for today.
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-2">
                  <TeamLogo teamId={game.home_team.id} size="sm" />
                  <span className="font-medium">{game.home_team.name}</span>
                </div>
                <div className="text-sm font-semibold">
                  {game.status === 'scheduled' ? (
                    new Date(game.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  ) : (
                    <span>
                      {game.home_score} - {game.away_score}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{game.away_team.name}</span>
                  <TeamLogo teamId={game.away_team.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 