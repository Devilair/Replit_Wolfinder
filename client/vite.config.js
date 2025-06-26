import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ricava il path assoluto del repo root (due livelli sopra /client)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");   // ← adatta se la cartella client è altrove

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // alias puntano ai SOURCES, non alla build JS
      "@": path.resolve(__dirname, "src"),
      "@wolfinder/shared-types": path.resolve(repoRoot, "packages/shared-types/src"),
      "@wolfinder/db":          path.resolve(repoRoot, "packages/db/src"),
    },
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
}); 