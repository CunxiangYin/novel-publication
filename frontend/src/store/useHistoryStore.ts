import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  PublishRecord, 
  PublishFilters, 
  PublishSortOptions,
  PublishPagination,
  VersionHistory 
} from '@/types/history'

interface HistoryState {
  // 数据
  records: PublishRecord[]
  versions: Map<string, VersionHistory[]>
  currentFilter: PublishFilters
  currentSort: PublishSortOptions
  pagination: PublishPagination
  selectedRecords: Set<string>
  isLoading: boolean
  
  // Actions
  loadRecords: (filters?: PublishFilters) => Promise<void>
  addRecord: (record: PublishRecord) => void
  updateRecord: (id: string, updates: Partial<PublishRecord>) => void
  deleteRecord: (id: string) => void
  deleteMultiple: (ids: string[]) => void
  
  // 版本管理
  loadVersionHistory: (novelId: string) => Promise<VersionHistory[]>
  compareVersions: (v1: string, v2: string) => Promise<any>
  rollbackToVersion: (novelId: string, version: string) => Promise<void>
  
  // 筛选和排序
  setFilter: (filter: PublishFilters) => void
  setSort: (sort: PublishSortOptions) => void
  setPagination: (pagination: Partial<PublishPagination>) => void
  
  // 选择管理
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  
  // 统计
  getStats: () => {
    total: number
    published: number
    draft: number
    failed: number
  }
}

// 模拟数据生成
const generateMockRecords = (): PublishRecord[] => {
  const statuses: PublishRecord['status'][] = ['draft', 'publishing', 'published', 'failed']
  const platforms = ['微信读书', '起点中文', '晋江文学']
  const categories = [
    { first: '男频', second: '都市', third: '都市生活' },
    { first: '女频', second: '现代言情', third: '总裁豪门' },
    { first: '男频', second: '玄幻', third: '东方玄幻' }
  ]
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `record-${i + 1}`,
    novelId: `novel-${i + 1}`,
    title: `小说标题 ${i + 1}`,
    author: `作者${Math.floor(Math.random() * 5) + 1}`,
    cover: `https://via.placeholder.com/120x160?text=Cover${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    publishTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    platform: [platforms[Math.floor(Math.random() * platforms.length)]],
    version: `1.${Math.floor(Math.random() * 10)}.0`,
    chapters: Math.floor(Math.random() * 100) + 10,
    wordCount: Math.floor(Math.random() * 500000) + 50000,
    category: categories[Math.floor(Math.random() * categories.length)],
    stats: {
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 1000),
      favorites: Math.floor(Math.random() * 5000),
      completionRate: Math.floor(Math.random() * 100)
    }
  }))
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      // 初始状态
      records: [],
      versions: new Map(),
      currentFilter: {},
      currentSort: { field: 'publishTime', order: 'desc' },
      pagination: { page: 1, pageSize: 10, total: 0 },
      selectedRecords: new Set(),
      isLoading: false,
      
      // 加载记录
      loadRecords: async (filters) => {
        set({ isLoading: true })
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 使用模拟数据
        const mockRecords = generateMockRecords()
        
        // 应用筛选
        let filtered = [...mockRecords]
        if (filters?.status) {
          filtered = filtered.filter(r => filters.status!.includes(r.status))
        }
        if (filters?.keyword) {
          const keyword = filters.keyword.toLowerCase()
          filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(keyword) ||
            r.author.toLowerCase().includes(keyword)
          )
        }
        if (filters?.dateRange) {
          filtered = filtered.filter(r => {
            const time = r.publishTime.getTime()
            return time >= filters.dateRange!.start.getTime() && 
                   time <= filters.dateRange!.end.getTime()
          })
        }
        
        // 应用排序
        const { currentSort } = get()
        filtered.sort((a, b) => {
          let aVal: any, bVal: any
          switch (currentSort.field) {
            case 'publishTime':
              aVal = a.publishTime.getTime()
              bVal = b.publishTime.getTime()
              break
            case 'title':
              aVal = a.title
              bVal = b.title
              break
            case 'views':
              aVal = a.stats?.views || 0
              bVal = b.stats?.views || 0
              break
            case 'status':
              aVal = a.status
              bVal = b.status
              break
          }
          
          if (currentSort.order === 'asc') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
        
        set({ 
          records: filtered,
          pagination: { ...get().pagination, total: filtered.length },
          isLoading: false,
          currentFilter: filters || {}
        })
      },
      
      // 添加记录
      addRecord: (record) => {
        set(state => ({
          records: [record, ...state.records],
          pagination: { ...state.pagination, total: state.pagination.total + 1 }
        }))
      },
      
      // 更新记录
      updateRecord: (id, updates) => {
        set(state => ({
          records: state.records.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        }))
      },
      
      // 删除记录
      deleteRecord: (id) => {
        set(state => ({
          records: state.records.filter(r => r.id !== id),
          selectedRecords: new Set([...state.selectedRecords].filter(rid => rid !== id)),
          pagination: { ...state.pagination, total: state.pagination.total - 1 }
        }))
      },
      
      // 批量删除
      deleteMultiple: (ids) => {
        set(state => ({
          records: state.records.filter(r => !ids.includes(r.id)),
          selectedRecords: new Set(),
          pagination: { ...state.pagination, total: state.pagination.total - ids.length }
        }))
      },
      
      // 加载版本历史
      loadVersionHistory: async (novelId) => {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const mockVersions: VersionHistory[] = Array.from({ length: 5 }, (_, i) => ({
          id: `version-${i + 1}`,
          novelId,
          version: `1.${i}.0`,
          changes: [
            { field: 'title', oldValue: `旧标题 ${i}`, newValue: `新标题 ${i + 1}` },
            { field: 'intro', oldValue: '旧简介', newValue: '新简介' }
          ],
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          operator: '系统'
        }))
        
        const { versions } = get()
        versions.set(novelId, mockVersions)
        set({ versions: new Map(versions) })
        
        return mockVersions
      },
      
      // 版本对比
      compareVersions: async (v1, v2) => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return { v1, v2, differences: [] }
      },
      
      // 回滚版本
      rollbackToVersion: async (novelId, version) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`Rolling back ${novelId} to version ${version}`)
      },
      
      // 设置筛选
      setFilter: (filter) => {
        set({ currentFilter: filter })
        get().loadRecords(filter)
      },
      
      // 设置排序
      setSort: (sort) => {
        set({ currentSort: sort })
        get().loadRecords(get().currentFilter)
      },
      
      // 设置分页
      setPagination: (pagination) => {
        set(state => ({
          pagination: { ...state.pagination, ...pagination }
        }))
      },
      
      // 切换选择
      toggleSelect: (id) => {
        set(state => {
          const newSelected = new Set(state.selectedRecords)
          if (newSelected.has(id)) {
            newSelected.delete(id)
          } else {
            newSelected.add(id)
          }
          return { selectedRecords: newSelected }
        })
      },
      
      // 全选
      selectAll: () => {
        set(state => ({
          selectedRecords: new Set(state.records.map(r => r.id))
        }))
      },
      
      // 清空选择
      clearSelection: () => {
        set({ selectedRecords: new Set() })
      },
      
      // 获取统计
      getStats: () => {
        const { records } = get()
        return {
          total: records.length,
          published: records.filter(r => r.status === 'published').length,
          draft: records.filter(r => r.status === 'draft').length,
          failed: records.filter(r => r.status === 'failed').length
        }
      }
    }),
    {
      name: 'history-storage',
      partialize: (state) => ({
        currentFilter: state.currentFilter,
        currentSort: state.currentSort,
        pagination: state.pagination
      })
    }
  )
)