/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Tests always run against the bundled sample scenarios, even when a real
    // contract address is present in .env. A test suite that silently depends
    // on a live deployment is a flaky test suite.
    env: {
      VITE_CONTRACT_ADDRESS: "",
    },
  },
});