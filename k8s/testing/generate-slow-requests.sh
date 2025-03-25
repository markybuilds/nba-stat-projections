#!/bin/bash

# Script to generate slow HTTP requests for testing alerts
# Usage: ./generate-slow-requests.sh [duration_seconds] [requests_per_second]

DURATION=${1:-300}  # Default 5 minutes
RPS=${2:-10}       # Default 10 requests per second
TARGET="http://slow-test-service/slow"

echo "Generating slow requests for ${DURATION} seconds at ${RPS} requests per second"
echo "Target: ${TARGET}"

start_time=$(date +%s)
end_time=$((start_time + DURATION))

while [ $(date +%s) -lt $end_time ]; do
    for i in $(seq 1 $RPS); do
        (time curl -s -o /dev/null "${TARGET}") 2>&1 | grep real &
    done
    sleep 1
done

echo "Slow request generation complete" 