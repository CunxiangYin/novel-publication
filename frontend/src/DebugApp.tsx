import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function DebugApp() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const renderStep = () => {
    try {
      switch (step) {
        case 1:
          return <div>Step 1: Basic render works</div>
        
        case 2:
          const { AdvancedThemeToggle } = require('@/components/theme/AdvancedThemeToggle')
          return (
            <div>
              Step 2: Theme toggle component
              <AdvancedThemeToggle />
            </div>
          )
        
        case 3:
          const { useNovelStore } = require('@/store/useNovelStore')
          const store = useNovelStore()
          return (
            <div>
              Step 3: Store works
              <pre>{JSON.stringify({ hasNovel: !!store.novel }, null, 2)}</pre>
            </div>
          )
        
        case 4:
          const { Tabs, TabsContent, TabsList, TabsTrigger } = require('@/components/ui/tabs')
          return (
            <div>
              Step 4: Tabs component
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content 1</TabsContent>
                <TabsContent value="tab2">Content 2</TabsContent>
              </Tabs>
            </div>
          )
        
        case 5:
          const { FileUploader } = require('@/components/upload/FileUploader')
          return (
            <div>
              Step 5: FileUploader component
              <FileUploader onFileSelect={() => {}} accept=".md" maxSize={10485760} />
            </div>
          )
        
        case 6:
          const { NovelForm } = require('@/components/novel/NovelForm')
          return (
            <div>
              Step 6: NovelForm component
              <NovelForm initialData={null} onSubmit={() => {}} />
            </div>
          )
        
        default:
          return <div>All components tested successfully!</div>
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    }
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Component Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setStep(Math.max(1, step - 1))}>Previous</Button>
            <Button onClick={() => setStep(step + 1)}>Next Step</Button>
            <Button variant="outline" onClick={() => setStep(1)}>Reset</Button>
          </div>
          
          <div className="p-4 border rounded">
            {error ? (
              <div className="text-red-500">
                <strong>Error at step {step}:</strong>
                <pre className="mt-2 text-sm">{error}</pre>
              </div>
            ) : (
              renderStep()
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DebugApp