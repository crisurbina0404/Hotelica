import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuramos base relativa para que funcione en Vercel
export default defineConfig({
  plugins: [react()],
  base: './',
})
