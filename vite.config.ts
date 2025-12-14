import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ 
      manifest: {
        ...manifest,
        oauth2: {
          client_id: process.env.VITE_OAUTH_CLIENT_ID || manifest.oauth2?.client_id,
          scopes: manifest.oauth2?.scopes || [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ]
        }
      }
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
        stats: 'stats.html',
      },
    },
  },
});
