import React, { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from './ErrorBoundary'

// Lazy load major page components with better error handling
export const LazyHome = lazy(() => 
  import('./pages/Home').catch(() => ({ 
    default: () => <div>Failed to load Home component</div> 
  }))
)

export const LazyNovelEditor = lazy(() => 
  import('./pages/NovelEditor').catch(() => ({ 
    default: () => <div>Failed to load Novel Editor</div> 
  }))
)

export const LazyAnalytics = lazy(() => 
  import('./pages/Analytics').catch(() => ({ 
    default: () => <div>Failed to load Analytics</div> 
  }))
)

export const LazySettings = lazy(() => 
  import('./pages/Settings').catch(() => ({ 
    default: () => <div>Failed to load Settings</div> 
  }))
)

// Enhanced UI components with better loading states
export const LazyPublishDialog = lazy(() => 
  import('@/components/ui/publish-dialog').then(module => ({ 
    default: module.PublishDialog 
  })).catch(() => ({ 
    default: () => <div>Failed to load Publish Dialog</div> 
  }))
)

export const LazyChapterEditor = lazy(() => 
  import('@/components/ui/chapter-editor').then(module => ({ 
    default: module.ChapterEditor 
  })).catch(() => ({ 
    default: () => <div>Failed to load Chapter Editor</div> 
  }))
)

export const LazyDataTable = lazy(() => 
  import('@/components/ui/table').then(module => ({ 
    default: module.DataTable 
  })).catch(() => ({ 
    default: () => <div>Failed to load Data Table</div> 
  }))
)

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/components/ui/chart').then(module => ({ 
    default: module.AnalyticsDashboard 
  })).catch(() => ({ 
    default: () => <div>Failed to load Analytics Dashboard</div> 
  }))
)

// Enhanced loading fallback components
interface LoadingFallbackProps {
  text?: string
  fullScreen?: boolean
  height?: string | number
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  text = "加载中...", 
  fullScreen = false,
  height = "200px" 
}) => (
  <div 
    className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}
    style={!fullScreen ? { height } : undefined}
  >
    <LoadingSpinner text={text} size="lg" />
  </div>
)

// Page-specific loading fallbacks
export const PageLoadingFallback = () => (
  <LoadingFallback text="页面加载中..." fullScreen />
)

export const ComponentLoadingFallback = () => (
  <LoadingFallback text="组件加载中..." height="100px" />
)

export const DialogLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner text="对话框加载中..." />
  </div>
)

// Enhanced Suspense wrapper with error boundary
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <ComponentLoadingFallback />,
  onError
}) => (
  <ErrorBoundary onError={onError}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

// Page-level lazy wrapper
export const LazyPageWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <PageLoadingFallback />,
  onError
}) => (
  <ErrorBoundary onError={onError}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

// Utility function for dynamic imports with retry logic
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  retries = 3,
  delay = 1000
) {
  return lazy(async () => {
    let lastError: Error
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn()
      } catch (error) {
        lastError = error as Error
        
        // If it's not a network error, don't retry
        if (!error.toString().includes('Loading chunk')) {
          break
        }
        
        // Wait before retrying
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }
    
    // Return error component if all retries failed
    return { 
      default: () => (
        <div className="text-center p-4 text-red-500">
          <p>组件加载失败</p>
          <p className="text-sm opacity-70">{lastError?.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            重新加载
          </button>
        </div>
      )
    }
  })
}

// Preload utilities for better UX
export class ComponentPreloader {
  private static preloadPromises = new Map<string, Promise<any>>()
  
  static preload(key: string, importFn: () => Promise<any>) {
    if (!this.preloadPromises.has(key)) {
      this.preloadPromises.set(key, importFn().catch(() => {}))
    }
    return this.preloadPromises.get(key)
  }
  
  static preloadAll() {
    // Preload critical components
    this.preload('publish-dialog', () => import('@/components/ui/publish-dialog'))
    this.preload('chapter-editor', () => import('@/components/ui/chapter-editor'))
    this.preload('data-table', () => import('@/components/ui/table'))
    this.preload('charts', () => import('@/components/ui/chart'))
  }
  
  static getPreloadStatus() {
    const promises = Array.from(this.preloadPromises.values())
    return Promise.allSettled(promises)
  }
}

// Hook for component preloading
export function useComponentPreloader() {
  React.useEffect(() => {
    // Start preloading components after initial render
    const timer = setTimeout(() => {
      ComponentPreloader.preloadAll()
    }, 1000) // Delay to not interfere with initial page load
    
    return () => clearTimeout(timer)
  }, [])
  
  return {
    preload: ComponentPreloader.preload,
    preloadAll: ComponentPreloader.preloadAll,
    getPreloadStatus: ComponentPreloader.getPreloadStatus,
  }
}