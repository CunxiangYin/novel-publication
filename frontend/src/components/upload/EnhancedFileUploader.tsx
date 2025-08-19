import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react'
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

export function EnhancedFileUploader({ 
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
      setErrorMessage(`File size cannot exceed ${maxSize / 1048576}MB`)
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
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
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
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative overflow-hidden rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300",
            "bg-gradient-to-br from-muted/30 to-muted/10",
            "hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5",
            isDragActive && "border-primary bg-gradient-to-br from-primary/10 to-secondary/10"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-primary/20">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="absolute bottom-4 left-4 text-secondary/20">
            <FileText className="h-8 w-8" />
          </div>

          <div className="relative">
            <div className={cn(
              "mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6",
              "transition-transform duration-300",
              isDragActive && "scale-110"
            )}>
              <Upload className="h-10 w-10 text-primary" />
            </div>
            
            <p className="text-xl font-semibold mb-2">
              {isDragActive ? "Drop your novel here" : "Upload Your Novel"}
            </p>
            <p className="text-muted-foreground mb-6">
              Drag and drop your Markdown file here, or click to browse
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Markdown (.md)</span>
              </div>
              <span>•</span>
              <span>Max {maxSize / 1048576}MB</span>
            </div>

            <Button 
              variant="default" 
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className={cn(
            "p-6 bg-gradient-to-br",
            uploadStatus === 'success' && "from-success/10 to-success/5",
            uploadStatus === 'error' && "from-destructive/10 to-destructive/5",
            uploadStatus === 'uploading' && "from-primary/10 to-secondary/5",
            uploadStatus === 'idle' && "from-muted/30 to-muted/10"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-lg flex items-center justify-center",
                  uploadStatus === 'success' && "bg-success/20",
                  uploadStatus === 'error' && "bg-destructive/20",
                  uploadStatus === 'uploading' && "bg-primary/20",
                  uploadStatus === 'idle' && "bg-muted"
                )}>
                  <FileText className={cn(
                    "h-6 w-6",
                    uploadStatus === 'success' && "text-success",
                    uploadStatus === 'error' && "text-destructive",
                    uploadStatus === 'uploading' && "text-primary",
                    uploadStatus === 'idle' && "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {uploadStatus === 'success' && (
                  <Badge variant="default" className="gap-1 bg-success text-success-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    Uploaded
                  </Badge>
                )}
                {uploadStatus === 'error' && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Failed
                  </Badge>
                )}
                {uploadStatus === 'uploading' && (
                  <Badge variant="secondary" className="gap-1">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Uploading
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-8 w-8 hover:bg-background/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Upload Progress</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="h-2 bg-background/50" 
                />
                <p className="text-xs text-muted-foreground">
                  Processing your novel with AI-powered analysis...
                </p>
              </div>
            )}

            {uploadStatus === 'error' && errorMessage && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Upload Failed</p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Successfully Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    Your novel is being processed and analyzed
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}