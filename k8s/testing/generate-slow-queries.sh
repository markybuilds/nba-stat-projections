#!/bin/bash

# Script to execute slow database queries for testing alerts
# Usage: ./generate-slow-queries.sh [duration_seconds] [interval_ms]

# Default values
DURATION=${1:-300}  # Default 5 minutes
INTERVAL=${2:-1000} # Default 1 second between queries

# Database connection parameters (should be set as environment variables)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-"postgres"}
DB_USER=${DB_USER:-"postgres"}

echo "Starting slow query generation:"
echo "Duration: $DURATION seconds"
echo "Interval: $INTERVAL milliseconds"
echo "Target Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Execute the SQL script with parameters
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f slow-queries.sql -v duration="$DURATION" -v interval="$INTERVAL"

echo "Slow query generation completed." 