import { mkdir, copyFile, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
await mkdir("dist/licenses", { recursive: true });
await copyFile("LICENSE", "dist/licenses/LICENSE.txt");
await copyFile(
  "licenses/pure-admin-MIT.txt",
  "dist/licenses/pure-admin-MIT.txt",
);
await copyFile(
  "docs/third-party-notices.md",
  "dist/licenses/third-party-notices.md",
);
await copyFile("src/data/sources.json", "dist/licenses/data-sources.json");
const inventory = [];
async function packageNotices(dir) {
  let p;
  try {
    p = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
  } catch {
    return;
  }
  const safe = `${p.name}@${p.version}`.replaceAll("/", "__");
  const files = (await readdir(dir)).filter((n) =>
    /^(license|licence|notice|copyright)(\..*)?$/i.test(n),
  );
  for (const name of files) {
    try {
      await mkdir(`dist/licenses/packages/${safe}`, { recursive: true });
      await copyFile(join(dir, name), `dist/licenses/packages/${safe}/${name}`);
    } catch {}
  }
  inventory.push({
    name: p.name,
    version: p.version,
    license: p.license ?? null,
    noticeFiles: files,
  });
}
for (const entry of await readdir("node_modules/.pnpm")) {
  const modules = join("node_modules/.pnpm", entry, "node_modules");
  let children;
  try {
    children = await readdir(modules, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const child of children) {
    if (!child.isDirectory()) continue;
    const path = join(modules, child.name);
    if (child.name.startsWith("@")) {
      for (const scoped of await readdir(path, { withFileTypes: true })) {
        if (scoped.isDirectory()) await packageNotices(join(path, scoped.name));
      }
    } else await packageNotices(path);
  }
}
const { writeFile } = await import("node:fs/promises");
await writeFile(
  "dist/licenses/dependency-inventory.json",
  JSON.stringify(inventory, null, 2),
);
console.log(
  `Preserved notices for ${inventory.length} installed dependencies, upstream MIT, and data attribution.`,
);
