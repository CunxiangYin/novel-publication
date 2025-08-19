import { useState } from 'react'
import { BookOpen, Upload, Save, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function AppFixed() {
  const [activeTab, setActiveTab] = useState('upload')
  const [novel, setNovel] = useState<any>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">小说发布系统</h1>
                <p className="text-sm text-muted-foreground">智能解析 • AI生成 • 一键发布</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {novel && (
                <>
                  <Badge>已保存</Badge>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  <Button>
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
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              上传文件
            </TabsTrigger>
            <TabsTrigger value="edit">
              编辑信息
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>上传小说文件</CardTitle>
                  <CardDescription>
                    支持 Markdown (.md) 格式的小说文件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      拖放文件或点击选择
                    </p>
                    <Button variant="secondary">选择文件</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>编辑小说信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>请先上传文件</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AppFixed