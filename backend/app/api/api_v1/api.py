"""
API V1 router for NBA Stat Projections.
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    games,
    players,
    projections,
    alerts
)

api_router = APIRouter()

# Include all API endpoint routers
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(players.router, prefix="/players", tags=["players"])
api_router.include_router(projections.router, prefix="/projections", tags=["projections"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"]) 