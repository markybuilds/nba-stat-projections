'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeams } from '@/lib/api';
import { Team } from '@/types';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TeamLogo } from '@/components/ui/team-logo';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await getTeams();
        setTeams(data);
        setFilteredTeams(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Filter teams based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeams(teams);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = teams.filter(
      team => 
        team.full_name.toLowerCase().includes(query) ||
        team.abbreviation.toLowerCase().includes(query) ||
        team.city.toLowerCase().includes(query) ||
        team.state.toLowerCase().includes(query)
    );
    
    setFilteredTeams(filtered);
  }, [searchQuery, teams]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading teams data...</p>
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
            <p>{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NBA Teams</h1>
        
        <div className="mb-6">
          <Input
            placeholder="Search teams..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {filteredTeams.length} teams found
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link href={`/teams/${team.id}`} key={team.id} passHref>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <TeamLogo teamId={team.id} size="lg" />
                    <FavoriteButton
                      itemId={team.id}
                      type="team"
                      name={team.full_name}
                      imageUrl={`/api/teams/${team.id}/logo`}
                      variant="ghost"
                    />
                  </div>
                  <CardTitle className="mt-2">{team.full_name}</CardTitle>
                  <CardDescription>{team.city}, {team.state}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{team.abbreviation}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Est. {team.year_founded}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
} 