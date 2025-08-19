import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePerformanceMonitor, useMemoryMonitor, useWebVitals, PerformanceOptimizer } from '../usePerformance'

// Mock performance APIs
const mockPerformanceObserver = vi.fn()
global.PerformanceObserver = mockPerformanceObserver

beforeEach(() => {
  vi.useFakeTimers()
  mockPerformanceObserver.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePerformanceMonitor', () => {
  it('tracks render metrics correctly', () => {
    const { result, rerender } = renderHook(() => 
      usePerformanceMonitor('TestComponent')
    )

    const initialMetrics = result.current
    expect(initialMetrics.componentName).toBe('TestComponent')
    expect(initialMetrics.rerenderCount).toBe(1)
    expect(initialMetrics.renderTime).toBeGreaterThanOrEqual(0)

    // Simulate rerender
    rerender()
    
    const updatedMetrics = result.current
    expect(updatedMetrics.rerenderCount).toBe(2)
  })

  it('warns about slow renders', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Mock Date.now to simulate slow render
    const originalDateNow = Date.now
    let callCount = 0
    vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++
      return callCount === 1 ? 0 : 150 // 150ms render time
    })

    renderHook(() => usePerformanceMonitor('SlowComponent'))

    expect(consoleSpy).toHaveBeenCalledWith(
      'Slow render detected in SlowComponent: 150ms'
    )

    Date.now = originalDateNow
    consoleSpy.mockRestore()
  })

  it('defaults component name when not provided', () => {
    const { result } = renderHook(() => usePerformanceMonitor())
    
    expect(result.current.componentName).toBe('Unknown')
  })
})

describe('useMemoryMonitor', () => {
  it('returns null when performance.memory is not available', () => {
    const { result } = renderHook(() => useMemoryMonitor())
    
    expect(result.current).toBeNull()
  })

  it('returns memory info when available', () => {
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 10485760,
        totalJSHeapSize: 52428800,
        jsHeapSizeLimit: 2172649472,
      },
      configurable: true,
    })

    const { result } = renderHook(() => useMemoryMonitor())
    
    expect(result.current).toEqual({
      usedJSHeapSize: 10485760,
      totalJSHeapSize: 52428800,
      jsHeapSizeLimit: 2172649472,
    })
  })

  it('updates memory info periodically', () => {
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 10485760,
        totalJSHeapSize: 52428800,
        jsHeapSizeLimit: 2172649472,
      },
      configurable: true,
    })

    const { result } = renderHook(() => useMemoryMonitor())
    
    // Initial value
    expect(result.current?.usedJSHeapSize).toBe(10485760)
    
    // Update memory and advance timer
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 20485760,
        totalJSHeapSize: 52428800,
        jsHeapSizeLimit: 2172649472,
      },
      configurable: true,
    })
    
    vi.advanceTimersByTime(5000)
    
    // Should update after interval
    expect(result.current?.usedJSHeapSize).toBe(20485760)
  })
})

describe('useWebVitals', () => {
  it('initializes with zero values', () => {
    const { result } = renderHook(() => useWebVitals())
    
    expect(result.current).toEqual({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
    })
  })

  it('sets up performance observers', () => {
    renderHook(() => useWebVitals())
    
    // Should create observers for different metrics
    expect(mockPerformanceObserver).toHaveBeenCalled()
  })
})

describe('PerformanceOptimizer', () => {
  describe('createLazyObserver', () => {
    it('creates intersection observer with default options', () => {
      const callback = vi.fn()
      const observer = PerformanceOptimizer.createLazyObserver(callback)
      
      expect(observer).toBeDefined()
      expect(typeof observer.observe).toBe('function')
      expect(typeof observer.unobserve).toBe('function')
    })

    it('creates intersection observer with custom options', () => {
      const callback = vi.fn()
      const options = { threshold: 0.5, rootMargin: '100px' }
      const observer = PerformanceOptimizer.createLazyObserver(callback, options)
      
      expect(observer).toBeDefined()
    })
  })

  describe('debounce', () => {
    it('debounces function calls', () => {
      const fn = vi.fn()
      const debouncedFn = PerformanceOptimizer.debounce(fn, 100)
      
      // Call multiple times quickly
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')
      
      // Function should not be called yet
      expect(fn).not.toHaveBeenCalled()
      
      // Advance timer
      vi.advanceTimersByTime(100)
      
      // Function should be called once with last arguments
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg3')
    })

    it('handles immediate flag correctly', () => {
      const fn = vi.fn()
      const debouncedFn = PerformanceOptimizer.debounce(fn, 100, true)
      
      debouncedFn('immediate')
      
      // Function should be called immediately
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('immediate')
      
      // Subsequent calls should be debounced
      debouncedFn('delayed')
      expect(fn).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1) // Still 1, not called again
    })
  })

  describe('throttle', () => {
    it('throttles function calls', () => {
      const fn = vi.fn()
      const throttledFn = PerformanceOptimizer.throttle(fn, 100)
      
      // First call should execute immediately
      throttledFn('first')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('first')
      
      // Subsequent calls should be throttled
      throttledFn('second')
      throttledFn('third')
      expect(fn).toHaveBeenCalledTimes(1)
      
      // After throttle period
      vi.advanceTimersByTime(100)
      throttledFn('fourth')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenCalledWith('fourth')
    })
  })

  describe('prefetchResource', () => {
    it('creates prefetch link for fetch type', () => {
      const originalAppendChild = document.head.appendChild
      const mockAppendChild = vi.fn()
      document.head.appendChild = mockAppendChild
      
      PerformanceOptimizer.prefetchResource('/api/test', 'fetch')
      
      // For fetch type, it should call fetch with no-cors
      expect(global.fetch).toHaveBeenCalledWith('/api/test', { mode: 'no-cors' })
      
      document.head.appendChild = originalAppendChild
    })

    it('creates prefetch link for script type', () => {
      const originalAppendChild = document.head.appendChild
      const mockAppendChild = vi.fn()
      document.head.appendChild = mockAppendChild
      
      PerformanceOptimizer.prefetchResource('/script.js', 'script')
      
      expect(mockAppendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          rel: 'prefetch',
          href: '/script.js',
          as: 'script',
        })
      )
      
      document.head.appendChild = originalAppendChild
    })
  })

  describe('preloadCriticalResources', () => {
    it('preloads critical resources', () => {
      const prefetchSpy = vi.spyOn(PerformanceOptimizer, 'prefetchResource')
      
      PerformanceOptimizer.preloadCriticalResources()
      
      expect(prefetchSpy).toHaveBeenCalledWith('/api/novel/list')
      expect(prefetchSpy).toHaveBeenCalledWith('/fonts/inter.woff2')
      
      prefetchSpy.mockRestore()
    })
  })
})