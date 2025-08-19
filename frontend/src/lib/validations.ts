import { z } from 'zod'

export const novelMetadataSchema = z.object({
  title: z.string()
    .min(1, '标题不能为空')
    .max(50, '标题不能超过50个字符'),
  
  author: z.string()
    .min(1, '作者名不能为空')
    .max(20, '作者名不能超过20个字符'),
  
  firstCategory: z.enum(['男频', '女频'], {
    required_error: '请选择一级分类'
  }),
  
  secondCategory: z.enum([
    '现代言情', '古代言情', '浪漫青春', 
    '都市', '玄幻', '仙侠'
  ], {
    required_error: '请选择二级分类'
  }),
  
  thirdCategory: z.enum([
    '豪门总裁', '都市生活', '婚恋情缘',
    '宫廷侯爵', '古典架空', '穿越奇情'
  ], {
    required_error: '请选择三级分类'
  }),
  
  intro: z.string()
    .min(50, '简介至少需要50个字')
    .max(300, '简介不能超过300个字'),
  
  awesomeParagraph: z.string()
    .min(100, '精彩片段至少需要100个字')
    .max(1000, '精彩片段不能超过1000个字'),
  
  coverPrompt: z.string()
    .max(500, '封面Prompt不能超过500个字符')
    .optional()
})

export type NovelMetadata = z.infer<typeof novelMetadataSchema>

// Validation helper
export function validateNovelData(data: unknown): { 
  success: boolean
  errors?: Record<string, string>
  data?: NovelMetadata 
} {
  try {
    const validated = novelMetadataSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: '验证失败' } }
  }
}