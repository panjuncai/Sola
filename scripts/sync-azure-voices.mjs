import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const raw = fs.readFileSync(filePath, "utf8")
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    env[key] = value
  }
  return env
}

const repoRoot = path.resolve(process.cwd())
const env = readEnvFile(path.join(repoRoot, ".env"))
const dbPath = process.env.SOLA_DB_PATH || process.env.SOLA_DB_URL || env.SOLA_DB_PATH || env.SOLA_DB_URL

if (!dbPath) {
  console.error("Missing SOLA_DB_PATH or SOLA_DB_URL")
  process.exit(1)
}

const db = new Database(dbPath)
const provider = db
  .prepare(
    "SELECT id, api_key, region FROM public_tts_provider_config WHERE provider_type = ? AND enabled = 1 LIMIT 1"
  )
  .get("azure")

if (!provider || !provider.api_key || !provider.region) {
  console.error("Azure provider config not found or missing api_key/region")
  process.exit(1)
}

const endpoint = `https://${provider.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`
const response = await fetch(endpoint, {
  headers: {
    "Ocp-Apim-Subscription-Key": provider.api_key,
  },
})

if (!response.ok) {
  const text = await response.text()
  console.error(`Azure voices list failed: ${response.status} ${text}`)
  process.exit(1)
}

const voices = await response.json()
if (!Array.isArray(voices)) {
  console.error("Unexpected Azure voices response")
  process.exit(1)
}

const existing = new Set(
  db
    .prepare(
      "SELECT voice_id FROM tts_voice_catalog WHERE public_tts_provider_config_id = ?"
    )
    .all(provider.id)
    .map((row) => row.voice_id)
)

const insert = db.prepare(
  `INSERT INTO tts_voice_catalog (
    id,
    public_tts_provider_config_id,
    voice_id,
    lang,
    gender,
    name,
    created_at,
    updated_at
  ) VALUES (
    lower(hex(randomblob(16))),
    ?,
    ?,
    ?,
    ?,
    ?,
    CAST((julianday('now') - 2440587.5)*86400000 as integer),
    CAST((julianday('now') - 2440587.5)*86400000 as integer)
  )`
)

let inserted = 0
const insertMany = db.transaction((items) => {
  for (const voice of items) {
    const voiceId = voice.ShortName
    if (!voiceId || existing.has(voiceId)) continue
    insert.run(
      provider.id,
      voiceId,
      voice.Locale || "unknown",
      voice.Gender || null,
      voice.DisplayName || voice.LocalName || voiceId
    )
    existing.add(voiceId)
    inserted += 1
  }
})

insertMany(voices)

console.log(`Synced Azure voices: +${inserted}, total ${existing.size}`)
