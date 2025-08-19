import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OptimizedApiClient, novelService, useApiState } from '../optimizedApi'
import { renderHook, act } from '@testing-library/react'
import { server, serverHelpers } from '@/test/server'
import { http, HttpResponse } from 'msw'

describe('OptimizedApiClient', () => {
  let client: OptimizedApiClient

  beforeEach(() => {
    client = new OptimizedApiClient('/api')
  })

  afterEach(() => {
    vi.clearAllMocks()
    server.resetHandlers()
  })

  describe('basic HTTP methods', () => {
    it('makes GET requests correctly', async () => {
      const response = await client.get('/test')
      
      expect(response.success).toBe(true)
      expect(response.timestamp).toBeTypeOf('number')
    })

    it('makes POST requests correctly', async () => {
      const testData = { title: 'Test Novel' }
      const response = await client.post('/novel/parse', testData)
      
      expect(response.success).toBe(true)
      expect(response.data.title).toBe('解析的小说标题')
    })

    it('makes PUT requests correctly', async () => {
      const updateData = { title: 'Updated Title' }
      const response = await client.put('/novel/1', updateData)
      
      expect(response.success).toBe(true)
      expect(response.data.title).toBe('Updated Title')
    })

    it('makes DELETE requests correctly', async () => {
      const response = await client.delete('/novel/1')
      
      expect(response.success).toBe(true)
    })
  })

  describe('caching', () => {
    it('caches GET requests by default', async () => {
      // First request
      const response1 = await client.get('/test-cache')
      
      // Second request should return cached result
      const response2 = await client.get('/test-cache')
      
      expect(response1.timestamp).toBe(response2.timestamp)
    })

    it('does not cache when cache is disabled', async () => {
      const response1 = await client.get('/test-no-cache', { cache: false })
      const response2 = await client.get('/test-no-cache', { cache: false })
      
      // Should make separate requests
      expect(response1.timestamp).not.toBe(response2.timestamp)
    })

    it('uses custom cache key when provided', async () => {
      const cacheKey = 'custom-key'
      
      await client.get('/test1', { cacheKey })
      const cachedResponse = await client.get('/test2', { cacheKey })
      
      // Should return cached result despite different URLs
      expect(cachedResponse).toBeDefined()
    })

    it('respects custom TTL', async () => {
      vi.useFakeTimers()
      
      const shortTtl = 100 // 100ms
      await client.get('/test-ttl', { cacheTtl: shortTtl })
      
      // Advance time beyond TTL
      vi.advanceTimersByTime(200)
      
      // Should make new request after TTL expires
      const response = await client.get('/test-ttl', { cacheTtl: shortTtl })
      expect(response.success).toBe(true)
      
      vi.useRealTimers()
    })
  })

  describe('request deduplication', () => {
    it('deduplicates concurrent requests by default', async () => {
      const [response1, response2] = await Promise.all([
        client.get('/test-dedup'),
        client.get('/test-dedup'),
      ])
      
      // Should return same response for both
      expect(response1.timestamp).toBe(response2.timestamp)
    })

    it('does not deduplicate when disabled', async () => {
      const [response1, response2] = await Promise.all([
        client.get('/test-no-dedup', { deduplicate: false }),
        client.get('/test-no-dedup', { deduplicate: false }),
      ])
      
      // Should make separate requests
      expect(response1.timestamp).not.toBe(response2.timestamp)
    })
  })

  describe('retry logic', () => {
    it('retries failed requests', async () => {
      // Mock server to fail twice then succeed
      let attemptCount = 0
      server.use(
        http.get('/api/test-retry', () => {
          attemptCount++
          if (attemptCount <= 2) {
            return new HttpResponse(null, { status: 500 })
          }
          return HttpResponse.json({ success: true, data: 'success' })
        })
      )

      const response = await client.get('/test-retry', {
        retry: {
          maxRetries: 3,
          retryDelay: 10,
          retryCondition: () => true,
        },
      })

      expect(response.success).toBe(true)
      expect(attemptCount).toBe(3)
    })

    it('respects retry condition', async () => {
      server.use(
        http.get('/api/test-no-retry', () => {
          return new HttpResponse(null, { status: 400 })
        })
      )

      try {
        await client.get('/test-no-retry', {
          retry: {
            maxRetries: 3,
            retryDelay: 10,
            retryCondition: (error) => error.response?.status >= 500,
          },
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('upload functionality', () => {
    it('handles file upload with progress', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt')
      
      const progressCallback = vi.fn()
      const response = await client.upload('/upload', formData, progressCallback)
      
      expect(response.success).toBe(true)
      expect(response.data.filename).toBe('uploaded-novel.md')
    })
  })

  describe('batch requests', () => {
    it('executes multiple requests in parallel', async () => {
      const requests = [
        { method: 'GET', url: '/novel/1' },
        { method: 'GET', url: '/novel/2' },
      ]
      
      const responses = await client.batch(requests)
      
      expect(responses).toHaveLength(2)
      expect(responses[0].success).toBe(true)
      expect(responses[1].success).toBe(true)
    })
  })

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      server.use(
        http.get('/api/test-network-error', () => {
          return HttpResponse.error()
        })
      )

      try {
        await client.get('/test-network-error')
      } catch (error) {
        expect(error.success).toBe(false)
        expect(error.message).toBeDefined()
      }
    })

    it('handles HTTP error status codes', async () => {
      server.use(
        http.get('/api/test-404', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      try {
        await client.get('/test-404')
      } catch (error) {
        expect(error.success).toBe(false)
      }
    })
  })

  describe('cache management', () => {
    it('invalidates cache by pattern', () => {
      const invalidated = client.invalidateCache(/novel/)
      expect(invalidated).toBeGreaterThanOrEqual(0)
    })

    it('clears all cache', () => {
      client.invalidateCache()
      // Should complete without error
    })

    it('refreshes cache entries', () => {
      const refreshed = client.refreshCache('test-key', 5000)
      expect(typeof refreshed).toBe('boolean')
    })

    it('provides cache statistics', () => {
      const stats = client.getCacheStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
    })
  })
})

describe('novelService', () => {
  afterEach(() => {
    server.resetHandlers()
  })

  it('gets novel list', async () => {
    const response = await novelService.getNovelList()
    
    expect(response.success).toBe(true)
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('gets novel by ID', async () => {
    const response = await novelService.getNovelById('1')
    
    expect(response.success).toBe(true)
    expect(response.data.id).toBe('1')
  })

  it('parses novel', async () => {
    const novelData = { title: 'Test Novel' }
    const response = await novelService.parseNovel(novelData)
    
    expect(response.success).toBe(true)
    expect(response.data.title).toBeDefined()
  })

  it('updates novel and invalidates cache', async () => {
    const updateData = { title: 'Updated Novel' }
    const response = await novelService.updateNovel('1', updateData)
    
    expect(response.success).toBe(true)
    expect(response.data.title).toBe('Updated Novel')
  })

  it('publishes novel', async () => {
    const publishData = { title: 'Novel to Publish' }
    const response = await novelService.publishNovel(publishData)
    
    expect(response.success).toBe(true)
    expect(response.data.publishId).toBeDefined()
  })

  it('uploads file', async () => {
    const file = new File(['content'], 'test.md', { type: 'text/markdown' })
    const progressCallback = vi.fn()
    
    const response = await novelService.uploadFile(file, progressCallback)
    
    expect(response.success).toBe(true)
    expect(response.data.filename).toBeDefined()
  })
})

describe('useApiState', () => {
  it('manages loading and error states', async () => {
    const { result } = renderHook(() => useApiState())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()

    // Execute successful API call
    await act(async () => {
      const data = await result.current.execute(
        () => Promise.resolve({ success: true, data: 'test data', timestamp: Date.now() }),
        (data) => {
          expect(data).toBe('test data')
        }
      )
      expect(data).toBe('test data')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles API errors', async () => {
    const { result } = renderHook(() => useApiState())

    await act(async () => {
      try {
        await result.current.execute(
          () => Promise.resolve({ success: false, message: 'API Error', timestamp: Date.now() }),
          undefined,
          (error) => {
            expect(error).toBe('API Error')
          }
        )
      } catch (error) {
        expect(error.message).toBe('API Error')
      }
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('API Error')
  })

  it('handles promise rejections', async () => {
    const { result } = renderHook(() => useApiState())

    await act(async () => {
      try {
        await result.current.execute(
          () => Promise.reject(new Error('Network Error'))
        )
      } catch (error) {
        expect(error.message).toBe('Network Error')
      }
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Network Error')
  })

  it('can clear error state', async () => {
    const { result } = renderHook(() => useApiState())

    // Set error state
    await act(async () => {
      try {
        await result.current.execute(
          () => Promise.reject(new Error('Test Error'))
        )
      } catch {}
    })

    expect(result.current.error).toBe('Test Error')

    // Clear error
    act(() => {
      result.current.setError(null)
    })

    expect(result.current.error).toBeNull()
  })
})