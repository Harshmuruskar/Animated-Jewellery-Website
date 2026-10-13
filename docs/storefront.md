# Mancini & Co storefront

The original three-section 3D story now leads into a responsive jewelry flagship with a filterable, sortable catalog, product quick view, an atelier explorer, a diamond and ring-size studio, editorial and collector examples, a private salon, and a newsletter preview.

The client-only WebGi canvas stays mounted through docking and customization. A ResizeObserver updates its render target as the floating studio changes size. On phones the studio starts collapsed; visitors can expand it. The original hosted GLB pointer and public Draco decoder remain in place.

The shopping bag persists on the current browser using `mancini-bag-v1`. It retains ring sizes and bespoke gem colors, both metal colors, design variants, quantity, gift preferences, and engraving. Custom ring prices include gemstone, metal, and design adjustments. Persisted items are reconstructed using the current catalog and pricing rules.

Checkout, concierge appointments, and newsletter signup are simulated. They do not charge a card, submit personal details, place an order, reserve an appointment, or create a subscription. Editorial quotes, collector stories, boutique locations, and inventory are clearly presented as illustrative content. The educational studio links to the [GIA 4Cs guide](https://4cs.gia.edu/en-us/4cs-of-diamond-quality/) and [GIA ring-size guide](https://4cs.gia.edu/en-us/blog/how-to-determine-ring-size-tips-and-ring-size-chart/); visual diameters and international size equivalents are approximate.

Original product and atelier images are local assets. See [image-assets.md](image-assets.md) for every saved path and the final built-in imagegen prompts.

## Frontend presentation enhancements

The original full-screen pink loader is the only loading UI while the client-only 3D scene or a saved design loads. It disappears when the ring is ready; the separate preparation notice has been removed. If WebGi fails, the loader releases the page and a local ring image and retry message allow visitors to use the catalog, product dialogs, bag, and salon preview. The short camera entrance still hands control to scrolling as soon as the visitor scrolls.

The heart in the header opens favorite products and named custom designs. Favorites can also be filtered in the catalog. A comparison dialog shows up to three pieces with prices, carat weights, stones, metals, dimensions, and availability. These selections persist locally under `mancini-selections-v1` and synchronize between browser tabs.

The customizer supports Save design, Share, and Engrave. A versioned `ring` URL parameter restores the gem, both metal colors, Signature/Halo design, US size, and inscription/typeface after the scene is ready. URLs validate supported options and reconstruct colors from the palette; no server or login is involved. Named designs can be reopened, edited, and deleted. Shared links must use the same deployed site address for recipients to access them.

Engraving uses a lightweight SVG inner-band illustration with up to 30 Unicode characters and classic serif or modern sans lettering. It is an illustrative lettering preview, not a modification of the hosted GLB. Per-ring inscriptions and typefaces remain visible in the bag and simulated receipt; different inscriptions remain separate bag items. All of these enhancements are frontend-only. No payment, scheduling, database, or other backend integration was added, and environment settings are unchanged.

## Verification

```sh
npx tsc --noEmit
npm run test
npm run build
```

The suite has 34 passing tests across eight files, including configuration validation, exact gem and dual-metal reconstruction, Unicode inscription limits, local selection hydration, comparison limits, cross-tab synchronization, and distinct cart inscriptions alongside the existing catalog, scroll, animation, and render-quality regressions.

Chrome verification uses the real hosted WebGi runtime and source rings at desktop (1440 × 900) and phone (390 × 844) sizes. Checks cover the pink loader while the runtime is delayed, its removal when the scene is ready, a usable fallback when loading fails, favorite filtering, comparison limits and horizontal scrolling, named design persistence/reopening, shared Halo design restoration with exact gem/metals/size/inscription/typeface, engraving editing and bag preservation, and dark saved-collection styling. The normal-motion entrance hands control to scrolling, hero transitions remain reversible, and one canvas stays mounted through docking and customization.
