"""
API endpoints for NBA players.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps

router = APIRouter()

@router.get("/")
async def get_players():
    """
    Get a list of NBA players.
    """
    return {"message": "List of players would be returned here"} 