import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
const mockNovels = [
  {
    id: '1',
    title: '测试小说1',
    author: '测试作者1',
    intro: '这是一个测试小说的简介',
    categories: '都市,言情',
    highlight: '精彩纷呈的故事情节',
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
    ],
  },
  {
    id: '2',
    title: '测试小说2',
    author: '测试作者2',
    intro: '另一个测试小说的简介',
    categories: '玄幻,修仙',
    highlight: '震撼人心的修仙之路',
    wordCount: 75000,
    chapterCount: 15,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    chapters: [],
  },
]

const mockAnalytics = {
  publishCount: 5,
  totalWordCount: 125000,
  averageWordCount: 25000,
  publishTrend: [
    { date: '2024-01-01', value: 1 },
    { date: '2024-01-02', value: 2 },
    { date: '2024-01-03', value: 2 },
  ],
  categoryDistribution: [
    { label: '都市', value: 2 },
    { label: '玄幻', value: 2 },
    { label: '言情', value: 1 },
  ],
}

// Request handlers
export const handlers = [
  // Novel API endpoints
  http.get('/api/novel/list', () => {
    return HttpResponse.json({
      success: true,
      data: mockNovels,
      total: mockNovels.length,
    })
  }),

  http.get('/api/novel/:id', ({ params }) => {
    const { id } = params
    const novel = mockNovels.find(n => n.id === id)
    
    if (!novel) {
      return new HttpResponse(null, { 
        status: 404,
        statusText: 'Novel not found'
      })
    }

    return HttpResponse.json({
      success: true,
      data: novel,
    })
  }),

  http.post('/api/novel/parse', async ({ request }) => {
    const body = await request.json() as any
    
    // Simulate parsing delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return HttpResponse.json({
      success: true,
      data: {
        id: 'new-novel-id',
        title: body.title || '解析的小说标题',
        author: '解析的作者',
        intro: '这是解析生成的小说简介...',
        categories: '都市,言情',
        highlight: '精彩的故事亮点',
        wordCount: 60000,
        chapterCount: 12,
        chapters: [
          {
            id: 'chapter-1',
            title: '第一章',
            content: '解析的章节内容...',
            wordCount: 5000,
            order: 1,
          },
        ],
      },
    })
  }),

  http.put('/api/novel/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as any
    
    const novelIndex = mockNovels.findIndex(n => n.id === id)
    if (novelIndex === -1) {
      return new HttpResponse(null, { 
        status: 404,
        statusText: 'Novel not found'
      })
    }

    // Update mock data
    mockNovels[novelIndex] = { ...mockNovels[novelIndex], ...body }

    return HttpResponse.json({
      success: true,
      data: mockNovels[novelIndex],
    })
  }),

  http.post('/api/novel/publish', async ({ request }) => {
    const body = await request.json() as any
    
    // Simulate publish delay
    await new Promise(resolve => setTimeout(resolve, 200))

    return HttpResponse.json({
      success: true,
      data: {
        publishId: 'publish-123',
        status: 'published',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/novel/123',
      },
    })
  }),

  http.post('/api/novel/upload', async ({ request }) => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 150))

    return HttpResponse.json({
      success: true,
      data: {
        filename: 'uploaded-novel.md',
        path: '/uploads/uploaded-novel.md',
        size: 1024,
      },
    })
  }),

  // Analytics API endpoints
  http.get('/api/analytics/overview', () => {
    return HttpResponse.json({
      success: true,
      data: mockAnalytics,
    })
  }),

  http.get('/api/analytics/trends', () => {
    return HttpResponse.json({
      success: true,
      data: mockAnalytics.publishTrend,
    })
  }),

  // Auth API endpoints (for testing error cases)
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as any
    
    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
          },
        },
      })
    }

    return new HttpResponse(null, { 
      status: 401,
      statusText: 'Invalid credentials'
    })
  }),

  // Error simulation endpoints
  http.get('/api/error/500', () => {
    return new HttpResponse(null, { 
      status: 500,
      statusText: 'Internal Server Error'
    })
  }),

  http.get('/api/error/network', () => {
    return HttpResponse.error()
  }),

  http.get('/api/slow', async () => {
    // Simulate slow response
    await new Promise(resolve => setTimeout(resolve, 3000))
    return HttpResponse.json({ success: true, data: 'slow response' })
  }),
]

// Setup server
export const server = setupServer(...handlers)

// Helper functions for tests
export const serverHelpers = {
  // Add custom handler for specific test
  useHandler: (handler: any) => {
    server.use(handler)
  },

  // Reset to default handlers
  resetHandlers: () => {
    server.resetHandlers(...handlers)
  },

  // Get mock novel by ID
  getMockNovel: (id: string) => {
    return mockNovels.find(n => n.id === id)
  },

  // Add mock novel
  addMockNovel: (novel: any) => {
    mockNovels.push(novel)
  },

  // Clear mock novels
  clearMockNovels: () => {
    mockNovels.length = 0
  },

  // Reset mock novels to default
  resetMockNovels: () => {
    mockNovels.length = 0
    mockNovels.push(
      {
        id: '1',
        title: '测试小说1',
        author: '测试作者1',
        intro: '这是一个测试小说的简介',
        categories: '都市,言情',
        highlight: '精彩纷呈的故事情节',
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
        ],
      },
      {
        id: '2',
        title: '测试小说2',
        author: '测试作者2',
        intro: '另一个测试小说的简介',
        categories: '玄幻,修仙',
        highlight: '震撼人心的修仙之路',
        wordCount: 75000,
        chapterCount: 15,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        chapters: [],
      }
    )
  },
}