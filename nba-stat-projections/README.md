# NBA Stat Projections System

![NBA Stat Projections](https://img.shields.io/badge/NBA-Stat%20Projections-blue)
![Version](https://img.shields.io/badge/version-0.1.0-green)
![Status](https://img.shields.io/badge/status-beta-orange)

A comprehensive system for generating and displaying statistical projections for NBA players and games. This project provides both a FastAPI backend for data processing and a Next.js frontend for visualization.

## System Architecture

The NBA Stat Projections system consists of two main components:

1. **Backend API (FastAPI)**: Handles data retrieval, statistical analysis, and projection generation
2. **Frontend Application (Next.js)**: Provides user interface for viewing and interacting with projections

### Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │ ◄─────► │  FastAPI        │ ◄─────► │  NBA API        │
│  Frontend       │         │  Backend        │         │  (External)     │
│                 │         │                 │         │                 │
└─────────────────┘         └───────┬─────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │                 │
                            │  Supabase       │
                            │  Database       │
                            │                 │
                            └─────────────────┘
```

## Tech Stack

### Backend
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Data Source**: NBA API
- **Libraries**:
  - SQLAlchemy (Database ORM)
  - Pydantic (Data validation)
  - NumPy/Pandas (Statistical analysis)
  - Requests (HTTP client)

### Frontend
- **Language**: TypeScript
- **Framework**: Next.js 14+
- **UI**: Tailwind CSS with Shadcn UI
- **State Management**: React Hooks
- **Data Visualization**: Custom SVG charts
- **API Client**: Custom TypeScript client

## Key Features

- **Data Retrieval**: Automated retrieval of NBA data with rate limiting
- **Statistical Analysis**: Advanced statistical models for projection generation
- **Database Management**: Efficient storage and retrieval of NBA data and projections
- **User Interface**: Responsive, accessible interface for viewing projections
- **Filtering & Sorting**: Client-side data filtering for quick analysis
- **Data Visualization**: Interactive charts for player performance trends
- **Documentation**: Comprehensive API documentation and usage guides

## Project Structure

```
nba-stat-projections/
├── backend/                  # FastAPI backend application
│   ├── app/                  # Application code
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core functionality (config, security)
│   │   ├── data/             # Data processing and NBA API client
│   │   ├── db/               # Database models and repository
│   │   ├── models/           # Pydantic models for validation
│   │   └── services/         # Business logic services
│   ├── tests/                # Test suite
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utility functions and API client
│   │   ├── types/            # TypeScript types and interfaces
│   │   └── styles/           # CSS and Tailwind configuration
│   ├── package.json          # Node.js dependencies
│   └── tsconfig.json         # TypeScript configuration
└── README.md                 # This file
```

## Data Flow

1. **Data Collection**:
   - NBA API data is retrieved via the backend API client
   - Data is processed and transformed to fit our database schema
   - Player statistics are analyzed for projection generation

2. **Projection Generation**:
   - Historical player performance is analyzed
   - Statistical models calculate projected performance
   - Confidence scores are generated based on data quality
   - Projections are stored in the database

3. **Data Access**:
   - Frontend requests data from backend API endpoints
   - Backend retrieves and serves formatted data
   - Frontend processes and displays data with visualizations
   - Users can filter, sort, and interact with the data

## Getting Started

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nba-stat-projections.git
   cd nba-stat-projections/backend
   ```

2. Set up virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up Supabase database:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Update `.env` with your Supabase credentials

4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

5. Access API documentation:
   - Open your browser to `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Copy `.env.example` to `.env.local`
   - Update with your backend API URL

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access the application:
   - Open your browser to `http://localhost:3000`

## API Documentation

The backend API provides the following endpoints:

- `/api/health`: Health check endpoint
- `/api/players`: List of players with available projections
- `/api/players/{player_id}`: Details for a specific player
- `/api/games`: List of games with available projections
- `/api/games/{game_id}`: Details for a specific game
- `/api/projections`: Player projections for specific criteria
- `/api/projections/today`: Projections for today's games

For detailed API documentation, access the Swagger UI at `/docs` when running the backend server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NBA API for providing the data source
- FastAPI for the efficient backend framework
- Next.js for the powerful frontend framework
- Supabase for the database infrastructure 