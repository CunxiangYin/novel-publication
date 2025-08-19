import { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Eye, Edit, Split, Maximize2, Minimize2, Download, Upload,
  Bold, Italic, Link, Image, Code, List, ListOrdered, Quote, Heading
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: string
  showToolbar?: boolean
  distractionFree?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '# 开始写作\n\n在这里输入 Markdown 内容...',
  className,
  height = '500px',
  showToolbar = true,
  distractionFree = false
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [lineCount, setLineCount] = useState(1)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算字数和行数
  useEffect(() => {
    setWordCount(value.length)
    setLineCount(value.split('\n').length)
  }, [value])

  // 插入 Markdown 语法
  const insertMarkdown = useCallback((syntax: string, wrap = false) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText = ''
    let newCursorPos = start

    if (wrap && selectedText) {
      // 包裹选中的文本
      switch (syntax) {
        case 'bold':
          newText = `**${selectedText}**`
          newCursorPos = start + 2
          break
        case 'italic':
          newText = `*${selectedText}*`
          newCursorPos = start + 1
          break
        case 'code':
          newText = `\`${selectedText}\``
          newCursorPos = start + 1
          break
        case 'link':
          newText = `[${selectedText}](url)`
          newCursorPos = start + selectedText.length + 3
          break
        default:
          newText = selectedText
      }
    } else {
      // 插入语法
      switch (syntax) {
        case 'bold':
          newText = '**粗体文本**'
          newCursorPos = start + 2
          break
        case 'italic':
          newText = '*斜体文本*'
          newCursorPos = start + 1
          break
        case 'h1':
          newText = '\n# 一级标题\n'
          newCursorPos = start + 3
          break
        case 'h2':
          newText = '\n## 二级标题\n'
          newCursorPos = start + 4
          break
        case 'h3':
          newText = '\n### 三级标题\n'
          newCursorPos = start + 5
          break
        case 'ul':
          newText = '\n- 列表项\n'
          newCursorPos = start + 3
          break
        case 'ol':
          newText = '\n1. 列表项\n'
          newCursorPos = start + 4
          break
        case 'quote':
          newText = '\n> 引用文本\n'
          newCursorPos = start + 3
          break
        case 'code':
          newText = '\n```\n代码块\n```\n'
          newCursorPos = start + 4
          break
        case 'link':
          newText = '[链接文本](url)'
          newCursorPos = start + 1
          break
        case 'image':
          newText = '![图片描述](url)'
          newCursorPos = start + 2
          break
        default:
          newText = syntax
      }
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)

    // 恢复焦点和光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  // 更新光标位置
  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const pos = textarea.selectionStart
    const textBeforeCursor = value.substring(0, pos)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length
    const currentCol = lines[lines.length - 1].length + 1

    setCursorPosition({ line: currentLine, col: currentCol })
  }, [value])

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  // 导出 Markdown
  const exportMarkdown = useCallback(() => {
    const blob = new Blob([value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [value])

  // 工具栏
  const toolbar = showToolbar && !distractionFree && (
    <div className="border-b p-2 flex items-center justify-between bg-muted/30">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('bold', true)}
          title="粗体 (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('italic', true)}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('h1')}
          title="一级标题"
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('link', true)}
          title="链接"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('image')}
          title="图片"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('code', true)}
          title="代码"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('ul')}
          title="无序列表"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('ol')}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('quote')}
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            <Split className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={exportMarkdown}
          title="导出 Markdown"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // 状态栏
  const statusBar = !distractionFree && (
    <div className="border-t px-3 py-1 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
      <div className="flex gap-4">
        <span>字数: {wordCount}</span>
        <span>行数: {lineCount}</span>
        <span>行:列 {cursorPosition.line}:{cursorPosition.col}</span>
      </div>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs">Markdown</Badge>
        <Badge variant="outline" className="text-xs">{viewMode === 'split' ? '分屏' : viewMode === 'edit' ? '编辑' : '预览'}</Badge>
      </div>
    </div>
  )

  return (
    <div 
      ref={containerRef}
      className={cn(
        'border rounded-lg overflow-hidden bg-background',
        isFullscreen && 'fixed inset-0 z-50',
        distractionFree && 'border-0 shadow-none',
        className
      )}
    >
      {toolbar}
      
      <div 
        className={cn(
          'flex',
          viewMode === 'split' && 'divide-x'
        )}
        style={{ height: isFullscreen ? 'calc(100vh - 100px)' : height }}
      >
        {/* 编辑器 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={cn(
            'flex-1 relative',
            viewMode === 'split' && 'w-1/2'
          )}>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onSelect={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              placeholder={placeholder}
              className={cn(
                'w-full h-full resize-none border-0 focus:ring-0 p-4',
                'font-mono text-sm bg-transparent',
                distractionFree && 'text-lg leading-relaxed max-w-3xl mx-auto'
              )}
              style={{ 
                outline: 'none',
                boxShadow: 'none'
              }}
            />
          </div>
        )}

        {/* 预览 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={cn(
            'flex-1 overflow-y-auto p-4',
            viewMode === 'split' && 'w-1/2',
            'prose prose-sm max-w-none',
            'prose-headings:text-foreground',
            'prose-p:text-muted-foreground',
            'prose-strong:text-foreground',
            'prose-code:text-primary',
            'prose-blockquote:border-l-primary',
            'prose-blockquote:text-muted-foreground',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            distractionFree && 'max-w-3xl mx-auto'
          )}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // 自定义渲染组件
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="px-1 py-0.5 bg-muted rounded text-sm">{children}</code>
                  ) : (
                    <pre className="p-3 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm">{children}</code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                    {children}
                  </blockquote>
                )
              }}
            >
              {value || '*开始输入 Markdown 内容以查看预览...*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {statusBar}
    </div>
  )
}