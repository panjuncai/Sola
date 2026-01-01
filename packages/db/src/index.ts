import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import * as schema from "./schema.js"

function findPackageRoot(startDir: string) {
  let currentDir = startDir
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) return currentDir
    const parent = path.dirname(currentDir)
    if (parent === currentDir) break
    currentDir = parent
  }
  return startDir
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageRoot = findPackageRoot(__dirname)

export const dbFilePath =
  process.env.SOLA_DB_URL ??
  process.env.SOLA_DB_PATH ??
  path.join(packageRoot, "sola.db")

const sqlite = new Database(dbFilePath)

export const db = drizzle(sqlite, { schema })

export * from "./schema.js"
