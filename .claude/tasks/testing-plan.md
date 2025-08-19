# UI Testing Plan

## Testing Strategy Overview

### Testing Pyramid
```
         /\
        /  \  E2E Tests (10%)
       /    \  - Critical user paths
      /      \  - Cross-browser testing
     /________\
    /          \  Integration Tests (30%)
   /            \  - Component interactions
  /              \  - API integrations
 /________________\
/                  \  Unit Tests (60%)
                      - Component logic
                      - Utilities
                      - Hooks
```

### Testing Tools Stack
- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest + MSW (Mock Service Worker)
- **E2E Testing**: Cypress / Playwright
- **Visual Testing**: Storybook + Chromatic
- **Accessibility Testing**: jest-axe + Pa11y
- **Performance Testing**: Lighthouse CI
- **Cross-browser Testing**: BrowserStack

## Unit Testing Plan

### Component Testing Checklist

#### For Each Component:
```typescript
// Example test structure
describe('ComponentName', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('should render without crashing', () => {});
    it('should render with default props', () => {});
    it('should render with all props', () => {});
    it('should handle missing optional props', () => {});
  });

  // Props testing
  describe('Props', () => {
    it('should apply className prop', () => {});
    it('should forward refs correctly', () => {});
    it('should handle children prop', () => {});
  });

  // State testing
  describe('State Management', () => {
    it('should initialize with correct state', () => {});
    it('should update state on user interaction', () => {});
    it('should reset state when needed', () => {});
  });

  // Event handling
  describe('Event Handlers', () => {
    it('should call onClick when clicked', () => {});
    it('should handle keyboard events', () => {});
    it('should prevent default when needed', () => {});
  });

  // Conditional rendering
  describe('Conditional Rendering', () => {
    it('should show loading state', () => {});
    it('should show error state', () => {});
    it('should show empty state', () => {});
    it('should show success state', () => {});
  });

  // Accessibility
  describe('Accessibility', () => {
    it('should have no accessibility violations', () => {});
    it('should have proper ARIA attributes', () => {});
    it('should be keyboard navigable', () => {});
  });
});
```

### Button Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render with icon', () => {
      render(<Button icon={<Icon />}>Save</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');
      
      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading onClick={jest.fn()}>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Button aria-label="Save document" aria-pressed="true">
          Save
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Save document');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
```

### Form Component Tests
```typescript
describe('NovelForm Component', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    initialData: {
      title: '',
      author: '',
      description: '',
    },
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(<NovelForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Author is required')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate field lengths', async () => {
      render(<NovelForm {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Title');
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
      fireEvent.blur(titleInput);
      
      await waitFor(() => {
        expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      render(<NovelForm {...defaultProps} />);
      
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Test Novel' }
      });
      fireEvent.change(screen.getByLabelText('Author'), {
        target: { value: 'Test Author' }
      });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Test Description' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Novel',
          author: 'Test Author',
          description: 'Test Description',
        });
      });
    });
  });

  describe('Auto-save', () => {
    it('should auto-save after changes', async () => {
      jest.useFakeTimers();
      const mockAutoSave = jest.fn();
      
      render(<NovelForm {...defaultProps} onAutoSave={mockAutoSave} />);
      
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Auto-saved title' }
      });
      
      jest.advanceTimersByTime(2000); // Auto-save delay
      
      await waitFor(() => {
        expect(mockAutoSave).toHaveBeenCalledWith({
          title: 'Auto-saved title',
          author: '',
          description: '',
        });
      });
      
      jest.useRealTimers();
    });
  });
});
```

## Integration Testing Plan

### API Integration Tests
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const server = setupServer(
  rest.get('/api/novels', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', title: 'Novel 1' },
        { id: '2', title: 'Novel 2' },
      ])
    );
  }),
  rest.post('/api/novels', (req, res, ctx) => {
    return res(
      ctx.json({ id: '3', ...req.body })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Novel Management Integration', () => {
  it('should fetch and display novels', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <NovelList />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Novel 1')).toBeInTheDocument();
      expect(screen.getByText('Novel 2')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    server.use(
      rest.get('/api/novels', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <NovelList />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load novels')).toBeInTheDocument();
    });
  });
});
```

