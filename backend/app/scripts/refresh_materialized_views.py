"""
Script to refresh materialized views in the database.

This script refreshes all materialized views used by the application
to ensure they have the latest data. It can be run from the command line
or scheduled via the scheduler service.

Usage:
    python -m app.scripts.refresh_materialized_views

"""

import asyncio
import logging
import sys
import time
from datetime import datetime

from app.utils.database import get_supabase_client
from app.services.metrics_service import metrics_service
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure logging
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler()]
    )

async def refresh_materialized_view(view_name: str) -> bool:
    """
    Refresh a specific materialized view.
    
    Args:
        view_name: Name of the function to refresh the view
        
    Returns:
        bool: True if refresh was successful, False otherwise
    """
    try:
        start_time = time.time()
        supabase = get_supabase_client()
        
        # Call the function to refresh the view
        await supabase.rpc(view_name).execute()
        
        duration = time.time() - start_time
        if settings.ENABLE_METRICS:
            metrics_service.track_materialized_view_refresh(view_name, duration, True)
        
        logger.info(f"Successfully refreshed {view_name} in {duration:.2f}s")
        return True
    except Exception as e:
        if settings.ENABLE_METRICS:
            metrics_service.track_materialized_view_refresh(view_name, 0, False)
            metrics_service.track_error(error_type="materialized_view_refresh", service=view_name)
        
        logger.error(f"Failed to refresh {view_name}: {str(e)}")
        return False

async def refresh_materialized_views() -> dict:
    """
    Refresh all materialized views used by the application.
    
    Returns:
        dict: Dictionary with success/failure information
    """
    logger.info("Starting materialized view refresh operation")
    start_time = time.time()
    
    # List of view refresh functions
    view_refresh_functions = [
        "refresh_today_views",
        "refresh_player_stats_views"
    ]
    
    results = {}
    success_count = 0
    error_count = 0
    
    for view_func in view_refresh_functions:
        success = await refresh_materialized_view(view_func)
        results[view_func] = "success" if success else "error"
        
        if success:
            success_count += 1
        else:
            error_count += 1
    
    total_duration = time.time() - start_time
    
    if settings.ENABLE_METRICS:
        metrics_service.track_materialized_view_refresh_operation(
            total_duration, 
            success_count, 
            error_count
        )
    
    result_data = {
        "success": error_count == 0,
        "refresh_count": len(view_refresh_functions),
        "success_count": success_count,
        "error_count": error_count,
        "duration_seconds": f"{total_duration:.2f}",
        "timestamp": datetime.now().isoformat(),
        "results": results
    }
    
    logger.info(f"Materialized view refresh completed in {total_duration:.2f}s with {success_count} successes and {error_count} errors")
    return result_data

async def run():
    """Run the script as a standalone command."""
    try:
        logger.info("Starting materialized view refresh script")
        await refresh_materialized_views()
        logger.info("Materialized view refresh script completed")
    except Exception as e:
        logger.error(f"Error in materialized view refresh script: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run()) 