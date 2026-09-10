# Suchio design authority

Suchio is the multilingual website of an independent digital growth and technology studio. Its job is to create trust, explain a broad offer clearly, and move suitable clients toward a conversation.

The experience should feel precise, capable, calm, and personal. It earns distinction through strong typography, editorial composition, useful visual explanations, and refined interaction—not through visual noise.

## 1. Purpose and priorities

When design decisions compete, protect them in this order:

1. Facts, meaning, locale parity, and a clear path to contact.
2. Accessibility, legibility, keyboard use, reflow, reduced motion, and performance.
3. The semantic roles and shared component patterns in this document.
4. A clear sequence of reader questions and answers.
5. Visual distinction that clarifies hierarchy, grouping, state, or cause and effect.

Clarity is not plainness. Create character with type, composition, pace, precise details, and purposeful illustration. Spend boldness on the few elements that express Suchio’s work; keep the surrounding interface quiet.

## 2. Responsibilities and change process

These sources own different parts of the system; they are not competing layers:

- `DESIGN.md` defines intent, public roles, usage, exceptions, and review criteria.
- `src/styles/theme.css` owns the public values and exposes them as Tailwind theme utilities.
- `src/styles/app.css` owns global stylesheet order.
- `src/styles/global.css` owns browser defaults, complex motion, pseudo-elements, and generated visual behavior.
- Shared components own recurring composition and behavior.
- Page components compose those primitives without creating a parallel visual system.

Tailwind is the default for ordinary component styling and the public design-token API. Custom CSS owns browser behavior, complex motion, pseudo-elements, and generated visuals.

Before adding a visual value:

1. Name the semantic need rather than the desired pixel value.
2. Reuse the closest token or component.
3. Decide whether a missing value belongs to page composition, reusable UI, or self-contained visual geometry.
4. Add a public semantic role only when it will recur and an existing role cannot express it.
5. Expose a new role through Tailwind, document it here, and extend relevant design-system coverage in the same change.

Tailwind Neutral and the compact `brand-*` scale are raw materials, not the ordinary editorial component API. Editorial components use semantic color roles. Scoped explanatory visuals may consume raw colors when category or data distinctions require them. `tests/design-system.spec.ts` protects the public theme, shared service identities, and removed legacy aliases. Review remains responsible for exceptions that need visual judgment.

## 3. Core system

### Typography

Load only the Latin JetBrains Mono subsets used by the configured locales. Keep DM Sans Latin and Latin Extended subsets for prose. Preload the Latin face and use optional font display to avoid moving content when a slow font arrives; a slow first visit may retain the system fallback.

Use DM Sans Variable for headings, prose, labels, navigation, and controls. Use JetBrains Mono only for code, technical identifiers, short step numbers, and tabular data. The wordmark is an optical brand exception.

Use regular weight for reading, medium for headings, and semibold for controls or short emphasis. Avoid light weights for small text and avoid weight `700` unless a control or strong inline emphasis needs it.

The hierarchy is the invariant:

`hero display > page title > section title > subsection > card title > body`

Fluid roles use continuous `clamp()` formulas in `rem`; their ranges must not cross or jump at breakpoints.

| Role | Utility | Size / line height | Weight | Use |
|---|---|---:|---:|---|
| Hero display | `text-display-lg` | 44–72px / 1.02 | 500 | Homepage `h1` only |
| Page title | `text-display-sm` | 40–60px / 1.04 | 500 | Standard editorial `h1`; final conversion statement |
| Service title | `text-display-service` | 40–52px / 1.06 | 500 | Service `h1` beside an explanatory visual |
| Section title | `text-heading-lg` | 32–40px / 1.08 | 500 | Main `h2`, normally through `SectionHeading` |
| Subsection title | `text-heading-md` | 24px / 1.2 | 500 | Real nested section or service title |
| Card title | `text-heading-sm` | 20px / 1.25 | 500 | Peer card, FAQ question, short feature title |
| Lead | `text-lead` | 17–20px / 1.5 | 400 | One short orientation passage below an `h1` |
| Large body | `text-lg/7` | 18px / 28px | 400 | Section intro, CTA support, or short emphasized prose |
| Body | `text-base/6` | 16px / 24px | 400 | Default reading copy |
| UI copy | `text-ui` | 15px / 1.5 | 400 | Dense card or scoped-list copy; add `font-semibold` for controls |
| Small / navigation | `text-sm` | 14px / 20px | 400 | Helper text and compact descriptions; add `font-medium` for navigation |
| Metadata | `text-meta` | 13px / 1.5 | 400 | Subordinate context and compact numeric markers |
| Label | `text-xs/4 font-medium tracking-widest` | 12px / 16px | 500 | Very short eyebrow or status; uppercase is allowed here only |

