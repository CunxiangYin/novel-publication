import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  CoverStyle, 
  ColorScheme, 
  CoverPrompt, 
  GeneratedCover, 
  CoverGenerationOptions,
  PromptTemplate,
  GenerationStep,
  GenerationState
} from '@/types/cover'

interface CoverStore extends GenerationState {
  // 历史记录
  history: GeneratedCover[]
  templates: PromptTemplate[]
  styles: CoverStyle[]
  
  // 步骤控制
  setStep: (step: GenerationStep) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  
  // 信息提取
  extractNovelInfo: (content: string) => Promise<CoverGenerationOptions>
  setExtractedInfo: (info: CoverGenerationOptions) => void
  
  // Prompt生成
  generatePrompts: (options: CoverGenerationOptions) => Promise<string[]>
  selectPrompt: (prompt: string) => void
  editPrompt: (prompt: string) => void
  savePromptAsTemplate: (name: string, category: string) => void
  
  // 封面生成
  generateCovers: (prompt: string, count?: number) => Promise<GeneratedCover[]>
  regenerateCover: (index: number) => Promise<void>
  selectCover: (cover: GeneratedCover) => void
  
  // 历史管理
  saveToHistory: (cover: GeneratedCover) => void
  loadFromHistory: (id: string) => GeneratedCover | undefined
  clearHistory: () => void
  
  // 模板管理
  loadTemplates: () => Promise<void>
  createTemplate: (template: Omit<PromptTemplate, 'id'>) => void
  deleteTemplate: (id: string) => void
  applyTemplate: (templateId: string, variables: Record<string, string>) => string
  
  // 样式管理
  loadStyles: () => Promise<void>
  selectStyle: (styleId: string) => void
}

// 预设样式
const defaultStyles: CoverStyle[] = [
  {
    id: 'realistic',
    name: '写实风格',
    description: '逼真的照片级渲染，适合现代都市、悬疑推理类小说',
    preview: 'https://via.placeholder.com/200x300?text=Realistic',
    keywords: ['photorealistic', 'detailed', 'high resolution', '8k']
  },
  {
    id: 'illustration',
    name: '插画风格',
    description: '艺术插画风格，适合奇幻、童话类小说',
    preview: 'https://via.placeholder.com/200x300?text=Illustration',
    keywords: ['illustration', 'artistic', 'painted', 'colorful']
  },
  {
    id: 'minimalist',
    name: '极简风格',
    description: '简洁大气的设计，适合文学、散文类作品',
    preview: 'https://via.placeholder.com/200x300?text=Minimalist',
    keywords: ['minimalist', 'simple', 'clean', 'modern']
  },
  {
    id: 'fantasy',
    name: '奇幻风格',
    description: '魔幻绚丽的视觉效果，适合玄幻、仙侠类小说',
    preview: 'https://via.placeholder.com/200x300?text=Fantasy',
    keywords: ['fantasy', 'magical', 'ethereal', 'mystical']
  },
  {
    id: 'scifi',
    name: '科幻风格',
    description: '未来感十足的设计，适合科幻、赛博朋克类小说',
    preview: 'https://via.placeholder.com/200x300?text=SciFi',
    keywords: ['sci-fi', 'futuristic', 'cyberpunk', 'neon']
  },
  {
    id: 'vintage',
    name: '复古风格',
    description: '经典怀旧的设计风格，适合历史、民国类小说',
    preview: 'https://via.placeholder.com/200x300?text=Vintage',
    keywords: ['vintage', 'retro', 'classic', 'nostalgic']
  }
]

