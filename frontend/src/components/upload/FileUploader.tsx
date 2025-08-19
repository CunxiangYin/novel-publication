import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File) => Promise<void>
  accept?: string
  maxSize?: number
}

export function FileUploader({ 
  onFileSelect, 
  accept = '.md', 
  maxSize = 10485760 // 10MB 
}: FileUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > maxSize) {
      setErrorMessage(`文件大小不能超过 ${maxSize / 1048576}MB`)
      setUploadStatus('error')
      return
    }

    setSelectedFile(file)
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onFileSelect(file)
      
      clearInterval(interval)
      setUploadProgress(100)
      setUploadStatus('success')
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '上传失败')
    }
  }, [onFileSelect, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/markdown': [accept] },
    maxFiles: 1,
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              "hover:border-primary hover:bg-accent/50",
              isDragActive && "border-primary bg-accent/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? "释放文件以上传" : "拖放文件或点击选择"}
            </p>
            <p className="text-sm text-muted-foreground">
              支持 Markdown (.md) 文件，最大 {maxSize / 1048576}MB
            </p>
            <Button variant="secondary" className="mt-4">
              选择文件
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/20">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploadStatus === 'success' && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    已上传
                  </Badge>
                )}
                {uploadStatus === 'error' && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    失败
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === 'error' && errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}