# End-to-End Testing Suite

This directory contains the end-to-end test suite for the NBA Statistics and Projections System. The tests are written using Playwright and cover all major functionality of the application.

## Test Structure

The test suite is organized into the following categories:

- `auth.spec.ts`: Authentication and authorization tests
- `dashboard.spec.ts`: Dashboard functionality and data visualization tests
- `games.spec.ts`: Game information and live updates tests
- `settings.spec.ts`: User preferences and settings tests
- `mobile.spec.ts`: Mobile-specific functionality tests
- `accessibility.spec.ts`: Accessibility compliance tests
- `performance.spec.ts`: Performance and optimization tests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up test environment variables:
```bash
cp .env.example .env.test
# Edit .env.test with your test environment values
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
npm run test:auth
npm run test:dashboard
npm run test:games
npm run test:settings
npm run test:mobile
npm run test:accessibility
npm run test:performance
```

### UI Mode
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode (with browser visible)
```bash
npm run test:headed
```

## Test Configuration

The test configuration is defined in `playwright.config.ts` and includes:

- Multiple browser configurations (Chromium, Firefox, WebKit)
- Mobile device emulation
- Viewport settings
- Network conditions
- Test timeouts and retries
- Screenshot and video capture settings

## Test Data

Test data is managed through:

- `global-setup.ts`: Sets up test environment and data before tests
- `global-teardown.ts`: Cleans up test data after tests
- Fixtures in `tests/fixtures/`

## Continuous Integration

The test suite is integrated with CI/CD and runs on:
- Pull request creation
- Push to main branch
- Daily scheduled runs

## Performance Testing

Performance tests measure:
- Page load times
- Time to interactive
- Network request optimization
- DOM size and complexity
- Memory usage
- FPS during animations
- Data loading efficiency

## Accessibility Testing

Accessibility tests verify:
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- Semantic HTML structure

## Mobile Testing

Mobile tests cover:
- Responsive layouts
- Touch interactions
- Gesture support
- Mobile-specific features
- Offline functionality

## Best Practices

1. Keep tests independent and isolated
2. Use data-testid attributes for element selection
3. Avoid flaky tests by using proper wait conditions
4. Clean up test data after each test
5. Use page objects for common operations
6. Document complex test scenarios
7. Maintain test stability through proper assertions

## Debugging Tests

1. Use `test:debug` script for step-by-step debugging
2. Check test videos in `test-results/` directory
3. Review screenshots in `test-results/` directory
4. Use `console.log` with `page.evaluate()`
5. Check network logs in debug mode

## Common Issues

1. Timing issues
   - Solution: Use proper wait conditions
   - Example: `await page.waitForSelector()`

2. Network flakiness
   - Solution: Implement retry logic
   - Example: Use `test.retry()` or custom retry logic

3. Test isolation
   - Solution: Clean up test data
   - Example: Use `test.afterEach()`

4. Mobile emulation
   - Solution: Use correct device metrics
   - Example: Configure in `playwright.config.ts`

## Contributing

1. Follow the test structure
2. Add proper documentation
3. Include test data setup
4. Write clear test descriptions
5. Review test stability
6. Update README as needed

## Maintenance

1. Regular updates:
   - Update Playwright version
   - Review test stability
   - Update test data
   - Check for deprecated APIs

2. Performance monitoring:
   - Track test execution time
   - Monitor resource usage
   - Review test coverage

3. Documentation:
   - Keep README updated
   - Document new features
   - Update troubleshooting guide 