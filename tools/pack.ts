// Pack a dashboard directory into a marketplace bundle JSON — the same packing rules as
// adi_dashboards::collect_files (crates/adi-dashboards/src/bundle.rs): everything authored
// travels; .adi/, node_modules/, .git/ and the root config.toml never do; names sorted so a
// repack of unchanged files is byte-identical.
//
// Usage: bun pack.ts <dir> > bundle.json

import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const NEVER_DIRS = new Set([".adi", "node_modules", ".git"]);
const NEVER_ROOT_FILES = new Set(["config.toml"]);

const files: { path: string; contents: string }[] = [];
let total = 0;

function walk(dir: string, rel: string[]) {
  const names = readdirSync(dir).sort();
  for (const name of names) {
    if (NEVER_DIRS.has(name)) continue;
    if (rel.length === 0 && NEVER_ROOT_FILES.has(name)) continue;
    const path = join(dir, name);
    const meta = statSync(path);
    if (meta.isDirectory()) {
      walk(path, [...rel, name]);
    } else {
      total += meta.size;
      files.push({
        path: [...rel, name].join("/"),
        contents: Buffer.from(readFileSync(path)).toString("base64"),
      });
    }
  }
}

const root = process.argv[2];
walk(root, []);

const bundle = {
  // The publisher's id — a preference only: a marketplace install lands under the entry's slug.
  id: "starter-status",
  name: "Starter Status",
  description:
    "The smallest complete ADI app: one panel polling one route. Install, start, read three files — the anatomy of every app.",
  host: "starter.adi",
  files,
};

if (total > 4 * 1024 * 1024) {
  console.error(`too large: ${total} bytes`);
  process.exit(1);
}
process.stdout.write(JSON.stringify(bundle, null, 2) + "\n");
console.error(`packed ${files.length} file(s), ${total} bytes`, process.stderr);