// 预设模板
const defaultTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    name: '都市小说封面',
    category: '现代都市',
    template: 'A book cover for "{title}" by {author}, modern city skyline at {time}, {mood} atmosphere, featuring {mainElement}, {style} style, {colorScheme} color palette',
    variables: ['title', 'author', 'time', 'mood', 'mainElement', 'style', 'colorScheme'],
    examples: [
      'A book cover for "城市之光" by 张三, modern city skyline at sunset, romantic atmosphere, featuring silhouettes of two people, photorealistic style, warm color palette'
    ]
  },
  {
    id: 'template-2',
    name: '玄幻小说封面',
    category: '玄幻仙侠',
    template: 'Epic fantasy book cover for "{title}", {character} with {weapon}, {magicalEffect} in background, {location} setting, {style} art style, {mood} mood',
    variables: ['title', 'character', 'weapon', 'magicalEffect', 'location', 'style', 'mood'],
    examples: [
      'Epic fantasy book cover for "剑道独尊", young warrior with glowing sword, lightning effects in background, mountain peak setting, Chinese painting art style, heroic mood'
    ]
  },
  {
    id: 'template-3',
    name: '悬疑推理封面',
    category: '悬疑推理',
    template: 'Mystery thriller book cover for "{title}", {scene} with {keyElement}, {lighting} lighting, creating {mood} atmosphere, {style} style, {colorTone} tones',
    variables: ['title', 'scene', 'keyElement', 'lighting', 'mood', 'style', 'colorTone'],
    examples: [
      'Mystery thriller book cover for "迷雾追凶", dark alley with mysterious figure, dramatic shadows lighting, creating suspenseful atmosphere, noir style, dark blue tones'
    ]
  }
]

// 模拟AI生成函数
const mockAIGeneration = {
  extractInfo: async (content: string): Promise<CoverGenerationOptions> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      novelId: 'novel-1',
      title: '示例小说',
      author: '示例作者',
      genre: '都市言情',
      summary: '这是一个关于爱与成长的故事...',
      keywords: ['都市', '爱情', '成长', '职场']
    }
  },
  
  generatePrompts: async (options: CoverGenerationOptions): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      `A romantic book cover for "${options.title}" by ${options.author}, modern city background with warm sunset, couple silhouette, professional photography style`,
      `Book cover design for "${options.title}", minimalist style with abstract geometric shapes representing love and growth, pastel color palette`,
      `"${options.title}" book cover, watercolor illustration of city skyline with two figures, dreamy atmosphere, soft pink and blue tones`
    ]
  },
  
  generateCovers: async (prompt: string, count: number): Promise<GeneratedCover[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return Array.from({ length: count }, (_, i) => ({
      id: `cover-${Date.now()}-${i}`,
      url: `https://via.placeholder.com/400x600?text=Cover${i + 1}`,
      prompt: {
        style: 'realistic',
        scene: 'city sunset',
        mood: 'romantic',
        elements: ['couple', 'skyline', 'warm light'],
        colorScheme: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#45B7D1',
          background: '#F7F7F7',
          text: '#2C3E50'
        }
      },
      timestamp: new Date()
    }))
  }
}

