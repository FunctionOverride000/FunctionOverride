import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // PENTING: Mengizinkan akses dari tunnel Ngrok
    // Menggunakan 'true' membolehkan semua host (praktis untuk Ngrok gratisan yang URL-nya berubah-ubah)
    allowedHosts: true,
    host: true // Opsional: Membuka network access
  }
})