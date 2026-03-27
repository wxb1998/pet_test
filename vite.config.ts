import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deployment - base should match repo name
// Update 'summoners-war-idle' to your actual repo name
export default defineConfig({
  plugins: [react()],
  base: '/pet_test/',
  build: {
    outDir: 'dist',
  },
})