export const useCoverStore = create<CoverStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentStep: 'extract',
      extractedInfo: null,
      generatedPrompts: [],
      selectedPrompt: null,
      generatedCovers: [],
      selectedCover: null,
      isGenerating: false,
      error: null,
      history: [],
      templates: defaultTemplates,
      styles: defaultStyles,
      
      // 步骤控制
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const steps: GenerationStep[] = ['extract', 'prompt', 'generate', 'select']
        const currentIndex = steps.indexOf(get().currentStep)
        if (currentIndex < steps.length - 1) {
          set({ currentStep: steps[currentIndex + 1] })
        }
      },
      
      prevStep: () => {
        const steps: GenerationStep[] = ['extract', 'prompt', 'generate', 'select']
        const currentIndex = steps.indexOf(get().currentStep)
        if (currentIndex > 0) {
          set({ currentStep: steps[currentIndex - 1] })
        }
      },
      
      reset: () => set({
        currentStep: 'extract',
        extractedInfo: null,
        generatedPrompts: [],
        selectedPrompt: null,
        generatedCovers: [],
        selectedCover: null,
        isGenerating: false,
        error: null
      }),
      
      // 信息提取
      extractNovelInfo: async (content) => {
        set({ isGenerating: true, error: null })
        try {
          const info = await mockAIGeneration.extractInfo(content)
          set({ extractedInfo: info, isGenerating: false })
          return info
        } catch (error) {
          set({ error: '信息提取失败', isGenerating: false })
          throw error
        }
      },
      
      setExtractedInfo: (info) => set({ extractedInfo: info }),
      
      // Prompt生成
      generatePrompts: async (options) => {
        set({ isGenerating: true, error: null })
        try {
          const prompts = await mockAIGeneration.generatePrompts(options)
          set({ generatedPrompts: prompts, isGenerating: false })
          return prompts
        } catch (error) {
          set({ error: 'Prompt生成失败', isGenerating: false })
          throw error
        }
      },
      
      selectPrompt: (prompt) => set({ selectedPrompt: prompt }),
      
      editPrompt: (prompt) => set({ selectedPrompt: prompt }),
      
      savePromptAsTemplate: (name, category) => {
        const { selectedPrompt } = get()
        if (!selectedPrompt) return
        
        const template: PromptTemplate = {
          id: `template-${Date.now()}`,
          name,
          category,
          template: selectedPrompt,
          variables: [],
          examples: [selectedPrompt]
        }
        
        set(state => ({ templates: [...state.templates, template] }))
      },
      
      // 封面生成
      generateCovers: async (prompt, count = 4) => {
        set({ isGenerating: true, error: null })
        try {
          const covers = await mockAIGeneration.generateCovers(prompt, count)
          set({ generatedCovers: covers, isGenerating: false })
          return covers
        } catch (error) {
          set({ error: '封面生成失败', isGenerating: false })
          throw error
        }
      },
      
      regenerateCover: async (index) => {
        const { selectedPrompt } = get()
        if (!selectedPrompt) return
        
        set({ isGenerating: true })
        try {
          const newCovers = await mockAIGeneration.generateCovers(selectedPrompt, 1)
          set(state => {
            const covers = [...state.generatedCovers]
            covers[index] = newCovers[0]
            return { generatedCovers: covers, isGenerating: false }
          })
        } catch (error) {
          set({ error: '重新生成失败', isGenerating: false })
        }
      },
      
      selectCover: (cover) => set({ selectedCover: cover }),
      
      // 历史管理
      saveToHistory: (cover) => {
        set(state => ({ history: [cover, ...state.history].slice(0, 50) }))
      },
      
      loadFromHistory: (id) => {
        return get().history.find(c => c.id === id)
      },
      
      clearHistory: () => set({ history: [] }),
      
      // 模板管理
      loadTemplates: async () => {
        // 实际应用中从API加载
        await new Promise(resolve => setTimeout(resolve, 100))
      },
      
      createTemplate: (template) => {
        set(state => ({
          templates: [...state.templates, { ...template, id: `template-${Date.now()}` }]
        }))
      },
      
      deleteTemplate: (id) => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== id)
        }))
      },
      
      applyTemplate: (templateId, variables) => {
        const template = get().templates.find(t => t.id === templateId)
        if (!template) return ''
        
        let result = template.template
        Object.entries(variables).forEach(([key, value]) => {
          result = result.replace(`{${key}}`, value)
        })
        return result
      },
      
      // 样式管理
      loadStyles: async () => {
        // 实际应用中从API加载
        await new Promise(resolve => setTimeout(resolve, 100))
      },
      
      selectStyle: (styleId) => {
        const style = get().styles.find(s => s.id === styleId)
        if (style) {
          // 应用样式相关的关键词到prompt
          console.log('Selected style:', style)
        }
      }
    }),
    {
      name: 'cover-generation-storage',
      partialize: (state) => ({
        history: state.history,
        templates: state.templates
      })
    }
  )
)