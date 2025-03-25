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
import json
from typing import Optional, List

# Add the parent directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.services.scheduler_service import scheduler_service
from app.scripts.update_daily_data import update_daily_data
from app.scripts.refresh_materialized_views import refresh_materialized_views
from app.utils.database import get_supabase_client

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scheduler-cli")


def parse_args():
    """Parse command line arguments."""
    
    parser = argparse.ArgumentParser(description="NBA Stats Scheduler CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show scheduler status")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start the scheduler")
    
    # Stop command
    stop_parser = subparsers.add_parser("stop", help="Stop the scheduler")
    
    # List jobs command
    list_parser = subparsers.add_parser("list", help="List scheduled jobs")
    list_parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    # Run a job command
    run_parser = subparsers.add_parser("run", help="Run a job immediately")
    run_parser.add_argument("job_id", help="ID of the job to run")
    
    # Refresh views command
    refresh_parser = subparsers.add_parser("refresh-views", help="Refresh materialized views")
    
    # Query performance commands
    query_perf_parser = subparsers.add_parser("query-performance", help="Query performance commands")
    query_perf_subparsers = query_perf_parser.add_subparsers(dest="query_command", help="Query performance subcommand")
    
    # Get performance stats
    stats_parser = query_perf_subparsers.add_parser("stats", help="Get query performance statistics")
    stats_parser.add_argument("--hours", type=int, default=24, help="Number of hours to look back")
    stats_parser.add_argument("--min-slow-pct", type=float, default=5.0, help="Minimum slow percentage to report")
    stats_parser.add_argument("--json", action="store_true", help="Output in JSON format")
    
    # Clean performance logs
    clean_parser = query_perf_subparsers.add_parser("cleanup", help="Clean up old performance logs")
    clean_parser.add_argument("--days", type=int, default=30, help="Number of days of logs to keep")
    
    return parser.parse_args()


async def show_status():
    """Show the current status of the scheduler."""
    is_running = scheduler_service.scheduler.running
    job_count = len(scheduler_service.jobs)
    
    print(f"Scheduler Status: {'RUNNING' if is_running else 'STOPPED'}")
    print(f"Job Count: {job_count}")
    
    if is_running:
        next_jobs = []
        
        for job_id, job in scheduler_service.jobs.items():
            if job.next_run_time:
                next_run = job.next_run_time.strftime("%Y-%m-%d %H:%M:%S")
                next_jobs.append((job_id, next_run))
        
        if next_jobs:
            print("\nUpcoming Jobs:")
            for job_id, next_run in sorted(next_jobs, key=lambda x: x[1]):
                print(f"  - {job_id}: {next_run}")


async def start_scheduler():
    """Start the scheduler."""
    if scheduler_service.scheduler.running:
        print("Scheduler is already running")
    else:
        scheduler_service.start()
        print("Scheduler started")


async def stop_scheduler():
    """Stop the scheduler."""
    if not scheduler_service.scheduler.running:
        print("Scheduler is already stopped")
    else:
        scheduler_service.stop()
        print("Scheduler stopped")


async def list_jobs(json_output: bool = False):
    """List all scheduled jobs."""
    jobs = scheduler_service.get_job_info()
    
    if json_output:
        print(json.dumps(jobs, indent=2))
    else:
        print(f"Scheduled Jobs ({len(jobs)}):")
        for job in sorted(jobs, key=lambda j: j.get("id", "")):
            job_id = job.get("id", "unknown")
            name = job.get("name", "Unnamed Job")
            next_run = job.get("next_run_time", "Not scheduled")
            active = job.get("active", False)
            
            status = "ACTIVE" if active else "INACTIVE"
            print(f"  - {job_id}: {name} [{status}]")
            print(f"    Next Run: {next_run}")
            print(f"    Trigger: {job.get('trigger', 'unknown')}")
            print()


async def run_job(job_id: str):
    """Run a job immediately."""
    if job_id not in scheduler_service.jobs:
        print(f"Job not found: {job_id}")
        return
    
    print(f"Running job: {job_id}")
    
    try:
        # Get the job function
        job = scheduler_service.jobs[job_id]
        job_func = job.func
        
        # Run the job
        start_time = datetime.now()
        result = await job_func()
        
        duration = (datetime.now() - start_time).total_seconds()
        print(f"Job completed in {duration:.2f} seconds")
        
        if result:
            print("Result:")
            if isinstance(result, dict):
                print(json.dumps(result, indent=2))
            else:
                print(result)
    except Exception as e:
        print(f"Error running job: {str(e)}")


