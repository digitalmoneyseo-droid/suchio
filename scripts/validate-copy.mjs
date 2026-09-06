import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { servicesContent } from "../src/i18n/services.ts";
import { legalContent } from "../src/i18n/legal-content.ts";
import { dictionaries } from "../src/i18n/translations.ts";

const base = process.argv[2] ?? "HEAD";
const directory = resolve(".wrangler/copy-baseline");
await mkdir(directory, { recursive: true });
for (const file of ["services.ts", "services-fr.ts", "legal-content.ts", "translations.ts", "translations-fr.ts", "not-found.ts"]) {
  const process = Bun.spawn(["git", "show", `${base}:src/i18n/${file}`], { stdout: "pipe", stderr: "pipe" });
  const source = await new Response(process.stdout).text();
  if (await process.exited !== 0) throw new Error(`Cannot read ${base}:${file}`);
  await Bun.write(resolve(directory, file), source);
}
function copyOnly(value) {
  if (Array.isArray(value)) return value.map(copyOnly);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "id").map(([key, entry]) => [key, copyOnly(entry)]));
  return value;
}
for (const [file, name, current] of [["services.ts", "servicesContent", servicesContent], ["legal-content.ts", "legalContent", legalContent], ["translations.ts", "dictionaries", dictionaries]]) {
  const original = (await import(pathToFileURL(resolve(directory, file)).href))[name];
  if (!isDeepStrictEqual(copyOnly(original), copyOnly(current))) throw new Error(`${name}: public content differs from ${base}`);
  console.log(`${name}: public content unchanged from ${base}`);
}
