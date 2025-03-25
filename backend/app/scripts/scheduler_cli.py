#!/usr/bin/env python
"""
Command-line interface for managing the NBA Stat Projections scheduler.

This script allows administrators to:
- View scheduled jobs
- Manually trigger jobs
- Change the schedule for jobs
- Add new custom jobs
- Remove existing jobs

Usage:
    python -m app.scripts.scheduler_cli [command] [options]
    
Commands:
    list                    List all scheduled jobs
    status                  Show scheduler status
    run [job_id]            Run a job immediately
    update-schedule [job_id] [hour] [minute] 
                            Update schedule for a job
    disable [job_id]        Disable a job
    enable [job_id]         Enable a job
    help                    Show this help message
"""

import os
import sys
import argparse
import asyncio
import logging
from datetime import datetime

# Add the parent directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.services.scheduler_service import scheduler_service
from app.scripts.update_daily_data import update_daily_data

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scheduler-cli")


async def list_jobs():
    """List all scheduled jobs."""
    scheduler_service.start()
    jobs = scheduler_service.get_job_info()
    
    if not jobs:
        print("No scheduled jobs found.")
        return
    
    print(f"\nScheduled Jobs ({len(jobs)}):")
    print("-" * 80)
    for job in jobs:
        print(f"ID: {job['id']}")
        print(f"Name: {job['name']}")
        print(f"Next Run: {job['next_run_time'] or 'Not scheduled'}")
        print(f"Trigger: {job['trigger']}")
        print("-" * 80)


async def show_status():
    """Show scheduler status."""
    scheduler_service.start()
    jobs = scheduler_service.get_job_info()
    
    print("\nScheduler Status:")
    print("-" * 80)
    print(f"Running: {scheduler_service.scheduler.running}")
    print(f"Job Count: {len(jobs)}")
    print(f"Current Time: {datetime.now().isoformat()}")
    print("-" * 80)


async def run_job(job_id):
    """Run a job immediately."""
    scheduler_service.start()
    
    if job_id == "daily_update":
        print(f"Running job: {job_id}")
        await update_daily_data()
        print("Job completed.")
    else:
        print(f"Job ID '{job_id}' not recognized or not supported for manual execution.")


async def update_job_schedule(job_id, hour, minute):
    """Update the schedule for a job."""
    scheduler_service.start()
    
    if job_id == "daily_update":
        scheduler_service.schedule_daily_updates(hour=int(hour), minute=int(minute))
        print(f"Updated schedule for job '{job_id}' to run at {hour:02}:{minute:02}")
    else:
        print(f"Job ID '{job_id}' not recognized or not supported for schedule updates.")


async def disable_job(job_id):
    """Disable a job."""
    scheduler_service.start()
    
    # The APScheduler doesn't have a direct "disable" method, so we remove it
    scheduler_service.remove_job(job_id)
    print(f"Disabled job: {job_id}")


async def enable_job(job_id):
    """Enable a job."""
    scheduler_service.start()
    
    if job_id == "daily_update":
        scheduler_service.schedule_daily_updates()
        print(f"Enabled job: {job_id}")
    else:
        print(f"Job ID '{job_id}' not recognized or not supported for enabling.")


def show_help():
    """Show help message."""
    print(__doc__)


def main():
    """Main function for the command-line interface."""
    parser = argparse.ArgumentParser(
        description="NBA Stat Projections Scheduler CLI",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    
    parser.add_argument(
        "command",
        nargs="?",
        default="help",
        help="Command to execute (list, status, run, update-schedule, disable, enable, help)",
    )
    
    parser.add_argument(
        "job_id",
        nargs="?",
        default=None,
        help="Job ID for operations that require it",
    )
    
    parser.add_argument(
        "hour",
        nargs="?",
        default=None,
        help="Hour for schedule updates",
    )
    
    parser.add_argument(
        "minute",
        nargs="?",
        default=None,
        help="Minute for schedule updates",
    )
    
    args = parser.parse_args()
    
    # Execute the appropriate command
    if args.command == "list":
        asyncio.run(list_jobs())
    elif args.command == "status":
        asyncio.run(show_status())
    elif args.command == "run":
        if not args.job_id:
            print("Error: Job ID required for the 'run' command.")
            return
        asyncio.run(run_job(args.job_id))
    elif args.command == "update-schedule":
        if not all([args.job_id, args.hour, args.minute]):
            print("Error: Job ID, hour, and minute required for the 'update-schedule' command.")
            return
        asyncio.run(update_job_schedule(args.job_id, args.hour, args.minute))
    elif args.command == "disable":
        if not args.job_id:
            print("Error: Job ID required for the 'disable' command.")
            return
        asyncio.run(disable_job(args.job_id))
    elif args.command == "enable":
        if not args.job_id:
            print("Error: Job ID required for the 'enable' command.")
            return
        asyncio.run(enable_job(args.job_id))
    elif args.command == "help":
        show_help()
    else:
        print(f"Unknown command: {args.command}")
        show_help()


if __name__ == "__main__":
    main() 