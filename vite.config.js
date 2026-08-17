import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // 👈 Обязательно укажите имя вашего репозитория!
  build: {
    outDir: 'dist'
  }
})