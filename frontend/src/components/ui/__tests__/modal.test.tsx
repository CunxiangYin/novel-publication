import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/utils'
import { 
  Modal, 
  ModalContent, 
  ModalTrigger, 
  ModalTitle, 
  ModalDescription,
  ModalHeader,
  ModalFooter,
  SimpleModal
} from '../modal'

describe('Modal', () => {
  it('renders trigger and opens modal when clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Test Modal</ModalTitle>
            <ModalDescription>This is a test modal</ModalDescription>
          </ModalHeader>
          <div>Modal content</div>
        </ModalContent>
      </Modal>
    )

    // Initially modal should not be visible
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()

    // Click trigger to open modal
    await user.click(screen.getByText('Open Modal'))

    // Modal should now be visible
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('This is a test modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalTitle>Test Modal</ModalTitle>
          <div>Modal content</div>
        </ModalContent>
      </Modal>
    )

    // Open modal
    await user.click(screen.getByText('Open Modal'))
    expect(screen.getByText('Test Modal')).toBeInTheDocument()

    // Close modal using close button
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    // Modal should be closed
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('closes modal when escape key is pressed', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalTitle>Test Modal</ModalTitle>
          <div>Modal content</div>
        </ModalContent>
      </Modal>
    )

    // Open modal
    await user.click(screen.getByText('Open Modal'))
    expect(screen.getByText('Test Modal')).toBeInTheDocument()

    // Press escape to close
    await user.keyboard('{Escape}')

    // Modal should be closed
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders different sizes correctly', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent size="sm">
          <ModalTitle>Small Modal</ModalTitle>
        </ModalContent>
      </Modal>
    )

    await user.click(screen.getByText('Open Modal'))
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm')

    rerender(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent size="lg">
          <ModalTitle>Large Modal</ModalTitle>
        </ModalContent>
      </Modal>
    )

    await user.click(screen.getByText('Open Modal'))
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')
  })

  it('applies custom className to modal content', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent className="custom-modal">
          <ModalTitle>Custom Modal</ModalTitle>
        </ModalContent>
      </Modal>
    )

    await user.click(screen.getByText('Open Modal'))
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal')
  })

  it('renders footer correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <Modal>
        <ModalTrigger>Open Modal</ModalTrigger>
        <ModalContent>
          <ModalTitle>Modal with Footer</ModalTitle>
          <ModalFooter>
            <button>Cancel</button>
            <button>Save</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )

    await user.click(screen.getByText('Open Modal'))
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})

describe('SimpleModal', () => {
  it('renders controlled modal', () => {
    const onOpenChange = vi.fn()
    
    render(
      <SimpleModal
        open={true}
        onOpenChange={onOpenChange}
        title="Simple Modal Title"
        description="Simple modal description"
      >
        <div>Simple modal content</div>
      </SimpleModal>
    )

    expect(screen.getByText('Simple Modal Title')).toBeInTheDocument()
    expect(screen.getByText('Simple modal description')).toBeInTheDocument()
    expect(screen.getByText('Simple modal content')).toBeInTheDocument()
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    
    render(
      <SimpleModal
        open={true}
        onOpenChange={onOpenChange}
        title="Simple Modal"
      >
        <div>Content</div>
      </SimpleModal>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders footer when provided', () => {
    render(
      <SimpleModal
        open={true}
        title="Modal with Footer"
        footer={
          <div>
            <button>Footer Button</button>
          </div>
        }
      >
        <div>Content</div>
      </SimpleModal>
    )

    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('applies custom size and className', () => {
    render(
      <SimpleModal
        open={true}
        title="Custom Modal"
        size="lg"
        className="custom-simple-modal"
      >
        <div>Content</div>
      </SimpleModal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('max-w-2xl', 'custom-simple-modal')
  })

  it('renders without title and description', () => {
    render(
      <SimpleModal open={true}>
        <div>Just content</div>
      </SimpleModal>
    )

    expect(screen.getByText('Just content')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <SimpleModal
        open={false}
        title="Hidden Modal"
      >
        <div>Hidden content</div>
      </SimpleModal>
    )

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })
})