# Suchio

Suchio is the main website for an independent digital growth and technology studio. It is a multilingual Next.js application with German, English, and French routes, localized content, service pages, and a contact flow.

## Technology

- Next.js 16 with the App Router
- Bun for package management, tests, builds, and deployment scripts
- vinext and Cloudflare Workers for the production runtime
- React 19 and TypeScript
- Tailwind CSS 4
- Motion for interface animation
- Bun's native test runner

## Development

Install the dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design system

[`DESIGN.md`](DESIGN.md) is the visual authority for every route and locale. It defines Suchio's public semantic roles, shared composition patterns, signature explanatory visuals, documented exceptions, and review criteria.

`src/styles/theme.css` owns the current token values, `src/styles/app.css` exposes them as Tailwind utilities, and shared components own recurring composition and behavior. Reuse those roles and components before adding local values or copying a pattern. When a genuinely recurring role is missing, update the token, Tailwind exposure, design authority, and relevant design-system coverage together.

After updating DM Sans, run `bun scripts/sync-fonts.mjs` to refresh the checked-in subsets, license, and font CSS.

Treat locale content, narrow reflow, keyboard focus, and reduced motion as part of the same visual change.

## Verification

CI runs the following checks in order:

```bash
bun audit
bun run lint
bun run types:workers --check
bun run validate:content
bun run test
bun run build
bun run build:vinext
bunx wrangler deploy --config wrangler.jsonc --dry-run
bun run validate:seo
bun run validate:performance
bun run validate:bundle
bun run test:e2e
```

The content validator checks home FAQ structure and locale parity. Bun tests protect service and legal content structure, stable IDs, placeholders, contact validation, localization boundaries, and design tokens.

The SEO validator inspects generated HTML, sitemap entries, robots directives, structured data, metadata, and internal links. Bundle checks cover both build outputs. Performance checks budget generated HTML, styles, and the transitive JavaScript loaded by each route.

The Chromium suite runs against both the Bun Next.js server and the local Cloudflare Worker. Focused Firefox and WebKit tests also exercise the Worker. Install all three engines with bunx playwright install chromium firefox webkit. It covers every public route, redirects, localized 404s, keyboard navigation, narrow reflow, contact delivery and recovery, draft retention, explicit language selection, JavaScript-disabled forms and disclosures, French text spacing, enlarged-text reflow, accessibility, reduced motion, failed illustration downloads, pending form edits, and retry cooldowns. Rate limiting and throttled mobile performance run against the Worker. Performance checks cover normal/reduced motion, scrolling illustrations, and contact interactions.

Build both runtimes before end-to-end checks. For TypeScript changes that do not need a production build, run `bun run typecheck`. While deferring public copy edits, run `bun scripts/validate-copy.mjs HEAD` to compare the current content with the committed version.

## Localization and content

Locales are registered in `src/i18n/config.json`. The shared `src/app/[lang]` route tree renders every configured locale.

German is served from the unprefixed route tree, English from `/en`, and French from `/fr`. Explicit default-locale URLs such as `/de/about` redirect to the canonical unprefixed URL. On Cloudflare, prerendered HTML is served as static assets; vinext handles React navigation data and its compatibility headers. The Worker distinguishes HTML and React navigation-data requests on public page routes, handles legacy redirects, and serves `/api/contact` and `/api/health`. Other assets bypass the Worker. Localized `404.html` files provide the existing translated error pages for unknown URLs.

Shared interface copy lives in `src/i18n`. FAQs live in locale-specific JSON files under `src/content`.

Keep all configured locales equivalent when you change public content, metadata, navigation, forms, or accessibility labels.

## Contact form

The contact form validates enquiries in the browser and in a shared server handler, then sends them through Resend without writing them to a website database. Copy `.env.example` to `.env.local` and add a Resend API key. Verify the domain used by `CONTACT_EMAIL_FROM` in Resend before sending enquiries to recipients outside the Resend account.

## Cloudflare deployment

Build the Cloudflare output and prepare prerendered routes, fonts, security headers, `robots.txt`, and `sitemap.xml` as static assets:

```bash
bun run build:vinext
```

For Cloudflare Workers Builds, set the build command to `bun run build:vinext` and the deploy command to `bunx wrangler deploy --config dist/server/wrangler.json`. The generated Wrangler config is required because Vinext produces the deployable Worker entry during the build.

Run the built Worker locally or deploy it:

```bash
bun run start:vinext
bun run deploy:vinext
```

The production Worker is configured in `wrangler.jsonc`. Add `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM` as Worker secrets. Canonical URLs, Open Graph metadata, `robots.txt`, and `sitemap.xml` use the production origin defined in `src/lib/site-config.ts`.

## Operations

See [`OPERATIONS.md`](OPERATIONS.md) for monitoring, contact diagnostics, deployment verification, and rollback.

## Planned work

[`BACKLOG.md`](BACKLOG.md) records validated review findings that need more evidence, deployment observation, or design work before implementation.
