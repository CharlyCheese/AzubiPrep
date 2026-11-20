import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { advancedVendor } from './advanced-vendor.mjs';
import { workshopSearchMetadata } from './workshop-search.mjs';
import { journeyPracticeSearchMetadata } from './journey-practice-search.mjs';
import { pwaShell } from './pwa-shell.mjs';

export default defineConfig(({ mode }) => ({
  define: { __AZUBIPREP_PORTFOLIO__: mode === 'portfolio' },
  ...(mode === 'portfolio' ? {
    envDir: false,
    envPrefix: [],
    publicDir: fileURLToPath(new URL('../netlify-build/public/', import.meta.url)),
  } : {}),
  plugins: [mode === 'portfolio' && {
    name: 'portfolio-system-fonts',
    transformIndexHtml: {
      order: 'pre',
      handler: html => html.replace(/<link\b[^>]*\bhref="https:\/\/fonts\.(?:googleapis|gstatic)\.com(?:\/[^"]*)?"[^>]*>\s*/gi, ''),
    },
  }, react(), advancedVendor(), pwaShell(), {
    name: 'public-course-search',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'workshop-search.json', source: JSON.stringify(workshopSearchMetadata) });
      this.emitFile({ type: 'asset', fileName: 'journey-practice-search.json', source: JSON.stringify(journeyPracticeSearchMetadata) });
    },
  }],
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
}));
