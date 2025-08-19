import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// 懒加载组件
export const LazyNovelForm = lazy(() => import('@/components/novel/NovelForm').then(module => ({ default: module.NovelForm })))
export const LazyChapterList = lazy(() => import('@/components/novel/ChapterList').then(module => ({ default: module.ChapterList })))
export const LazyFileUploader = lazy(() => import('@/components/upload/FileUploader').then(module => ({ default: module.FileUploader })))
export const LazyAdvancedThemeToggle = lazy(() => import('@/components/theme/AdvancedThemeToggle').then(module => ({ default: module.AdvancedThemeToggle })))

// 加载占位组件
export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}

export function UploaderSkeleton() {
  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// 懒加载包装器
export function LazyLoad({ 
  component: Component, 
  fallback,
  ...props 
}: { 
  component: React.LazyExoticComponent<React.ComponentType<any>>
  fallback?: React.ReactNode
  [key: string]: any 
}) {
  return (
    <Suspense fallback={fallback || <Skeleton className="h-64 w-full" />}>
      <Component {...props} />
    </Suspense>
  )
}