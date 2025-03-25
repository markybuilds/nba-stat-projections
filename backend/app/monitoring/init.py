"""
Monitoring initialization for NBA Stat Projections.

This module contains functions for initializing and configuring monitoring
components like Prometheus metrics and database monitoring.
"""

import logging
from sqlalchemy.engine import Engine
from sqlalchemy import event

from fastapi import FastAPI
from app.core.config import settings
from app.monitoring.middleware import PrometheusMiddleware, db_metrics_handler
from app.database.session import engine

logger = logging.getLogger("monitoring")

def setup_monitoring(app: FastAPI) -> None:
    """
    Set up monitoring for the application.
    
    Args:
        app: FastAPI application
    """
    if not settings.ENABLE_METRICS:
        logger.info("Metrics collection is disabled")
        return
    
    # Add Prometheus middleware
    app.add_middleware(PrometheusMiddleware)
    logger.info(f"Added Prometheus middleware with metrics endpoint: {settings.METRICS_PATH}")
    
    # Set up database query monitoring if using SQLAlchemy
    setup_db_monitoring()
    
    logger.info("Monitoring setup complete")

def setup_db_monitoring() -> None:
    """
    Set up database query monitoring.
    """
    if not settings.ENABLE_METRICS:
        return
    
    # Add event listeners for before and after query execution
    @event.listens_for(Engine, "before_cursor_execute")
    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        if not hasattr(conn, "query_start_time"):
            conn.query_start_time = {}
        conn.query_start_time[statement] = {"time": time.time(), "parameters": parameters}
    
    @event.listens_for(Engine, "after_cursor_execute")
    def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        if hasattr(conn, "query_start_time") and statement in conn.query_start_time:
            start_time = conn.query_start_time[statement]["time"]
            # Call our metrics handler
            asyncio.create_task(db_metrics_handler(
                query=statement,
                args=parameters,
                kwargs={},
                start_time=start_time,
                result=None
            ))
            # Clean up
            del conn.query_start_time[statement]
    
    logger.info("Database query monitoring enabled")

# Add missing imports
import time
import asyncio 