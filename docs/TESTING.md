# Testing Documentation

This document outlines the testing strategy and practices for the Real Estate Hotspot application.

## Overview

Our testing strategy follows a pyramid approach with three main levels:

1. **Unit Tests** - Fast, isolated tests for individual functions and components
2. **Integration Tests** - Tests for component interactions and API integrations
3. **End-to-End Tests** - Full user journey tests using real browsers

## Testing Stack

- **Unit/Integration Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: V8 coverage provider
- **CI/CD**: GitHub Actions

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

## Testing Structure

```
├── src/
│   ├── __tests__/          # Unit tests for utilities
│   ├── components/
│   │   └── __tests__/      # Component tests
│   ├── hooks/
│   │   └── __tests__/      # Hook tests
│   └── test/
│       ├── setup.ts        # Test setup and configuration
│       ├── test-utils.tsx  # Custom render functions and utilities
│       └── mocks/
│           └── server.ts   # MSW server setup
├── e2e/                    # End-to-end tests
├── vitest.config.ts        # Vitest configuration
└── playwright.config.ts    # Playwright configuration
```

## Writing Tests

### Unit Tests

Use unit tests for:
- Pure functions and utilities
- Custom hooks
- Complex business logic
- Security functions
- Accessibility utilities

```typescript
import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../utils/mortgage';

describe('calculateMortgage', () => {
  it('should calculate monthly payment correctly', () => {
    const result = calculateMortgage(300000, 0.05, 30);
    expect(result.monthlyPayment).toBeCloseTo(1610.46, 2);
  });
});
```

### Component Tests

Use component tests for:
- Component rendering
- User interactions
- Props handling
- Event handling
- Accessibility features

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import PropertyCard from '../PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Test Property',
    price: 250000,
    // ... other properties
  };

  it('should render property information', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('₦250,000')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    render(<PropertyCard property={mockProperty} onClick={mockOnClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockProperty);
  });
});
```

### Integration Tests

Use integration tests for:
- Multiple components working together
- API integrations
- Form submissions
- Navigation flows

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SearchPage from '../pages/SearchPage';

describe('SearchPage Integration', () => {
  it('should search and display results', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<SearchPage />);
    
    // Fill search form
    await user.type(screen.getByLabelText(/location/i), 'Lagos');
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/search results/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

Use E2E tests for:
- Complete user journeys
- Cross-browser compatibility
- Performance testing
- Accessibility testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Property Search Journey', () => {
  test('user can search and view property details', async ({ page }) => {
    await page.goto('/');
    
    // Search for properties
    await page.fill('[data-testid="search-input"]', 'Lagos');
    await page.click('[data-testid="search-button"]');
    
    // View search results
    await expect(page.getByText('Search Results')).toBeVisible();
    
    // Click on first property
    await page.click('[data-testid="property-card"]:first-child');
    
    // Verify property details page
    await expect(page).toHaveURL(/\/properties\/\d+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
```

## Test Data Management

### Mock Data

Create reusable mock data in test utilities:

```typescript
// src/test/test-utils.tsx
export const mockProperty = {
  id: '1',
  title: 'Modern Apartment',
  price: 250000,
  location: 'Lagos, Nigeria',
  // ... other properties
};

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
};
```

### API Mocking

Use MSW for consistent API mocking:

```typescript
// src/test/mocks/server.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/properties', (req, res, ctx) => {
    return res(ctx.json([mockProperty]));
  }),
];
```

## Coverage Requirements

We maintain the following coverage thresholds:

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

Critical modules (security, accessibility, payment) should aim for 90%+ coverage.

## Best Practices

### General

1. **Test behavior, not implementation**
2. **Write tests before fixing bugs** (TDD approach)
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Arrange, Act, Assert pattern**

### Component Testing

1. **Test from user perspective**
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Test accessibility features**
4. **Mock external dependencies**
5. **Test error states**

### E2E Testing

1. **Test critical user paths**
2. **Keep tests independent**
3. **Use page object model for complex flows**
4. **Test on multiple devices/browsers**
5. **Include performance assertions**

### Accessibility Testing

1. **Test keyboard navigation**
2. **Verify ARIA labels and roles**
3. **Check color contrast**
4. **Test with screen readers** (manual)
5. **Validate semantic HTML**

## Debugging Tests

### Unit/Integration Tests

```bash
# Debug with VS Code
# Add debugger statements and run:
npm run test:watch

# Debug specific test
npm test -- --grep "test name"

# Debug with browser
npm run test:ui
```

### E2E Tests

```bash
# Debug with Playwright Inspector
npm run test:e2e:debug

# Run with headed browser
npm run test:e2e:headed

# Generate trace
npx playwright test --trace on
```

## Performance Testing

### Bundle Size Testing

```bash
# Analyze bundle
npm run analyze

# Check bundle size limits in CI
npm run build && bundlesize
```

### Runtime Performance

```typescript
// E2E performance test
test('should load within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

## Continuous Integration

Our CI pipeline runs:

1. **Linting and type checking**
2. **Unit and integration tests**
3. **Security audits**
4. **E2E tests**
5. **Performance tests**
6. **Accessibility tests**

### Parallel Testing

Tests run in parallel for faster feedback:

- Unit tests: All cores
- E2E tests: 4 workers
- Different browsers in parallel

### Test Artifacts

CI preserves:
- Test results and coverage reports
- Screenshots and videos from failed E2E tests
- Performance metrics
- Accessibility audit results

## Troubleshooting

### Common Issues

1. **Flaky E2E tests**
   - Add proper waits
   - Use data-testid attributes
   - Avoid hard-coded timeouts

2. **Slow tests**
   - Mock external services
   - Use test-specific data
   - Parallelize where possible

3. **Coverage gaps**
   - Identify untested branches
   - Add edge case tests
   - Test error conditions

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Web Accessibility Testing](https://web.dev/accessibility/)

## Contributing

When adding new features:

1. **Write tests first** (TDD)
2. **Ensure all tests pass**
3. **Maintain coverage thresholds**
4. **Add E2E tests for user-facing features**
5. **Update documentation**

For questions or help with testing, reach out to the development team.
