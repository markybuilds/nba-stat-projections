import React from "react";
import Layout from "@/components/layout";
import { getPlayers } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PlayersPage() {
  // In a real application, we would implement client-side filtering and pagination
  // For simplicity in this example, we're just fetching all active players
  const players = await getPlayers(true);
  
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">NBA Players</h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Active Players</CardTitle>
            {/* In a client component, we would implement these filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                placeholder="Search players..."
                className="max-w-xs"
                disabled
              />
              <div className="text-sm text-muted-foreground">
                Filtering would be implemented in a client component
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Jersey #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link 
                        href={`/players/${player.id}`}
                        className="font-medium hover:underline"
                      >
                        {player.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {player.team ? player.team.abbreviation : player.team_id}
                    </TableCell>
                    <TableCell>
                      {player.position && (
                        <Badge variant="outline">
                          {player.position}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.jersey_number || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 