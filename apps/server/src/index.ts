import { config as loadEnv } from "dotenv"
import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import Fastify from "fastify"
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { Context } from "@sola/api"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
loadEnv({ path: path.resolve(__dirname, "../../../.env") })

const { appRouter } = await import("@sola/api")
if (process.env.SOLA_DB_PATH || process.env.SOLA_DB_URL) {
  console.log("[Sola] DB path", process.env.SOLA_DB_PATH ?? process.env.SOLA_DB_URL)
} else {
  console.log("[Sola] DB path (env)", "unset")
}

const server = Fastify({
  logger: true,
})

await server.register(cors, {
  origin: true,
  credentials: true,
})

await server.register(fastifyStatic, {
  root: path.resolve(__dirname, "../public"),
  prefix: "/",
})

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: ({ req, res }: CreateFastifyContextOptions): Context => ({
      req: req.raw,
      res: res.raw,
    }),
  },
})

await server.listen({
  port: 6001,
  host: "0.0.0.0",
})
