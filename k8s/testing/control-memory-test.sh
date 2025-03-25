#!/bin/bash

# Script to control memory test deployment
# Usage: ./control-memory-test.sh [start|stop|status]

# Function to check deployment status
check_status() {
    echo "Checking memory test deployment status..."
    kubectl get deployment memory-test
    kubectl get pods -l app=memory-test
}

# Function to start the memory test
start_test() {
    echo "Starting memory test deployment..."
    kubectl apply -f memory-test.yaml
    sleep 5
    check_status
}

# Function to stop the memory test
stop_test() {
    echo "Stopping memory test deployment..."
    kubectl delete -f memory-test.yaml
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