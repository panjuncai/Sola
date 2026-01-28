import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const logicRoot = path.resolve(repoRoot, "packages/logic/src")
const forbiddenMarkers = [
  "@/features/",
  "@/lib/",
  "@/stores/",
  "@/components/",
  "@/pages/",
  "apps/web/",
  "packages/ui/",
  "packages/db/",
  "@sola/ui",
  "@sola/db",
]

const exts = new Set([".ts", ".tsx"])
const violations = []

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    const ext = path.extname(entry.name)
    if (!exts.has(ext)) continue
    const content = fs.readFileSync(fullPath, "utf8")
    for (const marker of forbiddenMarkers) {
      if (content.includes(marker)) {
        violations.push(
          `${path.relative(repoRoot, fullPath)}: forbidden import "${marker}"`
        )
      }
    }
  }
}

if (!fs.existsSync(logicRoot)) {
  console.log("[boundary] OK: packages/logic/src not found.")
  process.exit(0)
}

walk(logicRoot)

if (violations.length > 0) {
  console.error("[boundary] Logic boundary violations found:")
  for (const item of violations) {
    console.error(`- ${item}`)
  }
  process.exit(1)
}

console.log("[boundary] OK: logic layer does not import web/ui/db.")
