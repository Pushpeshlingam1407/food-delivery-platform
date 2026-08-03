import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, "setupTests.ts")],
    coverage: {
      provider: "v8",
      all: true,
      include: ["**/src/**/*.{ts,tsx}"],
      exclude: [
        "**/src/**/*.d.ts",
        "**/src/vite-env.d.ts",
        "**/src/setupTests.ts",
        "**/src/main.tsx",
      ],
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
    },
  },
});
