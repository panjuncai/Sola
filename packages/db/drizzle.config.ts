import path from "node:path"
import { defineConfig } from "drizzle-kit"

const dbPath =
  process.env.SOLA_DB_URL ??
  process.env.SOLA_DB_PATH ??
  path.resolve(process.cwd(), "../../sola.db")

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
})
