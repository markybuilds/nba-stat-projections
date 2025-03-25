"""
Notification Digest Service for NBA Stat Projections.

This service provides functionality to send digest emails containing notifications
that users have accumulated over a period of time (daily or weekly).
"""

import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.notification_email_service import notification_email_service
from app.db.session import get_async_session
from app.core.config import settings

logger = logging.getLogger("notification_digest")

class NotificationDigestService:
    """
    Service for sending digest emails of notifications.
    """
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(NotificationDigestService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.enabled = settings.SMTP_SERVER is not None and settings.SMTP_FROM_EMAIL is not None
            self._initialized = True
            logger.info(f"Notification Digest service initialized. Enabled: {self.enabled}")
    
    async def send_daily_digests(self) -> Tuple[int, int]:
        """
        Send daily digest emails to users who have enabled them.
        
        Returns:
            Tuple containing (number of digests sent, total number of notifications included)
        """
        if not self.enabled:
            logger.warning("Notification Digest service is not configured")
            return (0, 0)
        
        try:
            # Get list of users who should receive daily digests
            async with get_async_session() as db:
                users = await self._get_users_for_digest(db, "daily")
            
            logger.info(f"Found {len(users)} users to send daily notification digests")
            
            sent_count = 0
            total_notifications = 0
            
            # Process each user
            for user_id, email in users:
                try:
                    async with get_async_session() as db:
                        notifications = await self._get_pending_notifications(db, user_id)
                    
                    if not notifications:
                        logger.debug(f"No notifications to digest for user {user_id}")
                        continue
                    
                    # Send digest email
                    success = await self._send_digest_email(
                        email=email,
                        notifications=notifications,
                        digest_type="daily"
                    )
                    
                    if success:
                        sent_count += 1
                        total_notifications += len(notifications)
                        
                        # Mark notifications as read
                        async with get_async_session() as db:
                            await self._mark_notifications_as_read(db, user_id, [n["id"] for n in notifications])
                    
                except Exception as e:
                    logger.error(f"Error processing digest for user {user_id}: {str(e)}")
            
            logger.info(f"Sent {sent_count} daily digests with {total_notifications} total notifications")
            return (sent_count, total_notifications)
            
        except Exception as e:
            logger.error(f"Error sending daily notification digests: {str(e)}")
            return (0, 0)
    
    async def send_weekly_digests(self) -> Tuple[int, int]:
        """
        Send weekly digest emails to users who have enabled them.
        
        Returns:
            Tuple containing (number of digests sent, total number of notifications included)
        """
        if not self.enabled:
            logger.warning("Notification Digest service is not configured")
            return (0, 0)
        
        try:
            # Get list of users who should receive weekly digests
            async with get_async_session() as db:
                users = await self._get_users_for_digest(db, "weekly")
            
            logger.info(f"Found {len(users)} users to send weekly notification digests")
            
            sent_count = 0
            total_notifications = 0
            
            # Process each user
            for user_id, email in users:
                try:
                    async with get_async_session() as db:
                        # For weekly digests, get notifications from the past 7 days
                        notifications = await self._get_pending_notifications(
                            db, 
                            user_id, 
                            days=7
                        )
                    
                    if not notifications:
                        logger.debug(f"No notifications to digest for user {user_id}")
                        continue
                    
                    # Send digest email
                    success = await self._send_digest_email(
                        email=email,
                        notifications=notifications,
                        digest_type="weekly"
                    )
                    
                    if success:
                        sent_count += 1
                        total_notifications += len(notifications)
                        
                        # Mark notifications as read
                        async with get_async_session() as db:
                            await self._mark_notifications_as_read(db, user_id, [n["id"] for n in notifications])
                    
                except Exception as e:
                    logger.error(f"Error processing digest for user {user_id}: {str(e)}")
            
            logger.info(f"Sent {sent_count} weekly digests with {total_notifications} total notifications")
            return (sent_count, total_notifications)
            
        except Exception as e:
            logger.error(f"Error sending weekly notification digests: {str(e)}")
            return (0, 0)
    
    async def _get_users_for_digest(self, db: AsyncSession, schedule_type: str) -> List[Tuple[str, str]]:
        """
        Get users who have enabled digest emails with the specified schedule.
        
        Args:
            db: Database session
            schedule_type: Type of schedule ("daily" or "weekly")
            
        Returns:
            List of tuples containing (user_id, email)
        """
        query = text("SELECT * FROM public.get_users_for_notification_digest(:schedule)")
        result = await db.execute(query, {"schedule": schedule_type})
        return result.fetchall()
    
    async def _get_pending_notifications(self, db: AsyncSession, user_id: str, days: int = 1) -> List[Dict[str, Any]]:
        """
        Get pending notifications for a user to include in a digest.
        
        Args:
            db: Database session
            user_id: ID of the user
            days: Number of days of notifications to include
            
        Returns:
            List of notification objects
        """
        if days == 1:
            # Use the database function for daily digests
            query = text("SELECT * FROM public.get_pending_digest_notifications(:user_id)")
            result = await db.execute(query, {"user_id": user_id})
        else:
            # Custom query for longer periods
            query = text("""
                SELECT 
                    id, title, message, type, data, url, created_at
                FROM public.notifications
                WHERE user_id = :user_id
                    AND read = false
                    AND created_at > :cutoff_date
                ORDER BY created_at DESC
            """)
            cutoff_date = datetime.now() - timedelta(days=days)
            result = await db.execute(query, {"user_id": user_id, "cutoff_date": cutoff_date})
        
        # Convert to list of dictionaries
        notifications = []
        for row in result.fetchall():
            notifications.append({
                "id": row[0],
                "title": row[1],
                "message": row[2],
                "type": row[3],
                "data": row[4],
                "url": row[5],
                "created_at": row[6]
            })
        
        return notifications
    
    async def _mark_notifications_as_read(self, db: AsyncSession, user_id: str, notification_ids: List[str]) -> None:
        """
        Mark notifications as read after sending in digest.
        
        Args:
            db: Database session
            user_id: ID of the user
            notification_ids: List of notification IDs to mark as read
        """
        if not notification_ids:
            return
            
        query = text("""
            UPDATE public.notifications
            SET read = true
            WHERE user_id = :user_id
                AND id = ANY(:notification_ids)
        """)
        
        await db.execute(query, {"user_id": user_id, "notification_ids": notification_ids})
        await db.commit()
    
    async def _send_digest_email(self, email: str, notifications: List[Dict[str, Any]], digest_type: str) -> bool:
        """
        Send a digest email with multiple notifications.
        
        Args:
            email: Recipient email
            notifications: List of notification objects
            digest_type: Type of digest ("daily" or "weekly")
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not notifications:
            return False
            
        try:
            # Format the subject
            subject = f"NBA Stat Projections: Your {digest_type.capitalize()} Notification Digest"
            
            # Format the email body
            body = self._format_digest_email_body(notifications, digest_type)
            
            # Send the email
            return notification_email_service._send_email(
                subject=subject,
                body=body,
                recipient=email
            )
        except Exception as e:
            logger.error(f"Failed to send digest email: {str(e)}")
            return False
    
    def _format_digest_email_body(self, notifications: List[Dict[str, Any]], digest_type: str) -> str:
        """
        Format the digest email body as HTML.
        
        Args:
            notifications: List of notification objects
            digest_type: Type of digest ("daily" or "weekly")
            
        Returns:
            HTML formatted email body
        """
        # Group notifications by type
        notifications_by_type = {}
        for notification in notifications:
            notification_type = notification["type"]
            if notification_type not in notifications_by_type:
                notifications_by_type[notification_type] = []
            notifications_by_type[notification_type].append(notification)
        
        # Format timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Generate HTML
        html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ padding: 15px; background-color: #0D6EFD; color: white; border-radius: 5px 5px 0 0; }}
                    .content {{ padding: 20px; background-color: #f8f9fa; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }}
                    .notification {{ margin-bottom: 20px; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }}
                    .notification-system {{ border-left: 5px solid #6C757D; }}
                    .notification-alert {{ border-left: 5px solid #DC3545; }}
                    .notification-info {{ border-left: 5px solid #0D6EFD; }}
                    .notification-update {{ border-left: 5px solid #28A745; }}
                    .notification-title {{ margin-top: 0; color: #333; }}
                    .notification-message {{ margin-bottom: 10px; }}
                    .notification-meta {{ font-size: 12px; color: #666; }}
                    .footer {{ padding: 15px; background-color: #f1f1f1; border-radius: 0 0 5px 5px; font-size: 12px; color: #666; border: 1px solid #ddd; }}
                    .button {{ display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #0D6EFD; color: white; text-decoration: none; border-radius: 5px; }}
                    .view-all {{ text-align: center; margin: 20px 0; }}
                    .section-header {{ margin-top: 30px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Your {digest_type.capitalize()} Notification Digest</h2>
                        <p>Here's a summary of your recent notifications</p>
                    </div>
                    <div class="content">
        """
        
        # Add notifications grouped by type
        for notification_type, notifications_of_type in notifications_by_type.items():
            type_display_name = notification_type.capitalize()
            html += f"""
                        <h3 class="section-header">{type_display_name} Notifications ({len(notifications_of_type)})</h3>
            """
            
            for notification in notifications_of_type:
                created_at = notification["created_at"].strftime("%Y-%m-%d %H:%M")
                html += f"""
                        <div class="notification notification-{notification_type}">
                            <h4 class="notification-title">{notification["title"]}</h4>
                            <div class="notification-message">{notification["message"]}</div>
                """
                
                # Add URL button if available
                if notification["url"]:
                    html += f"""
                            <div>
                                <a href="{notification["url"]}" class="button">View Details</a>
                            </div>
                    """
                
                html += f"""
                            <div class="notification-meta">
                                <p>Sent: {created_at}</p>
                            </div>
                        </div>
                """
        
        # Add view all button and close HTML
        html += f"""
                        <div class="view-all">
                            <a href="{settings.FRONTEND_URL}/notifications" class="button">View All Notifications</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated digest from the NBA Stat Projections system.</p>
                        <p>You're receiving this because you've enabled {digest_type} notification digests in your preferences.</p>
                        <p>To manage your notification settings, please visit your account preferences page.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return html


# Create the singleton instance
notification_digest_service = NotificationDigestService() 