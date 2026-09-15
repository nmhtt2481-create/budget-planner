import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('victory') ||
            id.includes('@reduxjs/toolkit')
          ) {
            return 'charts'
          }
          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'motion'
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          return undefined
        },
      },
    },
  },
})