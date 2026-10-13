import { z } from "zod";
import type { CustomRing } from "./jewelry-data";

export const gems: [string, string, string][] = [
  ["Ruby", "#f70db1", "ruby.9da343b5.svg"],
  ["Faint", "#cfecec", "faint.0d850f19.svg"],
  ["Fancy", "#a9cbe2", "fancy.dada7bdd.svg"],
  ["Aquamarine", "#62cffe", "aqua.755a8510.svg"],
  ["Swiss blue", "#76dce4", "swiss.b5799f23.svg"],
  ["Yellow", "#efe75b", "yellow.cc990856.svg"],
  ["Orange", "#eb8e17", "orange.4a867210.svg"],
  ["Green", "#17ebb5", "green.cc131b3c.svg"],
  ["Emerald", "#5eca00", "emerald.b61f0fe9.svg"],
  ["Rose", "#fa37d7", "rose.a498b2f5.svg"],
  ["Violet", "#c200f2", "violet.d61091fd.svg"],
];
export const metals: [string, string, string, string][] = [
  ["Default", "#fea04d", "#ffffff", "default.d41b035d.png"],
  ["Silver and gold", "#ffffff", "#fea04d", "silver_gold.68ce4867.png"],
  ["Silver", "#ffffff", "#ffffff", "silver_silver.c0f79122.png"],
  ["Gold", "#fea04d", "#fea04d", "gold_gold.b32d73ce.png"],
  ["Rose and silver", "#fa8787", "#ffffff", "rose_silver.cb0922ee.png"],
  ["Gold and rose", "#fea04d", "#fa8787", "gold_rose.2b9d889a.png"],
  ["Rose gold", "#fa8787", "#fa8787", "rose_rose.8dafeb12.png"],
];
export const engravingStyles = ["Serif", "Sans"] as const;
export const ENGRAVING_LIMIT = 30;
export function normalizeEngraving(value: string) {
  return Array.from(value.normalize("NFC"))
    .slice(0, ENGRAVING_LIMIT)
    .map((character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 ? " " : character,
    )
    .join("");
}
const compactDesignSchema = z
  .object({
    v: z.literal(1),
    gem: z.string().refine((value) => gems.some(([name]) => name === value)),
    metal: z.string().refine((value) => metals.some(([name]) => name === value)),
    design: z.enum(["Signature", "Halo"]),
    size: z.string().regex(/^(?:[4-9]|1[0-2])$/),
    engraving: z.string().max(60).optional(),
    engravingStyle: z.enum(engravingStyles).optional(),
  })
  .strict();

export function encodeRingDesign(specs: CustomRing) {
  const data = compactDesignSchema.parse({
    v: 1,
    gem: specs.gem,
    metal: specs.metal,
    design: specs.design,
    size: specs.size,
    ...(specs.engraving
      ? {
          engraving: normalizeEngraving(specs.engraving),
          engravingStyle: specs.engravingStyle ?? "Serif",
        }
      : {}),
  });
  return JSON.stringify(data);
}
export function decodeRingDesign(raw: string | null): CustomRing | null {
  if (!raw || raw.length > 1500) return null;
  try {
    const result = compactDesignSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const selectedGem = gems.find(([name]) => name === result.data.gem)!;
    const selectedMetal = metals.find(([name]) => name === result.data.metal)!;
    const engraving = normalizeEngraving(result.data.engraving ?? "");
    return {
      gem: selectedGem[0],
      gemColor: selectedGem[1],
      metal: selectedMetal[0],
      metalColors: [selectedMetal[1], selectedMetal[2]],
      design: result.data.design,
      size: result.data.size,
      ...(engraving ? { engraving, engravingStyle: result.data.engravingStyle ?? "Serif" } : {}),
    };
  } catch {
    return null;
  }
}
export function ringShareUrl(base: string, specs: CustomRing) {
  const url = new URL(base);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("A web address is required.");
  url.searchParams.set("ring", encodeRingDesign(specs));
  url.hash = "";
  return url.toString();
}
