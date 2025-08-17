import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Global setup
    globals: true,

    // Test environment
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],

    // Include patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.husky', 'coverage', '**/node_modules/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'coverage/**',
        'dist/**',
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/migrations/**',
        '**/index.ts',
        'src/server.ts',
        'index.ts',
      ],
      // // Gold Standard Coverage Thresholds by Layer
      // thresholds: {
      //   // Global minimums (safety net)
      //   statements: 80,
      //   branches: 80,
      //   functions: 80,
      //   lines: 80,
      //   // Layer-specific thresholds
      //   'src/domain/**/*.ts': {
      //     statements: 90, // Domain logic should have excellent coverage
      //     branches: 85,
      //     functions: 95,
      //     lines: 90,
      //   },
      //   'src/application/**/*.ts': {
      //     statements: 85, // Use cases need high coverage
      //     branches: 80,
      //     functions: 90,
      //     lines: 85,
      //   },
      //   'src/infrastructure/**/*.ts': {
      //     statements: 80, // Infrastructure can be harder to test
      //     branches: 75,
      //     functions: 85,
      //     lines: 80,
      //   },
      //   'src/shared/**/*.ts': {
      //     statements: 90, // Shared utilities should be well tested
      //     branches: 85,
      //     functions: 95,
      //     lines: 90,
      //   },
      // },
    },

    // Test timeout
    testTimeout: 10_000, // 10 seconds for complex operations
    hookTimeout: 15_000, // 15 seconds for setup/teardown

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Deps configuration for mocking
    deps: {
      inline: ['bullmq'],
    },

    // Reporter
    reporters: process.env.CI ? ['default'] : ['verbose'],

    // Retry configuration
    retry: process.env.CI ? 2 : 0,

    // Pool configuration for parallel testing
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
