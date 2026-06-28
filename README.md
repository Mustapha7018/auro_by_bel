# Aura & Bel — beauty & hair storefront

A minimal, Shopify-style storefront for **Aura & Bel**, built with Vue 3 + Vite.
Each category (Wig Installation, Nails, Lashes, Wigs & Bundles, …) is a **collection
of multiple products** shown in a grid — hover to reveal quick add, choose options,
and add to a slide-over bag with **buy-now / pre-order (deposit)** support.

## Identity

- **Palette:** white canvas · near-black ink (`#14110F`) · champagne gold (`#BFA06A`) · dusty rose (`#C58A84`)
- **Type:** Inter throughout — one clean sans, no display-serif flourishes
- **Layout:** sticky category bar → one collection section per category → responsive product grid

## Run it

```bash
nvm use            # Node 24 (this project was built on v24.16.0)
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Adding real product photos

The store ships with typographic placeholders. Each product references an image at
**`public/images/<category>-<slug>.jpg`** — drop a JPG/WEBP at that path and the card
lights up automatically, no code changes.

The exact filename for each product is the `image:` field in `src/data/catalog.js`.
Examples: `nails-acrylic.jpg`, `lash-volume.jpg`, `retail-frontal.jpg`,
`install-360.jpg`. Shoot/crop to a 4:5 portrait for the cleanest grid fit.

## Editing the store

Everything lives in one file, shaped like a future API/dashboard response:

- **`src/data/catalog.js`** — an array of categories, each with a `products[]` array.
  Add/remove products, edit prices and `deposit`, set a `badge`, add `options`
  (e.g. lengths), or mark a product `stock: 'preorder-only'` (made to order — hides
  the buy-now action). Reorder categories by reordering the array.

### Category feature image

Each collection opens with a large **rounded feature image** beside its heading,
blurb and CTA (sides alternate down the page). By default it shows a placeholder.
To use a real photo, add a `banner` field to the category object in `catalog.js`:

```js
{ id: 'retail', name: 'Wigs & Bundles',
  banner: '/images/feature-retail.jpg',
  ... }
```

Drop the file in `public/images/`. A portrait-ish 5:4 crop fills the frame best.

## Shop vs. appointment

Each collection has a `mode` (set in the post-process loop in `catalog.js`):

- **`shop`** — Wigs & Bundles and Wig Making. Bought through the cart
  (add to bag / pre-order with deposit).
- **`appointment`** — everything else. The quick-view opens a **date + time
  picker** instead of the cart. Availability lives in `src/data/availability.js`
  (Bel works Tue–Sat, 9–6; slots are seeded so a given day is stable, and some
  days show as fully booked). "Request appointment" is a front-end confirmation
  for now — the real booking persists once the backend is wired.

## Connecting a backend (later)

The frontend is ready for the dashboard you mentioned:

1. **Catalog** — replace the static `catalog` array in `src/data/catalog.js` with a
   `fetch()` to your API; components consume the same shape.
2. **Checkout** — `src/store/cart.js` already computes `dueToday` (deposits + full
   payments) and `balanceLater`. Wire the drawer's *Checkout* button to your payment
   provider.
3. **Pre-orders** — every card's *Buy now / Add to bag* and *Pre-order / Reserve*
   buttons feed one cart, so deposits vs. full payments are already separated per line.

## Structure

```
src/
  components/   SiteNav, CategoryNav, CatalogCategory, ProductCard,
                MediaFrame, CartDrawer, SiteFooter
  composables/  useReveal.js        (scroll-in animations)
  data/         catalog.js          (categories → products)
  store/        cart.js             (Pinia — buy-now / pre-order)
  styles/       tokens.css, base.css, buttons.css
```
