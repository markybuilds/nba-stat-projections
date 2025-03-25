# Monitoring Test Resources Demonstration Environment

This README provides detailed instructions for setting up and managing the demonstration environment for the Monitoring Test Resources project. This environment is specifically designed for the team demonstration and knowledge transfer session scheduled for July 3, 2024.

## Overview

The demonstration environment consists of:

1. A dedicated Kubernetes namespace (`monitoring-test-demo`)
2. Test resources for all monitoring test categories
3. Database configuration for database performance tests
4. Alert rules and monitoring dashboards
5. Scheduled tests via CronJobs
6. Access controls for demonstration participants

## Quick Start Guide

For a quick and automated setup, run:

```cmd
setup-demo-environment.cmd
```

This script will guide you through the complete setup process, including:
- Creating the Kubernetes namespace with proper permissions
- Deploying all test resources
- Configuring database settings (optional)
- Validating the setup (optional)

## Detailed Setup Instructions

If you prefer to set up the environment step by step, follow these instructions:

### 1. Create the Demonstration Namespace

```cmd
create-demo-namespace.cmd
```

This script creates:
- The `monitoring-test-demo` namespace
- Service account for demonstration
- RBAC permissions
- Network policies
- Prometheus scrape configuration
- Demo-specific labels

### 2. Deploy Test Resources

```cmd
deploy-demo-resources.cmd
```

This script deploys:
- Error generation test resources
- Slow response test resources
- Memory usage test resources
- CPU utilization test resources
- Database performance test resources
- Alert rules
- Monitoring dashboard configuration
- Scheduled test CronJob

### 3. Configure Database

```cmd
configure-database.cmd
```

This script guides you through:
- Setting up database connection parameters
- Testing database connectivity
- Creating test tables if needed
- Configuring slow query parameters
- Verifying database test functionality

### 4. Validate Environment

```cmd
validate-tests.cmd all
```

This script performs validation of:
- All deployed test resources
- Alert configurations
- Database connectivity and tests
- Scheduled jobs

## Demonstration Preparation Checklist

Before the demonstration session, ensure you complete all items on the [Demonstration Environment Preparation Checklist](demo_environment_checklist.md).

## Resource Configuration

The default configuration for test resources is:

| Test Category | Parameter | Default Value |
|---------------|-----------|---------------|
| Error Generation | Error Rate | 20% |
| Slow Response | Response Delay | 2000ms |
| Memory Usage | Memory Usage | 256MB |
| CPU Utilization | CPU Usage | 50% |
| Database | Query Timeout | 30s |

You can modify these values by editing the `deploy-demo-resources.cmd` script before running it.

## Alert Thresholds

The following alert thresholds are configured:

| Alert Name | Threshold | Duration |
|------------|-----------|----------|
| HighErrorRate | 10% | 1 minute |
| SlowResponseTime | 1000ms | 1 minute |
| HighMemoryUsage | 200MB | 1 minute |
| HighCpuUsage | 40% | 1 minute |
| DatabaseQueryTimeout | 20s | 1 minute |

## Participant Access

For the demonstration, temporary read-only access credentials are created for participants. The `create-demo-namespace.cmd` script generates a kubeconfig file that can be distributed to participants.

## Demonstration Reset Procedure

To reset the demonstration environment to its initial state:

1. Run `create-demo-namespace.cmd` with the reset option
2. Run `deploy-demo-resources.cmd` to redeploy resources
3. Run `configure-database.cmd` to reconfigure database settings
4. Run `validate-tests.cmd all` to verify everything is working correctly

## Cleaning Up

To completely remove the demonstration environment after the session:

```cmd
kubectl delete namespace monitoring-test-demo
```

This will remove all resources, permissions, and configurations associated with the demonstration.

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure you have sufficient permissions to create namespaces and resources in the Kubernetes cluster.

2. **Database Connection Issues**: Verify database connection parameters and ensure the database server is accessible from the Kubernetes cluster.

3. **Resource Limitations**: The demonstration environment requires minimal resources. If you encounter resource constraints, reduce the replica counts in the deployment configurations.

4. **Alert Configuration**: If alerts are not triggering as expected, verify the Prometheus configuration and ensure metrics are being correctly scraped.

### Getting Help

If you encounter issues during setup or demonstration, contact:

- Sarah Johnson (Project Lead): sarah.johnson@example.com
- Mark Davis (DevOps): mark.davis@example.com
- Technical Support: support@example.com

## Additional Resources

- [Main Project README](../README.md)
- [Quick Reference Guide](QUICK_REFERENCE.md)
- [Demonstration Environment Checklist](demo_environment_checklist.md)
- [Pre-deployment Meeting Agenda](pre_deployment_meeting_agenda.md)
- [Presentation Slides](presentation_slides.pptx) 