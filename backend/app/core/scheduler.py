"""
Scheduler for background tasks
"""
import logging
from datetime import datetime
from functools import wraps

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.data.optimized_repository import OptimizedNBARepository

# Configure logger
logger = logging.getLogger(__name__)

# Create scheduler
scheduler = AsyncIOScheduler()

def log_job_execution(func):
    """Decorator to log job execution"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        job_name = func.__name__
        start_time = datetime.now()
        logger.info(f"Starting scheduled job: {job_name} at {start_time}")
        try:
            result = await func(*args, **kwargs)
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            logger.info(f"Completed job: {job_name} in {duration:.2f} seconds")
            return result
        except Exception as e:
            logger.error(f"Error in scheduled job {job_name}: {str(e)}")
            raise
    return wrapper

@log_job_execution
async def refresh_materialized_views():
    """Refresh all materialized views"""
    repo = OptimizedNBARepository()
    result = await repo.refresh_materialized_views()
    if result.get("success"):
        logger.info("Successfully refreshed materialized views")
    else:
        logger.error(f"Failed to refresh materialized views: {result.get('message')}")
    return result

def start_scheduler():
    """Start the background task scheduler"""
    if settings.SCHEDULER_ENABLED:
        # Add jobs to the scheduler
        
        # Refresh materialized views every 15 minutes
        scheduler.add_job(
            refresh_materialized_views,
            IntervalTrigger(minutes=15),
            id="refresh_materialized_views",
            replace_existing=True
        )
        
        # Refresh materialized views at specific times (e.g., before games)
        scheduler.add_job(
            refresh_materialized_views,
            CronTrigger(hour='6,12,17,21', minute=0),  # 6AM, 12PM, 5PM, 9PM
            id="refresh_views_fixed_times",
            replace_existing=True
        )
        
        # Add more scheduled jobs here as needed
        
        # Start the scheduler
        scheduler.start()
        logger.info("Scheduler started with the following jobs:")
        for job in scheduler.get_jobs():
            logger.info(f"  - {job.id}: Next run at {job.next_run_time}")
    else:
        logger.info("Scheduler is disabled in configuration")

def shutdown_scheduler():
    """Shutdown the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shutdown completed") 