import { useState, useCallback } from 'react'
import { novelAPI } from '@/services/api'

export interface UploadState {
  loading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function useNovelUpload() {
  const [state, setState] = useState<UploadState>({
    loading: false,
    progress: 0,
    error: null,
    success: false
  })

  const uploadAndParse = useCallback(async (file: File) => {
    setState({ loading: true, progress: 0, error: null, success: false })
    
    try {
      // Validate file
      if (!file.name.endsWith('.md')) {
        throw new Error('只支持 Markdown (.md) 格式的文件')
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('文件大小不能超过 10MB')
      }
      
      // Upload file
      setState(prev => ({ ...prev, progress: 30 }))
      const uploadResult = await novelAPI.uploadFile(file)
      
      // Parse novel
      setState(prev => ({ ...prev, progress: 60 }))
      const parseResult = await novelAPI.parseNovel(uploadResult.filePath)
      
      setState({ loading: false, progress: 100, error: null, success: true })
      
      return {
        filePath: uploadResult.filePath,
        novelData: parseResult
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      setState({ loading: false, progress: 0, error: errorMessage, success: false })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, progress: 0, error: null, success: false })
  }, [])

  return {
    ...state,
    uploadAndParse,
    reset
  }
}