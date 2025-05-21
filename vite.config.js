import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./index.html",
        popup: "./popup.html", // Se você tiver um popup.html separado
        auth: "./auth.html",
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
