import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const TARGET_DIR = path.join(ROOT, "apps", "web", "src")
const FEATURE_PREFIX = "@/features/"
const FILE_EXTENSIONS = new Set([".ts", ".tsx"])

const violations = []

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
      walk(fullPath)
      continue
    }
    if (!FILE_EXTENSIONS.has(path.extname(entry.name))) continue
    const content = fs.readFileSync(fullPath, "utf8")
    const lines = content.split(/\r?\n/)
    lines.forEach((line, index) => {
      const importMatches = line.matchAll(/["']@\/features\/[^"']+["']/g)
      for (const match of importMatches) {
        const raw = match[0].slice(1, -1)
        if (!raw.startsWith(FEATURE_PREFIX)) continue
        const rest = raw.slice(FEATURE_PREFIX.length)
        if (rest.includes("/")) {
          violations.push({
            file: fullPath.replace(ROOT + path.sep, ""),
            line: index + 1,
            importPath: raw,
          })
        }
      }
    })
  }
}

walk(TARGET_DIR)

if (violations.length > 0) {
  console.error("[boundary] Feature deep import violations found:")
  for (const item of violations) {
    console.error(`- ${item.file}:${item.line} -> ${item.importPath}`)
  }
  process.exit(1)
}

console.log("[boundary] OK: no deep feature imports found.")
