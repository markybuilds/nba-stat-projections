# NBA Stats Projections - Offline Demo Package

## Overview

This package contains all necessary files to conduct an offline demonstration of the NBA Stats Projections application. It is designed to be used in environments without internet access or as a backup in case of technical difficulties during the live demonstration.

## Package Contents

- **docs/**: Documentation files including demonstration guide, presentation materials, and FAQs
- **scripts/**: Scripts for setting up and running the demonstration environment
- **data/**: Sample data files for players, teams, and statistics
- **screenshots/**: Pre-captured screenshots of the application for reference
- **OFFLINE_DEMO_README.md**: This file

## Setup Instructions

1. Extract the package to a location with sufficient disk space
2. Ensure Python 3.8+ is installed on the system
3. Run the setup script: `python scripts/setup_demo_env.py --offline`
4. Start the simulated API server: `python scripts/start_api.py --offline`
5. Start the simulated frontend: `python scripts/start_frontend.py --offline`

## Offline Mode Features

When running in offline mode, the application will:
- Use pre-loaded sample data instead of fetching from a database
- Display static screenshots for dynamic content
- Simulate API calls with canned responses
- Show notification banners indicating offline status

## Demonstration Flow

1. **Introduction**: Use the presentation slides in docs/PRESENTATION_SLIDES.md
2. **Application Overview**: Reference the screenshots in the screenshots directory
3. **Feature Demonstration**: Follow the script in docs/DEMONSTRATION_SCRIPT.md
4. **Q&A Session**: Use the FAQs in docs/DEMONSTRATION_FAQ.md for common questions

## Fallback Plan

If the offline scripts cannot be executed:
1. Navigate to the screenshots directory
2. Present each screenshot with explanations from the demonstration script
3. Reference the documentation for detailed information

## Important Notes

- This package is self-contained and does not require internet access
- Replace placeholder screenshots with actual application screenshots before use
- Test the entire offline package before the demonstration
- Ensure all team members are familiar with the offline demonstration process

## Package Information

- Created: 2025-03-25 13:35:39
- Version: 1.0
- Contact: NBA Stats Project Team
- Documentation: See files in docs/ directory

