import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'

  // Make Bun globals available in Vitest tests
  if (typeof Bun === 'undefined') {
    // Create a minimal Bun mock for testing
    const mockBun = {
      file: (path: any) => ({
        stat: async () => {
          const { stat } = await import('node:fs/promises')
          const pathStr = typeof path === 'string' ? path : path.toString()
          return stat(pathStr)
        },
      }),
    }
    // @ts-expect-error - Mock Bun API for testing
    globalThis.Bun = mockBun
  }
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks() // Clear all mocks before each test for isolation
  vi.resetModules() // Reset all modules to ensure clean state
  vi.useRealTimers() // Ensure we use real timers by default
})

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks() // Restore all mocks after each test
  vi.clearAllTimers() // Clear any timers
})

// Cleanup after all tests
afterAll(() => {
  vi.resetAllMocks() // Final cleanup
  vi.useRealTimers() // Reset system time if mocked
})
