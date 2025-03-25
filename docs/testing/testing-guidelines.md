# Testing Guidelines for Contributors

## Overview

This document provides comprehensive guidelines for contributing to the NBA Stats Projections testing suite. It covers best practices, standards, and procedures for all types of testing.

## Test Categories

### 1. API Integration Tests
- Use the `tests/e2e/api.spec.ts` file for API tests
- Follow the established pattern for test organization
- Include both happy path and error cases
- Test rate limiting and error handling
- Verify response structures match API contracts

Example:
```typescript
describe('Players API', () => {
  test('should return paginated list of players', async () => {
    const response = await api.get('/players?page=1&limit=10');
    expect(response.status).toBe(200);
    expect(response.data.players).toHaveLength(10);
    expect(response.data.pagination).toBeDefined();
  });
});
```

### 2. Visual Regression Tests
- Use the `tests/e2e/visual.spec.ts` file
- Create baseline screenshots for new components
- Test across multiple viewports
- Include dark/light theme variations
- Document visual testing procedures

Example:
```typescript
test('dashboard should match baseline in both themes', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-light.png');
  await page.click('[data-testid="theme-toggle"]');
  await expect(page).toHaveScreenshot('dashboard-dark.png');
});
```

### 3. End-to-End Tests
- Focus on user journeys and critical paths
- Use page objects for maintainability
- Include mobile-specific flows
- Test real-time updates
- Verify offline functionality

Example:
```typescript
test('user can view player stats and add to comparison', async ({ page }) => {
  await page.goto('/players');
  await page.click('[data-testid="player-card"]');
  await expect(page).toHaveURL(/\/players\/\d+/);
  await page.click('[data-testid="add-to-comparison"]');
  await expect(page.locator('[data-testid="comparison-list"]')).toContainText('Added to comparison');
});
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use clear, descriptive test names
- Keep tests focused and atomic
- Follow the Arrange-Act-Assert pattern
- Use beforeEach/afterEach for setup/cleanup

### 2. Test Data Management
- Use test fixtures for consistent data
- Clean up test data after each test
- Don't rely on external services
- Use meaningful test data values
- Document data dependencies

### 3. Assertions
- Make assertions specific and meaningful
- Test both positive and negative cases
- Include error handling tests
- Verify state changes
- Check edge cases

### 4. Performance
- Keep tests efficient
- Use test parallelization
- Minimize unnecessary setup
- Clean up resources properly
- Monitor test execution times

## Writing New Tests

### 1. Planning
1. Identify what needs to be tested
2. Determine appropriate test category
3. Review existing similar tests
4. Plan test data requirements
5. Consider edge cases

### 2. Implementation
1. Create new test file or add to existing
2. Follow established patterns
3. Implement test cases
4. Add appropriate assertions
5. Document any special requirements

### 3. Verification
1. Run tests locally
2. Verify test coverage
3. Check test performance
4. Review error messages
5. Update documentation

## Test Coverage

### 1. Coverage Goals
- API endpoints: 100% coverage
- Critical user flows: 100% coverage
- UI components: 90% coverage
- Error handling: 95% coverage
- Edge cases: 85% coverage

### 2. Coverage Reporting
- Use Jest coverage reports
- Monitor coverage trends
- Document coverage gaps
- Plan coverage improvements
- Update coverage badges

## Debugging Tests

### 1. Common Issues
- Timing issues with async operations
- Selector changes breaking tests
- Network flakiness
- State persistence between tests
- Browser/device specific issues

### 2. Debugging Tools
- Playwright Inspector
- Jest debugging
- Browser DevTools
- Test logs
- Screenshots and videos

### 3. Solutions
- Use proper wait conditions
- Implement retry logic
- Clean up test state
- Use stable selectors
- Document known issues

## CI/CD Integration

### 1. GitHub Actions
- Tests run on pull requests
- Required status checks
- Parallel test execution
- Test result reporting
- Coverage reporting

### 2. Environment Setup
- Use consistent Node.js version
- Install dependencies
- Set up test databases
- Configure test variables
- Handle secrets securely

## Maintenance

### 1. Regular Updates
- Update test dependencies
- Review test stability
- Update test data
- Check for deprecated APIs
- Monitor test performance

### 2. Documentation
- Keep README updated
- Document new features
- Update troubleshooting guide
- Maintain test examples
- Update coverage reports

## Contributing

### 1. Pull Request Process
1. Create feature branch
2. Add/update tests
3. Verify coverage
4. Update documentation
5. Submit pull request

### 2. Review Process
1. Code review
2. Test execution
3. Coverage check
4. Documentation review
5. Final approval

## Resources

### 1. Documentation
- [Test Plan](./e2e-test-plan.md)
- [Mobile/PWA Testing Guide](./mobile-pwa-testing-guide.md)
- [API Documentation](../api/README.md)

### 2. Tools
- Playwright
- Jest
- MSW (Mock Service Worker)
- Visual Regression Tools
- Coverage Tools

## Support

For questions or issues:
1. Check existing documentation
2. Review troubleshooting guide
3. Check GitHub issues
4. Contact test team lead 