---
name: posh-theme-workflow
description: The safe pipeline for changing the POSH Shopify theme through the Admin API — duplicate the live theme to a draft, edit files locally, verify with Theme Check, node and PostCSS, upload to the draft only, confirm checksums, and report with a preview link. Use for any edit, audit or test of the POSH theme.
---

# POSH theme workflow

Every theme change follows these steps. Skipping one is how the live store breaks.

## 1. Find the themes

```graphql
{ themes(first: 30) { nodes { id name role updatedAt } } }
```

`role: MAIN` is live. Never write to it. `themeFilesUpsert` refuses only some cases, so the rule is yours to keep.

## 2. Make a draft

```graphql
mutation { themeDuplicate(id: "gid://shopify/OnlineStoreTheme/<MAIN id>", name: "POSH — <task> (Draft)") { newTheme { id name role } userErrors { field message } } }
```

Reuse an existing draft only when the owner said so.

## 3. Download files

Small set:

```graphql
{ t: theme(id: "gid://shopify/OnlineStoreTheme/<id>") { files(filenames: ["sections/posh-hero.liquid"]) { nodes { filename checksumMd5 body { ... on OnlineStoreThemeFileBodyText { content } } } } } }
```

Whole theme (for audits and Theme Check): page with `files(first: 200, after: <cursor>)`, alias the theme as `t`. Large results are saved to a file by the harness; write them to disk with:

```bash
python3 -I tools/dump.py <saved-result-file> <outdir> t
```

Binary assets (images) are not returned as text. Theme Check then reports them as `MissingAsset`; check the file list before treating that as real.

Checksums only (to see what changed between two themes): query `nodes { filename checksumMd5 }` for both and compare. JSON files may return normalized content whose md5 differs from `checksumMd5`; compare JSON semantically.

## 4. Edit

- Read every file involved, and the theme's `AGENTS.md`.
- Use exact string replacement and assert the match count. Never rewrite a whole shared Horizon file.
- Keep setting IDs, block IDs and template section IDs stable.
- Liquid: no literal `}` inside `{{ }}`.

## 5. Verify locally

```bash
cd tools && npm install            # once: @shopify/theme-check-node, postcss
node theme-check.mjs <theme-dir>   # full tree; writes <theme-dir>.tc.json and prints counts
node --check file.mjs              # each changed JS (copy to .mjs if it uses import/export)
node css-check.mjs <theme-dir>     # every assets/*.css and {% stylesheet %} block
```

Theme Check on a partial tree reports false `MissingTemplate`/`JSONMissingSection` errors. Run it on the full tree, or say which findings come from the partial tree. `MatchingTranslations` on locales the store does not use is not a blocker; Arabic (`ar.json`) and `en.default.json` must be complete.

Also check that POSH CSS and JS still target classes and elements that exist (Horizon updates rename things).

## 6. Upload to the draft

```graphql
mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/<draft id>", files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }
```

Then confirm each file:

```graphql
{ t: theme(id: "gid://shopify/OnlineStoreTheme/<draft id>") { files(filenames: [...]) { nodes { filename checksumMd5 } } } }
```

`checksumMd5` must equal local `md5sum`. Re-check that MAIN's `updatedAt` and the touched files' checksums did not change.

## 7. Report to the owner

In Egyptian Arabic, short:

- What changed, in plain words.
- Preview link: `https://poshkw.com/?preview_theme_id=<draft id>` (or the product URL with that query).
- What was verified, and what was not (no storefront/device access).
- What the owner should test on an iPhone: add to cart, change quantity, remove, checkout page, the changed section.
- "The live theme was not touched. Publishing is your decision."

## Store data checks (read only)

Useful when testing a release:

- Products: status, `totalInventory`, variant `availableForSale` and `inventoryPolicy`. A tracked product at 0 with `DENY` is sold out on the storefront.
- Orders since the publish time: `orders(query: "created_at:>'<ISO time>'")` with payment status and shipping line titles (24-hour shipping vs the 2-hour service).
- Collections: `sortOrder` and product order for best sellers.

Never change inventory, prices or media from this workflow.
