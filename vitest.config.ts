import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.css.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/lib/prism-*/**',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    server: {
      deps: {
        inline: [/@vanilla-extract/],
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['@vanilla-extract/css'],
        },
      },
    },
  },
})
