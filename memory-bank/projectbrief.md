# Project Brief

## Project Overview
NBA Player Stat Prop Projection System - A free, data-driven NBA basketball player statistical projection system for the 2024-2025 season that provides daily projections for upcoming games.

## Requirements
- No mock data - All data must come from live/authentic sources
- Daily projections - System must update projections for each day's games
- Free infrastructure - Utilize free-tier services where possible
- Seamless data pipeline - Robust integration between frontend and backend
- Sub-second response time for projection queries
- Data freshness - Updates processed by 8AM ET daily
- 99% uptime during NBA season
- Secure API key management

## Stakeholders
- Basketball fans and sports bettors interested in player projections
- Project developer/maintainer
- End-users accessing the projection dashboard

## Timeline
1. Phase 1: Data collection MVP (NBA API integration)
2. Phase 2: Projection algorithms
3. Phase 3: Frontend dashboard
4. Phase 4: Daily automation

## Constraints
- Must use free-tier services where possible
- Development environment must be Windows 10 compatible
- NBA API rate limits
- Supabase free tier limitations
- Limited development resources

## Success Metrics
- Accuracy of statistical projections compared to actual results
- System stability and uptime during NBA season
- Daily data refresh completed successfully by 8AM ET
- User engagement with projection dashboard

## Supabase Setup Instructions

1. Create Supabase Account
   - Go to [Supabase](https://supabase.com/) and sign up for a free account
   - Verify your email and complete the registration process

2. Create a New Project
   - Log in to the Supabase dashboard
   - Click "New Project"
   - Enter a project name (e.g., "nba-stat-projections")
   - Set a secure database password (save this for later)
   - Choose a region closest to your location
   - Click "Create new project"

3. Initialize Database Schema
   - Once your project is created, navigate to the SQL Editor in the Supabase dashboard
   - Create a new query
   - Copy and paste the contents of `nba-stat-projections/backend/app/data/init_schema.sql`
   - Run the query to create all required tables, indexes, and views

4. Get API Credentials
   - Go to Project Settings > API
   - Copy the "URL" value (this is your SUPABASE_URL)
   - Copy the "anon" key (this is your SUPABASE_KEY)

5. Update Environment Variables
   - In the backend directory, open the `.env` file
   - Update the following values:
     ```
     SUPABASE_URL=your_project_url
     SUPABASE_KEY=your_anon_key
     ```

6. Test Database Connection
   - Run the application to verify it can connect to the database
   - Check for any connection errors and troubleshoot as needed

## Development Guidelines

- Follow PEP 8 style guidelines for Python code
- Use TypeScript for frontend development
- Document all functions and classes
- Write unit tests for critical functionality
- Use meaningful commit messages

## Resources

- [NBA API Documentation](https://github.com/swar/nba_api)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs) 