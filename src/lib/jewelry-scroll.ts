import gsap from "gsap";

// Match the reference's 2.2-second Lenis wheel easing without another render loop.
export function createJewelryScroll(reducedMotion: boolean) {
  let enabled = false;
  let target = window.scrollY;
  let tween: gsap.core.Tween | undefined;
  const position = { y: target };
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function scrollTo(top: number) {
    tween?.kill();
    target = Math.max(0, Math.min(top, maxScroll()));
    position.y = window.scrollY;
    if (reducedMotion) {
      window.scrollTo(0, target);
      return;
    }
    tween = gsap.to(position, {
      y: target,
      duration: 2.2,
      ease: (time: number) => (time === 1 ? 1 : Math.min(1, 1.001 - 2 ** (-5 * time))),
      onUpdate: () => window.scrollTo(0, position.y),
      onComplete: () => {
        window.scrollTo(0, target);
        position.y = target;
      },
    });
  }

  function wheel(event: WheelEvent) {
    if (
      !enabled ||
      reducedMotion ||
      event.ctrlKey ||
      event.metaKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    )
      return;
    if (window.matchMedia("(max-width: 600px)").matches) return;
    event.preventDefault();
    const delta =
      event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    scrollTo(target + delta);
  }
  function sync() {
    if (!tween?.isActive()) target = window.scrollY;
  }
  function cancel() {
    tween?.kill();
    target = window.scrollY;
  }
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("pointerdown", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  return {
    scrollTo,
    start: () => {
      enabled = true;
      target = window.scrollY;
    },
    stop: () => {
      enabled = false;
      cancel();
    },
    destroy: () => {
      cancel();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    },
  };
}
