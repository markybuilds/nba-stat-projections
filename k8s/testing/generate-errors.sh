#!/bin/bash

# Script to generate HTTP errors for testing alerts
# Usage: ./generate-errors.sh [duration_seconds] [requests_per_second]

DURATION=${1:-300}  # Default 5 minutes
RPS=${2:-10}       # Default 10 requests per second
TARGET="http://error-test-service/error"

echo "Generating errors for ${DURATION} seconds at ${RPS} requests per second"
echo "Target: ${TARGET}"

start_time=$(date +%s)
end_time=$((start_time + DURATION))

while [ $(date +%s) -lt $end_time ]; do
    for i in $(seq 1 $RPS); do
        curl -s -o /dev/null -w "%{http_code}\n" "${TARGET}" &
    done
    sleep 1
done

echo "Error generation complete" 