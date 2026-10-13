import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  CART_STORAGE_KEY,
  CartProvider,
  cartReducer,
  cartTotals,
  catalogCartItem,
  customCartItem,
  emptyCart,
  restoreCart,
  useCartStore,
} from "@/hooks/use-cart-store";
import { products, type CustomRing } from "@/lib/jewelry-data";

const specs: CustomRing = {
  gem: "Emerald",
  gemColor: "#5eca00",
  metal: "Rose gold",
  metalColors: ["#fa8787", "#fa8787"],
  design: "Halo",
  size: "8",
};
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(CartProvider, null, children);
beforeEach(() => localStorage.clear());

describe("Luxury bag", () => {
  it("keeps different inscriptions and typefaces separate and restores them", () => {
    let state = emptyCart;
    for (const custom of [
      { ...specs, engraving: "Forever", engravingStyle: "Serif" as const },
      { ...specs, engraving: "Always", engravingStyle: "Serif" as const },
      { ...specs, engraving: "Forever", engravingStyle: "Sans" as const },
    ])
      state = cartReducer(state, { type: "add", item: customCartItem(custom) });
    state = cartReducer(state, {
      type: "add",
      item: customCartItem({ ...specs, engraving: "Forever", engravingStyle: "Serif" }),
    });
    expect(state.items).toHaveLength(3);
    expect(state.items[0]!.quantity).toBe(2);
    expect(restoreCart(JSON.stringify(state))).toEqual(state);
  });
  it("merges the same piece while retaining separate ring sizes", () => {
    const ring = catalogCartItem(products[0]!, "7");
    let state = cartReducer(emptyCart, { type: "add", item: ring });
    state = cartReducer(state, { type: "add", item: ring });
    state = cartReducer(state, { type: "add", item: catalogCartItem(products[0]!, "8") });
    expect(state.items).toHaveLength(2);
    expect(state.items[0]!.quantity).toBe(2);
    expect(cartTotals(state.items)).toMatchObject({
      count: 3,
      subtotal: 55500,
      deliveryProgress: 100,
      deliveryRemaining: 0,
    });
  });
  it("retains exact custom specifications and separates different finishes", () => {
    const item = customCartItem(specs);
    let state = cartReducer(emptyCart, { type: "add", item });
    state = cartReducer(state, {
      type: "add",
      item: customCartItem({ ...specs, metal: "Gold", metalColors: ["#fea04d", "#fea04d"] }),
    });
    expect(state.items).toHaveLength(2);
    expect(state.items[0]!.custom).toEqual(specs);
    expect(state.items[0]!.price).toBe(25100);
    specs.metalColors[0] = "#ffffff";
    expect(state.items[0]!.custom!.metalColors[0]).toBe("#fa8787");
    specs.metalColors[0] = "#fa8787";
  });
  it("validates quantities, removes items at zero, and calculates delivery progress", () => {
    const item = catalogCartItem(products[2]!);
    let state = cartReducer(emptyCart, { type: "add", item });
    expect(cartTotals(state.items).deliveryProgress).toBeCloseTo((9200 / 15000) * 100);
    expect(cartTotals(state.items).deliveryRemaining).toBe(5800);
    expect(cartReducer(state, { type: "quantity", key: item.key, quantity: NaN })).toEqual(state);
    state = cartReducer(state, { type: "quantity", key: item.key, quantity: 30 });
    expect(state.items[0]!.quantity).toBe(10);
    state = cartReducer(state, { type: "quantity", key: item.key, quantity: 0 });
    expect(state.items).toEqual([]);
    expect(cartTotals(state.items).subtotal).toBe(0);
  });
  it("preserves gift preferences until the bag is cleared", () => {
    const state = cartReducer(emptyCart, {
      type: "preferences",
      preferences: { giftWrap: false, giftMessage: "With love", engraving: "Forever" },
    });
    expect(state.giftMessage).toBe("With love");
    expect(cartReducer(state, { type: "clear" })).toEqual(emptyCart);
  });
  it("restores selections using current prices and ignores corrupt data", () => {
    const item = customCartItem(specs);
    const saved = JSON.stringify({ ...emptyCart, items: [{ ...item, price: 1, quantity: 2 }] });
    const restored = restoreCart(saved);
    expect(restored.items[0]!.price).toBe(25100);
    expect(restored.items[0]!.quantity).toBe(2);
    expect(restored.items[0]!.custom).toEqual(specs);
    expect(restoreCart("{invalid")).toEqual(emptyCart);
    expect(
      restoreCart(
        JSON.stringify({ items: [null, { productId: "missing", quantity: 1, size: "7" }] }),
      ).items,
    ).toEqual([]);
  });
  it("hydrates without overwriting a saved bag and persists hook updates", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ ...emptyCart, items: [customCartItem(specs)] }),
    );
    const { result, unmount } = renderHook(useCartStore, { wrapper });
    await waitFor(() => expect(result.current.count).toBe(1));
    expect(result.current.items[0]!.custom).toEqual(specs);
    act(() => {
      result.current.addProduct(products[2]!);
      result.current.setPreferences({ engraving: "Always" });
    });
    expect(result.current.subtotal).toBe(34300);
    expect(restoreCart(localStorage.getItem(CART_STORAGE_KEY)).engraving).toBe("Always");
    unmount();
    const remounted = renderHook(useCartStore, { wrapper });
    await waitFor(() => expect(remounted.result.current.count).toBe(2));
    remounted.unmount();
  });
});
