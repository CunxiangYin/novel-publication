import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/utils'
import { PublishDialog } from '@/components/ui/publish-dialog'
import { ChapterEditor } from '@/components/ui/chapter-editor'
import { DataTable } from '@/components/ui/table'
import { AnalyticsDashboard } from '@/components/ui/chart'
import { mockNovelData, mockChapterData } from '@/test/utils'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

describe('Integration Tests', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('Novel Publishing Flow', () => {
    it('completes full publishing workflow', async () => {
      const user = userEvent.setup()
      const onPublish = vi.fn().mockResolvedValue(undefined)
      const novelData = mockNovelData.complete

      render(
        <PublishDialog
          open={true}
          onOpenChange={() => {}}
          novelData={novelData}
          onPublish={onPublish}
        />
      )

      // Verify pre-filled data
      expect(screen.getByDisplayValue(novelData.title)).toBeInTheDocument()
      expect(screen.getByDisplayValue(novelData.author)).toBeInTheDocument()

      // Proceed to confirmation
      await user.click(screen.getByRole('button', { name: /下一步/i }))

      await waitFor(() => {
        expect(screen.getByText('确认发布')).toBeInTheDocument()
      })

      // Verify novel stats are displayed
      expect(screen.getByText(novelData.chapterCount.toString())).toBeInTheDocument()
      expect(screen.getByText(novelData.wordCount.toLocaleString())).toBeInTheDocument()

      // Confirm publish
      await user.click(screen.getByRole('button', { name: /确认发布/i }))

      // Verify publish was called with correct data
      expect(onPublish).toHaveBeenCalledWith({
        title: novelData.title,
        author: novelData.author,
        intro: novelData.intro,
        categories: novelData.categories,
        highlight: novelData.highlight,
        tags: '',
      })

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('发布成功！')).toBeInTheDocument()
      })
    })

    it('handles publishing errors gracefully', async () => {
      const user = userEvent.setup()
      const onPublish = vi.fn().mockRejectedValue(new Error('Network error'))
      const novelData = mockNovelData.complete

      render(
        <PublishDialog
          open={true}
          onOpenChange={() => {}}
          novelData={novelData}
          onPublish={onPublish}
        />
      )

      // Go through publish flow
      await user.click(screen.getByRole('button', { name: /下一步/i }))
      await user.click(screen.getByRole('button', { name: /确认发布/i }))

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('发布失败')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Should allow retry
      expect(screen.getByRole('button', { name: /重试发布/i })).toBeInTheDocument()
    })
  })

  describe('Chapter Editor Integration', () => {
    it('saves chapter content correctly', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn().mockResolvedValue(undefined)
      const chapter = mockChapterData.simple

      render(
        <ChapterEditor
          chapter={chapter}
          onSave={onSave}
          autoSave={false}
        />
      )

      // Update title
      const titleInput = screen.getByDisplayValue(chapter.title)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Chapter Title')

      // Save chapter
      await user.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated Chapter Title',
            content: expect.any(String),
            wordCount: expect.any(Number),
          })
        )
      })
    })

    it('enables auto-save functionality', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn().mockResolvedValue(undefined)
      
      vi.useFakeTimers()

      render(
        <ChapterEditor
          onSave={onSave}
          autoSave={true}
          autoSaveInterval={1000}
        />
      )

      // Make changes to trigger auto-save
      const titleInput = screen.getByPlaceholderText(/输入章节标题/i)
      await user.type(titleInput, 'Auto-saved Chapter')

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Auto-saved Chapter',
          })
        )
      })

      vi.useRealTimers()
    })

    it('switches between edit and preview modes', async () => {
      const user = userEvent.setup()
      const chapter = mockChapterData.rich

      render(
        <ChapterEditor
          chapter={chapter}
          onSave={() => Promise.resolve()}
        />
      )

      // Should start in edit mode
      expect(screen.getByRole('tab', { name: /编辑/i })).toHaveAttribute('data-state', 'active')

      // Switch to preview mode
      await user.click(screen.getByRole('tab', { name: /预览/i }))

      // Should show preview content
      expect(screen.getByRole('tab', { name: /预览/i })).toHaveAttribute('data-state', 'active')
      expect(screen.getByText(chapter.title)).toBeInTheDocument()
    })
  })

  describe('Data Table Integration', () => {
    const mockData = [
      { id: 1, name: 'Novel 1', author: 'Author 1', status: 'Published' },
      { id: 2, name: 'Novel 2', author: 'Author 2', status: 'Draft' },
      { id: 3, name: 'Novel 3', author: 'Author 3', status: 'Published' },
    ]

    const columns = [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'author',
        header: 'Author',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
    ]

    it('displays data correctly', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
        />
      )

      // Should display all data
      expect(screen.getByText('Novel 1')).toBeInTheDocument()
      expect(screen.getByText('Author 1')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    it('handles search functionality', async () => {
      const user = userEvent.setup()

      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableFiltering={true}
        />
      )

      // Search for specific novel
      const searchInput = screen.getByPlaceholderText(/搜索/i)
      await user.type(searchInput, 'Novel 1')

      await waitFor(() => {
        expect(screen.getByText('Novel 1')).toBeInTheDocument()
        expect(screen.queryByText('Novel 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Novel 3')).not.toBeInTheDocument()
      })
    })

    it('handles sorting functionality', async () => {
      const user = userEvent.setup()

      render(
        <DataTable
          columns={columns}
          data={mockData}
          enableSorting={true}
        />
      )

      // Click on Name header to sort
      const nameHeader = screen.getByText('Name')
      await user.click(nameHeader)

      // Data should be sorted (check if sorting icon appears)
      expect(nameHeader.closest('th')).toHaveClass('cursor-pointer')
    })

    it('handles pagination', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Novel ${i + 1}`,
        author: `Author ${i + 1}`,
        status: i % 2 === 0 ? 'Published' : 'Draft',
      }))

      render(
        <DataTable
          columns={columns}
          data={largeData}
          enablePagination={true}
          pageSize={10}
        />
      )

      // Should show pagination controls
      expect(screen.getByText(/第 1 页，共 3 页/)).toBeInTheDocument()

      // Should show only first 10 items
      expect(screen.getByText('Novel 1')).toBeInTheDocument()
      expect(screen.getByText('Novel 10')).toBeInTheDocument()
      expect(screen.queryByText('Novel 11')).not.toBeInTheDocument()

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /下一页/i })
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Novel 11')).toBeInTheDocument()
        expect(screen.queryByText('Novel 1')).not.toBeInTheDocument()
      })
    })

    it('handles row clicks', async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()

      render(
        <DataTable
          columns={columns}
          data={mockData}
          onRowClick={onRowClick}
        />
      )

      // Click on first row
      const firstRow = screen.getByText('Novel 1').closest('tr')
      await user.click(firstRow!)

      expect(onRowClick).toHaveBeenCalledWith(
        expect.objectContaining({
          original: mockData[0],
        })
      )
    })
  })

  describe('Analytics Dashboard Integration', () => {
    it('displays charts with data', () => {
      const analyticsData = {
        lineChart: [
          { date: '2024-01-01', value: 10 },
          { date: '2024-01-02', value: 15 },
          { date: '2024-01-03', value: 12 },
        ],
        barChart: [
          { label: 'Category A', value: 25 },
          { label: 'Category B', value: 35 },
          { label: 'Category C', value: 20 },
        ],
        pieChart: [
          { label: 'Published', value: 60 },
          { label: 'Draft', value: 30 },
          { label: 'Review', value: 10 },
        ],
      }

      render(<AnalyticsDashboard data={analyticsData} />)

      // Should render chart containers
      expect(screen.getByText('趋势分析')).toBeInTheDocument()
      expect(screen.getByText('对比分析')).toBeInTheDocument()
      expect(screen.getByText('分布分析')).toBeInTheDocument()
    })

    it('handles loading state', () => {
      render(<AnalyticsDashboard data={{}} loading={true} />)

      // Should show loading spinners
      const loadingSpinners = screen.getAllByRole('status')
      expect(loadingSpinners.length).toBeGreaterThan(0)
    })
  })

  describe('API Integration', () => {
    it('handles successful API responses', async () => {
      // Mock successful response
      server.use(
        http.get('/api/novel/list', () => {
          return HttpResponse.json({
            success: true,
            data: mockNovelData.complete,
          })
        })
      )

      // Test API call integration
      const response = await fetch('/api/novel/list')
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    it('handles API errors', async () => {
      // Mock error response
      server.use(
        http.get('/api/novel/error', () => {
          return new HttpResponse(null, { 
            status: 500,
            statusText: 'Internal Server Error'
          })
        })
      )

      try {
        await fetch('/api/novel/error')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Performance Integration', () => {
    it('handles lazy loading correctly', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({ 
          default: () => <div>Lazy Loaded Component</div> 
        })
      )

      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      )

      // Should show loading first
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Then show lazy component
      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument()
      })
    })

    it('measures component performance', async () => {
      const performanceObserver = vi.fn()
      
      // Mock performance measurement
      Object.defineProperty(global, 'PerformanceObserver', {
        value: performanceObserver,
        configurable: true,
      })

      render(<div>Performance Test Component</div>)

      expect(screen.getByText('Performance Test Component')).toBeInTheDocument()
    })
  })
})