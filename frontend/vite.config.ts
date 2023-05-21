import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: ['edge90', 'firefox90', 'chrome90', 'safari15']
  }
})
