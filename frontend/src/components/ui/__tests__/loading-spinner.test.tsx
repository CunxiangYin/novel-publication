import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { LoadingSpinner, InlineSpinner } from '../loading-spinner'

describe('LoadingSpinner', () => {
  it('renders default spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading...')
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading..." />)
    
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12')

    rerender(<LoadingSpinner size="xl" />)
    expect(screen.getByRole('status')).toHaveClass('h-16', 'w-16')
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<LoadingSpinner variant="secondary" />)
    expect(screen.getByRole('status')).toHaveClass('text-secondary-foreground')

    rerender(<LoadingSpinner variant="muted" />)
    expect(screen.getByRole('status')).toHaveClass('text-muted-foreground')

    rerender(<LoadingSpinner variant="white" />)
    expect(screen.getByRole('status')).toHaveClass('text-white')
  })

  it('renders fullscreen spinner with backdrop', () => {
    render(<LoadingSpinner fullScreen text="Loading application..." />)
    
    const backdrop = screen.getByRole('status').closest('.fixed')
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'z-50')
    expect(screen.getByText('Loading application...')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('renders with text layout correctly', () => {
    render(<LoadingSpinner text="Loading..." />)
    
    const container = screen.getByRole('status').parentElement
    expect(container).toHaveClass('flex', 'items-center', 'space-x-2')
  })
})

describe('InlineSpinner', () => {
  it('renders as inline element', () => {
    render(<InlineSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('inline-block')
  })

  it('defaults to small size', () => {
    render(<InlineSpinner />)
    
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')
  })

  it('does not render fullscreen', () => {
    render(<InlineSpinner fullScreen />)
    
    // fullScreen should be ignored for InlineSpinner
    const spinner = screen.getByRole('status')
    expect(spinner.closest('.fixed')).toBeNull()
  })

  it('accepts all LoadingSpinner props except fullScreen', () => {
    render(<InlineSpinner text="Inline loading..." variant="secondary" size="lg" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-secondary-foreground', 'h-12', 'w-12', 'inline-block')
    expect(screen.getByText('Inline loading...')).toBeInTheDocument()
  })
})