import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],

  resolve: {
    alias: [
      {
        // Redirect every `import ... from "@heroui/react"` across the app to
        // our shim, which applies a handful of app-wide default sizes/fonts.
        // See src/heroui-shim.js for why this needs the exact-match form
        // (not a prefix match) and how the shim itself avoids re-entering it.
        find: "@heroui/react",
        replacement: fileURLToPath(
          new URL("./src/heroui-shim.js", import.meta.url),
        ),
      },
    ],
  },

  server: {
    port: 3000,

    hmr: {
      overlay: false,
      clientPort: 3000,
    },

    watch: {
      usePolling: true,
    },

    allowedHosts: ["erp.corpseed.com", "localhost"],

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

      "/operationService": {
        target: "http://localhost:9090",
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });
        },
      },

      "/s3-assets": {
        target: "https://erp-corpseed.s3.ap-south-1.amazonaws.com",
        changeOrigin: true,
        secure: true,

        rewrite: (path) => path.replace(/^\/s3-assets/, ""),

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });

          proxy.on("error", (error) => {
            console.error("S3 proxy error:", error);
          });
        },
      },
    },
  },
});