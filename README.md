# NBA Stat Projections

A system for generating statistical projections for NBA players using historical data and advanced algorithms.

## Overview

This application provides daily statistical projections for NBA players based on historical performance data. The system uses a weighted moving average algorithm that gives more importance to recent games and applies adjustments for factors like home court advantage.

## Features

- Daily player projections for points, rebounds, assists, and other key stats
- Team and player browsing with detailed information
- Game schedule and results tracking
- Player comparison tool for analyzing statistical differences
- Interactive data visualization for performance trends
- Responsive design for mobile and desktop

## Architecture

The project consists of two main components:

### Backend (FastAPI)

- NBA API client for retrieving game and player data
- Supabase database integration for data storage
- Projection algorithms for statistical analysis
- RESTful API endpoints for data access

### Frontend (Next.js)

- Responsive UI with Shadcn UI components
- Interactive data visualization
- Player comparison tools
- Team and game browsing interfaces

## Setup Guide

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker and Docker Compose (optional for containerized setup)
- Supabase account and project
- NBA API access

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and NBA API credentials
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup (Optional)

For a containerized development environment:

1. From the project root, start services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Access the services at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying the application to production environments using Docker, Kubernetes, and CI/CD pipelines.

## Notification Sounds

The application supports notification sounds for real-time alerts. To enable this functionality:

1. Create a notification sound file named `notification.mp3`
2. Place it in the `frontend/public/sounds/` directory

You can obtain free notification sounds from sites like:
- [Notification Sounds](https://notificationsounds.com/)
- [Pixabay](https://pixabay.com/sound-effects/search/notification/)
- [Mixkit](https://mixkit.co/free-sound-effects/notification/)

The recommended sound file should be:
- Short (1-2 seconds)
- Clear and distinctive
- Appropriate for notifications
- MP3 format
- Small file size (under 100KB)

If the sound file is not present, the application will silently fail without affecting functionality.

## License

MIT