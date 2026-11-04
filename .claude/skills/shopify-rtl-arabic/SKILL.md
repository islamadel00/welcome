---
name: shopify-rtl-arabic
description: Arabic-first RTL rules for the POSH Shopify theme. Use whenever you create or review a Liquid section, block or snippet, CSS, JavaScript UI, locale string, price or number formatting, icon direction, or a screenshot check for poshkw.com.
---

# Shopify RTL Arabic

The storefront is Arabic (RTL) first, with English as a second locale.

## Direction

- `layout/theme.liquid` sets `dir="{{ request.locale.direction | default: 'ltr' }}"` on `<html>`. Never set `dir` on sections or pages.
- Mark LTR islands only where content is genuinely LTR: phone numbers, codes, URLs, SKUs. Use `dir="ltr"` on that element or `<bdi>` around inline values (Horizon already wraps prices in `<bdi>`).

## CSS

- Logical properties only: `margin-inline-start`, `padding-inline`, `inset-inline-start`, `border-inline-end`, `text-align: start`. No `left`/`right` in new rules.
- Directional icons (arrows, chevrons) flip with `:dir(ltr)` or `[dir="rtl"]` selectors; non-directional icons never flip.
- Horizontal scrollers and sliders start at the inline start. Check arrow buttons do the right thing in RTL (keyboard ArrowLeft moves forward in RTL).
- Protect layouts with `min-width: 0` and wrapping for long Arabic product names.

## Text and copy

- Runtime UI text goes in `locales/ar.json` and `locales/en.default.json` with the `t` filter. Both must have the same keys.
- Merchant-owned copy lives in section and block settings, not in code.
- Arabic copy follows the owner's tone: short, Gulf-friendly, no machine-translated phrasing.

## Numbers, prices, dates

- Prices come from Liquid `money` filters or `snippets/posh-money.liquid`. Do not rebuild money strings by hand in Liquid.
- In JavaScript, Shopify amounts are in minor units ×100. Format with `Intl.NumberFormat(document.documentElement.lang, { style: 'currency', currency })`. KWD has up to 3 decimals.
- Times shown to customers use Kuwait time (Asia/Kuwait).

## Fonts

- Use `--posh-font-body` and `--posh-font-heading`. They come from the theme settings and fall back to system fonts. Do not hard-code another font family.

## RTL QA checklist

- [ ] Page reads right to left; logos, prices and phone numbers display correctly.
- [ ] Arrows and carousels move the expected way.
- [ ] No horizontal page scroll at 390px.
- [ ] Long Arabic names wrap without breaking cards or buttons.
- [ ] Switching to English flips the layout correctly.
- [ ] Touch targets are at least 44px.
