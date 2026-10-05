import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart-context";
import { supabase } from "@/integrations/supabase/client";
import { foodItems } from "@/lib/cenfud-data";
import { currentStatusIndex, STATUS_STEPS } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({ meta: [{ title: "My orders — CenFud" }, { name: "description", content: "See your CenFud order history, track active orders and reorder favourites." }, { property: "og:title", content: "My orders — CenFud" }, { property: "og:description", content: "Your CenFud order history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: OrdersPage,
});

type Line = { id: string; quantity: number; name: string };

function OrdersPage() {
  const { addItem, clear } = useCart();
  const navigate = useNavigate();
  const orders = useQuery({ queryKey: ["orders"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  function reorder(lines: Line[]) {
    clear();
    lines.forEach((l) => { const f = foodItems.find((x) => x.id === l.id); if (f) for (let i = 0; i < l.quantity; i++) addItem(f); });
    navigate({ to: "/cart" });
  }
  return <div className="mx-auto max-w-4xl px-4 pb-28 pt-10 sm:px-6">
    <h1 className="font-display text-4xl font-black">My orders</h1>
    {orders.isLoading && <p className="mt-6 text-muted-foreground">Loading orders…</p>}
    {orders.isError && <p className="mt-6 text-destructive">Couldn't load your orders.</p>}
    {orders.data?.length === 0 && <div className="mt-12 text-center"><Receipt className="mx-auto h-14 w-14 text-primary" /><p className="mt-4 font-bold">No orders yet</p><Button asChild className="mt-4 rounded-full"><Link to="/restaurants" search={{ category: "" }}>Order something delicious</Link></Button></div>}
    <div className="mt-6 grid gap-4">{orders.data?.map((o) => {
      const idx = currentStatusIndex(o.status, o.created_at); const lines = o.items as unknown as Line[];
      return <div key={o.id} className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold">{o.restaurant_name}</h2><p className="text-xs text-muted-foreground">{o.order_number} · {new Date(o.created_at).toLocaleString("en-IN")}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${idx === -1 ? "bg-destructive/15 text-destructive" : idx === STATUS_STEPS.length - 1 ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>{idx === -1 ? "Cancelled" : STATUS_STEPS[idx]!.label}</span></div>
        <p className="mt-3 text-sm text-muted-foreground">{lines.map((l) => `${l.quantity} × ${l.name}`).join(", ")}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><strong>₹{Number(o.total)}</strong><div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-full" onClick={() => reorder(lines)}>Reorder</Button><Button asChild size="sm" className="rounded-full"><Link to="/orders/$id" params={{ id: o.id }} search={{ placed: false }}>{idx >= 0 && idx < STATUS_STEPS.length - 1 ? "Track order" : "View details"}</Link></Button></div></div>
      </div>;
    })}</div>
  </div>;
}
