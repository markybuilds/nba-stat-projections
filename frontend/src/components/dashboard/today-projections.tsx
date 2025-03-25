import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectionResponse } from "@/types";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TeamLogo } from "@/components/ui/team-logo";
import Link from "next/link";

interface TodayProjectionsProps {
  projections: ProjectionResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function TodayProjections({ projections, isLoading, error }: TodayProjectionsProps) {
  const columns = [
    {
      header: "Player",
      accessorKey: "player.full_name",
      fixed: true,
      cell: (projection: ProjectionResponse) => (
        <Link 
          href={`/players/${projection.player.id}`} 
          className="font-medium hover:text-primary transition-colors flex items-center gap-2"
        >
          <PlayerAvatar 
            playerId={projection.player.id} 
            playerName={projection.player.full_name}
            teamId={projection.player.team_id}
            size="sm"
            showTeamColor
          />
          <span>{projection.player.full_name}</span>
        </Link>
      )
    },
    {
      header: "Team",
      accessorKey: "player.team_id",
      fixed: true,
      cell: (projection: ProjectionResponse) => (
        <div className="flex items-center gap-2">
          <TeamLogo teamId={projection.player.team_id} size="xs" />
          <span>{projection.player.team?.abbreviation || projection.player.team_id}</span>
        </div>
      )
    },
    {
      header: "Opponent",
      accessorKey: "opponent_team.abbreviation",
      cell: (projection: ProjectionResponse) => (
        <div className="flex items-center gap-2">
          <TeamLogo teamId={projection.opponent_team.id} size="xs" />
          <span>{projection.opponent_team.abbreviation}</span>
          {projection.home_team ? (
            <Badge variant="outline" size="sm">Home</Badge>
          ) : (
            <Badge variant="outline" size="sm">Away</Badge>
          )}
        </div>
      )
    },
    {
      header: "PTS",
      accessorKey: "projection.projected_points",
      className: "text-right",
      cell: (projection: ProjectionResponse) => (
        projection.projection.projected_points.toFixed(1)
      )
    },
    {
      header: "REB",
      accessorKey: "projection.projected_rebounds",
      className: "text-right",
      cell: (projection: ProjectionResponse) => (
        projection.projection.projected_rebounds.toFixed(1)
      )
    },
    {
      header: "AST",
      accessorKey: "projection.projected_assists",
      className: "text-right",
      cell: (projection: ProjectionResponse) => (
        projection.projection.projected_assists.toFixed(1)
      )
    },
    {
      header: "Conf.",
      accessorKey: "projection.confidence_score",
      className: "text-right",
      cell: (projection: ProjectionResponse) => (
        <ConfidenceBadge score={projection.projection.confidence_score} />
      )
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today's Projections</CardTitle>
        <CardDescription>
          Player stat projections for today's scheduled games
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ProjectionsTableSkeleton />
        ) : error ? (
          <p className="text-destructive">Error loading projections: {error.message}</p>
        ) : projections && projections.length > 0 ? (
          <ScrollableTable
            data={projections}
            columns={columns}
            keyField={(projection) => `${projection.player.id}-${projection.game.id}`}
            fixedColumnWidth="180px"
            scrollableMinWidth="500px"
          />
        ) : (
          <p className="text-center py-4 text-muted-foreground">No projections available for today</p>
        )}
      </CardContent>
    </Card>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  let variant: "default" | "destructive" | "outline" | "secondary" | null = "secondary";
  
  if (score >= 80) {
    variant = "default";
  } else if (score >= 60) {
    variant = "secondary";
  } else if (score < 40) {
    variant = "destructive";
  }
  
  return (
    <Badge variant={variant}>
      {score.toFixed(0)}%
    </Badge>
  );
}

function ProjectionsTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
} 