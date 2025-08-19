# Component Library Documentation

## 1. Overview

This document provides comprehensive documentation for all UI components in the Novel Publication System. Each component is built on shadcn/ui primitives with custom enhancements for the publishing domain.

## 2. Component Architecture

### 2.1 Component Structure
```
components/
├── ui/                 # Base shadcn/ui components
├── novel/             # Novel-specific components
├── upload/            # File upload components
├── theme/             # Theme management
└── shared/            # Shared utilities
```

### 2.2 Component Principles
- **Composition over Inheritance**: Build complex UIs from simple parts
- **Controlled & Uncontrolled**: Support both patterns
- **Accessibility First**: ARIA compliant by default
- **Type Safety**: Full TypeScript support

## 3. Base Components (UI)

### 3.1 Button

#### Variants
```tsx
interface ButtonVariants {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
}
```

#### Usage Examples
```tsx
// Primary action
<Button variant="default" size="lg">
  <Rocket className="mr-2 h-4 w-4" />
  Publish Novel
</Button>

// Secondary action
<Button variant="outline" size="default">
  <Save className="mr-2 h-4 w-4" />
  Save Draft
</Button>

// Destructive action
<Button variant="destructive" size="sm">
  <Trash className="mr-2 h-3 w-3" />
  Delete
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Processing...
</Button>
```

#### Custom Enhancements
```tsx
// Gradient button
<Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
  Premium Feature
</Button>

// Pulse animation
<Button className="animate-pulse">
  New Feature
</Button>
```

### 3.2 Card

#### Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Enhanced Variants
```tsx
// Hoverable card
<Card className="card-hover cursor-pointer">
  {/* Content */}
</Card>

// Gradient background
<Card className="bg-gradient-to-br from-primary/10 to-primary/5">
  {/* Content */}
</Card>

// Glass effect
<Card className="glass border-white/20">
  {/* Content */}
</Card>

// Status card
<Card className="border-l-4 border-l-success">
  {/* Success content */}
</Card>
```

### 3.3 Badge

#### Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Custom Badges
```tsx
// Status badges
<Badge className="bg-success/10 text-success border-success/20">
  <CheckCircle className="mr-1 h-3 w-3" />
  Published
</Badge>

<Badge className="bg-warning/10 text-warning border-warning/20">
  <AlertCircle className="mr-1 h-3 w-3" />
  Pending Review
</Badge>

// Counter badge
<Badge className="rounded-full px-2 py-0.5">
  42
</Badge>

// Animated badge
<Badge className="animate-pulse">
  New
</Badge>
```

### 3.4 Input

#### Basic Usage
```tsx
<Input
  type="text"
  placeholder="Enter novel title..."
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

#### Enhanced Inputs
```tsx
// With icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="pl-10" placeholder="Search..." />
</div>

// With validation
<Input
  className={cn(
    "transition-colors",
    error && "border-destructive focus:ring-destructive"
  )}
  aria-invalid={!!error}
/>

// Character counter
<div className="relative">
  <Input maxLength={100} />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
    {value.length}/100
  </span>
</div>
```

### 3.5 Textarea

#### Enhanced Textarea
```tsx
// Auto-resize textarea
<Textarea
  className="min-h-[100px] resize-y"
  placeholder="Enter novel introduction..."
  value={intro}
  onChange={(e) => setIntro(e.target.value)}
/>

// With character count
<div className="space-y-2">
  <Textarea value={content} onChange={handleChange} />
  <div className="flex justify-between text-sm text-muted-foreground">
    <span>{wordCount} words</span>
    <span>{charCount} characters</span>
  </div>
</div>
```

### 3.6 Tabs

#### Structure
```tsx
<Tabs defaultValue="edit" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="edit">
      <FileText className="mr-2 h-4 w-4" />
      Edit
    </TabsTrigger>
    <TabsTrigger value="preview">
      <Eye className="mr-2 h-4 w-4" />
      Preview
    </TabsTrigger>
    <TabsTrigger value="settings">
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="edit">
    {/* Edit content */}
  </TabsContent>
  <TabsContent value="preview">
    {/* Preview content */}
  </TabsContent>
  <TabsContent value="settings">
    {/* Settings content */}
  </TabsContent>
</Tabs>
```

### 3.7 Progress

#### Variants
```tsx
// Basic progress
<Progress value={33} className="h-2" />

// With label
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Upload Progress</span>
    <span>{progress}%</span>
  </div>
  <Progress value={progress} />
</div>

// Colored progress
<Progress 
  value={75} 
  className="h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary" 
/>
```

### 3.8 Skeleton

#### Loading States
```tsx
// Text skeleton
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>

// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-[150px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-32 w-full" />
  </CardContent>
</Card>

