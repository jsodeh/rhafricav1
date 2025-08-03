import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          
          // UI Components
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            'sonner',
            'vaul'
          ],
          
          // Map libraries (large)
          'mapbox-gl': ['mapbox-gl'],
          
          // Backend services
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
          
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Routing
          router: ['react-router-dom'],
          
          // Charts
          charts: ['recharts'],
          
          // Date utilities
          calendar: ['react-day-picker', 'date-fns'],
          
          // Utilities
          utils: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', 'cmdk', 'next-themes'],
          
          // Layout components
          layout: ['react-resizable-panels', 'embla-carousel-react']
        },
      },
    },
  },
}));
