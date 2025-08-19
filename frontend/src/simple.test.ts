import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should pass basic math', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  it('should handle arrays', () => {
    expect([1, 2, 3]).toHaveLength(3);
    expect([1, 2, 3]).toContain(2);
  });
});