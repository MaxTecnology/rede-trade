import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// extends Vitest's expect
expect.extend(matchers)

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do scrollTo
window.scrollTo = vi.fn()

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock do File e FileReader
global.File = class File {
  constructor(fileParts, fileName, options) {
    this.name = fileName
    this.size = fileParts.reduce((acc, part) => acc + part.length, 0)
    this.type = options?.type || ''
  }
}

global.FileReader = class FileReader {
  readAsDataURL(file) {
    setTimeout(() => {
      this.onload({ target: { result: `data:image/jpeg;base64,fake-image-data` } })
    }, 10)
  }
}

// Mock do URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock da API fetch
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})