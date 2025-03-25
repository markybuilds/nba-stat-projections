# Local Development Guide

## Development Environment Setup

### Prerequisites
- Node.js 18.x or higher
- Python 3.11 or higher
- Docker Desktop
- Git
- VS Code (recommended)
- Supabase CLI
- pnpm (optional, but recommended)

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Python
- Docker
- GitLens
- Error Lens
- Todo Tree

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nba-stat-projections.git
cd nba-stat-projections
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set Up Local Environment
```bash
# Copy environment files
cp .env.example .env.local
cp .env.example .env

# Configure local environment variables
# Edit .env.local and .env with your local settings
```

### 4. Start Local Services
```bash
# Start Supabase
supabase start

# Start development servers
pnpm dev        # Frontend
pnpm dev:api    # Backend
```

## Development Workflow

### Code Organization
```
├── app/                 # Next.js app directory
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── styles/        # Global styles
│   └── types/         # TypeScript types
├── api/                # FastAPI backend
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
├── tests/              # Test files
│   ├── e2e/           # End-to-end tests
│   ├── integration/   # Integration tests
│   └── unit/          # Unit tests
└── docs/               # Documentation
```

### Branch Naming Convention
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or modifications

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build tasks, etc.

### Development Commands
```bash
# Frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode

# Backend
pnpm dev:api      # Start API server
pnpm test:api     # Run API tests
pnpm migrate      # Run database migrations
pnpm seed         # Seed database with test data
```

## Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test

# Run tests with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e
```

### Writing Tests
- Unit tests: Use Jest and React Testing Library
- API tests: Use pytest
- E2E tests: Use Playwright

## Database Management

### Migrations
```bash
# Create new migration
pnpm migrate:create name_of_migration

# Run migrations
pnpm migrate:up

# Rollback migration
pnpm migrate:down
```

### Seeding Data
```bash
# Seed database with test data
pnpm seed

# Reset database and reseed
pnpm db:reset
```

## Common Tasks

### Adding a New Feature
1. Create feature branch
2. Implement feature
3. Add tests
4. Update documentation
5. Create pull request

### Fixing a Bug
1. Create fix branch
2. Add failing test
3. Fix bug
4. Verify tests pass
5. Create pull request

### Updating Dependencies
```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Update specific package
pnpm update package-name
```

## Troubleshooting

### Common Issues

#### Frontend
- **Issue**: Hot reload not working
  - Solution: Clear `.next` directory and restart server

- **Issue**: Type errors
  - Solution: Run `pnpm type-check` and fix issues

#### Backend
- **Issue**: Database connection error
  - Solution: Check Supabase is running and credentials are correct

- **Issue**: API not responding
  - Solution: Check logs and ensure all services are running

### Debug Tools
- React DevTools
- Redux DevTools
- Network tab in browser
- VS Code debugger
- `pnpm debug` command

## Best Practices

### Code Style
- Follow ESLint rules
- Use TypeScript strictly
- Write meaningful comments
- Keep components small and focused
- Use proper error handling

### Performance
- Lazy load components
- Optimize images
- Use proper caching
- Monitor bundle size
- Profile API endpoints

### Security
- Never commit secrets
- Validate all inputs
- Use proper authentication
- Follow security guidelines
- Regular dependency updates

## Additional Resources
- [Project Documentation](../README.md)
- [API Documentation](../api/README.md)
- [Component Library](../app/components/README.md)
- [Testing Guide](../tests/README.md)
- [Style Guide](../docs/style-guide.md) 