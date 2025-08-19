import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { apiCache, createCacheKey, createHashKey } from '../utils/cache'

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

// Request retry configuration
interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryCondition?: (error: any) => boolean
}

// Optimized API client configuration
interface OptimizedApiConfig extends AxiosRequestConfig {
  cache?: boolean
  cacheTtl?: number
  cacheKey?: string
  deduplicate?: boolean
  retry?: RetryConfig
  timeout?: number
}

// API response type
interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  timestamp: number
}

export class OptimizedApiClient {
  private client: AxiosInstance
  private defaultConfig: OptimizedApiConfig

  constructor(baseURL: string = '/api', config: OptimizedApiConfig = {}) {
    this.defaultConfig = {
      cache: true,
      cacheTtl: 5 * 60 * 1000, // 5 minutes
      deduplicate: true,
      retry: {
        maxRetries: 3,
        retryDelay: 1000,
        retryCondition: (error) => {
          // Retry on network errors or 5xx status codes
          return !error.response || (error.response.status >= 500 && error.response.status <= 599)
        },
      },
      timeout: 10000, // 10 seconds
      ...config,
    }

    this.client = axios.create({
      baseURL,
      timeout: this.defaultConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent cache issues
        config.metadata = { startTime: Date.now() }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = Date.now() - response.config.metadata?.startTime
        
        // Log slow requests
        if (duration > 2000) {
          console.warn(`Slow API request: ${response.config.url} took ${duration}ms`)
        }
        
        return response
      },
      (error) => {
        // Log error details
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        })
        
        return Promise.reject(error)
      }
    )
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    return createHashKey({ method, url, params, data })
  }

  private async executeRequest<T>(
    config: AxiosRequestConfig & OptimizedApiConfig
  ): Promise<ApiResponse<T>> {
    const mergedConfig = { ...this.defaultConfig, ...config }
    const requestKey = mergedConfig.cacheKey || this.createRequestKey(config)
    
    // Check cache first (for GET requests)
    if (mergedConfig.cache && config.method?.toLowerCase() === 'get') {
      const cached = apiCache.get(requestKey)
      if (cached) {
        return cached
      }
    }

    // Request deduplication
    if (mergedConfig.deduplicate && pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)
    }

    // Create request promise with retry logic
    const requestPromise = this.executeWithRetry<T>(config, mergedConfig.retry!)
      .then((response) => {
        const apiResponse: ApiResponse<T> = {
          data: response.data,
          success: true,
          timestamp: Date.now(),
        }

        // Cache successful GET responses
        if (mergedConfig.cache && config.method?.toLowerCase() === 'get') {
          apiCache.set(requestKey, apiResponse, mergedConfig.cacheTtl)
        }

        return apiResponse
      })
      .catch((error) => {
        const apiResponse: ApiResponse<T> = {
          data: null as any,
          success: false,
          message: error.message || 'Request failed',
          timestamp: Date.now(),
        }
        
        throw apiResponse
      })
      .finally(() => {
        // Remove from pending requests
        pendingRequests.delete(requestKey)
      })

    // Store pending request
    if (mergedConfig.deduplicate) {
      pendingRequests.set(requestKey, requestPromise)
    }

    return requestPromise
  }

  private async executeWithRetry<T>(
    config: AxiosRequestConfig,
    retryConfig: RetryConfig
  ): Promise<AxiosResponse<T>> {
    let lastError: any
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await this.client.request<T>(config)
      } catch (error) {
        lastError = error
        
        // Don't retry if it's the last attempt or if retry condition is not met
        if (
          attempt === retryConfig.maxRetries ||
          !retryConfig.retryCondition?.(error)
        ) {
          break
        }
        
        // Wait before retrying with exponential backoff
        const delay = retryConfig.retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // HTTP methods
  async get<T = any>(url: string, config: OptimizedApiConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ ...config, method: 'GET', url })
  }

  async post<T = any>(url: string, data?: any, config: OptimizedApiConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ ...config, method: 'POST', url, data })
  }

  async put<T = any>(url: string, data?: any, config: OptimizedApiConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ ...config, method: 'PUT', url, data })
  }

  async patch<T = any>(url: string, data?: any, config: OptimizedApiConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ ...config, method: 'PATCH', url, data })
  }

  async delete<T = any>(url: string, config: OptimizedApiConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({ ...config, method: 'DELETE', url })
  }

  // Batch requests
  async batch<T = any>(requests: Array<AxiosRequestConfig & OptimizedApiConfig>): Promise<Array<ApiResponse<T>>> {
    return Promise.all(requests.map(config => this.executeRequest<T>(config)))
  }

  // Upload with progress
  async upload<T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void,
    config: OptimizedApiConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
      cache: false, // Don't cache upload requests
      deduplicate: false, // Don't deduplicate upload requests
    })
  }

  // Stream data
  async stream<T = any>(url: string, config: OptimizedApiConfig = {}) {
    return this.client.get<T>(url, {
      ...config,
      responseType: 'stream',
    })
  }

  // Cache management
  invalidateCache(pattern?: RegExp): number {
    if (pattern) {
      return apiCache.invalidatePattern(pattern)
    } else {
      apiCache.clear()
      return 0
    }
  }

  refreshCache(key: string, ttl?: number): boolean {
    return apiCache.refresh(key, ttl)
  }

  getCacheStats() {
    return apiCache.getStats()
  }
}

// Pre-configured API clients for different domains
export const novelApi = new OptimizedApiClient('/api/novel', {
  cacheTtl: 10 * 60 * 1000, // 10 minutes for novel data
})

export const authApi = new OptimizedApiClient('/api/auth', {
  cache: false, // Don't cache auth requests
  retry: {
    maxRetries: 1,
    retryDelay: 500,
    retryCondition: () => false, // Don't retry auth requests
  },
})

export const analyticsApi = new OptimizedApiClient('/api/analytics', {
  cacheTtl: 5 * 60 * 1000, // 5 minutes for analytics
})

// Default API client
export const api = new OptimizedApiClient()

// Utility functions for specific API operations
export const novelService = {
  // Novel operations
  async getNovelList(params?: any) {
    return novelApi.get('/list', {
      cacheKey: createCacheKey('novel', 'list', createHashKey(params || {})),
    })
  },

  async getNovelById(id: string) {
    return novelApi.get(`/${id}`, {
      cacheKey: createCacheKey('novel', 'detail', id),
    })
  },

  async parseNovel(data: any) {
    return novelApi.post('/parse', data, {
      cache: false,
      deduplicate: false,
    })
  },

  async updateNovel(id: string, data: any) {
    const response = await novelApi.put(`/${id}`, data, {
      cache: false,
    })
    
    // Invalidate related cache entries
    novelApi.invalidateCache(/^novel:(list|detail)/i)
    
    return response
  },

  async publishNovel(data: any, onProgress?: (progress: number) => void) {
    return novelApi.post('/publish', data, {
      cache: false,
      deduplicate: false,
      timeout: 60000, // 1 minute timeout for publish
      retry: {
        maxRetries: 1,
        retryDelay: 2000,
        retryCondition: (error) => error.code === 'NETWORK_ERROR',
      },
    })
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData()
    formData.append('file', file)
    
    return novelApi.upload('/upload', formData, onProgress)
  },
}

// Hook for API state management
export function useApiState() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const execute = React.useCallback(async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (response.success) {
        onSuccess?.(response.data)
        return response.data
      } else {
        const errorMessage = response.message || 'Request failed'
        setError(errorMessage)
        onError?.(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute, setError }
}

export default api