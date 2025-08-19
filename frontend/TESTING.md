# Testing Guide

This project uses a comprehensive testing setup with Vitest, React Testing Library, and MSW for API mocking.

## Testing Stack

- **Vitest**: Fast unit test runner built on Vite
- **React Testing Library**: Simple and complete testing utilities for React components
- **MSW (Mock Service Worker)**: API mocking library for testing
- **@testing-library/jest-dom**: Custom jest matchers for DOM elements
- **@testing-library/user-event**: Advanced user interaction simulation

## Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Directory Structure

```
src/
├── test/
│   ├── setup.ts              # Test setup and global mocks
│   ├── server.ts              # MSW server setup and handlers
│   ├── utils.tsx              # Testing utilities and helpers
│   └── integration.test.tsx   # Integration tests
├── components/
│   └── ui/
│       └── __tests__/         # Component unit tests
├── hooks/
│   └── __tests__/             # Hook tests
└── services/
    └── __tests__/             # Service tests
```

## Writing Tests

### Component Tests

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, userEvent } from '@/test/utils'
import { Button } from '../button'

describe('Button', () => {
  it('renders and handles clicks', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

```tsx
import { renderHook, act } from '@testing-library/react'
import { usePerformanceMonitor } from '../usePerformance'

describe('usePerformanceMonitor', () => {
  it('tracks render metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'))
    
    expect(result.current.componentName).toBe('TestComponent')
    expect(result.current.renderTime).toBeGreaterThanOrEqual(0)
  })
})
```

### API Tests

```tsx
import { describe, it, expect } from 'vitest'
import { novelService } from '../optimizedApi'

describe('novelService', () => {
  it('fetches novel list', async () => {
    const response = await novelService.getNovelList()
    
    expect(response.success).toBe(true)
    expect(Array.isArray(response.data)).toBe(true)
  })
})
```

## Testing Utilities

### Custom Render Function

The `customRender` function in `src/test/utils.tsx` provides automatic wrapping with necessary providers:

```tsx
import { render } from '@/test/utils'

// Automatically includes QueryClient, Router, and Tooltip providers
render(<MyComponent />)

// Customize providers
render(<MyComponent />, {
  withRouter: false,
  withQueryClient: false,
})
```

### Mock Data

Use predefined mock data from `src/test/utils.tsx`:

```tsx
import { mockNovelData, mockChapterData } from '@/test/utils'

// Use in tests
const novel = mockNovelData.complete
const chapter = mockChapterData.rich
```

### MSW Server

API calls are automatically mocked using MSW. Handlers are defined in `src/test/server.ts`:

```tsx
// Use custom handler for specific test
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

server.use(
  http.get('/api/custom', () => {
    return HttpResponse.json({ custom: 'response' })
  })
)
```

## Test Coverage

The project maintains high test coverage standards:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory.

## Best Practices

### 1. Test Behavior, Not Implementation

```tsx
// ✅ Good - tests user behavior
expect(screen.getByText('Novel published successfully')).toBeInTheDocument()

// ❌ Bad - tests implementation details
expect(component.state.isPublished).toBe(true)
```

### 2. Use Semantic Queries

```tsx
// ✅ Good - semantic queries
screen.getByRole('button', { name: /publish/i })
screen.getByLabelText(/novel title/i)

// ❌ Bad - fragile selectors
screen.getByTestId('publish-button')
screen.getByClassName('title-input')
```

### 3. Test User Interactions

```tsx
// ✅ Good - realistic user interactions
const user = userEvent.setup()
await user.type(screen.getByLabelText(/title/i), 'My Novel')
await user.click(screen.getByRole('button', { name: /save/i }))

// ❌ Bad - programmatic interactions
fireEvent.change(input, { target: { value: 'My Novel' } })
fireEvent.click(button)
```

### 4. Wait for Asynchronous Operations

```tsx
// ✅ Good - wait for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// ❌ Bad - no waiting
expect(screen.getByText('Success')).toBeInTheDocument()
```

### 5. Clean Up After Tests

```tsx
describe('Component', () => {
  afterEach(() => {
    vi.clearAllMocks()
    server.resetHandlers()
  })
})
```

## Debugging Tests

### 1. Use screen.debug()

```tsx
it('debugs component state', () => {
  render(<MyComponent />)
  screen.debug() // Logs current DOM structure
})
```

### 2. Use Testing Playground

Install the browser extension and use:

```tsx
screen.logTestingPlaygroundURL()
```

### 3. Check What's Rendered

```tsx
// See all available queries
screen.getByRole('') // Will show all available roles
```

## Performance Testing

Monitor component performance during tests:

```tsx
import { measureRenderTime } from '@/test/utils'

it('renders quickly', () => {
  const renderTime = measureRenderTime(() => {
    render(<ExpensiveComponent />)
  })
  
  expect(renderTime).toBeLessThan(100) // Should render within 100ms
})
```

## Accessibility Testing

Check for accessibility issues:

```tsx
import { getAccessibilityViolations } from '@/test/utils'

it('is accessible', () => {
  const { container } = render(<MyComponent />)
  const violations = getAccessibilityViolations(container)
  
  expect(violations).toHaveLength(0)
})
```

## Running Tests in CI

The test suite is designed to run reliably in CI environments:

- Uses `jsdom` environment for consistent DOM simulation
- Includes proper cleanup between tests
- Handles timing issues with fake timers
- Provides comprehensive error reporting

## Troubleshooting

### Common Issues

1. **Tests timeout**: Increase timeout in test configuration
2. **MSW handlers not working**: Check handler order and matching
3. **React Testing Library queries fail**: Use more specific queries
4. **Async operations not completing**: Add proper wait conditions

### Environment Issues

1. **Node.js compatibility**: Ensure Node.js 18+ for Vitest
2. **Module resolution**: Check path aliases in Vite config
3. **DOM APIs missing**: Add polyfills in test setup if needed

For more help, check the official documentation:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)