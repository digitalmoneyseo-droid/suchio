# Suchio

Astro generates the multilingual public pages and metadata. Cloudflare Workers handle redirects, APIs, audit administration, and scheduled D1 cleanup. React islands own the existing interactive controls and Motion illustrations.

- Use Bun 1.4.0. The commands in package.json and .github/workflows/ci.yml are the current development, build, and verification paths.
- Preserve the public URLs, locale preference behavior, contact drafts, audit consent, accessibility, and existing visuals and animations during refactors.
- Keep localization and audit data out of browser bundles except for the props an interactive component needs.
- Consult current Astro/Cloudflare documentation and the installed adapter before changing framework or runtime integration. Wrangler configuration is in wrangler.jsonc; generated bindings are in src/worker-configuration.d.ts.
- Keep test mail credentials local; production secrets are Worker bindings. Use local D1 bindings for verification.
