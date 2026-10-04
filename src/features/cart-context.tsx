import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FoodItem } from "@/lib/cenfud-data";

type CartLine = FoodItem & { quantity: number };
type CartContextValue = {
  items: CartLine[]; count: number; subtotal: number;
  addItem: (item: FoodItem) => void; changeQuantity: (id: string, delta: number) => void; clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const KEY = "cenfud-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  useEffect(() => {
    try { const saved = window.localStorage.getItem(KEY); if (saved) setItems(JSON.parse(saved) as CartLine[]); } catch { /* unavailable storage */ }
  }, []);
  useEffect(() => { window.localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (item: FoodItem) => setItems((current) => {
      if (current.length > 0 && current[0]?.restaurantId !== item.restaurantId) {
        if (!window.confirm("Your cart contains items from another restaurant. Start a new cart?")) return current;
        return [{ ...item, quantity: 1 }];
      }
      const existing = current.find((line) => line.id === item.id);
      return existing ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...item, quantity: 1 }];
    }),
    changeQuantity: (id: string, delta: number) => setItems((current) => current.map((line) => line.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0)),
    clear: () => setItems([]),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used inside CartProvider"); return value; }
