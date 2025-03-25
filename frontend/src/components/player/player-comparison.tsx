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
import { ArrowRightLeft } from "lucide-react";

export function PlayerComparison() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerOne, setPlayerOne] = useState<string | null>(null);
  const [playerTwo, setPlayerTwo] = useState<string | null>(null);
  const [playerOneData, setPlayerOneData] = useState<ProjectionResponse[]>([]);
  const [playerTwoData, setPlayerTwoData] = useState<ProjectionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Player Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Player One</label>
            <Select value={playerOne || ""} onValueChange={setPlayerOne}>
              <SelectTrigger>
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.full_name} ({player.team?.abbreviation || player.team_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end justify-center">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSwapPlayers}
              className="mb-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Player Two</label>
            <Select value={playerTwo || ""} onValueChange={setPlayerTwo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.full_name} ({player.team?.abbreviation || player.team_id})
                  </SelectItem>
                ))}
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
            )}
            
            {!playerOne && !playerTwo && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select players to compare their projections</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 