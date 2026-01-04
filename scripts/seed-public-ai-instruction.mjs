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

const explainInstruction = {
  name: "法语词汇",
  instructionType: "explain",
  systemPrompt:
    "You are a French language expert.",
  userPromptTemplate:
    `Explain the target French word or phrase in {{native_language}}.

Strict Constraints:

Language: The explanation must be written in {{native_language}}.

Noun Format: {{native_language}}翻译 + (阳性名词/阴性名词：记忆诀窍).

Adjective Format: {{native_language}}翻译 + (阳性形容词/阴性形容词).

Verb Format: {{native_language}}翻译 + (动词).

Memory Tip (Crucial): Create a mnemonic that logically or visually connects the word's meaning to its gender. For example, associate masculine nouns with "strength/sun/blue" and feminine nouns with "nature/beauty/pink" or specific letter patterns.

Conciseness: Keep it brief and scannable.

Return Example:
注意、小心（阴性名词：法语中以 -tion 结尾的单词几乎全是阴性。可以想象一位“女性”在细心地观察每一个细节）

Now The Given French Text is:
{{target_text}}

Return a concise native-language explanation in the requested format.`,
  inputSchemaJson: JSON.stringify({
    target_text: "string",
    native_language: "string",
  }),
  outputSchemaJson: JSON.stringify({
    explanation: "string",
  }),
  enabled: 1,
  isDefault: 1,
}

const selectStmt = db.prepare(
  "SELECT id FROM public_ai_instruction WHERE instruction_type = ? LIMIT 1"
)
const upsertInstruction = (item, label) => {
  const existing = selectStmt.get(item.instructionType)
  if (existing?.id) {
    db.prepare(
      `UPDATE public_ai_instruction
       SET name = ?, system_prompt = ?, user_prompt_template = ?, input_schema_json = ?, output_schema_json = ?, enabled = 1, is_default = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      item.name,
      item.systemPrompt,
      item.userPromptTemplate,
      item.inputSchemaJson,
      item.outputSchemaJson,
      item.isDefault,
      now,
      existing.id
    )
    console.log(`updated ${label} instruction`)
  } else {
    db.prepare(
      `INSERT INTO public_ai_instruction
       (id, name, instruction_type, system_prompt, user_prompt_template, input_schema_json, output_schema_json, enabled, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      item.name,
      item.instructionType,
      item.systemPrompt,
      item.userPromptTemplate,
      item.inputSchemaJson,
      item.outputSchemaJson,
      item.enabled,
      item.isDefault,
      now,
      now
    )
    console.log(`inserted ${label} instruction`)
  }
}

upsertInstruction(instruction, "translate")
upsertInstruction(explainInstruction, "explain")
