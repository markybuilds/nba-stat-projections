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

## Project Wrap-Up Process

### Project Wrap-Up Workflow
The project follows a structured wrap-up process that consists of two main phases:

1. **Planning and Setup Phase**
   - Team demonstration planning (emails, scheduling, tracking)
   - Demonstration environment preparation (checklist, scripts, README)
   - Production deployment preparation (coordination, meeting agenda)
   - Documentation and planning (action plan, timeline, checklists)

2. **Execution Phase**
   - Team demonstration execution (calendar invites, environment setup, demonstration)
   - Production deployment (pre-deployment meeting, deployment, verification)
   - Project closure (documentation package, sign-off, archiving)

### Key Patterns

#### Task Organization
- Completed tasks are moved to the "Completed Tasks" section in tasks.md
- Completed phases are archived in docs/archive/completed_tasks.md
- Current focus is maintained in the "CURRENT FOCUS" section of tasks.md
- Task dependencies and priorities are clearly documented

#### Documentation Standards
- Checklist-based approach for activity tracking
- Comprehensive README files for all major components
- Helper scripts for repetitive or complex tasks
- Detailed step-by-step instructions

#### Phase Transition Process
1. Complete all tasks in the current phase
2. Verify task completion with verification checklist
3. Archive completed tasks in docs/archive/completed_tasks.md
4. Update progress.md with phase transition summary
5. Update activeContext.md with current focus
6. Update tasks.md to reflect new phase priorities

#### Knowledge Transfer Approach
- Email-based coordination with all stakeholders
- Calendly poll for optimal date selection
- Response tracking and analysis
- Comprehensive preparation materials
- Dedicated demonstration environment
- Structured demonstration agenda
- Feedback and question documentation 