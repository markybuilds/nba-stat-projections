'use client';

import { useTeams } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamLogo } from '@/components/ui/team-logo';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Example component demonstrating SWR usage with the teams hook
 * This is a client component that uses SWR to fetch and cache teams data
 */
export function TeamsListClient() {
  const { teams, isLoading, isError } = useTeams();

  if (isError) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>NBA Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            Error loading teams data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>NBA Teams</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(30).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="flex flex-col items-center space-y-2">
                <TeamLogo teamId={team.id} size="md" />
                <span className="text-sm font-medium">{team.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 