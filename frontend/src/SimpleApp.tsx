import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimpleApp() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">小说发布系统</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>测试页面</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">如果您看到这个页面，说明系统正在运行。</p>
            <div className="flex gap-4">
              <Button onClick={() => setCount(count + 1)}>
                点击次数: {count}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                返回主页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}