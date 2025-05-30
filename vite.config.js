import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