// Custom skeleton component
<NovelEditorSkeleton />
```

## 4. Novel Components

### 4.1 NovelForm

#### Purpose
Comprehensive form for editing novel metadata with validation and auto-save.

#### Props
```tsx
interface NovelFormProps {
  initialData: Novel
  onSubmit: (data: Novel) => Promise<void>
  autoSave?: boolean
  onDirtyChange?: (isDirty: boolean) => void
}
```

#### Features
- Field validation with Zod
- Auto-save with debouncing
- Dirty state tracking
- Error handling
- Loading states

#### Usage
```tsx
<NovelForm
  initialData={novel}
  onSubmit={handleSave}
  autoSave={true}
  onDirtyChange={setIsDirty}
/>
```

### 4.2 ChapterList

#### Purpose
Display and manage novel chapters with search and filtering.

#### Props
```tsx
interface ChapterListProps {
  chapters: Chapter[]
  onChapterSelect?: (chapter: Chapter) => void
  onPreview?: (chapter: Chapter) => void
  onEdit?: (chapter: Chapter) => void
  onDelete?: (chapterId: string) => void
  viewMode?: 'compact' | 'detailed'
}
```

#### Features
- Search functionality
- View mode toggle
- Chapter statistics
- Drag-and-drop reordering
- Batch operations

#### Usage
```tsx
<ChapterList
  chapters={novel.chapters}
  onChapterSelect={handleSelect}
  onPreview={handlePreview}
  viewMode="detailed"
/>
```

### 4.3 EnhancedChapterList

#### Additional Features
- Advanced filtering
- Sort options
- Virtualized scrolling for performance
- Chapter word count analysis
- Reading time estimates

#### Usage
```tsx
<EnhancedChapterList
  chapters={chapters}
  onChapterSelect={handleSelect}
  filters={{
    minWords: 1000,
    maxWords: 5000,
    searchTerm: "dragon"
  }}
/>
```

### 4.4 NovelEditorSkeleton

#### Purpose
Loading placeholder for the novel editor interface.

#### Usage
```tsx
{isLoading ? (
  <NovelEditorSkeleton />
) : (
  <NovelForm {...props} />
)}
```

## 5. Upload Components

### 5.1 FileUploader

#### Purpose
Basic file upload with drag-and-drop support.

#### Props
```tsx
interface FileUploaderProps {
  onFileSelect: (file: File) => Promise<void>
  accept?: string
  maxSize?: number
  multiple?: boolean
}
```

#### Usage
```tsx
<FileUploader
  onFileSelect={handleFileUpload}
  accept=".md,.txt"
  maxSize={10485760} // 10MB
/>
```

### 5.2 EnhancedFileUploader

#### Additional Features
- Upload progress tracking
- File validation
- Preview capability
- Retry mechanism
- Upload queue management

#### Props
```tsx
interface EnhancedFileUploaderProps extends FileUploaderProps {
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
  showPreview?: boolean
  allowRetry?: boolean
}
```

#### Usage
```tsx
<EnhancedFileUploader
  onFileSelect={handleUpload}
  onProgress={setProgress}
  onError={handleError}
  showPreview={true}
  allowRetry={true}
/>
```

## 6. Theme Components

### 6.1 ThemeProvider

#### Purpose
Manages theme state and provides theme context to the application.

#### Usage
```tsx
// In App.tsx
<ThemeProvider defaultTheme="system" storageKey="novel-theme">
  <App />
</ThemeProvider>
```

### 6.2 ThemeToggle

#### Purpose
Toggle button for switching between light, dark, and system themes.

#### Variants
```tsx
// Icon toggle
<ThemeToggle />

// Dropdown toggle
<ThemeToggle variant="dropdown" />

// Custom toggle
<ThemeToggle
  className="fixed bottom-4 right-4"
  showLabel={true}
/>
```

## 7. Composite Components

### 7.1 NovelCard

#### Purpose
Display novel summary in a card format.

```tsx
interface NovelCardProps {
  novel: Novel
  onClick?: () => void
  showActions?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

<NovelCard
  novel={novel}
  onClick={handleNovelClick}
  showActions={true}
  variant="featured"
/>
```

### 7.2 PublishDialog

#### Purpose
Modal dialog for publishing workflow.

```tsx
interface PublishDialogProps {
  novel: Novel
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (settings: PublishSettings) => Promise<void>
}

<PublishDialog
  novel={novel}
  open={showPublish}
  onOpenChange={setShowPublish}
  onPublish={handlePublish}
/>
```

### 7.3 ChapterEditor

#### Purpose
Rich text editor for chapter content.

```tsx
interface ChapterEditorProps {
  chapter: Chapter
  onChange: (content: string) => void
  onSave: () => Promise<void>
  autoSave?: boolean
  showWordCount?: boolean
}

<ChapterEditor
  chapter={currentChapter}
  onChange={handleContentChange}
  onSave={handleSave}
  autoSave={true}
  showWordCount={true}
/>
```

## 8. Utility Components

### 8.1 ErrorBoundary

#### Purpose
Catch and display errors gracefully.

```tsx
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo)
  }}
