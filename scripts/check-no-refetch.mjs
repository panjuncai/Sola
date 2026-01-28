import fs from "node:fs"
import path from "node:path"

const root = path.resolve(process.cwd(), "apps/web/src")
const exts = new Set([".ts", ".tsx"])
const forbidden = [/\brefetch\s*\(/, /\bsetQueryData\s*\(/]

const violations = []

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    if (entry.name === "node_modules") continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    const ext = path.extname(entry.name)
    if (!exts.has(ext)) continue
    const content = fs.readFileSync(fullPath, "utf8")
    for (const pattern of forbidden) {
      if (pattern.test(content)) {
        violations.push(`${path.relative(process.cwd(), fullPath)}: ${pattern}`)
        break
      }
    }
  }
}

walk(root)

if (violations.length > 0) {
  console.error("[boundary] UI refetch/patch usage found:")
  for (const item of violations) {
    console.error(`- ${item}`)
  }
  process.exit(1)
}

console.log("[boundary] OK: no refetch/setQueryData usage found in apps/web/src.")
