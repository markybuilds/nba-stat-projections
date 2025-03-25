#!/bin/bash

# Master script to control all test scenarios
# Usage: ./control-all-tests.sh [start|stop|status] [scenario]

# Available test scenarios
SCENARIOS="error slow memory cpu db-slow all"

# Function to print usage
print_usage() {
    echo "Usage: $0 [start|stop|status] [scenario]"
    echo "Available scenarios: $SCENARIOS"
    echo "Example: $0 start error"
    echo "         $0 stop all"
}

# Function to control error endpoint test
control_error_test() {
    local action=$1
    case "$action" in
        start)
            kubectl apply -f error-endpoint.yaml
            ./generate-errors.sh &
            ;;
        stop)
            kubectl delete -f error-endpoint.yaml
            pkill -f "generate-errors.sh"
            ;;
        status)
            kubectl get deployment error-test-endpoint
            kubectl get pods -l app=error-test
            ;;
    esac
}

# Function to control slow endpoint test
control_slow_test() {
    local action=$1
    case "$action" in
        start)
            kubectl apply -f slow-endpoint.yaml
            ./generate-slow-requests.sh &
            ;;
        stop)
            kubectl delete -f slow-endpoint.yaml
            pkill -f "generate-slow-requests.sh"
            ;;
        status)
            kubectl get deployment slow-test-endpoint
            kubectl get pods -l app=slow-test
            ;;
    esac
}

# Function to control memory test
control_memory_test() {
    local action=$1
    ./control-memory-test.sh "$action"
}

# Function to control CPU test
control_cpu_test() {
    local action=$1
    ./control-cpu-test.sh "$action"
}

# Function to control database slow queries test
control_db_slow_test() {
    local action=$1
    case "$action" in
        start)
            ./generate-slow-queries.sh &
            ;;
        stop)
            pkill -f "generate-slow-queries.sh"
            ;;
        status)
            ps aux | grep "generate-slow-queries.sh" | grep -v grep
            ;;
    esac
}

# Function to control all tests
control_all_tests() {
    local action=$1
    control_error_test "$action"
    control_slow_test "$action"
    control_memory_test "$action"
    control_cpu_test "$action"
    control_db_slow_test "$action"
}

# Main script logic
ACTION=$1
SCENARIO=$2

# Validate input
if [[ -z "$ACTION" ]] || [[ -z "$SCENARIO" ]] || [[ ! "$ACTION" =~ ^(start|stop|status)$ ]] || [[ ! "$SCENARIOS" =~ $SCENARIO ]]; then
    print_usage
    exit 1
fi

# Execute requested action for specified scenario
case "$SCENARIO" in
    error)
        control_error_test "$ACTION"
        ;;
    slow)
        control_slow_test "$ACTION"
        ;;
    memory)
        control_memory_test "$ACTION"
        ;;
    cpu)
        control_cpu_test "$ACTION"
        ;;
    db-slow)
        control_db_slow_test "$ACTION"
        ;;
    all)
        control_all_tests "$ACTION"
        ;;
esac

# Print status summary if requested
if [[ "$ACTION" == "status" ]]; then
    echo "Overall Test Status Summary:"
    echo "============================"
    kubectl get pods -l 'app in (error-test,slow-test,memory-test,cpu-test)'
    echo "Running Test Scripts:"
    ps aux | grep -E "generate-(errors|slow-requests|slow-queries).sh" | grep -v grep
fi 