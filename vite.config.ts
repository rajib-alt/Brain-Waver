import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// GitHub Pages static build config
// If deploying to https://<user>.github.io/<repo>/, set VITE_BASE_URL=/<repo>/
// For a user/org site (https://<user>.github.io/), leave VITE_BASE_URL unset or set to "/"
export default defineConfig({
  base: process.env.VITE_BASE_URL ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          editor: ["@blocknote/core", "@blocknote/react", "@blocknote/mantine"],
          charts: ["recharts", "react-force-graph-2d"],
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
});
