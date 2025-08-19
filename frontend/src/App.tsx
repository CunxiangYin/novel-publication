import { useState, useCallback, useEffect } from 'react'
import { BookOpen, Upload, Save, Rocket, FileText, Settings } from 'lucide-react'
import { AdvancedThemeToggle } from '@/components/theme/AdvancedThemeToggle'
import { MobileNavigation } from '@/components/mobile/MobileNavigation'
import { SwipeableChapterView } from '@/components/novel/SwipeableChapterView'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// 懒加载组件
const FileUploader = lazy(() => import('@/components/upload/FileUploader').then(m => ({ default: m.FileUploader })))
const NovelForm = lazy(() => import('@/components/novel/NovelForm').then(m => ({ default: m.NovelForm })))
const ChapterList = lazy(() => import('@/components/novel/ChapterList').then(m => ({ default: m.ChapterList })))
const VirtualChapterList = lazy(() => import('@/components/novel/VirtualChapterList').then(m => ({ default: m.VirtualChapterList })))
import { useNovelStore } from '@/store/useNovelStore'
import { novelAPI } from '@/services/api'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const {
    novel,
    currentFilePath,
    isDirty,
    setNovel,
    updateNovel,
    setFilePath,
    markClean,
    setError
  } = useNovelStore()

  // 处理文件上传
  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true)
    try {
      // 上传文件
      const uploadResult = await novelAPI.uploadFile(file)
      setFilePath(uploadResult.filePath)
      
      // 解析文件
      const parseResult = await novelAPI.parseNovel(uploadResult.filePath)
      setNovel(parseResult)
      setActiveTab('edit')
    } catch (error) {
      console.error('文件处理失败:', error)
      setError(error instanceof Error ? error.message : '文件处理失败')
    } finally {
      setIsProcessing(false)
    }
  }, [setFilePath, setNovel, setError])

  // 保存修改
  const handleSave = useCallback(async (data: any) => {
    if (!currentFilePath || !novel) return
    
    try {
      const updatedNovel = { ...novel, ...data }
      await novelAPI.updateNovel(currentFilePath, updatedNovel)
      updateNovel(data)
      markClean()
    } catch (error) {
      console.error('保存失败:', error)
      throw error
    }
  }, [currentFilePath, novel, updateNovel, markClean])

  // 发布作品
  const handlePublish = useCallback(async () => {
    if (!novel) return
    
    setIsProcessing(true)
    try {
      const result = await novelAPI.publishNovel(novel)
      console.log('发布成功:', result)
      alert('发布成功！')
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsProcessing(false)
    }
  }, [novel])

  // 章节预览
  const handleChapterPreview = useCallback((chapter: any) => {
    const previewContent = chapter.content.substring(0, 500)
    alert(`${chapter.chapterTitle}\n\n${previewContent}...`)
  }, [])

  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasNovel={!!novel}
        />
      )}
      
      {/* Header */}
      <header className="border-b fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 scale-in">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">小说发布系统</h1>
                <p className="text-sm text-muted-foreground">智能解析 • AI生成 • 一键发布</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AdvancedThemeToggle />
              {novel && (
                <>
                  <Badge variant={isDirty ? "destructive" : "default"}>
                    {isDirty ? "未保存" : "已保存"}
                  </Badge>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSave(novel)}
                    disabled={!isDirty || isProcessing}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  <Button 
                    onClick={handlePublish}
                    disabled={isProcessing}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    发布
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8 stagger-animation">
            <TabsTrigger value="upload" className="transition-all-smooth">
              <Upload className="mr-2 h-4 w-4" />
              上传文件
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!novel} className="transition-all-smooth">
              <FileText className="mr-2 h-4 w-4" />
              编辑信息
            </TabsTrigger>
            <TabsTrigger value="chapters" disabled={!novel} className="transition-all-smooth">
              <BookOpen className="mr-2 h-4 w-4" />
              章节管理
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!novel} className="transition-all-smooth">
              <Settings className="mr-2 h-4 w-4" />
              发布设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card className="fade-in hover-lift">
                <CardHeader>
                  <CardTitle>上传小说文件</CardTitle>
                  <CardDescription>
                    支持 Markdown (.md) 格式的小说文件，系统将自动解析并生成元数据
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="border-2 border-dashed rounded-lg p-8">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  }>
                    <FileUploader 
                      onFileSelect={handleFileSelect}
                      accept=".md"
                      maxSize={10485760}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {currentFilePath && (
                <Card>
                  <CardHeader>
                    <CardTitle>当前文件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{currentFilePath}</p>
                    {novel && (
                      <div className="flex gap-4 mt-4">
                        <Badge variant="outline">
                          {novel.metadata?.chapterCount || 0} 章节
                        </Badge>
                        <Badge variant="outline">
                          {novel.metadata?.wordCount?.toLocaleString() || 0} 字
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            {novel && (
              <div className="max-w-4xl mx-auto">
                <Suspense fallback={
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <NovelForm
                    initialData={novel}
                    onSubmit={handleSave}
                  />
                </Suspense>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chapters" className="space-y-6">
            {novel && (
              <div className="max-w-4xl mx-auto">
                {isMobile ? (
                  <SwipeableChapterView
                    chapters={novel.chapterList}
                    onChapterChange={(idx) => console.log('Chapter changed to:', idx)}
                  />
                ) : novel.chapterList.length > 50 ? (
                  // 大量章节使用虚拟滚动
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <VirtualChapterList
                      chapters={novel.chapterList.map((ch, idx) => ({
                        id: `chapter-${idx}`,
                        chapterTitle: ch.chapterTitle,
                        content: ch.content,
                        order: idx + 1
                      }))}
                      onPreview={handleChapterPreview}
                    />
                  </Suspense>
                ) : (
                  // 少量章节使用普通列表
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ChapterList
                      chapters={novel.chapterList.map((ch, idx) => ({
                        id: `chapter-${idx}`,
                        chapterTitle: ch.chapterTitle,
                        content: ch.content,
                        order: idx + 1
                      }))}
                      onPreview={handleChapterPreview}
                    />
                  </Suspense>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>发布设置</CardTitle>
                  <CardDescription>
                    配置发布平台和相关参数
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">目标平台</h3>
                    <Badge>微信读书</Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">发布状态</h3>
                    <Badge variant="secondary">完结</Badge>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">发布地址</h3>
                    <p className="text-sm text-muted-foreground">
                      https://wxrd.alongmen.com/book/v1/uploadBookInfo
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handlePublish}
                    disabled={!novel || isProcessing}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    立即发布
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
