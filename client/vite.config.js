import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Vendor ko alag chunk me rakha jaata hai. Pehle react + axios +
        // socket.io sab ek hi 460 KB file me the, isliye har chhote UI fix
        // par browser ko poora bundle dobara download karna padta tha. Ab
        // sirf app wala hissa badalta hai, vendor cache me rehta hai —
        // dobara kholne par page turant khulta hai (Render free plan par
        // ye seedha farak hai).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/]socket\.io-client[\\/]/.test(id)) return 'vendor-socket';
          if (/[\\/]node_modules[\\/]axios[\\/]/.test(id)) return 'vendor-http';
          if (/[\\/]node_modules[\\/]framer-motion[\\/]/.test(id)) return 'vendor-motion';
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) return 'vendor-icons';
          // Baaki library (jaise gsap, sirf landing page par chahiye) ko
          // haath mat lagao — warna wo shared vendor chunk me aa jaati hai aur
          // login page bhi use download karne lagta hai.
          return undefined;
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true
      }
    }
  }
})
