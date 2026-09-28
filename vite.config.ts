import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mapa-historico-toluca/', // Explicit base path for GitHub Pages
  server: {
    host: true, // Exposes the server to local network (0.0.0.0)
  },
})
