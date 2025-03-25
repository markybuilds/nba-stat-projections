"""
API router for NBA Stat Projections.
"""

from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/")
async def root():
    """
    Root API endpoint.
    """
    return {"message": "Welcome to NBA Stat Projections API"}

# Include other routers here
# api_router.include_router(projections.router, prefix="/projections", tags=["projections"])
# api_router.include_router(games.router, prefix="/games", tags=["games"])
# api_router.include_router(players.router, prefix="/players", tags=["players"]) 