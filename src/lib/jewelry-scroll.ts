import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export function createJewelryScroll(reducedMotion: boolean) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.16,
    smoothWheel: !reducedMotion,
    syncTouch: false,
  });
  // Page controls decide when browsing starts and pause it for customization or dialogs.
  lenis.stop();
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  // Advance scrolling before GSAP renders, keeping the camera and copy on the same frame.
  gsap.ticker.add(tick, false, true);
  gsap.ticker.lagSmoothing(0);

  return {
    scrollTo: (top: number | HTMLElement) =>
      lenis.scrollTo(top, { immediate: reducedMotion || lenis.prefersReducedMotion }),
    start: () => {
      lenis.resize();
      lenis.start();
    },
    stop: () => lenis.stop(),
    destroy: () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    },
  };
}
