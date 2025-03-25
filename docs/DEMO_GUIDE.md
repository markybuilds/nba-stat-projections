# NBA Stat Projections - Demonstration Environment Guide

This guide provides instructions for setting up and running the NBA Stat Projections demonstration environment. The demonstration environment is designed to showcase the features and capabilities of the NBA Stat Projections system for stakeholders and team members.

## Table of Contents

1. [Setup Requirements](#setup-requirements)
2. [Environment Setup](#environment-setup)
3. [Starting the Services](#starting-the-services)
4. [Using the Demo Environment](#using-the-demo-environment)
5. [Available Features](#available-features)
6. [Demo Credentials](#demo-credentials)
7. [Troubleshooting](#troubleshooting)
8. [Presentation Tips](#presentation-tips)

## Setup Requirements

Before setting up the demonstration environment, ensure you have the following prerequisites:

- Python 3.8 or higher
- Git (for cloning the repository)
- Access to the project repository
- Basic understanding of command-line operations
- A modern web browser (Chrome, Firefox, or Edge recommended)

## Environment Setup

Follow these steps to set up the demonstration environment:

1. Clone the repository (if you haven't already):
   ```
   git clone https://github.com/your-organization/nba-stat-projections.git
   cd nba-stat-projections
   ```

2. Run the setup script:
   ```
   python scripts/setup_demo_env.py
   ```

   The setup script will:
   - Create necessary configuration files
   - Set up the demonstration database
   - Load sample data
   - Configure API services
   - Set up caching
   - Configure the frontend
   - Verify that everything is set up correctly

   Optional flags:
   - `--force`: Force setup even if environment is already configured
   - `--skip-verify`: Skip verification step

3. Review the setup output for any warnings or errors

## Starting the Services

The demonstration environment consists of two main services:

### 1. API Server

Start the API server with:

```
python scripts/start_api.py
```

Optional flags:
- `--port PORT`: Specify a custom port (default: 8000)

The API server provides:
- Player and team data endpoints
- Projection calculation endpoints
- Statistical analysis endpoints
- Authentication and authorization

### 2. Frontend Server

Start the frontend server with:

```
python scripts/start_frontend.py
```

Optional flags:
- `--port PORT`: Specify a custom port (default: 3000)
- `--api-port PORT`: Specify the API server port (default: 8000)
- `--open-browser`: Automatically open the browser

The frontend server provides:
- Web interface for viewing data and projections
- Interactive dashboards
- Visualization tools
- User authentication

## Using the Demo Environment

Once both services are running, access the frontend by opening a web browser and navigating to:

```
http://localhost:3000
```

### Demo Workflow

Here's a recommended demonstration workflow:

1. **Start with the Dashboard**: Show the overview of key metrics and statistics
2. **Explore Player Data**: Navigate to the Players section to show individual player statistics and projections
3. **Team Analysis**: Move to the Teams section to demonstrate team performance metrics
4. **Projection Tools**: Showcase the projection generation capabilities
5. **Comparison Features**: Demonstrate the player and team comparison tools
6. **Reporting**: Show the reporting and export capabilities

## Available Features

The demonstration environment includes the following features:

1. **Player Statistics Dashboard**
   - View detailed player statistics
   - Filter by position, team, and performance metrics
   - Sort and compare player performance

2. **Team Performance Analysis**
   - View team standings and statistics
   - Analyze team strengths and weaknesses
   - Compare teams across different metrics

3. **Statistical Projections**
   - View player and team projections
   - Understand projection methodology
   - See confidence intervals for projections

4. **Player Comparison Tool**
   - Compare multiple players side-by-side
   - Visualize differences in performance
   - Analyze historical trends

5. **Custom Projection Generator**
   - Create custom projections based on specific parameters
   - Adjust confidence thresholds
   - Export custom projections

6. **Reporting and Export Tools**
   - Generate PDF reports
   - Export data to CSV/Excel
   - Create visualization snapshots

## Demo Credentials

During the setup process, the system generates the following demo credentials:

- **Username**: demo_user
- **Password**: nba_stats_2024
- **API Key**: demo_api_key_123456

These credentials are pre-configured in the demonstration environment and can be used to access all features.

## Troubleshooting

If you encounter issues with the demonstration environment, try the following:

### API Server Issues

- Check that the environment file (.env) exists
- Verify the API server is running on the expected port
- Check the console for error messages
- Restart the API server with `python scripts/start_api.py`

### Frontend Issues

- Ensure the API server is running before starting the frontend
- Check that you're using the correct URL (http://localhost:3000 by default)
- Clear your browser cache if you see outdated information
- Restart the frontend server with `python scripts/start_frontend.py`

### Data Issues

- If sample data appears incorrect, rerun the setup script with the force flag:
  ```
  python scripts/setup_demo_env.py --force
  ```

## Presentation Tips

When presenting the demonstration to stakeholders:

1. **Prepare in advance**: Have both servers running before the presentation
2. **Focus on value**: Highlight how the system solves business problems
3. **Show realistic scenarios**: Use the sample data to demonstrate real-world use cases
4. **Highlight accuracy**: Emphasize the projection accuracy and confidence metrics
5. **Be interactive**: Allow stakeholders to suggest queries or scenarios to explore
6. **Explain limitations**: Be honest about what the demo can and cannot show
7. **Gather feedback**: Use the demonstration as an opportunity to gather stakeholder input

## Next Steps After Demo

After the demonstration:

1. Document any feedback received
2. Identify areas for improvement
3. Prioritize feature requests
4. Schedule follow-up meetings as needed
5. Plan for production deployment

---

For any additional questions or support, please contact the development team at dev-team@example.com. 