import { useState, useCallback, Fragment } from 'react'
import { novelAPI } from './services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Upload, 
  Save, 
  Rocket, 
  BookOpen, 
  Edit, 
  Settings, 
  FileText,
  Sparkles,
  AlertCircle,
  Check,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Type definitions
interface NovelMetadata {
  chapterCount: number
  wordCount: number
  status: 'draft' | 'completed' | 'published'
}

interface Chapter {
  chapterTitle: string
  chapterContent: string
}

interface NovelData {
  title: string
  author: string
  firstCategory: string
  secondCategory: string
  thirdCategory: string
  intro: string
  awesomeParagraph: string
  coverPrompt?: string
  metadata?: NovelMetadata
  chapterList?: Chapter[]
}

// Custom hook for toast notifications
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])
  
  return { toast, showToast }
}

function OptimizedApp() {
  const [activeTab, setActiveTab] = useState('upload')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [novelData, setNovelData] = useState<NovelData | null>(null)
  const [currentFilePath, setCurrentFilePath] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)
  const { toast, showToast } = useToast()
  
  // Handle file upload with drag and drop
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !file.name.endsWith('.md')) {
      showToast('请上传 Markdown (.md) 格式的文件', 'error')
      return
    }
    
    setLoading(true)
    setUploadProgress(30)
    showToast('正在上传文件...', 'info')
    
    try {
      // Upload file
      const uploadResult = await novelAPI.uploadFile(file)
      setCurrentFilePath(uploadResult.filePath)
      setUploadProgress(60)
      showToast('文件上传成功，正在解析...', 'info')
      
      // Parse file
      const parseResult = await novelAPI.parseNovel(uploadResult.filePath)
      setNovelData(parseResult)
      setUploadProgress(100)
      showToast('解析成功！', 'success')
      setActiveTab('edit')
    } catch (error) {
      console.error('处理失败:', error)
      showToast(`处理失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [showToast])
  
  // Save modifications
  const handleSave = useCallback(async () => {
    if (!novelData || !currentFilePath) {
      showToast('请先上传文件', 'error')
      return
    }
    
    setLoading(true)
    showToast('正在保存...', 'info')
    
    try {
      await novelAPI.updateNovel(currentFilePath, novelData)
      showToast('保存成功！', 'success')
    } catch (error) {
      console.error('保存失败:', error)
      showToast(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [novelData, currentFilePath, showToast])
  
  // Publish novel
  const handlePublish = useCallback(async () => {
    if (!novelData) {
      showToast('请先上传文件', 'error')
      return
    }
    
    if (!window.confirm('确定要发布到微信读书吗？')) {
      return
    }
    
    setLoading(true)
    showToast('正在发布...', 'info')
    
    try {
      const result = await novelAPI.publishNovel(novelData)
      showToast('发布成功！', 'success')
      console.log('发布结果:', result)
    } catch (error) {
      console.error('发布失败:', error)
      showToast(`发布失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [novelData, showToast])
  
  // Update form field
  const updateField = useCallback(<K extends keyof NovelData>(field: K, value: NovelData[K]) => {
    setNovelData(prev => prev ? { ...prev, [field]: value } : null)
  }, [])
  
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-500 animate-in slide-in-from-top-5",
          toast.type === 'success' && "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
          toast.type === 'error' && "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          toast.type === 'info' && "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
        )}>
          <div className="p-1 bg-white/20 rounded-lg">
            {toast.type === 'success' && <Check className="h-5 w-5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {toast.type === 'info' && <Sparkles className="h-5 w-5" />}
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/80 backdrop-blur-lg shadow-lg dark:bg-gray-950/80">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">小说发布系统</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">智能解析 • AI生成 • 一键发布</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {novelData && (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    variant="outline"
                    className="gap-2 bg-white hover:bg-gray-50 border-violet-200 hover:border-violet-300 transition-all duration-200"
                  >
                    <Save className="h-4 w-4" />
                    保存
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={loading}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Rocket className="h-4 w-4" />
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-1">
            <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Upload className="h-4 w-4" />
              上传文件
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!novelData} className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Edit className="h-4 w-4" />
              编辑信息
            </TabsTrigger>
            <TabsTrigger value="chapters" disabled={!novelData} className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <FileText className="h-4 w-4" />
              章节管理
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!novelData} className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Settings className="h-4 w-4" />
              发布设置
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Success Alert */}
            {novelData && !loading && (
              <Alert className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">解析成功!</AlertTitle>
                <AlertDescription className="text-green-700">
                  小说《{novelData.title}》已成功解析，共 {novelData.chapterList?.length || 0} 章节。
                  您可以在编辑信息页面修改元数据，或直接发布。
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-violet-100">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-xl font-bold text-gray-800">上传小说文件</CardTitle>
                <CardDescription className="text-gray-600">
                  支持 Markdown (.md) 格式的小说文件，系统将自动解析并生成元数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "relative rounded-xl border-2 border-dashed p-16 text-center transition-all duration-300 transform cursor-pointer group",
                    isDragging 
                      ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 scale-105 shadow-lg dark:from-violet-950/20 dark:to-purple-950/20" 
                      : "border-gray-300 hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50/50 hover:to-purple-50/50",
                    loading && "pointer-events-none opacity-50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="absolute top-4 left-4 right-4" />
                  )}
                  
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium">拖放文件或点击选择</p>
                  <p className="mt-2 text-sm text-muted-foreground">支持 .md 格式</p>
                  
                  <Input
                    type="file"
                    accept=".md"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={loading}
                    className="hidden"
                    id="fileInput"
                  />
                  <Label
                    htmlFor="fileInput"
                    className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {loading ? '处理中...' : '选择文件'}
                  </Label>
                  
                  {currentFilePath && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      当前文件: {currentFilePath}
                    </p>
                  )}
                </div>
                
                {novelData && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-600" />
                      文件统计
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            {novelData.metadata?.chapterCount || 0}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">章节数</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            {(novelData.metadata?.wordCount || 0).toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">总字数</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardContent className="pt-6">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-lg px-3 py-1">
                            完结
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">状态</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Edit Tab */}
          <TabsContent value="edit" className="space-y-6">
            {novelData && (
              <Card>
                <CardHeader>
                  <CardTitle>编辑小说信息</CardTitle>
                  <CardDescription>
                    完善作品信息，提高作品质量和曝光度
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">作品标题</Label>
                      <Input
                        id="title"
                        value={novelData.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="输入作品标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">作者笔名</Label>
                      <Input
                        id="author"
                        value={novelData.author || ''}
                        onChange={(e) => updateField('author', e.target.value)}
                        placeholder="输入作者笔名"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstCategory">一级分类</Label>
                      <select
                        id="firstCategory"
                        value={novelData.firstCategory || ''}
                        onChange={(e) => updateField('firstCategory', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="女频">女频</option>
                        <option value="男频">男频</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondCategory">二级分类</Label>
                      <select
                        id="secondCategory"
                        value={novelData.secondCategory || ''}
                        onChange={(e) => updateField('secondCategory', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="现代言情">现代言情</option>
                        <option value="古代言情">古代言情</option>
                        <option value="浪漫青春">浪漫青春</option>
                        <option value="都市">都市</option>
                        <option value="玄幻">玄幻</option>
                        <option value="仙侠">仙侠</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thirdCategory">三级分类</Label>
                      <select
                        id="thirdCategory"
                        value={novelData.thirdCategory || ''}
                        onChange={(e) => updateField('thirdCategory', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="豪门总裁">豪门总裁</option>
                        <option value="都市生活">都市生活</option>
                        <option value="婚恋情缘">婚恋情缘</option>
                        <option value="宫廷侯爵">宫廷侯爵</option>
                        <option value="古典架空">古典架空</option>
                        <option value="穿越奇情">穿越奇情</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intro">作品简介</Label>
                      <span className="text-sm text-muted-foreground">
                        {novelData.intro?.length || 0}/300字
                      </span>
                    </div>
                    <Textarea
                      id="intro"
                      value={novelData.intro || ''}
                      onChange={(e) => updateField('intro', e.target.value)}
                      placeholder="输入作品简介..."
                      rows={4}
                      maxLength={300}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="awesomeParagraph">精彩片段</Label>
                      <span className="text-sm text-muted-foreground">
                        {novelData.awesomeParagraph?.length || 0}/1000字
                      </span>
                    </div>
                    <Textarea
                      id="awesomeParagraph"
                      value={novelData.awesomeParagraph || ''}
                      onChange={(e) => updateField('awesomeParagraph', e.target.value)}
                      placeholder="输入精彩片段..."
                      rows={6}
                      maxLength={1000}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverPrompt">封面图生成Prompt</Label>
                    <Textarea
                      id="coverPrompt"
                      value={novelData.coverPrompt || ''}
                      onChange={(e) => updateField('coverPrompt', e.target.value)}
                      placeholder="系统将自动生成适合Midjourney或DALL-E的封面图prompt..."
                      rows={3}
                    />
                    {novelData.coverPrompt && (
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <Sparkles className="inline h-4 w-4 mr-1" />
                          提示：可直接复制此prompt到Midjourney、DALL-E等AI绘图工具生成封面图
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Save className="h-4 w-4" />
                        保存修改
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-6">
            {novelData && (
              <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-violet-100">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-lg pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800">章节管理</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                        共 {novelData.chapterList?.length || 0} 章
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {(novelData.metadata?.wordCount || 0).toLocaleString()} 字
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    {novelData.chapterList?.map((chapter, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0">
                        <div
                          className="flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 cursor-pointer transition-all duration-200"
                          onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-800 flex-1 truncate">{chapter.chapterTitle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                              {chapter.content?.length?.toLocaleString() || 0} 字
                            </span>
                            <div className={cn(
                              "transition-transform duration-200",
                              expandedChapter === index ? "rotate-180" : ""
                            )}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {expandedChapter === index && (
                          <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {chapter.content?.substring(0, 500) || ''}
                                {(chapter.content?.length || 0) > 500 && '...'}
                              </p>
                              {(chapter.content?.length || 0) > 500 && (
                                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                  显示前 500 字，共 {chapter.content?.length?.toLocaleString() || 0} 字
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {novelData && (
              <Card>
                <CardHeader>
                  <CardTitle>发布设置</CardTitle>
                  <CardDescription>
                    配置作品发布选项和目标平台
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold">目标平台</h3>
                    </div>
                    <p className="text-lg">微信读书</p>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold">发布地址</h3>
                    </div>
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">
                      https://wxrd.alongmen.com/book/v1/uploadBookInfo
                    </code>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-violet-600" />
                      <h3 className="font-semibold">发布状态</h3>
                    </div>
                    <Badge variant="default" className="text-sm">
                      完结
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={handlePublish}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    {loading ? '发布中...' : '立即发布'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default OptimizedApp