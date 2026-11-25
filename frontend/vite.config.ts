import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

// Leaflet is only used by the lazily loaded events page. Leaving it out of the shared vendor chunk lets the bundler
// place it with that page, off the initial load.
const EVENTS_ONLY_PACKAGES = /node_modules\/(\.pnpm\/[^/]+\/node_modules\/)?(leaflet|leaflet\.markercluster|react-leaflet|@react-leaflet\/[a-z-]+)\//;

export default defineConfig({
  plugins: [
    react({
      compiler: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // The API's CORS policy only allows this origin, so never silently move to another port.
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules") || EVENTS_ONLY_PACKAGES.test(id)) {
            return undefined;
          }
          return "vendor";
        },
      },
    },
  },
});
