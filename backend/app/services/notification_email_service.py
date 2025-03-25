"""
Notification Email Service for NBA Stat Projections.

This service provides functionality to send notification emails to users based on their preferences.
"""

import logging
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, List, Any, Optional

from app.core.config import settings
from app.schemas.notification import Notification

logger = logging.getLogger("notification_email")

class NotificationEmailService:
    """
    Service for sending notification emails to users.
    """
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(NotificationEmailService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.enabled = settings.SMTP_SERVER is not None and settings.SMTP_FROM_EMAIL is not None
            self._initialized = True
            logger.info(f"Notification Email service initialized. Enabled: {self.enabled}")
    
    async def send_notification_email(self, 
                               email: str, 
                               notification: Notification) -> bool:
        """
        Send a notification email to a user.
        
        Args:
            email: User's email address
            notification: Notification object to send
            
        Returns:
            True if the email was sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning("Notification Email service is not configured")
            return False
        
        try:
            # Format the email
            subject = f"NBA Stat Projections: {notification.title}"
            body = self._format_email_body(notification)
            
            # Send the email
            return self._send_email(
                subject=subject,
                body=body,
                recipient=email
            )
        except Exception as e:
            logger.error(f"Failed to send notification email: {str(e)}")
            return False
    
    def _send_email(self, subject: str, body: str, recipient: str) -> bool:
        """
        Send an email.
        
        Args:
            subject: Email subject
            body: Email body (HTML)
            recipient: Email recipient
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not settings.SMTP_SERVER or not settings.SMTP_FROM_EMAIL:
            logger.warning("Email notifications not configured")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['Subject'] = subject
            msg['From'] = settings.SMTP_FROM_EMAIL
            msg['To'] = recipient
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Notification email sent to {recipient}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send notification email: {str(e)}")
            return False
    
    def _format_email_body(self, notification: Notification) -> str:
        """
        Format the email body as HTML.
        
        Args:
            notification: Notification object
            
        Returns:
            HTML formatted email body
        """
        # Set color based on notification type
        type_color = {
            "system": "#6C757D",  # Gray
            "alert": "#DC3545",   # Red
            "info": "#0D6EFD",    # Blue
            "update": "#28A745"   # Green
        }.get(notification.type, "#0D6EFD")
        
        # Format timestamp
        timestamp = notification.created_at.strftime("%Y-%m-%d %H:%M:%S")
        
        # Create the HTML email body
        html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ padding: 15px; background-color: {type_color}; color: white; border-radius: 5px 5px 0 0; }}
                    .content {{ padding: 20px; background-color: #f8f9fa; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }}
                    .message {{ line-height: 1.6; }}
                    .footer {{ padding: 15px; background-color: #f1f1f1; border-radius: 0 0 5px 5px; font-size: 12px; color: #666; border: 1px solid #ddd; }}
                    .button {{ display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: {type_color}; color: white; text-decoration: none; border-radius: 5px; }}
                    .metadata {{ font-size: 12px; color: #666; margin-top: 15px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>{notification.title}</h2>
                    </div>
                    <div class="content">
                        <div class="message">
                            <p>{notification.message}</p>
                        </div>
        """
        
        # Add URL button if available
        if notification.url:
            html += f"""
                        <div>
                            <a href="{notification.url}" class="button">View Details</a>
                        </div>
            """
        
        # Add additional data if available
        if notification.data:
            html += """<div class="metadata"><h4>Additional Information</h4>"""
            for key, value in notification.data.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)
                html += f"<p><strong>{key}:</strong> {value}</p>"
            html += "</div>"
        
        # Add metadata and close HTML
        html += f"""
                        <div class="metadata">
                            <p>Type: {notification.type}</p>
                            <p>Sent: {timestamp}</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the NBA Stat Projections system.</p>
                        <p>You're receiving this because you've enabled email notifications in your preferences.</p>
                        <p>To manage your notification settings, please visit your account preferences page.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return html


# Create the singleton instance
notification_email_service = NotificationEmailService() 