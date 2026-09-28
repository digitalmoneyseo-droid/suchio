# Suchio

The German, English, and French website for Suchio, an independent digital growth and technology studio. Built with React, the Next.js App Router, TypeScript, and Tailwind CSS. Production runs on Cloudflare Workers through vinext.

## Local development

Use Bun 1.4.0, as pinned in `package.json` and CI.

```sh
bun ci
bun run dev
```

The Next.js development server runs at `http://localhost:3000`. For the vinext development server, use `bun run dev:vinext` (port 3001).

For local Next.js contact delivery, copy `.env.example` to `.env.local` and supply `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM`. Use a sender configured in Resend. These values are also required as production Worker bindings for contact delivery; `.env.local` does not configure production.

## Builds and checks

The project maintains two runtime paths:

| Runtime | Build | Run the built app locally |
| --- | --- | --- |
| Next.js | `bun run build` | `bun run start` |
| Cloudflare Workers through vinext | `bun run build:vinext` | `bun run start:vinext` |

Common checks are `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run validate:content`. The complete verification sequence lives in [.github/workflows/ci.yml](.github/workflows/ci.yml).

Browser tests require both builds and Playwright browsers:

```sh
bunx playwright install chromium firefox webkit
bun run build
bun run build:vinext
bun run test:e2e
```

On Linux, browser installation may also require Playwright's `--with-deps` option, as used in CI. The suite starts Next.js on port 3100 and a local Worker on port 3101, with mail credentials cleared. Chromium covers both runtimes; the cross-browser suite also runs Firefox and WebKit against the Worker. See [playwright.config.ts](playwright.config.ts).

## Deployment

With Cloudflare credentials and production mail bindings configured, deploy the site using:

```sh
bun run deploy:vinext
```

Use `bun run deploy:redirects` for the separate domain-redirect Worker. Both commands run the CI verification sequence first and stop if checks fail or the source changes during verification. Worker configuration lives in [wrangler.jsonc](wrangler.jsonc) and [wrangler.redirects.jsonc](wrangler.redirects.jsonc).

To run the release verification without publishing:

```sh
bun run deploy:vinext --check-only
```

## Editing the site

### Audit measurement and administration

The production Worker serves `/admin/audits` with a built-in login for `contact@suchio.net`. No Cloudflare Access subscription or additional identity provider is used. Only a SHA-256 digest of a generated 256-bit password is provisioned as a Worker secret. Human-chosen low-entropy passwords are not supported by this verifier. The session is an opaque random token in a Secure, HttpOnly, SameSite=Strict cookie; D1 stores only its hash and the allowed identity. Sessions expire after one hour, logout revokes them server-side, and password rotation invalidates previous sessions. Login attempts are rate-limited; mutation endpoints require same-origin POSTs. Missing configuration fails closed. The Next.js server does not implement these Worker-only endpoints.

Provision the credential with `bun scripts/setup-audit-admin.mjs`. It writes the login details only to ignored `.wrangler/audit-admin-login.txt` and provisions the password digest via Wrangler. Store the password in a password manager and remove this local plaintext file afterward. Use `--resume` if provisioning failed or `--rotate` for a new password. Never copy the test credential from `tests/fixtures/worker.vars` into production. No paid plan should be activated for this feature; it uses the existing Worker and D1 resources within their applicable quotas.

The EU-jurisdiction D1 database is bound as `AUDIT_DB`; schema files live in `migrations/audit-visits`. Apply locally with `bunx wrangler d1 migrations apply AUDIT_DB --local`, and to production with `bunx wrangler d1 migrations apply AUDIT_DB --remote` before deployment. Deploy through the verification command above. Then check logged-out denial, login, logout and session replay denial, link checks, a consent followed by withdrawal, and the scheduled cleanup. Never describe configuration alone as a successful live login.

The dashboard shows **confirmed visits**, not unique readers or complete traffic. Declining leaves the full report accessible. Per-report receipts prevent duplicate submissions; no automatic recount occurs on reload. Preview links use `?audit_preview=1`. The separate link check verifies the published HTML's report marker, not rendering or form delivery. Records expire after 30 days and an hourly cron purges them. At campaign closure or report-wide withdrawal, use **Messdaten löschen** for each affected report; campaign closure is a manual operation. Before reusing restored backups, run the expiry purge and reapply any intervening deletions. Provider backups and security logs have separate retention rules. Preserve the versioned consent text while records referring to it exist.

Focused verification: `bun test tests/audit-measurement.spec.ts` and, after both builds, `bunx playwright test e2e/audit-consent.spec.ts e2e/audits.spec.ts`. Production credentials must never be replaced with test credentials to make an end-to-end test pass.

- Routes and API endpoints: `src/app`; production Worker entry point: `src/cloudflare-worker.ts`.
- Shared UI and page compositions: `src/components`.
- Localized copy and locale configuration: `src/i18n`; FAQ and audit data: `src/content`.
- Design tokens and global styles: `src/styles`.
- Unit and architecture checks: `tests`; browser checks: `e2e`.

German is the default locale. Locale configuration is defined in [src/i18n/config.json](src/i18n/config.json).
