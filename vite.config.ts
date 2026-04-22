import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is driven by DEPLOY_ENV set by the GitHub Action:
//   DEPLOY_ENV=production  → raíz (rama main, versión pública)
//   DEPLOY_ENV=development → /dev/ (rama develop, versión privada/financiera)
//   sin variable           → '/' para el servidor local de desarrollo
const deployEnv = process.env.DEPLOY_ENV;
const base =
  deployEnv === 'production'  ? '/mapa-historico-toluca/' :
  deployEnv === 'development' ? '/mapa-historico-toluca/dev/' :
  '/'; // local dev server

export default defineConfig({
  plugins: [react()],
  base,
})
