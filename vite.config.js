import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    host: "localhost",
    port: 3000,
    open: true,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://al-mentor-database-production.up.railway.app/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
