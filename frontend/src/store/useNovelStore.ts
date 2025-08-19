import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NovelData } from '@/services/api'

interface Chapter {
  id: string
  chapterTitle: string
  content: string
  seq?: number
}

interface NovelState {
  // 状态
  novel: NovelData | null
  currentFilePath: string | null
  isDirty: boolean
  lastSaved: Date | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setNovel: (novel: NovelData) => void
  updateNovel: (updates: Partial<NovelData>) => void
  updateField: (field: keyof NovelData, value: any) => void
  setFilePath: (path: string) => void
  setChapters: (chapters: Chapter[]) => void
  markClean: () => void
  markDirty: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useNovelStore = create<NovelState>()(
  persist(
    (set) => ({
      // 初始状态
      novel: null,
      currentFilePath: null,
      isDirty: false,
      lastSaved: null,
      isLoading: false,
      error: null,
      
      // Actions
      setNovel: (novel) => set(() => ({
        novel,
        isDirty: false,
        error: null
      })),
      
      updateNovel: (updates) => set((state) => ({
        novel: state.novel ? { ...state.novel, ...updates } : null,
        isDirty: true
      })),
      
      updateField: (field, value) => set((state) => ({
        novel: state.novel ? { ...state.novel, [field]: value } : null,
        isDirty: true
      })),
      
      setFilePath: (path) => set(() => ({
        currentFilePath: path
      })),
      
      setChapters: (chapters) => set((state) => ({
        novel: state.novel ? { ...state.novel, chapterList: chapters } : null,
        isDirty: true
      })),
      
      markClean: () => set(() => ({
        isDirty: false,
        lastSaved: new Date()
      })),
      
      markDirty: () => set(() => ({
        isDirty: true
      })),
      
      setLoading: (loading) => set(() => ({
        isLoading: loading
      })),
      
      setError: (error) => set(() => ({
        error,
        isLoading: false
      })),
      
      reset: () => set(() => ({
        novel: null,
        currentFilePath: null,
        isDirty: false,
        lastSaved: null,
        isLoading: false,
        error: null
      }))
    }),
    {
      name: 'novel-storage',
      partialize: (state) => ({
        novel: state.novel,
        currentFilePath: state.currentFilePath,
        lastSaved: state.lastSaved
      })
    }
  )
)