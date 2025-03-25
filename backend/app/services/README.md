# Services

This directory contains service modules for the NBA Stat Projections application.

## Available Services

### Scheduler Service

The scheduler service provides functionality to schedule and manage automated tasks such as daily data updates. It uses APScheduler to run tasks at specified intervals.

#### Features:
- Daily data updates (runs by default at 1:00 AM)
- Custom job scheduling
- Job management (enable/disable/update schedules)

#### Usage:

From Python code:
```python
from app.services.scheduler_service import scheduler_service

# Start the scheduler
scheduler_service.start()

# Schedule daily updates to run at 2:30 AM
scheduler_service.schedule_daily_updates(hour=2, minute=30)

# Get information about scheduled jobs
job_info = scheduler_service.get_job_info()
```

From command line:
```bash
# List all scheduled jobs
python -m app.scripts.scheduler_cli list

# Run the daily update job immediately
python -m app.scripts.scheduler_cli run daily_update

# Update the schedule for daily updates
python -m app.scripts.scheduler_cli update-schedule daily_update 3 30

# Disable a job
python -m app.scripts.scheduler_cli disable daily_update

# Enable a job
python -m app.scripts.scheduler_cli enable daily_update
```

### NBA API Client

The NBA API client provides functionality to interact with external NBA data APIs, including rate limiting to prevent API abuse.

### Projection Service

The projection service handles the generation of player stat projections based on historical data and various predictive models. 