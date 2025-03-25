#!/bin/bash

# Set environment variables for testing
export API_BASE_URL="http://localhost:3000/api"
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="test-password"

# Function to run k6 test with proper output
run_k6_test() {
    local test_file=$1
    local test_name=$2
    
    echo "Running $test_name..."
    k6 run "$test_file" --out json=results-$test_name.json
    
    # Generate HTML report using k6-reporter
    k6-reporter results-$test_name.json
}

# Create results directory
mkdir -p performance-results

# Run load test
run_k6_test "load-test.js" "load"

# Run stress test
run_k6_test "stress-test.js" "stress"

# Move results to results directory
mv results-*.json performance-results/
mv k6-report.html performance-results/

echo "Performance tests completed. Results are in the performance-results directory." 