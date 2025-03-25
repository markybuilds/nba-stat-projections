# Technical Context

## Technology Stack
- **Data Sources**: NBA API (Python library)
- **Database**: Supabase (PostgreSQL) for persistent storage
- **Backend**: FastAPI
- **Frontend**: Next.js with Shadcn UI components
- **Hosting**: Vercel for frontend and API routes
- **Version Control**: Git/GitHub
- **CI/CD**: GitHub Actions (free tier)

## Development Environment
- Windows 10 operating system
- Python virtual environment (venv)
- Node.js and npm for frontend development
- Visual Studio Code as primary IDE
- Supabase local development setup if needed
- Vercel CLI for deployment
- GitHub for source control and CI/CD

## Build Process
- Backend: Python FastAPI application built and deployed to Vercel or alternative hosting
- Frontend: Next.js application built and deployed to Vercel
- Database: Supabase instance with appropriate schema setup
- CI/CD: GitHub Actions for automated testing and deployment
- Local development using virtual environments for Python dependencies

## Testing Strategy
- Unit tests for projection algorithms and data processing functions
- Integration tests for API endpoints and database interactions
- End-to-end tests for critical user flows
- Manual testing of projection accuracy against actual game results
- Performance testing for API response times

## Performance Considerations
- Sub-second response time for projection queries
- Optimized database queries to minimize latency
- Caching strategy to handle NBA API rate limits
- Frontend optimization for fast loading times
- Efficient batch processing for daily projection updates

## Security Requirements
- Secure storage and handling of API keys
- HTTPS for all communications
- Rate limiting to prevent abuse
- No sensitive user data stored in the system
- Supabase security best practices for database access

## Testing Infrastructure

### Code Coverage
- Coverage reporting configured using Istanbul/NYC with Playwright
- Coverage thresholds:
  - Statements: 80%
  - Branches: 70%
  - Functions: 80%
  - Lines: 80%
- Multiple report formats:
  - HTML for visual inspection
  - JSON for programmatic consumption
  - Cobertura XML for CI/CD integration
  - Text for command-line feedback
- Coverage scripts:
  - `npm run test:coverage` - Run tests with coverage
  - `npm run test:coverage:report` - View coverage report
  - `npm run test:coverage:ci` - CI mode with specific reporters

### Test Types
- E2E tests using Playwright
- Visual regression testing
- Accessibility testing
- Performance testing
- API testing
- Mobile-specific testing

## Dependencies
- Playwright for E2E testing
- Istanbul/NYC for code coverage
- Supabase for backend
- Next.js for frontend
- React for UI components
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting 