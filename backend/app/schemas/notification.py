from typing import Optional, Any, Dict, List
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class NotificationType:
    SYSTEM = "system"
    ALERT = "alert"
    INFO = "info"
    UPDATE = "update"


class NotificationCreate(BaseModel):
    """Schema for creating a new notification"""
    user_id: UUID
    title: str
    message: str
    type: str = Field(default=NotificationType.SYSTEM)
    data: Optional[Dict[str, Any]] = None
    url: Optional[str] = None


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    read: Optional[bool] = None
    

class Notification(BaseModel):
    """Schema for a notification"""
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    read: bool
    data: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    """Response schema for notifications"""
    data: List[Notification]
    count: int
    total: int
    has_more: bool


class UnreadCountResponse(BaseModel):
    """Response schema for unread notification count"""
    count: int 