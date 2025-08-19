# 组件架构设计文档

## 核心组件库设计

### 一、基础组件层 (Foundation Layer)

#### 1.1 布局组件
```typescript
// 页面容器
interface PageContainerProps {
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  children: ReactNode
}

// 响应式网格
interface ResponsiveGridProps {
  cols?: { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number
  children: ReactNode
}

// 分栏布局
interface SplitLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: string
  collapsible?: boolean
}
```

#### 1.2 数据展示组件
```typescript
// 增强数据表格
interface EnhancedDataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilterConfig
  selection?: SelectionConfig
  actions?: TableAction[]
  emptyState?: ReactNode
  loading?: boolean
}

// 统计卡片
interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: ReactNode
  trend?: ChartData
  loading?: boolean
}

// 时间线组件
interface TimelineProps {
  items: TimelineItem[]
  orientation?: 'vertical' | 'horizontal'
  variant?: 'default' | 'compact'
}
```

#### 1.3 表单组件
```typescript
// 智能表单
interface SmartFormProps<T> {
  schema: FormSchema<T>
  initialValues?: Partial<T>
  onSubmit: (values: T) => Promise<void>
  validation?: ValidationRules<T>
  layout?: 'vertical' | 'horizontal' | 'inline'
}

// 文件上传增强
interface FileUploaderProps {
  accept?: string[]
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  dragDrop?: boolean
  preview?: boolean
  onUpload: (files: File[]) => Promise<void>
  onProgress?: (progress: number) => void
}

// 富文本编辑器包装
interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  toolbar?: ToolbarConfig
  plugins?: EditorPlugin[]
  placeholder?: string
  maxLength?: number
}
```

### 二、业务组件层 (Business Layer)

#### 2.1 小说管理组件
```typescript
// 小说卡片
interface NovelCardProps {
  novel: Novel
  variant?: 'default' | 'compact' | 'detailed'
  actions?: CardAction[]
  onClick?: () => void
  selected?: boolean
}

// 章节编辑器
interface ChapterEditorProps {
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  tools?: EditorTool[]
  preview?: boolean
  autoSave?: boolean
}

// 发布流程向导
interface PublishWizardProps {
  novel: Novel
  steps?: WizardStep[]
  onComplete: (result: PublishResult) => void
  platforms?: Platform[]
}
```

#### 2.2 AI生成组件
```typescript
// Prompt生成器
interface PromptGeneratorProps {
  context: string
  templates?: PromptTemplate[]
  onGenerate: (prompt: string) => void
  suggestions?: boolean
  history?: PromptHistory[]
}

// 封面生成器
interface CoverGeneratorProps {
  novel: Novel
  styles?: CoverStyle[]
  onGenerate: (covers: Cover[]) => void
  editMode?: boolean
}

// 文案生成器
interface CopyGeneratorProps {
  novel: Novel
  platforms?: string[]
  tones?: ToneOption[]
  onGenerate: (copies: MarketingCopy[]) => void
}
```

#### 2.3 分析组件
```typescript
// 图表容器
interface ChartContainerProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  loading?: boolean
  error?: Error
}

// 数据仪表板
interface DashboardWidgetProps {
  type: 'stats' | 'chart' | 'list' | 'activity'
  config: WidgetConfig
  data: any
  refreshInterval?: number
}

// 热力图
interface HeatmapProps {
  data: HeatmapData
  xAxis: string[]
  yAxis: string[]
  colorScale?: ColorScale
  tooltip?: TooltipConfig
}
```

### 三、复合组件设计模式

#### 3.1 Compound Components Pattern
```typescript
// 复合卡片组件
const NovelCard = {
  Root: CardRoot,
  Header: CardHeader,
  Cover: CardCover,
  Stats: CardStats,
  Actions: CardActions,
}

// 使用示例
<NovelCard.Root>
  <NovelCard.Header title={novel.title} author={novel.author} />
  <NovelCard.Cover src={novel.coverUrl} alt={novel.title} />
  <NovelCard.Stats views={1000} likes={50} />
  <NovelCard.Actions>
    <Button>编辑</Button>
    <Button>发布</Button>
  </NovelCard.Actions>
</NovelCard.Root>
```

