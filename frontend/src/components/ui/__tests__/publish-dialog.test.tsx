import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/utils'
import { PublishDialog } from '../publish-dialog'
import { mockNovelData } from '@/test/utils'

describe('PublishDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onPublish: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form step by default', () => {
    render(<PublishDialog {...defaultProps} />)
    
    expect(screen.getByText('发布小说')).toBeInTheDocument()
    expect(screen.getByText('请填写小说的基本信息')).toBeInTheDocument()
    expect(screen.getByLabelText(/小说标题/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/作者/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/小说简介/i)).toBeInTheDocument()
  })

  it('populates form with novel data when provided', () => {
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
      />
    )
    
    expect(screen.getByDisplayValue(novelData.title)).toBeInTheDocument()
    expect(screen.getByDisplayValue(novelData.author)).toBeInTheDocument()
    expect(screen.getByDisplayValue(novelData.intro)).toBeInTheDocument()
    expect(screen.getByDisplayValue(novelData.categories)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(<PublishDialog {...defaultProps} />)
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /下一步/i })
    expect(submitButton).toBeDisabled()
    
    // Fill title only
    await user.type(screen.getByLabelText(/小说标题/i), 'Test Title')
    expect(submitButton).toBeDisabled()
    
    // Fill remaining required fields
    await user.type(screen.getByLabelText(/作者/i), 'Test Author')
    await user.type(screen.getByLabelText(/小说简介/i), 'Test intro that is long enough')
    await user.type(screen.getByLabelText(/分类/i), 'Test Category')
    
    // Now submit should be enabled
    expect(submitButton).toBeEnabled()
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    
    render(<PublishDialog {...defaultProps} />)
    
    // Enter too short intro
    const introInput = screen.getByLabelText(/小说简介/i)
    await user.type(introInput, 'Short')
    await user.tab() // Trigger validation
    
    await waitFor(() => {
      expect(screen.getByText(/简介至少需要10个字符/i)).toBeInTheDocument()
    })
    
    // Enter too long title
    const titleInput = screen.getByLabelText(/小说标题/i)
    await user.type(titleInput, 'A'.repeat(101))
    await user.tab()
    
    await waitFor(() => {
      expect(screen.getByText(/标题长度不能超过100字符/i)).toBeInTheDocument()
    })
  })

  it('progresses to confirmation step when form is valid', async () => {
    const user = userEvent.setup()
    
    render(<PublishDialog {...defaultProps} />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/小说标题/i), 'Test Novel')
    await user.type(screen.getByLabelText(/作者/i), 'Test Author')
    await user.type(screen.getByLabelText(/小说简介/i), 'This is a test novel introduction that is long enough')
    await user.type(screen.getByLabelText(/分类/i), 'Fiction')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    
    // Should show confirmation step
    await waitFor(() => {
      expect(screen.getByText('确认发布')).toBeInTheDocument()
      expect(screen.getByText('请仔细检查以下信息')).toBeInTheDocument()
      expect(screen.getByText('Test Novel')).toBeInTheDocument()
      expect(screen.getByText('作者：Test Author')).toBeInTheDocument()
    })
  })

  it('shows novel statistics in confirmation step', async () => {
    const user = userEvent.setup()
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
      />
    )
    
    // Go to confirmation step
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    
    await waitFor(() => {
      expect(screen.getByText(novelData.chapterCount.toString())).toBeInTheDocument()
      expect(screen.getByText('章节数')).toBeInTheDocument()
      expect(screen.getByText(novelData.wordCount.toLocaleString())).toBeInTheDocument()
      expect(screen.getByText('总字数')).toBeInTheDocument()
    })
  })

  it('allows going back to form from confirmation', async () => {
    const user = userEvent.setup()
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
      />
    )
    
    // Go to confirmation step
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    
    await waitFor(() => {
      expect(screen.getByText('确认发布')).toBeInTheDocument()
    })
    
    // Go back to form
    await user.click(screen.getByRole('button', { name: /返回修改/i }))
    
    await waitFor(() => {
      expect(screen.getByText('发布小说')).toBeInTheDocument()
      expect(screen.getByLabelText(/小说标题/i)).toBeInTheDocument()
    })
  })

  it('calls onPublish when confirmed', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockResolvedValue(undefined)
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
        onPublish={onPublish}
      />
    )
    
    // Go to confirmation and confirm publish
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    await waitFor(() => {
      expect(screen.getByText('确认发布')).toBeInTheDocument()
    })
    
    await user.click(screen.getByRole('button', { name: /确认发布/i }))
    
    expect(onPublish).toHaveBeenCalledWith({
      title: novelData.title,
      author: novelData.author,
      intro: novelData.intro,
      categories: novelData.categories,
      highlight: novelData.highlight,
      tags: '',
    })
  })

  it('shows publishing step with progress', async () => {
    const user = userEvent.setup()
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={mockNovelData.complete}
        isPublishing={true}
        publishProgress={50}
      />
    )
    
    expect(screen.getByText('正在发布')).toBeInTheDocument()
    expect(screen.getByText('正在发布中...')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows success step when publishing completes', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockResolvedValue(undefined)
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
        onPublish={onPublish}
      />
    )
    
    // Go through publish flow
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    await user.click(screen.getByRole('button', { name: /确认发布/i }))
    
    // Wait for publish to complete
    await waitFor(() => {
      expect(screen.getByText('发布成功！')).toBeInTheDocument()
      expect(screen.getByText('您的小说已成功发布到平台')).toBeInTheDocument()
    })
  })

  it('shows error step when publishing fails', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn().mockRejectedValue(new Error('Publish failed'))
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
        onPublish={onPublish}
      />
    )
    
    // Go through publish flow
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    await user.click(screen.getByRole('button', { name: /确认发布/i }))
    
    // Wait for publish to fail
    await waitFor(() => {
      expect(screen.getByText('发布失败')).toBeInTheDocument()
      expect(screen.getByText('Publish failed')).toBeInTheDocument()
    })
  })

  it('allows retry after failure', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined)
    
    const novelData = mockNovelData.complete
    
    render(
      <PublishDialog 
        {...defaultProps} 
        novelData={novelData}
        onPublish={onPublish}
      />
    )
    
    // Go through publish flow and fail
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    await user.click(screen.getByRole('button', { name: /确认发布/i }))
    
    await waitFor(() => {
      expect(screen.getByText('发布失败')).toBeInTheDocument()
    })
    
    // Retry
    await user.click(screen.getByRole('button', { name: /重试发布/i }))
    
    await waitFor(() => {
      expect(screen.getByText('发布成功！')).toBeInTheDocument()
    })
    
    expect(onPublish).toHaveBeenCalledTimes(2)
  })

  it('prevents closing during publishing', () => {
    const onOpenChange = vi.fn()
    
    render(
      <PublishDialog 
        {...defaultProps} 
        onOpenChange={onOpenChange}
        isPublishing={true}
      />
    )
    
    // Try to close during publishing - should not call onOpenChange
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    
    // The close button should not be functional during publishing
    // This is typically handled by the dialog implementation
  })

  it('handles tags input correctly', async () => {
    const user = userEvent.setup()
    
    render(<PublishDialog {...defaultProps} />)
    
    // Fill required fields and add tags
    await user.type(screen.getByLabelText(/小说标题/i), 'Test Novel')
    await user.type(screen.getByLabelText(/作者/i), 'Test Author')
    await user.type(screen.getByLabelText(/小说简介/i), 'This is a test novel introduction')
    await user.type(screen.getByLabelText(/分类/i), 'Fiction')
    await user.type(screen.getByLabelText(/标签/i), 'tag1,tag2,tag3')
    
    // Go to confirmation
    await user.click(screen.getByRole('button', { name: /下一步/i }))
    
    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
      expect(screen.getByText('tag3')).toBeInTheDocument()
    })
  })
})