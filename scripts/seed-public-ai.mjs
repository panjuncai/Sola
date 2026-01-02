import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env")
  const values = {}
  if (!fs.existsSync(envPath)) return values
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (key) values[key] = value
  }
  return values
}

const env = loadEnv()
const dbPath = process.env.SOLA_DB_PATH || env.SOLA_DB_PATH
if (!dbPath) {
  throw new Error("SOLA_DB_PATH is not set.")
}

const db = new Database(dbPath)
const table = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='public_ai_provider_config'"
  )
  .get()
if (!table) {
  throw new Error("public_ai_provider_config table not found. Run db:push first.")
}

const providers = [
  {
    providerType: "volcengine",
    apiUrl: "https://ark.cn-beijing.volces.com/api/v3",
    models: ["doubao-pro-32k", "doubao-pro-128k", "doubao-lite-32k"],
  },
  {
    providerType: "qwen",
    apiUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-turbo", "qwen-plus", "qwen-max"],
  },
  {
    providerType: "openai",
    apiUrl: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  },
  {
    providerType: "gemini",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: ["gemini-1.5-flash", "gemini-1.5-pro"],
  },
  {
    providerType: "aihubmix",
    apiUrl: "https://aihubmix.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  },
]

const selectStmt = db.prepare(
  "SELECT id FROM public_ai_provider_config WHERE provider_type = ? LIMIT 1"
)
const insertStmt = db.prepare(
  `INSERT INTO public_ai_provider_config
    (id, provider_type, api_url, api_key, models, enabled, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, 1, ?, ?)`
)
const updateStmt = db.prepare(
  `UPDATE public_ai_provider_config
    SET api_url = ?, api_key = NULL, models = ?, enabled = 1, updated_at = ?
    WHERE id = ?`
)

const now = Date.now()
for (const provider of providers) {
  const existing = selectStmt.get(provider.providerType)
  const modelsJson = JSON.stringify(provider.models)
  if (existing?.id) {
    updateStmt.run(provider.apiUrl, modelsJson, now, existing.id)
    console.log(`updated ${provider.providerType}`)
  } else {
    insertStmt.run(
      crypto.randomUUID(),
      provider.providerType,
      provider.apiUrl,
      modelsJson,
      now,
      now
    )
    console.log(`inserted ${provider.providerType}`)
  }
}
