"""
API endpoints for viewing and managing alerts.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.services.alerts_service import alerts_service
from app.schemas.alert import AlertRead, AlertCreate, AlertUpdate, AlertCheck

router = APIRouter()
logger = logging.getLogger("api.alerts")


@router.get("/", response_model=List[AlertRead])
async def get_alerts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    level: Optional[str] = None,
    service: Optional[str] = None,
    since: Optional[datetime] = None,
):
    """
    Get a list of alerts.
    
    Args:
        db: Database session
        skip: Number of alerts to skip
        limit: Maximum number of alerts to return
        level: Filter by alert level (ERROR, WARNING, INFO)
        service: Filter by service
        since: Filter by alerts since this time
    """
    if not settings.ENABLE_ALERTS:
        return []
    
    # This would typically query a database table for alerts
    # For now, we'll just return an empty list as a placeholder
    # In a real implementation, we would store alerts in the database
    return []


@router.post("/", response_model=AlertRead)
async def create_alert(
    alert: AlertCreate,
    db: Session = Depends(deps.get_db),
):
    """
    Manually create an alert.
    
    Args:
        alert: Alert data
        db: Database session
    """
    if not settings.ENABLE_ALERTS:
        raise HTTPException(status_code=400, detail="Alerts are disabled")
    
    try:
        # Send the alert through the alerts service
        await alerts_service.send_alert(
            title=alert.title,
            message=alert.message,
            level=alert.level,
            data=alert.data
        )
        
        # In a real implementation, we'd return the created alert from the database
        # For now, we'll just return a mock response
        return {
            "id": 0,
            "title": alert.title,
            "message": alert.message,
            "level": alert.level,
            "data": alert.data,
            "created_at": datetime.now(),
            "sent": True
        }
    
    except Exception as e:
        logger.error(f"Failed to create alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")


@router.post("/check", response_model=Dict[str, bool])
async def run_alert_checks(
    checks: AlertCheck = AlertCheck(),
):
    """
    Run specific alert checks.
    
    Args:
        checks: Alert checks to run
    """
    if not settings.ENABLE_ALERTS:
        raise HTTPException(status_code=400, detail="Alerts are disabled")
    
    results = {}
    
    if checks.scheduler_health:
        try:
            await alerts_service.check_scheduler_health()
            results["scheduler_health"] = True
        except Exception as e:
            logger.error(f"Scheduler health check failed: {e}")
            results["scheduler_health"] = False
    
    if checks.data_freshness:
        try:
            await alerts_service.check_data_freshness()
            results["data_freshness"] = True
        except Exception as e:
            logger.error(f"Data freshness check failed: {e}")
            results["data_freshness"] = False
    
    return results 