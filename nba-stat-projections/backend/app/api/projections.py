"""
API endpoints for player projections
"""
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, Depends

from app.models.schemas import ProjectionResponse, Player, Game, Team, PlayerProjection
from app.projections.service import ProjectionService

router = APIRouter()


def get_projection_service():
    """Dependency injection for projection service"""
    return ProjectionService()


@router.get("/players", response_model=List[Player])
async def get_players(
    service: ProjectionService = Depends(get_projection_service)
):
    """
    Get all players with available projections
    
    Returns:
        List[Player]: List of players with available projections
    """
    try:
        return await service.get_players()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/games", response_model=List[Game])
async def get_games(
    date: Optional[date] = Query(None, description="Filter games by date (YYYY-MM-DD)"),
    service: ProjectionService = Depends(get_projection_service)
):
    """
    Get all games with available projections
    
    Args:
        date: Optional date filter
        
    Returns:
        List[Game]: List of games with available projections
    """
    try:
        return await service.get_games(date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_id}/projections", response_model=List[ProjectionResponse])
async def get_player_projections(
    player_id: str,
    game_id: Optional[str] = Query(None, description="Filter by specific game ID"),
    service: ProjectionService = Depends(get_projection_service)
):
    """
    Get projections for a specific player
    
    Args:
        player_id: NBA API player ID
        game_id: Optional game ID filter
        
    Returns:
        List[ProjectionResponse]: List of projections for the player
    """
    try:
        return await service.get_player_projections(player_id, game_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/games/{game_id}/projections", response_model=List[ProjectionResponse])
async def get_game_projections(
    game_id: str,
    team_id: Optional[str] = Query(None, description="Filter by team ID"),
    service: ProjectionService = Depends(get_projection_service)
):
    """
    Get projections for all players in a specific game
    
    Args:
        game_id: NBA API game ID
        team_id: Optional team ID filter
        
    Returns:
        List[ProjectionResponse]: List of player projections for the game
    """
    try:
        return await service.get_game_projections(game_id, team_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today", response_model=List[ProjectionResponse])
async def get_today_projections(
    player_id: Optional[str] = Query(None, description="Filter by player ID"),
    team_id: Optional[str] = Query(None, description="Filter by team ID"),
    service: ProjectionService = Depends(get_projection_service)
):
    """
    Get projections for today's games
    
    Args:
        player_id: Optional player ID filter
        team_id: Optional team ID filter
        
    Returns:
        List[ProjectionResponse]: List of projections for today's games
    """
    try:
        return await service.get_today_projections(player_id, team_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 