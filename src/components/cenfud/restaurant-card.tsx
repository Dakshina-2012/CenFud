import { Link } from "@tanstack/react-router";
import { Clock3, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/lib/cenfud-data";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform hover:-translate-y-1">
    <div className="relative aspect-[16/10] overflow-hidden">
      <img src={restaurant.image} alt={`${restaurant.name} food`} width={1024} height={768} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute bottom-3 left-3 rounded bg-background/95 px-3 py-1.5 text-xs font-bold text-primary shadow">{restaurant.offer}</span>
      <Button variant="secondary" size="icon" className="absolute right-3 top-3 rounded-full" aria-label={`Favorite ${restaurant.name}`}><Heart /></Button>
    </div>
    <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-bold">{restaurant.name}</h3><p className="mt-1 text-sm text-muted-foreground">{restaurant.cuisine}</p></div><span className="flex items-center gap-1 rounded bg-success px-2 py-1 text-xs font-bold text-success-foreground"><Star className="fill-current" />{restaurant.rating}</span></div>
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 />{restaurant.time}</span><span>{restaurant.fee === 0 ? "Free delivery" : `₹${restaurant.fee} delivery`}</span></div>
      <Button asChild variant="outline" className="mt-4 w-full rounded-full"><Link to="/restaurant/$id" params={{ id: restaurant.id }}>View menu</Link></Button>
    </div>
  </article>;
}
