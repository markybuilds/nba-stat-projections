# NBA Stat Projections - Demonstration Environment

This document provides instructions for setting up and running the demonstration environment for the NBA Statistics Projection System team demonstration on July 3, 2024.

## Prerequisites

- Docker and Docker Compose
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space
- Internet connection for pulling Docker images

## Quick Start

### Setup the Environment

To set up the demonstration environment with default settings:

**On Linux/macOS:**

```bash
# Navigate to the project directory
cd /path/to/nba-stat-projections

# Run the setup script
./scripts/prepare_demo_env.sh
```

**On Windows:**

```cmd
# Navigate to the project directory
cd C:\path\to\nba-stat-projections

# Run the setup script
scripts\prepare_demo_env.bat
```

### Available Options

The setup script supports the following options:

- `--fresh`: Start with a fresh environment (wipes existing data)
- `--sample-data`: Load sample data for demonstration
- `--no-cache`: Disable caching for real-time data display
- `--help`: Display help information

Example:

```bash
./scripts/prepare_demo_env.sh --fresh --sample-data
```

## Accessing the Demonstration

After a successful setup, you can access:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/docs

## Key Demo Components

1. **Real-time Data Updates**: The system demonstrates real-time updates for game scores and player statistics.
2. **Player Projections**: Demonstrates statistical projections with visualization components.
3. **Performance Optimization**: Shows the difference between cached and non-cached data.
4. **Mobile Experience**: The responsive design adapts to different screen sizes.
5. **Authentication**: Demo user accounts are pre-configured for showing user-specific features.

## Demo Accounts

For the demonstration, the following accounts are available:

| Username | Password | Role |
|----------|----------|------|
| demo@example.com | demo123 | User |
| admin@example.com | admin123 | Admin |

## Demonstration Script

The standard demonstration follows this flow:

1. **Introduction** (5 min): Overview of the NBA Stat Projections System
2. **System Architecture** (10 min): Technical overview of components
3. **Feature Walkthrough** (30 min):
   - Dashboard & Real-time Updates
   - Player Projections & Statistics
   - Player Comparison Features
   - Mobile Experience
   - Authentication & User Features
4. **Performance Analysis** (10 min): Caching, optimizations, and metrics
5. **Q&A Session** (20 min): Open discussion and questions
6. **Next Steps and Handover** (15 min): Production deployment planning

## Controlling the Environment

### Stopping the Environment

```bash
cd demo-env
docker-compose down
```

### Viewing Logs

```bash
cd demo-env
docker-compose logs -f
```

### Restarting Services

```bash
cd demo-env
docker-compose restart [service_name]
```

## Troubleshooting

### Common Issues

1. **Ports Already in Use**:
   - Error: `Bind for 0.0.0.0:3000 failed: port is already allocated`
   - Solution: Stop the service using port 3000 or modify the port mapping in docker-compose.yml

2. **Docker Memory Issues**:
   - Symptoms: Services crash or fail to start
   - Solution: Increase Docker memory allocation in Docker Desktop settings

3. **Database Connection Errors**:
   - Error: `Database connection check failed`
   - Solution: Ensure the database service is running with `docker-compose ps`

### Getting Help

If you encounter issues during the demonstration setup:

1. Check the setup logs in `demo-env/setup.log`
2. Run the setup script with a fresh environment: `./scripts/prepare_demo_env.sh --fresh`
3. Contact the development team at support@example.com

## Post-Demonstration Cleanup

To remove the demonstration environment after the session:

```bash
cd demo-env
docker-compose down -v
cd ..
rm -rf demo-env
``` 