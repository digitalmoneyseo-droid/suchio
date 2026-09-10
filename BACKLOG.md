# Suchio follow-up work

## Public copy, deferred at the owner's request

- Review commercial claims, including the campaign demonstration's numbers and the illustrated Suchio search ranking. Source claims or clearly label illustrations. Do not invent customer results.
- Review all three locales for positioning, service specificity, clarity, calls to action, search intent, and answer-engine usefulness. Preserve equivalent meaning and structure.
- Write distinct localized recovery messages for rate limits, validation, unavailable delivery, and timeouts. Stable API codes and cooldown handling are implemented; existing public messages remain unchanged.
- Review contact expectations and the privacy disclosure near submission together with the privacy policy. Confirm the actual controller, processors, retention practices, and international transfers before changing legal text.
- Add case studies, credentials, testimonials, or additional social profiles only when the owner provides verified facts. Organization structured data already uses the published contact details; keep it aligned with legal content.
- Review titles, descriptions, internal-link wording, and FAQ answers as part of the copy pass. Keep sitemap modification dates tied to real content changes.

## Account and release follow-up

- Deploy the reviewed technical changes, verify Resend sender configuration, and run the post-release checks in OPERATIONS.md.
- Enable failure notifications for the availability workflow and assign a responsible maintainer.
- Observe the rate limiter on real traffic, particularly shared networks. Inspect contact delivery in Resend.
- Review sanitized security.csp_violation events after deployment. Object, base-URL, form-destination, and framing restrictions are enforced; observe the broader report-only policy before enforcing resource/script restrictions. Inline-script hashes need validation against static HTML and client navigation in both runtimes.
- Confirm production DNS, canonical-host redirects, Search Console ownership and indexing, and account-level security settings. Repository checks cannot prove external account state.
- Collect real-user performance data before making claims about production Core Web Vitals. Local throttled Chromium measurements are lab checks.

## Revisit only with evidence

- Share duplicated process markup if changes begin drifting across home and service pages.
- Split service copy by locale if editing volume or another locale makes the current organization difficult.
- Reassess the scroll-progress implementation if profiling identifies a material cost or browser support changes.
