// import * as path from 'path'
// import react from "@vitejs/plugin-react"
// import { defineConfig } from "vite"

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
//   },
// })


import * as path from 'path'
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Radix UI components
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox', 
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          
          // Bibliotecas pesadas (sem Firebase)
          'heavy-libs': [
            'framer-motion',
            'html2canvas',
            'jspdf'
          ],
          
          // React libraries
          'react-libs': [
            '@tanstack/react-query',
            '@tanstack/react-table',
            'react-hook-form',
            '@hookform/resolvers',
            'react-select',
            'react-modal'
          ],
          
          // Utilities
          'utils-vendor': [
            'axios',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'zod',
            'valtio'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})