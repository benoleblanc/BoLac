import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // L'enregistrement du service worker est fait à la main dans main.tsx
      // (uniquement en contexte web — inutile et redondant dans la coquille
      // native Capacitor, qui embarque déjà les assets localement).
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'BoLac',
        short_name: 'BoLac',
        description:
          'Cartes hors ligne et suivi GPS pour le canot, le kayak et le paddleboard.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        // Icône SVG placeholder pour la fondation — à remplacer par de vrais
        // PNG (192/512 + maskable avec zone de sécurité) lors de la passe design.
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Les tuiles de carte sont gérées séparément dans IndexedDB (lot "cache tuiles"),
        // on ne fait précacher ici que les assets applicatifs (JS/CSS/HTML).
        globPatterns: ['**/*.{js,css,html,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
