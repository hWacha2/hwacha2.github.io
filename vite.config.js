import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/hwacha2.github.io/', // ← ВАЖНО: имя вашего репозитория
})