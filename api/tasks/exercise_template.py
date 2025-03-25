import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models import models

# This is a template scheduled task for the knowledge transfer exercises
# You can use this as a starting point for your scheduled task development

logger = logging.getLogger(__name__)

def exercise_scheduled_task(param1: str = "default", param2: int = 10):
    """
    Example scheduled task for the knowledge transfer exercises.
    
    This is a template task that you can modify during the exercises.
    
    Args:
        param1: An example string parameter
        param2: An example integer parameter
    """
    logger.info(f"Running exercise scheduled task with params: {param1}, {param2}")
    
    # Get the current time for logging
    current_time = datetime.now()
    logger.info(f"Task started at: {current_time}")
    
    # Calculate some example values
    future_time = current_time + timedelta(days=param2)
    logger.info(f"Future date calculated: {future_time}")
    
    # Get a database session
    db = next(get_db())
    
    try:
        # This is a placeholder for database operations
        # Replace with actual database queries during the exercises
        
        # Example: Count records in a table
        # result = db.query(models.SomeModel).count()
        # logger.info(f"Found {result} records in the table")
        
        # Example: Process some records
        # records = db.query(models.SomeModel).filter(
        #     models.SomeModel.some_date < current_time
        # ).all()
        # 
        # for record in records:
        #     # Process each record
        #     logger.info(f"Processing record: {record.id}")
        #     
        #     # Update the record
        #     record.some_field = f"{param1}_{current_time}"
        #     
        # db.commit()
        # logger.info(f"Processed {len(records)} records")
        
        # For now, just log a placeholder message
        logger.info("Database operations would happen here")
        
    except Exception as e:
        # Roll back the transaction in case of error
        db.rollback()
        logger.error(f"Error in exercise scheduled task: {str(e)}")
        
    finally:
        # Close the database session
        db.close()
    
    # Log task completion
    end_time = datetime.now()
    duration = (end_time - current_time).total_seconds()
    logger.info(f"Task completed at: {end_time} (duration: {duration:.2f} seconds)")

# To register this task with the scheduler, add the following to scheduler.py:
"""
from .exercise_template import exercise_scheduled_task

# Schedule the task to run daily at 3 AM
scheduler.add_job(
    exercise_scheduled_task,
    trigger="cron",
    hour=3,
    minute=0,
    id="exercise_scheduled_task",
    replace_existing=True,
    kwargs={"param1": "daily_run", "param2": 7}
)

# Alternative: Schedule the task to run every 30 minutes
scheduler.add_job(
    exercise_scheduled_task,
    trigger="interval",
    minutes=30,
    id="exercise_scheduled_task_interval",
    replace_existing=True,
    kwargs={"param1": "interval_run", "param2": 1}
)
""" 