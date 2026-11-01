import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { advancedVendor } from './advanced-vendor.mjs';

export default defineConfig({
  plugins: [react(), advancedVendor()],
  // Embed QuickJS's dynamic variant imports into one local Worker asset.
  worker: { plugins: () => [advancedVendor()], rollupOptions: { output: { inlineDynamicImports: true } } },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
