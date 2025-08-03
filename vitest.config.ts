/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/playwright.config.*',
        'scripts/',
        'public/',
        'supabase/',
        '**/index.ts', // barrel exports
        '**/*.stories.*',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      include: ['src/**/*'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Mock browser APIs
    deps: {
      inline: ['@testing-library/user-event']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
