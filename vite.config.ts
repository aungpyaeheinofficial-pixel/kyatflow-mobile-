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
        // Let Vite automatically handle chunking based on dependencies
        // This ensures React loads before code that depends on it
        // manualChunks removed - let Vite handle it automatically
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    commonjsOptions: {
      // Ensure React is properly resolved as a CommonJS module
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    optimizeDeps: {
      // Ensure React is pre-bundled and available
      include: ['react', 'react-dom', 'react/jsx-runtime'],
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
