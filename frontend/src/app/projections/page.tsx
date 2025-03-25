'use client'

import React, { useState, useEffect, useCallback } from "react";
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
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TeamLogo } from "@/components/ui/team-logo";
import { Button } from "@/components/ui/button";
import { Filter, X, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectionsPage() {
  const [projections, setProjections] = useState<ProjectionResponse[]>([]);
  const [filteredProjections, setFilteredProjections] = useState<ProjectionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uniqueTeams, setUniqueTeams] = useState<{id: string, abbreviation: string}[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchProjections = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchProjections();
  }, [fetchProjections]);

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
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setTeamFilter('all');
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchProjections();
    toast({
      title: "Refreshed",
      description: "Projections data has been updated",
      duration: 3000,
    });
  }, [fetchProjections, toast]);

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
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (teamFilter !== 'all') count++;
    return count;
  };
  
  // Render projection card for mobile
  const ProjectionCard = ({ projection }: { projection: ProjectionResponse }) => (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/players/${projection.player.id}`}>
            <PlayerAvatar 
              playerId={projection.player.id}
              playerName={projection.player.full_name}
              teamId={projection.player.team_id}
              size="md"
              showTeamColor
            />
          </Link>
          <div>
            <Link 
              href={`/players/${projection.player.id}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {projection.player.full_name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TeamLogo teamId={projection.player.team_id} size="xs" />
              <span>{projection.player.team?.abbreviation || projection.player.team_id}</span>
            </div>
          </div>
        </div>
        
        <Link
          href={`/games/${projection.game.id}`}
          className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md mb-3 hover:bg-muted/80 transition-colors"
        >
          <TeamLogo 
            teamId={projection.player.team_id} 
            size="xs" 
          />
          <span className="text-sm">
            {projection.home_team ? 'vs ' : '@ '}
          </span>
          <TeamLogo 
            teamId={projection.opponent_team.id} 
            size="xs" 
          />
          <span className="text-sm">{projection.opponent_team.abbreviation}</span>
        </Link>
        
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="text-center p-2 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground mb-1">PTS</p>
            <p className="font-bold">{projection.projection.projected_points.toFixed(1)}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground mb-1">REB</p>
            <p className="font-bold">{projection.projection.projected_rebounds.toFixed(1)}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground mb-1">AST</p>
            <p className="font-bold">{projection.projection.projected_assists.toFixed(1)}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground mb-1">MIN</p>
            <p className="font-bold">{projection.projection.projected_minutes.toFixed(1)}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Confidence</span>
          <Badge 
            variant={projection.projection.confidence_score >= 70 ? "default" : "secondary"}
            className="px-3"
          >
            {projection.projection.confidence_score.toFixed(0)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Player Projections</h1>
          
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>All Projections</CardTitle>
                
                <div className="flex gap-2 items-center">
                  {/* Manual refresh button - shows on all devices */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleRefresh()} 
                    disabled={loading}
                    title="Refresh projections"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  {/* Mobile Filter Button */}
                  <div className="md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="relative">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                          {getActiveFilterCount() > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                              {getActiveFilterCount()}
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[90vh] sm:max-w-none">
                        <SheetHeader className="mb-4">
                          <SheetTitle>Filter Projections</SheetTitle>
                          <SheetDescription>
                            Apply filters to find specific player projections
                          </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100%-10rem)]">
                          <div className="space-y-6 px-1">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Search Player</label>
                              <Input
                                placeholder="Player name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-2 block">Team</label>
                              <Select 
                                value={teamFilter} 
                                onValueChange={setTeamFilter}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Filter by team" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {uniqueTeams.map(team => (
                                      <SelectItem key={team.id} value={team.id}>
                                        <div className="flex items-center gap-2">
                                          <TeamLogo teamId={team.id} size="xs" />
                                          <span>{team.abbreviation}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </ScrollArea>
                        <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                          <SheetClose asChild>
                            <Button className="w-full sm:w-auto">
                              Apply Filters
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
              
              {/* Desktop Filter Controls */}
              <div className="hidden md:flex md:flex-row gap-4 mt-4">
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
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            <TeamLogo teamId={team.id} size="xs" />
                            <span>{team.abbreviation}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                {getActiveFilterCount() > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
                
                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredProjections.length} projections found
                </div>
              </div>
              
              {/* Mobile active filters display */}
              <div className="flex md:hidden gap-2 flex-wrap mt-2">
                {getActiveFilterCount() > 0 ? (
                  <>
                    {searchQuery && (
                      <Badge variant="secondary" className="px-3 py-1">
                        {searchQuery}
                        <button 
                          className="ml-2" 
                          onClick={() => setSearchQuery('')}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {teamFilter !== 'all' && (
                      <Badge variant="secondary" className="px-3 py-1">
                        {uniqueTeams.find(t => t.id === teamFilter)?.abbreviation || teamFilter}
                        <button 
                          className="ml-2" 
                          onClick={() => setTeamFilter('all')}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2 ml-1">
                      {filteredProjections.length} results
                    </div>
                  </>
                ) : null}
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
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
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
                                  className="font-medium hover:underline flex items-center gap-2"
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
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <TeamLogo 
                                  teamId={projection.player.team_id} 
                                  size="xs" 
                                />
                                <span>{projection.player.team?.abbreviation || projection.player.team_id}</span>
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={`/games/${projection.game.id}`}
                                  className="hover:underline flex items-center gap-2"
                                >
                                  <TeamLogo 
                                    teamId={projection.opponent_team.id} 
                                    size="xs" 
                                  />
                                  <span>{projection.opponent_team.abbreviation}</span>
                                  {projection.home_team ? (
                                    <Badge variant="outline">vs</Badge>
                                  ) : (
                                    <Badge variant="outline">@</Badge>
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
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {paginatedProjections.length > 0 ? (
                      paginatedProjections.map((projection) => (
                        <ProjectionCard 
                          key={`${projection.player.id}-${projection.game.id}`} 
                          projection={projection} 
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No projections found matching your filters
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {paginatedProjections.length > 0 && totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {/* Show fewer items on mobile */}
                        <div className="hidden sm:flex">
                          {getPaginationItems()}
                        </div>
                        
                        {/* Simplified mobile pagination */}
                        <div className="sm:hidden flex items-center gap-1">
                          <PaginationItem>
                            <PaginationLink isActive>
                              {currentPage} / {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile instructions for pull-to-refresh */}
        <div className="md:hidden text-center text-xs text-muted-foreground pt-0 pb-4">
          Pull down to refresh projections
        </div>
      </PullToRefresh>
    </Layout>
  );
} 