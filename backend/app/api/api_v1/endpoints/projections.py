"""
API endpoints for NBA stat projections.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps

router = APIRouter()

@router.get("/")
async def get_projections():
    """
    Get a list of NBA stat projections.
    """
    return {"message": "List of projections would be returned here"} 