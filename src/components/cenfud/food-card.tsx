import { Heart, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart-context";
import type { FoodItem } from "@/lib/cenfud-data";

export function FoodCard({ item }: { item: FoodItem }) {
  const { addItem } = useCart();
  return <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform hover:-translate-y-1">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={item.image} alt={item.name} width={1024} height={768} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      {item.bestseller && <span className="absolute left-3 top-3 rounded bg-brand-warm px-2.5 py-1 text-xs font-bold text-brand-warm-foreground">Bestseller</span>}
      <Button variant="secondary" size="icon" className="absolute right-3 top-3 rounded-full" aria-label={`Favorite ${item.name}`}><Heart /></Button>
    </div>
    <div className="p-4">
      <div className="mb-1 flex items-start justify-between gap-3"><h3 className="font-display text-lg font-bold leading-tight">{item.name}</h3><span className="flex shrink-0 items-center gap-1 text-sm font-semibold"><Star className="fill-brand-warm text-brand-warm" />{item.rating}</span></div>
      <p className="text-xs font-medium text-primary">{item.restaurant}</p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
      <div className="mt-4 flex items-center justify-between"><span className="text-lg font-bold">₹{item.price}</span><Button onClick={() => addItem(item)} className="h-10 rounded-full px-5"><Plus />Add</Button></div>
    </div>
  </article>;
}
