import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TARGET_DIR = join(ROOT, "apps", "web", "src");
const QUERY_RE = /trpc\\.[\\w.]+\\.useQuery\\b/;
const ATOM_RE = /\\buseAtom(Value|)?\\b|\\buseSetAtom\\b/;

const walk = async (dir, files = []) => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
};

const main = async () => {
  const files = await walk(TARGET_DIR);
  const offenders = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    if (QUERY_RE.test(content) && ATOM_RE.test(content)) {
      offenders.push(file);
    }
  }

  if (offenders.length > 0) {
    console.error("[boundary] Found files using trpc.useQuery + jotai atom APIs:");
    for (const file of offenders) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log("[boundary] OK: no mixed trpc.useQuery + jotai atom usage found.");
};

main().catch((err) => {
  console.error("[boundary] Failed:", err);
  process.exit(1);
});
