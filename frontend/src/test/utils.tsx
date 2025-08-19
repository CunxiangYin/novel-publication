import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
  withRouter?: boolean
  withQueryClient?: boolean
  withTooltip?: boolean
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialEntries = ['/'],
    queryClient,
    withRouter = true,
    withQueryClient = true,
    withTooltip = true,
    ...renderOptions
  } = options

  const testQueryClient = queryClient || createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    let content = children

    // Wrap with QueryClient if needed
    if (withQueryClient) {
      content = (
        <QueryClientProvider client={testQueryClient}>
          {content}
        </QueryClientProvider>
      )
    }

    // Wrap with Router if needed
    if (withRouter) {
      content = (
        <BrowserRouter>
          {content}
        </BrowserRouter>
      )
    }

    // Wrap with Tooltip provider if needed
    if (withTooltip) {
      content = (
        <TooltipProvider>
          {content}
        </TooltipProvider>
      )
    }

    return <>{content}</>
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient,
  }
}

// Mock data generators
export const mockNovelData = {
  minimal: {
    id: 'test-1',
    title: '测试小说',
    author: '测试作者',
    intro: '测试简介',
    categories: '都市',
    wordCount: 1000,
    chapterCount: 1,
  },

  complete: {
    id: 'test-2',
    title: '完整测试小说',
    author: '完整测试作者',
    intro: '这是一个完整的测试小说简介，包含更多详细信息',
    categories: '都市,言情',
    highlight: '精彩的故事亮点',
    wordCount: 50000,
    chapterCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    chapters: [
      {
        id: 'chapter-1',
        title: '第一章：开始',
        content: '这是第一章的内容...',
        wordCount: 5000,
        order: 1,
      },
      {
        id: 'chapter-2',
        title: '第二章：发展',
        content: '这是第二章的内容...',
        wordCount: 5500,
        order: 2,
      },
    ],
  },

  withLongContent: {
    id: 'test-3',
    title: '超长内容测试小说',
    author: '测试作者',
    intro: '这是一个用于测试超长内容的小说简介'.repeat(10),
    categories: '玄幻,修仙,冒险',
    highlight: '震撼人心的修仙之路，充满了无数的挑战和机遇',
    wordCount: 200000,
    chapterCount: 50,
    chapters: Array.from({ length: 50 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `第${i + 1}章：章节标题`,
      content: `这是第${i + 1}章的内容...`.repeat(100),
      wordCount: 4000,
      order: i + 1,
    })),
  },
}

export const mockChapterData = {
  simple: {
    id: 'chapter-1',
    title: '测试章节',
    content: '<p>这是测试章节的内容</p>',
    wordCount: 100,
    order: 1,
  },

  rich: {
    id: 'chapter-2',
    title: '富文本测试章节',
    content: `
      <h1>章节标题</h1>
      <p>这是一个包含<strong>加粗文字</strong>和<em>斜体文字</em>的段落。</p>
      <blockquote>这是一个引用块</blockquote>
      <ul>
        <li>列表项1</li>
        <li>列表项2</li>
      </ul>
      <p>更多内容...</p>
    `,
    wordCount: 500,
    order: 2,
  },
}

// Test utilities
export function waitForLoadingToFinish() {
  return new Promise(resolve => setTimeout(resolve, 100))
}

export async function waitForApiCall(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export function createMockFile(
  name = 'test.md',
  content = 'Test file content',
  type = 'text/markdown'
) {
  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  return file
}

export function createMockFormData(data: Record<string, any>) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  })
  return formData
}

// Mock window methods
export function mockWindowMethods() {
  const scrollTo = vi.fn()
  const alert = vi.fn()
  const confirm = vi.fn(() => true)
  const prompt = vi.fn(() => 'mocked input')

  Object.defineProperty(window, 'scrollTo', { value: scrollTo })
  Object.defineProperty(window, 'alert', { value: alert })
  Object.defineProperty(window, 'confirm', { value: confirm })
  Object.defineProperty(window, 'prompt', { value: prompt })

  return { scrollTo, alert, confirm, prompt }
}

// Performance testing utilities
export function measureRenderTime(renderFn: () => void) {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

export function createPerformanceObserver() {
  const entries: any[] = []
  
  const observer = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => entries),
  }

  return { observer, entries }
}

// Accessibility testing utilities
export function getAccessibilityViolations(container: HTMLElement) {
  // Simple accessibility checks
  const violations = []

  // Check for images without alt text
  const images = container.querySelectorAll('img')
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      violations.push('Image without alt text or aria-label')
    }
  })

  // Check for buttons without accessible text
  const buttons = container.querySelectorAll('button')
  buttons.forEach(button => {
    const hasText = button.textContent?.trim()
    const hasAriaLabel = button.getAttribute('aria-label')
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby')
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      violations.push('Button without accessible text')
    }
  })

  // Check for form inputs without labels
  const inputs = container.querySelectorAll('input, textarea, select')
  inputs.forEach(input => {
    const id = input.id
    const hasLabel = id && container.querySelector(`label[for="${id}"]`)
    const hasAriaLabel = input.getAttribute('aria-label')
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      violations.push('Form input without label or aria-label')
    }
  })

  return violations
}

// Custom matchers for testing
export const customMatchers = {
  toBeAccessible: (received: HTMLElement) => {
    const violations = getAccessibilityViolations(received)
    return {
      message: () => `Expected element to be accessible, but found violations: ${violations.join(', ')}`,
      pass: violations.length === 0,
    }
  },

  toHaveLoadedWithinTime: (received: number, expectedTime: number) => {
    return {
      message: () => `Expected loading time ${received}ms to be within ${expectedTime}ms`,
      pass: received <= expectedTime,
    }
  },
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Export our custom render as the default render
export { customRender as render }