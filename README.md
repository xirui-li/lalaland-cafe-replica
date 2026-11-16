# THICK. yogurt

A responsive React + TypeScript website for **THICK.**, the yogurt brand operated by **THICK Holdings LLC**. Built with Vite.

**Website:** https://thisisthick.com/ (see [domain setup](docs/domain-setup.md)).

**Previous GitHub Pages address:** https://xirui-li.github.io/lalaland-cafe-replica/ (redirects to the custom domain).

## Confirmed brand and store information

- Main product: yogurt. The supplied logo reads **non-dripping strained yogurt**.
- Brand: **THICK.**; the supplied graphic wordmark retains its lowercase **thick.** lettering.
- Company: **THICK Holdings LLC**.
- One store: **1073 Wisconsin Ave NW, 1st Floor, Washington, DC 20007**.
- Hours: **every day, 11:30 AM–10:30 PM**, confirmed by the owner after correcting the pasted AM/PM values.
- Phone: **(771) 253-9358**.

`src/store.ts` holds the store details. Header, mobile, and footer links lead to the store section, Google Maps, or the telephone number.

## Media and theme requirements

**Main hero video.** On 2026-11-15 the owner replaced the original hero footage with the THICK. brand film (cows, milk, meadow, yogurt close-ups, ending on the thick. logo). `public/assets/hero.mp4` is that film re-encoded for the web (H.264, 864×496, audio removed, faststart); `public/assets/hero-poster.jpg` is its opening frame. It plays in original colors, without the blue treatment. The browser checks verify the video and poster checksums.

The site uses **PANTONE 2141 C**, approximated on screen as **#8BBEE8** ([color reference](https://www.colorxs.com/color/pantone-2141-c)). The palette combines this light blue with deep blue text and pale blue surfaces.

The owner’s latest instructions are to show yogurt and store photography in their original colors, without a filter. This applies to the product gallery, product details, search results, and storefront photo. The brand film also plays in its original colors. The blue treatment in `src/ThemeFilters.tsx` remains only on the brand illustration. Page colors retain the Pantone palette.

Brand marks are displayed directly as transparent PNG images, without CSS masks or solid-color placeholder backgrounds. The header uses the supplied blue logo; the hero and footer use the supplied cream PSD artwork exported to transparent PNG. This avoids rectangular blocks in browsers where CSS masking is unavailable.

THICK. logos, the bowl mark, storefront photo, soft opening poster, and menu photos are owner-supplied. The 35 menu photos come from the owner’s “soft open菜单” folder (BULK uses the colour-graded “调色” versions where available) and are converted to WebP at up to 1000 px in `public/assets/menu/`. `public/assets/thick-sources.json` records provenance and file hashes.

## Homepage design

The homepage follows the supplied THICK. layout sketch: an inset brand film, three featured bowls, a short yogurt introduction, an interactive Bao section, the soft opening menu, and store information. Cream surfaces, brand blue, and serif display headings establish the visual style. The brand film has a visible play/pause control.

Bao is extracted unchanged from the owner-supplied HTML sketch into `public/assets/bao.png`. Tap or click to toggle a greeting; pointer movement gently tilts the artwork. Reduced-motion preferences disable the tilt. No eye tracking is simulated without layered character assets.

Ordering, social posts, and catering remain absent until confirmed destinations and content are supplied. The featured bowls reuse the existing numbered catalog labels.

## Content scope

**Soft opening (from 2026-11-15).** A dialog greets each visitor once per browser session with the owner’s newspaper poster (`public/assets/soft-opening.webp`) and soft opening hours of 11:30 AM–8:00 PM. The store section still lists the regular hours of 11:30 AM–10:30 PM until the owner decides otherwise.

The menu section is styled after that newspaper poster (paper background, deep blue rules, serif headlines) and groups the menu into seven series with tabs: Remix, Swirl, Dome, Bulk, Loaded, Sphere, and Limited. Product names come from the supplied file names; BULK items also show their Chinese names. The six LOADED photos were supplied without names and are labelled Loaded 01–06. Only the two Limited desserts have confirmed prices ($12.99 and $13.99). Visitors can call the store for other prices. There is no ordering URL yet.

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

The default build and checks above cover the custom domain at `/`. To verify the fallback GitHub Pages project path:

```sh
SITE_BASE_PATH=/lalaland-cafe-replica/ npm run build
SITE_BASE_PATH=/lalaland-cafe-replica/ npm test
```

The checks cover hero assets and playback, THICK. content and links, soft opening dialog, menu series tabs, image dialogs, yogurt search, keyboard dismissal, store information, and responsive layouts at 320, 390, 768, 1024, and 1440 pixels. Screenshots are saved in `artifacts/`. Tests use installed Google Chrome, or Playwright Chromium if Chrome is unavailable.

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys to GitHub Pages on pushes to `main`. It reads the base path from `actions/configure-pages`, so assets and home links use `/` for the custom domain or `/lalaland-cafe-replica/` for the default project address. Local development defaults to `/`.

The owner chose `thisisthick.com` as the primary domain. Manage this under repository Settings → Pages → Custom domain. After changing that setting, rerun the deployment workflow so the build uses the updated path. Custom Actions deployments do not require a `CNAME` file. See [domain setup](docs/domain-setup.md) for DNS records and verification steps.

## Files

- `src/App.tsx`: page sections, soft opening dialog, menu, search, and accessibility interactions.
- `src/catalog.json`: soft opening menu series, product names, prices where known, photos, and descriptive alternative text.
- `src/store.ts`: confirmed store and company information.
- `src/styles.css`, `src/ThemeFilters.tsx`: responsive styles and blue media treatment.
- `public/assets/`: active THICK. media, the brand film, and fonts. Retired reference-brand logos, merchandise, and payment graphics have been removed from the published assets.
- `docs/reference-asset-sources.json`: source attribution for the original reference assets, kept outside the published site.
- `scripts/verify.mjs`: production browser checks.

Reference media retained from the original recreation remain the property of their respective owners.

The hero brand film contains burned-in THICK. text and a closing thick. logo.
