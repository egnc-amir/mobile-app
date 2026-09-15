import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Relative asset URLs are required for Capacitor WebView builds.
  base: './',

  server: {
    watch: {
      usePolling: true,
      interval: 250,
    },
    proxy: {
      '/business-card/api': {
        target: 'https://preprod-katalyst.egc.gov.bn/',
        changeOrigin: true,
        secure: false,
      },
      '/business-card/agencies-api': {
        target: 'https://api.katalyst.gov.bn',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/formbn/agencies_api.php',
      },
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
})
