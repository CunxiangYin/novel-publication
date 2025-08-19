import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ChevronDown, ChevronUp } from 'lucide-react'

interface Chapter {
  id: string
  chapterTitle: string
  content: string
  order: number
}

interface ChapterListWithSkeletonProps {
  chapters: Chapter[]
  onPreview?: (chapter: Chapter) => void
  isLoading?: boolean
}

// 骨架屏组件
function ChapterSkeleton() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

export function ChapterListWithSkeleton({ 
  chapters, 
  onPreview,
  isLoading = false 
}: ChapterListWithSkeletonProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [loadingChapter, setLoadingChapter] = useState<string | null>(null)

  // 模拟章节内容加载
  const handleToggleExpand = async (chapterId: string) => {
    if (expandedChapters.has(chapterId)) {
      setExpandedChapters(prev => {
        const newSet = new Set(prev)
        newSet.delete(chapterId)
        return newSet
      })
    } else {
      setLoadingChapter(chapterId)
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      setExpandedChapters(prev => new Set(prev).add(chapterId))
      setLoadingChapter(null)
    }
  }

  // 显示骨架屏
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <ChapterSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <Card 
          key={chapter.id} 
          className="transition-all duration-200 hover:shadow-lg"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                第{chapter.order}章 {chapter.chapterTitle}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleExpand(chapter.id)}
                  disabled={loadingChapter === chapter.id}
                >
                  {loadingChapter === chapter.id ? (
                    <Skeleton className="h-4 w-4" />
                  ) : expandedChapters.has(chapter.id) ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      收起
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      展开
                    </>
                  )}
                </Button>
                {onPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(chapter)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    预览
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {expandedChapters.has(chapter.id) && (
            <CardContent className="animate-fadeIn">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground line-clamp-5">
                  {chapter.content}
                </p>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                字数：{chapter.content.length} 字
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}