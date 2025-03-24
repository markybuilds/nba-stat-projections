# Supabase Setup and API Testing Guide

This guide will help you set up a Supabase database for the NBA Player Stat Prop Projection System and test the NBA API integration.

## Prerequisites

- Supabase account (free tier is sufficient)
- Python 3.10+ with pip
- Backend virtual environment set up and dependencies installed

## Setting Up Supabase

### 1. Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for a free account
2. Verify your email and complete the registration process

### 2. Create a New Project

1. Log in to the Supabase dashboard
2. Click "New Project"
3. Enter a project name (e.g., "nba-stat-projections")
4. Set a secure database password (save this for later)
5. Choose a region closest to your location
6. Click "Create new project"

### 3. Initialize Database Schema

1. Once your project is created, navigate to the SQL Editor in the Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `nba-stat-projections/backend/app/data/init_schema.sql`
4. Run the query to create all required tables, indexes, and views

### 4. Get API Credentials

1. Go to Project Settings > API
2. Copy the "URL" value (this is your SUPABASE_URL)
3. Copy the "anon" key (this is your SUPABASE_KEY)

### 5. Update Environment Variables

1. In the backend directory, open the `.env` file
2. Update the following values:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   ```

## Testing the Database Connection

We've created test scripts to verify that the database is correctly set up and that the NBA API integration works. Follow these steps to run the tests:

### 1. Test Database Connection

1. Navigate to the backend directory:
   ```
   cd nba-stat-projections/backend
   ```

2. Run the Supabase test script:
   ```
   python test_supabase.py
   ```

3. This script will:
   - Verify the connection to Supabase
   - Create sample teams
   - Create a sample player
   - Create a sample game
   - Verify that the data can be retrieved

### 2. Test NBA API Integration

1. Navigate to the backend directory:
   ```
   cd nba-stat-projections/backend
   ```

2. Run the NBA API test script:
   ```
   python test_nba_api.py
   ```

3. This script will:
   - Retrieve team data from the NBA API
   - Retrieve scoreboard data for yesterday's games
   - Retrieve player information for LeBron James
   - Store sample team data in the Supabase database

## Troubleshooting

### Database Connection Issues

- Verify that your Supabase URL and key are correct in the `.env` file
- Ensure that the SQL schema was executed successfully
- Check for any network connectivity issues

### API Integration Issues

- The NBA API has rate limits. If you hit these limits, the tests will automatically pause between requests
- Verify that the NBA API is operational
- Check that the API client is correctly configured

### Supabase Permissions

- By default, RLS (Row Level Security) policies might block data insertion
- You may need to disable RLS temporarily for testing purposes:
  1. Go to the Supabase dashboard
  2. Navigate to the Authentication > Policies section
  3. Find the tables and temporarily disable RLS, or create appropriate policies

## Next Steps

After successfully setting up Supabase and testing the NBA API integration, you can:

1. Implement the data import jobs to regularly fetch NBA data
2. Develop the projection algorithms using real data
3. Set up the frontend application to display projections
4. Implement user authentication if required

## Resources

- [NBA API Documentation](https://github.com/swar/nba_api)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Project README](/README.md) 