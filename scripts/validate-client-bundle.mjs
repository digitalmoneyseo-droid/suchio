import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const chunkDirectories = [join(process.cwd(), ".next", "static", "chunks"), join(process.cwd(), "dist", "client")];
const dictionaryMarkers = [
  "Belege vor Meinung",
  "Evidence before opinion",
  "Marketing websites",
];

const files = [];
for (const directory of chunkDirectories) {
  for (const file of await readdir(directory, { recursive: true })) {
    if (file.endsWith(".js")) files.push(join(directory, file));
  }
}
const violations = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const matches = dictionaryMarkers.filter((marker) => source.includes(marker));
  if (matches.length) violations.push(`${file}: ${matches.join(", ")}`);
}

if (violations.length) {
  throw new Error(`Server-owned localization copy was found in client chunks:\n${violations.join("\n")}`);
}

console.log(`Checked ${files.length} client chunks; server-owned dictionary markers were absent.`);
