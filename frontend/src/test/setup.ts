import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
// import { server } from './server'

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// // Start server before all tests
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// // Close server after all tests
// afterAll(() => server.close())

// // Reset handlers after each test
// afterEach(() => server.resetHandlers())

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {},
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock URL.createObjectURL
global.URL.createObjectURL = () => 'mock-url'
global.URL.revokeObjectURL = () => {}

// Mock performance.memory for testing
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 10485760,
    totalJSHeapSize: 52428800,
    jsHeapSizeLimit: 2172649472,
  },
})

// Suppress console warnings in tests unless explicitly needed
const originalConsoleWarn = console.warn
beforeAll(() => {
  console.warn = (...args: any[]) => {
    // Allow specific warnings through if needed
    if (args[0]?.includes?.('test-warning')) {
      originalConsoleWarn(...args)
    }
  }
})

afterAll(() => {
  console.warn = originalConsoleWarn
})