import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import obfuscatorPlugin from "vite-plugin-obfuscator";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
  ],
  server: { port: 3000 },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
}));
