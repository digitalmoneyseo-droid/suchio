import { createHash } from "node:crypto";

if (process.argv.slice(2).some(argument => argument !== "--redirects" && argument !== "--check-only")) throw new Error("Unknown release option; use --check-only and/or --redirects.");

async function output(command) {
  const child = Bun.spawn(command, { stdout: "pipe", stderr: "inherit" });
  const value = await new Response(child.stdout).text();
  if (await child.exited !== 0) throw new Error(`${command[0]} failed`);
  return value;
}

async function sourceFingerprint() {
  const paths = [...new Set((await output(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"])).split("\0").filter(Boolean))].sort();
  const hash = createHash("sha256");
  for (const path of paths) {
    hash.update(path).update("\0");
    const file = Bun.file(path);
    hash.update(await file.exists() ? new Uint8Array(await file.arrayBuffer()) : "<deleted>");
  }
  return hash.digest("hex");
}

const before = await sourceFingerprint();
const revision = (await output(["git", "rev-parse", "HEAD"])).trim();
// CI remains the source of truth: these scalar steps are executed without a shell.
const workflow = await Bun.file(".github/workflows/ci.yml").text();
const commands = [...workflow.matchAll(/^\s+- run: (.+)$/gm)].map(match => match[1].trim().split(/\s+/));
if (!commands.length || commands.some(command => command[0] !== "bun" && command[0] !== "bunx" || command.some(argument => !/^[\w./:=@-]+$/.test(argument)))) throw new Error("CI steps require review before deployment: expected simple Bun commands.");
for (const command of commands) {
  const args = process.platform === "win32" ? command.filter(argument => argument !== "--with-deps") : command;
  console.log(`Verifying: ${args.join(" ")}`);
  const child = Bun.spawn(args, { stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  if (await child.exited !== 0) throw new Error("Release verification failed; deployment stopped.");
}
if (before !== await sourceFingerprint() || revision !== (await output(["git", "rev-parse", "HEAD"])).trim()) throw new Error("Source changed during verification; deployment stopped. Run verification again.");
const config = process.argv.includes("--redirects") ? "wrangler.redirects.jsonc" : "dist/server/wrangler.json";
console.log(`Verified source: ${revision}; worktree SHA-256: ${before}`);
if (!process.argv.includes("--check-only")) {
  const deployment = Bun.spawn(["bunx", "wrangler", "deploy", "--config", config], { stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  process.exitCode = await deployment.exited;
}
