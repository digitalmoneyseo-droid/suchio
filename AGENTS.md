# Project instructions

## Product and scope

- Suchio is the multilingual website of an independent digital growth and technology studio. It should build trust, explain the offer clearly, and move suitable clients toward a conversation.
- Treat questions as requests for information. Change files or external state only when the user asks for a change.
- Keep routes, content structure, metadata, navigation, forms, accessibility labels, and disclosures equivalent across all configured locales. Preserve meaning and tone rather than translating mechanically.
- Do not invent clients, testimonials, results, performance claims, or commercial numbers. Give commercial claims a verifiable source.
- Prefer clarity, credibility, accessibility, responsiveness, and speed over visual novelty.

## Stack and architecture

- Use Bun for package management, tests, development, builds, and deployment commands. Production runs on Cloudflare Workers through vinext and Wrangler; run Next.js verification through Bun rather than introducing a Node-only production path.
- Use Next.js with the App Router, strict TypeScript, and Tailwind CSS. Avoid `any`; define accurate types or narrow `unknown`.
- Prefer Server Components and static rendering. Add Client Components only when browser-side interactivity requires them.
- Keep architecture local and simple until another service or abstraction is demonstrably needed.
- Do not allow interactive failures to remain silent.

## Interface work

- Read and follow `DESIGN.md` before planning, implementing, or reviewing interface work.
- Treat `DESIGN.md` as the authority for visual intent and public roles, token CSS as the authority for current values, the Tailwind theme as the utility layer, and shared components as the owner of recurring composition.
- Reuse semantic roles and shared components before adding values or copying compositions. When a new recurring role is necessary, add the token, expose it through Tailwind, document it in `DESIGN.md`, and extend relevant coverage in the same change.
- Use Tailwind for ordinary component styling. Reserve custom CSS for tokens, complex motion, pseudo-elements, browser behavior, and generated visuals.
- Motion should explain hierarchy, state, or cause and effect. Preserve a usable path when motion or enhanced interaction is unavailable.
- Maintain keyboard access, visible focus, narrow-screen reflow, reduced-motion behavior, performance, and content clarity in every locale.

## Verification

- Match verification to the change's risk and scope. Use `.github/workflows/ci.yml` as the source of truth for required CI checks.
- For TypeScript changes, run `bun run typecheck` unless the change already warrants `bun run build`.
- `bun run validate:content` checks home FAQ structure and locale parity. Verify other localized content across every configured locale.
- Run `bun run build`, `bun run build:vinext`, then `bun run test:e2e` for navigation, forms, route creation or canonicalization, runtime behavior, and deployment preparation. The browser suite starts both built runtimes. Copy changes need browser verification only when they may affect layout or interaction.
- For layout changes, inspect the affected route in the longest relevant locale at the viewport being changed. Include a narrow viewport whenever reflow may be affected.
- For motion changes, verify both normal and reduced-motion behavior on the affected visual.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
