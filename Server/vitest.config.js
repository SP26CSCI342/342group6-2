import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.test.js'
      ]
    },
    include: ['**/__tests__/**/*.test.js']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
