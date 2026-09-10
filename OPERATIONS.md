# Suchio operations

## Verify a release

The deploy:vinext and deploy:redirects commands execute the Bun verification steps in .github/workflows/ci.yml before deploying. They stop on a failed check or if tracked/unignored source changes during verification, and print the verified Git revision plus a worktree content hash. Use bun scripts/deploy-verified.mjs --check-only to run the same gate without deploying. Both browser servers use empty email credentials; successful delivery tests intercept requests locally.

Cloudflare dashboard builds and direct Wrangler commands can bypass this local gate. Require the CI verify check on the deployed revision and disable competing automatic deployment paths until that account configuration is confirmed.

After an authorized deployment, run `bun scripts/check-site.mjs`. It checks every public locale/route, localized 404s, legacy redirects, canonical-host redirects on production, robots, sitemap, and contact configuration, with at most four simultaneous requests. Pass a preview origin as the first argument to check another environment. This command only reads public endpoints. A successful /api/health response confirms that all three email settings are present, not that Resend can deliver mail.

The availability workflow runs twice an hour. Enable GitHub Actions failure notifications for the responsible maintainer. Scheduled workflows start only after reaching the default branch; GitHub scheduling is not an uptime guarantee. The health check requires deployment of this release before it can pass.

Inspect localized home, contact, and missing-page routes after a release. Verify the sender domain in Resend and perform one authorized delivery check to a controlled inbox before launch.

## Diagnose contact failures

Use Cloudflare Workers logs for the suchio Worker. Search structured events by submissionId:

- contact.unconfigured: set RESEND_API_KEY, CONTACT_EMAIL_FROM, and CONTACT_EMAIL_TO as Worker secrets.
- contact.rejected: inspect the provider status and Resend account for authorization, sender verification, quota, or delivery problems.
- contact.failed: inspect provider availability. The server cancels provider requests after ten seconds.
- contact.rate_limit_unavailable: inspect the CONTACT_RATE_LIMITER binding.
- contact.accepted: use emailId in Resend to inspect downstream delivery. Acceptance does not prove inbox delivery.

Assign a responsible maintainer in the account, enable availability-workflow failure notifications, and configure provider notifications for rejected/bounced delivery. Repository health checks cannot verify inbox delivery, account notification recipients, DNS ownership, or provider retention settings. Those require account access and a controlled authorized delivery check.

Do not paste submitted names, addresses, or messages into logs or issue reports. The handler logs event names, request IDs, provider IDs, and status codes only.

The Worker permits ten contact attempts per IP per minute and returns 429 with Retry-After: 60 for bursts. Cloudflare rate limiting is approximate and local to each Cloudflare location. Watch legitimate failures on shared networks before changing the limit. Keep namespace 2026090501 unique within this Cloudflare account.

The browser locks form fields while sending, stops waiting after fifteen seconds, and keeps the existing email fallback visible. A rate-limit response disables retry for the server-specified Retry-After interval. Retrying an unchanged enquiry reuses its Resend idempotency key. Provider deduplication lasts 24 hours. Drafts live only in browser memory during internal navigation; reloads, full-document navigation, or closing the tab clear them. They are not saved in cookies, local storage, session storage, URLs, or a website database.

## Roll back a faulty deployment

Open Workers & Pages, select suchio, then Deployments. Identify the last known good version from its deployment time and source revision. Roll back to that version and rerun `bun scripts/check-site.mjs` plus the affected route checks. If the old version predates /api/health, verify its existing pages and email configuration separately.

Review secret and binding changes separately: an application rollback does not reconstruct deleted external configuration. Keep the deployed source revision in release records. Do not reset the local working tree to roll back production.

## Security policy and dependencies

The enforced Content Security Policy blocks objects and restricts base URLs, form destinations, and framing to this origin. The broader resource policy remains report-only and permits inline scripts/styles; it is not yet an enforced script-injection defense. Both policies send reports to /api/security-report. The production Worker rate-limits reports under a separate key prefix using the existing binding. The handler logs only allowlisted directive names and disposition as security.csp_violation; document URLs, blocked URLs, script samples, and report bodies are discarded.

Inspect those events after deployment before enforcing the resource policy. Tightening inline-script permissions requires build-generated hashes or a compatible runtime strategy; do not introduce reusable static nonces or force dynamic rendering solely for a nonce.

`bun audit` runs in CI. The js-yaml and nanoid overrides select patched transitive versions while upstream packages retain older constraints. Revisit them when upgrading vinext and its build tooling. Regenerate Cloudflare types with `bun run types:workers` after changing bindings; the command uses .env.example to avoid importing unrelated local environment names.

References: [Cloudflare static 404 routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

The local rate-limit test sends bodyless attempts because Wrangler 4.127.1 can terminate its development proxy after rejecting an unread POST body ([upstream issue](https://github.com/cloudflare/workers-sdk/issues/15203)). The test still verifies 429, Retry-After, and subsequent page availability; normal contact payloads are exercised separately. This workaround affects the local test stimulus only.
