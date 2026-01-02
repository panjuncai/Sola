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
    "SELECT name FROM sqlite_master WHERE type='table' AND name='public_ai_instruction'"
  )
  .get()
if (!table) {
  throw new Error("public_ai_instruction table not found. Run db:push first.")
}

const now = Date.now()
const instruction = {
  name: "翻译",
  instructionType: "translate",
  systemPrompt: "You are a professional translator.",
  userPromptTemplate:
    "Translate the following text into {{native_language}}. Keep it concise and faithful.\n\nText:\n{{target_text}}",
  inputSchemaJson: JSON.stringify({
    target_text: "string",
    native_language: "string",
  }),
  outputSchemaJson: JSON.stringify({
    translation: "string",
  }),
  enabled: 1,
  isDefault: 1,
}

const selectStmt = db.prepare(
  "SELECT id FROM public_ai_instruction WHERE instruction_type = ? LIMIT 1"
)
const existing = selectStmt.get(instruction.instructionType)
if (existing?.id) {
  db.prepare(
    `UPDATE public_ai_instruction
     SET name = ?, system_prompt = ?, user_prompt_template = ?, input_schema_json = ?, output_schema_json = ?, enabled = 1, is_default = 1, updated_at = ?
     WHERE id = ?`
  ).run(
    instruction.name,
    instruction.systemPrompt,
    instruction.userPromptTemplate,
    instruction.inputSchemaJson,
    instruction.outputSchemaJson,
    now,
    existing.id
  )
  console.log("updated translate instruction")
} else {
  db.prepare(
    `INSERT INTO public_ai_instruction
     (id, name, instruction_type, system_prompt, user_prompt_template, input_schema_json, output_schema_json, enabled, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    instruction.name,
    instruction.instructionType,
    instruction.systemPrompt,
    instruction.userPromptTemplate,
    instruction.inputSchemaJson,
    instruction.outputSchemaJson,
    instruction.enabled,
    instruction.isDefault,
    now,
    now
  )
  console.log("inserted translate instruction")
}
