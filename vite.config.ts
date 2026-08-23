import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Firebase Hosting serves from the domain root, so this only overrides the
  // base path when explicitly set (by the GitHub Pages workflow, since a
  // project page is served from /<repo-name>/, not /). Local dev is
  // unaffected either way.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
