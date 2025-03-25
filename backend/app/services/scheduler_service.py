"""
Scheduler service for NBA Stat Projections.

This service provides functionality to schedule and run automated tasks
including daily data updates, cleanup operations, and periodic maintenance.
"""

import logging
import asyncio
import sys
import time
from datetime import datetime, timedelta
from typing import Callable, Any, Optional, Dict, List

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore

from app.core.config import settings

logger = logging.getLogger("scheduler")

class SchedulerService:
    """
    Service for scheduling and running automated tasks.
    """
    _instance = None
    _initialized = False
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(SchedulerService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.scheduler = AsyncIOScheduler(
                jobstores={"default": MemoryJobStore()}
            )
            self.jobs = {}
            self._initialized = True
            logger.info("Scheduler service initialized")
    
    def start(self):
        """Start the scheduler if it's not already running."""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started")
            
            # Schedule health check job if not already scheduled
            if "health_check" not in self.jobs:
                self.schedule_health_check()
    
    def shutdown(self):
        """Shutdown the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler shut down")
    
    def schedule_daily_updates(self, 
                               hour: int = 1, 
                               minute: int = 0,
                               update_func: Optional[Callable] = None):
        """
        Schedule the daily data update job.
        
        Args:
            hour: Hour of the day to run the update (default: 1 AM)
            minute: Minute of the hour to run the update (default: 0)
            update_func: Optional custom update function to use instead of default
        """
        # Import here to avoid circular imports
        from app.scripts.update_daily_data import update_daily_data
        
        func = update_func or update_daily_data
        
        job = self.scheduler.add_job(
            self._wrap_job(func, "daily_update"),
            trigger=CronTrigger(hour=hour, minute=minute),
            id="daily_update",
            name="NBA Daily Data Update",
            replace_existing=True
        )
        
        self.jobs["daily_update"] = job
        logger.info(f"Scheduled daily update job to run at {hour:02d}:{minute:02d}")
        
        # Update metrics
        from app.services.metrics_service import metrics_service
        metrics_service.update_scheduler_next_run("daily_update", job.next_run_time)
        
        return job
    
    def schedule_health_check(self, interval_minutes: int = 30):
        """
        Schedule the health check job.
        
        Args:
            interval_minutes: Interval in minutes between health checks
        """
        job = self.scheduler.add_job(
            self._health_check,
            trigger=IntervalTrigger(minutes=interval_minutes),
            id="health_check",
            name="Scheduler Health Check",
            replace_existing=True
        )
        
        self.jobs["health_check"] = job
        logger.info(f"Scheduled health check job to run every {interval_minutes} minutes")
        
        # Update metrics
        from app.services.metrics_service import metrics_service
        metrics_service.update_scheduler_next_run("health_check", job.next_run_time)
        
        return job
    
    def schedule_custom_job(self, 
                            func: Callable, 
                            trigger: Any, 
                            job_id: str, 
                            job_name: str,
                            **kwargs):
        """
        Schedule a custom job with the specified trigger.
        
        Args:
            func: Function to run
            trigger: APScheduler trigger to use
            job_id: Unique identifier for the job
            job_name: Name for the job
            **kwargs: Additional arguments to pass to the scheduler
        """
        job = self.scheduler.add_job(
            self._wrap_job(func, job_id),
            trigger=trigger,
            id=job_id,
            name=job_name,
            replace_existing=True,
            **kwargs
        )
        
        self.jobs[job_id] = job
        logger.info(f"Scheduled custom job: {job_name} [{job_id}]")
        
        # Update metrics
        from app.services.metrics_service import metrics_service
        metrics_service.update_scheduler_next_run(job_id, job.next_run_time)
        
        return job
    
    def remove_job(self, job_id: str):
        """
        Remove a scheduled job by ID.
        
        Args:
            job_id: ID of the job to remove
        """
        if job_id in self.jobs:
            self.scheduler.remove_job(job_id)
            del self.jobs[job_id]
            logger.info(f"Removed job: {job_id}")
    
    def get_job_info(self, job_id: str = None):
        """
        Get information about scheduled jobs.
        
        Args:
            job_id: Optional ID of a specific job to get info for
            
        Returns:
            List of dictionaries with job information
        """
        if job_id and job_id in self.jobs:
            job = self.jobs[job_id]
            return [{
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            }]
        
        return [{
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        } for job in self.scheduler.get_jobs()]
    
    def _wrap_job(self, func: Callable, job_id: str) -> Callable:
        """
        Wrap a job function to add metrics and error handling.
        
        Args:
            func: The original job function
            job_id: ID of the job
            
        Returns:
            Wrapped function with metrics and error handling
        """
        async def wrapped_job(*args, **kwargs):
            # Import here to avoid circular imports
            from app.services.metrics_service import metrics_service
            from app.services.alerts_service import alerts_service
            
            start_time = time.time()
            
            try:
                logger.info(f"Starting job: {job_id}")
                result = await func(*args, **kwargs)
                
                # Record success in metrics
                metrics_service.track_scheduler_job(job_id=job_id, start_time=start_time, status="success")
                
                # Update next run time in metrics
                job = self.jobs.get(job_id)
                if job:
                    metrics_service.update_scheduler_next_run(job_id, job.next_run_time)
                
                logger.info(f"Job {job_id} completed successfully")
                return result
            
            except Exception as e:
                # Record failure in metrics
                metrics_service.track_scheduler_job(job_id=job_id, start_time=start_time, status="failure")
                metrics_service.track_error(error_type="job_execution", service=f"scheduler_{job_id}")
                
                # Send alert
                error_message = f"Job {job_id} failed: {str(e)}"
                logger.error(error_message)
                
                asyncio.create_task(alerts_service.send_alert(
                    title=f"Scheduled Job Failed: {job_id}",
                    message=error_message,
                    level="ERROR",
                    data={
                        "job_id": job_id,
                        "error": str(e),
                        "traceback": str(sys.exc_info()),
                        "duration_seconds": f"{time.time() - start_time:.2f}"
                    }
                ))
                
                # Re-raise the exception
                raise
        
        return wrapped_job
    
    async def _health_check(self):
        """
        Perform health checks on the scheduler and its jobs.
        """
        logger.info("Running scheduler health check")
        
        # Import here to avoid circular imports
        from app.services.metrics_service import metrics_service
        from app.services.alerts_service import alerts_service
        
        # Check if the scheduler is running
        if not self.scheduler.running:
            logger.error("Scheduler is not running")
            await alerts_service.send_alert(
                title="Scheduler Not Running",
                message="The scheduler service is not running",
                level="ERROR"
            )
            return
        
        # Check each job
        for job_id, job in self.jobs.items():
            # Skip the health check job itself
            if job_id == "health_check":
                continue
                
            # Update the next run time in metrics
            metrics_service.update_scheduler_next_run(job_id, job.next_run_time)
            
            # Check if the job has missed its scheduled run time
            if job.next_run_time:
                now = datetime.now()
                
                # Check if the job is significantly overdue
                if job.next_run_time < now:
                    hours_overdue = (now - job.next_run_time).total_seconds() / 3600
                    
                    # Alert if more than 2 hours overdue
                    if hours_overdue > 2:
                        await alerts_service.send_alert(
                            title=f"Job {job_id} is Overdue",
                            message=f"Scheduled job {job_id} is {hours_overdue:.1f} hours overdue",
                            level="WARNING",
                            data={
                                "job_id": job_id,
                                "job_name": job.name,
                                "next_run_time": job.next_run_time.isoformat(),
                                "hours_overdue": f"{hours_overdue:.1f}"
                            }
                        )
        
        # Run additional health checks for specific services
        await alerts_service.check_scheduler_health()
        await alerts_service.check_data_freshness()
        
        logger.info("Scheduler health check completed")


# Create the singleton instance
scheduler_service = SchedulerService() 