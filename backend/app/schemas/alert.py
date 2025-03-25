"""
Alert schemas for NBA Stat Projections.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AlertBase(BaseModel):
    """Base alert schema."""
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    level: str = Field(default="INFO", description="Alert level: INFO, WARNING, ERROR")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Additional data related to the alert")


class AlertCreate(AlertBase):
    """Schema for creating an alert."""
    pass


class AlertRead(AlertBase):
    """Schema for reading an alert."""
    id: int = Field(..., description="Alert ID")
    created_at: datetime = Field(..., description="Alert creation time")
    sent: bool = Field(default=False, description="Whether the alert was sent")

    class Config:
        orm_mode = True


class AlertUpdate(BaseModel):
    """Schema for updating an alert."""
    title: Optional[str] = Field(default=None, description="Alert title")
    message: Optional[str] = Field(default=None, description="Alert message")
    level: Optional[str] = Field(default=None, description="Alert level: INFO, WARNING, ERROR")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Additional data related to the alert")


class AlertCheck(BaseModel):
    """Schema for running alert checks."""
    scheduler_health: bool = Field(default=True, description="Check scheduler health")
    data_freshness: bool = Field(default=True, description="Check data freshness") 