# Suchio operations

## Verify a release

Run the checks in .github/workflows/ci.yml before deployment. Both browser servers use empty email credentials; successful delivery tests intercept requests locally.

After an authorized deployment, run `bun scripts/check-site.mjs`. Pass a preview origin as the first argument to check another environment. This command only reads public endpoints. A successful /api/health response confirms that all three email settings are present, not that Resend can deliver mail.

The availability workflow runs twice an hour. Enable GitHub Actions failure notifications for the responsible maintainer. Scheduled workflows start only after reaching the default branch; GitHub scheduling is not an uptime guarantee. The health check requires deployment of this release before it can pass.

Inspect localized home, contact, and missing-page routes after a release. Verify the sender domain in Resend and perform one authorized delivery check to a controlled inbox before launch.

## Diagnose contact failures

Use Cloudflare Workers logs for the suchio Worker. Search structured events by submissionId:

- contact.unconfigured: set RESEND_API_KEY, CONTACT_EMAIL_FROM, and CONTACT_EMAIL_TO as Worker secrets.
- contact.rejected: inspect the provider status and Resend account for authorization, sender verification, quota, or delivery problems.
- contact.failed: inspect provider availability. The server cancels provider requests after ten seconds.
- contact.rate_limit_unavailable: inspect the CONTACT_RATE_LIMITER binding.
- contact.accepted: use emailId in Resend to inspect downstream delivery. Acceptance does not prove inbox delivery.

Do not paste submitted names, addresses, or messages into logs or issue reports. The handler logs event names, request IDs, provider IDs, and status codes only.

The Worker permits ten contact attempts per IP per minute and returns 429 with Retry-After: 60 for bursts. Cloudflare rate limiting is approximate and local to each Cloudflare location. Watch legitimate failures on shared networks before changing the limit. Keep namespace 2026090501 unique within this Cloudflare account.

The browser stops waiting after fifteen seconds and keeps the existing email fallback visible. Retrying an unchanged enquiry reuses its Resend idempotency key. Provider deduplication lasts 24 hours. Drafts live only in browser memory during internal navigation; reloads, full-document navigation, or closing the tab clear them. They are not saved in cookies, local storage, session storage, URLs, or a website database.

## Roll back a faulty deployment

Open Workers & Pages, select suchio, then Deployments. Identify the last known good version from its deployment time and source revision. Roll back to that version and rerun `bun scripts/check-site.mjs` plus the affected route checks. If the old version predates /api/health, verify its existing pages and email configuration separately.

Review secret and binding changes separately: an application rollback does not reconstruct deleted external configuration. Keep the deployed source revision in release records. Do not reset the local working tree to roll back production.

## Security policy and dependencies

The Content Security Policy is report-only. Browser tests reject violations on representative routes, but the policy permits inline scripts and styles and does not collect reports centrally. It is not an enforced script-injection defense. Observe production compatibility before enforcement or adding a reporting service.

`bun audit` runs in CI. The js-yaml and nanoid overrides select patched transitive versions while upstream packages retain older constraints. Revisit them when upgrading vinext and its build tooling. Regenerate Cloudflare types with `bun run types:workers` after changing bindings; the command uses .env.example to avoid importing unrelated local environment names.

References: [Cloudflare static 404 routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
