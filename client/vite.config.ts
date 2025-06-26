import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      external: ['@wolfinder/shared', '@wolfinder/shared/subscription-features'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['drizzle-orm', 'drizzle-zod', '@wolfinder/shared'],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'bigint': true,
      },
    },
  },
  ssr: {
    noExternal: ['@wolfinder/shared'],
  },
  esbuild: {
    target: 'es2020',
    supported: {
      'bigint': true,
    },
  },
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
}); 