import gsap from "gsap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RingController } from "@/components/RingScene";
import { createJewelryTimeline } from "@/lib/jewelry-animation";

let timeline: gsap.core.Timeline;
let controller: RingController;

beforeEach(() => {
  document.body.innerHTML = `
    <div class="jewelry-copy"></div>
    <div class="jewelry-scroller"></div>
    <div class="jewelry-forever"><div class="jewelry-backword"></div></div>
    <div class="jewelry-emotions"><div class="jewelry-backword"></div></div>
    <div class="jewelry-emotions-content"></div>
    <span class="jewelry-dot-0"></span><span class="jewelry-dot-1"></span><span class="jewelry-dot-2"></span>
  `;
  controller = {
    position: { x: 1.28, y: -1.7, z: 5.86 },
    target: { x: 0.91, y: 0.03, z: -0.25 },
    rotation: { x: 0.1, y: -0.2, z: 0.3 },
    colors: { forever: 0, emotions: 0 },
    update: vi.fn(),
    updateColors: vi.fn(),
    setNight: vi.fn(),
    setOrbit: vi.fn(),
    setGem: vi.fn(),
    setMetals: vi.fn(),
    changeModel: vi.fn(async () => {}),
  };
});

afterEach(() => {
  timeline?.kill();
  document.body.innerHTML = "";
});

function pose() {
  const { position, target, rotation, colors } = controller;
  return [
    position.x,
    position.y,
    position.z,
    target.x,
    target.y,
    target.z,
    rotation.x,
    rotation.y,
    rotation.z,
    colors.forever,
    colors.emotions,
    ...[".jewelry-copy", ".jewelry-forever", ".jewelry-emotions-content"].flatMap((selector) => [
      gsap.getProperty(selector, "opacity"),
      gsap.getProperty(selector, "xPercent"),
      gsap.getProperty(selector, "yPercent"),
    ]),
  ];
}

describe("Jewelry scroll animation", () => {
  it("returns to the same camera, materials, and copy after rapid scroll reversals", () => {
    timeline = createJewelryTimeline(controller, false, () => false);
    const checkpoints = [0.1, 0.3, 0.499, 0.5, 0.501, 0.7, 0.9, 1];
    const poses = checkpoints.map((progress) => {
      timeline.progress(progress);
      return pose();
    });
    // Jump across sections, reverse direction, and visit the original points again.
    for (const index of [5, 1, 7, 0, 4, 2, 6, 3]) {
      timeline.progress(checkpoints[index]!);
      expect(pose()).toEqual(poses[index]);
    }
    timeline.progress(0);
    expect(controller.position).toMatchObject({ x: 1.28, y: -1.7, z: 5.86 });
    expect(controller.rotation).toMatchObject({ x: 0.1, y: -0.2, z: 0.3 });
    expect(controller.colors).toMatchObject({ forever: 0, emotions: 0 });
  });

  it("keeps the camera continuous at the shared section boundary and updates the viewer once", () => {
    timeline = createJewelryTimeline(controller, false, () => false);
    timeline.progress(0.4999);
    const before = pose().slice(0, 9) as number[];
    timeline.progress(0.5001);
    const after = pose().slice(0, 9) as number[];
    after.forEach((value, index) => expect(Math.abs(value - before[index]!)).toBeLessThan(0.001));
    vi.mocked(controller.updateColors).mockClear();
    timeline.progress(1);
    expect(controller.position).toMatchObject({ x: -0.06, y: -1.15, z: 4.42 });
    expect(controller.rotation.z).toBeCloseTo(-Math.PI / 2);
    expect(controller.updateColors).toHaveBeenCalledTimes(1);
  });

  it("recomputes mobile camera targets on resize while preserving reduced-motion copy", () => {
    let mobile = false;
    timeline = createJewelryTimeline(controller, true, () => mobile);
    timeline.progress(0.5);
    expect(controller.target).toMatchObject({ x: -0.78, y: -0.03, z: -0.12 });
    mobile = true;
    timeline.progress(0).invalidate().progress(0.5);
    expect(controller.target).toMatchObject({ x: 0, y: 1.5, z: -0.12 });
    timeline.progress(0.25);
    expect(gsap.getProperty(".jewelry-copy", "xPercent")).toBe(0);
    expect(gsap.getProperty(".jewelry-forever", "xPercent")).toBe(0);
    timeline.progress(0.75);
    expect(gsap.getProperty(".jewelry-emotions-content", "yPercent")).toBe(0);
  });
});
