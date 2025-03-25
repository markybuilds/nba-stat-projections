"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Game, ProjectionResponse } from "@/types";
import { useRealTimeGames } from "@/lib/use-real-time-games";
import { useRealTimeProjections } from "@/lib/use-real-time-projections";
import { format } from "date-fns";

interface GameDetailClientProps {
  initialGame: Game;
  initialProjections: ProjectionResponse[];
}

export default function GameDetailClient({ initialGame, initialProjections }: GameDetailClientProps) {
  // Use real-time games hook for the game details
  const { 
    games, 
    lastUpdate: gameLastUpdate,
    isLive: gameIsLive
  } = useRealTimeGames({
    initialData: [initialGame],
    teamId: initialGame.home_team_id // Using home team as filter
  });

  // Use real-time projections hook for the projections data
  const { 
    projections, 
    lastUpdate: projectionsLastUpdate,
    isLive: projectionsIsLive 
  } = useRealTimeProjections({
    initialData: initialProjections,
    gameId: initialGame.id
  });

  // Extract the current game (we only have one)
  const game = games[0] || initialGame;

  // Group projections by team
  const homeTeamProjections = useMemo(() => 
    projections.filter(p => p.player.team_id === game.home_team_id),
    [projections, game.home_team_id]
  );
  
  const visitorTeamProjections = useMemo(() => 
    projections.filter(p => p.player.team_id === game.visitor_team_id),
    [projections, game.visitor_team_id]
  );

  return (
    <>
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-lg">
              {game.visitor_team?.full_name || game.visitor_team_id} @ {game.home_team?.full_name || game.home_team_id}
            </span>
            {gameIsLive && (
              <Badge variant="outline" className="ml-2 gap-1 px-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs">Live</span>
              </Badge>
            )}
          </CardTitle>
          {gameLastUpdate && (
            <div className="text-xs text-muted-foreground">
              Last updated: {format(gameLastUpdate, 'HH:mm:ss')}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                <p>{new Date(game.game_date).toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Season</h3>
                <p>{game.season_id || "Regular Season"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Season Type</h3>
                <p>{game.season_type || "Regular"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="text-right">
                <div className="font-medium">{game.visitor_team?.full_name || game.visitor_team_id}</div>
                {game.visitor_team_score !== null && game.visitor_team_score !== undefined ? (
                  <div className="text-4xl font-bold">{game.visitor_team_score}</div>
                ) : (
                  <div className="text-muted-foreground">No score</div>
                )}
              </div>
              
              <div className="text-center text-muted-foreground">@</div>
              
              <div>
                <div className="font-medium">{game.home_team?.full_name || game.home_team_id}</div>
                {game.home_team_score !== null && game.home_team_score !== undefined ? (
                  <div className="text-4xl font-bold">{game.home_team_score}</div>
                ) : (
                  <div className="text-muted-foreground">No score</div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p>
                  {game.status === "in_progress" ? (
                    <Badge variant="secondary">In Progress</Badge>
                  ) : game.home_team_score !== null && game.home_team_score !== undefined && 
                     game.visitor_team_score !== null && game.visitor_team_score !== undefined ? (
                    <Badge>Final</Badge>
                  ) : (
                    <Badge variant="outline">Scheduled</Badge>
                  )}
                </p>
              </div>
              
              {game.home_team_score !== null && game.home_team_score !== undefined && 
               game.visitor_team_score !== null && game.visitor_team_score !== undefined && 
               game.status !== "in_progress" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Winner</h3>
                  <p>
                    {game.home_team_score > game.visitor_team_score ? (
                      <span>{game.home_team?.full_name || game.home_team_id}</span>
                    ) : (
                      <span>{game.visitor_team?.full_name || game.visitor_team_id}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>Player Projections</span>
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
          {projectionsLastUpdate && (
            <div className="text-xs text-muted-foreground">
              Last updated: {format(projectionsLastUpdate, 'HH:mm:ss')}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Players</TabsTrigger>
              <TabsTrigger value="home">
                {game.home_team?.abbreviation || "Home"}
              </TabsTrigger>
              <TabsTrigger value="away">
                {game.visitor_team?.abbreviation || "Away"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ProjectionsTable projections={projections} />
            </TabsContent>
            
            <TabsContent value="home">
              <ProjectionsTable projections={homeTeamProjections} />
            </TabsContent>
            
            <TabsContent value="away">
              <ProjectionsTable projections={visitorTeamProjections} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

function ProjectionsTable({ projections }: { projections: ProjectionResponse[] }) {
  if (projections.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No projections available</p>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">PTS</TableHead>
          <TableHead className="text-right">REB</TableHead>
          <TableHead className="text-right">AST</TableHead>
          <TableHead className="text-right">MIN</TableHead>
          <TableHead className="text-right">Confidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projections.map((projection) => (
          <TableRow key={`${projection.player.id}-${projection.game.id}`}>
            <TableCell>
              <Link 
                href={`/players/${projection.player.id}`} 
                className="font-medium hover:underline"
              >
                {projection.player.full_name}
              </Link>
            </TableCell>
            <TableCell>
              {projection.player.team?.abbreviation || projection.player.team_id}
            </TableCell>
            <TableCell className="text-right">{projection.projection.projected_points.toFixed(1)}</TableCell>
            <TableCell className="text-right">{projection.projection.projected_rebounds.toFixed(1)}</TableCell>
            <TableCell className="text-right">{projection.projection.projected_assists.toFixed(1)}</TableCell>
            <TableCell className="text-right">{projection.projection.projected_minutes.toFixed(1)}</TableCell>
            <TableCell className="text-right">
              <Badge 
                variant={projection.projection.confidence_score >= 70 ? "default" : "secondary"}
              >
                {projection.projection.confidence_score.toFixed(0)}%
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 