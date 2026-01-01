import { defineConfig, loadEnv } from "vite"
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa"
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Sola WordLens",
          short_name: "Sola",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#ffffff",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/trpc": {
          target: env.VITE_API_URL || "http://localhost:6001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
