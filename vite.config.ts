import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Listen on all addresses (localhost and network)
    port: 3555, // Frontend port as specified
    strictPort: false, // Try next available port if 3555 is taken
    open: mode === "development", // Automatically open browser in dev mode
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/', // Ensure assets are loaded from root
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    minify: mode === "production" ? "esbuild" : false,
    cssCodeSplit: false, // Disable CSS code splitting to ensure main CSS is always loaded
    emptyOutDir: true, // Clean dist folder before build
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - React MUST be loaded first
          if (id.includes('node_modules')) {
            // React and React DOM must be in the same chunk and load first
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Everything else can be in vendor chunk but will load after React
            // This ensures React is always available when other vendors load
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    modulePreload: {
      polyfill: true,
    },
    // Optimize for mobile and production
    assetsInlineLimit: 0, // Don't inline CSS - always use external stylesheet for debugging
    reportCompressedSize: false, // Faster builds on Vercel
    // Tree shaking
    treeshake: {
      moduleSideEffects: false,
    },
  },
}));
