import axios from 'axios'
import { API_CONFIG } from '../config/api'

// Dynamically determine API base URL
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // For development with Vite proxy
  if (import.meta.env.DEV) {
    return ''
  }
  
  // For production/LAN access
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8038'
  }
  
  // LAN access - use same hostname with backend port
  return `${protocol}//${hostname}:8038`
}

const API_BASE = getApiBase()

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000 // 增加到2分钟，因为AI生成需要更多时间
})

// 设置请求拦截器，为JSON请求自动添加Content-Type
api.interceptors.request.use((config) => {
  // 只为非FormData请求设置JSON Content-Type
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  console.log(`API请求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  return config
})

// 设置响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    console.log(`API响应成功: ${response.status}`, response.data)
    return response
  },
  (error) => {
    console.error('API请求失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    })
    return Promise.reject(error)
  }
)

export interface NovelData {
  title: string
  author: string
  firstCategory: string
  secondCategory: string
  thirdCategory: string
  intro: string
  awesomeParagraph: string
  cover?: string  // 封面图base64
  coverPrompt?: string  // 封面生成prompt
  completeStatus: number
  chapterList: Array<{
    chapterTitle: string
    content: string  // 章节内容
    seq?: number  // 章节相对顺序
  }>
  metadata?: {
    sourceFile: string
    wordCount: number
    chapterCount: number
    parseTime: string
  }
}

export interface ParseOptions {
  generateIntro: boolean
  generateAwesomeParagraph: boolean
  autoCategories: boolean
}

export const novelAPI = {
  // 上传文件
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/novel/upload', formData, {
      headers: {
        // 让浏览器自动设置Content-Type，包含boundary
      }
    })
    return response.data
  },

  // 解析小说
  async parseNovel(filePath: string, options?: ParseOptions) {
    const response = await api.post('/api/novel/parse', {
      filePath,
      options: options || {
        generateIntro: true,
        generateAwesomeParagraph: true,
        autoCategories: true
      }
    })
    return response.data as NovelData
  },

  // 更新小说数据
  async updateNovel(filePath: string, data: NovelData) {
    const response = await api.put('/api/novel/update', {
      filePath,
      data
    })
    return response.data
  },

  // 发布小说
  async publishNovel(data: NovelData, platform: string = 'wechat') {
    const response = await api.post('/api/novel/publish', {
      data,
      platform
    })
    return response.data
  },

  // 列出小说文件
  async listNovels() {
    const response = await api.get('/api/novel/list')
    return response.data
  },

  // 健康检查
  async healthCheck() {
    const response = await api.get('/api/novel/health')
    return response.data
  }
}

// 导出类型
export type { NovelData, ParseOptions }

export default api