async def refresh_views_command():
    """Run the materialized view refresh job."""
    print("Refreshing materialized views...")
    
    try:
        result = await refresh_materialized_views()
        print(f"Refresh completed in {result['duration_seconds']} seconds")
        print(f"Success: {result['success_count']}/{result['refresh_count']} views refreshed")
        
        if result['error_count'] > 0:
            print(f"Errors: {result['error_count']} views failed to refresh")
            for view, status in result['results'].items():
                if status == "error":
                    print(f"  - {view}: FAILED")
    except Exception as e:
        print(f"Error refreshing views: {str(e)}")


async def get_query_performance_stats(hours: int = 24, min_slow_pct: float = 5.0, json_output: bool = False):
    """Get query performance statistics."""
    try:
        supabase = get_supabase_client()
        start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(hours=hours)
        
        result = await supabase.rpc(
            'get_query_performance_stats',
            {
                "start_time": start_time.isoformat(),
                "end_time": datetime.now().isoformat()
            }
        ).execute()
        
        stats = result.data
        
        # Filter by minimum slow percentage
        filtered_stats = [s for s in stats if s.get('slow_percentage', 0) >= min_slow_pct]
        
        if json_output:
            print(json.dumps(filtered_stats, indent=2))
        else:
            print(f"Query Performance Statistics (last {hours} hours, min slow %: {min_slow_pct})")
            print(f"Total queries analyzed: {len(stats)}")
            print(f"Queries with slow percentage >= {min_slow_pct}%: {len(filtered_stats)}")
            
            if filtered_stats:
                print("\nSlow Queries:")
                for query in sorted(filtered_stats, key=lambda q: q.get('slow_percentage', 0), reverse=True):
                    name = query.get('query_name', 'unknown')
                    avg_time = query.get('avg_execution_time', 0)
                    max_time = query.get('max_execution_time', 0)
                    slow_pct = query.get('slow_percentage', 0)
                    total = query.get('total_executions', 0)
                    slow_count = query.get('slow_query_count', 0)
                    
                    print(f"  - {name}:")
                    print(f"    Slow: {slow_pct:.1f}% ({slow_count}/{total} executions)")
                    print(f"    Avg Time: {avg_time:.3f}s, Max Time: {max_time:.3f}s")
            else:
                print("\nNo slow queries found matching criteria.")
    except Exception as e:
        print(f"Error getting query performance stats: {str(e)}")


async def cleanup_performance_logs(days: int = 30):
    """Clean up old query performance logs."""
    try:
        print(f"Cleaning up performance logs older than {days} days...")
        supabase = get_supabase_client()
        
        result = await supabase.rpc(
            'cleanup_performance_logs',
            {"retention_days": days}
        ).execute()
        
        print("Performance logs cleanup completed successfully")
    except Exception as e:
        print(f"Error cleaning up performance logs: {str(e)}")


def show_help():
    """Show help message."""
    print(__doc__)


async def main():
    """Main entry point for the CLI."""
    args = parse_args()
    
    if args.command == "status":
        await show_status()
    elif args.command == "start":
        await start_scheduler()
    elif args.command == "stop":
        await stop_scheduler()
    elif args.command == "list":
        await list_jobs(args.json)
    elif args.command == "run":
        await run_job(args.job_id)
    elif args.command == "refresh-views":
        await refresh_views_command()
    elif args.command == "query-performance":
        if args.query_command == "stats":
            await get_query_performance_stats(args.hours, args.min_slow_pct, args.json)
        elif args.query_command == "cleanup":
            await cleanup_performance_logs(args.days)
        else:
            print("Unknown query performance subcommand. Try 'stats' or 'cleanup'.")
    else:
        print("Unknown command. Try 'status', 'start', 'stop', 'list', 'run', 'refresh-views', or 'query-performance'.")


if __name__ == "__main__":
    asyncio.run(main()) 