/**
 * Aura & Bel — store catalogue.
 *
 * A storefront, Shopify-style: each CATEGORY is a collection holding many
 * PRODUCTS shown in a grid. Shape mirrors a future API/dashboard response,
 * so this static module can be swapped for a fetch with no UI changes.
 *
 * category.kind: 'service' → in-studio; actions = Book in full / Reserve
 *                'retail'  → shipped goods; actions = Buy now / Pre-order
 *
 * product: { id, name, variant, price, deposit, image, alt, badge?,
 *            options?: { label, values[] }, stock? }
 *   stock: 'preorder-only' hides the buy-now action (made to order)
 */

export const currency = { code: 'GBP', symbol: '£' }

/**
 * Studio photography in `public/images/`. Each collection draws from its own
 * pool and cycles through it (duplicating across products is fine — it keeps
 * the grid full). To swap any collection's photos, drop new files in
 * `public/images/` and update the matching array below.
 */
const WIGS = [
  'img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg',
  'img5.jpg', 'img6.jpg', 'img7.jpg', 'img8.jpg',
]
const NAILS = ['nail1.jpg', 'nail2.jpg', 'nail3.webp', 'nail4.png', 'nail5.jpg', 'nail6.webp']
const PEDI = ['p1.webp', 'p2.jpg', 'p3.jpg', 'p4.webp', 'p5.jpg', 'p6.webp']

// keyed by the short prefix passed to img() below
const POOL = {
  install: WIGS,
  make: WIGS,
  revamp: WIGS,
  retail: WIGS,
  nails: NAILS,
  pedi: PEDI,
}

const _seen = {}
const img = (cat) => {
  const pool = POOL[cat] || WIGS
  const i = (_seen[cat] = (_seen[cat] ?? -1) + 1)
  return `/images/${pool[i % pool.length]}`
}

