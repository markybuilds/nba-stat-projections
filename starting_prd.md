Here's the optimized Product Requirements Document (PRD) in Markdown format:

```markdown
# NBA Player Stat Prop Projection System - PRD

## Overview
Build a free, data-driven NBA basketball player stat prop projection system for the 2024-2025 season that provides daily projections for upcoming games.

## Key Requirements
- **No mock data**: All data must come from live/authentic sources
- **Daily projections**: System must update projections for each day's games
- **Free infrastructure**: Utilize free-tier services where possible
- **Seamless data pipeline**: Robust integration between frontend and backend

## Technical Specifications

### Data Layer
- **Primary Data Source**: `nba_api` (Python library)
- **Database**: 
  - Supabase (PostgreSQL) for persistent storage if needed
  - Consider Supabase free tier limitations

### Backend
- **Framework**: FastAPI
- **Hosting Options**:
  - Preferred: Vercel (API routes)
  - Alternative: Render (if needing dedicated API hosting)
- **Data Processing**:
  - Stat calculation algorithms
  - Daily batch processing of projections

### Frontend
- **Framework**: Next.js
- **UI Components**: Shadcn
- **Hosting**: Vercel
- **Features**:
  - Daily projection dashboard
  - Player/game filters
  - Historical performance views

### Infrastructure
- **Development Environment**: Windows 10 compatible
- **Deployment Tools**:
  - Vercel CLI
  - Supabase local setup (if needed)
- **CI/CD**: GitHub Actions (free tier)

## Data Pipeline
```
Frontend (Next.js) → Backend (FastAPI) → NBA API/Supabase
```

## Non-Functional Requirements
1. **Performance**: Sub-second response time for projection queries
2. **Data Freshness**: Updates processed by 8AM ET daily
3. **Reliability**: 99% uptime during NBA season
4. **Security**: API keys properly secured

## Milestones
1. **Phase 1**: Data collection MVP (NBA API integration)
2. **Phase 2**: Projection algorithms
3. **Phase 3**: Frontend dashboard
4. **Phase 4**: Daily automation

## Risks & Mitigation
| Risk | Mitigation Strategy |
|------|----------------------|
| NBA API rate limits | Implement caching layer |
| Free tier limitations | Monitor usage, optimize queries |
| Data accuracy issues | Build validation checks |
| Windows development constraints | Use WSL2 for Linux compatibility |

## Open Questions
1. Will Supabase free tier provide sufficient database capacity?
2. Does NBA API provide all required stats for prop projections?
3. What projection models will yield most accurate results?
```