"""
Main application module for NBA Stat Projections API.
"""

import time
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.database.session import engine, get_db
from app.services.scheduler_service import scheduler_service
from app.services.metrics_service import metrics_service
from app.services.websocket_service import websocket_service
from app.monitoring import setup_monitoring

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager for FastAPI application startup and shutdown events.
    """
    # Startup
    logger.info("Application starting up...")
    start_time = time.time()
    
    # Start the scheduler
    scheduler_service.start()
    scheduler_service.schedule_daily_updates(hour=settings.UPDATE_HOUR, minute=settings.UPDATE_MINUTE)
    
    # Record initial scheduler metrics
    if settings.ENABLE_METRICS:
        metrics_service.update_scheduler_metrics()
    
    logger.info(f"Application startup completed in {time.time() - start_time:.2f} seconds")
    
    yield
    
    # Shutdown
    logger.info("Application shutting down...")
    
    # Shutdown the scheduler
    scheduler_service.shutdown()
    
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for NBA stat projections",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up monitoring if enabled
if settings.ENABLE_METRICS:
    setup_monitoring(app)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Add WebSocket route
app.add_websocket_route("/ws", websocket_service.websocket_endpoint)


@app.get("/healthz")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "time": datetime.now().isoformat()}


@app.get(settings.METRICS_PATH)
async def metrics():
    """
    Endpoint for exposing Prometheus metrics.
    """
    if not settings.ENABLE_METRICS:
        return JSONResponse(
            content={"error": "Metrics collection is disabled"},
            status_code=404
        )
    
    # Update scheduler metrics before serving
    metrics_service.update_scheduler_metrics()
    
    # Get metrics in Prometheus format
    metrics_data = metrics_service.get_all_metrics()
    
    return Response(
        content=metrics_data,
        media_type=metrics_service.get_content_type()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 