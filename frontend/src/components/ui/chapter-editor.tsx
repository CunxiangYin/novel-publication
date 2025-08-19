import * as React from "react"
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Eye,
  Edit3,
} from "lucide-react"

import { Button } from "./button"
import { Separator } from "@radix-ui/react-separator"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Input } from "./input"
import { Label } from "./label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { LoadingSpinner } from "./loading-spinner"
import { SimpleTooltip } from "./tooltip"
import { cn } from "@/lib/utils"

export interface Chapter {
  id: string
  title: string
  content: string
  wordCount: number
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface ChapterEditorProps {
  chapter?: Chapter
  onSave: (chapter: Partial<Chapter>) => Promise<void>
  onCancel?: () => void
  className?: string
  readOnly?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  placeholder?: string
  maxWords?: number
}

const TOOLBAR_GROUPS = [
  {
    name: 'history',
    items: [
      { name: 'undo', icon: Undo, label: '撤销', command: 'undo' },
      { name: 'redo', icon: Redo, label: '重做', command: 'redo' },
    ],
  },
  {
    name: 'formatting',
    items: [
      { name: 'bold', icon: Bold, label: '加粗', command: 'toggleBold' },
      { name: 'italic', icon: Italic, label: '斜体', command: 'toggleItalic' },
    ],
  },
  {
    name: 'lists',
    items: [
      { name: 'bulletList', icon: List, label: '无序列表', command: 'toggleBulletList' },
      { name: 'orderedList', icon: ListOrdered, label: '有序列表', command: 'toggleOrderedList' },
    ],
  },
  {
    name: 'blocks',
    items: [
      { name: 'blockquote', icon: Quote, label: '引用', command: 'toggleBlockquote' },
    ],
  },
]

const ChapterEditor = ({
  chapter,
  onSave,
  onCancel,
  className,
  readOnly = false,
  autoSave = true,
  autoSaveInterval = 30000, // 30秒自动保存
  placeholder = "开始编写您的章节内容...",
  maxWords = 10000,
}: ChapterEditorProps) => {
  const [title, setTitle] = React.useState(chapter?.title || "")
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [wordCount, setWordCount] = React.useState(0)
  const [mode, setMode] = React.useState<'edit' | 'preview'>('edit')
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4 leading-relaxed',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-semibold mb-3 mt-6',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic my-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6 mb-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6 mb-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
      }),
    ],
    content: chapter?.content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setWordCount(text.length)
      setHasUnsavedChanges(true)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] px-4 py-4',
        placeholder,
      },
    },
  })

  // 自动保存功能
  React.useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || readOnly) return

    const timer = setTimeout(() => {
      handleSave(true)
    }, autoSaveInterval)

    return () => clearTimeout(timer)
  }, [autoSave, hasUnsavedChanges, autoSaveInterval, title, editor?.getHTML()])

  // 初始字数统计
  React.useEffect(() => {
    if (editor) {
      setWordCount(editor.getText().length)
    }
  }, [editor])

  const handleSave = async (isAutoSave = false) => {
    if (!editor || isSaving) return

    try {
      setIsSaving(true)
      
      const chapterData: Partial<Chapter> = {
        id: chapter?.id || `chapter-${Date.now()}`,
        title: title.trim() || "未命名章节",
        content: editor.getHTML(),
        wordCount,
        order: chapter?.order || 0,
      }

      await onSave(chapterData)
      
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      
      if (!isAutoSave) {
        // 显示保存成功提示
      }
    } catch (error) {
      console.error('保存失败:', error)
      // 显示错误提示
    } finally {
      setIsSaving(false)
    }
  }

  const ToolbarButton = ({ 
    item, 
    isActive, 
    onClick 
  }: { 
    item: any, 
    isActive?: boolean, 
    onClick: () => void 
  }) => (
    <SimpleTooltip content={item.label}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          isActive && "bg-accent text-accent-foreground"
        )}
        onClick={onClick}
        disabled={readOnly}
      >
        <item.icon className="h-4 w-4" />
      </Button>
    </SimpleTooltip>
  )

  const renderToolbar = () => (
    <div className="flex items-center justify-between border-b p-2">
      <div className="flex items-center gap-1">
        {TOOLBAR_GROUPS.map((group, groupIndex) => (
          <React.Fragment key={group.name}>
            {group.items.map((item) => {
              const isActive = editor?.isActive(item.command.replace('toggle', '').toLowerCase())
              
              return (
                <ToolbarButton
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  onClick={() => {
                    if (item.command === 'undo') {
                      editor?.commands.undo()
                    } else if (item.command === 'redo') {
                      editor?.commands.redo()
                    } else {
                      // @ts-ignore
                      editor?.chain().focus()[item.command]().run()
                    }
                  }}
                />
              )
            })}
            {groupIndex < TOOLBAR_GROUPS.length - 1 && (
              <Separator orientation="vertical" className="mx-1 h-6" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">
          {wordCount} / {maxWords} 字
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="h-8"
          >
            {mode === 'edit' ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                预览
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                编辑
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving || !hasUnsavedChanges}
            className="h-8"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            保存
          </Button>
        </div>
      </div>
    </div>
  )

  const renderStatusBar = () => (
    <div className="flex items-center justify-between border-t p-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {hasUnsavedChanges && (
          <span className="text-amber-600">• 有未保存的更改</span>
        )}
        {lastSaved && (
          <span>最后保存: {lastSaved.toLocaleTimeString()}</span>
        )}
        {wordCount > maxWords && (
          <span className="text-red-600 font-medium">
            超出字数限制 {wordCount - maxWords} 字
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {autoSave && !readOnly && (
          <span>自动保存已启用</span>
        )}
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className="p-4 max-w-none prose prose-sm">
      <h2 className="text-xl font-semibold mb-4">{title || "未命名章节"}</h2>
      <div 
        className="leading-relaxed"
        dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
      />
    </div>
  )

  if (!editor) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner text="编辑器加载中..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">章节编辑器</CardTitle>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              取消
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chapter-title">章节标题</Label>
          <Input
            id="chapter-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setHasUnsavedChanges(true)
            }}
            placeholder="输入章节标题"
            disabled={readOnly}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'edit' | 'preview')}>
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="edit" className="flex-1">编辑</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">预览</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0">
            {renderToolbar()}
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
              <EditorContent 
                editor={editor} 
                className={cn(
                  "focus-within:outline-none",
                  wordCount > maxWords && "text-red-600"
                )}
              />
            </div>
            {renderStatusBar()}
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto border-t">
              {renderPreview()}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Hook for managing multiple chapters
export function useChapterEditor() {
  const [chapters, setChapters] = React.useState<Chapter[]>([])
  const [currentChapter, setCurrentChapter] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const addChapter = (chapter: Chapter) => {
    setChapters(prev => [...prev, chapter])
  }

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    setChapters(prev => 
      prev.map(ch => ch.id === chapterId ? { ...ch, ...updates } : ch)
    )
  }

  const deleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(ch => ch.id !== chapterId))
    if (currentChapter === chapterId) {
      setCurrentChapter(null)
    }
  }

  const reorderChapters = (sourceIndex: number, destinationIndex: number) => {
    const newChapters = Array.from(chapters)
    const [removed] = newChapters.splice(sourceIndex, 1)
    newChapters.splice(destinationIndex, 0, removed)
    
    // 更新order字段
    const reorderedChapters = newChapters.map((ch, index) => ({
      ...ch,
      order: index
    }))
    
    setChapters(reorderedChapters)
  }

  return {
    chapters,
    currentChapter,
    isLoading,
    setCurrentChapter,
    addChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    setChapters,
  }
}

export { ChapterEditor }