import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const TARGET_DIR = path.join(ROOT, "apps", "web", "src")
const FILE_EXTENSIONS = new Set([".ts", ".tsx"])

const isHookFile = (filePath) =>
  filePath.includes(`${path.sep}features${path.sep}`) &&
  filePath.includes(`${path.sep}hooks${path.sep}`)

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
      const importMatch = line.match(/from\s+["']([^"']+)["']/)
      if (!importMatch) return
      const importPath = importMatch[1]
      if (!importPath.includes("atoms/")) return
      if (isHookFile(fullPath)) return
      violations.push({
        file: fullPath.replace(ROOT + path.sep, ""),
        line: index + 1,
        importPath,
      })
    })
  }
}

walk(TARGET_DIR)

if (violations.length > 0) {
  console.error("[boundary] Atom privacy violations found:")
  for (const item of violations) {
    console.error(`- ${item.file}:${item.line} -> ${item.importPath}`)
  }
  process.exit(1)
}

console.log("[boundary] OK: no atom imports outside hooks.")
