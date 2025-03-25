"""
Alerts service for NBA Stat Projections.

This service provides functionality to send alerts for critical system events,
including:
- Scheduled job failures
- Data update failures
- Stale data detection
- High error rates
- API performance issues
"""

import logging
import json
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union

from app.core.config import settings

logger = logging.getLogger("alerts")

# Alert levels
ALERT_LEVELS = {
    "DEBUG": 0,
    "INFO": 1,
    "WARNING": 2,
    "ERROR": 3,
    "CRITICAL": 4
}

class AlertsService:
    """
    Service for sending alerts based on system events and metrics.
    """
    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(AlertsService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.enabled = settings.ENABLE_ALERTS
            self.alert_level = settings.ALERT_LEVEL
            self.alert_level_threshold = ALERT_LEVELS.get(self.alert_level, 3)  # Default to ERROR
            self._initialized = True
            logger.info(f"Alerts service initialized with level: {self.alert_level}")
    
    def should_alert(self, level: str) -> bool:
        """
        Determine if an alert should be sent based on the configured level threshold.
        
        Args:
            level: The level of the alert (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            
        Returns:
            True if the alert should be sent, False otherwise
        """
        if not self.enabled:
            return False
            
        level_value = ALERT_LEVELS.get(level.upper(), 1)
        return level_value >= self.alert_level_threshold
    
    async def send_alert(self, 
                    title: str, 
                    message: str, 
                    level: str = "ERROR",
                    data: Optional[Dict[str, Any]] = None) -> bool:
        """
        Send an alert using configured notification channels.
        
        Args:
            title: Alert title
            message: Alert message
            level: Alert level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            data: Additional data to include in the alert
            
        Returns:
            True if the alert was sent successfully, False otherwise
        """
        if not self.should_alert(level):
            logger.debug(f"Alert not sent due to level threshold: {title} ({level})")
            return False
        
        success = False
        level = level.upper()
        
        logger.info(f"Sending {level} alert: {title}")
        
        # Prepare the alert content
        timestamp = datetime.now().isoformat()
        alert_data = {
            "title": title,
            "message": message,
            "level": level,
            "timestamp": timestamp,
            "data": data or {}
        }
        
        # Send email alert if configured
        if settings.ALERT_EMAIL and settings.SMTP_SERVER:
            try:
                email_success = self._send_email_alert(
                    title=f"[{level}] {title}",
                    body=self._format_email_body(alert_data),
                    recipient=settings.ALERT_EMAIL
                )
                success = success or email_success
            except Exception as e:
                logger.error(f"Failed to send email alert: {str(e)}")
        
        # Send Slack alert if configured
        if settings.SLACK_WEBHOOK_URL:
            try:
                slack_success = self._send_slack_alert(
                    title=title,
                    message=message,
                    level=level,
                    data=data
                )
                success = success or slack_success
            except Exception as e:
                logger.error(f"Failed to send Slack alert: {str(e)}")
        
        return success
    
    def _send_email_alert(self, title: str, body: str, recipient: str) -> bool:
        """
        Send an email alert.
        
        Args:
            title: Email subject
            body: Email body (HTML)
            recipient: Email recipient
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not settings.SMTP_SERVER or not settings.SMTP_FROM_EMAIL:
            logger.warning("Email alerts not configured")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['Subject'] = title
            msg['From'] = settings.SMTP_FROM_EMAIL
            msg['To'] = recipient
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email alert sent to {recipient}: {title}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email alert: {str(e)}")
            return False
    
    def _send_slack_alert(self, title: str, message: str, level: str, data: Optional[Dict[str, Any]] = None) -> bool:
        """
        Send a Slack alert using a webhook.
        
        Args:
            title: Alert title
            message: Alert message
            level: Alert level
            data: Additional data
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not settings.SLACK_WEBHOOK_URL:
            logger.warning("Slack alerts not configured")
            return False
        
        # Set color based on level
        color = {
            "DEBUG": "#6C757D",
            "INFO": "#0D6EFD",
            "WARNING": "#FFC107",
            "ERROR": "#DC3545",
            "CRITICAL": "#7F00FF"
        }.get(level.upper(), "#0D6EFD")
        
        # Create the attachment with alert data
        attachments = [{
            "color": color,
            "title": title,
            "text": message,
            "fields": [],
            "footer": f"NBA Stat Projections | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }]
        
        # Add data fields if provided
        if data:
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value, indent=2)
                attachments[0]["fields"].append({
                    "title": key,
                    "value": str(value),
                    "short": False
                })
        
        # Prepare the payload
        payload = {
            "text": f"*{level}*: {title}",
            "attachments": attachments
        }
        
        try:
            response = requests.post(
                settings.SLACK_WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200 and response.text == "ok":
                logger.info(f"Slack alert sent: {title}")
                return True
            else:
                logger.error(f"Failed to send Slack alert: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {str(e)}")
            return False
    
    def _format_email_body(self, alert_data: Dict[str, Any]) -> str:
        """
        Format the email body as HTML.
        
        Args:
            alert_data: Alert data
            
        Returns:
            HTML formatted email body
        """
        level = alert_data.get("level", "ERROR")
        level_color = {
            "DEBUG": "#6C757D",
            "INFO": "#0D6EFD",
            "WARNING": "#FFC107",
            "ERROR": "#DC3545",
            "CRITICAL": "#7F00FF"
        }.get(level, "#0D6EFD")
        
        # Create the HTML email body
        html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }}
                    .container {{ padding: 20px; }}
                    .header {{ padding: 10px; background-color: {level_color}; color: white; }}
                    .content {{ padding: 20px; }}
                    .footer {{ padding: 10px; background-color: #f5f5f5; font-size: 12px; }}
                    table {{ border-collapse: collapse; width: 100%; }}
                    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                    th {{ background-color: #f5f5f5; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>{alert_data.get('title')}</h2>
                        <p>Level: {level}</p>
                        <p>Time: {alert_data.get('timestamp')}</p>
                    </div>
                    <div class="content">
                        <p>{alert_data.get('message', '')}</p>
        """
        
        # Add additional data if available
        data = alert_data.get("data", {})
        if data:
            html += "<h3>Additional Data</h3><table><tr><th>Key</th><th>Value</th></tr>"
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    value = json.dumps(value, indent=2)
                html += f"<tr><td>{key}</td><td><pre>{value}</pre></td></tr>"
            html += "</table>"
        
        # Close the HTML
        html += """
                    </div>
                    <div class="footer">
                        <p>This is an automated alert from the NBA Stat Projections system.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return html
    
    async def check_scheduler_health(self) -> None:
        """
        Check the health of scheduled jobs and send alerts for issues.
        """
        from app.services.scheduler_service import scheduler_service
        
        # Get job information
        jobs = scheduler_service.get_job_info()
        
        for job in jobs:
            job_id = job.get("id")
            next_run_time = job.get("next_run_time")
            
            # Skip jobs with no scheduled run time
            if not next_run_time:
                continue
            
            # Check if the job's next run is overdue
            if job_id == "daily_update":
                # Convert next_run_time from ISO format to datetime
                next_run = datetime.fromisoformat(next_run_time)
                now = datetime.now()
                
                # Calculate hours since the expected run time
                if next_run < now:
                    hours_overdue = (now - next_run).total_seconds() / 3600
                    
                    # Alert if the job is significantly overdue
                    if hours_overdue > 2:  # 2 hours overdue threshold
                        await self.send_alert(
                            title="Scheduled Job Overdue",
                            message=f"The {job_id} job is {hours_overdue:.1f} hours overdue",
                            level="WARNING",
                            data={
                                "job_id": job_id,
                                "next_run_time": next_run_time,
                                "hours_overdue": f"{hours_overdue:.1f}",
                                "current_time": now.isoformat()
                            }
                        )
    
    async def check_data_freshness(self) -> None:
        """
        Check the freshness of data and send alerts for stale data.
        """
        from app.services.metrics_service import metrics_service
        
        # Check data update timestamps from metrics
        for data_type in ["games", "players", "projections"]:
            # Get the timestamp from the metric (if available)
            metric = metrics_service.data_update_last_run._metrics.get(data_type)
            
            if metric:
                last_update = datetime.fromtimestamp(metric.value)
                now = datetime.now()
                hours_since_update = (now - last_update).total_seconds() / 3600
                
                # Alert if data is older than the threshold
                if hours_since_update > settings.DAILY_UPDATE_MAX_AGE:
                    await self.send_alert(
                        title="Stale Data Detected",
                        message=f"The {data_type} data has not been updated in {hours_since_update:.1f} hours",
                        level="WARNING",
                        data={
                            "data_type": data_type,
                            "last_update": last_update.isoformat(),
                            "hours_since_update": f"{hours_since_update:.1f}",
                            "threshold_hours": settings.DAILY_UPDATE_MAX_AGE
                        }
                    )


# Create the singleton instance
alerts_service = AlertsService() 