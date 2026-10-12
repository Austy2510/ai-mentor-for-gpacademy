import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Relative base so the build works under any GitHub Pages sub-path
// (https://<user>.github.io/<repo>/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    // The mentor bundle (React + Anthropic SDK + zod) only loads when the bubble is opened.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        // Career Quest front end (public/app.js) + its Claude bridge (src/quest-ai.ts).
        index: resolve(import.meta.dirname, "index.html"),
        // The mentor app itself, loaded by the widget inside an iframe.
        mentor: resolve(import.meta.dirname, "mentor.html"),
      },
    },
  },
});
