# La La Land Cafe recreation

A responsive React + TypeScript recreation of the [La La Land Cafe homepage](https://lalalandcafe.com/), built with Vite. The video, Poppins fonts, logos, product photography, illustrations, and payment icons are stored locally. Asset source URLs are recorded in `public/assets/sources.json`.

**Live website:** https://xirui-li.github.io/lalaland-cafe-replica/

## Theme

The site uses **PANTONE 2141 C**, approximated on screen as **#8BBEE8** ([color reference](https://www.colorxs.com/color/pantone-2141-c)). The palette in `src/styles.css` combines this light blue with deep blue text and pale blue surfaces. Navigation, buttons, forms, dialogs, the footer, and the favicon share the same palette.

Images, illustrations, and video use the reversible blue duotone in `src/ThemeFilters.tsx`. Original media files are preserved. Brand marks use CSS masks to match the palette precisely.

## GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` builds and deploys the website automatically on every push to `main`. GitHub Pages uses **GitHub Actions** as its deployment source.

The workflow sets `SITE_BASE_PATH` for the repository URL. Local development uses `/` by default. To verify the GitHub Pages layout locally:

```sh
SITE_BASE_PATH=/lalaland-cafe-replica/ npm run build
SITE_BASE_PATH=/lalaland-cafe-replica/ npm test
```

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Build and verify

```sh
npm run build
npm test
```

The browser checks start a production preview server and exercise the menus, carousels, product details, persistent cart, search, newsletter validation, accessibility options, and layouts at 320, 390, 768, 1024, and 1440 pixels. They also check for missing images and browser errors. Screenshots are saved in `artifacts/`.

Tests use Google Chrome when installed at the standard macOS location. Otherwise, install the test browser with `npx playwright install chromium`. To test an already running server, set `TEST_BASE_URL`.

## Scope

The homepage is reproduced locally, with desktop and mobile navigation, product image hover states, touch carousels, product dialogs, search, a shopping bag stored on the device, cookie preferences, and accessibility controls. Reduced motion preferences are respected.

The order, account, informational, and full product detail links lead to the original website. Checkout and email signup display explicit preview messages; they do not process payments or transmit email addresses. The original cookie banner appearance is reproduced, but no analytics or advertising scripts are included.

## Files

- `src/App.tsx`: page sections and interactions
- `src/styles.css`: responsive styles and fonts
- `src/catalog.json`: product information
- `public/assets/`: original media and fonts
- `scripts/verify.mjs`: browser checks

Reference branding and media remain the property of their respective owners.
