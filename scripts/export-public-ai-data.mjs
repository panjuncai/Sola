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
const dataDir = path.resolve(process.cwd(), "scripts", "data")
fs.mkdirSync(dataDir, { recursive: true })

const providers = db
  .prepare(
    `SELECT id, provider_type, api_url, api_key, models, enabled, created_at, updated_at
     FROM public_ai_provider_config
     ORDER BY provider_type`
  )
  .all()
  .map((row) => ({ ...row, api_key: "" }))

const instructions = db
  .prepare(
    `SELECT id, name, instruction_type, system_prompt, user_prompt_template,
            input_schema_json, output_schema_json, enabled, is_default, created_at, updated_at
     FROM public_ai_instruction
     ORDER BY instruction_type, name`
  )
  .all()

fs.writeFileSync(
  path.join(dataDir, "public-ai-provider-config.json"),
  JSON.stringify(providers, null, 2)
)
fs.writeFileSync(
  path.join(dataDir, "public-ai-instruction.json"),
  JSON.stringify(instructions, null, 2)
)

console.log(
  `Exported public_ai_provider_config (${providers.length}) and public_ai_instruction (${instructions.length}).`
)
