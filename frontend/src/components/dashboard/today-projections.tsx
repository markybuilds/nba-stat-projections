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

interface TodayProjectionsProps {
  projections: ProjectionResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function TodayProjections({ projections, isLoading, error }: TodayProjectionsProps) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead className="text-right">PTS</TableHead>
                <TableHead className="text-right">REB</TableHead>
                <TableHead className="text-right">AST</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projections.map((projection) => (
                <TableRow key={`${projection.player.id}-${projection.game.id}`}>
                  <TableCell className="font-medium">{projection.player.full_name}</TableCell>
                  <TableCell>{projection.player.team_id}</TableCell>
                  <TableCell>
                    {projection.opponent_team.abbreviation}
                    {projection.home_team ? (
                      <Badge variant="outline" className="ml-2">Home</Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2">Away</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{projection.projection.projected_points.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{projection.projection.projected_rebounds.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{projection.projection.projected_assists.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <ConfidenceBadge score={projection.projection.confidence_score} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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