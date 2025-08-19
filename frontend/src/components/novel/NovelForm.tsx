import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Sparkles, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { 
  getFirstCategories, 
  getSecondCategories, 
  getThirdCategories 
} from '@/data/categories'

const novelFormSchema = z.object({
  title: z.string().min(1, '请输入作品标题').max(100, '标题不能超过100字'),
  author: z.string().min(1, '请输入作者笔名').max(50, '笔名不能超过50字'),
  firstCategory: z.string().min(1, '请选择一级分类'),
  secondCategory: z.string().min(1, '请选择二级分类'),
  thirdCategory: z.string().min(1, '请选择三级分类'),
  intro: z.string()
    .min(200, '简介至少200字')
    .max(300, '简介不能超过300字'),
  awesomeParagraph: z.string()
    .min(400, '精彩片段至少400字')
    .max(1000, '精彩片段不能超过1000字')
})

type NovelFormValues = z.infer<typeof novelFormSchema>

interface NovelFormProps {
  initialData?: Partial<NovelFormValues>
  onSubmit: (data: NovelFormValues) => Promise<void>
  onAutoGenerate?: (field: keyof NovelFormValues) => Promise<string>
}

export function NovelForm({ 
  initialData, 
  onSubmit, 
  onAutoGenerate 
}: NovelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<NovelFormValues>({
    resolver: zodResolver(novelFormSchema),
    defaultValues: initialData || {
      title: '',
      author: '',
      firstCategory: '女频',
      secondCategory: '现代言情',
      thirdCategory: '都市生活',
      intro: '',
      awesomeParagraph: ''
    }
  })

  const [generatingField, setGeneratingField] = useState<string | null>(null)
  
  // 分类选项状态
  const [firstCategories] = useState(getFirstCategories())
  const [secondCategories, setSecondCategories] = useState<string[]>([])
  const [thirdCategories, setThirdCategories] = useState<string[]>([])
  
  // 监听分类变化
  const selectedFirstCategory = watch('firstCategory')
  const selectedSecondCategory = watch('secondCategory')
  
  // 一级分类变化时，更新二级分类选项
  useEffect(() => {
    if (selectedFirstCategory) {
      const secondCats = getSecondCategories(selectedFirstCategory)
      setSecondCategories(secondCats)
      
      // 如果当前的二级分类不在新的选项中，选择第一个
      if (secondCats.length > 0 && !secondCats.includes(selectedSecondCategory)) {
        setValue('secondCategory', secondCats[0])
      }
    }
  }, [selectedFirstCategory, selectedSecondCategory, setValue])
  
  // 二级分类变化时，更新三级分类选项
  useEffect(() => {
    if (selectedFirstCategory && selectedSecondCategory) {
      const thirdCats = getThirdCategories(selectedFirstCategory, selectedSecondCategory)
      setThirdCategories(thirdCats)
      
      // 如果当前的三级分类不在新的选项中，选择第一个
      const selectedThirdCategory = watch('thirdCategory')
      if (thirdCats.length > 0 && !thirdCats.includes(selectedThirdCategory)) {
        setValue('thirdCategory', thirdCats[0])
      }
    }
  }, [selectedFirstCategory, selectedSecondCategory, setValue, watch])
  
  // 初始化分类选项
  useEffect(() => {
    const firstCat = initialData?.firstCategory || '女频'
    const secondCats = getSecondCategories(firstCat)
    setSecondCategories(secondCats)
    
    const secondCat = initialData?.secondCategory || secondCats[0]
    const thirdCats = getThirdCategories(firstCat, secondCat)
    setThirdCategories(thirdCats)
  }, [initialData])

  const handleAutoGenerate = async (field: keyof NovelFormValues) => {
    if (!onAutoGenerate) return
    
    setGeneratingField(field)
    try {
      const generatedContent = await onAutoGenerate(field)
      setValue(field, generatedContent)
    } catch (error) {
      console.error('生成失败:', error)
    } finally {
      setGeneratingField(null)
    }
  }

  const introLength = watch('intro')?.length || 0
  const paragraphLength = watch('awesomeParagraph')?.length || 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="category">分类设置</TabsTrigger>
          <TabsTrigger value="content">内容描述</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>作品基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">作品标题</Label>
                <Input 
                  id="title"
                  placeholder="请输入作品标题" 
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">作者笔名</Label>
                <Input 
                  id="author"
                  placeholder="请输入作者笔名" 
                  {...register('author')}
                />
                {errors.author && (
                  <p className="text-sm text-destructive">{errors.author.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>作品分类</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstCategory">一级分类</Label>
                <select 
                  id="firstCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('firstCategory')}
                >
                  {firstCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.firstCategory && (
                  <p className="text-sm text-destructive">{errors.firstCategory.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondCategory">二级分类</Label>
                <select 
                  id="secondCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('secondCategory')}
                >
                  {secondCategories.length === 0 ? (
                    <option value="">请先选择一级分类</option>
                  ) : (
                    secondCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
                {errors.secondCategory && (
                  <p className="text-sm text-destructive">{errors.secondCategory.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thirdCategory">三级分类</Label>
                <select 
                  id="thirdCategory"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('thirdCategory')}
                >
                  {thirdCategories.length === 0 ? (
                    <option value="">请先选择二级分类</option>
                  ) : (
                    thirdCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
                {errors.thirdCategory && (
                  <p className="text-sm text-destructive">{errors.thirdCategory.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>作品简介</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="intro">简介内容</Label>
                <Textarea
                  id="intro"
                  placeholder="请输入作品简介（200-300字）"
                  className="min-h-[120px] resize-none"
                  {...register('intro')}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {introLength} / 300 字
                  </span>
                  {onAutoGenerate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoGenerate('intro')}
                      disabled={generatingField === 'intro'}
                    >
                      {generatingField === 'intro' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      AI生成
                    </Button>
                  )}
                </div>
                {errors.intro && (
                  <p className="text-sm text-destructive">{errors.intro.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>精彩片段</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="awesomeParagraph">片段内容</Label>
                <Textarea
                  id="awesomeParagraph"
                  placeholder="请输入精彩片段（400-1000字）"
                  className="min-h-[200px] resize-none"
                  {...register('awesomeParagraph')}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {paragraphLength} / 1000 字
                  </span>
                  {onAutoGenerate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoGenerate('awesomeParagraph')}
                      disabled={generatingField === 'awesomeParagraph'}
                    >
                      {generatingField === 'awesomeParagraph' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      AI生成
                    </Button>
                  )}
                </div>
                {errors.awesomeParagraph && (
                  <p className="text-sm text-destructive">{errors.awesomeParagraph.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存修改
            </>
          )}
        </Button>
      </div>
    </form>
  )
}