Each page has one descriptive `h1`. The homepage uses `text-display-lg`, service pages use `text-display-service`, and other page titles use `text-display-sm`. Equivalent peers use the same role, weight, tracking, color, and line height. Never shrink one translated string to make it fit.

Reading prose uses `max-w-reading` (68ch); narrow introductions use `max-w-narrow` (54ch); hero statements stay around 18–20ch. Balance headings and short ledes, use pretty wrapping for prose, and keep running text left aligned. Rewrite or adjust measure before reducing a semantic type role.

### Color

| Role | Utility / token | Current value | Use |
|---|---|---:|---|
| Canvas | `bg-canvas` | `#FAF9F6` | Default page field |
| Primary surface | `bg-surface`, `bg-white` | `#FFFFFF` | Cards, controls, raised content |
| Secondary surface | `bg-surface-subtle` | Tailwind `neutral-50` | Quiet input or grouped background |
| Inverse surface | `bg-inverse-surface` | `#101010` | Dark controls and navigation surfaces |
| Strong inverse field | `bg-black` | `#000000` | Footer and final CTA band |
| Primary text | `text-ink` | Tailwind `neutral-900` | Headings and important text |
| Secondary text | `text-muted` | Tailwind `neutral-600` | Body copy and supporting explanation |
| Tertiary text | `text-subtle` | Tailwind `neutral-500` | Compact metadata, placeholders, secondary icons |
| Inverse text | `text-inverse`, `text-white` | `#FFFFFF` | Primary text on dark fields |
| Inverse secondary | `text-inverse-muted` | Tailwind `neutral-400` | Supporting text on dark fields |
| Interactive text | `text-accent` | `brand-600` / `hsl(212 100% 41%)` | Links and text actions on light surfaces |
| Focus | `outline-focus` | `brand-500` / `hsl(212 100% 48%)` | Visible keyboard focus |
| Error | `text-error`, `outline-error` | `#B42318` | Error copy and invalid state |
| Hero highlight | `bg-highlight` / `--color-highlight` | `#FFF500` | Homepage headline mark only |

Establish hierarchy with typography and space before color. Use semantic roles for editorial text, generic surfaces, forms, and navigation. Never communicate state with color alone.

Service illustrations, service identifiers, process markers, and offer animations may use scoped primitive or local palette values when semantic UI colors would erase useful category distinctions. Keep these exceptions within the service visual or generated explanation; do not turn them into general body-copy, form, or navigation colors.

The four service identities use shared background and foreground pairs: `service-websites-*`, `service-search-*`, `service-campaigns-*`, and `service-automation-*`. Header navigation, contact selection, and related-service links consume these roles. The six-color service scope grid is a separate positional palette and remains local to that generated explanation.

Do not add decorative gradients. Continuous data scales are the exception.

### Spacing and layout

Ordinary spacing follows a 4px rhythm. Common milestones are `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`; intermediate 4px multiples are allowed when a local relationship genuinely needs them. Two-pixel half-steps are limited to borders, compact icon/control alignment, and self-contained illustration geometry—not page layout.

Use numbered utilities for local component relationships and semantic utilities for recurring page rhythm:

| Role | Utility | Range | Use |
|---|---|---:|---|
| Page gutter | `px-page` | 24px baseline; narrow inset capped at 7.5vw | Shared inset for header, sections, and footer |
| Page-title start | `pt-page-title` | 104px narrow; 128–160px wide | Clears the floating header |
| Section turn | `py-section` | 64–96px | Major reader-question boundary |
| Compact section turn | `py-section-compact` | 48–64px | Related supporting section |
| Heading exit | `mb-heading-gap` | 32–48px | `SectionHeading` to section content |
| Split-layout gap | `gap-split` | 40–96px | Unequal editorial and visual columns |
| Peer-grid gap | `gap-grid` | 24–64px | Reflowing peer columns or steps |
| Repeated composition turn | `mb-content-stack` | 80–112px | Major repeated offer rows |
| Standard card inset | `p-card-padding` | 24px baseline, capped at 7.5vw | Ordinary content card |
| Fluid card inset | `p-card-fluid` | 24–40px | Large or featured card |
| Overlay gutter | `px-menu` | 24–80px | Full-screen menu only |

Page and standard-card insets stop growing with text size on narrow screens. Form choices and CTA icons wrap when enlarged labels need the full row; avoid squeezing words into single-character columns.

