import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react'
import { categories, getSecondCategories, getThirdCategories } from '@/data/categories'
import type { NovelData } from '@/services/api'
import { useNovelStore } from '@/store/useNovelStore'
import { novelAPI } from '@/services/api'

interface EnhancedNovelFormProps {
  initialData: NovelData
  onSubmit?: (data: NovelData) => Promise<void>
}

interface ValidationErrors {
  title?: string
  author?: string
  intro?: string
  awesomeParagraph?: string
  categories?: string
}

export function EnhancedNovelForm({ initialData, onSubmit }: EnhancedNovelFormProps) {
  const [formData, setFormData] = useState<NovelData>(initialData)
  const [secondCategories, setSecondCategories] = useState<string[]>([])
  const [thirdCategories, setThirdCategories] = useState<string[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { currentFilePath, markClean, markDirty } = useNovelStore()

  // 实时验证函数
  const validateField = useCallback((field: keyof NovelData, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length === 0) {
          return '标题不能为空'
        }
        if (value.length > 100) {
          return '标题不能超过100个字符'
        }
        break
      case 'author':
        if (!value || value.trim().length === 0) {
          return '作者名不能为空'
        }
        if (value.length > 50) {
          return '作者名不能超过50个字符'
        }
        break
      case 'intro':
        if (!value || value.trim().length === 0) {
          return '简介不能为空'
        }
        if (value.length < 50) {
          return '简介至少需要50个字符'
        }
        if (value.length > 500) {
          return '简介不能超过500个字符'
        }
        break
      case 'awesomeParagraph':
        if (!value || value.trim().length === 0) {
          return '精彩片段不能为空'
        }
        if (value.length < 100) {
          return '精彩片段至少需要100个字符'
        }
        if (value.length > 1000) {
          return '精彩片段不能超过1000个字符'
        }
        break
    }
    return undefined
  }, [])

  // 验证所有字段
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}
    
    // 验证各个字段
    const titleError = validateField('title', formData.title)
    if (titleError) newErrors.title = titleError
    
    const authorError = validateField('author', formData.author)
    if (authorError) newErrors.author = authorError
    
    const introError = validateField('intro', formData.intro)
    if (introError) newErrors.intro = introError
    
    const awesomeError = validateField('awesomeParagraph', formData.awesomeParagraph)
    if (awesomeError) newErrors.awesomeParagraph = awesomeError
    
    // 验证分类
    if (!formData.firstCategory || !formData.secondCategory || !formData.thirdCategory) {
      newErrors.categories = '请选择完整的分类'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, validateField])

  // 自动保存功能
  const autoSave = useCallback(async () => {
    if (!currentFilePath || !isDirty) return
    
    setIsAutoSaving(true)
    try {
      await novelAPI.updateNovel(currentFilePath, formData)
      setLastSavedTime(new Date())
      markClean()
      setIsDirty(false)
    } catch (error) {
      console.error('自动保存失败:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [currentFilePath, formData, isDirty, markClean])

  // 设置自动保存定时器
  useEffect(() => {
    if (isDirty) {
      // 清除之前的定时器
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      // 设置新的定时器（3秒后自动保存）
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave()
      }, 3000)
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isDirty, autoSave])

  // 处理字段变更
  const handleFieldChange = useCallback((field: keyof NovelData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    markDirty()
    
    // 实时验证
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [validateField, markDirty])

  // 处理分类变更
  useEffect(() => {
    if (formData.firstCategory) {
      const secondCats = getSecondCategories(formData.firstCategory)
      setSecondCategories(secondCats)
      
      if (!secondCats.includes(formData.secondCategory)) {
        handleFieldChange('secondCategory', '')
        handleFieldChange('thirdCategory', '')
        setThirdCategories([])
      }
    }
  }, [formData.firstCategory, formData.secondCategory, handleFieldChange])

  useEffect(() => {
    if (formData.firstCategory && formData.secondCategory) {
      const thirdCats = getThirdCategories(formData.firstCategory, formData.secondCategory)
      setThirdCategories(thirdCats)
      
      if (!thirdCats.includes(formData.thirdCategory)) {
        handleFieldChange('thirdCategory', '')
      }
    }
  }, [formData.firstCategory, formData.secondCategory, formData.thirdCategory, handleFieldChange])

  // 手动保存
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }
    
    setIsSaving(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else if (currentFilePath) {
        await novelAPI.updateNovel(currentFilePath, formData)
      }
      setLastSavedTime(new Date())
      setIsDirty(false)
      markClean()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>编辑小说信息</CardTitle>
            <CardDescription>
              带有实时验证和自动保存功能
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                自动保存中...
              </Badge>
            )}
            {lastSavedTime && !isAutoSaving && (
              <Badge variant="outline">
                <Check className="h-3 w-3 mr-1" />
                已保存 {lastSavedTime.toLocaleTimeString()}
              </Badge>
            )}
            {isDirty && (
              <Badge variant="destructive">未保存的更改</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="请输入小说标题"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">
              作者 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleFieldChange('author', e.target.value)}
              placeholder="请输入作者名"
              className={errors.author ? 'border-destructive' : ''}
            />
            {errors.author && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.author}
              </p>
            )}
          </div>
        </div>

        {/* 分类选择 */}
        <div className="space-y-4">
          <Label>
            分类 <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <Select
              value={formData.firstCategory}
              onValueChange={(value) => handleFieldChange('firstCategory', value)}
            >
              <SelectTrigger className={errors.categories && !formData.firstCategory ? 'border-destructive' : ''}>
                <SelectValue placeholder="一级分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.firstCategory} value={cat.firstCategory}>
                    {cat.firstCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.secondCategory}
              onValueChange={(value) => handleFieldChange('secondCategory', value)}
              disabled={!formData.firstCategory}
            >
              <SelectTrigger className={errors.categories && !formData.secondCategory ? 'border-destructive' : ''}>
                <SelectValue placeholder="二级分类" />
              </SelectTrigger>
              <SelectContent>
                {secondCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.thirdCategory}
              onValueChange={(value) => handleFieldChange('thirdCategory', value)}
              disabled={!formData.secondCategory}
            >
              <SelectTrigger className={errors.categories && !formData.thirdCategory ? 'border-destructive' : ''}>
                <SelectValue placeholder="三级分类" />
              </SelectTrigger>
              <SelectContent>
                {thirdCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.categories && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.categories}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 详细信息 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intro">
              简介 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="intro"
              value={formData.intro}
              onChange={(e) => handleFieldChange('intro', e.target.value)}
              placeholder="请输入小说简介（50-500字）"
              rows={4}
              className={errors.intro ? 'border-destructive' : ''}
            />
            {errors.intro && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.intro}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.intro.length}/500
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="awesomeParagraph">
              精彩片段 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="awesomeParagraph"
              value={formData.awesomeParagraph}
              onChange={(e) => handleFieldChange('awesomeParagraph', e.target.value)}
              placeholder="请输入精彩片段（100-1000字）"
              rows={6}
              className={errors.awesomeParagraph ? 'border-destructive' : ''}
            />
            {errors.awesomeParagraph && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.awesomeParagraph}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.awesomeParagraph.length}/1000
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setFormData(initialData)}
            disabled={!isDirty}
          >
            重置
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isAutoSaving || !isDirty}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}