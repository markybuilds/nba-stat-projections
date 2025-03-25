"""
Metrics service for NBA Stat Projections.

This service provides functionality to track and expose Prometheus metrics
for monitoring application performance, errors, and scheduled jobs.
"""

import logging
import time
from typing import Dict, List, Any, Optional
from datetime import datetime

from prometheus_client import Counter, Gauge, Histogram, Summary, push_to_gateway
from prometheus_client import generate_latest
from prometheus_client.exposition import CONTENT_TYPE_LATEST

from app.core.config import settings

logger = logging.getLogger("metrics")

# Define metrics
REQUEST_COUNT = Counter(
    "api_requests_total",
    "Total count of API requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "api_request_duration_seconds",
    "API request duration in seconds",
    ["method", "endpoint"],
    buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, float("inf"))
)

ERROR_COUNT = Counter(
    "error_total",
    "Total count of errors",
    ["error_type", "service"]
)

WEBSOCKET_CONNECTIONS = Gauge(
    "websocket_connections",
    "Current number of active WebSocket connections"
)

DB_QUERY_COUNT = Counter(
    "db_query_total",
    "Total count of database queries",
    ["query_type", "table"]
)

DB_QUERY_LATENCY = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["query_type", "table"],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0)
)

SCHEDULER_JOB_COUNT = Counter(
    "scheduler_job_total",
    "Total count of scheduler job executions",
    ["job_id", "status"]
)

SCHEDULER_JOB_DURATION = Histogram(
    "scheduler_job_duration_seconds",
    "Scheduler job execution duration in seconds",
    ["job_id"],
    buckets=(0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0, 300.0, 600.0, 1800.0, 3600.0)
)

SCHEDULER_JOB_NEXT_RUN = Gauge(
    "scheduler_job_next_run_timestamp",
    "Timestamp of next scheduled run for a job",
    ["job_id"]
)

SCHEDULER_JOB_LAST_SUCCESS = Gauge(
    "scheduler_job_last_success_timestamp",
    "Timestamp of last successful job execution",
    ["job_id"]
)

SCHEDULER_JOB_LAST_FAILURE = Gauge(
    "scheduler_job_last_failure_timestamp", 
    "Timestamp of last failed job execution",
    ["job_id"]
)

DATA_FRESHNESS = Gauge(
    "data_freshness_hours",
    "Hours since last data update",
    ["data_type"]
)

API_CALL_COUNT = Counter(
    "external_api_calls_total",
    "Total count of external API calls",
    ["api", "endpoint", "status"]
)

API_CALL_LATENCY = Histogram(
    "external_api_call_duration_seconds",
    "External API call duration in seconds",
    ["api", "endpoint"],
    buckets=(0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, 30.0, 60.0)
)

PROJECTIONS_COUNT = Gauge(
    "projections_count",
    "Number of projections by type",
    ["projection_type"]
)