export const catalog = [
  {
    id: 'wig-installation',
    name: 'Wig Installation',
    kind: 'service',
    blurb: 'Scalp-melting installs finished to your hairline.',
    products: [
      { id: 'install-frontal', name: 'Frontal Install', variant: '13×4 / 13×6 lace', price: 80, deposit: 30, badge: 'Popular', image: img('install', 'frontal'), alt: 'Three-quarter view of a finished frontal install.' },
      { id: 'install-closure', name: 'Closure Install', variant: '4×4 / 5×5 lace', price: 65, deposit: 25, image: img('install', 'closure'), alt: 'Side view of a closure install with a clean parting.' },
      { id: 'install-360', name: '360 Install', variant: 'Full perimeter', price: 95, deposit: 35, image: img('install', '360'), alt: 'Back view of a 360 install styled into a ponytail.' },
      { id: 'install-glueless', name: 'Glueless Fitting', variant: 'No adhesive', price: 55, deposit: 20, image: img('install', 'glueless'), alt: 'Front view of a glueless fitting with natural baby hairs.' },
      { id: 'install-refresh', name: 'Reinstall & Refresh', variant: 'Lift, wash & re-lay', price: 50, deposit: 20, image: img('install', 'refresh'), alt: 'Detail of a refreshed install hairline.' },
    ],
  },
  {
    id: 'wig-making',
    name: 'Wig Making',
    kind: 'service',
    blurb: 'Hand-built units, made to your measurements.',
    products: [
      { id: 'make-frontal', name: 'Frontal Unit', variant: 'Made to order', price: 180, deposit: 70, badge: 'Made to order', stock: 'preorder-only', image: img('make', 'frontal'), alt: 'A finished frontal unit on a canvas block.' },
      { id: 'make-closure', name: 'Closure Unit', variant: 'Made to order', price: 150, deposit: 60, stock: 'preorder-only', image: img('make', 'closure'), alt: 'A closure unit shown at an angle.' },
      { id: 'make-fulllace', name: 'Full Lace Unit', variant: 'Hand-ventilated', price: 320, deposit: 120, badge: 'Premium', stock: 'preorder-only', image: img('make', 'fulllace'), alt: 'A hand-ventilated full lace unit.' },
      { id: 'make-glueless', name: 'Glueless Unit', variant: 'Bands & combs', price: 200, deposit: 80, stock: 'preorder-only', image: img('make', 'glueless'), alt: 'A glueless unit with adjustable bands.' },
      { id: 'make-bob', name: 'Bob Unit', variant: 'Pre-styled', price: 160, deposit: 60, stock: 'preorder-only', image: img('make', 'bob'), alt: 'A pre-styled bob unit photographed from the side.' },
    ],
  },
  {
    id: 'revamping',
    name: 'Revamping',
    kind: 'service',
    blurb: 'Tired units brought back to a salon-fresh finish.',
    products: [
      { id: 'revamp-wash', name: 'Wash & Restyle', variant: 'Detangle & set', price: 40, deposit: 15, image: img('revamp', 'wash'), alt: 'A freshly washed and restyled unit.' },
      { id: 'revamp-restore', name: 'Deep Restore', variant: 'Mask & revive', price: 60, deposit: 25, badge: 'Popular', image: img('revamp', 'restore'), alt: 'A deeply conditioned, glossy revamped unit.' },
      { id: 'revamp-reventilate', name: 'Re-ventilation', variant: 'Thinning & repair', price: 90, deposit: 35, image: img('revamp', 'reventilate'), alt: 'Close detail of re-ventilated lace.' },
      { id: 'revamp-colour', name: 'Bleach & Tint', variant: 'Knots & tone', price: 70, deposit: 25, image: img('revamp', 'colour'), alt: 'A unit with bleached knots and toned colour.' },
    ],
  },
  {
    id: 'pedicure',
    name: 'Pedicure',
    kind: 'service',
    blurb: 'Restoring soaks and a flawless finish.',
    products: [
      { id: 'pedi-classic', name: 'Classic Pedicure', variant: 'Soak, file & polish', price: 30, deposit: 10, image: img('pedi'), alt: 'A classic finished pedicure.' },
      { id: 'pedi-gel', name: 'Gel Pedicure', variant: 'Long-wear gel', price: 40, deposit: 10, badge: 'Popular', image: img('pedi'), alt: 'A glossy gel pedicure.' },
      { id: 'pedi-spa', name: 'Luxury Spa Pedicure', variant: 'Scrub, mask & massage', price: 55, deposit: 20, image: img('pedi'), alt: 'A luxury spa pedicure with mask treatment.' },
      { id: 'pedi-french', name: 'French Pedicure', variant: 'Classic white tip', price: 38, deposit: 10, image: img('pedi'), alt: 'A French-tip pedicure.' },
      { id: 'pedi-deluxe', name: 'Deluxe Paraffin Pedicure', variant: 'Paraffin wax & massage', price: 60, deposit: 20, badge: 'Popular', image: img('pedi'), alt: 'A deluxe paraffin pedicure treatment.' },
      { id: 'pedi-express', name: 'Express Pedicure', variant: '30 minutes', price: 22, deposit: 10, image: img('pedi'), alt: 'A quick express pedicure finish.' },
    ],
  },
  {
    id: 'nails',
    name: 'Nails',
    kind: 'service',
    blurb: 'Sculpted, structured and sealed to last.',
    products: [
      { id: 'nails-builder', name: 'Builder Gel Full Set', variant: 'Natural overlay', price: 38, deposit: 10, badge: 'Popular', image: img('nails', 'builder'), alt: 'A builder gel full set, natural finish.' },
      { id: 'nails-acrylic', name: 'Acrylic Full Set', variant: 'Sculpted extension', price: 42, deposit: 15, image: img('nails', 'acrylic'), alt: 'A sculpted acrylic full set.' },
      { id: 'nails-french', name: 'French Tips', variant: 'Classic or coloured', price: 45, deposit: 15, image: img('nails', 'french'), alt: 'French tip nails at an angle.' },
      { id: 'nails-art', name: 'Nail Art Set', variant: 'Custom design', price: 55, deposit: 20, badge: 'Custom', image: img('nails', 'art'), alt: 'An intricate custom nail art set.' },
      { id: 'nails-gel', name: 'Gel Overlay', variant: 'On natural nails', price: 30, deposit: 10, image: img('nails', 'gel'), alt: 'A glossy gel overlay manicure.' },
      { id: 'nails-refill', name: 'Soak-off & Refill', variant: 'Maintenance', price: 32, deposit: 10, image: img('nails', 'refill'), alt: 'A refreshed refill manicure.' },
    ],
  },
  {
    id: 'lash-extensions',
    name: 'Lash Extensions',
    kind: 'service',
    blurb: 'Seven signature sets, mapped to your eye shape.',
    products: [
      { id: 'lash-classic', name: 'Classic Set', variant: '1:1 natural application', price: 45, deposit: 15, image: '/images/classic_eye_lash.jpg', alt: 'A natural classic lash set, one extension per natural lash.' },
      { id: 'lash-hybrid', name: 'Hybrid Set', variant: 'Classic + volume mix', price: 55, deposit: 20, badge: 'Popular', image: '/images/hybrid.jpg', alt: 'A textured hybrid lash set blending classic and volume.' },
      { id: 'lash-volume', name: 'Volume Set', variant: 'Handmade fans', price: 65, deposit: 25, image: '/images/volume.webp', alt: 'A full, fluffy volume lash set.' },
      { id: 'lash-wispy', name: 'Wispy Set', variant: 'Textured & fluttery', price: 60, deposit: 20, badge: 'Popular', image: '/images/wispy.jpg', alt: 'A wispy, textured lash set with spikes.' },
      { id: 'lash-wet', name: 'Wet Set', variant: 'Glossy spiked look', price: 60, deposit: 20, image: '/images/wet_set.jpg', alt: 'A wet-look spiked lash set.' },
      { id: 'lash-fairy', name: 'Fairy Set', variant: 'Delicate & airy', price: 65, deposit: 25, image: '/images/fairy_set.jpg', alt: 'A light, airy fairy lash set.' },
      { id: 'lash-anime', name: 'Anime Set', variant: 'Bold spiked clusters', price: 70, deposit: 25, badge: 'Dramatic', image: '/images/anime.jpg', alt: 'A dramatic anime-style spiked lash set.' },
    ],
  },
  {
    id: 'microblading',
    name: 'Microblading',
    kind: 'service',
    blurb: 'Semi-permanent brows mapped to your bone structure.',
    products: [
      { id: 'brows-microblading', name: 'Microblading', variant: 'Hair strokes', price: 120, deposit: 40, badge: 'Incl. touch-up', image: '/images/microblading.jpg', alt: 'Freshly microbladed hair-stroke brows.' },
      { id: 'brows-combo', name: 'Combo Brows', variant: 'Strokes + shading', price: 150, deposit: 50, image: '/images/combo_brows.jpg', alt: 'Combo brows with strokes and shading.' },
      { id: 'brows-ombre', name: 'Ombré Powder Brows', variant: 'Soft gradient', price: 160, deposit: 50, badge: 'Popular', image: '/images/ombre_brows.jpg', alt: 'Soft ombré powder brows.' },
      { id: 'brows-touchup', name: 'Annual Touch-up', variant: 'Colour refresh', price: 70, deposit: 25, image: '/images/annual.jpg', alt: 'A brow colour touch-up result.' },
    ],
  },
  {
    id: 'piercing',
    name: 'Piercing',
    kind: 'service',
    blurb: 'Precise placement, sterile single-use needles, jewellery included.',
    products: [
      { id: 'pierce-nostril', name: 'Nostril Piercing', variant: 'Stud or hoop', price: 28, deposit: 10, image: '/images/nose1.webp', alt: 'A delicate nostril piercing.' },
      { id: 'pierce-belly', name: 'Belly Piercing', variant: 'Navel · jewellery included', price: 35, deposit: 15, badge: 'Popular', image: '/images/belly1.jpg', alt: 'A navel piercing with a gem charm.' },
      { id: 'pierce-ear', name: 'Ear Piercing', variant: 'Lobe to helix', price: 25, deposit: 10, image: '/images/ear1.jpg', alt: 'A curated ear with fine-gold piercings.' },
    ],
  },
  {
    id: 'retail',
    name: 'Wigs & Bundles',
    kind: 'retail',
    blurb: 'Single-donor raw hair and ready-to-wear units, shipped worldwide.',
    products: [
      { id: 'retail-bundles', name: 'Raw SDD Bundles', variant: 'Straight · natural black', price: 95, deposit: 35, badge: 'Best seller', options: { label: 'Length', values: ['16"', '18"', '20"', '22"', '24"'] }, image: img('retail', 'bundles'), alt: 'Three bundles of glossy straight raw hair.' },
      { id: 'retail-frontal-wig', name: 'HD Lace Frontal Wig', variant: 'Body wave · 180%', price: 240, deposit: 80, options: { label: 'Length', values: ['18"', '20"', '22"', '26"'] }, image: img('retail', 'frontal'), alt: 'A body-wave HD lace frontal wig on a stand.' },
      { id: 'retail-closure-wig', name: 'Glueless 5×5 Closure Wig', variant: 'Deep curl · 200%', price: 210, deposit: 70, badge: 'Low stock', options: { label: 'Length', values: ['16"', '18"', '20"'] }, image: img('retail', 'closure'), alt: 'A deep-curl glueless closure wig.' },
      { id: 'retail-pixie', name: 'Coloured Pixie Unit', variant: 'Honey blonde · pre-styled', price: 165, deposit: 55, badge: 'Made to order', stock: 'preorder-only', options: { label: 'Length', values: ['8"', '10"'] }, image: img('retail', 'pixie'), alt: 'A honey-blonde pixie unit at a low angle.' },
      { id: 'retail-bob-wig', name: 'Straight Bob Wig', variant: 'Glueless · 150%', price: 175, deposit: 60, options: { label: 'Length', values: ['10"', '12"', '14"'] }, image: img('retail', 'bob'), alt: 'A sleek straight bob wig.' },
      { id: 'retail-curly-frontal', name: 'Curly Frontal Wig', variant: 'Kinky curl · 200%', price: 230, deposit: 80, options: { label: 'Length', values: ['18"', '20"', '22"'] }, image: img('retail', 'curly'), alt: 'A voluminous curly frontal wig.' },
      { id: 'retail-bundle-deal', name: '3 Bundles + Closure Deal', variant: 'Save when bundled', price: 320, deposit: 110, badge: 'Bundle deal', options: { label: 'Length set', values: ['16-18"', '18-20"', '20-22"'] }, image: img('retail', 'deal'), alt: 'A bundle deal of three wefts and a closure.' },
    ],
  },
]

/**
 * Large rounded feature image for each collection header — pulled from the
 * same studio pools (a different image than the first product, where possible).
 */
const FEATURE = {
  'wig-installation': '/images/img2.jpg',
  'wig-making': '/images/img5.jpg',
  revamping: '/images/img7.jpg',
  nails: '/images/nail2.jpg',
  'lash-extensions': '/images/wispy.jpg',
  piercing: '/images/ear2.jpg',
  retail: '/images/img4.jpg',
  pedicure: '/images/p2.jpg',
  microblading: '/images/ombre_brows.jpg',
}

/**
 * Purchase model per collection:
 *   'shop'        → bought through the cart (Wigs & Bundles, Wig Making)
 *   'appointment' → booked in-studio with a date + time (everything else)
 */
const SHOP_CATEGORIES = new Set(['retail', 'wig-making'])

catalog.forEach((c) => {
  c.banner = FEATURE[c.id] || '/images/img1.jpg'
  c.mode = SHOP_CATEGORIES.has(c.id) ? 'shop' : 'appointment'
})

export const catalogIndex = catalog.map((c) => ({ id: c.id, name: c.name, count: c.products.length }))
