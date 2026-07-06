import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "electroshop_cart";

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

  const addItem = (product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, qty: Math.min(qty, product.stock) }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const setQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product._id === productId
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
