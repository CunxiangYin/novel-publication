import { useState, useCallback } from 'react'
import { 
  BookOpen, 
  Upload, 
  Save, 
  Rocket, 
  FileText, 
  Settings,
  PenTool,
  BookMarked,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { EnhancedFileUploader } from '@/components/upload/EnhancedFileUploader'
import { NovelForm } from '@/components/novel/NovelForm'
import { EnhancedChapterList } from '@/components/novel/EnhancedChapterList'
import { useNovelStore } from '@/store/useNovelStore'
import { novelAPI } from '@/services/api'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Toaster, toast } from 'sonner'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

function EnhancedApp() {
  const [activeTab, setActiveTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
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

  // Handle file upload with progress
  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(20)
    
    try {
      // Upload file
      toast.loading('Uploading file...', { id: 'upload' })
      const uploadResult = await novelAPI.uploadFile(file)
      setFilePath(uploadResult.filePath)
      setUploadProgress(50)
      
      // Parse file
      toast.loading('Parsing novel content...', { id: 'upload' })
      const parseResult = await novelAPI.parseNovel(uploadResult.filePath)
      setUploadProgress(90)
      
      setNovel(parseResult)
      setActiveTab('edit')
      setUploadProgress(100)
      
      toast.success('File processed successfully!', { id: 'upload' })
    } catch (error) {
      console.error('File processing failed:', error)
      setError(error instanceof Error ? error.message : 'File processing failed')
      toast.error('Failed to process file', { id: 'upload' })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }, [setFilePath, setNovel, setError])

  // Save changes with toast feedback
  const handleSave = useCallback(async (data: any) => {
    if (!currentFilePath || !novel) return
    
    try {
      const updatedNovel = { ...novel, ...data }
      await novelAPI.updateNovel(currentFilePath, updatedNovel)
      updateNovel(data)
      markClean()
      toast.success('Changes saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save changes')
      throw error
    }
  }, [currentFilePath, novel, updateNovel, markClean])

  // Publish with confirmation
  const handlePublish = useCallback(async () => {
    if (!novel) return
    
    setIsProcessing(true)
    try {
      toast.loading('Publishing novel...', { id: 'publish' })
      const result = await novelAPI.publishNovel(novel)
      console.log('Published successfully:', result)
      toast.success('Novel published successfully!', { 
        id: 'publish',
        description: 'Your novel is now live on the platform.'
      })
    } catch (error) {
      console.error('Publish failed:', error)
      toast.error('Failed to publish novel', { 
        id: 'publish',
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [novel])

  // Chapter preview in modal
  const handleChapterPreview = useCallback((chapter: any) => {
    toast(
      <div className="w-full">
        <h3 className="font-semibold mb-2">{chapter.chapterTitle}</h3>
        <p className="text-sm text-muted-foreground line-clamp-6">
          {chapter.content.substring(0, 500)}...
        </p>
      </div>,
      { duration: 5000 }
    )
  }, [])

  return (
    <ThemeProvider defaultTheme="system" storageKey="novel-ui-theme">
      <div className="min-h-screen bg-background custom-scrollbar">
        <Toaster richColors position="top-right" />
        <ScrollToTop />
        
        {/* Enhanced Header with Glass Effect */}
        <header className="sticky top-0 z-50 border-b glass">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    Novel Publication Studio
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Transform your stories into published works
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {novel && (
                  <>
                    <Badge 
                      variant={isDirty ? "destructive" : "secondary"}
                      className="transition-all duration-300"
                    >
                      {isDirty ? "Unsaved Changes" : "All Changes Saved"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSave(novel)}
                      disabled={!isDirty || isProcessing}
                      className="hover:bg-primary/10"
                    >
                      <Save className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <ThemeToggle />
                <Button 
                  onClick={handlePublish}
                  disabled={!novel || isProcessing}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Enhanced Styling */}
        <main className="container mx-auto px-4 py-8 fade-in">
          {/* Stats Dashboard */}
          {novel && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="card-hover bg-gradient-to-br from-card to-muted/20">
                <CardHeader className="pb-2">
                  <CardDescription>Total Chapters</CardDescription>
                  <CardTitle className="text-3xl">{novel.metadata?.chapterCount || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="card-hover bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription>Word Count</CardDescription>
                  <CardTitle className="text-3xl">
                    {(novel.metadata?.wordCount || 0).toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="card-hover bg-gradient-to-br from-card to-secondary/5">
                <CardHeader className="pb-2">
                  <CardDescription>Categories</CardDescription>
                  <CardTitle className="text-lg">
                    {novel.firstCategory && novel.secondCategory && 
                      `${novel.firstCategory} • ${novel.secondCategory}`
                    }
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="card-hover bg-gradient-to-br from-card to-accent/20">
                <CardHeader className="pb-2">
                  <CardDescription>Status</CardDescription>
                  <CardTitle className="text-lg">
                    <Badge variant="secondary" className="text-base">
                      Ready to Publish
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8 h-14 p-1 bg-muted/50">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                disabled={!novel}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <PenTool className="mr-2 h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger 
                value="chapters" 
                disabled={!novel}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <BookMarked className="mr-2 h-4 w-4" />
                Chapters
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                disabled={!novel}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 fade-in">
              <div className="max-w-3xl mx-auto">
                <Card className="card-hover border-2 border-dashed">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
                      <Upload className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Upload Your Novel</CardTitle>
                    <CardDescription className="text-base">
                      Support for Markdown (.md) format • AI-powered metadata generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnhancedFileUploader 
                      onFileSelect={handleFileSelect}
                      accept=".md"
                      maxSize={10485760}
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <Progress value={uploadProgress} className="mt-4" />
                    )}
                  </CardContent>
                </Card>

                {currentFilePath && (
                  <Card className="card-hover bg-gradient-to-br from-card to-muted/30">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>Current File</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded">
                        {currentFilePath}
                      </p>
                      {novel && (
                        <div className="flex gap-3 mt-4">
                          <Badge variant="outline" className="text-sm">
                            <BookOpen className="mr-1 h-3 w-3" />
                            {novel.metadata?.chapterCount || 0} chapters
                          </Badge>
                          <Badge variant="outline" className="text-sm">
                            <BarChart3 className="mr-1 h-3 w-3" />
                            {novel.metadata?.wordCount?.toLocaleString() || 0} words
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6 fade-in">
              {novel && (
                <div className="max-w-5xl mx-auto">
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium">
                        AI-powered content generation available for introduction and highlights
                      </p>
                    </div>
                  </div>
                  <NovelForm
                    initialData={novel}
                    onSubmit={handleSave}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="chapters" className="space-y-6 fade-in">
              {novel && (
                <div className="max-w-5xl mx-auto">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl">Chapter Management</CardTitle>
                      <CardDescription>
                        Review and organize your novel chapters
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <EnhancedChapterList
                    chapters={novel.chapterList.map((ch, idx) => ({
                      id: `chapter-${idx}`,
                      chapterTitle: ch.chapterTitle,
                      content: ch.content,
                      order: idx + 1
                    }))}
                    onPreview={handleChapterPreview}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 fade-in">
              <div className="max-w-3xl mx-auto">
                <Card className="card-hover">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      <CardTitle>Publication Settings</CardTitle>
                    </div>
                    <CardDescription>
                      Configure your publication preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Target Platform
                        </h3>
                        <Badge className="text-sm">WeChat Reading</Badge>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Publication Status</h3>
                        <Badge variant="secondary" className="text-sm">Complete</Badge>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">API Endpoint</h3>
                        <p className="text-xs text-muted-foreground font-mono bg-background p-2 rounded">
                          https://wxrd.alongmen.com/book/v1/uploadBookInfo
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                      onClick={handlePublish}
                      disabled={!novel || isProcessing}
                    >
                      <Rocket className="mr-2 h-5 w-5" />
                      Publish Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default EnhancedApp