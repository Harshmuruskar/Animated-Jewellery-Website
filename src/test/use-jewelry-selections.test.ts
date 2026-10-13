import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  JewelrySelectionsProvider,
  MAX_COMPARISON,
  restoreSelections,
  SELECTION_STORAGE_KEY,
  serializeSelections,
  useJewelrySelections,
} from "@/hooks/use-jewelry-selections";
import { encodeRingDesign } from "@/lib/ring-designs";
import { products, type CustomRing } from "@/lib/jewelry-data";

const specs: CustomRing = {
  gem: "Ruby",
  gemColor: "#f70db1",
  metal: "Silver and gold",
  metalColors: ["#ffffff", "#fea04d"],
  design: "Signature",
  size: "7",
  engraving: "Forever",
  engravingStyle: "Serif",
};
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(JewelrySelectionsProvider, null, children);
beforeEach(() => localStorage.clear());
describe("Browser collections", () => {
  it("filters unknown and duplicate pieces, caps comparison and ignores invalid saved designs", () => {
    const restored = restoreSelections(
      JSON.stringify({
        wishlist: ["aurora", "aurora", "unknown"],
        comparison: products.map((piece) => piece.id),
        designs: [
          null,
          {
            id: "saved",
            name: " My ring ",
            createdAt: "2026-10-13T00:00:00Z",
            configuration: encodeRingDesign(specs),
          },
          { id: "invalid", name: "Ring", createdAt: "invalid", configuration: "bad" },
        ],
      }),
    );
    expect(restored.wishlist).toEqual(["aurora"]);
    expect(restored.comparison).toHaveLength(MAX_COMPARISON);
    expect(restored.designs).toHaveLength(1);
    expect(restored.designs[0]).toMatchObject({ name: "My ring", specs });
    expect(restoreSelections(serializeSelections(restored))).toEqual(restored);
    expect(restoreSelections("broken")).toEqual({ wishlist: [], comparison: [], designs: [] });
  });
  it("hydrates existing favorites before persisting and restores named designs after remount", async () => {
    localStorage.setItem(
      SELECTION_STORAGE_KEY,
      JSON.stringify({ wishlist: ["verde"], comparison: ["aurora"], designs: [] }),
    );
    const { result, unmount } = renderHook(useJewelrySelections, { wrapper });
    await waitFor(() => expect(result.current.wishlist).toEqual(["verde"]));
    act(() => {
      result.current.toggleWishlist("luna");
      result.current.saveDesign(specs, "Our promise");
    });
    const restored = restoreSelections(localStorage.getItem(SELECTION_STORAGE_KEY));
    expect(restored.wishlist).toEqual(["verde", "luna"]);
    expect(restored.designs[0]).toMatchObject({ name: "Our promise", specs });
    unmount();
    const next = renderHook(useJewelrySelections, { wrapper });
    await waitFor(() => expect(next.result.current.designs).toHaveLength(1));
    act(() => next.result.current.deleteDesign(next.result.current.designs[0]!.id));
    expect(next.result.current.designs).toHaveLength(0);
    next.unmount();
  });
  it("keeps comparison at three pieces, permits removal and replacement, and syncs other tabs", () => {
    const { result, unmount } = renderHook(useJewelrySelections, { wrapper });
    for (const product of products.slice(0, 4))
      act(() => result.current.toggleComparison(product.id));
    expect(result.current.comparison).toEqual(products.slice(0, 3).map((product) => product.id));
    act(() => result.current.toggleComparison("aurora"));
    act(() => result.current.toggleComparison("celeste"));
    expect(result.current.comparison).toEqual(["verde", "luna", "celeste"]);
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: SELECTION_STORAGE_KEY,
          newValue: JSON.stringify({ wishlist: ["notte"], comparison: [], designs: [] }),
        }),
      ),
    );
    expect(result.current.wishlist).toEqual(["notte"]);
    expect(result.current.comparison).toEqual([]);
    unmount();
  });
});
