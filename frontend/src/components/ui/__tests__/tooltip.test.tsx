import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/utils'
import { SimpleTooltip, EnhancedTooltip, useTooltip } from '../tooltip'
import { Button } from '../button'

describe('SimpleTooltip', () => {
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Tooltip content">
        <Button>Hover me</Button>
      </SimpleTooltip>
    )

    const button = screen.getByRole('button')
    
    // Tooltip should not be visible initially
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    // Hover over button
    await user.hover(button)
    
    // Tooltip should appear
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides tooltip when mouse leaves', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Tooltip content">
        <Button>Hover me</Button>
      </SimpleTooltip>
    )

    const button = screen.getByRole('button')
    
    // Hover and wait for tooltip
    await user.hover(button)
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    // Unhover
    await user.unhover(button)
    
    // Tooltip should disappear
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('renders with different sides', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <SimpleTooltip content="Top tooltip" side="top">
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    await waitFor(() => {
      const tooltip = screen.getByText('Top tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    rerender(
      <SimpleTooltip content="Bottom tooltip" side="bottom">
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('Bottom tooltip')).toBeInTheDocument()
    })
  })

  it('renders with different alignments', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Aligned tooltip" align="start">
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('Aligned tooltip')).toBeInTheDocument()
    })
  })

  it('does not render when disabled', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Should not show" disabled>
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    
    // Wait a bit to ensure tooltip doesn't appear
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Custom tooltip" className="custom-tooltip">
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    await waitFor(() => {
      const tooltip = screen.getByText('Custom tooltip')
      expect(tooltip).toHaveClass('custom-tooltip')
    })
  })

  it('has configurable delay duration', async () => {
    const user = userEvent.setup()
    
    render(
      <SimpleTooltip content="Delayed tooltip" delayDuration={100}>
        <Button>Button</Button>
      </SimpleTooltip>
    )

    await user.hover(screen.getByRole('button'))
    
    // Should not appear immediately
    expect(screen.queryByText('Delayed tooltip')).not.toBeInTheDocument()
    
    // Should appear after delay
    await waitFor(() => {
      expect(screen.getByText('Delayed tooltip')).toBeInTheDocument()
    })
  })
})

describe('EnhancedTooltip', () => {
  it('renders with title and description', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedTooltip 
        title="Tooltip Title" 
        description="Tooltip description"
      >
        <Button>Button</Button>
      </EnhancedTooltip>
    )

    await user.hover(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Tooltip Title')).toBeInTheDocument()
      expect(screen.getByText('Tooltip description')).toBeInTheDocument()
    })
  })

  it('renders with custom content', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedTooltip 
        content={<div>Custom <strong>content</strong></div>}
      >
        <Button>Button</Button>
      </EnhancedTooltip>
    )

    await user.hover(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(screen.getByText('content')).toBeInTheDocument()
    })
  })

  it('respects maxWidth setting', async () => {
    const user = userEvent.setup()
    
    render(
      <EnhancedTooltip 
        title="Title"
        description="Description"
        maxWidth={200}
      >
        <Button>Button</Button>
      </EnhancedTooltip>
    )

    await user.hover(screen.getByRole('button'))
    
    await waitFor(() => {
      const tooltipContainer = screen.getByText('Title').parentElement
      expect(tooltipContainer).toHaveStyle({ maxWidth: '200px' })
    })
  })
})

describe('useTooltip hook', () => {
  function TestComponent() {
    const tooltip = useTooltip()
    
    return (
      <div>
        <button onClick={tooltip.show}>Show</button>
        <button onClick={tooltip.hide}>Hide</button>
        <button onClick={tooltip.toggle}>Toggle</button>
        <div>Open: {tooltip.open.toString()}</div>
      </div>
    )
  }

  it('manages tooltip state correctly', async () => {
    const user = userEvent.setup()
    
    render(<TestComponent />)

    // Initially closed
    expect(screen.getByText('Open: false')).toBeInTheDocument()

    // Show tooltip
    await user.click(screen.getByText('Show'))
    expect(screen.getByText('Open: true')).toBeInTheDocument()

    // Hide tooltip
    await user.click(screen.getByText('Hide'))
    expect(screen.getByText('Open: false')).toBeInTheDocument()

    // Toggle tooltip
    await user.click(screen.getByText('Toggle'))
    expect(screen.getByText('Open: true')).toBeInTheDocument()

    await user.click(screen.getByText('Toggle'))
    expect(screen.getByText('Open: false')).toBeInTheDocument()
  })
})