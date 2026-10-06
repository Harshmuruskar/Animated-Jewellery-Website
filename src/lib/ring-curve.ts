export type RingRotationPoint = {
  x: number;
  y: number;
  z: number;
};

export type RingRotationCurve = {
  keyframes: RingRotationPoint[];
  summary: string;
};

export const DEFAULT_RING_CURVE: RingRotationCurve = {
  keyframes: [
    { x: 0, y: 0, z: 0 },
    { x: -0.36, y: -0.25, z: 0.05 },
    { x: -0.72, y: -0.5, z: 0.1 },
    { x: -0.06, y: 0.01, z: 0.375 },
    { x: 0.6, y: 0.52, z: 0.65 },
  ],
  summary: "A measured turn keeps the diamonds facing forward through each scene.",
};

export function sampleRingRotation(curve: RingRotationCurve, progress: number): RingRotationPoint {
  const boundedProgress = Math.min(1, Math.max(0, progress));
  const scaledProgress = boundedProgress * (curve.keyframes.length - 1);
  const segment = Math.min(curve.keyframes.length - 2, Math.floor(scaledProgress));
  const amount = scaledProgress >= curve.keyframes.length - 1 ? 1 : scaledProgress - segment;
  const easedAmount = amount * amount * (3 - 2 * amount);
  const start = curve.keyframes[segment];
  const end = curve.keyframes[segment + 1];

  return {
    x: start.x + (end.x - start.x) * easedAmount,
    y: start.y + (end.y - start.y) * easedAmount,
    z: start.z + (end.z - start.z) * easedAmount,
  };
}