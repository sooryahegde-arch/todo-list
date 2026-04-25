import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

const commitHash = process.env.COMMIT_REF 
  ? process.env.COMMIT_REF.slice(0, 7) 
  : execSync('git rev-parse --short HEAD').toString().trim();

process.env.VITE_APP_VERSION = commitHash;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'profile.jpg'],
      manifest: {
        name: 'TaskFlow Todo Board',
        short_name: 'TaskFlow',
        description: 'A beautiful task management application',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'profile.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
