import { useState, useMemo } from 'react'
import { 
  ChevronRight, 
  Search, 
  BookOpen, 
  Eye,
  Hash,
  FileText,
  BarChart,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

export function EnhancedChapterList({ chapters, onChapterSelect, onPreview }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')

  const filteredChapters = useMemo(() => {
    if (!searchTerm) return chapters
    return chapters.filter(chapter =>
      chapter.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.content.toLowerCase().includes(searchTerm.toLowerCase())
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
  const averageWordCount = chapters.length > 0 ? Math.round(totalWordCount / chapters.length) : 0

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Chapters
            </CardDescription>
            <CardTitle className="text-2xl">{chapters.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Words
            </CardDescription>
            <CardTitle className="text-2xl">{totalWordCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/20 to-accent/10">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Average per Chapter
            </CardDescription>
            <CardTitle className="text-2xl">{averageWordCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Chapter List Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Chapter Overview
              </CardTitle>
              <CardDescription>
                Navigate and manage your novel chapters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                Compact
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                Detailed
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No chapters found matching your search' : 'No chapters available'}
                </p>
              </div>
            ) : (
              <div className={cn(
                "divide-y divide-border",
                viewMode === 'compact' ? "space-y-0" : "space-y-0"
              )}>
                {filteredChapters.map((chapter, index) => (
                  <div
                    key={chapter.id || index}
                    className={cn(
                      "group relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-200",
                      "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
                      selectedChapter?.id === chapter.id && "bg-gradient-to-r from-primary/10 to-transparent",
                      viewMode === 'compact' ? "py-3" : "py-5"
                    )}
                    onClick={() => handleChapterClick(chapter)}
                  >
                    {/* Chapter Number */}
                    <div className={cn(
                      "flex items-center justify-center rounded-lg font-semibold",
                      "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary",
                      viewMode === 'compact' ? "h-10 w-10 text-sm" : "h-12 w-12"
                    )}>
                      {chapter.order || index + 1}
                    </div>
                    
                    {/* Chapter Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={cn(
                            "font-semibold truncate",
                            viewMode === 'compact' ? "text-sm" : "text-base"
                          )}>
                            {chapter.chapterTitle}
                          </p>
                          {viewMode === 'detailed' && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {chapter.content.substring(0, 150)}...
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {chapter.content?.length || 0} characters
                            </Badge>
                            {searchTerm && chapter.content.toLowerCase().includes(searchTerm.toLowerCase()) && (
                              <Badge variant="outline" className="text-xs">
                                <Filter className="h-3 w-3 mr-1" />
                                Content match
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onPreview && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10"
                              onClick={(e) => handlePreview(chapter, e)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}