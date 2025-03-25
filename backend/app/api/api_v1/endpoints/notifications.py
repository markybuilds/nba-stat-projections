from typing import Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    Notification,
    NotificationResponse,
    UnreadCountResponse
)
from app.models.user import User
from app.controllers import notification_controller

router = APIRouter()


@router.get("", response_model=NotificationResponse)
async def get_notifications(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type: Optional[str] = Query(None),
    read: Optional[bool] = Query(None),
) -> Any:
    """Get the current user's notifications with pagination and filtering"""
    notifications = await notification_controller.get_user_notifications(
        db=db,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        type=type,
        read=read,
    )
    
    return notifications


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get count of unread notifications"""
    count = await notification_controller.get_unread_count(
        db=db, user_id=current_user.id
    )
    
    return {"count": count}


@router.post("", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin),
    notification_in: NotificationCreate,
) -> Any:
    """Create a notification (admin only)"""
    notification = await notification_controller.create_notification(
        db=db, notification=notification_in
    )
    
    return notification


@router.patch("/{notification_id}/read", response_model=Notification)
async def mark_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark a notification as read"""
    notification = await notification_controller.mark_notification_as_read(
        db=db, notification_id=notification_id, user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification


@router.patch("/mark-all-read", response_model=dict)
async def mark_all_read(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark all notifications as read"""
    count = await notification_controller.mark_all_as_read(
        db=db, user_id=current_user.id
    )
    
    return {"success": True, "count": count}


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Delete a notification"""
    result = await notification_controller.delete_notification(
        db=db, notification_id=notification_id, user_id=current_user.id
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True}


@router.delete("", response_model=dict)
async def delete_all_notifications(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Delete all notifications"""
    count = await notification_controller.delete_all_notifications(
        db=db, user_id=current_user.id
    )
    
    return {"success": True, "count": count} 