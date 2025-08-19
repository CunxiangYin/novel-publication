import { useState, useCallback, useEffect } from 'react'
import { BookOpen, Upload, Save, Rocket, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function TestApp() {
  const [error, setError] = useState<string | null>(null)
  const [components, setComponents] = useState<string[]>([])

  useEffect(() => {
    try {
      // Test component imports one by one
      const testImports = async () => {
        const comps = []
        
        // Test 1: Tabs
        try {
          const { Tabs, TabsContent, TabsList, TabsTrigger } = await import('@/components/ui/tabs')
          if (Tabs) comps.push('Tabs')
        } catch (e) {
          setError(`Tabs error: ${e}`)
          return
        }

        // Test 2: AdvancedThemeToggle
        try {
          const { AdvancedThemeToggle } = await import('@/components/theme/AdvancedThemeToggle')
          if (AdvancedThemeToggle) comps.push('AdvancedThemeToggle')
        } catch (e) {
          setError(`AdvancedThemeToggle error: ${e}`)
          return
        }

        // Test 3: Store
        try {
          const { useNovelStore } = await import('@/store/useNovelStore')
          if (useNovelStore) comps.push('useNovelStore')
        } catch (e) {
          setError(`Store error: ${e}`)
          return
        }

        // Test 4: FileUploader
        try {
          const { FileUploader } = await import('@/components/upload/FileUploader')
          if (FileUploader) comps.push('FileUploader')
        } catch (e) {
          setError(`FileUploader error: ${e}`)
          return
        }

        // Test 5: NovelForm
        try {
          const { NovelForm } = await import('@/components/novel/NovelForm')
          if (NovelForm) comps.push('NovelForm')
        } catch (e) {
          setError(`NovelForm error: ${e}`)
          return
        }

        // Test 6: ChapterList
        try {
          const { ChapterList } = await import('@/components/novel/ChapterList')
          if (ChapterList) comps.push('ChapterList')
        } catch (e) {
          setError(`ChapterList error: ${e}`)
          return
        }

        // Test 7: MobileNavigation
        try {
          const { MobileNavigation } = await import('@/components/mobile/MobileNavigation')
          if (MobileNavigation) comps.push('MobileNavigation')
        } catch (e) {
          setError(`MobileNavigation error: ${e}`)
          return
        }

        // Test 8: SwipeableChapterView
        try {
          const { SwipeableChapterView } = await import('@/components/novel/SwipeableChapterView')
          if (SwipeableChapterView) comps.push('SwipeableChapterView')
        } catch (e) {
          setError(`SwipeableChapterView error: ${e}`)
          return
        }

        setComponents(comps)
      }

      testImports()
    } catch (e) {
      setError(`General error: ${e}`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Component Import Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">
              <strong>Error found:</strong>
              <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          ) : (
            <div>
              <p className="mb-4">Successfully imported components:</p>
              <div className="space-y-1">
                {components.map(comp => (
                  <Badge key={comp} variant="outline" className="mr-2">
                    ✓ {comp}
                  </Badge>
                ))}
              </div>
              {components.length === 0 && <p className="text-muted-foreground">Testing imports...</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TestApp