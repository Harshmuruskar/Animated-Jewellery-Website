import { describe, expect, it } from "vitest";
import {
  decodeRingDesign,
  encodeRingDesign,
  gems,
  metals,
  normalizeEngraving,
  ringShareUrl,
} from "@/lib/ring-designs";
import type { CustomRing } from "@/lib/jewelry-data";

const specs: CustomRing = {
  gem: "Emerald",
  gemColor: "#5eca00",
  metal: "Gold and rose",
  metalColors: ["#fea04d", "#fa8787"],
  design: "Halo",
  size: "8",
  engraving: "H & A · 2026 ♡",
  engravingStyle: "Sans",
};
describe("Shared ring configurations", () => {
  it("reopens exact specifications from a portable URL including Unicode engraving", () => {
    const url = new URL(ringShareUrl("https://mancini.example/?campaign=demo#collections", specs));
    expect(url.searchParams.get("campaign")).toBe("demo");
    expect(url.hash).toBe("");
    expect(decodeRingDesign(url.searchParams.get("ring"))).toEqual(specs);
  });
  it("reconstructs both canonical metal colors for every gemstone and finish", () => {
    for (const [gem, gemColor] of gems)
      for (const [metal, first, second] of metals) {
        const ring: CustomRing = {
          gem,
          gemColor,
          metal,
          metalColors: [first, second],
          design: "Signature",
          size: "7",
        };
        expect(decodeRingDesign(encodeRingDesign(ring))).toEqual(ring);
      }
  });
  it("rejects corrupt, oversized, unsupported and injected configuration fields", () => {
    const valid = JSON.parse(encodeRingDesign(specs));
    for (const raw of [
      null,
      "{broken",
      "x".repeat(1501),
      JSON.stringify({ ...valid, v: 2 }),
      JSON.stringify({ ...valid, gem: "Unknown" }),
      JSON.stringify({ ...valid, size: "99" }),
      JSON.stringify({ ...valid, design: "Other" }),
      JSON.stringify({ ...valid, gemColor: "javascript:alert(1)" }),
      JSON.stringify({ ...valid, engravingStyle: "Unknown" }),
    ])
      expect(decodeRingDesign(raw)).toBeNull();
    expect(() => ringShareUrl("javascript:alert(1)", specs)).toThrow();
  });
  it("limits inscriptions by Unicode code points, normalizes text and removes controls", () => {
    expect(normalizeEngraving("a\nb\u0000c")).toBe("a b c");
    expect(normalizeEngraving("e\u0301")).toBe("é");
    expect(Array.from(normalizeEngraving("💍".repeat(40)))).toHaveLength(30);
    expect(
      decodeRingDesign(encodeRingDesign({ ...specs, engraving: "💍".repeat(40) }))?.engraving,
    ).toBe("💍".repeat(30));
  });
});
