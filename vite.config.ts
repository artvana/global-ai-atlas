import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // VITE_BASE_PATH is set to /global-ai-atlas/ in the GitHub Pages workflow
  base: process.env.VITE_BASE_PATH ?? '/',
})
