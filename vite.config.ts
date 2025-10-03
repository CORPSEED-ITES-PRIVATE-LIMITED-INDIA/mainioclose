import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
 
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    allowedHosts: ["erp.corpseed.com"],
    proxy: {
      "/accountService": {
        target: "http://localhost:9002",
        changeOrigin: true,
        secure: false,
      },
      "/leadService": {
        target: "http://localhost:9001",
        changeOrigin: true,
        secure: false,
      },
      "/securityService": {
        target: "http://localhost:9990",
        changeOrigin: true,
        secure: false,
      },
      "/paymentService": {
        target: "http://localhost:8084",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});