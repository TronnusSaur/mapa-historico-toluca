import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Base path '/' para dominio personalizado (torre-de-control.soranoserver.com)
  server: {
    host: true, // Exposes the server to local network (0.0.0.0)
  },
})
