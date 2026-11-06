import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
  base: './', plugins: [vue()],
  build: { target: 'es2022', chunkSizeWarningLimit: 1200, rollupOptions: { output: { manualChunks: { 'vue-vendor': ['vue', 'vue-router'], 'ui-vendor': ['element-plus'], charts: ['echarts'] } } } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' }
});
