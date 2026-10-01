import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/caderneta-roca/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Caderneta Roça',
        short_name: 'Caderneta',
        description: 'Orçamento da roça: canteiros, gastos e colheita do mês.',
        lang: 'pt-BR',
        theme_color: '#2F4F3A',
        background_color: '#F4EBD9',
        display: 'standalone',
        start_url: '/caderneta-roca/',
        scope: '/caderneta-roca/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
