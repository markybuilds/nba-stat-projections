"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Game } from "@/types";
import { useRealTimeGames } from "@/lib/use-real-time-games";
import { format } from "date-fns";

interface GamesClientProps {
  initialGames: Game[];
  initialDate: string;
}

export default function GamesClient({ initialGames, initialDate }: GamesClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  
  // Use our real-time games hook
  const { 
    games, 
    lastUpdate, 
    isLive 
  } = useRealTimeGames({
    initialData: initialGames,
    date: selectedDate
  });

  // Group games by date for display
  const gamesByDate: Record<string, Game[]> = {};
  
  games.forEach(game => {
    const date = new Date(game.game_date).toLocaleDateString();
    if (!gamesByDate[date]) {
      gamesByDate[date] = [];
    }
    gamesByDate[date].push(game);
  });

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Game Schedule</span>
          {isLive && (
            <Badge variant="outline" className="ml-2 gap-1 px-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs">Live</span>
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground self-end">
              Last updated: {format(lastUpdate, 'HH:mm:ss')}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(gamesByDate).length > 0 ? (
          Object.entries(gamesByDate).map(([date, dateGames]) => (
            <div key={date} className="mb-6">
              <h3 className="text-lg font-medium mb-4">{date}</h3>
              <div className="grid grid-cols-1 gap-4">
                {dateGames.map((game) => (
                  <Link 
                    href={`/games/${game.id}`} 
                    key={game.id}
                    className="block"
                  >
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="grid grid-cols-7 gap-2 items-center">
                        <div className="col-span-3 text-right">
                          <div className="font-medium">{game.visitor_team?.full_name || game.visitor_team_id}</div>
                          {game.visitor_team_score !== null && game.visitor_team_score !== undefined && (
                            <div className="text-xl font-bold">{game.visitor_team_score}</div>
                          )}
                        </div>
                        
                        <div className="col-span-1 text-center">
                          <div className="text-muted-foreground">@</div>
                          {game.visitor_team_score !== null && 
                           game.visitor_team_score !== undefined && 
                           game.home_team_score !== null && 
                           game.home_team_score !== undefined && (
                            <Badge 
                              variant={game.visitor_team_score > game.home_team_score ? "default" : "outline"}
                              className="mx-auto my-1"
                            >
                              {game.visitor_team_score > game.home_team_score ? "W" : "L"}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="col-span-3">
                          <div className="font-medium">{game.home_team?.full_name || game.home_team_id}</div>
                          {game.home_team_score !== null && game.home_team_score !== undefined && (
                            <div className="text-xl font-bold">{game.home_team_score}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center mt-2 text-sm text-muted-foreground">
                        {game.status === "in_progress" && (
                          <Badge variant="secondary" className="mx-1">LIVE</Badge>
                        )}
                        {new Date(game.game_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-muted-foreground">No games scheduled for this date</p>
        )}
      </CardContent>
    </Card>
  );
} 