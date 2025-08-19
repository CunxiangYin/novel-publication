import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovelForm } from './NovelForm';

describe('NovelForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnAutoGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    // Check tabs
    expect(screen.getByText('基本信息')).toBeInTheDocument();
    expect(screen.getByText('分类设置')).toBeInTheDocument();
    expect(screen.getByText('内容描述')).toBeInTheDocument();
    
    // Check basic fields
    expect(screen.getByLabelText('作品标题')).toBeInTheDocument();
    expect(screen.getByLabelText('作者笔名')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /保存修改/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入作品标题')).toBeInTheDocument();
      expect(screen.getByText('请输入作者笔名')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates field length constraints', async () => {
    const user = userEvent.setup();
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    // Switch to content tab
    const contentTab = screen.getByText('内容描述');
    await user.click(contentTab);
    
    // Try to submit with short intro
    const introField = screen.getByLabelText('简介内容');
    await user.type(introField, 'Too short');
    
    const submitButton = screen.getByRole('button', { name: /保存修改/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('简介至少200字')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const validData = {
      title: 'Test Novel',
      author: 'Test Author',
      intro: 'A'.repeat(200),
      awesomeParagraph: 'B'.repeat(400),
    };
    
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    // Fill basic info
    await user.type(screen.getByLabelText('作品标题'), validData.title);
    await user.type(screen.getByLabelText('作者笔名'), validData.author);
    
    // Switch to content tab and fill
    await user.click(screen.getByText('内容描述'));
    await user.type(screen.getByLabelText('简介内容'), validData.intro);
    await user.type(screen.getByLabelText('片段内容'), validData.awesomeParagraph);
    
    // Submit
    await user.click(screen.getByRole('button', { name: /保存修改/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: validData.title,
          author: validData.author,
          intro: validData.intro,
          awesomeParagraph: validData.awesomeParagraph,
        })
      );
    });
  });

  it('displays character count for text areas', async () => {
    const user = userEvent.setup();
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByText('内容描述'));
    
    const introField = screen.getByLabelText('简介内容');
    await user.type(introField, 'Test content');
    
    expect(screen.getByText(/12 \/ 300 字/)).toBeInTheDocument();
  });

  it('calls auto-generate function when AI button is clicked', async () => {
    const user = userEvent.setup();
    mockOnAutoGenerate.mockResolvedValue('Generated content');
    
    render(<NovelForm onSubmit={mockOnSubmit} onAutoGenerate={mockOnAutoGenerate} />);
    
    await user.click(screen.getByText('内容描述'));
    
    const aiButtons = screen.getAllByText('AI生成');
    await user.click(aiButtons[0]);
    
    expect(mockOnAutoGenerate).toHaveBeenCalledWith('intro');
  });

  it('updates category options based on selection', async () => {
    const user = userEvent.setup();
    render(<NovelForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByText('分类设置'));
    
    const firstCategorySelect = screen.getByLabelText('一级分类');
    
    // Check that second category updates when first changes
    fireEvent.change(firstCategorySelect, { target: { value: '男频' } });
    
    await waitFor(() => {
      const secondCategorySelect = screen.getByLabelText('二级分类');
      expect(secondCategorySelect).toBeInTheDocument();
    });
  });

  it('loads initial data correctly', () => {
    const initialData = {
      title: 'Initial Title',
      author: 'Initial Author',
      firstCategory: '女频',
      secondCategory: '现代言情',
      thirdCategory: '都市生活',
      intro: 'Initial intro',
      awesomeParagraph: 'Initial paragraph',
    };
    
    render(<NovelForm initialData={initialData} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Author')).toBeInTheDocument();
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<NovelForm onSubmit={mockOnSubmit} initialData={{
      title: 'Test',
      author: 'Author',
      intro: 'A'.repeat(200),
      awesomeParagraph: 'B'.repeat(400),
    }} />);
    
    const submitButton = screen.getByRole('button', { name: /保存修改/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('保存中...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});