import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Backend runs at http://127.0.0.1:8000 with the /api and /static prefixes.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "b3eb-103-41-98-108.ngrok-free.app",
    ],
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/static": "http://127.0.0.1:8000",
    },
  },
});
