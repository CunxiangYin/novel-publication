// AI封面生成类型定义
export interface CoverStyle {
  id: string
  name: string
  description: string
  preview: string
  keywords: string[]
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface CoverPrompt {
  style: string
  scene: string
  mood: string
  elements: string[]
  colorScheme: ColorScheme
  additionalPrompt?: string
}

export interface GeneratedCover {
  id: string
  url: string
  prompt: CoverPrompt
  timestamp: Date
  selected?: boolean
}

export interface CoverGenerationOptions {
  novelId: string
  title: string
  author: string
  genre: string
  summary: string
  keywords: string[]
}

export interface PromptTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  examples: string[]
}

// 生成步骤
export type GenerationStep = 'extract' | 'prompt' | 'generate' | 'select'

export interface GenerationState {
  currentStep: GenerationStep
  extractedInfo: CoverGenerationOptions | null
  generatedPrompts: string[]
  selectedPrompt: string | null
  generatedCovers: GeneratedCover[]
  selectedCover: GeneratedCover | null
  isGenerating: boolean
  error: string | null
}