# Webgi Hero Clone

https://webgi-jewelry.vercel.app/ this is a website and i want clone exactly this website hero section with animation you can use threejs and gsap for animation but i want exact same animation

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54ebfba5-18ac-49c8-9202-45df34a2f114).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The 3D scene loads WebGi 0.4.6 from its hosted SDK to preserve the reference's diamond materials and lighting. Ring geometry stays hosted: Lovable uses the existing asset pointer, and local previews use the original reference GLB. The Draco decoder remains in `public/draco/`. An internet connection is required for the renderer, models, fonts, and soundtrack.

The entrance waits for the model to load before starting the four-second camera move. Scroll controls unlock after the hero text enters; GSAP ScrollTrigger then coordinates the camera, ring rotation, material colors, and text at the actual section boundaries. Customization pauses scrolling and hands the camera to orbit controls; exiting restores the page animations.
