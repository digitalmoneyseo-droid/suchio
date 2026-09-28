import { randomBytes, createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Only generated 256-bit credentials are supported. Never log the password or hash.
const file = resolve(".wrangler/audit-admin-login.txt");
const resume = process.argv.includes("--resume");
const rotate = process.argv.includes("--rotate");
if (existsSync(file) && !resume && !rotate) throw new Error("Credentials already exist. Use --resume to retry provisioning or --rotate to replace them.");
const password = resume ? readFileSync(file, "utf8").match(/^Passwort: ([a-f0-9]{64})$/m)?.[1] : randomBytes(32).toString("hex");
if (!password) throw new Error("No valid generated credential to resume.");
if (!resume) {
  mkdirSync(resolve(".wrangler"), { recursive: true });
  writeFileSync(file, `Suchio Audit-Auswertung\nAdresse: https://suchio.net/admin/audits\nE-Mail: contact@suchio.net\nPasswort: ${password}\n\nIm Passwortmanager speichern. Diese lokale Datei danach entfernen.\nNicht teilen, nicht committen. Eine Passwortrotation beendet alle bisherigen Sitzungen.\n`, { mode: 0o600, flag: rotate ? "w" : "wx" });
}
const hash = createHash("sha256").update(password).digest("hex");
const result = spawnSync(process.execPath, ["x", "wrangler", "secret", "put", "AUDIT_ADMIN_PASSWORD_HASH"], { input: `${hash}\n`, encoding: "utf8", windowsHide: true });
if (result.status !== 0) throw new Error(`Provisioning failed. Credentials remain in ${file}; retry with --resume. ${result.stderr ?? ""}`);
console.log(`Admin credential provisioned. Local login file: ${file}`);
