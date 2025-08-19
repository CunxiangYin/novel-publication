import { useEffect, useRef, useState, useCallback } from 'react'

// Performance metrics types
interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  memoryUsage?: number
  bundleSize?: number
  networkRequests: number
  cacheHitRate: number
}

interface RenderMetrics {
  componentName: string
  renderTime: number
  rerenderCount: number
  lastRenderTime: Date
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName?: string) {
  const renderStart = useRef<number>(Date.now())
  const renderCount = useRef<number>(0)
  const [metrics, setMetrics] = useState<RenderMetrics>({
    componentName: componentName || 'Unknown',
    renderTime: 0,
    rerenderCount: 0,
    lastRenderTime: new Date(),
  })

  useEffect(() => {
    const renderTime = Date.now() - renderStart.current
    renderCount.current += 1
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      rerenderCount: renderCount.current,
      lastRenderTime: new Date(),
    }))
    
    // Warn if render time is too slow
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`)
    }
    
    // Reset render start time
    renderStart.current = Date.now()
  })

  return metrics
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      // @ts-ignore - performance.memory is available in Chrome
      if ('memory' in performance) {
        // @ts-ignore
        setMemoryInfo(performance.memory)
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Bundle size analyzer
export function useBundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState({
    totalSize: 0,
    chunkSizes: [] as Array<{ name: string; size: number }>,
    compressionRatio: 0,
  })

  useEffect(() => {
    // Simulate bundle analysis (in real app, this would connect to build tools)
    const analyzeBundles = async () => {
      try {
        // This would typically fetch from a webpack-bundle-analyzer endpoint
        // or parse build statistics
        const chunks = [
          { name: 'main', size: 250000 },
          { name: 'vendor', size: 800000 },
          { name: 'runtime', size: 50000 },
        ]
        
        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
        
        setBundleInfo({
          totalSize,
          chunkSizes: chunks,
          compressionRatio: 0.7, // Simulated gzip ratio
        })
      } catch (error) {
        console.error('Bundle analysis failed:', error)
      }
    }

    analyzeBundles()
  }, [])

  return bundleInfo
}

// Network performance monitoring
export function useNetworkMonitor() {
  const [networkMetrics, setNetworkMetrics] = useState({
    requestCount: 0,
    failedRequests: 0,
    averageLatency: 0,
    cacheHitRate: 0,
  })

  const trackRequest = useCallback((url: string, startTime: number, success: boolean, fromCache: boolean = false) => {
    const latency = Date.now() - startTime
    
    setNetworkMetrics(prev => {
      const newRequestCount = prev.requestCount + 1
      const newFailedRequests = prev.failedRequests + (success ? 0 : 1)
      const newAverageLatency = (prev.averageLatency * prev.requestCount + latency) / newRequestCount
      const cacheHits = fromCache ? 1 : 0
      const newCacheHitRate = newRequestCount > 0 ? 
        ((prev.cacheHitRate * prev.requestCount) + cacheHits) / newRequestCount : 0

      return {
        requestCount: newRequestCount,
        failedRequests: newFailedRequests,
        averageLatency: newAverageLatency,
        cacheHitRate: newCacheHitRate,
      }
    })
  }, [])

  return { networkMetrics, trackRequest }
}

// Core Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState({
    fcp: 0,  // First Contentful Paint
    lcp: 0,  // Largest Contentful Paint
    fid: 0,  // First Input Delay
    cls: 0,  // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
  })

  useEffect(() => {
    // FCP
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setVitals(prev => ({ ...prev, fcp: entry.startTime }))
        }
      }
    })
    observer.observe({ type: 'paint', buffered: true })

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }))
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

    // FID
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
      }
    })
    fidObserver.observe({ type: 'first-input', buffered: true })

    // CLS
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          setVitals(prev => ({ ...prev, cls: clsValue }))
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })

    return () => {
      observer.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  return vitals
}

// Performance optimization utilities
export class PerformanceOptimizer {
  private static observers = new Map<string, IntersectionObserver>()
  
  // Lazy loading with intersection observer
  static createLazyObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) {
    const key = JSON.stringify(options)
    
    if (!this.observers.has(key)) {
      this.observers.set(key, new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }))
    }
    
    return this.observers.get(key)!
  }
  
  // Image lazy loading
  static lazyLoadImage(img: HTMLImageElement, src: string) {
    const observer = this.createLazyObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          target.src = src
          target.classList.remove('lazy-loading')
          target.classList.add('lazy-loaded')
          observer.unobserve(target)
        }
      })
    })
    
    img.classList.add('lazy-loading')
    observer.observe(img)
  }
  
  // Component lazy mounting
  static lazyMountComponent(
    element: Element,
    mountCallback: () => void,
    unmountCallback?: () => void
  ) {
    const observer = this.createLazyObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mountCallback()
        } else if (unmountCallback) {
          unmountCallback()
        }
      })
    })
    
    observer.observe(element)
    
    return () => observer.unobserve(element)
  }
  
  // Debounced function creator
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): T {
    let timeout: NodeJS.Timeout | null = null
    
    return ((...args: any[]) => {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      
      const callNow = immediate && !timeout
      
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (callNow) func(...args)
    }) as T
  }
  
  // Throttled function creator
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean
    
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  }
  
  // Resource prefetching
  static prefetchResource(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch') {
    if (type === 'fetch') {
      fetch(url, { mode: 'no-cors' }).catch(() => {})
      return
    }
    
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    
    if (type === 'script') {
      link.as = 'script'
    } else if (type === 'style') {
      link.as = 'style'
    } else if (type === 'image') {
      link.as = 'image'
    }
    
    document.head.appendChild(link)
  }
  
  // Preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      '/api/novel/list',
      '/fonts/inter.woff2',
      // Add other critical resources
    ]
    
    criticalResources.forEach(url => {
      this.prefetchResource(url)
    })
  }
}

// Comprehensive performance hook
export function usePerformanceOptimization(componentName?: string) {
  const renderMetrics = usePerformanceMonitor(componentName)
  const memoryInfo = useMemoryMonitor()
  const bundleInfo = useBundleAnalyzer()
  const { networkMetrics, trackRequest } = useNetworkMonitor()
  const webVitals = useWebVitals()

  const performanceScore = React.useMemo(() => {
    // Calculate a simple performance score (0-100)
    let score = 100
    
    // Penalize slow renders
    if (renderMetrics.renderTime > 50) score -= 10
    if (renderMetrics.renderTime > 100) score -= 20
    
    // Penalize excessive rerenders
    if (renderMetrics.rerenderCount > 5) score -= 5 * (renderMetrics.rerenderCount - 5)
    
    // Penalize poor web vitals
    if (webVitals.fcp > 2000) score -= 10 // FCP > 2s
    if (webVitals.lcp > 4000) score -= 15 // LCP > 4s
    if (webVitals.fid > 300) score -= 10 // FID > 300ms
    if (webVitals.cls > 0.25) score -= 10 // CLS > 0.25
    
    // Penalize network issues
    if (networkMetrics.failedRequests / networkMetrics.requestCount > 0.1) score -= 15
    if (networkMetrics.averageLatency > 1000) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }, [renderMetrics, webVitals, networkMetrics])

  const recommendations = React.useMemo(() => {
    const recs: string[] = []
    
    if (renderMetrics.renderTime > 100) {
      recs.push('Consider memoizing expensive calculations or using React.memo')
    }
    
    if (renderMetrics.rerenderCount > 10) {
      recs.push('Reduce unnecessary re-renders by optimizing state updates')
    }
    
    if (webVitals.lcp > 4000) {
      recs.push('Optimize Largest Contentful Paint by preloading critical resources')
    }
    
    if (webVitals.cls > 0.25) {
      recs.push('Reduce Cumulative Layout Shift by reserving space for dynamic content')
    }
    
    if (networkMetrics.cacheHitRate < 0.7) {
      recs.push('Improve caching strategy to reduce network requests')
    }
    
    if (bundleInfo.totalSize > 1000000) {
      recs.push('Consider code splitting to reduce bundle size')
    }
    
    return recs
  }, [renderMetrics, webVitals, networkMetrics, bundleInfo])

  return {
    renderMetrics,
    memoryInfo,
    bundleInfo,
    networkMetrics,
    webVitals,
    performanceScore,
    recommendations,
    trackRequest,
    optimizer: PerformanceOptimizer,
  }
}

export default usePerformanceOptimization