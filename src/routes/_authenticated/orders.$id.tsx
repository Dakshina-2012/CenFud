import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, MapPin, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { currentStatusIndex, PAYMENT_LABELS, STATUS_STEPS } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  validateSearch: z.object({ placed: z.boolean().catch(false) }),
  head: () => ({ meta: [{ title: "Track your order — CenFud" }, { name: "description", content: "Follow your CenFud order from the kitchen to your door." }, { property: "og:title", content: "Track your order — CenFud" }, { property: "og:description", content: "CenFud order tracking." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: OrderPage,
});

type Line = { id: string; name: string; price: number; quantity: number };
type Addr = { label: string; full_name: string; phone: string; address_line: string; apartment?: string; area: string; city: string; state: string; pincode: string };

function OrderPage() {
  const { id } = Route.useParams();
  const { placed } = Route.useSearch();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);
  const order = useQuery({ queryKey: ["orders", id], refetchInterval: 30000, queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle(); if (error) throw error; return data; } });
  if (order.isLoading) return <p className="px-4 py-16 text-center text-muted-foreground">Loading order…</p>;
  const o = order.data;
  if (!o) return <div className="px-4 py-16 text-center"><h1 className="font-display text-3xl font-black">Order not found</h1><Button asChild className="mt-6 rounded-full"><Link to="/orders">My orders</Link></Button></div>;
  const idx = currentStatusIndex(o.status, o.created_at, now);
  const lines = o.items as unknown as Line[]; const a = o.address as unknown as Addr;
  const done = idx === STATUS_STEPS.length - 1;
  const eta = new Date(new Date(o.created_at).getTime() + 30 * 60000);
  return <div className="mx-auto max-w-5xl px-4 pb-28 pt-10 sm:px-6">
    {placed && <div className="mb-6 flex items-center gap-4 rounded-lg bg-success/10 p-5 text-success"><PartyPopper className="h-10 w-10 shrink-0" /><div><p className="text-lg font-black">Order placed successfully!</p><p className="text-sm">{o.payment_method === "COD" ? "Please keep cash ready at delivery." : "Test payment received."} Order ID {o.order_number}</p></div></div>}
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-primary">{o.order_number}</p><h1 className="mt-1 font-display text-4xl font-black">{o.restaurant_name}</h1></div>{idx >= 0 && !done && <p className="text-sm">Estimated arrival <strong>{eta.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</strong></p>}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Order status</h2>
        {idx === -1 ? <p className="mt-4 font-semibold text-destructive">This order was cancelled.</p> : <ol className="mt-5 space-y-5">{STATUS_STEPS.map((s, i) => <li key={s.key} className="flex items-center gap-3">{i <= idx ? <CheckCircle2 className="text-success" /> : <Circle className="text-muted-foreground" />}<span className={i === idx ? "font-black" : i < idx ? "font-semibold" : "text-muted-foreground"}>{s.label}</span>{i === idx && !done && <span className="ml-auto animate-pulse rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary motion-reduce:animate-none">Now</span>}</li>)}</ol>}
        <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted text-center text-sm text-muted-foreground"><MapPin className="mb-2 text-primary" />Live rider map will appear here once delivery partners are connected.<span className="mt-1 text-xs">Test mode: status updates automatically over ~30 minutes.</span></div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5 text-sm"><h3 className="font-bold">Items</h3><ul className="mt-3 space-y-1">{lines.map((l) => <li key={l.id} className="flex justify-between"><span>{l.quantity} × {l.name}</span><span>₹{l.price * l.quantity}</span></li>)}</ul>
          <dl className="mt-4 space-y-1 border-t border-border pt-3 text-muted-foreground"><R l="Subtotal" v={+o.subtotal} /><R l="Delivery" v={+o.delivery_fee} /><R l="Platform fee" v={+o.platform_fee} /><R l="Taxes" v={+o.taxes} />{+o.discount > 0 && <R l="Discount" v={-o.discount} />}</dl>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-black"><span>Total</span><span>₹{+o.total}</span></div>
          <p className="mt-3 text-xs text-muted-foreground">Paid via {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</p></div>
        <div className="rounded-lg border border-border bg-card p-5 text-sm"><h3 className="font-bold">Delivering to · {a.label}</h3><p className="mt-2">{a.full_name} · {a.phone}</p><p className="text-muted-foreground">{[a.address_line, a.apartment, a.area, a.city, a.state].filter(Boolean).join(", ")} – {a.pincode}</p></div>
        <Button asChild variant="outline" className="w-full rounded-full"><Link to="/orders">All my orders</Link></Button>
      </aside>
    </div>
  </div>;
}
function R({ l, v }: { l: string; v: number }) { return <div className="flex justify-between"><dt>{l}</dt><dd>{v < 0 ? `−₹${-v}` : `₹${v}`}</dd></div>; }
