// Cache management utilities for performance optimization
import React from 'react'

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiry: number
  version: string
  accessCount: number
  lastAccessed: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  version?: string // Cache version for invalidation
  persistence?: 'memory' | 'localStorage' | 'sessionStorage'
  serialize?: (data: any) => string
  deserialize?: (data: string) => any
}

export class SmartCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly options: Required<CacheOptions>
  private readonly storageKey: string

  constructor(name: string, options: CacheOptions = {}) {
    this.storageKey = `app_cache_${name}`
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 100,
      version: options.version ?? '1.0.0',
      persistence: options.persistence ?? 'memory',
      serialize: options.serialize ?? JSON.stringify,
      deserialize: options.deserialize ?? JSON.parse,
    }

    this.loadFromStorage()
    this.startCleanupTimer()
  }

  // Get item from cache
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }
    
    // Update access info
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    return entry.data
  }

  // Set item in cache
  set(key: string, data: T, customTtl?: number): void {
    const now = Date.now()
    const ttl = customTtl ?? this.options.ttl
    
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed()
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      version: this.options.version,
      accessCount: 1,
      lastAccessed: now,
    }
    
    this.cache.set(key, entry)
    this.saveToStorage()
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete specific key
  delete(key: string): boolean {
    const result = this.cache.delete(key)
    if (result) this.saveToStorage()
    return result
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
      expiredEntries: entries.filter(e => now > e.expiry).length,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp)),
      totalAccesses: entries.reduce((sum, e) => sum + e.accessCount, 0),
    }
  }

  // Refresh entry expiry
  refresh(key: string, customTtl?: number): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const ttl = customTtl ?? this.options.ttl
    entry.expiry = Date.now() + ttl
    entry.lastAccessed = Date.now()
    
    this.saveToStorage()
    return true
  }

  // Get multiple items
  getMultiple(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    keys.forEach(key => {
      result[key] = this.get(key)
    })
    return result
  }

  // Set multiple items
  setMultiple(items: Record<string, T>, customTtl?: number): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, customTtl)
    })
  }

  // Invalidate by pattern
  invalidatePattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    if (count > 0) this.saveToStorage()
    return count
  }

  // Private methods
  private evictLeastRecentlyUsed(): void {
    let lruKey = ''
    let lruTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed
        lruKey = key
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values())
    const totalRequests = entries.reduce((sum, e) => sum + e.accessCount, 0)
    const hits = entries.length
    return totalRequests > 0 ? hits / totalRequests : 0
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2 // String characters are 2 bytes
      size += this.options.serialize(entry.data).length * 2
      size += 48 // Approximate size of CacheEntry metadata
    }
    return size
  }

  private loadFromStorage(): void {
    if (this.options.persistence === 'memory') return
    
    try {
      const storage = this.getStorage()
      const data = storage.getItem(this.storageKey)
      
      if (data) {
        const parsed = this.options.deserialize(data)
        
        // Validate version
        if (parsed.version !== this.options.version) {
          storage.removeItem(this.storageKey)
          return
        }
        
        // Load entries
        Object.entries(parsed.entries).forEach(([key, entry]: [string, any]) => {
          // Only load non-expired entries
          if (Date.now() <= entry.expiry) {
            this.cache.set(key, entry)
          }
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (this.options.persistence === 'memory') return
    
    try {
      const storage = this.getStorage()
      const data = {
        version: this.options.version,
        entries: Object.fromEntries(this.cache.entries()),
      }
      
      storage.setItem(this.storageKey, this.options.serialize(data))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private getStorage(): Storage {
    return this.options.persistence === 'localStorage' ? localStorage : sessionStorage
  }

  private startCleanupTimer(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiry) {
          this.cache.delete(key)
        }
      }
    }, 60000)
  }
}

// Global cache instances
export const apiCache = new SmartCache('api', {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
  persistence: 'sessionStorage',
})

export const uiCache = new SmartCache('ui', {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
  persistence: 'localStorage',
})

export const imageCache = new SmartCache('images', {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100,
  persistence: 'localStorage',
})

// Utility functions
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':')
}

export function createHashKey(obj: any): string {
  // Simple hash function for objects
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// React hooks for cache management
export function useCachedData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: SmartCache<T>
    ttl?: number
    enabled?: boolean
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const {
    cache = apiCache,
    ttl,
    enabled = true,
    onError,
  } = options

  const fetchData = React.useCallback(async (forceRefresh = false) => {
    if (!enabled) return
    
    // Try cache first
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        setData(cached)
        return cached
      }
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      cache.set(cacheKey, result, ttl)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetcher, cache, ttl, enabled, onError])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    refresh: () => fetchData(false),
  }
}

// Cache management utilities
export class CacheManager {
  static caches = new Map<string, SmartCache>()
  
  static getCache(name: string, options?: CacheOptions): SmartCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new SmartCache(name, options))
    }
    return this.caches.get(name)!
  }
  
  static clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }
  
  static getGlobalStats() {
    const stats = Array.from(this.caches.entries()).map(([name, cache]) => ({
      name,
      ...cache.getStats(),
    }))
    
    return {
      totalCaches: this.caches.size,
      totalSize: stats.reduce((sum, s) => sum + s.size, 0),
      totalMemoryUsage: stats.reduce((sum, s) => sum + s.memoryUsage, 0),
      averageHitRate: stats.reduce((sum, s) => sum + s.hitRate, 0) / stats.length,
      caches: stats,
    }
  }
  
  static invalidateByVersion(version: string): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }
}

export default SmartCache