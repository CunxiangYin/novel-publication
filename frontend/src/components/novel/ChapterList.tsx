import { useState, useMemo } from 'react'
import { ChevronRight, Search, BookOpen, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Chapter {
  id: string
  chapterTitle: string
  content: string
  wordCount?: number
  order?: number
}

interface ChapterListProps {
  chapters: Chapter[]
  onChapterSelect?: (chapter: Chapter) => void
  onPreview?: (chapter: Chapter) => void
}

export function ChapterList({ chapters, onChapterSelect, onPreview }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  const filteredChapters = useMemo(() => {
    if (!searchTerm) return chapters
    return chapters.filter(chapter =>
      chapter.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [chapters, searchTerm])

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    onChapterSelect?.(chapter)
  }

  const handlePreview = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview?.(chapter)
  }

  const totalWordCount = chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          章节列表
          <Badge variant="secondary" className="ml-auto">
            {chapters.length} 章
          </Badge>
          <Badge variant="outline">
            {totalWordCount.toLocaleString()} 字
          </Badge>
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索章节..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          <div className="space-y-1 p-4">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? '未找到匹配的章节' : '暂无章节'}
              </div>
            ) : (
              filteredChapters.map((chapter, index) => (
                <div
                  key={chapter.id || index}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg p-3",
                    "hover:bg-accent cursor-pointer transition-colors",
                    selectedChapter?.id === chapter.id && "bg-accent"
                  )}
                  onClick={() => handleChapterClick(chapter)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    {chapter.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chapter.chapterTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {chapter.content?.length || 0} 字
                    </p>
                  </div>
                  {onPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handlePreview(chapter, e)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}