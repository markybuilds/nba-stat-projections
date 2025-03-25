from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import models
from ..schemas import schemas

# This is a template router for the knowledge transfer exercises
# You can use this as a starting point for your API endpoint development

router = APIRouter(
    prefix="/exercise",
    tags=["exercise"],
    responses={404: {"description": "Not found"}},
)

# Example endpoint to get a list of items
@router.get("/items", response_model=List[schemas.ExerciseItem])
async def get_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get a list of exercise items.
    
    This is a template endpoint that you can modify during the exercises.
    """
    # This is a placeholder implementation
    # Replace with actual database query during the exercises
    items = []
    
    return items

# Example endpoint to get a single item by ID
@router.get("/items/{item_id}", response_model=schemas.ExerciseItem)
async def get_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a single exercise item by ID.
    
    This is a template endpoint that you can modify during the exercises.
    """
    # This is a placeholder implementation
    # Replace with actual database query during the exercises
    item = None
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

# Example endpoint to create a new item
@router.post("/items", response_model=schemas.ExerciseItem, status_code=201)
async def create_item(
    item: schemas.ExerciseItemCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new exercise item.
    
    This is a template endpoint that you can modify during the exercises.
    """
    # This is a placeholder implementation
    # Replace with actual database operation during the exercises
    new_item = None
    
    return new_item

# Example endpoint to update an item
@router.put("/items/{item_id}", response_model=schemas.ExerciseItem)
async def update_item(
    item_id: str,
    item: schemas.ExerciseItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing exercise item.
    
    This is a template endpoint that you can modify during the exercises.
    """
    # This is a placeholder implementation
    # Replace with actual database operation during the exercises
    existing_item = None
    
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update the item
    updated_item = None
    
    return updated_item

# Example endpoint to delete an item
@router.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete an exercise item.
    
    This is a template endpoint that you can modify during the exercises.
    """
    # This is a placeholder implementation
    # Replace with actual database operation during the exercises
    existing_item = None
    
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Delete the item
    
    return None

# Add the schemas to the schemas.py file:
"""
class ExerciseItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    value: float

class ExerciseItemCreate(ExerciseItemBase):
    pass

class ExerciseItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[float] = None

class ExerciseItem(ExerciseItemBase):
    id: str
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True
""" 