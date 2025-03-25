'use client'

import React, { useState, useEffect } from "react";
import { getPlayers, getPlayerProjections } from "@/lib/api";
import { Player, ProjectionResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ChevronDown, ChevronUp } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PlayerComparison() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerOne, setPlayerOne] = useState<string | null>(null);
  const [playerTwo, setPlayerTwo] = useState<string | null>(null);
  const [playerOneData, setPlayerOneData] = useState<ProjectionResponse[]>([]);
  const [playerTwoData, setPlayerTwoData] = useState<ProjectionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Toggle expanded sections for mobile view
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Fetch players for selection
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await getPlayers(true);
        setPlayers(data);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Failed to load players. Please try again later.");
      }
    };

    fetchPlayers();
  }, []);

  // Fetch player projections when selected
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerOne && !playerTwo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (playerOne) {
          const data = await getPlayerProjections(playerOne);
          setPlayerOneData(data);
        }
        
        if (playerTwo) {
          const data = await getPlayerProjections(playerTwo);
          setPlayerTwoData(data);
        }
      } catch (err) {
        console.error("Error fetching player projections:", err);
        setError("Failed to load player projections. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerOne, playerTwo]);

  // Calculate average projections
  const calculateAverages = (projections: ProjectionResponse[]) => {
    if (!projections.length) return null;
    
    const totals = projections.reduce((acc, p) => ({
      points: acc.points + p.projection.projected_points,
      rebounds: acc.rebounds + p.projection.projected_rebounds,
      assists: acc.assists + p.projection.projected_assists,
      minutes: acc.minutes + p.projection.projected_minutes,
      confidence: acc.confidence + p.projection.confidence_score
    }), { points: 0, rebounds: 0, assists: 0, minutes: 0, confidence: 0 });
    
    return {
      points: parseFloat((totals.points / projections.length).toFixed(1)),
      rebounds: parseFloat((totals.rebounds / projections.length).toFixed(1)),
      assists: parseFloat((totals.assists / projections.length).toFixed(1)),
      minutes: parseFloat((totals.minutes / projections.length).toFixed(1)),
      confidence: parseFloat((totals.confidence / projections.length).toFixed(1))
    };
  };

  const playerOneAvg = calculateAverages(playerOneData);
  const playerTwoAvg = calculateAverages(playerTwoData);

  // Get player names
  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return "Select Player";
    const player = players.find(p => p.id === playerId);
    return player ? player.full_name : "Unknown Player";
  };
  
  // Get player object
  const getPlayer = (playerId: string | null) => {
    if (!playerId) return null;
    return players.find(p => p.id === playerId) || null;
  };

  // Compare values and determine which is higher
  const compareValues = (val1: number | null, val2: number | null) => {
    if (val1 === null || val2 === null) return "neutral";
    if (val1 > val2) return "player1";
    if (val2 > val1) return "player2";
    return "neutral";
  };

  // Swap players
  const handleSwapPlayers = () => {
    const temp = playerOne;
    setPlayerOne(playerTwo);
    setPlayerTwo(temp);
  };
  
  // Player selection rendered component with avatar
  const PlayerSelectionItem = ({player}: {player: Player}) => (
    <div className="flex items-center gap-2">
      <PlayerAvatar
        playerId={player.id}
        playerName={player.full_name}
        teamId={player.team_id}
        size="xs"
        showTeamColor
      />
      <div className="truncate">
        {player.full_name} 
        <span className="text-muted-foreground ml-1">
          ({player.team?.abbreviation || player.team_id})
        </span>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Player Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Player Selection Area */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Player One</label>
            <Select value={playerOne || ""} onValueChange={setPlayerOne}>
              <SelectTrigger className="h-12">
                {playerOne ? (
                  <div className="flex items-center gap-2 max-w-full overflow-hidden">
                    {getPlayer(playerOne) && (
                      <PlayerAvatar
                        playerId={playerOne}
                        playerName={getPlayerName(playerOne)}
                        teamId={getPlayer(playerOne)?.team_id || ""}
                        size="xs"
                        showTeamColor
                      />
                    )}
                    <span className="truncate">{getPlayerName(playerOne)}</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a player" />
                )}
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[300px]">
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      <PlayerSelectionItem player={player} />
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleSwapPlayers}
              className="h-12 w-12 rounded-full"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span className="sr-only">Swap Players</span>
            </Button>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Player Two</label>
            <Select value={playerTwo || ""} onValueChange={setPlayerTwo}>
              <SelectTrigger className="h-12">
                {playerTwo ? (
                  <div className="flex items-center gap-2 max-w-full overflow-hidden">
                    {getPlayer(playerTwo) && (
                      <PlayerAvatar
                        playerId={playerTwo}
                        playerName={getPlayerName(playerTwo)}
                        teamId={getPlayer(playerTwo)?.team_id || ""}
                        size="xs"
                        showTeamColor
                      />
                    )}
                    <span className="truncate">{getPlayerName(playerTwo)}</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a player" />
                )}
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[300px]">
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      <PlayerSelectionItem player={player} />
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading projections...</p>
          </div>
        ) : (
          <div>
            {(playerOne || playerTwo) && (
              <>
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Tabs defaultValue="averages">
                    <TabsList className="mb-4">
                      <TabsTrigger value="averages">Average Projections</TabsTrigger>
                      <TabsTrigger value="details">Detailed Comparison</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="averages">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <h3 className="text-xl font-semibold mb-2">{getPlayerName(playerOne)}</h3>
                              {playerOneData.length > 0 && playerOneAvg && (
                                <div className="space-y-1">
                                  <p>Games: {playerOneData.length}</p>
                                  <Separator className="my-2" />
                                  <p className={`font-medium ${compareValues(playerOneAvg.points, playerTwoAvg?.points) === "player1" ? "text-green-600" : compareValues(playerOneAvg.points, playerTwoAvg?.points) === "player2" ? "text-red-600" : ""}`}>
                                    {playerOneAvg.points} PTS
                                  </p>
                                  <p className={`font-medium ${compareValues(playerOneAvg.rebounds, playerTwoAvg?.rebounds) === "player1" ? "text-green-600" : compareValues(playerOneAvg.rebounds, playerTwoAvg?.rebounds) === "player2" ? "text-red-600" : ""}`}>
                                    {playerOneAvg.rebounds} REB
                                  </p>
                                  <p className={`font-medium ${compareValues(playerOneAvg.assists, playerTwoAvg?.assists) === "player1" ? "text-green-600" : compareValues(playerOneAvg.assists, playerTwoAvg?.assists) === "player2" ? "text-red-600" : ""}`}>
                                    {playerOneAvg.assists} AST
                                  </p>
                                  <p className={`font-medium ${compareValues(playerOneAvg.minutes, playerTwoAvg?.minutes) === "player1" ? "text-green-600" : compareValues(playerOneAvg.minutes, playerTwoAvg?.minutes) === "player2" ? "text-red-600" : ""}`}>
                                    {playerOneAvg.minutes} MIN
                                  </p>
                                  <Separator className="my-2" />
                                  <p className={`font-medium ${compareValues(playerOneAvg.confidence, playerTwoAvg?.confidence) === "player1" ? "text-green-600" : compareValues(playerOneAvg.confidence, playerTwoAvg?.confidence) === "player2" ? "text-red-600" : ""}`}>
                                    {playerOneAvg.confidence}% Confidence
                                  </p>
                                </div>
                              )}
                              {playerOneData.length === 0 && playerOne && (
                                <p className="text-muted-foreground">No projection data available</p>
                              )}
                              {!playerOne && (
                                <p className="text-muted-foreground">Select a player to compare</p>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <h3 className="text-xl font-semibold mb-2">Difference</h3>
                              {playerOneAvg && playerTwoAvg && (
                                <div className="space-y-1">
                                  <p>&nbsp;</p>
                                  <Separator className="my-2" />
                                  <p className="font-medium">
                                    {Math.abs(playerOneAvg.points - playerTwoAvg.points).toFixed(1)} PTS
                                  </p>
                                  <p className="font-medium">
                                    {Math.abs(playerOneAvg.rebounds - playerTwoAvg.rebounds).toFixed(1)} REB
                                  </p>
                                  <p className="font-medium">
                                    {Math.abs(playerOneAvg.assists - playerTwoAvg.assists).toFixed(1)} AST
                                  </p>
                                  <p className="font-medium">
                                    {Math.abs(playerOneAvg.minutes - playerTwoAvg.minutes).toFixed(1)} MIN
                                  </p>
                                  <Separator className="my-2" />
                                  <p className="font-medium">
                                    {Math.abs(playerOneAvg.confidence - playerTwoAvg.confidence).toFixed(1)}% Confidence
                                  </p>
                                </div>
                              )}
                              {(!playerOneAvg || !playerTwoAvg) && (
                                <p className="text-muted-foreground">Select two players to compare</p>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <h3 className="text-xl font-semibold mb-2">{getPlayerName(playerTwo)}</h3>
                              {playerTwoData.length > 0 && playerTwoAvg && (
                                <div className="space-y-1">
                                  <p>Games: {playerTwoData.length}</p>
                                  <Separator className="my-2" />
                                  <p className={`font-medium ${compareValues(playerTwoAvg.points, playerOneAvg?.points) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.points, playerOneAvg?.points) === "player1" ? "text-red-600" : ""}`}>
                                    {playerTwoAvg.points} PTS
                                  </p>
                                  <p className={`font-medium ${compareValues(playerTwoAvg.rebounds, playerOneAvg?.rebounds) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.rebounds, playerOneAvg?.rebounds) === "player1" ? "text-red-600" : ""}`}>
                                    {playerTwoAvg.rebounds} REB
                                  </p>
                                  <p className={`font-medium ${compareValues(playerTwoAvg.assists, playerOneAvg?.assists) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.assists, playerOneAvg?.assists) === "player1" ? "text-red-600" : ""}`}>
                                    {playerTwoAvg.assists} AST
                                  </p>
                                  <p className={`font-medium ${compareValues(playerTwoAvg.minutes, playerOneAvg?.minutes) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.minutes, playerOneAvg?.minutes) === "player1" ? "text-red-600" : ""}`}>
                                    {playerTwoAvg.minutes} MIN
                                  </p>
                                  <Separator className="my-2" />
                                  <p className={`font-medium ${compareValues(playerTwoAvg.confidence, playerOneAvg?.confidence) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.confidence, playerOneAvg?.confidence) === "player1" ? "text-red-600" : ""}`}>
                                    {playerTwoAvg.confidence}% Confidence
                                  </p>
                                </div>
                              )}
                              {playerTwoData.length === 0 && playerTwo && (
                                <p className="text-muted-foreground">No projection data available</p>
                              )}
                              {!playerTwo && (
                                <p className="text-muted-foreground">Select a player to compare</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="details">
                      <Card>
                        <CardContent className="pt-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>{getPlayerName(playerOne)}</TableHead>
                                <TableHead>{getPlayerName(playerTwo)}</TableHead>
                                <TableHead>Difference</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {playerOneAvg && playerTwoAvg ? (
                                <>
                                  <TableRow>
                                    <TableCell className="font-medium">Points</TableCell>
                                    <TableCell className={compareValues(playerOneAvg.points, playerTwoAvg.points) === "player1" ? "text-green-600" : compareValues(playerOneAvg.points, playerTwoAvg.points) === "player2" ? "text-red-600" : ""}>
                                      {playerOneAvg.points}
                                    </TableCell>
                                    <TableCell className={compareValues(playerTwoAvg.points, playerOneAvg.points) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.points, playerOneAvg.points) === "player1" ? "text-red-600" : ""}>
                                      {playerTwoAvg.points}
                                    </TableCell>
                                    <TableCell>
                                      {Math.abs(playerOneAvg.points - playerTwoAvg.points).toFixed(1)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Rebounds</TableCell>
                                    <TableCell className={compareValues(playerOneAvg.rebounds, playerTwoAvg.rebounds) === "player1" ? "text-green-600" : compareValues(playerOneAvg.rebounds, playerTwoAvg.rebounds) === "player2" ? "text-red-600" : ""}>
                                      {playerOneAvg.rebounds}
                                    </TableCell>
                                    <TableCell className={compareValues(playerTwoAvg.rebounds, playerOneAvg.rebounds) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.rebounds, playerOneAvg.rebounds) === "player1" ? "text-red-600" : ""}>
                                      {playerTwoAvg.rebounds}
                                    </TableCell>
                                    <TableCell>
                                      {Math.abs(playerOneAvg.rebounds - playerTwoAvg.rebounds).toFixed(1)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Assists</TableCell>
                                    <TableCell className={compareValues(playerOneAvg.assists, playerTwoAvg.assists) === "player1" ? "text-green-600" : compareValues(playerOneAvg.assists, playerTwoAvg.assists) === "player2" ? "text-red-600" : ""}>
                                      {playerOneAvg.assists}
                                    </TableCell>
                                    <TableCell className={compareValues(playerTwoAvg.assists, playerOneAvg.assists) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.assists, playerOneAvg.assists) === "player1" ? "text-red-600" : ""}>
                                      {playerTwoAvg.assists}
                                    </TableCell>
                                    <TableCell>
                                      {Math.abs(playerOneAvg.assists - playerTwoAvg.assists).toFixed(1)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Minutes</TableCell>
                                    <TableCell className={compareValues(playerOneAvg.minutes, playerTwoAvg.minutes) === "player1" ? "text-green-600" : compareValues(playerOneAvg.minutes, playerTwoAvg.minutes) === "player2" ? "text-red-600" : ""}>
                                      {playerOneAvg.minutes}
                                    </TableCell>
                                    <TableCell className={compareValues(playerTwoAvg.minutes, playerOneAvg.minutes) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.minutes, playerOneAvg.minutes) === "player1" ? "text-red-600" : ""}>
                                      {playerTwoAvg.minutes}
                                    </TableCell>
                                    <TableCell>
                                      {Math.abs(playerOneAvg.minutes - playerTwoAvg.minutes).toFixed(1)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Confidence</TableCell>
                                    <TableCell className={compareValues(playerOneAvg.confidence, playerTwoAvg.confidence) === "player1" ? "text-green-600" : compareValues(playerOneAvg.confidence, playerTwoAvg.confidence) === "player2" ? "text-red-600" : ""}>
                                      {playerOneAvg.confidence}%
                                    </TableCell>
                                    <TableCell className={compareValues(playerTwoAvg.confidence, playerOneAvg.confidence) === "player2" ? "text-green-600" : compareValues(playerTwoAvg.confidence, playerOneAvg.confidence) === "player1" ? "text-red-600" : ""}>
                                      {playerTwoAvg.confidence}%
                                    </TableCell>
                                    <TableCell>
                                      {Math.abs(playerOneAvg.confidence - playerTwoAvg.confidence).toFixed(1)}%
                                    </TableCell>
                                  </TableRow>
                                </>
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Select two players to compare their projection metrics
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Mobile View - Card-based comparison with expandable sections */}
                <div className="md:hidden space-y-4">
                  {/* Player One Card */}
                  {playerOne && (
                    <Card className={`overflow-hidden transition-all ${expandedSection === 'player1' ? 'border-primary' : ''}`}>
                      <CardHeader className="p-4 cursor-pointer" onClick={() => toggleSection('player1')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPlayer(playerOne) && (
                              <PlayerAvatar
                                playerId={playerOne}
                                playerName={getPlayerName(playerOne)}
                                teamId={getPlayer(playerOne)?.team_id || ""}
                                size="sm"
                                showTeamColor
                              />
                            )}
                            <h3 className="font-semibold">{getPlayerName(playerOne)}</h3>
                          </div>
                          {expandedSection === 'player1' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                      {expandedSection === 'player1' && playerOneAvg && (
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Games: {playerOneData.length}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerOneAvg.points}</p>
                                <p className="text-sm text-muted-foreground">PTS</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerOneAvg.rebounds}</p>
                                <p className="text-sm text-muted-foreground">REB</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerOneAvg.assists}</p>
                                <p className="text-sm text-muted-foreground">AST</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerOneAvg.minutes}</p>
                                <p className="text-sm text-muted-foreground">MIN</p>
                              </div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Confidence</p>
                              <p className="text-xl font-bold">{playerOneAvg.confidence}%</p>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                  
                  {/* Player Two Card */}
                  {playerTwo && (
                    <Card className={`overflow-hidden transition-all ${expandedSection === 'player2' ? 'border-primary' : ''}`}>
                      <CardHeader className="p-4 cursor-pointer" onClick={() => toggleSection('player2')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPlayer(playerTwo) && (
                              <PlayerAvatar
                                playerId={playerTwo}
                                playerName={getPlayerName(playerTwo)}
                                teamId={getPlayer(playerTwo)?.team_id || ""}
                                size="sm"
                                showTeamColor
                              />
                            )}
                            <h3 className="font-semibold">{getPlayerName(playerTwo)}</h3>
                          </div>
                          {expandedSection === 'player2' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                      {expandedSection === 'player2' && playerTwoAvg && (
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Games: {playerTwoData.length}</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerTwoAvg.points}</p>
                                <p className="text-sm text-muted-foreground">PTS</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerTwoAvg.rebounds}</p>
                                <p className="text-sm text-muted-foreground">REB</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerTwoAvg.assists}</p>
                                <p className="text-sm text-muted-foreground">AST</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold">{playerTwoAvg.minutes}</p>
                                <p className="text-sm text-muted-foreground">MIN</p>
                              </div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">Confidence</p>
                              <p className="text-xl font-bold">{playerTwoAvg.confidence}%</p>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                  
                  {/* Comparison Card */}
                  {playerOne && playerTwo && playerOneAvg && playerTwoAvg && (
                    <Card className={`overflow-hidden transition-all ${expandedSection === 'comparison' ? 'border-primary' : ''}`}>
                      <CardHeader className="p-4 cursor-pointer" onClick={() => toggleSection('comparison')}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Stat Comparison</h3>
                          {expandedSection === 'comparison' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </CardHeader>
                      {expandedSection === 'comparison' && (
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Points</span>
                              <div className="flex items-center gap-4">
                                <span className={compareValues(playerOneAvg.points, playerTwoAvg.points) === "player1" ? "text-green-600 font-bold" : ""}>
                                  {playerOneAvg.points}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={compareValues(playerTwoAvg.points, playerOneAvg.points) === "player2" ? "text-green-600 font-bold" : ""}>
                                  {playerTwoAvg.points}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Rebounds</span>
                              <div className="flex items-center gap-4">
                                <span className={compareValues(playerOneAvg.rebounds, playerTwoAvg.rebounds) === "player1" ? "text-green-600 font-bold" : ""}>
                                  {playerOneAvg.rebounds}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={compareValues(playerTwoAvg.rebounds, playerOneAvg.rebounds) === "player2" ? "text-green-600 font-bold" : ""}>
                                  {playerTwoAvg.rebounds}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Assists</span>
                              <div className="flex items-center gap-4">
                                <span className={compareValues(playerOneAvg.assists, playerTwoAvg.assists) === "player1" ? "text-green-600 font-bold" : ""}>
                                  {playerOneAvg.assists}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={compareValues(playerTwoAvg.assists, playerOneAvg.assists) === "player2" ? "text-green-600 font-bold" : ""}>
                                  {playerTwoAvg.assists}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Minutes</span>
                              <div className="flex items-center gap-4">
                                <span className={compareValues(playerOneAvg.minutes, playerTwoAvg.minutes) === "player1" ? "text-green-600 font-bold" : ""}>
                                  {playerOneAvg.minutes}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={compareValues(playerTwoAvg.minutes, playerOneAvg.minutes) === "player2" ? "text-green-600 font-bold" : ""}>
                                  {playerTwoAvg.minutes}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Confidence</span>
                              <div className="flex items-center gap-4">
                                <span className={compareValues(playerOneAvg.confidence, playerTwoAvg.confidence) === "player1" ? "text-green-600 font-bold" : ""}>
                                  {playerOneAvg.confidence}%
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={compareValues(playerTwoAvg.confidence, playerOneAvg.confidence) === "player2" ? "text-green-600 font-bold" : ""}>
                                  {playerTwoAvg.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 