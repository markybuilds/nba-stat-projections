'use client'

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { getTodaysProjections } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Link from "next/link";
import { ProjectionResponse } from "@/types";

export default function ProjectionsPage() {
  const [projections, setProjections] = useState<ProjectionResponse[]>([]);
  const [filteredProjections, setFilteredProjections] = useState<ProjectionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uniqueTeams, setUniqueTeams] = useState<{id: string, abbreviation: string}[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProjections = async () => {
      try {
        setLoading(true);
        const data = await getTodaysProjections();
        setProjections(data);
        
        // Extract unique teams for filter dropdown
        const teamsMap = new Map<string, {id: string, abbreviation: string}>();
        data.forEach(projection => {
          if (projection.player.team_id) {
            const abbreviation = projection.player.team?.abbreviation || projection.player.team_id;
            teamsMap.set(projection.player.team_id, {
              id: projection.player.team_id,
              abbreviation: abbreviation
            });
          }
        });
        setUniqueTeams(Array.from(teamsMap.values()));
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projections:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchProjections();
  }, []);

  // Apply filters and pagination
  useEffect(() => {
    let filtered = [...projections];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(projection => 
        projection.player.full_name.toLowerCase().includes(query)
      );
    }
    
    // Apply team filter
    if (teamFilter !== 'all') {
      filtered = filtered.filter(projection => 
        projection.player.team_id === teamFilter
      );
    }
    
    setFilteredProjections(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [projections, searchQuery, teamFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjections = filteredProjections.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Player Projections</h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Projections</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                placeholder="Search players..."
                className="max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select 
                value={teamFilter} 
                onValueChange={setTeamFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teams</SelectLabel>
                    <SelectItem value="all">All Teams</SelectItem>
                    {uniqueTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.abbreviation}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {filteredProjections.length} projections found
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading projections...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Error loading projections: {error.message}</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead className="text-right">PTS</TableHead>
                      <TableHead className="text-right">REB</TableHead>
                      <TableHead className="text-right">AST</TableHead>
                      <TableHead className="text-right">MIN</TableHead>
                      <TableHead className="text-right">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProjections.length > 0 ? (
                      paginatedProjections.map((projection) => (
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
                          <TableCell>
                            <Link
                              href={`/games/${projection.game.id}`}
                              className="hover:underline flex items-center"
                            >
                              {projection.opponent_team.abbreviation}
                              {projection.home_team ? (
                                <Badge variant="outline" className="ml-2">vs</Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2">@</Badge>
                              )}
                            </Link>
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No projections found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {getPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 