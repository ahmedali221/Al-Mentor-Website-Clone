import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      external: ["@rollup/rollup-linux-x64-gnu"],
    },
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "https://al-mentor-database-production.up.railway.app/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
