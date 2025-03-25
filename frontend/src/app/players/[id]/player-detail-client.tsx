'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Player, ProjectionResponse, PlayerStats } from '@/types';
import { PerformanceChart } from '@/components/player/performance-chart';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { TeamLogo } from '@/components/ui/team-logo';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { useRealTimePlayer } from '@/lib/use-real-time-player';
import { useRealTimeProjections } from '@/lib/use-real-time-projections';
import { format } from 'date-fns';
import { triggerPlayerMilestoneNotification, triggerProjectionUpdateNotification } from '@/lib/notification-triggers';

interface PlayerDetailClientProps {
  initialPlayer: Player;
  initialProjections: ProjectionResponse[];
  initialStats?: PlayerStats[];
}

export function PlayerDetailClient({ 
  initialPlayer, 
  initialProjections,
  initialStats = []
}: PlayerDetailClientProps) {
  // State for tracking milestones
  const prevStatsRef = useRef<PlayerStats | null>(null);
  const prevProjectionRef = useRef<ProjectionResponse | null>(
    initialProjections.length > 0 ? initialProjections[0] : null
  );
  
  // Use real-time hooks for player data
  const {
    player,
    isLive: playerIsLive,
    lastUpdate: playerLastUpdate
  } = useRealTimePlayer({
    initialData: initialPlayer,
    playerId: initialPlayer.id
  });
  
  // Use real-time hooks for player projections
  const {
    projections,
    isLive: projectionsIsLive,
    lastUpdate: projectionsLastUpdate
  } = useRealTimeProjections({
    initialData: initialProjections,
    playerId: initialPlayer.id
  });

  // Latest game stats
  const [latestStats, setLatestStats] = useState<PlayerStats | null>(
    initialStats.length > 0 ? initialStats[0] : null
  );
  
  // Check for stat milestones when player data updates
  useEffect(() => {
    if (!latestStats || !player) return;
    
    const prevStats = prevStatsRef.current;
    if (!prevStats) {
      prevStatsRef.current = latestStats;
      return;
    }
    
    // Check for significant statistical milestones
    
    // Points milestones
    if (latestStats.points >= 30 && prevStats.points < 30) {
      triggerPlayerMilestoneNotification(player, "reached 30+ points", latestStats.points);
    } else if (latestStats.points >= 40 && prevStats.points < 40) {
      triggerPlayerMilestoneNotification(player, "reached 40+ points", latestStats.points);
    } else if (latestStats.points >= 50 && prevStats.points < 50) {
      triggerPlayerMilestoneNotification(player, "reached 50+ points", latestStats.points);
    }
    
    // Rebound milestones
    if (latestStats.rebounds >= 15 && prevStats.rebounds < 15) {
      triggerPlayerMilestoneNotification(player, "reached 15+ rebounds", latestStats.rebounds);
    } else if (latestStats.rebounds >= 20 && prevStats.rebounds < 20) {
      triggerPlayerMilestoneNotification(player, "reached 20+ rebounds", latestStats.rebounds);
    } 
    
    // Assist milestones
    if (latestStats.assists >= 10 && prevStats.assists < 10) {
      triggerPlayerMilestoneNotification(player, "reached 10+ assists", latestStats.assists);
    } else if (latestStats.assists >= 15 && prevStats.assists < 15) {
      triggerPlayerMilestoneNotification(player, "reached 15+ assists", latestStats.assists);
    }
    
    // Triple-double check
    const hasTripleDouble = 
      latestStats.points >= 10 && 
      latestStats.rebounds >= 10 && 
      latestStats.assists >= 10;
    
    const hadTripleDouble = 
      prevStats.points >= 10 && 
      prevStats.rebounds >= 10 && 
      prevStats.assists >= 10;
      
    if (hasTripleDouble && !hadTripleDouble) {
      triggerPlayerMilestoneNotification(
        player, 
        `recorded a triple-double with ${latestStats.points} pts, ${latestStats.rebounds} reb, ${latestStats.assists} ast`, 
        0
      );
    }
    
    // Double-double check
    const doubleCount = [
      latestStats.points >= 10 ? 1 : 0,
      latestStats.rebounds >= 10 ? 1 : 0,
      latestStats.assists >= 10 ? 1 : 0,
      latestStats.blocks >= 10 ? 1 : 0,
      latestStats.steals >= 10 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    
    const prevDoubleCount = [
      prevStats.points >= 10 ? 1 : 0,
      prevStats.rebounds >= 10 ? 1 : 0,
      prevStats.assists >= 10 ? 1 : 0,
      prevStats.blocks >= 10 ? 1 : 0,
      prevStats.steals >= 10 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    
    if (doubleCount >= 2 && prevDoubleCount < 2) {
      triggerPlayerMilestoneNotification(
        player, 
        "recorded a double-double", 
        0
      );
    }
    
    // Update previous stats
    prevStatsRef.current = latestStats;
  }, [latestStats, player]);
  
  // Check for projection updates
  useEffect(() => {
    if (!projections.length) return;
    
    const latestProjection = projections[0];
    const prevProjection = prevProjectionRef.current;
    
    if (prevProjection && latestProjection) {
      // Check if this is a new projection or an update
      if (latestProjection.id === prevProjection.id && 
          JSON.stringify(latestProjection.projection) !== JSON.stringify(prevProjection.projection)) {
        // This is an update to an existing projection
        triggerProjectionUpdateNotification(latestProjection);
      }
    }
    
    // Update previous projection reference
    prevProjectionRef.current = latestProjection;
  }, [projections]);
  
  // Format height from inches to feet/inches
  const formatHeight = (heightInches: number | undefined) => {
    if (!heightInches) return 'N/A';
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    return `${feet}'${inches}"`;
  };

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <PlayerAvatar
          playerId={player.id}
          name={`${player.first_name} ${player.last_name}`}
          size="xl"
          className="rounded-lg border border-border"
        />
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {player.first_name} {player.last_name}
              {player.team_id && (
                <TeamLogo 
                  teamId={player.team_id} 
                  size="md" 
                  className="ml-2" 
                />
              )}
              {playerIsLive && (
                <Badge variant="outline" className="ml-2 gap-1 px-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs">Live</span>
                </Badge>
              )}
            </h1>
            
            <FavoriteButton
              itemId={player.id}
              type="player"
              name={`${player.first_name} ${player.last_name}`}
              imageUrl={player.id ? `/api/players/${player.id}/image` : undefined}
              variant="outline"
              size="default"
              showText
            />
          </div>
          <div className="text-muted-foreground">
            #{player.jersey_number} | {player.position || 'N/A'} | {player.team?.full_name || 'Team N/A'}
          </div>
          {playerLastUpdate && (
            <div className="text-xs text-muted-foreground mt-1">
              Last updated: {format(playerLastUpdate, 'HH:mm:ss')}
            </div>
          )}
        </div>
      </div>
      
      {/* Player Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Player Details Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Height:</dt>
                <dd>{formatHeight(player.height)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Weight:</dt>
                <dd>{player.weight ? `${player.weight} lbs` : 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Position:</dt>
                <dd>{player.position || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Jersey:</dt>
                <dd>{player.jersey_number || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Status:</dt>
                <dd>
                  <span className={`px-2 py-1 rounded text-xs ${player.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {player.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* Projections Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Latest Projections</span>
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
            {projections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead className="text-right">PTS</TableHead>
                    <TableHead className="text-right">REB</TableHead>
                    <TableHead className="text-right">AST</TableHead>
                    <TableHead className="text-right">MIN</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.map((projection) => (
                    <TableRow key={projection.id}>
                      <TableCell>
                        {new Date(projection.game.game_date).toLocaleDateString()} vs 
                        {projection.game.home_team_id === player.team_id 
                          ? ` ${projection.game.visitor_team?.abbreviation || projection.game.visitor_team_id}`
                          : ` ${projection.game.home_team?.abbreviation || projection.game.home_team_id}`}
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
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No projections available for this player
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart playerId={player.id} />
        </CardContent>
      </Card>
    </div>
  );
} 