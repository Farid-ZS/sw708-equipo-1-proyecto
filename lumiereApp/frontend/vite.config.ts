import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    // El frontend llama a /api/... y Vite lo reenvía al backend.
    proxy: { '/api': 'http://localhost:4000' },
  },
})
