"""
Configuration settings for NBA Stat Projections.
"""

import os
from typing import Optional, Dict, Any, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings.
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NBA Stat Projections"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # Supabase settings
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")
    
    # NBA API settings
    NBA_API_KEY: Optional[str] = os.getenv("NBA_API_KEY")
    NBA_RATE_LIMIT_SECONDS: int = int(os.getenv("NBA_RATE_LIMIT_SECONDS", "1"))
    
    # WebSocket settings
    WS_MAX_CONNECTIONS: int = 1000
    WS_PING_INTERVAL: int = 30  # Seconds
    
    # Monitoring settings
    ENABLE_METRICS: bool = True
    METRICS_PATH: str = "/metrics"
    PROMETHEUS_PUSHGATEWAY_URL: Optional[str] = os.getenv("PROMETHEUS_PUSHGATEWAY_URL")
    
    # Alerting settings
    ENABLE_ALERTS: bool = bool(os.getenv("ENABLE_ALERTS", "True") == "True")
    ALERT_EMAIL: Optional[str] = os.getenv("ALERT_EMAIL")
    SLACK_WEBHOOK_URL: Optional[str] = os.getenv("SLACK_WEBHOOK_URL")
    ALERT_LEVEL: str = os.getenv("ALERT_LEVEL", "ERROR")  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    # Job health check thresholds (in hours)
    DAILY_UPDATE_MAX_AGE: int = int(os.getenv("DAILY_UPDATE_MAX_AGE", "25"))  # Alert if daily update is older than this
    
    # Email settings for alerts
    SMTP_SERVER: Optional[str] = os.getenv("SMTP_SERVER")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    SMTP_FROM_EMAIL: Optional[str] = os.getenv("SMTP_FROM_EMAIL")
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings() 