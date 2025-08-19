import { useState, useCallback, useRef } from 'react'
import { 
  Upload, X, Pause, Play, CheckCircle, AlertCircle, 
  FileText, Loader2, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FileUploadItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed'
  error?: string
  uploadedChunks: number
  totalChunks: number
  speed?: number
  remainingTime?: number
}

interface ChunkedFileUploaderProps {
  onUploadComplete?: (file: File, response: any) => void
  onError?: (file: File, error: Error) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  chunkSize?: number // 分块大小，默认 1MB
  endpoint?: string
  concurrent?: number // 并发上传数
}

export function ChunkedFileUploader({
  onUploadComplete,
  onError,
  accept = '.md,.txt,.doc,.docx',
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 5,
  chunkSize = 1024 * 1024, // 1MB
  endpoint = '/api/upload/chunk',
  concurrent = 3
}: ChunkedFileUploaderProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadControllersRef = useRef<Map<string, AbortController>>(new Map())

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const newFiles: FileUploadItem[] = []
    
    for (let i = 0; i < Math.min(selectedFiles.length, maxFiles - files.length); i++) {
      const file = selectedFiles[i]
      
      // 验证文件大小
      if (file.size > maxSize) {
        console.error(`文件 ${file.name} 超过最大大小限制`)
        continue
      }
      
      const totalChunks = Math.ceil(file.size / chunkSize)
      
      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        progress: 0,
        status: 'pending',
        uploadedChunks: 0,
        totalChunks
      })
    }
    
    setFiles(prev => [...prev, ...newFiles])
    
    // 自动开始上传
    newFiles.forEach(file => uploadFile(file))
  }, [files.length, maxFiles, maxSize, chunkSize])

  // 分块上传文件
  const uploadFile = useCallback(async (fileItem: FileUploadItem) => {
    const controller = new AbortController()
    uploadControllersRef.current.set(fileItem.id, controller)
    
    // 更新状态为上传中
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'uploading' } : f
    ))
    
    const startTime = Date.now()
    let uploadedBytes = 0
    
    try {
      for (let chunkIndex = 0; chunkIndex < fileItem.totalChunks; chunkIndex++) {
        // 检查是否被暂停或取消
        if (controller.signal.aborted) {
          break
        }
        
        // 创建分块
        const start = chunkIndex * chunkSize
        const end = Math.min(start + chunkSize, fileItem.file.size)
        const chunk = fileItem.file.slice(start, end)
        
        // 创建 FormData
        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('chunkIndex', chunkIndex.toString())
        formData.append('totalChunks', fileItem.totalChunks.toString())
        formData.append('fileName', fileItem.file.name)
        formData.append('fileId', fileItem.id)
        
        // 上传分块
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        
        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`)
        }
        
        // 更新进度
        uploadedBytes += chunk.size
        const progress = Math.round((uploadedBytes / fileItem.file.size) * 100)
        const elapsedTime = (Date.now() - startTime) / 1000
        const speed = uploadedBytes / elapsedTime // bytes per second
        const remainingBytes = fileItem.file.size - uploadedBytes
        const remainingTime = remainingBytes / speed
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                progress,
                uploadedChunks: chunkIndex + 1,
                speed: Math.round(speed / 1024), // KB/s
                remainingTime: Math.round(remainingTime)
              } 
            : f
        ))
      }
      
      // 上传完成
      if (!controller.signal.aborted) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f
        ))
        
        onUploadComplete?.(fileItem.file, { fileId: fileItem.id })
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('上传失败:', error)
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'failed', error: error instanceof Error ? error.message : '上传失败' } 
            : f
        ))
        
        onError?.(fileItem.file, error as Error)
      }
    } finally {
      uploadControllersRef.current.delete(fileItem.id)
    }
  }, [chunkSize, endpoint, onUploadComplete, onError])

  // 暂停上传
  const pauseUpload = useCallback((fileId: string) => {
    const controller = uploadControllersRef.current.get(fileId)
    controller?.abort()
    
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'paused' } : f
    ))
  }, [])

  // 恢复上传
  const resumeUpload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      uploadFile(file)
    }
  }, [files, uploadFile])

  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    const controller = uploadControllersRef.current.get(fileId)
    controller?.abort()
    
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  // 重试上传
  const retryUpload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'pending', progress: 0, uploadedChunks: 0, error: undefined } 
          : f
      ))
      uploadFile(file)
    }
  }, [files, uploadFile])

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
    return `${Math.floor(seconds / 3600)}时${Math.floor((seconds % 3600) / 60)}分`
  }

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8',
          'transition-colors duration-200',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          'hover:border-primary hover:bg-primary/5'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">拖拽文件到此处上传</p>
            <p className="text-sm text-muted-foreground">或者</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              选择文件
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持格式: {accept} | 最大: {formatFileSize(maxSize)} | 最多: {maxFiles} 个文件
          </p>
        </div>
      </div>

      {/* 上传队列 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">上传队列 ({files.length})</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              className="text-xs"
            >
              清空队列
            </Button>
          </div>
          
          {files.map(file => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.file.size)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {file.status === 'uploading' && (
                          <>
                            {file.speed && (
                              <span className="text-xs text-muted-foreground">
                                {file.speed} KB/s
                              </span>
                            )}
                            {file.remainingTime && (
                              <span className="text-xs text-muted-foreground">
                                剩余 {formatTime(file.remainingTime)}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => pauseUpload(file.id)}
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        {file.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resumeUpload(file.id)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {file.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(file.id)}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {file.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {file.status !== 'completed' && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {file.uploadedChunks}/{file.totalChunks} 块 ({file.progress}%)
                          </span>
                          {file.status === 'uploading' && (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          )}
                          {file.status === 'failed' && (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {file.error}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}