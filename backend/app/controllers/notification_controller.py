from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import sqlalchemy as sa
from sqlalchemy.sql import select, func
import logging

from app.schemas.notification import NotificationCreate, NotificationUpdate, Notification
from app.models.notification import Notification as NotificationModel
from app.models.user import User
from app.services.notification_email_service import notification_email_service

logger = logging.getLogger(__name__)

async def create_notification(
    db: AsyncSession, notification: NotificationCreate
) -> Notification:
    """Create a new notification"""
    db_notification = NotificationModel(
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        data=notification.data,
        url=notification.url
    )
    
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    
    # Check if the user has email notifications enabled
    try:
        # Get the user
        user_query = select(User).where(User.id == notification.user_id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        # If user exists and has email notifications enabled, send an email
        if user and user.email_notifications:
            # Check if digest mode is enabled
            if user.email_notification_digest:
                # If digest is enabled, don't send immediate email
                # It will be included in the next digest
                logger.debug(f"Notification for user {user.id} will be included in the next digest")
            else:
                # Check notification type preferences
                should_send_email = True
                
                # Check general type-specific preferences
                if notification.type == "update" and not user.projection_updates:
                    should_send_email = False
                elif notification.type == "alert" and not user.game_alerts:
                    should_send_email = False
                
                # Check email notification type preferences if available
                if should_send_email and user.email_notification_types:
                    # Get the notification type preferences as dict
                    email_types = user.email_notification_types
                    notification_type = notification.type
                    
                    # Check if this type is enabled for emails
                    if notification_type in email_types and not email_types.get(notification_type):
                        should_send_email = False
                        logger.debug(f"Email not sent - user has disabled email notifications for {notification_type} type")
                
                if should_send_email:
                    notification_obj = Notification.model_validate(db_notification)
                    await notification_email_service.send_notification_email(
                        email=user.email,
                        notification=notification_obj
                    )
                    logger.info(f"Email notification sent to {user.email} for notification {db_notification.id}")
    except Exception as e:
        # Log the error but don't fail the notification creation
        logger.error(f"Failed to send notification email: {str(e)}")
    
    return Notification.model_validate(db_notification)


async def get_user_notifications(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 10,
    offset: int = 0,
    type: Optional[str] = None,
    read: Optional[bool] = None,
) -> Dict[str, Any]:
    """Get a user's notifications with pagination and filtering"""
    
    # Base query for notifications
    query = select(NotificationModel).where(NotificationModel.user_id == user_id)
    count_query = select(func.count()).select_from(NotificationModel).where(NotificationModel.user_id == user_id)
    
    # Apply filters if provided
    if type is not None:
        query = query.where(NotificationModel.type == type)
        count_query = count_query.where(NotificationModel.type == type)
        
    if read is not None:
        query = query.where(NotificationModel.read == read)
        count_query = count_query.where(NotificationModel.read == read)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.order_by(sa.desc(NotificationModel.created_at))
    query = query.limit(limit).offset(offset)
    
    # Execute query
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return {
        "data": [Notification.model_validate(notification) for notification in notifications],
        "count": len(notifications),
        "total": total,
        "has_more": offset + len(notifications) < total
    }


async def get_unread_count(db: AsyncSession, user_id: UUID) -> int:
    """Get count of unread notifications for a user"""
    query = select(func.count()).select_from(NotificationModel).where(
        NotificationModel.user_id == user_id,
        NotificationModel.read == False
    )
    
    result = await db.execute(query)
    count = result.scalar()
    
    return count


async def mark_notification_as_read(
    db: AsyncSession, notification_id: UUID, user_id: UUID
) -> Optional[Notification]:
    """Mark a notification as read"""
    query = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == user_id
    )
    
    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    
    if not notification:
        return None
    
    notification.read = True
    await db.commit()
    await db.refresh(notification)
    
    return Notification.model_validate(notification)


async def mark_all_as_read(db: AsyncSession, user_id: UUID) -> int:
    """Mark all notifications as read for a user"""
    query = (
        sa.update(NotificationModel)
        .where(
            NotificationModel.user_id == user_id,
            NotificationModel.read == False
        )
        .values(read=True)
        .returning(NotificationModel.id)
    )
    
    result = await db.execute(query)
    rows = result.fetchall()
    await db.commit()
    
    return len(rows)


async def delete_notification(
    db: AsyncSession, notification_id: UUID, user_id: UUID
) -> bool:
    """Delete a notification"""
    query = (
        sa.delete(NotificationModel)
        .where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == user_id
        )
        .returning(NotificationModel.id)
    )
    
    result = await db.execute(query)
    deleted = result.first()
    await db.commit()
    
    return deleted is not None


async def delete_all_notifications(db: AsyncSession, user_id: UUID) -> int:
    """Delete all notifications for a user"""
    query = (
        sa.delete(NotificationModel)
        .where(NotificationModel.user_id == user_id)
        .returning(NotificationModel.id)
    )
    
    result = await db.execute(query)
    rows = result.fetchall()
    await db.commit()
    
    return len(rows) 