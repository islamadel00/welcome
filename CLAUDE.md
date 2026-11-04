# POSH Shopify theme

POSH (شماغ بوش) sells shemaghs in Kuwait. Storefront: poshkw.com. Shopify admin: `rhv0af-mn.myshopify.com`. The theme is Shopify Horizon with custom `posh-*` sections, snippets and assets. The UI is Arabic, right to left, with English as a second locale.

This repo holds the agent team, skills and tools for working on that theme. The theme itself lives on Shopify, not here. Theme files are read and written through the Shopify Admin GraphQL API (the Shopify MCP connector).

## Hard rules (the owner set these; they win over everything else)

- **Never publish a theme.** Publishing is the owner's decision. Never call `themePublish`.
- **Never edit the live (MAIN) theme.** Duplicate it to a draft with `themeDuplicate`, edit the draft, and give the owner a preview link: `https://poshkw.com/?preview_theme_id=<draft id>`.
- Never change checkout fields with CSS or JavaScript. Never hide required checkout fields (`display:none`) or send fake data.
- Never edit the Meta or TikTok pixel by hand while the official app is connected.
- Never change product media, prices or inventory without the owner's explicit approval. Report the problem instead.
- Never delete images from the Shopify admin.
- Never upload an old full theme (for example `release-theme-update`) on top of a theme. Change only the files the task needs.
- Never replace a shared Horizon file wholesale without reviewing the diff. Preserve the design system and its tokens.

## Brand and UI rules

- Use the POSH tokens from `snippets/posh-design-tokens.liquid`: `--posh-color-brand` (burgundy `#7b0f2b`), `--posh-color-brand-strong`, `--posh-color-accent` (gold `#c39a4b`), `--posh-color-surface` (cream `#f8f5ec`), `--posh-color-surface-raised`, `--posh-color-ink`, `--posh-color-muted`, `--posh-color-line`, plus the `--posh-space-*`, `--posh-radius-*`, `--posh-shadow-*`, `--posh-duration-*` and `--posh-ease` tokens. No raw hex in new component CSS.
- Touch targets are at least 44px.
- Respect `prefers-reduced-motion`.
- Responsive images with `srcset`/`widths` and `sizes`. Only the first, above-the-fold image gets `fetchpriority="high"`; everything else is lazy.
- Mobile first. Test 390px and 1440px widths. The owner judges the site on an iPhone.
- In the cart, remove a line only after Shopify confirms the change (no optimistic removal before the response).
- Follow the `shopify-rtl-arabic` skill for direction, logical CSS and number/currency formatting.

## Business facts that the UI must keep

- "شماغك جاهز" is a separate service product (template `product.service`): the shemagh arrives ironed and ready **within 2 hours** inside Kuwait, delivery fee 2 KWD. Keep its message separate from regular shipping.
- Regular shipping inside Kuwait is **24 hours**.
- Best sellers order (collection `الاكثر-مبيعا`, manual sort): كلاسيك أبيض، مودرن أحمر، مودرن أبيض، دبليو أبيض.
- Shop the Look on the homepage: the coffee photo is مودرن أحمر, the next one is دبليو أحمر.
- Products: كلاسيك / مودرن / دبليو, each in أحمر and أبيض, sizes 55/58/60; غترة بوش; بكج بوش (bundle template `product.bundle`).
- Deema instalments go through a WhatsApp request (`snippets/posh-deema-request.liquid`, `assets/posh-deema.js`), phone 96565896638.

## How work is done

Follow the `posh-theme-workflow` skill for every theme change. In short:

1. Find the current MAIN theme. Duplicate it to a named draft (`POSH — <task> (Draft)`).
2. Download only the files you need. For a full audit, download the whole theme (large query results are saved to a file; write them to disk with `tools/dump.py`).
3. Edit locally with exact replacements. Read every file involved, including the theme's own `AGENTS.md`.
4. Verify: Theme Check on the full tree (`tools/theme-check.mjs`), `node --check` on changed JavaScript, PostCSS parse on changed CSS and `{% stylesheet %}` blocks, JSON parse on templates.
5. Upload with `themeFilesUpsert` to the draft only. Confirm every file's `checksumMd5` equals the local `md5sum`.
6. Confirm the live theme was not touched. Give the owner the preview link and the list of files changed.
7. Say plainly what could not be verified (for example no storefront or device access) and what the owner must check on a real iPhone.

## Agent team

Project agents live in `.claude/agents/`. The main session is the orchestrator: it splits work, runs agents in parallel when tasks are independent, and reviews their output before anything reaches the owner. Subagents never publish, never upsert to the live theme, and report instead of guessing.

- `design/`: brand-guardian, ui-designer, ux-architect, i18n-engineer (RTL and Arabic), ui-finish-gate-reviewer
- `engineering/`: frontend-developer
- `qa/`: accessibility-auditor, evidence-collector
- `delivery/`: reality-checker (final gate: defaults to NEEDS WORK)
- `ecc/`: planner, code-reviewer, silent-failure-hunter
- `product/`: tracking-measurement-specialist (pixels, conversions), ad-creative-strategist, ux-researcher

Agents are callable by name only in sessions started after this repo is attached. Otherwise run a general-purpose subagent that first reads the persona file.

## Skills

- `posh-theme-workflow` (ours): the safe draft → verify → upload → report pipeline.
- `shopify-rtl-arabic` (ours): Arabic RTL rules for Liquid and CSS.
- `web-design-guidelines`, `design-system`, `frontend-design-direction`: design review.
- `webapp-testing`, `playwright-cli`: browser checks (only when the storefront is reachable from the environment).
- `production-audit`, `verification-loop`: pre-release checks. For this theme, "build/type/lint/test" means Theme Check, `node --check`, PostCSS and JSON parsing.

## Environment notes

- The cloud environment's network may block `poshkw.com` and `cdn.shopify.com`. If so, there is no browser preview; say so and ask the owner to test, or to allow those hosts in the environment's network settings.
- Liquid gotcha: a literal `}` inside `{{ }}` (for example `'{name}'`) breaks parsing. Use another token such as `[name]`.

## Conventions

- Talk to the owner in Egyptian Arabic, short and non-technical. Documents and code comments match the surrounding file.
- Never put secrets or tokens in this repo.