class MetricsService:
    """
    Service for tracking and exposing Prometheus metrics.
    """
    _instance = None
    _initialized = False
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MetricsService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialized = True
            logger.info("Metrics service initialized")
    
    def track_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """
        Track an API request.
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            status_code: HTTP status code
            duration: Request duration in seconds
        """
        if not settings.ENABLE_METRICS:
            return
            
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
        
        # Track errors separately
        if status_code >= 400:
            error_type = "client_error" if status_code < 500 else "server_error"
            ERROR_COUNT.labels(error_type=error_type, service="api").inc()
    
    def track_error(self, error_type: str, service: str = "api"):
        """
        Track an error.
        
        Args:
            error_type: Type of error
            service: Service where the error occurred
        """
        if not settings.ENABLE_METRICS:
            return
            
        ERROR_COUNT.labels(error_type=error_type, service=service).inc()
    
    def track_websocket_connection(self, connected: bool = True):
        """
        Track a WebSocket connection.
        
        Args:
            connected: True if a new connection, False if disconnection
        """
        if not settings.ENABLE_METRICS:
            return
            
        if connected:
            WEBSOCKET_CONNECTIONS.inc()
        else:
            WEBSOCKET_CONNECTIONS.dec()
    
    def track_websocket_message(self, direction: str, message_type: str):
        """
        Track WebSocket messages.
        
        Args:
            direction: "sent" or "received"
            message_type: Type of message
        """
        if not settings.ENABLE_METRICS:
            return
    
    def track_db_query(self, query_type: str, table: str, duration: float):
        """
        Track a database query.
        
        Args:
            query_type: Type of query (select, insert, update, delete)
            table: Database table
            duration: Query duration in seconds
        """
        if not settings.ENABLE_METRICS:
            return
            
        DB_QUERY_COUNT.labels(query_type=query_type, table=table).inc()
        DB_QUERY_LATENCY.labels(query_type=query_type, table=table).observe(duration)
    
    def track_scheduler_job(self, job_id: str, start_time: float, status: str = "success"):
        """
        Track a scheduler job execution.
        
        Args:
            job_id: ID of the job
            start_time: Start time of the job (time.time())
            status: Status of the job (success or failure)
        """
        if not settings.ENABLE_METRICS:
            return
            
        # Calculate duration
        duration = time.time() - start_time
        
        # Record execution count and duration
        SCHEDULER_JOB_COUNT.labels(job_id=job_id, status=status).inc()
        SCHEDULER_JOB_DURATION.labels(job_id=job_id).observe(duration)
        
        # Record timestamp for success or failure
        current_time = time.time()
        if status == "success":
            SCHEDULER_JOB_LAST_SUCCESS.labels(job_id=job_id).set(current_time)
        elif status == "failure":
            SCHEDULER_JOB_LAST_FAILURE.labels(job_id=job_id).set(current_time)
    
    def update_scheduler_next_run(self, job_id: str, next_run_time: Optional[datetime]):
        """
        Update the next run time for a scheduler job.
        
        Args:
            job_id: ID of the job
            next_run_time: Next run time for the job
        """
        if not settings.ENABLE_METRICS:
            return
            
        if next_run_time:
            timestamp = next_run_time.timestamp()
            SCHEDULER_JOB_NEXT_RUN.labels(job_id=job_id).set(timestamp)
    
    def update_data_freshness(self, data_type: str, last_update_time: datetime):
        """
        Update the freshness metric for a data type.
        
        Args:
            data_type: Type of data (games, players, projections)
            last_update_time: Time of the last update
        """
        if not settings.ENABLE_METRICS:
            return
            
        hours_since_update = (datetime.now() - last_update_time).total_seconds() / 3600
        DATA_FRESHNESS.labels(data_type=data_type).set(hours_since_update)
    
    def track_api_call(self, api: str, endpoint: str, status: str, duration: float):
        """
        Track an external API call.
        
        Args:
            api: Name of the API
            endpoint: API endpoint
            status: Status of the call (success or failure)
            duration: Call duration in seconds
        """
        if not settings.ENABLE_METRICS:
            return
            
        API_CALL_COUNT.labels(api=api, endpoint=endpoint, status=status).inc()
        API_CALL_LATENCY.labels(api=api, endpoint=endpoint).observe(duration)
    
    def update_projections_count(self, projection_type: str, count: int):
        """
        Update the count of projections.
        
        Args:
            projection_type: Type of projection
            count: Number of projections
        """
        if not settings.ENABLE_METRICS:
            return
            
        PROJECTIONS_COUNT.labels(projection_type=projection_type).set(count)
    
    def get_all_metrics(self) -> bytes:
        """
        Get all metrics in Prometheus format.
        
        Returns:
            Metrics in Prometheus format
        """
        if not settings.ENABLE_METRICS:
            return b""
            
        return generate_latest()
    
    def get_content_type(self) -> str:
        """
        Get the content type for metrics.
        
        Returns:
            Content type for metrics
        """
        return CONTENT_TYPE_LATEST
    
    def push_to_gateway(self, job: str):
        """
        Push metrics to Prometheus Pushgateway.
        
        Args:
            job: Job name
        """
        if not settings.ENABLE_METRICS:
            return
            
        if not settings.PROMETHEUS_PUSHGATEWAY_URL:
            logger.warning("Prometheus Pushgateway URL not configured")
            return
            
        try:
            push_to_gateway(
                settings.PROMETHEUS_PUSHGATEWAY_URL,
                job=job,
                registry=None  # Use the default registry
            )
            logger.info(f"Pushed metrics to gateway for job: {job}")
        except Exception as e:
            logger.error(f"Failed to push metrics to gateway: {e}")
    
    def update_scheduler_metrics(self):
        """
        Update metrics for all scheduler jobs.
        """
        if not settings.ENABLE_METRICS:
            return
            
        try:
            # Import here to avoid circular imports
            from app.services.scheduler_service import scheduler_service
            
            # Get all jobs
            job_info = scheduler_service.get_job_info()
            
            # Update next run time for each job
            for job in job_info:
                job_id = job.get("id")
                next_run_time_str = job.get("next_run_time")
                
                if job_id and next_run_time_str:
                    try:
                        next_run_time = datetime.fromisoformat(next_run_time_str)
                        self.update_scheduler_next_run(job_id, next_run_time)
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Could not parse next_run_time for job {job_id}: {e}")
        
        except Exception as e:
            logger.error(f"Error updating scheduler metrics: {e}")


# Create the singleton instance
metrics_service = MetricsService() 