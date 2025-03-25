"""
Monitoring middleware for NBA Stat Projections.

This module contains middleware for tracking API requests, database operations,
and other monitoring-related utilities.
"""

import time
from typing import Callable, Awaitable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.config import settings
from app.services.metrics_service import metrics_service


class PrometheusMiddleware(BaseHTTPMiddleware):
    """
    Middleware for tracking API requests with Prometheus metrics.
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        # Skip metrics endpoint to avoid recursion
        if request.url.path == settings.METRICS_PATH:
            return await call_next(request)
        
        # Track request timing
        start_time = time.time()
        
        # Process the request
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Record metrics
            metrics_service.track_request(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code,
                duration=duration
            )
            
            return response
        
        except Exception as e:
            # Track exception
            duration = time.time() - start_time
            metrics_service.track_error(
                error_type="uncaught_exception",
                service="api"
            )
            
            # Re-raise the exception
            raise


async def db_metrics_handler(query, args, kwargs, start_time, result):
    """
    Event handler for tracking database queries.
    
    Args:
        query: SQL query
        args: Query arguments
        kwargs: Query keyword arguments
        start_time: Query start time
        result: Query result
    """
    if not settings.ENABLE_METRICS:
        return
    
    duration = time.time() - start_time
    
    # Determine query type (SELECT, INSERT, UPDATE, DELETE)
    query_type = query.split()[0].lower() if query and isinstance(query, str) else "unknown"
    
    # Extract table name - simple heuristic
    table = "unknown"
    if isinstance(query, str):
        if "from" in query.lower():
            parts = query.lower().split("from")[1].strip().split()
            if parts:
                table = parts[0].strip('"\'`)( ')
        elif "into" in query.lower():
            parts = query.lower().split("into")[1].strip().split()
            if parts:
                table = parts[0].strip('"\'`)( ')
        elif "update" in query.lower():
            parts = query.lower().split("update")[1].strip().split()
            if parts:
                table = parts[0].strip('"\'`)( ')
    
    # Track metrics
    metrics_service.track_db_query(
        query_type=query_type,
        table=table,
        duration=duration
    ) 