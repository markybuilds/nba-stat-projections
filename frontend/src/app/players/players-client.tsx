'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Player } from "@/types";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TeamLogo } from "@/components/ui/team-logo";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { VirtualizedList } from "@/components/ui/virtualized-list";
import { useWindowSize } from "@/hooks/use-window-size";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { usePlayers } from "@/hooks/use-players";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PlayersClientProps {
  initialPlayers: Player[];
}

type SortField = 'name' | 'team' | 'position';
type SortDirection = 'asc' | 'desc';

export default function PlayersClient({ initialPlayers }: PlayersClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(initialPlayers);
  const { width, height } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  
  // Use the SWR hook to get live data
  const { data, error, isLoading, mutate } = usePlayers();
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<boolean>(true);
  
  // Sort states
  const [sortField, setSortField] = useLocalStorage<SortField>('players-sort-field', 'name');
  const [sortDirection, setSortDirection] = useLocalStorage<SortDirection>('players-sort-direction', 'asc');
  
  // Extract unique teams and positions for filters
  const uniqueTeams = [...new Set(players.map(player => player.team_id))].filter(Boolean);
  const uniquePositions = [...new Set(players.map(player => player.position))].filter(Boolean);
  
  // Team and position lookup maps for display
  const teamMap = new Map<string, { abbreviation: string }>();
  players.forEach(player => {
    if (player.team_id && player.team) {
      teamMap.set(player.team_id, { abbreviation: player.team.abbreviation });
    }
  });
  
  // Update players data when it changes from SWR
  useEffect(() => {
    if (data) {
      setPlayers(data);
    }
  }, [data]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...players];
    
    // Filter by active status
    if (activeFilter) {
      filtered = filtered.filter(player => player.is_active);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(player => 
        player.full_name.toLowerCase().includes(query)
      );
    }
    
    // Apply team filter
    if (teamFilter !== 'all') {
      filtered = filtered.filter(player => player.team_id === teamFilter);
    }
    
    // Apply position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(player => player.position === positionFilter);
    }
    
    // Apply sorting
    filtered = sortPlayers(filtered, sortField, sortDirection);
    
    setFilteredPlayers(filtered);
  }, [players, searchQuery, teamFilter, positionFilter, activeFilter, sortField, sortDirection]);
  
  // Sort players
  const sortPlayers = (players: Player[], field: SortField, direction: SortDirection) => {
    return [...players].sort((a, b) => {
      let valueA: string;
      let valueB: string;
      
      switch (field) {
        case 'name':
          valueA = a.full_name;
          valueB = b.full_name;
          break;
        case 'team':
          valueA = a.team?.abbreviation || a.team_id || '';
          valueB = b.team?.abbreviation || b.team_id || '';
          break;
        case 'position':
          valueA = a.position || '';
          valueB = b.position || '';
          break;
        default:
          valueA = a.full_name;
          valueB = b.full_name;
      }
      
      if (direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  };
  
  // Toggle sort direction or change sort field
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setTeamFilter('all');
    setPositionFilter('all');
    setActiveFilter(true);
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (teamFilter !== 'all') count++;
    if (positionFilter !== 'all') count++;
    if (!activeFilter) count++; // Count if showing inactive players
    return count;
  };
  
  // Save filter preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('players-filters', JSON.stringify({
      teamFilter,
      positionFilter,
      activeFilter,
      sortField,
      sortDirection
    }));
  };
  
  // Load filter preferences from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('players-filters');
    if (savedFilters) {
      try {
        const { teamFilter: savedTeam, positionFilter: savedPosition, activeFilter: savedActive } = JSON.parse(savedFilters);
        setTeamFilter(savedTeam || 'all');
        setPositionFilter(savedPosition || 'all');
        setActiveFilter(savedActive !== undefined ? savedActive : true);
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }, []);
  
  // Render sort icon based on current sort
  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortDirection === 'asc' 
      ? <SortAsc className="h-4 w-4 ml-1" /> 
      : <SortDesc className="h-4 w-4 ml-1" />;
  };
  
  // Render sort button for table headers
  const SortButton = ({ field, label }: { field: SortField, label: string }) => (
    <button 
      className="flex items-center hover:text-primary focus:outline-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {renderSortIcon(field)}
    </button>
  );

  // Render player card for virtualized list
  const renderPlayerCard = useCallback((player: Player, index: number) => (
    <Link 
      href={`/players/${player.id}`}
      key={player.id}
      className="group px-2 py-1"
    >
      <Card className="h-full hover:border-primary transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <PlayerAvatar 
              playerId={player.id}
              playerName={player.full_name}
              teamId={player.team_id}
              size="md"
              showTeamColor
            />
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {player.full_name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TeamLogo teamId={player.team_id} size="xs" />
                <span>{player.team ? player.team.abbreviation : player.team_id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm">
            <div>
              {player.position && (
                <Badge variant="outline">
                  {player.position}
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground">
              #{player.jersey_number || "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ), []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
      toast({
        title: "Data refreshed",
        description: "The latest player data has been loaded",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh data. Please try again later.",
        variant: "destructive",
        duration: 3000
      });
      console.error('Error refreshing players:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>All Players</CardTitle>
          
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
                  <SheetTitle>Filter Players</SheetTitle>
                  <SheetDescription>
                    Apply filters to find specific players
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
                            {uniqueTeams.map(teamId => (
                              <SelectItem key={teamId} value={teamId}>
                                <div className="flex items-center gap-2">
                                  <TeamLogo teamId={teamId} size="xs" />
                                  <span>{teamMap.get(teamId)?.abbreviation || teamId}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Position</label>
                      <Select 
                        value={positionFilter} 
                        onValueChange={setPositionFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">All Positions</SelectItem>
                            {uniquePositions.map(position => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="active-only">Show only active players</Label>
                      <Switch
                        id="active-only" 
                        checked={activeFilter}
                        onCheckedChange={setActiveFilter}
                      />
                    </div>

                    <Separator className="my-4" />
                    
                    <div>
                      <label className="text-sm font-medium mb-4 block">Sort By</label>
                      <RadioGroup 
                        value={sortField}
                        onValueChange={(value) => setSortField(value as SortField)}
                        className="grid grid-cols-1 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="name" id="sort-name" />
                          <Label htmlFor="sort-name">Player Name</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team" id="sort-team" />
                          <Label htmlFor="sort-team">Team</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="position" id="sort-position" />
                          <Label htmlFor="sort-position">Position</Label>
                        </div>
                      </RadioGroup>
                      
                      <div className="mt-4">
                        <label className="text-sm font-medium mb-2 block">Sort Direction</label>
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant={sortDirection === 'asc' ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setSortDirection('asc')}
                            className="w-full"
                          >
                            <SortAsc className="h-4 w-4 mr-2" />
                            Ascending
                          </Button>
                          <Button 
                            variant={sortDirection === 'desc' ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setSortDirection('desc')}
                            className="w-full"
                          >
                            <SortDesc className="h-4 w-4 mr-2" />
                            Descending
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 pt-4">
                      <Label htmlFor="save-preferences">Save these preferences</Label>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={savePreferences}
                      >
                        Save Preferences
                      </Button>
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
        
        {/* Desktop Filter Controls */}
        <div className="hidden md:flex md:flex-row gap-4 mt-4 flex-wrap">
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
                {uniqueTeams.map(teamId => (
                  <SelectItem key={teamId} value={teamId}>
                    <div className="flex items-center gap-2">
                      <TeamLogo teamId={teamId} size="xs" />
                      <span>{teamMap.get(teamId)?.abbreviation || teamId}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select 
            value={positionFilter} 
            onValueChange={setPositionFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Positions</SelectLabel>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="desktop-active-only" 
              checked={activeFilter}
              onCheckedChange={setActiveFilter}
            />
            <Label htmlFor="desktop-active-only">Active Only</Label>
          </div>
          
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground flex items-center ml-auto">
            {filteredPlayers.length} players found
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
                  {teamMap.get(teamFilter)?.abbreviation || teamFilter}
                  <button 
                    className="ml-2" 
                    onClick={() => setTeamFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {positionFilter !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  {positionFilter}
                  <button 
                    className="ml-2" 
                    onClick={() => setPositionFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {!activeFilter && (
                <Badge variant="secondary" className="px-3 py-1">
                  Including Inactive
                  <button 
                    className="ml-2" 
                    onClick={() => setActiveFilter(true)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              <div className="text-xs text-muted-foreground mt-2 ml-1">
                {filteredPlayers.length} results
              </div>
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="name" label="Player" />
                </TableHead>
                <TableHead>
                  <SortButton field="team" label="Team" />
                </TableHead>
                <TableHead>
                  <SortButton field="position" label="Position" />
                </TableHead>
                <TableHead className="text-right">Jersey #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
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
                  <TableCell className="flex items-center gap-2">
                    <TeamLogo teamId={player.team_id} size="xs" />
                    <span>{player.team ? player.team.abbreviation : player.team_id}</span>
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
        </div>
        
        {/* Mobile Card View - Shown only on Mobile */}
        {isMobile ? (
          <div className="md:hidden">
            {filteredPlayers.length > 0 ? (
              <PullToRefresh 
                onRefresh={handleRefresh} 
                containerClassName="px-2"
              >
                {refreshing && (
                  <div className="flex justify-center items-center py-2 text-primary">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Refreshing...</span>
                  </div>
                )}
                <VirtualizedList
                  items={filteredPlayers}
                  renderItem={renderPlayerCard}
                  itemHeight={128}
                  containerHeight={Math.min(640, height ? height * 0.7 : 500)}
                  className="px-2"
                  keyExtractor={(player) => player.id}
                />
              </PullToRefresh>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No players found matching your filters
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4">
            {filteredPlayers.map((player) => renderPlayerCard(player, 0))}
          </div>
        )}
        
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No players found matching your filters
          </div>
        )}
      </CardContent>
    </Card>
  );
} 