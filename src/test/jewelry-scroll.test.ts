import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createJewelryScroll } from "@/lib/jewelry-scroll";

const clock = vi.hoisted(() => ({
  tick: undefined as ((time: number) => void) | undefined,
  remove: vi.fn(),
  update: vi.fn(),
}));
vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    ticker: {
      add: (callback: (time: number) => void) => {
        clock.tick = callback;
      },
      remove: clock.remove,
      lagSmoothing: vi.fn(),
    },
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { update: clock.update } }));

let scroll: ReturnType<typeof createJewelryScroll> | undefined;
let currentY = 0;
let time = 1;

beforeEach(() => {
  // Vitest exposes window through its global proxy; Lenis checks instanceof Window.
  vi.stubGlobal(
    "Window",
    class {
      static [Symbol.hasInstance](value: unknown) {
        return value === window;
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  currentY = 0;
  time = 1;
  clock.tick = undefined;
  vi.clearAllMocks();
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => currentY);
  vi.spyOn(document.documentElement, "scrollTop", "get").mockImplementation(() => currentY);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(3000);
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
  vi.spyOn(window, "scrollTo").mockImplementation((options: number | ScrollToOptions) => {
    if (typeof options === "object") currentY = options.top ?? currentY;
  });
});

afterEach(() => {
  scroll?.destroy();
  scroll = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

function frames(count = 60) {
  for (let index = 0; index < count; index++) {
    clock.tick?.(time);
    time += 1 / 60;
  }
}

function wheel(deltaY: number) {
  const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true });
  document.body.dispatchEvent(event);
  return event;
}

describe("Jewelry Lenis scrolling", () => {
  it("locks scrolling for the intro and cancels inertia while customizing", () => {
    scroll = createJewelryScroll(false);
    wheel(500);
    frames();
    expect(currentY).toBe(0);
    scroll.start();
    wheel(500);
    frames(10);
    expect(currentY).toBeGreaterThan(0);
    expect(currentY).toBeLessThan(500);
    scroll.stop();
    const stoppedAt = currentY;
    wheel(500);
    frames();
    expect(currentY).toBe(stoppedAt);
    scroll.start();
    frames();
    expect(currentY).toBe(stoppedAt);
  });

  it("smoothly accumulates wheel input, follows reversals, and synchronizes ScrollTrigger", () => {
    scroll = createJewelryScroll(false);
    scroll.start();
    wheel(400);
    wheel(400);
    frames(10);
    expect(currentY).toBeGreaterThan(0);
    expect(currentY).toBeLessThan(800);
    const beforeReverse = currentY;
    wheel(-600);
    frames(120);
    expect(currentY).toBeLessThan(beforeReverse);
    expect(currentY).toBeCloseTo(200, 0);
    expect(clock.update).toHaveBeenCalled();
  });

  it("responds promptly to a wheel burst without adding another camera easing delay", () => {
    scroll = createJewelryScroll(false);
    scroll.start();
    wheel(600);
    frames(6);
    expect(currentY).toBeGreaterThan(300);
    expect(currentY).toBeLessThan(600);
    frames(30);
    expect(currentY).toBeGreaterThan(595);
  });

  it("jumps immediately for reduced motion and clamps navigation to the page", () => {
    scroll = createJewelryScroll(true);
    scroll.start();
    scroll.scrollTo(10000);
    expect(currentY).toBe(2000);
    scroll.scrollTo(-100);
    expect(currentY).toBe(0);
    expect(wheel(100).defaultPrevented).toBe(false);
  });

  it("removes its clock and wheel handlers on unmount, allowing a clean remount", () => {
    scroll = createJewelryScroll(false);
    const tick = clock.tick;
    scroll.destroy();
    scroll = undefined;
    expect(clock.remove).toHaveBeenCalledWith(tick);
    expect(document.documentElement.classList.contains("lenis")).toBe(false);
    expect(wheel(100).defaultPrevented).toBe(false);
    scroll = createJewelryScroll(false);
    scroll.start();
    wheel(400);
    frames(120);
    expect(currentY).toBeCloseTo(400, 0);
  });

  it("allows native scrolling inside a palette while the page is locked", () => {
    scroll = createJewelryScroll(false);
    document.body.innerHTML = "<div data-lenis-prevent></div>";
    const event = new WheelEvent("wheel", {
      deltaX: 300,
      deltaY: 60,
      bubbles: true,
      cancelable: true,
    });
    document.body.firstElementChild!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(wheel(60).defaultPrevented).toBe(true);
  });
});