Every gap has one owner:

- A section owns its outer padding.
- A parent gap owns spacing between true peers.
- A component owns spacing between its internal parts.
- Margins describe a deliberate relationship between unlike adjacent objects.
- Do not stack section-sized roles or give parent and child competing spacing.

Compact cards use `p-5`, standard cards use `p-card-padding`, and featured cards use `p-card-fluid`. Illustration shells may use local padding because it defines their coordinate field.

The content field is at most `75rem` / 1200px. Page gutters expand to center it. Reading prose normally occupies no more than six or seven desktop columns. Give text-bearing flex and grid children `min-w-0`.

Breakpoints describe content behavior and use named Tailwind variants: `narrow` at 600px, `compact` at 800px, `nav` at 900px, and `wide` at 1160px. Prefer `max-narrow`, `max-compact`, `max-nav`, and `max-wide` over repeated arbitrary viewport values. Self-contained explanatory visuals may keep local geometry breakpoints. Reflow, stack, or rebalance before shrinking type. Never hide overflow to conceal a layout defect.

### Shape, boundaries, and elevation

| Radius role | Utility | Value | Use |
|---|---|---:|---|
| Inset | `rounded-inset` | 8px | Element nested in a padded shell |
| Control | `rounded-control` | 12px | Inputs, buttons, compact control surfaces |
| Card | `rounded-card` | 12px | Content and illustration cards |
| Shell | `rounded-shell` | 16px | Large menu, form, or grouped container |
| Pill | `rounded-pill` | 999px | CTA capsules and truly pill-shaped controls |

| Boundary role | Utility | Use |
|---|---|---|
| Subtle separator | `border-line` / `bg-line` | FAQ rows and quiet dividers |
| Strong separator | `border-line-strong` / `bg-line-strong` | Segmented grids and process rules |
| Inverse separator | `border-inverse-line` | Dividers on dark fields |
| Quiet surface | `shadow-surface` | Static rounded surface boundary |
| Interactive surface | `shadow-surface-hover` | Hover or focus elevation |
| Floating surface | `shadow-floating` | Menus and popovers only |
| Dark surface | `shadow-dark-surface`, `shadow-dark-surface-hover` | Controls on dark fields |
| Featured accent | `shadow-accent-surface` | Blue featured service card only |

Use borders for rules and segmented geometry; use one-pixel shadow boundaries for rounded containers. A component gets one boundary mechanism unless a border constructs internal geometry. Prefer space and surface contrast before adding boundaries, and do not wrap every section in a card.

## 4. Components and composition

Reuse these patterns before creating a variation:

- `EditorialHero`: about, contact, and other editorial introductions.
- `Disclosure`: native `details` and `summary` own FAQ and offer expansion. Preserve keyboard activation and readable answers without JavaScript; use shared heading, separator, and focus roles.
- `SectionHeading`: main section title with optional intro; left by default, centered for short peer grids or FAQs.
- `CtaButton`: primary and secondary conversion links. Labels wrap within the available width; their duplicate animated label shares the same grid cell and moves by its full height. Never lock conversion labels to a single line.
- `FinalCta`: the generic shared final conversion band. Service-specific final sections use the same roles and may remain page-owned while their copy contract differs.
- `Faq`: disclosure behavior and question typography.
- `Reveal`: standard viewport reveal behavior.

If another page needs the same structural variation, extend the shared component instead of copying its class list.

Page openings use one of three patterns:

1. Homepage: centered `text-display-lg`, one lead, and one primary CTA.
2. Editorial: `EditorialHero` with `text-display-sm`, one lead, and no competing visual.
3. Service: split title and explanatory visual with `text-display-service`, one lead, and one service-specific CTA.

Do not invent another hero because a translation is longer. Adjust copy and measure within the matching pattern.

A section should answer a new reader question and have one dominant object or relationship. True peers may share a row; unequal ideas should not be forced into equal cards. Use a surface only for interaction, selection, contrast, or grouping that spacing cannot communicate. Vary composition when content relationships change rather than repeating centered headings and identical card grids.

## 5. Signature visuals and interaction

Suchio makes invisible digital systems visible. Its signature is the bespoke explanatory visual: interfaces, searches, flows, and growth systems reduced to calm, legible sequences that reveal cause and effect. These visuals should feel like working models of the studio’s thinking, not decorative technology imagery.

Use that signature selectively. One substantial explanatory moment is more characteristic than scattered effects. Keep surrounding typography and surfaces disciplined so the visual has room to matter.

