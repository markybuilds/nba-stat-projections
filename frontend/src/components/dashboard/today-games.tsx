import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "@/types";
import Link from "next/link";
import { TeamLogo } from "@/components/ui/team-logo";

interface TodayGamesProps {
  games: Game[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function TodayGames({ games, isLoading, error }: TodayGamesProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today's Games</CardTitle>
        <CardDescription>
          NBA games scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <GamesListSkeleton />
        ) : error ? (
          <p className="text-destructive">Error loading games: {error.message}</p>
        ) : games && games.length > 0 ? (
          <div className="space-y-4">
            {games.map((game) => (
              <Link href={`/games/${game.id}`} key={game.id}>
                <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-5 gap-2 items-center">
                    <div className="col-span-2 text-right font-medium flex items-center justify-end gap-2">
                      <span>
                        {game.visitor_team?.full_name || game.visitor_team_id}
                        {game.visitor_team_score && (
                          <span className="ml-2 font-bold">{game.visitor_team_score}</span>
                        )}
                      </span>
                      <TeamLogo 
                        teamId={game.visitor_team_id} 
                        size="sm" 
                      />
                    </div>
                    <div className="col-span-1 text-center text-muted-foreground">
                      @
                    </div>
                    <div className="col-span-2 font-medium flex items-center gap-2">
                      <TeamLogo 
                        teamId={game.home_team_id} 
                        size="sm" 
                      />
                      <span>
                        {game.home_team?.full_name || game.home_team_id}
                        {game.home_team_score && (
                          <span className="ml-2 font-bold">{game.home_team_score}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    {new Date(game.game_date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">No games scheduled for today</p>
        )}
      </CardContent>
    </Card>
  );
}

function GamesListSkeleton() {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="mt-2 flex justify-center">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
} 