>
  <App />
</ErrorBoundary>
```

### 8.2 ScrollToTop

#### Purpose
Button to scroll to top of page.

```tsx
<ScrollToTop
  showAfter={300}
  className="fixed bottom-4 right-4"
/>
```

### 8.3 LoadingSpinner

#### Purpose
Consistent loading indicator.

```tsx
<LoadingSpinner
  size="lg"
  message="Processing your novel..."
  overlay={true}
/>
```

## 9. Form Components

### 9.1 FormField

#### Purpose
Consistent form field wrapper with label and error handling.

```tsx
<FormField
  label="Novel Title"
  error={errors.title}
  required
>
  <Input {...register('title')} />
</FormField>
```

### 9.2 CategorySelect

#### Purpose
Multi-select for novel categories.

```tsx
<CategorySelect
  value={categories}
  onChange={setCategories}
  options={availableCategories}
  maxSelections={3}
/>
```

### 9.3 DatePicker

#### Purpose
Date selection for publication scheduling.

```tsx
<DatePicker
  value={publishDate}
  onChange={setPublishDate}
  minDate={new Date()}
  placeholder="Select publish date"
/>
```

## 10. Layout Components

### 10.1 PageHeader

#### Purpose
Consistent page header with navigation.

```tsx
<PageHeader
  title="Novel Publication System"
  subtitle="Manage and publish your novels"
  actions={[
    <Button key="new">New Novel</Button>,
    <ThemeToggle key="theme" />
  ]}
/>
```

### 10.2 Sidebar

#### Purpose
Navigation sidebar for multi-page layouts.

```tsx
<Sidebar
  items={[
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: BookOpen, label: 'Novels', href: '/novels' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ]}
  collapsed={isCollapsed}
  onToggle={setIsCollapsed}
/>
```

### 10.3 Container

#### Purpose
Consistent content container with responsive padding.

```tsx
<Container
  size="lg"
  className="py-8"
>
  {children}
</Container>
```

## 11. Animation Components

### 11.1 FadeIn

#### Purpose
Animate elements on mount.

```tsx
<FadeIn delay={200}>
  <Card>Content appears with fade animation</Card>
</FadeIn>
```

### 11.2 SlideIn

#### Purpose
Slide animation from direction.

```tsx
<SlideIn from="left" delay={100}>
  <div>Slides in from left</div>
</SlideIn>
```

### 11.3 Stagger

#### Purpose
Stagger children animations.

```tsx
<Stagger delay={50}>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</Stagger>
```

## 12. Component Best Practices

### 12.1 Composition
- Build complex components from simple ones
- Use compound components for related functionality
- Leverage React Context for shared state

### 12.2 Performance
- Use React.memo for expensive components
- Implement virtualization for long lists
- Lazy load heavy components
- Optimize re-renders with useMemo/useCallback

### 12.3 Accessibility
- Include proper ARIA labels
- Support keyboard navigation
- Maintain focus management
- Provide screen reader descriptions

### 12.4 Testing
- Write unit tests for logic
- Integration tests for workflows
- Visual regression tests for UI
- Accessibility tests with axe-core

## 13. Component Patterns

### 13.1 Controlled Components
```tsx
const [value, setValue] = useState('')
<Input value={value} onChange={e => setValue(e.target.value)} />
```

### 13.2 Uncontrolled Components
```tsx
const inputRef = useRef<HTMLInputElement>(null)
<Input ref={inputRef} defaultValue="initial" />
```

### 13.3 Compound Components
```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### 13.4 Render Props
```tsx
<DataProvider
  render={({ data, loading }) => (
    loading ? <Skeleton /> : <Content data={data} />
  )}
/>
```

## 14. Theming Components

### 14.1 Custom Theme Variables
```tsx
<ThemeProvider
  theme={{
    colors: {
      primary: 'custom-primary',
      secondary: 'custom-secondary'
    }
  }}
>
  {children}
</ThemeProvider>
```

### 14.2 Component Variants
```tsx
const variants = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-black',
  custom: props.customClass
}

<Component variant="primary" />
```

## 15. Future Components

### Planned Components
- **RichTextEditor**: Advanced text editing
- **ImageUploader**: Cover image management
- **ChapterSplitter**: Auto-split long chapters
- **PublishScheduler**: Schedule publications
- **AnalyticsDashboard**: Publication analytics
- **CommentSystem**: Reader feedback
- **VersionHistory**: Track document changes
- **ExportManager**: Multiple export formats
- **CollaborationTools**: Multi-author support
- **AIAssistant**: Writing assistance integration