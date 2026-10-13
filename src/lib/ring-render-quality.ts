const SETTLE_TIME = 300;
const SAMPLE_WINDOW = 12;
const SLOW_FRAME_TIME = 28;
const MIN_MOTION_SCALE = 0.5;
const MOTION_PIXEL_BUDGET = 700_000;

// Keep the original still-image quality, but bound the fill rate while animating.
// Quality changes happen at frame boundaries, never on individual wheel events.
export function createRingRenderQuality(idleScale: number, setScale: (scale: number) => void) {
  let width = 1;
  let height = 1;
  let moving = false;
  let continuous = false;
  let lastMovement = 0;
  let previousFrame: number | undefined;
  let frameTotal = 0;
  let frameSamples = 0;
  let motionScale = Math.min(idleScale, 0.75);
  let appliedScale = idleScale;

  const apply = (scale: number) => {
    // Changing the scale reallocates render targets. Avoid repeated allocations.
    if (Math.abs(scale - appliedScale) < 0.001) return;
    appliedScale = scale;
    setScale(scale);
  };
  const clearSamples = () => {
    previousFrame = undefined;
    frameTotal = 0;
    frameSamples = 0;
  };

  return {
    invalidate: () => {
      // Imported viewer configurations may overwrite the renderer's scale.
      appliedScale = -1;
      clearSamples();
    },
    resize: (nextWidth: number, nextHeight: number) => {
      if (nextWidth <= 0 || nextHeight <= 0) return;
      width = nextWidth;
      height = nextHeight;
      clearSamples();
    },
    markMovement: (time: number) => {
      if (!moving) clearSamples();
      moving = true;
      lastMovement = time;
    },
    setContinuous: (enabled: boolean, time: number) => {
      continuous = enabled;
      moving = true;
      lastMovement = time;
      clearSamples();
    },
    frame: (time: number) => {
      if (moving && !continuous && time - lastMovement >= SETTLE_TIME) {
        moving = false;
        clearSamples();
      }
      if (!moving) {
        apply(idleScale);
        return;
      }

      const area = width * height;
      // A small PiP already has a tiny render target; keep its preview sharp.
      if (area <= 120_000) {
        apply(idleScale);
        return;
      }
      if (previousFrame !== undefined) {
        const delta = time - previousFrame;
        // Ignore pauses/background tabs rather than treating them as slow GPUs.
        if (delta > 0 && delta < 150) {
          frameTotal += delta;
          frameSamples++;
        }
        if (frameSamples >= SAMPLE_WINDOW) {
          if (frameTotal / frameSamples > SLOW_FRAME_TIME)
            motionScale = Math.max(Math.min(idleScale, MIN_MOTION_SCALE), motionScale - 0.1);
          frameTotal = 0;
          frameSamples = 0;
        }
      }
      previousFrame = time;
      const pixelScale = Math.max(MIN_MOTION_SCALE, Math.sqrt(MOTION_PIXEL_BUDGET / area));
      apply(Math.min(idleScale, motionScale, pixelScale));
    },
  };
}