### Component Integration Tests
```typescript
describe('Novel Editor Integration', () => {
  it('should integrate form, preview, and save', async () => {
    render(<NovelEditor />);
    
    // Fill form
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test Novel' } });
    
    // Switch to preview
    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    
    // Verify preview shows form data
    expect(screen.getByText('Test Novel')).toBeInTheDocument();
    
    // Save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    // Verify save feedback
    await waitFor(() => {
      expect(screen.getByText('Novel saved successfully')).toBeInTheDocument();
    });
  });
});
```

## E2E Testing Plan

### Critical User Paths

#### 1. Novel Creation Flow
```typescript
// cypress/e2e/novel-creation.cy.ts
describe('Novel Creation Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/novels/new');
  });

  it('should complete full novel creation process', () => {
    // Upload file
    cy.get('[data-testid="file-upload"]').attachFile('sample-novel.md');
    cy.get('[data-testid="upload-progress"]').should('be.visible');
    cy.wait('@fileUpload');
    
    // Edit metadata
    cy.get('[data-testid="novel-title"]').clear().type('My Test Novel');
    cy.get('[data-testid="novel-author"]').clear().type('Test Author');
    cy.get('[data-testid="novel-category"]').select('Fiction');
    
    // Review chapters
    cy.get('[data-testid="tab-chapters"]').click();
    cy.get('[data-testid="chapter-list"]').should('have.length.greaterThan', 0);
    
    // Publish
    cy.get('[data-testid="publish-button"]').click();
    cy.get('[data-testid="publish-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-publish"]').click();
    
    // Verify success
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Novel published successfully');
    cy.url().should('include', '/novels/');
  });
});
```

#### 2. Chapter Management Flow
```typescript
describe('Chapter Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/novels/123/chapters');
  });

  it('should manage chapters', () => {
    // Search chapters
    cy.get('[data-testid="chapter-search"]').type('dragon');
    cy.get('[data-testid="chapter-item"]').should('have.length', 2);
    
    // Reorder chapters
    cy.get('[data-testid="chapter-1"]')
      .drag('[data-testid="chapter-3"]');
    cy.get('[data-testid="save-order"]').click();
    
    // Edit chapter
    cy.get('[data-testid="chapter-1"] [data-testid="edit-button"]').click();
    cy.get('[data-testid="chapter-editor"]').should('be.visible');
    cy.get('[data-testid="chapter-content"]').type('{selectall}New content');
    cy.get('[data-testid="save-chapter"]').click();
    
    // Delete chapter
    cy.get('[data-testid="chapter-2"] [data-testid="delete-button"]').click();
    cy.get('[data-testid="confirm-delete"]').click();
    cy.get('[data-testid="chapter-2"]').should('not.exist');
  });
});
```

### Cross-Browser Testing
```typescript
// Browser matrix testing
const browsers = ['chrome', 'firefox', 'safari', 'edge'];

browsers.forEach(browser => {
  describe(`Cross-browser: ${browser}`, () => {
    it('should work in all supported browsers', () => {
      cy.visit('/', { browser });
      
      // Core functionality tests
      cy.get('[data-testid="app-header"]').should('be.visible');
      cy.get('[data-testid="navigation"]').should('be.visible');
      cy.get('[data-testid="main-content"]').should('be.visible');
    });
  });
});
```

## Visual Testing Plan

### Storybook Stories
```typescript
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: { viewports: [320, 768, 1200] },
  },
};

export const Default = {
  args: {
    children: 'Button',
  },
};

export const AllVariants = () => (
  <div className="space-y-4">
    <Button variant="default">Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

export const States = () => (
  <div className="space-y-4">
    <Button>Normal</Button>
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </div>
);

export const Sizes = () => (
  <div className="space-y-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon"><Icon /></Button>
  </div>
);
```

### Visual Regression Tests
```typescript
// Visual regression with Percy
describe('Visual Regression', () => {
  it('should match homepage snapshot', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });

  it('should match novel editor snapshot', () => {
    cy.visit('/novels/new');
    cy.percySnapshot('Novel Editor');
  });

  it('should match dark mode snapshot', () => {
    cy.visit('/');
    cy.get('[data-testid="theme-toggle"]').click();
    cy.percySnapshot('Homepage - Dark Mode');
  });
});
```

## Accessibility Testing Plan

