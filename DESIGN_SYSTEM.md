# NUBB Design System

Warm, tactile, made by hand. Flat colour fields on a Cream page, a soft display serif, mono labels, and one bright accent.
The visual reference lives on the NUBB Design canvas in Claude (Foundations, Components, Storefront home).

Tokens and component classes are in `src/app/globals.css`. Fonts are wired in `src/app/layout.tsx`.

## Colour

From the NUBB Brand Guideline (Color Guide), plus Mustard as the single accent.

| Token (Tailwind)       | Hex       | Use |
| ---------------------- | --------- | --- |
| `nubb-cream`           | `#E8E6D8` | Page ground. Text on dark fields. |
| `nubb-cream-light`     | `#F4F2EA` | Tint of Cream, not a new colour: cards, inputs, image wells, panels. |
| `nubb-brown`           | `#4D3F15` | "Dark Grey Brown": headlines, body text, dark bands, admin sidebar. |
| `nubb-dark`            | `#624A41` | "Dark": secondary text, captions. |
| `nubb-orange`          | `#892F1A` | "Something Orange": primary action, eyebrows, links, wavy rule. |
| `nubb-crimson`         | `#640017` | "Dark Crimson": hover/pressed of primary, sold out, errors. |
| `nubb-mustard`         | `#F2BF4A` | Accent only: stamp badge, Featured tag, icons on dark bands, active admin nav, brand band. |

Rough proportion: 60 Cream · 22 Brown · 10 Orange · 5 Crimson · 3 Mustard.

Text pairs that pass 4.5:1: Brown or Dark on Cream / Cream Light / Mustard; Cream on Brown, Dark, Orange or Crimson.
Avoid Orange text on Brown, and Mustard text on Cream.

Status mapping (no greens, blues or reds outside the palette):

- Error / sold out → Crimson (`bg-nubb-crimson/10 text-nubb-crimson border-nubb-crimson`)
- Warning / low stock → Orange (`bg-nubb-mustard/25 text-nubb-orange border-nubb-orange`)
- Success / in stock → Brown (`bg-nubb-brown/10 text-nubb-brown border-nubb-brown`)

Always use the tokens (`bg-nubb-brown`), never raw hex classes (`bg-[#4D3F15]`).

## Type

| Role     | Family                         | Tailwind        | Notes |
| -------- | ------------------------------ | --------------- | ----- |
| Display  | Bantayog (local, `src/app/fonts`) | `font-display` | Headlines. Weight 400 (300 available). |
| Body     | DM Sans                        | `font-body` / default | 15–18px body, 13px captions. |
| Labels   | Lekton                         | `font-lekton`   | Eyebrows, prices, badges. Uppercase, +0.1–0.14em tracking. |
| Logo     | `/brand/logo-dark-brown.svg`   | image           | Brown is the main logo colour. Never retype "NUBB" in a font. |

Scale: Display `clamp(52px, 7vw, 104px)` / H1 48 / H2 32–64 / H3 24 / Body L 18 / Body 15 / Caption 13 / Eyebrow 13 / Price 20.

Bantayog licence: Befonts, commercial use allowed.

## Shape and surface

- Radius: buttons 8px · inputs 12px · cards/panels 20px · chips and badges pill · hero image "blob" `rounded-[240px_28px_28px_120px]`.
- Flat. No drop shadows. Cards are `nubb-surface` (`nubb-cream-light` with a 1px `nubb-brown/15` hairline).
  The old `nubb-shadow*` classes have been removed.
- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.
- Touch targets ≥ 44px.

## Brand assets (`public/brand`)

- `logo-dark-brown.svg`: main logo (vector).
- `brand-mark.svg`: fingerprint mark, brown (vector). Used in the stamp, loaders, watermarks.
- `brand-mark-cream.svg`: same mark in Cream, for dark backgrounds (admin sidebar, hero fallback).

## Component classes (`globals.css`, `@layer components`)

| Class                | What |
| -------------------- | ---- |
| `nubb-eyebrow`       | Small Lekton uppercase label in Orange, above headings. |
| `nubb-btn-primary`   | Orange button, Crimson on hover/press. One per view. |
| `nubb-btn-secondary` | Brown 2px outline button, fills Brown on hover. |
| `nubb-btn-sm`        | Compact modifier for either button (44px tall). Admin toolbars and dialogs. |
| `nubb-btn-icon`      | 44px square icon-only button (close, row actions). Fills Orange on hover. |
| `nubb-input`         | Text input / select / textarea: Cream Light, 1.5px Brown line, 12px radius, Orange focus ring. |
| `nubb-label`         | Lekton uppercase form label. |
| `nubb-link`          | Uppercase underlined text link ("Shop all pieces"). |
| `nubb-chip`          | Pill filter. Active via `aria-pressed="true"` or `.is-active`. |
| `nubb-badge`         | Pill label. Pair with a bg/text token: `nubb-badge bg-nubb-crimson text-nubb-cream`. |
| `nubb-surface`       | Flat card: Cream Light, hairline, 20px radius. |
| `nubb-wave`          | Wavy rule under headlines. Colour = `currentColor` (default Orange). Set width inline. |

Patterns built in markup (see `src/app/ecom-staging/page.tsx`):

- **Stamp badge** (`src/components/store/Stamp.tsx`): Mustard circle, ring text "HANDMADE · IN DAVAO · SMALL BATCH ·", brown brand mark centred. One per page, overlapping a photo edge.
- **Trust strip**: Brown band, Mustard outline icons in 44px circles, two-line uppercase labels.
- **Product card**: `nubb-surface`, square image on a rotating Brown/Mustard/Orange backdrop, pill badges top-left, Lekton price, round Brown "+" add-to-bag button.
- **Brand band**: Mustard panel, Brown text, faint brand-mark watermark, `rounded-[0_160px_20px_20px]`.

## Status of the rollout

Done:

- Tokens, fonts, layered base/component CSS.
- Storefront: header, footer, home, product and checkout pages rebuilt to the design; order-success, cart drawer and PIN gate on tokens, `nubb-surface` and `nubb-btn-*`.
- Admin: brown sidebar with Mustard active state, header, login and all pages on tokens, fonts, `nubb-surface` cards, `nubb-btn-*` buttons, `nubb-input` fields, on-palette status colours.
- Legacy `nubb-shadow*` classes removed from markup and CSS.
- Bantayog served as WOFF2 (`src/app/fonts/*.woff2`, ~30% smaller). The `.woff` originals stay in the folder as source files.

Not touched on purpose:

- `src/app/page.tsx` (live coming-soon page) keeps its original classes and Rubik Spray Paint. It does pick up the new body font, flat shadows and radii from `globals.css`.

Next candidates:

- Order-success page: rebuild to the home page layout (it only has the token-level pass).
- Dense admin table row actions (small inline Orange buttons in the dashboard, orders and subscribers tables) are still ad-hoc; fold into a shared compact style if more appear.
