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
const providerFile = path.join(dataDir, "public-tts-provider-config.json")
const voiceFile = path.join(dataDir, "tts-voice-catalog.json")

if (!fs.existsSync(providerFile) || !fs.existsSync(voiceFile)) {
  throw new Error("Missing seed data files under scripts/data.")
}

const providerRows = JSON.parse(fs.readFileSync(providerFile, "utf8"))
const voiceRows = JSON.parse(fs.readFileSync(voiceFile, "utf8"))

const db = new Database(dbPath)
const hasProviderTable = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='public_tts_provider_config'"
  )
  .get()
const hasVoiceTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tts_voice_catalog'")
  .get()
if (!hasProviderTable || !hasVoiceTable) {
  throw new Error("TTS tables not found. Run db:push first.")
}

const overrideKey =
  process.env.AZURE_TTS_API_KEY ||
  process.env.PUBLIC_TTS_API_KEY ||
  env.AZURE_TTS_API_KEY ||
  env.PUBLIC_TTS_API_KEY ||
  ""

const upsertProvider = db.prepare(
  `INSERT INTO public_tts_provider_config
    (id, provider_type, api_url, api_key, region, enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      provider_type = excluded.provider_type,
      api_url = excluded.api_url,
      api_key = excluded.api_key,
      region = excluded.region,
      enabled = excluded.enabled,
      updated_at = excluded.updated_at`
)
const deleteVoicesByProvider = db.prepare(
  "DELETE FROM tts_voice_catalog WHERE public_tts_provider_config_id = ?"
)
const insertVoice = db.prepare(
  `INSERT INTO tts_voice_catalog
    (id, public_tts_provider_config_id, voice_id, lang, gender, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
)

const runSeed = db.transaction(() => {
  const now = Date.now()
  const providerIds = new Set()
  for (const row of providerRows) {
    const apiKey = overrideKey || row.api_key || null
    upsertProvider.run(
      row.id,
      row.provider_type,
      row.api_url,
      apiKey,
      row.region,
      row.enabled ? 1 : 0,
      row.created_at ?? now,
      now
    )
    providerIds.add(row.id)
  }

  for (const providerId of providerIds) {
    deleteVoicesByProvider.run(providerId)
  }

  for (const row of voiceRows) {
    insertVoice.run(
      row.id,
      row.public_tts_provider_config_id,
      row.voice_id,
      row.lang,
      row.gender ?? null,
      row.name ?? null,
      row.created_at ?? now,
      row.updated_at ?? now
    )
  }
})

runSeed()

console.log(
  `Seeded public_tts_provider_config (${providerRows.length}) and tts_voice_catalog (${voiceRows.length}).`
)