#### 3.2 Render Props Pattern
```typescript
// 数据获取组件
interface DataFetcherProps<T> {
  url: string
  params?: Record<string, any>
  children: (data: T, loading: boolean, error: Error | null) => ReactNode
}

// 使用示例
<DataFetcher url="/api/novels" params={{ page: 1 }}>
  {(novels, loading, error) => {
    if (loading) return <Skeleton />
    if (error) return <ErrorMessage />
    return <NovelList novels={novels} />
  }}
</DataFetcher>
```

#### 3.3 Provider Pattern
```typescript
// 主题提供者
interface ThemeProviderProps {
  theme?: Theme
  children: ReactNode
}

// 通知提供者
interface NotificationProviderProps {
  position?: Position
  maxCount?: number
  duration?: number
  children: ReactNode
}

// 使用示例
<ThemeProvider theme={customTheme}>
  <NotificationProvider position="top-right">
    <App />
  </NotificationProvider>
</ThemeProvider>
```

### 四、Hooks库设计

#### 4.1 数据Hooks
```typescript
// 分页数据获取
function usePaginatedData<T>(
  url: string,
  options?: {
    pageSize?: number
    initialPage?: number
    params?: Record<string, any>
  }
): {
  data: T[]
  loading: boolean
  error: Error | null
  page: number
  totalPages: number
  goToPage: (page: number) => void
  refresh: () => void
}

// 实时数据订阅
function useRealtimeData<T>(
  channel: string,
  options?: {
    initialData?: T
    transform?: (data: any) => T
  }
): {
  data: T | null
  connected: boolean
  error: Error | null
}

// 搜索防抖
function useDebouncedSearch(
  searchFn: (query: string) => Promise<any[]>,
  delay: number = 300
): {
  results: any[]
  searching: boolean
  search: (query: string) => void
  clear: () => void
}
```

#### 4.2 UI Hooks
```typescript
// 响应式断点
function useBreakpoint(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  currentBreakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

// 主题切换
function useTheme(): {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: Theme
}

// 全屏控制
function useFullscreen(
  ref: RefObject<HTMLElement>
): {
  isFullscreen: boolean
  enter: () => void
  exit: () => void
  toggle: () => void
}
```

#### 4.3 业务Hooks
```typescript
// 小说管理
function useNovelManager(): {
  novels: Novel[]
  loading: boolean
  createNovel: (data: NovelInput) => Promise<Novel>
  updateNovel: (id: string, data: Partial<Novel>) => Promise<void>
  deleteNovel: (id: string) => Promise<void>
  publishNovel: (id: string, options: PublishOptions) => Promise<void>
}

// AI生成
function useAIGeneration(): {
  generateCover: (prompt: string) => Promise<Cover[]>
  generateCopy: (context: string, platform: string) => Promise<string>
  generatePrompt: (description: string) => Promise<string>
  optimizeText: (text: string) => Promise<string>
}

// 文件处理
function useFileProcessor(): {
  processFile: (file: File) => Promise<ProcessedFile>
  extractChapters: (content: string) => Chapter[]
  parseMetadata: (content: string) => NovelMetadata
  validateFormat: (file: File) => ValidationResult
}
```

### 五、工具函数库

#### 5.1 格式化工具
```typescript
// 数字格式化
export const formatters = {
  number: (value: number, options?: Intl.NumberFormatOptions) => string,
  currency: (value: number, currency: string = 'CNY') => string,
  percentage: (value: number, decimals: number = 1) => string,
  fileSize: (bytes: number) => string,
  duration: (seconds: number) => string,
  relativeTime: (date: Date) => string,
}

// 文本处理
export const textUtils = {
  truncate: (text: string, length: number, suffix?: string) => string,
  highlight: (text: string, query: string) => ReactNode,
  extractExcerpt: (content: string, length: number) => string,
  countWords: (text: string) => number,
  sanitizeHtml: (html: string) => string,
}
```

#### 5.2 验证工具
```typescript
// 表单验证
export const validators = {
  required: (value: any) => boolean,
  email: (value: string) => boolean,
  url: (value: string) => boolean,
  pattern: (value: string, pattern: RegExp) => boolean,
  minLength: (value: string, min: number) => boolean,
  maxLength: (value: string, max: number) => boolean,
  range: (value: number, min: number, max: number) => boolean,
}

// 文件验证
export const fileValidators = {
  size: (file: File, maxSize: number) => boolean,
  type: (file: File, allowedTypes: string[]) => boolean,
  dimensions: (file: File, constraints: DimensionConstraints) => Promise<boolean>,
  content: (file: File, validator: (content: string) => boolean) => Promise<boolean>,
}
```

