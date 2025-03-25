#!/bin/bash

# Script to control CPU test deployment
# Usage: ./control-cpu-test.sh [start|stop|status]

# Function to check deployment status
check_status() {
    echo "Checking CPU test deployment status..."
    kubectl get deployment cpu-test
    kubectl get pods -l app=cpu-test
    echo "CPU usage metrics:"
    kubectl top pod -l app=cpu-test
}

# Function to start the CPU test
start_test() {
    echo "Starting CPU test deployment..."
    kubectl apply -f cpu-test.yaml
    sleep 5
    check_status
}

# Function to stop the CPU test
stop_test() {
    echo "Stopping CPU test deployment..."
    kubectl delete -f cpu-test.yaml
}

# Main script logic
case "$1" in
    start)
        start_test
        ;;
    stop)
        stop_test
        ;;
    status)
        check_status
        ;;
    *)
        echo "Usage: $0 [start|stop|status]"
        exit 1
        ;;
esac 