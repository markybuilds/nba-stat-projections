from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    """Base model for user data"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True
    roles: Optional[List[str]] = ["user"]


class UserCreate(UserBase):
    """Model for creating a new user"""
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    """Model for updating user data"""
    password: Optional[str] = None
    email_notifications: Optional[bool] = None
    game_alerts: Optional[bool] = None
    projection_updates: Optional[bool] = None
    favorite_team_updates: Optional[bool] = None
    # New email notification settings
    email_notification_types: Optional[Dict[str, bool]] = Field(
        default=None,
        description="Types of notifications to send via email: system, alert, info, update"
    )
    email_notification_digest: Optional[bool] = Field(
        default=None,
        description="Whether to send notifications as a daily digest instead of immediately"
    )
    email_notification_schedule: Optional[str] = Field(
        default=None,
        description="When to send notification digests: 'daily', 'weekly', or time of day e.g., '08:00'"
    )


class UserInDBBase(UserBase):
    """Base model for user in database"""
    id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    email_notifications: bool = True
    game_alerts: bool = True
    projection_updates: bool = True
    favorite_team_updates: bool = True
    # New email notification settings with defaults
    email_notification_types: Dict[str, bool] = Field(
        default_factory=lambda: {
            "system": True,
            "alert": True,
            "info": True,
            "update": True
        },
        description="Types of notifications to send via email"
    )
    email_notification_digest: bool = Field(
        default=False,
        description="Whether to send notifications as a daily digest instead of immediately"
    )
    email_notification_schedule: str = Field(
        default="daily",
        description="When to send notification digests: 'daily', 'weekly', or time of day"
    )

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Full user model with sensitive data omitted"""
    pass


class UserInDB(UserInDBBase):
    """User model stored in database (with hashed password)"""
    hashed_password: Optional[str] = None 