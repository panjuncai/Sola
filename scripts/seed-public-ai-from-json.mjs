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

const dataDir = path.resolve(process.cwd(), "scripts", "data")
const providerFile = path.join(dataDir, "public-ai-provider-config.json")
const instructionFile = path.join(dataDir, "public-ai-instruction.json")

if (!fs.existsSync(providerFile) || !fs.existsSync(instructionFile)) {
  throw new Error("Missing seed data files under scripts/data.")
}

const providerRows = JSON.parse(fs.readFileSync(providerFile, "utf8"))
const instructionRows = JSON.parse(fs.readFileSync(instructionFile, "utf8"))

const db = new Database(dbPath)
const hasProviderTable = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='public_ai_provider_config'"
  )
  .get()
const hasInstructionTable = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='public_ai_instruction'"
  )
  .get()
if (!hasProviderTable || !hasInstructionTable) {
  throw new Error("AI tables not found. Run db:push first.")
}

const providerKeyEnv = {
  volcengine:
    process.env.VOLCENGINE_API_KEY ||
    env.VOLCENGINE_API_KEY ||
    process.env.VOLCENGINE_KEY ||
    env.VOLCENGINE_KEY ||
    "",
  qwen:
    process.env.QWEN_API_KEY ||
    env.QWEN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    env.DASHSCOPE_API_KEY ||
    "",
  openai:
    process.env.OPENAI_API_KEY ||
    env.OPENAI_API_KEY ||
    "",
  gemini:
    process.env.GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    "",
  aihubmix:
    process.env.AIHUBMIX_API_KEY ||
    env.AIHUBMIX_API_KEY ||
    "",
}

const upsertProvider = db.prepare(
  `INSERT INTO public_ai_provider_config
    (id, provider_type, api_url, api_key, models, enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      provider_type = excluded.provider_type,
      api_url = excluded.api_url,
      api_key = excluded.api_key,
      models = excluded.models,
      enabled = excluded.enabled,
      updated_at = excluded.updated_at`
)

const upsertInstruction = db.prepare(
  `INSERT INTO public_ai_instruction
    (id, name, instruction_type, system_prompt, user_prompt_template, input_schema_json,
     output_schema_json, enabled, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      instruction_type = excluded.instruction_type,
      system_prompt = excluded.system_prompt,
      user_prompt_template = excluded.user_prompt_template,
      input_schema_json = excluded.input_schema_json,
      output_schema_json = excluded.output_schema_json,
      enabled = excluded.enabled,
      is_default = excluded.is_default,
      updated_at = excluded.updated_at`
)

const runSeed = db.transaction(() => {
  const now = Date.now()
  for (const row of providerRows) {
    const providerType = row.provider_type
    const apiKey =
      providerType && providerKeyEnv[providerType]
        ? providerKeyEnv[providerType]
        : null
    upsertProvider.run(
      row.id,
      row.provider_type,
      row.api_url,
      apiKey,
      row.models ?? null,
      row.enabled ? 1 : 0,
      row.created_at ?? now,
      now
    )
  }

  for (const row of instructionRows) {
    upsertInstruction.run(
      row.id,
      row.name,
      row.instruction_type,
      row.system_prompt,
      row.user_prompt_template,
      row.input_schema_json ?? null,
      row.output_schema_json ?? null,
      row.enabled ? 1 : 0,
      row.is_default ? 1 : 0,
      row.created_at ?? now,
      now
    )
  }
})

runSeed()

console.log(
  `Seeded public_ai_provider_config (${providerRows.length}) and public_ai_instruction (${instructionRows.length}).`
)
