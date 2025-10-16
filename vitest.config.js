import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['test/**', 'bin/**', 'examples/**', 'node_modules/**', '*.config.js']
    }
  }
});
