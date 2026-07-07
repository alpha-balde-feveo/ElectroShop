import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, qty?: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  setQty: (productId: string, qty: number, variant?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "electroshop_cart";

const sameLine = (i: CartItem, productId: string, variant = "") =>
  i.product._id === productId && (i.variant ?? "") === variant;

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, qty = 1, variant = "") => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, product._id, variant));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, product._id, variant)
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, qty: Math.min(qty, product.stock), variant }];
    });
  };

  const removeItem = (productId: string, variant = "") => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variant)));
  };

  const setQty = (productId: string, qty: number, variant = "") => {
    setItems((prev) =>
      prev
        .map((i) =>
          sameLine(i, productId, variant)
            ? { ...i, qty: Math.max(1, Math.min(qty, i.product.stock)) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    for (const i of items) {
      c += i.qty;
      s += i.product.price * i.qty;
    }
    return { count: c, subtotal: s };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, addItem, removeItem, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
