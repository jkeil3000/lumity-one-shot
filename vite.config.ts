import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://api.lumityapp.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api\/proxy/, '/api/v1'),
      },
    },
  },
})
