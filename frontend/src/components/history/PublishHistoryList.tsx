import { useEffect, useState } from 'react'
import { 
  Calendar, Search, Filter, MoreVertical, Eye, Edit, 
  Trash2, RefreshCw, Download, CheckCircle, AlertCircle,
  Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { PublishRecord } from '@/types/history'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 状态配置
const statusConfig = {
  draft: { label: '草稿', color: 'secondary', icon: Clock },
  publishing: { label: '发布中', color: 'default', icon: RefreshCw },
  published: { label: '已发布', color: 'success', icon: CheckCircle },
  failed: { label: '失败', color: 'destructive', icon: AlertCircle }
} as const

export function PublishHistoryList() {
  const [selectedRecord, setSelectedRecord] = useState<PublishRecord | null>(null)
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [keyword, setKeyword] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    records,
    currentFilter,
    currentSort,
    pagination,
    selectedRecords,
    isLoading,
    loadRecords,
    setFilter,
    setSort,
    setPagination,
    toggleSelect,
    selectAll,
    clearSelection,
    deleteRecord,
    deleteMultiple,
    getStats
  } = useHistoryStore()
  
  // 初始加载
  useEffect(() => {
    loadRecords()
  }, [])
  
  // 响应式检测
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword || currentFilter.keyword !== keyword) {
        setFilter({ ...currentFilter, keyword })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword])
  
  // 获取统计数据
  const stats = getStats()
  
  // 分页数据
  const startIndex = (pagination.page - 1) * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  const paginatedRecords = records.slice(startIndex, endIndex)
  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  
  // 批量操作
  const handleBatchDelete = () => {
    if (selectedRecords.size > 0) {
      if (confirm(`确定要删除 ${selectedRecords.size} 条记录吗？`)) {
        deleteMultiple(Array.from(selectedRecords))
      }
    }
  }
  
  // 渲染移动端卡片
  const renderMobileCard = (record: PublishRecord) => (
    <Card key={record.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRecords.has(record.id)}
              onCheckedChange={() => toggleSelect(record.id)}
            />
            {record.cover && (
              <img 
                src={record.cover} 
                alt={record.title}
                className="w-12 h-16 rounded object-cover"
              />
            )}
          </div>
          <Badge 
            variant={statusConfig[record.status].color as any}
            className="ml-auto"
          >
            {statusConfig[record.status].label}
          </Badge>
        </div>
        
        <h3 className="font-medium mb-1">{record.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {record.author} · {record.chapters}章 · {(record.wordCount / 10000).toFixed(1)}万字
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(new Date(record.publishTime), 'MM-dd HH:mm', { locale: zhCN })}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRecord(record)}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteRecord(record.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已发布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              草稿
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              失败
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 主列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>发布历史</CardTitle>
              <CardDescription>管理和查看所有小说的发布记录</CardDescription>
            </div>
            
            {/* 筛选栏 */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标题或作者..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
                />
              </div>
              
              <Select
                value={currentFilter.status?.[0] || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilter({ ...currentFilter, status: undefined })
                  } else {
                    setFilter({ ...currentFilter, status: [value as PublishRecord['status']] })
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="publishing">发布中</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={`${currentSort.field}-${currentSort.order}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-') as any
                  setSort({ field, order })
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishTime-desc">最新发布</SelectItem>
                  <SelectItem value="publishTime-asc">最早发布</SelectItem>
                  <SelectItem value="title-asc">标题正序</SelectItem>
                  <SelectItem value="title-desc">标题倒序</SelectItem>
                  <SelectItem value="views-desc">阅读最多</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => loadRecords()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* 批量操作栏 */}
          {selectedRecords.size > 0 && (
            <div className="mb-4 p-2 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm">
                已选择 {selectedRecords.size} 项
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  取消选择
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                  批量删除
                </Button>
              </div>
            </div>
          )}
          
          {/* 数据展示 */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isMobile ? (
            // 移动端卡片视图
            <div>
              {paginatedRecords.map(renderMobileCard)}
            </div>
          ) : (
            // 桌面端表格视图
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRecords.size === records.length && records.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) selectAll()
                        else clearSelection()
                      }}
                    />
                  </TableHead>
                  <TableHead>作品信息</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>发布信息</TableHead>
                  <TableHead>数据统计</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => {
                  const StatusIcon = statusConfig[record.status].icon
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.has(record.id)}
                          onCheckedChange={() => toggleSelect(record.id)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {record.cover && (
                            <img 
                              src={record.cover} 
                              alt={record.title}
                              className="w-10 h-14 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{record.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.author} · {record.chapters}章
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{record.category.first}</div>
                          <div className="text-muted-foreground">
                            {record.category.second} / {record.category.third}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(record.publishTime), 'yyyy-MM-dd', { locale: zhCN })}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(record.publishTime), 'HH:mm:ss', { locale: zhCN })}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {record.stats && (
                          <div className="text-sm">
                            <div>{record.stats.views.toLocaleString()} 阅读</div>
                            <div className="text-muted-foreground">
                              {record.stats.completionRate}% 完读率
                            </div>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={statusConfig[record.status].color as any}
                          className="gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[record.status].label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedRecord(record)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              重新发布
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              导出
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('确定要删除这条记录吗？')) {
                                  deleteRecord(record.id)
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                显示 {startIndex + 1} - {Math.min(endIndex, pagination.total)} 共 {pagination.total} 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPagination({ page: pageNum })}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ page: pagination.page + 1 })}
                  disabled={pagination.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 详情侧边栏 */}
      <PublishRecordDetail 
        record={selectedRecord}
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  )
}

// 详情组件
function PublishRecordDetail({ 
  record, 
  open, 
  onClose 
}: { 
  record: PublishRecord | null
  open: boolean
  onClose: () => void 
}) {
  const { loadVersionHistory } = useHistoryStore()
  const [versions, setVersions] = useState<any[]>([])
  
  useEffect(() => {
    if (record) {
      loadVersionHistory(record.novelId).then(setVersions)
    }
  }, [record])
  
  if (!record) return null
  
  const StatusIcon = statusConfig[record.status].icon
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>发布详情</SheetTitle>
          <SheetDescription>
            查看作品的完整发布信息和历史记录
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">基本信息</TabsTrigger>
              <TabsTrigger value="stats">数据统计</TabsTrigger>
              <TabsTrigger value="versions">版本历史</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              {/* 封面和标题 */}
              <div className="flex gap-4">
                {record.cover && (
                  <img 
                    src={record.cover}
                    alt={record.title}
                    className="w-24 h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{record.title}</h3>
                  <p className="text-sm text-muted-foreground">{record.author}</p>
                  <Badge 
                    variant={statusConfig[record.status].color as any}
                    className="mt-2 gap-1"
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[record.status].label}
                  </Badge>
                </div>
              </div>
              
              {/* 详细信息 */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">章节数：</span>
                    <span className="ml-2 font-medium">{record.chapters} 章</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">字数：</span>
                    <span className="ml-2 font-medium">{(record.wordCount / 10000).toFixed(1)} 万字</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">版本：</span>
                    <span className="ml-2 font-medium">{record.version}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">平台：</span>
                    <span className="ml-2 font-medium">{record.platform.join(', ')}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">分类</p>
                  <p className="text-sm">
                    {record.category.first} / {record.category.second} / {record.category.third}
                  </p>
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">发布时间</p>
                  <p className="text-sm">
                    {format(new Date(record.publishTime), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              {record.stats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">阅读量</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {record.stats.views.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">完读率</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {record.stats.completionRate}%
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">点赞数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {record.stats.likes.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">收藏数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {record.stats.favorites.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">评论数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-bold">
                        {record.stats.comments.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  暂无统计数据
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="versions" className="space-y-4">
              {versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <Card key={version.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{version.version}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(version.timestamp), 'MM-dd HH:mm', { locale: zhCN })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {version.changes.map((change: any, i: number) => (
                            <p key={i} className="text-sm text-muted-foreground">
                              {change.field}: {change.oldValue} → {change.newValue}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  暂无版本记录
                </p>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}