### 六、样式系统

#### 6.1 主题变量
```css
/* 颜色系统 */
:root {
  /* Primary Colors */
  --primary-50: hsl(var(--primary-hue) 100% 95%);
  --primary-100: hsl(var(--primary-hue) 100% 90%);
  --primary-500: hsl(var(--primary-hue) 100% 50%);
  --primary-900: hsl(var(--primary-hue) 100% 10%);
  
  /* Semantic Colors */
  --success: hsl(142 76% 36%);
  --warning: hsl(45 100% 51%);
  --error: hsl(0 84% 60%);
  --info: hsl(199 89% 48%);
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

#### 6.2 动画预设
```typescript
// 动画配置
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
  collapse: {
    initial: { height: 0 },
    animate: { height: 'auto' },
    exit: { height: 0 },
  },
}

// 过渡配置
export const transitions = {
  fast: { duration: 0.1 },
  normal: { duration: 0.2 },
  slow: { duration: 0.3 },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
}
```

### 七、测试工具

#### 7.1 测试助手
```typescript
// 组件测试包装器
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
): RenderResult

// Mock数据生成器
export const mockGenerators = {
  novel: (overrides?: Partial<Novel>) => Novel,
  chapter: (overrides?: Partial<Chapter>) => Chapter,
  user: (overrides?: Partial<User>) => User,
  publishHistory: (count: number) => PublishHistory[],
}

// 测试工具函数
export const testUtils = {
  waitForLoadingToFinish: () => Promise<void>,
  mockApiResponse: (url: string, response: any) => void,
  simulateNetworkError: () => void,
  advanceTimersByTime: (ms: number) => void,
}
```

#### 7.2 Storybook配置
```typescript
// 组件Story模板
export const storyTemplate = {
  title: 'Components/ComponentName',
  component: Component,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Component description',
      },
    },
  },
  argTypes: {
    // Prop controls configuration
  },
}

// 装饰器
export const decorators = [
  (Story: ComponentType) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
]
```

### 八、性能优化策略

#### 8.1 代码分割
```typescript
// 路由级分割
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => 
  import('./pages/Analytics' /* webpackChunkName: "analytics" */)
)

// 组件级分割
const HeavyComponent = lazy(() => 
  import('./components/HeavyComponent' /* webpackPrefetch: true */)
)
```

#### 8.2 虚拟化
```typescript
// 虚拟列表组件
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

// 虚拟表格组件
interface VirtualTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowHeight: number
  headerHeight?: number
  onRowClick?: (row: T) => void
}
```

#### 8.3 缓存策略
```typescript
// 组件缓存
export const MemoizedComponent = memo(Component, (prev, next) => {
  // Custom comparison logic
  return prev.id === next.id && prev.version === next.version
})

// 计算缓存
export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList
): T {
  return useMemo(factory, deps)
}

// API缓存
export const cacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

### 九、无障碍支持

#### 9.1 ARIA增强
```typescript
// 无障碍包装组件
interface A11yWrapperProps {
  role?: string
  label?: string
  description?: string
  live?: 'polite' | 'assertive'
  children: ReactNode
}

// 键盘导航
export function useKeyboardNavigation(
  items: any[],
  options?: {
    orientation?: 'horizontal' | 'vertical'
    loop?: boolean
    onSelect?: (item: any) => void
  }
): {
  activeIndex: number
  handleKeyDown: (event: KeyboardEvent) => void
}

// 焦点管理
export function useFocusTrap(
  ref: RefObject<HTMLElement>,
  options?: {
    initialFocus?: string
    returnFocus?: boolean
  }
): void
```

#### 9.2 屏幕阅读器支持
```typescript
// 状态通知
export function useAnnounce(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  clear: () => void
}

// 进度指示
export function useProgressAnnouncement(
  progress: number,
  options?: {
    interval?: number
    format?: (progress: number) => string
  }
): void
```

## 总结

本组件架构设计遵循以下原则：

1. **分层设计**: 基础层、业务层、工具层清晰分离
2. **复用性高**: 通过组合和配置实现功能扩展
3. **类型安全**: 完整的TypeScript类型定义
4. **性能优先**: 内置虚拟化、缓存等优化策略
5. **无障碍**: 完善的ARIA支持和键盘导航
6. **测试友好**: 提供完整的测试工具和Mock数据

通过这套组件架构，可以快速构建功能丰富、性能优秀、用户体验良好的小说发布系统。