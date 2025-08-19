import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSimpleSwipe } from '@/hooks/useSwipeGesture'
import { cn } from '@/lib/utils'

interface Chapter {
  chapterTitle: string
  content: string
  seq?: number
}

interface SwipeableChapterViewProps {
  chapters: Chapter[]
  initialChapter?: number
  onChapterChange?: (index: number) => void
}

export function SwipeableChapterView({ 
  chapters, 
  initialChapter = 0,
  onChapterChange 
}: SwipeableChapterViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialChapter)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const navigateToChapter = useCallback((index: number) => {
    if (index < 0 || index >= chapters.length) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      onChapterChange?.(index)
      setIsTransitioning(false)
    }, 150)
  }, [chapters.length, onChapterChange])

  const goToPrevious = useCallback(() => {
    navigateToChapter(currentIndex - 1)
  }, [currentIndex, navigateToChapter])

  const goToNext = useCallback(() => {
    navigateToChapter(currentIndex + 1)
  }, [currentIndex, navigateToChapter])

  // 手势支持
  const swipeRef = useSimpleSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    threshold: 50
  })

  const currentChapter = chapters[currentIndex]
  if (!currentChapter) return null

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-lg">{currentChapter.chapterTitle}</span>
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {chapters.length}
          </span>
        </div>
      </CardHeader>
      
      <CardContent 
        ref={swipeRef}
        className={cn(
          "flex-1 overflow-y-auto transition-opacity duration-150",
          isTransitioning && "opacity-50"
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap leading-relaxed">
            {currentChapter.content}
          </p>
        </div>
        
        {/* Touch Hint for Mobile */}
        <div className="md:hidden mt-8 text-center text-xs text-muted-foreground">
          <p>← 左右滑动切换章节 →</p>
        </div>
      </CardContent>

      {/* Navigation Controls */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一章
          </Button>
          
          {/* Chapter Selector */}
          <select
            value={currentIndex}
            onChange={(e) => navigateToChapter(Number(e.target.value))}
            className="px-3 py-1 text-sm border rounded-md bg-background"
          >
            {chapters.map((ch, idx) => (
              <option key={idx} value={idx}>
                {idx + 1}. {ch.chapterTitle}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === chapters.length - 1}
            className="flex-1"
          >
            下一章
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}