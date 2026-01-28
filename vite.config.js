import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), react()],

  // ✅ NO base path needed for single hosting (served from root)
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // ✅ Define environment variables explicitly
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api'),
  },

  // ✅ DEV ONLY proxy (works now)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
