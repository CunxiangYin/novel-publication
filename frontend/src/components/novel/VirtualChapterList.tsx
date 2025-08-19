import { memo, CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface Chapter {
  id: string
  chapterTitle: string
  content: string
  order: number
}

interface VirtualChapterListProps {
  chapters: Chapter[]
  onPreview?: (chapter: Chapter) => void
  height?: number
}

// 单个章节项组件
const ChapterRow = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number
  style: CSSProperties
  data: { chapters: Chapter[], onPreview?: (chapter: Chapter) => void }
}) => {
  const chapter = data.chapters[index]
  
  return (
    <div style={style} className="px-4">
      <Card className="mb-2">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              第{chapter.order}章 {chapter.chapterTitle}
            </CardTitle>
            {data.onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => data.onPreview!(chapter)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {chapter.content}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            约 {Math.round(chapter.content.length / 100) * 100} 字
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ChapterRow.displayName = 'ChapterRow'

export function VirtualChapterList({ 
  chapters, 
  onPreview,
  height = 600 
}: VirtualChapterListProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>章节列表（虚拟滚动）</CardTitle>
        <p className="text-sm text-muted-foreground">
          共 {chapters.length} 章，约 {chapters.reduce((sum, ch) => sum + ch.content.length, 0).toLocaleString()} 字
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <List
          height={height}
          itemCount={chapters.length}
          itemSize={140} // 每个章节项的高度
          width="100%"
          itemData={{ chapters, onPreview }}
        >
          {ChapterRow}
        </List>
      </CardContent>
    </Card>
  )
}