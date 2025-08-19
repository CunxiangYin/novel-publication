import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { uploadNovel, parseNovel, updateNovel, publishNovel, generateMetadata } from './api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadNovel', () => {
    it('uploads a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.md', { type: 'text/markdown' });
      const mockResponse = { filePath: '/uploads/test.md' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadNovel(mockFile);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/novel/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      
      expect(result).toEqual(mockResponse);
    });

    it('throws error on upload failure', async () => {
      const mockFile = new File(['test'], 'test.md');
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(uploadNovel(mockFile)).rejects.toThrow('Failed to upload file');
    });
  });

  describe('parseNovel', () => {
    it('parses novel with options', async () => {
      const mockResponse = {
        title: 'Test Novel',
        chapters: [],
        wordCount: 1000,
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await parseNovel('/test/path.md', {
        generateIntro: true,
        generateAwesomeParagraph: true,
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/novel/parse'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: '/test/path.md',
            options: {
              generateIntro: true,
              generateAwesomeParagraph: true,
            },
          }),
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateNovel', () => {
    it('updates novel data', async () => {
      const updateData = {
        title: 'Updated Title',
        author: 'Updated Author',
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await updateNovel('/test/path.md', updateData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/novel/update'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: '/test/path.md',
            data: updateData,
          }),
        })
      );
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('publishNovel', () => {
    it('publishes novel to platform', async () => {
      const novelData = {
        title: 'Test Novel',
        author: 'Test Author',
        chapters: [],
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, publishId: '12345' }),
      });

      const result = await publishNovel(novelData as any, 'wechat');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/novel/publish'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: novelData,
            platform: 'wechat',
          }),
        })
      );
      
      expect(result).toEqual({ success: true, publishId: '12345' });
    });

    it('handles publish error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(publishNovel({} as any)).rejects.toThrow('Failed to publish novel');
    });
  });

  describe('generateMetadata', () => {
    it('generates metadata for novel', async () => {
      const mockMetadata = {
        intro: 'Generated intro',
        categories: { level1: 'Fiction', level2: 'Romance', level3: 'Modern' },
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetadata,
      });

      const result = await generateMetadata('/test/path.md', {
        generateIntro: true,
        autoCategories: true,
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/novel/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: '/test/path.md',
            options: {
              generateIntro: true,
              autoCategories: true,
            },
          }),
        })
      );
      
      expect(result).toEqual(mockMetadata);
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(parseNovel('/test/path.md')).rejects.toThrow('Network error');
    });

    it('handles JSON parse errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      
      await expect(parseNovel('/test/path.md')).rejects.toThrow('Invalid JSON');
    });

    it('includes error details in thrown errors', async () => {
      const errorResponse = {
        error: 'Validation failed',
        details: 'Title is required',
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => errorResponse,
      });
      
      try {
        await updateNovel('/test/path.md', {});
      } catch (error: any) {
        expect(error.message).toContain('Failed to update novel');
        expect(error.details).toEqual(errorResponse);
      }
    });
  });
});