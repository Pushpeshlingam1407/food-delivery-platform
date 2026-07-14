import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-hot-toast": path.resolve(
        __dirname,
        "node_modules/react-hot-toast",
      ),
      sonner: path.resolve(__dirname, "node_modules/sonner"),
      "lucide-react": path.resolve(__dirname, "node_modules/lucide-react"),
      axios: path.resolve(__dirname, "node_modules/axios"),
      "socket.io-client": path.resolve(
        __dirname,
        "node_modules/socket.io-client",
      ),
    },
  },
  server: {
    port: 3001,
  },
});
