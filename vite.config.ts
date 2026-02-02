import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - Tailwind v4 plugin types might not be found in some environments
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
