'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPlayer, getPlayerProjections } from '@/lib/api';
import { Player, ProjectionResponse } from '@/types';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PerformanceChart } from '@/components/player/performance-chart';

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [projections, setProjections] = useState<ProjectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch player details
        const playerData = await getPlayer(id as string);
        setPlayer(playerData);
        
        // Fetch player projections
        const projectionsData = await getPlayerProjections(id as string);
        setProjections(projectionsData);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError('Failed to load player data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  // Format height from inches to feet/inches
  const formatHeight = (heightInches: number | undefined) => {
    if (!heightInches) return 'N/A';
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    return `${feet}'${inches}"`;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading player data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl">Player not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Player Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{player.first_name} {player.last_name}</h1>
          <div className="text-muted-foreground">
            #{player.jersey_number} | {player.position || 'N/A'} | {player.team?.full_name || 'Team N/A'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          
          {/* Performance Chart */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              {projections.length > 0 ? (
                <PerformanceChart projections={projections} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No projection data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Projections Table */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent & Upcoming Projections</CardTitle>
          </CardHeader>
          <CardContent>
            {projections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game Date</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Projected Minutes</TableHead>
                    <TableHead>Projected Points</TableHead>
                    <TableHead>Projected Rebounds</TableHead>
                    <TableHead>Projected Assists</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.map((proj) => (
                    <TableRow key={`${proj.player.id}-${proj.game.id}`}>
                      <TableCell>{formatDate(proj.game.game_date)}</TableCell>
                      <TableCell>
                        {proj.is_home ? 
                          `vs ${proj.opponent.abbreviation}` : 
                          `@ ${proj.opponent.abbreviation}`}
                      </TableCell>
                      <TableCell>{proj.projection.projected_minutes}</TableCell>
                      <TableCell>{proj.projection.projected_points}</TableCell>
                      <TableCell>{proj.projection.projected_rebounds}</TableCell>
                      <TableCell>{proj.projection.projected_assists}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${proj.projection.confidence_score}%` }}
                            ></div>
                          </div>
                          <span>{proj.projection.confidence_score}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No projections available for this player
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 