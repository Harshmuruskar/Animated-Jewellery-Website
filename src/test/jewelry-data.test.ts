import { describe, expect, it } from "vitest";
import {
  caratDiameter,
  categories,
  customRingPrice,
  formatPrice,
  products,
  ringSizes,
  selectProducts,
} from "@/lib/jewelry-data";

describe("Jewelry collection", () => {
  it("includes complete products across every collection category", () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    for (const category of categories.filter((category) => category !== "All")) {
      expect(selectProducts(category, "featured").length).toBeGreaterThan(0);
    }
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.caratWeight).toBeGreaterThan(0);
      for (const field of [
        product.name,
        product.description,
        product.metalType,
        product.gemType,
        product.image,
        product.dimensions,
        product.stockStatus,
      ])
        expect(field.length).toBeGreaterThan(0);
      expect(product.gemColor).toMatch(/^#[a-f0-9]{6}$/i);
    }
  });
  it("filters and sorts without changing featured order", () => {
    const originalOrder = products.map((product) => product.id);
    expect(
      selectProducts("Rings", "featured").every((product) => product.category === "Rings"),
    ).toBe(true);
    const ascending = selectProducts("All", "price-asc").map((product) => product.price);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
    expect(selectProducts("All", "price-desc").map((product) => product.price)).toEqual(
      [...ascending].reverse(),
    );
    expect(products.map((product) => product.id)).toEqual(originalOrder);
  });
  it("formats USD prices and includes all bespoke premiums", () => {
    expect(formatPrice(18500)).toBe("$18,500");
    expect(customRingPrice({ gem: "Faint", metal: "Default", design: "Signature" })).toBe(18500);
    expect(customRingPrice({ gem: "Emerald", metal: "Rose gold", design: "Halo" })).toBe(25100);
  });
  it("interpolates approximate diameters and keeps sizing conversions consistent", () => {
    expect(caratDiameter(2)).toBe(8.1);
    expect(caratDiameter(2.5)).toBeCloseTo(8.7);
    expect(caratDiameter(0)).toBe(5.8);
    expect(caratDiameter(8)).toBe(11.1);
    expect(ringSizes.find((size) => size.us === "7")).toMatchObject({
      uk: "N",
      eu: "54",
      jp: "14",
      diameter: 17.3,
    });
    for (const size of ringSizes)
      expect(Math.abs(Number(size.eu) - Math.PI * size.diameter)).toBeLessThan(0.6);
  });
});
