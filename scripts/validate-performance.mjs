import { basename, dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import ts from "typescript";

const output = resolve("dist/client");
const cache = new Map();
function assert(condition, message) { if (!condition) throw new Error(message); }
function attributes(tag) { return Object.fromEntries([...tag.matchAll(/\s([:\w-]+)=(?:"([^"]*)"|'([^']*)')/g)].map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? ""])); }
async function moduleGraph(path, seen) {
  path = resolve(path);
  assert(path.startsWith(output + "/") || path.startsWith(output + "\\"), "Module escapes output directory");
  if (seen.has(path)) return;
  seen.add(path);
  if (!cache.has(path)) {
    const source = await Bun.file(path).text();
    const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
    const imports = ast.statements.filter((statement) => ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))
      .map((statement) => statement.moduleSpecifier).filter((specifier) => specifier && ts.isStringLiteral(specifier))
      .map((specifier) => specifier.text).filter((specifier) => specifier.startsWith("."));
    cache.set(path, { raw: Buffer.byteLength(source), gzip: gzipSync(source).length, imports });
  }
  for (const specifier of cache.get(path).imports) await moduleGraph(resolve(dirname(path), specifier), seen);
}
const reports = [];
for (const file of new Bun.Glob("**/*.html").scanSync({ cwd: output, onlyFiles: true })) {
  const html = await Bun.file(join(output, file)).text();
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((match) => attributes(match[0]));
  assert(!html.includes("url(./files/"), file + ": document-relative fonts");
  const styles = links.filter(({ rel }) => rel === "stylesheet");
  const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce((sum, match) => sum + Buffer.byteLength(match[1]), 0);
  assert(inlineCss <= 70_000, file + ": inline CSS exceeds 70 KB");
  for (const { href } of styles) assert(Bun.file(join(output, href.replace(/^\//, ""))).size > 0, file + ": missing stylesheet");
  const seen = new Set();
  for (const url of [...links.filter(({ rel, href }) => rel === "modulepreload" && href).map(({ href }) => href), ...scripts.filter(({ type, src }) => type === "module" && src).map(({ src }) => src)]) {
    await moduleGraph(join(output, url.split("?")[0].replace(/^\//, "")), seen);
  }
  const rawJs = [...seen].reduce((sum, path) => sum + cache.get(path).raw, 0);
  const gzipJs = [...seen].reduce((sum, path) => sum + cache.get(path).gzip, 0);
  const htmlBytes = Buffer.byteLength(html);
  assert(rawJs <= 525_000, file + ": initial JS graph exceeds 525 KB (" + rawJs + ")");
  assert(gzipJs <= 175_000, file + ": compressed initial JS exceeds 175 KB");
  assert(htmlBytes <= 260_000, file + ": HTML exceeds 260 KB");
  assert(gzipSync(html).length <= 50_000, file + ": compressed HTML exceeds 50 KB");
  if (["index.html", "en.html", "fr.html"].includes(file)) {
    for (const marker of ["automation-flow-animation", "campaign-growth-animation", "optimization-search-animation", "web-experience-animation"]) {
      assert(![...seen].some((path) => basename(path).includes(marker)), file + ": eagerly loads " + marker);
    }
  }
  reports.push({ file, rawJs, gzipJs, htmlBytes, inlineCss, stylesheets: styles.length });
}
assert(reports.length >= 28, "Missing prerendered routes");
await Bun.write(".wrangler/performance-budgets.json", JSON.stringify(reports, null, 2));
console.log("Performance budgets passed for " + reports.length + " HTML routes. Largest initial JS: " + Math.max(...reports.map((r) => r.rawJs)) + " raw / " + Math.max(...reports.map((r) => r.gzipJs)) + " gzip bytes. Report: .wrangler/performance-budgets.json");
