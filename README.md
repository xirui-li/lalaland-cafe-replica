# THICK. yogurt

A responsive React + TypeScript website for **THICK.**, the yogurt brand operated by **THICK Holdings LLC**. Built with Vite, using the layout of the original La La Land homepage recreation.

**Live website:** https://xirui-li.github.io/lalaland-cafe-replica/

## Confirmed brand and store information

- Main product: yogurt. The supplied logo reads **non-dripping strained yogurt**.
- Brand: **THICK.**; the supplied graphic wordmark retains its lowercase **thick.** lettering.
- Company: **THICK Holdings LLC**.
- One store: **1073 Wisconsin Ave NW, 1st Floor, Washington, DC 20007**.
- Hours: **every day, 11:30 AM–10:30 PM**, confirmed by the owner after correcting the pasted AM/PM values.
- Phone: **(771) 253-9358**.

`src/store.ts` holds the store details. Header, mobile, and footer links lead to the store section, Google Maps, or the telephone number.

## Media and theme requirements

**Keep the existing main hero video.** The owner explicitly requested that it stay unchanged. Preserve `public/assets/hero.mp4`, `public/assets/hero-poster.jpg`, the existing playback settings, and its blue treatment. The resource-folder advertising clips are not replacements for this video. The browser checks verify the hero video and poster checksums.

The site uses **PANTONE 2141 C**, approximated on screen as **#8BBEE8** ([color reference](https://www.colorxs.com/color/pantone-2141-c)). The palette combines this light blue with deep blue text and pale blue surfaces.

The owner explicitly chose to keep the blue filter on yogurt photography. The reversible filter in `src/ThemeFilters.tsx` follows photos into product details and search. Logo masks use the palette without changing the supplied artwork.

THICK. logos, the bowl mark, storefront photo, and yogurt photos are owner-supplied. The gallery displays all ten product photos. The seven original gallery images use lossless WebP conversion at their original dimensions. Three additional JPGs are copied unchanged and use a per-image CSS clip path around the bowl rim to hide baked-in checkerboard backgrounds. The same clipping applies to gallery, search, and detail views. `public/assets/thick-sources.json` records provenance and file hashes.

## Content scope

The yogurt gallery uses numbered photo labels, not invented menu names. Confirmed product names, descriptions, prices, availability, and an ordering URL have not yet been supplied. Visitors can view photos, search the gallery, and call the store for the current menu and prices.

The reference site's coffee catalog, shopping cart, account links, app promotion, newsletter demo, payment claims, and third-party policy links are no longer part of the interface. This site does not process orders, payments, or newsletter subscriptions. Accessibility controls support larger text, higher contrast, and reduced motion.

## Run and verify

```sh
npm install
npm run dev
```

The local development URL is normally http://localhost:5173.

```sh
npm run build
npm test
```

To verify the GitHub Pages deployment path:

```sh
SITE_BASE_PATH=/lalaland-cafe-replica/ npm run build
SITE_BASE_PATH=/lalaland-cafe-replica/ npm test
```

The checks cover retained hero assets and playback, THICK. content and links, gallery scrolling, image dialogs, yogurt search, keyboard dismissal, store information, and responsive layouts at 320, 390, 768, 1024, and 1440 pixels. Screenshots are saved in `artifacts/`. Tests use installed Google Chrome, or Playwright Chromium if Chrome is unavailable.

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys to GitHub Pages on pushes to `main`. It sets `SITE_BASE_PATH` to `/lalaland-cafe-replica/`; local development defaults to `/`. The repository slug is retained so the existing published address keeps working.

## Files

- `src/App.tsx`: page sections, gallery, search, and accessibility interactions.
- `src/catalog.json`: owner-supplied yogurt photography and descriptive alternative text.
- `src/store.ts`: confirmed store and company information.
- `src/styles.css`, `src/ThemeFilters.tsx`: responsive styles and blue media treatment.
- `public/assets/`: local media and fonts. Original reference-asset source URLs remain in `sources.json`.
- `scripts/verify.mjs`: production browser checks.

Reference media retained from the original recreation remain the property of their respective owners.
