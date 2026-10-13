import gsap from "gsap";
import type { RingController } from "@/components/RingScene";

// One playhead owns both scene transitions, including when scrolling backwards.
export function createJewelryTimeline(
  controller: RingController,
  reducedMotion: boolean,
  mobile: () => boolean,
) {
  const { position, target, rotation, colors, updateColors } = controller;
  const heroPosition = { x: 1.28, y: -1.7, z: 5.86 };
  const heroTarget = { x: () => (mobile() ? -0.21 : 0.91), y: 0.03, z: -0.25 };
  const heroRotation = { x: rotation.x, y: rotation.y, z: rotation.z };
  const foreverPosition = { x: -1.83, y: -0.14, z: 6.15 };
  const foreverTarget = {
    x: () => (mobile() ? 0 : -0.78),
    y: () => (mobile() ? 1.5 : -0.03),
    z: -0.12,
  };
  const foreverRotation = { x: 0, y: 0, z: Math.PI / 2 };
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 1, ease: "none", immediateRender: false },
    // Apply materials and dirty the viewer once, after all camera values have settled.
    onUpdate: updateColors,
  });

  timeline
    .fromTo(position, heroPosition, { ...foreverPosition, ease: "power1.inOut" }, 0)
    .fromTo(target, heroTarget, { ...foreverTarget, ease: "power1.inOut" }, 0)
    .fromTo(rotation, heroRotation, { ...foreverRotation, ease: "power1.inOut" }, 0)
    .fromTo(colors, { forever: 0 }, { forever: 1 }, 0)
    .fromTo(
      ".jewelry-scroller",
      { autoAlpha: 1, yPercent: 0 },
      {
        autoAlpha: 0,
        yPercent: 150,
        duration: 0.5,
      },
      0,
    )
    .fromTo(
      ".jewelry-copy",
      { autoAlpha: 1, xPercent: 0 },
      {
        autoAlpha: 0,
        xPercent: reducedMotion ? 0 : 100,
        ease: "power4.out",
      },
      0,
    )
    .fromTo(
      ".jewelry-forever .jewelry-backword",
      { opacity: 0 },
      {
        opacity: 0.1,
        ease: "power4.inOut",
      },
      0,
    )
    .fromTo(
      ".jewelry-forever",
      { autoAlpha: 0, xPercent: reducedMotion ? 0 : -110 },
      {
        autoAlpha: 1,
        xPercent: 0,
        ease: "power4.inOut",
      },
      0,
    )
    .fromTo(".jewelry-dot-0", { opacity: 1, scale: 1.5 }, { opacity: 0.5, scale: 1 }, 0)
    .fromTo(".jewelry-dot-1", { opacity: 0.5, scale: 1 }, { opacity: 1, scale: 1.5 }, 0)
    .fromTo(
      position,
      foreverPosition,
      {
        x: -0.06,
        y: -1.15,
        z: 4.42,
        ease: "power1.inOut",
      },
      1,
    )
    .fromTo(
      target,
      foreverTarget,
      {
        x: -0.01,
        y: 0.9,
        z: 0.07,
        ease: "power1.inOut",
      },
      1,
    )
    .fromTo(
      rotation,
      foreverRotation,
      {
        x: 0,
        y: 0,
        z: -Math.PI / 2,
        ease: "power1.inOut",
      },
      1,
    )
    .fromTo(colors, { emotions: 0 }, { emotions: 1 }, 1)
    .fromTo(
      ".jewelry-forever",
      { autoAlpha: 1, xPercent: 0 },
      {
        autoAlpha: 0,
        xPercent: reducedMotion ? 0 : -110,
        ease: "power4.inOut",
      },
      1,
    )
    .fromTo(
      ".jewelry-emotions .jewelry-backword",
      { opacity: 0 },
      {
        opacity: 0.1,
        ease: "power4.inOut",
      },
      1,
    )
    .fromTo(
      ".jewelry-emotions-content",
      { autoAlpha: 0, yPercent: reducedMotion ? 0 : 130 },
      {
        autoAlpha: 1,
        yPercent: 0,
        ease: "power4.inOut",
      },
      1,
    )
    .fromTo(".jewelry-dot-1", { opacity: 1, scale: 1.5 }, { opacity: 0.5, scale: 1 }, 1)
    .fromTo(".jewelry-dot-2", { opacity: 0.5, scale: 1 }, { opacity: 1, scale: 1.5 }, 1);

  return timeline;
}
