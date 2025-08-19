import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, Book, User, Tag, FileText, CheckCircle2, AlertCircle } from "lucide-react"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "./modal"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { LoadingSpinner } from "./loading-spinner"
import { Progress } from "./progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Alert, AlertDescription } from "./alert"
import { cn } from "@/lib/utils"

const publishFormSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题长度不能超过100字符"),
  author: z.string().min(1, "作者不能为空").max(50, "作者名长度不能超过50字符"),
  intro: z.string().min(10, "简介至少需要10个字符").max(1000, "简介长度不能超过1000字符"),
  categories: z.string().min(1, "请选择分类"),
  highlight: z.string().max(200, "亮点描述不能超过200字符").optional(),
  tags: z.string().optional(),
})

type PublishFormData = z.infer<typeof publishFormSchema>

export interface NovelData {
  title: string
  author: string
  intro: string
  categories: string
  highlight?: string
  chapters: Array<{
    title: string
    content: string
  }>
  wordCount: number
  chapterCount: number
}

export interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelData?: NovelData
  onPublish: (data: PublishFormData) => Promise<void>
  isPublishing?: boolean
  publishProgress?: number
}

const PublishDialog = ({
  open,
  onOpenChange,
  novelData,
  onPublish,
  isPublishing = false,
  publishProgress = 0,
}: PublishDialogProps) => {
  const [step, setStep] = React.useState<'form' | 'confirm' | 'publishing' | 'success' | 'error'>('form')
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<PublishFormData>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: {
      title: novelData?.title || "",
      author: novelData?.author || "",
      intro: novelData?.intro || "",
      categories: novelData?.categories || "",
      highlight: novelData?.highlight || "",
      tags: "",
    },
  })

  const formData = watch()

  React.useEffect(() => {
    if (novelData) {
      reset({
        title: novelData.title,
        author: novelData.author,
        intro: novelData.intro,
        categories: novelData.categories,
        highlight: novelData.highlight || "",
        tags: "",
      })
    }
  }, [novelData, reset])

  React.useEffect(() => {
    if (isPublishing) {
      setStep('publishing')
    }
  }, [isPublishing])

  const onSubmit = async (data: PublishFormData) => {
    try {
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : '表单验证失败')
      setStep('error')
    }
  }

  const handleConfirm = async () => {
    try {
      setError(null)
      setStep('publishing')
      await onPublish(formData)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败')
      setStep('error')
    }
  }

  const handleClose = () => {
    if (step === 'publishing') return
    
    setStep('form')
    setError(null)
    onOpenChange(false)
  }

  const renderFormStep = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            小说标题
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="请输入小说标题"
            className={cn(errors.title && "border-red-500")}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="author" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            作者
          </Label>
          <Input
            id="author"
            {...register("author")}
            placeholder="请输入作者名"
            className={cn(errors.author && "border-red-500")}
          />
          {errors.author && (
            <p className="text-xs text-red-500">{errors.author.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          小说简介
        </Label>
        <Textarea
          id="intro"
          {...register("intro")}
          placeholder="请输入小说简介，10-1000字符"
          rows={4}
          className={cn(errors.intro && "border-red-500")}
        />
        {errors.intro && (
          <p className="text-xs text-red-500">{errors.intro.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            分类
          </Label>
          <Input
            id="categories"
            {...register("categories")}
            placeholder="例如：都市,言情"
            className={cn(errors.categories && "border-red-500")}
          />
          {errors.categories && (
            <p className="text-xs text-red-500">{errors.categories.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">标签（可选）</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="例如：霸道总裁,甜宠"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="highlight">亮点描述（可选）</Label>
        <Textarea
          id="highlight"
          {...register("highlight")}
          placeholder="描述小说的亮点和特色，最多200字符"
          rows={2}
          className={cn(errors.highlight && "border-red-500")}
        />
        {errors.highlight && (
          <p className="text-xs text-red-500">{errors.highlight.message}</p>
        )}
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={!isValid}
        >
          下一步
        </Button>
      </ModalFooter>
    </form>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">确认发布信息</h3>
        <p className="text-sm text-muted-foreground">
          请仔细检查以下信息，确认无误后点击发布
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{formData.title}</CardTitle>
          <CardDescription>作者：{formData.author}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">简介</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {formData.intro}
            </p>
          </div>

          {formData.highlight && (
            <div>
              <h4 className="font-medium mb-2">亮点</h4>
              <p className="text-sm text-muted-foreground">
                {formData.highlight}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formData.categories}</Badge>
            {formData.tags && formData.tags.split(',').map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag.trim()}
              </Badge>
            ))}
          </div>

          {novelData && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {novelData.chapterCount}
                </div>
                <div className="text-xs text-muted-foreground">章节数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {novelData.wordCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">总字数</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('form')}
        >
          返回修改
        </Button>
        <Button
          onClick={handleConfirm}
          className="bg-green-600 hover:bg-green-700"
        >
          确认发布
        </Button>
      </ModalFooter>
    </div>
  )

  const renderPublishingStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h3 className="text-lg font-semibold">正在发布中...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            请稍等，系统正在处理您的小说
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>发布进度</span>
          <span>{Math.round(publishProgress)}%</span>
        </div>
        <Progress value={publishProgress} className="h-2" />
      </div>

      <div className="text-xs text-muted-foreground">
        请不要关闭此对话框，发布过程可能需要几分钟时间
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div>
          <h3 className="text-lg font-semibold text-green-700">发布成功！</h3>
          <p className="text-sm text-muted-foreground mt-2">
            您的小说已成功发布到平台
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">发布时间：</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">小说标题：</span>
              <span>{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">章节数量：</span>
              <span>{novelData?.chapterCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModalFooter>
        <Button onClick={handleClose} className="w-full">
          完成
        </Button>
      </ModalFooter>
    </div>
  )

  const renderErrorStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-700">发布失败</h3>
          <p className="text-sm text-muted-foreground mt-2">
            抱歉，发布过程中遇到了问题
          </p>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ModalFooter>
        <Button
          variant="outline"
          onClick={() => setStep('form')}
        >
          返回修改
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isPublishing}
        >
          重试发布
        </Button>
      </ModalFooter>
    </div>
  )

  const getStepContent = () => {
    switch (step) {
      case 'form':
        return renderFormStep()
      case 'confirm':
        return renderConfirmStep()
      case 'publishing':
        return renderPublishingStep()
      case 'success':
        return renderSuccessStep()
      case 'error':
        return renderErrorStep()
      default:
        return renderFormStep()
    }
  }

  const getModalSize = () => {
    switch (step) {
      case 'confirm':
      case 'success':
        return 'lg' as const
      default:
        return 'default' as const
    }
  }

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent size={getModalSize()}>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <ModalTitle>
              {step === 'form' && '发布小说'}
              {step === 'confirm' && '确认发布'}
              {step === 'publishing' && '正在发布'}
              {step === 'success' && '发布成功'}
              {step === 'error' && '发布失败'}
            </ModalTitle>
          </div>
          <ModalDescription>
            {step === 'form' && '请填写小说的基本信息'}
            {step === 'confirm' && '请确认发布信息无误'}
            {step === 'publishing' && '系统正在处理您的小说'}
            {step === 'success' && '小说已成功发布到平台'}
            {step === 'error' && '请检查信息后重试'}
          </ModalDescription>
        </ModalHeader>

        {getStepContent()}
      </ModalContent>
    </Modal>
  )
}

export { PublishDialog }