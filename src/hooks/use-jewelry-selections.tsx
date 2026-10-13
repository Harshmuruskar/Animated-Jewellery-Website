import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products, type CustomRing } from "@/lib/jewelry-data";
import { decodeRingDesign, encodeRingDesign } from "@/lib/ring-designs";

export type SavedRing = { id: string; name: string; createdAt: string; specs: CustomRing };
export type JewelrySelections = { wishlist: string[]; comparison: string[]; designs: SavedRing[] };
export const SELECTION_STORAGE_KEY = "mancini-selections-v1";
export const MAX_COMPARISON = 3;
const empty: JewelrySelections = { wishlist: [], comparison: [], designs: [] };
export function restoreSelections(raw: string | null): JewelrySelections {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return empty;
    const ids = (items: unknown): string[] =>
      Array.isArray(items)
        ? [
            ...new Set(
              items.filter(
                (id): id is string =>
                  typeof id === "string" && products.some((product) => product.id === id),
              ),
            ),
          ]
        : [];
    const designs: SavedRing[] = [];
    if (Array.isArray(value.designs))
      for (const saved of value.designs.slice(0, 20)) {
        if (
          !saved ||
          typeof saved.id !== "string" ||
          saved.id.length > 80 ||
          typeof saved.name !== "string" ||
          !saved.name.trim() ||
          typeof saved.createdAt !== "string" ||
          !Number.isFinite(Date.parse(saved.createdAt)) ||
          typeof saved.configuration !== "string"
        )
          continue;
        const specs = decodeRingDesign(saved.configuration);
        if (specs && !designs.some((design) => design.id === saved.id))
          designs.push({
            id: saved.id,
            name: saved.name.trim().slice(0, 60),
            createdAt: saved.createdAt,
            specs,
          });
      }
    return {
      wishlist: ids(value.wishlist),
      comparison: ids(value.comparison).slice(0, MAX_COMPARISON),
      designs,
    };
  } catch {
    return empty;
  }
}
export function serializeSelections(state: JewelrySelections) {
  return JSON.stringify({
    ...state,
    designs: state.designs.map(({ specs, ...design }) => ({
      ...design,
      configuration: encodeRingDesign(specs),
    })),
  });
}

function useSelectionValue() {
  const [state, setState] = useState<JewelrySelections>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  useEffect(() => {
    try {
      setState(restoreSelections(localStorage.getItem(SELECTION_STORAGE_KEY)));
    } catch {
      /* Storage can be disabled. */
    }
    setHydrated(true);
    const update = (event: StorageEvent) => {
      if (event.key === SELECTION_STORAGE_KEY) setState(restoreSelections(event.newValue));
    };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SELECTION_STORAGE_KEY, serializeSelections(state));
    } catch {
      /* Preserve in-memory selections. */
    }
  }, [state, hydrated]);
  return {
    ...state,
    savedOpen,
    setSavedOpen,
    comparisonOpen,
    setComparisonOpen,
    toggleWishlist: (id: string) => {
      if (!products.some((product) => product.id === id)) return;
      setState((current) => ({
        ...current,
        wishlist: current.wishlist.includes(id)
          ? current.wishlist.filter((saved) => saved !== id)
          : [...current.wishlist, id],
      }));
    },
    toggleComparison: (id: string) => {
      if (!products.some((product) => product.id === id)) return;
      setState((current) => ({
        ...current,
        comparison: current.comparison.includes(id)
          ? current.comparison.filter((saved) => saved !== id)
          : current.comparison.length >= MAX_COMPARISON
            ? current.comparison
            : [...current.comparison, id],
      }));
    },
    clearComparison: () => setState((current) => ({ ...current, comparison: [] })),
    saveDesign: (specs: CustomRing, name: string) => {
      const validated = decodeRingDesign(encodeRingDesign(specs))!;
      const design: SavedRing = {
        id: crypto.randomUUID(),
        name: name.trim().slice(0, 60) || `${specs.gem} ${specs.design}`,
        createdAt: new Date().toISOString(),
        specs: validated,
      };
      setState((current) => ({ ...current, designs: [design, ...current.designs].slice(0, 20) }));
      return design;
    },
    deleteDesign: (id: string) =>
      setState((current) => ({
        ...current,
        designs: current.designs.filter((design) => design.id !== id),
      })),
  };
}
const SelectionContext = createContext<ReturnType<typeof useSelectionValue> | null>(null);
export function JewelrySelectionsProvider({ children }: { children: ReactNode }) {
  const value = useSelectionValue();
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}
export function useJewelrySelections() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("JewelrySelectionsProvider is required");
  return context;
}