### Component Accessibility Tests
```typescript
describe('Accessibility Tests', () => {
  it('should pass accessibility audit', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should be keyboard navigable', () => {
    cy.visit('/');
    
    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'skip-link');
    
    cy.tab();
    cy.focused().should('have.attr', 'data-testid', 'nav-home');
    
    cy.tab();
    cy.focused().should('have.attr', 'data-testid', 'nav-novels');
  });

  it('should have proper ARIA labels', () => {
    cy.visit('/');
    
    cy.get('[role="navigation"]').should('have.attr', 'aria-label');
    cy.get('[role="main"]').should('exist');
    cy.get('[role="button"]').each($button => {
      expect($button).to.have.attr('aria-label');
    });
  });

  it('should announce dynamic content', () => {
    cy.visit('/novels/new');
    
    // Submit form with errors
    cy.get('[data-testid="submit"]').click();
    
    // Check for live region announcements
    cy.get('[role="alert"]').should('be.visible');
    cy.get('[aria-live="polite"]').should('contain', 'Please fix the errors');
  });
});
```

### Screen Reader Testing Checklist
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Navigation is properly structured
- [ ] Headings follow logical hierarchy
- [ ] Interactive elements are focusable
- [ ] Focus order is logical
- [ ] Skip links work correctly

## Performance Testing Plan

### Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/novels',
        'http://localhost:3000/novels/new',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Performance Benchmarks
```typescript
describe('Performance Benchmarks', () => {
  it('should render large list efficiently', () => {
    const startTime = performance.now();
    
    cy.visit('/novels');
    cy.get('[data-testid="novel-list"]').should('be.visible');
    
    const endTime = performance.now();
    expect(endTime - startTime).to.be.lessThan(1000);
  });

  it('should handle rapid interactions', () => {
    cy.visit('/novels/new');
    
    // Rapidly type in form
    cy.get('[data-testid="title-input"]')
      .type('This is a test title that is being typed rapidly');
    
    // Should not lag or drop characters
    cy.get('[data-testid="title-input"]')
      .should('have.value', 'This is a test title that is being typed rapidly');
  });
});
```

## Test Data Management

### Test Data Factories
```typescript
// factories/novel.factory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

export const novelFactory = Factory.define<Novel>(() => ({
  id: faker.datatype.uuid(),
  title: faker.lorem.sentence(),
  author: faker.name.fullName(),
  description: faker.lorem.paragraph(),
  categories: faker.helpers.arrayElements(['Fiction', 'Non-Fiction', 'Sci-Fi'], 2),
  chapters: chapterFactory.buildList(10),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}));

export const chapterFactory = Factory.define<Chapter>(() => ({
  id: faker.datatype.uuid(),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(5),
  order: faker.datatype.number({ min: 1, max: 100 }),
}));

// Usage in tests
const testNovel = novelFactory.build();
const testNovels = novelFactory.buildList(5);
const customNovel = novelFactory.build({ title: 'Custom Title' });
```

### Test Database Seeding
```typescript
// seed-test-db.ts
export async function seedTestDatabase() {
  await db.clear();
  
  // Seed users
  const users = await db.user.createMany({
    data: userFactory.buildList(10),
  });
  
  // Seed novels
  const novels = await db.novel.createMany({
    data: novelFactory.buildList(50),
  });
  
  // Seed chapters
  for (const novel of novels) {
    await db.chapter.createMany({
      data: chapterFactory.buildList(20, { novelId: novel.id }),
    });
  }
}
```

## Test Coverage Requirements

### Coverage Targets
- **Overall**: >80%
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

## Testing Workflow

### Pre-commit Testing
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### CI/CD Testing Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run chromatic
      
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:a11y
      
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run lhci
```

## Test Maintenance

### Test Review Checklist
- [ ] Tests are readable and self-documenting
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests are isolated and independent
- [ ] Tests use appropriate assertions
- [ ] Tests handle async operations correctly
- [ ] Tests clean up after themselves
- [ ] Tests use meaningful descriptions
- [ ] Tests cover edge cases
- [ ] Tests are not flaky
- [ ] Tests run quickly

### Test Refactoring Guidelines
1. Keep tests DRY but readable
2. Extract common setup into utilities
3. Use data factories for test data
4. Group related tests
5. Remove redundant tests
6. Update tests when requirements change
7. Fix flaky tests immediately
8. Monitor test execution time
9. Review test coverage regularly
10. Document complex test scenarios