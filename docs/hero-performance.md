# Hero scrolling performance

The scroll loop keeps Lenis, GSAP camera movement, and copy transitions synchronized, with a more responsive wheel interpolation. The hero-to-storefront boundary uses IntersectionObserver instead of reading layout on every scroll event. The storefront element tree is memoized so section navigation updates do not rerender the catalog and editorial sections.

The WebGi viewer uses adaptive moving-frame resolution and lighter reflection sampling while animating. It restores the original full-resolution target after 300 ms without camera updates. Slow moving frames lower the resolution gradually, with a 50% floor; small PiP previews retain full resolution. Resolution changes are deduplicated to avoid reallocating render targets on every frame. The extra frame-fade pass is disabled because the camera and material transitions are already interpolated by GSAP. The same settings are reapplied after an alternate ring imports viewer configuration.

The reference GLB pointer, public Draco decoder, client-only scene, material selections, and persistent canvas remain in place.

## Local measurements

Headless Chrome using the device's AMD Radeon integrated GPU, a 1440 × 900 viewport, and a 4.5-second forward/reverse hero scroll sweep. These are intervals between rendered frames, rather than isolated GPU draw durations.

| Metric | Before | After |
| --- | ---: | ---: |
| Average frame interval | 53.4 ms | 22.3 ms |
| 95th percentile frame interval | 106.9 ms | 48.1 ms |
| Long tasks during the sweep | 4 | 1 |

Full-resolution idle rendering was verified after the sweep. Real wheel input, direction changes, the three hero stages, alternate Halo geometry, retained custom bag specifications, desktop/mobile docking, and canvas persistence also passed browser checks without page errors.

Validation: `npx tsc --noEmit`, `npm run test` (26 tests), and `npm run build`.
