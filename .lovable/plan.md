# Reference jewelry experience fidelity

## Goal
Bring the jewelry hero closer to the reference, prioritizing scroll-linked ring/camera motion and completing the previously requested visitor motion tuner.

## Work
- Repair the existing curve interpolation type error and cover boundary cases.
- Replace discrete, lagging section updates with smooth scroll-progress-driven camera, ring, palette, copy, watermark, and navigation transitions.
- Improve the loading/entrance sequence, mobile framing, and night-mode treatment to match the reference more closely while preserving the existing ring asset and page identity.
- Add the requested scroll-position control and a review/apply flow for AI-recommended rotation curves, keeping gateway credentials and calls server-side.
- Verify the full scroll and tune/apply flows, including desktop and the current narrow viewport; resolve any resulting build errors.

## Technical details
- Keep the Three.js scene client-only and bind scene state to page scroll progress.
- Reuse the existing GSAP and Lovable AI Gateway setup; do not expose credentials in browser code.
- Keep the hosted GLB pointer and public Draco decoder unchanged.
