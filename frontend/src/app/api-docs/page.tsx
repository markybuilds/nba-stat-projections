import React from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiDocsPage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              RESTful API for accessing NBA data and player projections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The NBA Stat Projections API provides programmatic access to NBA team data, player statistics, game information, and performance projections. The API follows RESTful principles and returns responses in JSON format.
            </p>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Base URL</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>https://api.nbastatprojections.com</code>
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Authentication</h3>
              <p>
                Currently, the API is available for public use without authentication requirements, with rate limiting applied. For higher rate limits or commercial use, please contact us for API key access.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="teams">
          <TabsList className="mb-6">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Team Endpoints</CardTitle>
                <CardDescription>
                  Access information about NBA teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /teams
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>List all NBA teams</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /teams/{"{team_id}"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get details for a specific team</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">team_id</span> (string)
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Player Endpoints</CardTitle>
                <CardDescription>
                  Access information about NBA players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /players
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>List all NBA players</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div><span className="font-mono text-sm">active_only</span> (boolean, optional)</div>
                          <div><span className="font-mono text-sm">team_id</span> (string, optional)</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /players/{"{player_id}"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get details for a specific player</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">player_id</span> (string)
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>Game Endpoints</CardTitle>
                <CardDescription>
                  Access information about NBA games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /games
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>List NBA games</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div><span className="font-mono text-sm">date</span> (string, optional, YYYY-MM-DD)</div>
                          <div><span className="font-mono text-sm">team_id</span> (string, optional)</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /games/today
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get games scheduled for today</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /games/{"{game_id}"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get details for a specific game</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">game_id</span> (string)
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle>Projection Endpoints</CardTitle>
                <CardDescription>
                  Access player performance projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /projections/today
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get all projections for today's games</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /projections/players/{"{player_id}"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get projections for a specific player</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div><span className="font-mono text-sm">player_id</span> (string)</div>
                          <div><span className="font-mono text-sm">game_id</span> (string, optional)</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-sm">
                        /projections/games/{"{game_id}"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">GET</Badge>
                      </TableCell>
                      <TableCell>Get all projections for a specific game</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div><span className="font-mono text-sm">game_id</span> (string)</div>
                          <div><span className="font-mono text-sm">team_id</span> (string, optional)</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 