Offer animations may use local type sizes, colors, timing, and geometry when the editorial system would make the miniature interface unreadable. Keep those exceptions inside `src/components/offer-animations`, responsive, decorative, and outside the page reading order with `aria-hidden` where appropriate. Functional process geometry may use similarly scoped values.

Use Lucide at the established 1.7–2 stroke range. Icons clarify an action, concept, or process; do not mix icon libraries or add icon tiles merely to occupy space.

Default to stillness. Motion should explain state, continuity, process, or confirmation:

- Native FAQ and service disclosures enhance to interruptible 240ms height animations, including grouped closing. Reduced motion toggles immediately; without JavaScript native details remain usable.
- Direct control feedback: 150–250ms.
- Standard reveal: 420ms with `var(--ease-out)`.
- Longer illustrative sequences are allowed when their sequence communicates cause and effect.
- Animate transform and opacity where possible and list transitioned properties explicitly.
- The automation demonstration runs once per mount and completes within five seconds. Reduced motion shows its settled state.
- Motion must be interruptible, must not gate content, and needs a complete reduced-motion state.
- Offer visuals retain inline static geometry before loading and when their isolated error boundary catches a failed chunk. Decorative failures never replace page content.
- Use `IntersectionObserver` for viewport entry rather than an unthrottled scroll handler.

Interactive elements need the states their behavior can enter: default, hover where available, active, `:focus-visible`, disabled or loading, error, and selected/current. Use buttons for actions and links for navigation. Keep targets at least 44px where practical and never require hover to reveal essential information.

## 6. Content, locales, accessibility, and reflow

German, English, and French are one product experience. Keep routes, section order, heading hierarchy, CTAs, metadata, forms, disclosures, and accessible labels equivalent. Preserve intent and tone rather than translating mechanically, and test the longest real translation. Never reduce a locale’s type size or truncate marketing copy to repair wrapping.

Use sentence case, active voice, and plain verbs. Labels label; examples demonstrate. Avoid filler, generic claims, all-caps prose, and unsupported outcomes. Do not invent clients, testimonials, relationships, figures, or performance claims. Use `Intl.*` and tabular numerals where locale-sensitive or aligned data requires them.

WCAG 2.2 AA is the baseline:

- Normal text meets 4.5:1 contrast; large text and essential UI boundaries meet 3:1.
- Text survives 200% zoom, and the layout reflows at 320 CSS pixels without page-level horizontal scrolling.
- User text-spacing overrides do not clip, overlap, or hide content.
- Pages use ordered headings, landmarks, one `h1`, a skip link, visible focus, native controls, accessible names, and text alternatives.
- Errors are visible, specific, and actionable.
- Contact fields lock during submission, retries respect server cooldowns, and the budget listbox restores selected focus with one Tab stop and type-ahead.
- The regular header is present in server HTML. A noscript-only native disclosure provides navigation when JavaScript is disabled, without flashing a fallback during language changes.
- A usable path remains when animation or enhanced interaction is unavailable wherever the feature permits it.

Responsive, keyboard, reduced-motion, content, and locale behavior are one acceptance criterion, not separate polish passes.

## 7. Verification

These are product acceptance criteria, not a requirement to rerun every check after every change. Automate stable invariants, inspect visual judgment on the affected surfaces, and match verification to the scope of the change. Run the full locale, reflow, zoom, keyboard, reduced-motion, and contact-flow matrix before launch or a major release.

Before handoff, verify the changed behavior in the longest relevant locale and in the states the change can affect. Use the CI workflow as the baseline and add targeted checks where the change carries more risk.

Confirm that:

- Heading order, type roles, measures, and peer hierarchy remain coherent.
- Semantic colors, spacing, radii, boundaries, and shared components are used where their roles apply.
- The primary next action is obvious and every claim is supported.
- Text and UI contrast meet the documented thresholds.
- Layout survives narrow reflow, 200% zoom, and text-spacing overrides without clipping or hidden overflow. Check meaningful element bounds as well as document width; clipped descendants can escape document-width checks.
- Interactive states, errors, accessible names, and reduced-motion alternatives work.
- Any local visual exception is scoped, purposeful, and inaccessible to the editorial design API.

This system draws on [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [U.S. Web Design System typography](https://designsystem.digital.gov/components/typography/), [GOV.UK typography and spacing](https://design-system.service.gov.uk/styles/type-scale/), and the [Design Tokens Community Group](https://www.designtokens.org/). They are inputs, not templates; Suchio’s values are tuned for its multilingual copy, DM Sans, explanatory visuals, and 1200px editorial field.
