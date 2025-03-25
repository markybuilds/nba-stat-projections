"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, RefreshCw, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Game } from "@/types";
import { useRealTimeGames } from "@/lib/use-real-time-games";
import { format, addDays, subDays, parseISO } from "date-fns";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useToast } from "@/components/ui/use-toast";
import { TeamLogo } from "@/components/ui/team-logo";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface GamesClientProps {
  initialGames: Game[];
  initialDate: string;
}

type GameStatus = 'all' | 'scheduled' | 'in_progress' | 'finished';

export default function GamesClient({ initialGames, initialDate }: GamesClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  
  // Filter states
  const [teamFilter, setTeamFilter] = useLocalStorage<string>('games-team-filter', 'all');
  const [statusFilter, setStatusFilter] = useLocalStorage<GameStatus>('games-status-filter', 'all');
  const [showPastGames, setShowPastGames] = useLocalStorage<boolean>('games-show-past', true);
  
  const { toast } = useToast();
  
  // Use our real-time games hook
  const { 
    games, 
    lastUpdate, 
    isLive,
    refreshGames
  } = useRealTimeGames({
    initialData: initialGames,
    date: selectedDate
  });
  
  // Apply filters
  const filteredGames = games.filter(game => {
    // Filter by team
    if (teamFilter !== 'all') {
      if (game.home_team_id !== teamFilter && game.visitor_team_id !== teamFilter) {
        return false;
      }
    }
    
    // Filter by game status
    if (statusFilter !== 'all') {
      if (statusFilter === 'scheduled' && game.status !== 'scheduled') {
        return false;
      } else if (statusFilter === 'in_progress' && game.status !== 'in_progress') {
        return false;
      } else if (statusFilter === 'finished' && game.status !== 'finished') {
        return false;
      }
    }
    
    // Filter past games if option is disabled
    if (!showPastGames) {
      const gameDate = new Date(game.game_date);
      const now = new Date();
      
      // If game is finished or game time is in the past
      if (game.status === 'finished' || gameDate < now) {
        return false;
      }
    }
    
    return true;
  });

  // Group games by date for display
  const gamesByDate: Record<string, Game[]> = {};
  
  filteredGames.forEach(game => {
    const date = new Date(game.game_date).toLocaleDateString();
    if (!gamesByDate[date]) {
      gamesByDate[date] = [];
    }
    gamesByDate[date].push(game);
  });
  
  // Extract unique teams for the filter
  const allTeams = new Set<string>();
  const teamMap = new Map<string, { fullName: string }>();
  
  games.forEach(game => {
    if (game.home_team_id) {
      allTeams.add(game.home_team_id);
      if (game.home_team) {
        teamMap.set(game.home_team_id, { fullName: game.home_team.full_name });
      }
    }
    if (game.visitor_team_id) {
      allTeams.add(game.visitor_team_id);
      if (game.visitor_team) {
        teamMap.set(game.visitor_team_id, { fullName: game.visitor_team.full_name });
      }
    }
  });
  
  const uniqueTeams = Array.from(allTeams);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await refreshGames();
    toast({
      title: "Refreshed",
      description: "Game data has been updated",
      duration: 3000,
    });
  }, [refreshGames, toast]);
  
  // Change date
  const goToNextDay = () => {
    const currentDate = parseISO(selectedDate);
    const nextDay = addDays(currentDate, 1);
    setSelectedDate(format(nextDay, 'yyyy-MM-dd'));
  };
  
  const goToPrevDay = () => {
    const currentDate = parseISO(selectedDate);
    const prevDay = subDays(currentDate, 1);
    setSelectedDate(format(prevDay, 'yyyy-MM-dd'));
  };
  
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (teamFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (!showPastGames) count++;
    return count;
  };
  
  // Clear all filters
  const clearFilters = () => {
    setTeamFilter('all');
    setStatusFilter('all');
    setShowPastGames(true);
  };
  
  // Save filter preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('games-filters', JSON.stringify({
      teamFilter,
      statusFilter,
      showPastGames
    }));
    
    toast({
      title: "Preferences Saved",
      description: "Your filter settings have been saved",
      duration: 3000,
    });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Game Schedule</CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Desktop refresh button */}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={false}
                title="Refresh games"
                className="h-8 w-8 hidden md:flex"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              {/* Mobile filter button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative h-8 w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] sm:max-w-none">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Filter Games</SheetTitle>
                      <SheetDescription>
                        Apply filters to find specific games
                      </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-10rem)]">
                      <div className="space-y-6 px-1">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Date</label>
                          <div className="flex flex-col gap-4">
                            <Input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                onClick={goToPrevDay}
                                className="w-full"
                              >
                                Previous
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={goToToday}
                                className="w-full"
                              >
                                Today
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={goToNextDay}
                                className="w-full"
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
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
                                      <span>{teamMap.get(teamId)?.fullName || teamId}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Game Status</label>
                          <Select 
                            value={statusFilter} 
                            onValueChange={(value) => setStatusFilter(value as GameStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">Live Games</SelectItem>
                                <SelectItem value="finished">Completed</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor="show-past-games">Show past/completed games</Label>
                          <Switch
                            id="show-past-games" 
                            checked={showPastGames}
                            onCheckedChange={setShowPastGames}
                          />
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
              
              {isLive && (
                <Badge variant="outline" className="gap-1 px-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs">Live</span>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Desktop filter controls */}
          <div className="hidden md:flex md:flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={goToPrevDay}
                  className="h-10 w-10"
                >
                  <span className="sr-only">Previous day</span>
                  &larr;
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                  className="h-10"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={goToNextDay}
                  className="h-10 w-10"
                >
                  <span className="sr-only">Next day</span>
                  &rarr;
                </Button>
              </div>
            </div>
            
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
                        <span>{teamMap.get(teamId)?.fullName || teamId}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as GameStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">Live Games</SelectItem>
                  <SelectItem value="finished">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="desktop-show-past" 
                checked={showPastGames}
                onCheckedChange={setShowPastGames}
              />
              <Label htmlFor="desktop-show-past">Show past games</Label>
            </div>
            
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            
            {lastUpdate && (
              <div className="text-xs text-muted-foreground self-end ml-auto">
                Last updated: {format(lastUpdate, 'HH:mm:ss')}
              </div>
            )}
          </div>
          
          {/* Mobile active filters display */}
          <div className="flex md:hidden gap-2 flex-wrap mt-2">
            {getActiveFilterCount() > 0 ? (
              <>
                {teamFilter !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {teamMap.get(teamFilter)?.fullName || teamFilter}
                    <button 
                      className="ml-2" 
                      onClick={() => setTeamFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Status: {statusFilter}
                    <button 
                      className="ml-2" 
                      onClick={() => setStatusFilter('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {!showPastGames && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Hiding past games
                    <button 
                      className="ml-2" 
                      onClick={() => setShowPastGames(true)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </>
            ) : null}
          </div>
          
          <div className="md:hidden text-xs text-muted-foreground mt-2">
            {lastUpdate && (
              <div>
                Last updated: {format(lastUpdate, 'HH:mm:ss')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(gamesByDate).length > 0 ? (
            Object.entries(gamesByDate).map(([date, dateGames]) => (
              <div key={date} className="mb-6">
                <h3 className="text-lg font-medium mb-4">{date}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {dateGames.map((game) => (
                    <Link 
                      href={`/games/${game.id}`} 
                      key={game.id}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="grid grid-cols-7 gap-2 items-center">
                          <div className="col-span-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-medium">{game.visitor_team?.full_name || game.visitor_team_id}</span>
                              <TeamLogo teamId={game.visitor_team_id} size="xs" />
                            </div>
                            {game.visitor_team_score !== null && game.visitor_team_score !== undefined && (
                              <div className="text-xl font-bold">{game.visitor_team_score}</div>
                            )}
                          </div>
                          
                          <div className="col-span-1 text-center">
                            <div className="text-muted-foreground">@</div>
                            {game.visitor_team_score !== null && 
                             game.visitor_team_score !== undefined && 
                             game.home_team_score !== null && 
                             game.home_team_score !== undefined && (
                              <Badge 
                                variant={game.visitor_team_score > game.home_team_score ? "default" : "outline"}
                                className="mx-auto my-1"
                              >
                                {game.visitor_team_score > game.home_team_score ? "W" : "L"}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="col-span-3">
                            <div className="flex items-center gap-2">
                              <TeamLogo teamId={game.home_team_id} size="xs" />
                              <span className="font-medium">{game.home_team?.full_name || game.home_team_id}</span>
                            </div>
                            {game.home_team_score !== null && game.home_team_score !== undefined && (
                              <div className="text-xl font-bold">{game.home_team_score}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center mt-2 text-sm text-muted-foreground">
                          {game.status === "in_progress" && (
                            <Badge variant="secondary" className="mx-1">LIVE</Badge>
                          )}
                          {game.status === "finished" && (
                            <Badge variant="outline" className="mx-1">FINAL</Badge>
                          )}
                          {new Date(game.game_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">No games found matching your filters</p>
          )}
          
          {filteredGames.length === 0 && games.length > 0 && (
            <div className="text-center mt-2">
              <Button variant="link" onClick={clearFilters}>
                Clear all filters to see {games.length} games
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Mobile instructions for pull-to-refresh */}
      <div className="md:hidden text-center text-xs text-muted-foreground pt-0 pb-4">
        Pull down to refresh games
      </div>
    </PullToRefresh>
  );
} 