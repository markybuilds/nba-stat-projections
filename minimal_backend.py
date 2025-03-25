from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import os
from datetime import datetime

# Create the FastAPI app
app = FastAPI(
    title="NBA Stat Projections API",
    description="Simplified API for NBA statistical projections",
    version="1.0.0"
)

# Add CORS middleware to allow the frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data models
class Player(BaseModel):
    id: int
    name: str
    team: str
    position: str
    height: Optional[str] = None
    weight: Optional[int] = None
    age: Optional[int] = None

class Stat(BaseModel):
    points: float
    rebounds: float
    assists: float
    steals: float
    blocks: float
    turnovers: float
    minutes: float

class PlayerStats(BaseModel):
    player_id: int
    player_name: str
    team: str
    position: str
    stats: Stat

class Projection(BaseModel):
    player_id: int
    player_name: str
    date: str
    projected_stats: Stat
    confidence: float

# Load sample data
def load_sample_data():
    # Sample players
    players = [
        {"id": 1, "name": "LeBron James", "team": "LAL", "position": "SF", "height": "6'9\"", "weight": 250, "age": 38},
        {"id": 2, "name": "Stephen Curry", "team": "GSW", "position": "PG", "height": "6'2\"", "weight": 185, "age": 35},
        {"id": 3, "name": "Kevin Durant", "team": "PHX", "position": "PF", "height": "6'10\"", "weight": 240, "age": 34},
        {"id": 4, "name": "Giannis Antetokounmpo", "team": "MIL", "position": "PF", "height": "6'11\"", "weight": 242, "age": 28},
        {"id": 5, "name": "Luka Doncic", "team": "DAL", "position": "PG", "height": "6'7\"", "weight": 230, "age": 24},
    ]
    
    # Sample stats
    player_stats = [
        {"player_id": 1, "player_name": "LeBron James", "team": "LAL", "position": "SF", 
         "stats": {"points": 25.7, "rebounds": 7.8, "assists": 7.3, "steals": 1.3, "blocks": 0.6, "turnovers": 3.2, "minutes": 35.2}},
        {"player_id": 2, "player_name": "Stephen Curry", "team": "GSW", "position": "PG", 
         "stats": {"points": 29.4, "rebounds": 6.1, "assists": 6.3, "steals": 0.9, "blocks": 0.2, "turnovers": 3.0, "minutes": 34.7}},
        {"player_id": 3, "player_name": "Kevin Durant", "team": "PHX", "position": "PF", 
         "stats": {"points": 29.1, "rebounds": 6.7, "assists": 5.0, "steals": 0.7, "blocks": 1.4, "turnovers": 3.1, "minutes": 35.6}},
        {"player_id": 4, "player_name": "Giannis Antetokounmpo", "team": "MIL", "position": "PF", 
         "stats": {"points": 31.1, "rebounds": 11.8, "assists": 5.7, "steals": 0.8, "blocks": 0.8, "turnovers": 3.9, "minutes": 32.1}},
        {"player_id": 5, "player_name": "Luka Doncic", "team": "DAL", "position": "PG", 
         "stats": {"points": 32.4, "rebounds": 8.6, "assists": 8.0, "steals": 1.4, "blocks": 0.5, "turnovers": 3.6, "minutes": 36.2}},
    ]
    
    # Sample projections
    today = datetime.now().strftime("%Y-%m-%d")
    projections = [
        {"player_id": 1, "player_name": "LeBron James", "date": today, "confidence": 0.84,
         "projected_stats": {"points": 26.8, "rebounds": 8.1, "assists": 7.5, "steals": 1.1, "blocks": 0.7, "turnovers": 3.3, "minutes": 34.5}},
        {"player_id": 2, "player_name": "Stephen Curry", "date": today, "confidence": 0.89,
         "projected_stats": {"points": 30.2, "rebounds": 5.8, "assists": 6.1, "steals": 1.0, "blocks": 0.1, "turnovers": 2.8, "minutes": 33.9}},
        {"player_id": 3, "player_name": "Kevin Durant", "date": today, "confidence": 0.86,
         "projected_stats": {"points": 28.5, "rebounds": 7.0, "assists": 4.8, "steals": 0.8, "blocks": 1.2, "turnovers": 2.9, "minutes": 36.1}},
        {"player_id": 4, "player_name": "Giannis Antetokounmpo", "date": today, "confidence": 0.91,
         "projected_stats": {"points": 32.3, "rebounds": 12.2, "assists": 5.4, "steals": 0.9, "blocks": 1.0, "turnovers": 3.7, "minutes": 33.0}},
        {"player_id": 5, "player_name": "Luka Doncic", "date": today, "confidence": 0.88,
         "projected_stats": {"points": 33.1, "rebounds": 9.0, "assists": 8.3, "steals": 1.3, "blocks": 0.4, "turnovers": 3.8, "minutes": 35.8}},
    ]
    
    return players, player_stats, projections

players, player_stats, projections = load_sample_data()

# API endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the NBA Stat Projections API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "time": datetime.now().isoformat()}

@app.get("/api/v1/players", response_model=List[Player])
async def get_players():
    return players

@app.get("/api/v1/players/{player_id}", response_model=Player)
async def get_player(player_id: int):
    for player in players:
        if player["id"] == player_id:
            return player
    raise HTTPException(status_code=404, detail="Player not found")

@app.get("/api/v1/stats/players", response_model=List[PlayerStats])
async def get_player_stats():
    return player_stats

@app.get("/api/v1/stats/players/{player_id}", response_model=PlayerStats)
async def get_player_stat(player_id: int):
    for stat in player_stats:
        if stat["player_id"] == player_id:
            return stat
    raise HTTPException(status_code=404, detail="Stats not found")

@app.get("/api/v1/projections/players", response_model=List[Projection])
async def get_projections():
    return projections

@app.get("/api/v1/projections/players/{player_id}", response_model=Projection)
async def get_projection(player_id: int):
    for projection in projections:
        if projection["player_id"] == player_id:
            return projection
    raise HTTPException(status_code=404, detail="Projection not found")

@app.get("/api/v1/teams")
async def get_teams():
    teams = ["ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", 
             "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK", 
             "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]
    return [{"id": i+1, "name": team, "conference": "East" if i < 15 else "West"} for i, team in enumerate(teams)]

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 