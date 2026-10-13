import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { customRingPrice, products, type CustomRing, type Product } from "@/lib/jewelry-data";
import { normalizeEngraving } from "@/lib/ring-designs";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  gemColor: string;
  metal: string;
  size: string;
  custom: CustomRing | null;
};
export type CartState = {
  items: CartItem[];
  giftWrap: boolean;
  giftMessage: string;
  engraving: string;
};
export const emptyCart: CartState = { items: [], giftWrap: true, giftMessage: "", engraving: "" };
export const CART_STORAGE_KEY = "mancini-bag-v1";
export const DELIVERY_THRESHOLD = 15000;
export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "quantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "restore"; state: CartState }
  | { type: "preferences"; preferences: Partial<Omit<CartState, "items">> };

export function catalogCartItem(product: Product, size = "7"): CartItem {
  const selectedSize = product.category === "Rings" ? size : "One size";
  return {
    key: JSON.stringify([product.id, selectedSize]),
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.image,
    gemColor: product.gemColor,
    metal: product.metalType,
    size: selectedSize,
    custom: null,
  };
}
export function customCartItem(specs: CustomRing): CartItem {
  return {
    key: JSON.stringify([
      "custom",
      specs.design,
      specs.gem,
      specs.gemColor,
      specs.metal,
      specs.metalColors,
      specs.size,
      specs.engraving ?? "",
      specs.engraving ? (specs.engravingStyle ?? "Serif") : "",
    ]),
    productId: "custom",
    name: `Your ${specs.design} Ring`,
    price: customRingPrice(specs),
    quantity: 1,
    image: "ring",
    gemColor: specs.gemColor,
    metal: specs.metal,
    size: specs.size,
    custom: { ...specs, metalColors: [...specs.metalColors] },
  };
}
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const exists = state.items.some((item) => item.key === action.item.key);
      return {
        ...state,
        items: exists
          ? state.items.map((item) =>
              item.key === action.item.key
                ? { ...item, quantity: Math.min(10, item.quantity + 1) }
                : item,
            )
          : [...state.items, { ...action.item, quantity: 1 }],
      };
    }
    case "quantity":
      if (!Number.isFinite(action.quantity)) return state;
      if (action.quantity <= 0)
        return { ...state, items: state.items.filter((item) => item.key !== action.key) };
      return {
        ...state,
        items: state.items.map((item) =>
          item.key === action.key
            ? { ...item, quantity: Math.min(10, Math.floor(action.quantity)) }
            : item,
        ),
      };
    case "remove":
      return { ...state, items: state.items.filter((item) => item.key !== action.key) };
    case "clear":
      return { ...emptyCart, items: [] };
    case "restore":
      return action.state;
    case "preferences":
      return { ...state, ...action.preferences };
  }
}
export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return {
    subtotal,
    count: items.reduce((total, item) => total + item.quantity, 0),
    deliveryProgress: Math.min(100, (subtotal / DELIVERY_THRESHOLD) * 100),
    deliveryRemaining: Math.max(0, DELIVERY_THRESHOLD - subtotal),
  };
}

export function restoreCart(raw: string | null): CartState {
  if (!raw) return emptyCart;
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.items)) return emptyCart;
    const items: CartItem[] = [];
    for (const saved of value.items.slice(0, 100)) {
      if (
        !saved ||
        !Number.isInteger(saved.quantity) ||
        saved.quantity < 1 ||
        typeof saved.size !== "string" ||
        saved.size.length > 20
      )
        continue;
      let item: CartItem;
      if (saved.productId === "custom") {
        const specs = saved.custom;
        if (
          !specs ||
          !["Signature", "Halo"].includes(specs.design) ||
          typeof specs.gem !== "string" ||
          specs.gem.length > 40 ||
          typeof specs.metal !== "string" ||
          specs.metal.length > 40 ||
          !/^#[0-9a-f]{6}$/i.test(specs.gemColor) ||
          !Array.isArray(specs.metalColors) ||
          specs.metalColors.length !== 2 ||
          !specs.metalColors.every(
            (color: unknown) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
          )
        )
          continue;
        const engraving =
          typeof specs.engraving === "string" ? normalizeEngraving(specs.engraving).trim() : "";
        item = customCartItem({
          gem: specs.gem,
          gemColor: specs.gemColor,
          metal: specs.metal,
          metalColors: specs.metalColors,
          design: specs.design,
          size: saved.size,
          ...(engraving
            ? { engraving, engravingStyle: specs.engravingStyle === "Sans" ? "Sans" : "Serif" }
            : {}),
        });
      } else {
        const product = products.find((candidate) => candidate.id === saved.productId);
        if (!product) continue;
        item = catalogCartItem(product, saved.size);
      }
      const existing = items.find((candidate) => candidate.key === item.key);
      if (existing) existing.quantity = Math.min(10, existing.quantity + saved.quantity);
      else items.push({ ...item, quantity: Math.min(10, saved.quantity) });
    }
    return {
      items,
      giftWrap: value.giftWrap !== false,
      giftMessage: typeof value.giftMessage === "string" ? value.giftMessage.slice(0, 240) : "",
      engraving: typeof value.engraving === "string" ? value.engraving.slice(0, 30) : "",
    };
  } catch {
    return emptyCart;
  }
}

function useCartValue() {
  const [state, dispatch] = useReducer(cartReducer, emptyCart);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  useEffect(() => {
    try {
      dispatch({ type: "restore", state: restoreCart(localStorage.getItem(CART_STORAGE_KEY)) });
    } catch {
      /* Browser storage can be unavailable. */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Keep the bag usable in memory. */
    }
  }, [state, hydrated]);
  const totals = useMemo(() => cartTotals(state.items), [state.items]);
  return {
    ...state,
    ...totals,
    cartOpen,
    setCartOpen,
    conciergeOpen,
    setConciergeOpen,
    addProduct: (product: Product, size?: string) =>
      dispatch({ type: "add", item: catalogCartItem(product, size) }),
    addCustomRing: (specs: CustomRing) => dispatch({ type: "add", item: customCartItem(specs) }),
    updateQuantity: (key: string, quantity: number) =>
      dispatch({ type: "quantity", key, quantity }),
    removeItem: (key: string) => dispatch({ type: "remove", key }),
    clearCart: () => dispatch({ type: "clear" }),
    setPreferences: (preferences: Partial<Omit<CartState, "items">>) =>
      dispatch({ type: "preferences", preferences }),
  };
}
const CartContext = createContext<ReturnType<typeof useCartValue> | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartValue();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCartStore() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartStore must be used inside CartProvider");
  return context;
}
