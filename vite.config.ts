import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // VITE_BASE_PATH is set to /global-ai-atlas/ in the GitHub Pages workflow
  base: process.env.VITE_BASE_PATH ?? '/',
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
  worker: {
    format: 'es',
  },
  build: {
    // @xenova/transformers is CJS-only with no exports map — Rolldown (Vite 8)
    // can't bundle it. Mark external so the import is left as-is at runtime.
    rolldownOptions: {
      external: ['@xenova/transformers'],
    },
    chunkSizeWarningLimit: 1500,
  },
})
