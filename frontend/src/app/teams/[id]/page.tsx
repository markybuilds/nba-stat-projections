'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTeam, getTeamPlayers } from '@/lib/api';
import { Team, Player } from '@/types';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { TeamLogo } from '@/components/ui/team-logo';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamDetailPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details
        const teamData = await getTeam(id as string);
        setTeam(teamData);
        
        // Fetch team players
        const playersData = await getTeamPlayers(id as string);
        setTeamPlayers(playersData);
        
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading team data...</p>
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

  if (!team) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl">Team not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Team Header */}
        <div className="flex items-center gap-6 mb-8">
          <TeamLogo 
            teamId={team.id} 
            size="xl" 
          />
          
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {team.full_name}
                <Badge variant="outline" className="ml-2">
                  {team.abbreviation}
                </Badge>
              </h1>
              
              <FavoriteButton
                itemId={team.id}
                type="team"
                name={team.full_name}
                imageUrl={`/api/teams/${team.id}/logo`}
                variant="outline"
                size="default"
                showText
              />
            </div>
            <div className="text-muted-foreground">
              {team.city}, {team.state} • Est. {team.year_founded}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="roster" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="roster">Team Roster</TabsTrigger>
            <TabsTrigger value="info">Team Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <CardTitle>Current Roster</CardTitle>
                <CardDescription>
                  Players currently on {team.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamPlayers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Jersey #</TableHead>
                        <TableHead>Height</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamPlayers.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <Link 
                              href={`/players/${player.id}`}
                              className="font-medium hover:underline flex items-center gap-2"
                            >
                              <PlayerAvatar 
                                playerId={player.id}
                                playerName={player.full_name}
                                teamId={player.team_id}
                                size="sm"
                                showTeamColor
                              />
                              <span>{player.full_name}</span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {player.position ? (
                              <Badge variant="outline">{player.position}</Badge>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{player.jersey_number || 'N/A'}</TableCell>
                          <TableCell>{formatHeight(player.height) || 'N/A'}</TableCell>
                          <TableCell>{player.weight ? `${player.weight} lbs` : 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${player.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {player.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <FavoriteButton
                              itemId={player.id}
                              type="player"
                              name={player.full_name}
                              imageUrl={`/api/players/${player.id}/image`}
                              variant="ghost"
                              size="sm"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No players found for this team.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-muted-foreground">Full Name</dt>
                      <dd className="text-lg">{team.full_name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Abbreviation</dt>
                      <dd className="text-lg">{team.abbreviation}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-muted-foreground">Nickname</dt>
                      <dd className="text-lg">{team.nickname}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Founded</dt>
                      <dd className="text-lg">{team.year_founded}</dd>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-muted-foreground">City</dt>
                      <dd className="text-lg">{team.city}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">State</dt>
                      <dd className="text-lg">{team.state}</dd>
                    </div>
                  </div>
                  
                  <div>
                    <dt className="font-medium text-muted-foreground">Roster Size</dt>
                    <dd className="text-lg">{teamPlayers.length} players</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Format height from inches to feet/inches
function formatHeight(heightInches: string | undefined) {
  if (!heightInches) return null;
  const inches = parseInt(heightInches, 10);
  if (isNaN(inches)) return null;
  
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
} 