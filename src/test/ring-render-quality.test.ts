import { describe, expect, it, vi } from "vitest";
import { createRingRenderQuality } from "@/lib/ring-render-quality";

describe("Ring rendering budget", () => {
  it("reapplies the budget when an imported model overwrites renderer settings", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(1000, 800);
    quality.setContinuous(true, 0);
    quality.frame(16);
    expect(setScale).toHaveBeenLastCalledWith(0.75);
    quality.invalidate();
    quality.frame(32);
    expect(setScale).toHaveBeenLastCalledWith(0.75);
    expect(setScale).toHaveBeenCalledTimes(2);
  });
  it("uses a lighter moving frame and restores full quality after the camera settles", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(1440, 900);
    quality.markMovement(0);
    quality.frame(16);
    const movingScale = setScale.mock.calls[0]![0] as number;
    expect(movingScale).toBeGreaterThanOrEqual(0.5);
    expect(movingScale).toBeLessThan(1);
    quality.markMovement(180);
    quality.frame(400);
    expect(setScale).toHaveBeenCalledTimes(1);
    quality.frame(481);
    expect(setScale).toHaveBeenLastCalledWith(1);
    quality.frame(600);
    expect(setScale).toHaveBeenCalledTimes(2);
  });
  it("adapts to slow moving frames without repeatedly reallocating the same resolution", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(1440, 900);
    for (let index = 0; index < 50; index++) {
      quality.markMovement(index * 40);
      quality.frame(index * 40);
    }
    expect(setScale).toHaveBeenLastCalledWith(0.5);
    const allocations = setScale.mock.calls.length;
    for (let index = 50; index < 100; index++) {
      quality.markMovement(index * 40);
      quality.frame(index * 40);
    }
    expect(setScale).toHaveBeenCalledTimes(allocations);
  });
  it("preserves sharp PiP previews and ignores zero-sized collapsed containers", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(220, 200);
    quality.setContinuous(true, 0);
    quality.frame(50);
    quality.resize(0, 0);
    quality.frame(400);
    expect(setScale).not.toHaveBeenCalled();
  });
  it("keeps orbiting frames light until orbit is disabled, then restores still quality", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(1440, 900);
    quality.setContinuous(true, 0);
    quality.frame(100);
    quality.frame(800);
    expect(setScale).toHaveBeenCalledTimes(1);
    quality.setContinuous(false, 800);
    quality.frame(1101);
    expect(setScale).toHaveBeenLastCalledWith(1);
  });
  it("does not treat background-tab pauses as a reason to reduce quality", () => {
    const setScale = vi.fn();
    const quality = createRingRenderQuality(1, setScale);
    quality.resize(1000, 800);
    quality.setContinuous(true, 0);
    for (let index = 0; index < 30; index++) quality.frame(index * 1000);
    expect(setScale).toHaveBeenCalledTimes(1);
    expect(setScale).toHaveBeenLastCalledWith(0.75);
  });
});
