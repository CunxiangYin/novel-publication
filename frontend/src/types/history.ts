// 发布记录类型定义
export interface PublishRecord {
  id: string
  novelId: string
  title: string
  author: string
  cover?: string
  status: 'draft' | 'publishing' | 'published' | 'failed'
  publishTime: Date
  platform: string[]
  version: string
  chapters: number
  wordCount: number
  category: {
    first: string
    second: string
    third: string
  }
  stats?: {
    views: number
    likes: number
    comments: number
    favorites: number
    completionRate: number
  }
  error?: string
  metadata?: {
    sourceFile: string
    publishDuration: number
    retryCount: number
  }
}

// 版本历史
export interface VersionHistory {
  id: string
  novelId: string
  version: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  timestamp: Date
  operator: string
}

// 筛选条件
export interface PublishFilters {
  status?: PublishRecord['status'][]
  dateRange?: {
    start: Date
    end: Date
  }
  platform?: string[]
  keyword?: string
}

// 排序选项
export interface PublishSortOptions {
  field: 'publishTime' | 'title' | 'views' | 'status'
  order: 'asc' | 'desc'
}

// 分页选项
export interface PublishPagination {
  page: number
  pageSize: number
  total: number
}