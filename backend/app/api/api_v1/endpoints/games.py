"""
API endpoints for NBA games.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps

router = APIRouter()

@router.get("/")
async def get_games():
    """
    Get a list of NBA games.
    """
    return {"message": "List of games would be returned here"} 