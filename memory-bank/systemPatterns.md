# System Patterns

## Architecture Overview
The NBA Player Stat Prop Projection System follows a three-tier architecture:
1. **Data Layer**: NBA API data source and Supabase PostgreSQL database
2. **Backend Layer**: FastAPI application for data processing and projection algorithms
3. **Frontend Layer**: Next.js application with Shadcn UI components for user interface

## Key Technical Decisions
- Using FastAPI for backend due to its high performance and Python compatibility
- Selecting Next.js for frontend to enable server-side rendering and API routes
- Leveraging Supabase for database functionality on free tier
- Implementing daily batch processing for projections rather than real-time
- Hosting on Vercel to take advantage of free tier and serverless functions
- Using the nba_api Python library as primary data source

## Design Patterns
- **Repository Pattern**: For data access and abstraction
- **Service Layer Pattern**: For business logic and projection algorithms
- **MVC Pattern**: For frontend structure and state management
- **Factory Pattern**: For creating projection model instances
- **Observer Pattern**: For updating UI based on data changes
- **Caching Pattern**: For optimizing API responses and database queries

## Component Structure
- **Backend Components**:
  - Data fetchers (NBA API integration)
  - Data processors (statistical calculations)
  - Projection algorithms
  - API endpoints
  - Database models

- **Frontend Components**:
  - Dashboard layout
  - Player projection cards
  - Filtering interface
  - Historical comparison views
  - Game schedule display

## Data Flow
```
1. Daily NBA Data Collection → 
2. Data Processing & Storage → 
3. Projection Algorithm Execution → 
4. Database Storage → 
5. API Access → 
6. Frontend Display
```

- NBA API provides raw game and player data
- Backend processes data and generates projections
- Results stored in Supabase database
- Frontend fetches projections via API
- User interacts with data through the dashboard interface

## Technical Debt
- Initial implementation may use simpler projection algorithms with plans to enhance later
- Database schema may need optimization as data volume grows
- Caching strategy will need refinement based on actual usage patterns
- Frontend components may start with basic styling before enhancement
- Automated testing coverage may be incomplete in early phases 