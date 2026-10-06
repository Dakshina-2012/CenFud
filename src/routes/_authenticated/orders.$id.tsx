import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, MapPin, PartyPopper, Printer } from "lucide-react";
import logo from "@/assets/cenfud-logo.png.asset.json";
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
  const qc = useQueryClient();
  const [live, setLive] = useState(false);
  useEffect(() => {
    const ch = supabase.channel(`order-${id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => { qc.setQueryData(["orders", id], payload.new); }).subscribe((st) => setLive(st === "SUBSCRIBED"));
    return () => { supabase.removeChannel(ch); };
  }, [id, qc]);
  const order = useQuery({ queryKey: ["orders", id], refetchInterval: 60000, queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle(); if (error) throw error; return data; } });
  if (order.isLoading) return <p className="px-4 py-16 text-center text-muted-foreground">Loading order…</p>;
  const o = order.data;
  if (!o) return <div className="px-4 py-16 text-center"><h1 className="font-display text-3xl font-black">Order not found</h1><Button asChild className="mt-6 rounded-full"><Link to="/orders">My orders</Link></Button></div>;
  const idx = currentStatusIndex(o.status);
  const lines = o.items as unknown as Line[]; const a = o.address as unknown as Addr;
  const done = idx === STATUS_STEPS.length - 1;
  const eta = new Date(new Date(o.created_at).getTime() + 30 * 60000);
  return <div className="mx-auto max-w-5xl px-4 pb-28 pt-10 sm:px-6"><div className="print:hidden">
    {placed && <div className="mb-6 flex items-center gap-4 rounded-lg bg-success/10 p-5 text-success"><PartyPopper className="h-10 w-10 shrink-0" /><div><p className="text-lg font-black">Order placed successfully!</p><p className="text-sm">{o.payment_method === "COD" ? `Please keep ₹${+o.total} cash ready at delivery.` : `Payment of ₹${+o.total} successful (test mode).`} Follow live updates below.</p></div></div>}
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-primary">{o.order_number}</p><h1 className="mt-1 font-display text-4xl font-black">{o.restaurant_name}</h1></div>{idx >= 0 && !done && <p className="text-sm">Estimated arrival <strong>{eta.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</strong></p>}</div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center justify-between text-lg font-bold">Order status{live && <span className="flex items-center gap-1.5 text-xs font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success" />Live updates</span>}</h2>
        {idx === -1 ? <p className="mt-4 font-semibold text-destructive">This order was cancelled.</p> : <ol className="mt-5 space-y-5">{STATUS_STEPS.map((s, i) => <li key={s.key} className="flex items-center gap-3">{i <= idx ? <CheckCircle2 className="text-success" /> : <Circle className="text-muted-foreground" />}<span className={i === idx ? "font-black" : i < idx ? "font-semibold" : "text-muted-foreground"}>{s.label}</span>{i === idx && !done && <span className="ml-auto animate-pulse rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary motion-reduce:animate-none">Now</span>}</li>)}</ol>}
        <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted text-center text-sm text-muted-foreground"><MapPin className="mb-2 text-primary" />Live rider map will appear here once delivery partners are connected.<span className="mt-1 text-xs">Status changes appear here instantly as the restaurant updates your order.</span></div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5 text-sm"><h3 className="font-bold">Items</h3><ul className="mt-3 space-y-1">{lines.map((l) => <li key={l.id} className="flex justify-between"><span>{l.quantity} × {l.name}</span><span>₹{l.price * l.quantity}</span></li>)}</ul>
          <dl className="mt-4 space-y-1 border-t border-border pt-3 text-muted-foreground"><R l="Subtotal" v={+o.subtotal} /><R l="Delivery" v={+o.delivery_fee} /><R l="Platform fee" v={+o.platform_fee} /><R l="Taxes" v={+o.taxes} />{+o.discount > 0 && <R l="Discount" v={-o.discount} />}</dl>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-black"><span>Total</span><span>₹{+o.total}</span></div>
          <p className="mt-3 text-xs text-muted-foreground">{o.payment_method === "COD" ? "Pay on delivery" : "Paid"} via {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</p></div>
        <Bill o={o} lines={lines} a={a} />
        <div className="rounded-lg border border-border bg-card p-5 text-sm"><h3 className="font-bold">Delivering to · {a.label}</h3><p className="mt-2">{a.full_name} · {a.phone}</p><p className="text-muted-foreground">{[a.address_line, a.apartment, a.area, a.city, a.state].filter(Boolean).join(", ")} – {a.pincode}</p></div>
        <Button asChild variant="outline" className="w-full rounded-full"><Link to="/orders">All my orders</Link></Button>
      </aside>
    </div></div>
    <PrintBill o={o} lines={lines} a={a} />
  </div>;
}
function R({ l, v }: { l: string; v: number }) { return <div className="flex justify-between"><dt>{l}</dt><dd>{v < 0 ? `−₹${-v}` : `₹${v}`}</dd></div>; }

type Order = { id: string; order_number: string; created_at: string; restaurant_name: string; payment_method: string; subtotal: number; delivery_fee: number; platform_fee: number; taxes: number; discount: number; total: number };
function txnId(o: Order) { return o.payment_method === "COD" ? "—" : `TXN${o.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`; }
function Bill({ o, lines, a }: { o: Order; lines: Line[]; a: Addr }) {
  return <div className="rounded-lg border border-border bg-card p-5 text-sm">
    <h3 className="font-bold">Bill & payment</h3>
    <dl className="mt-3 space-y-1 text-muted-foreground">
      <div className="flex justify-between"><dt>Status</dt><dd className="font-semibold text-success">{o.payment_method === "COD" ? "Due on delivery" : "Paid"}</dd></div>
      <div className="flex justify-between"><dt>Transaction ID</dt><dd className="font-mono text-foreground">{txnId(o)}</dd></div>
      <div className="flex justify-between"><dt>Invoice no.</dt><dd className="text-foreground">INV-{o.order_number.slice(4)}</dd></div>
    </dl>
    <Button variant="secondary" className="mt-4 w-full rounded-full" onClick={() => window.print()} aria-label={`Download bill for ${lines.length} items to ${a.city}`}><Printer />Download / print bill</Button>
  </div>;
}
function PrintBill({ o, lines, a }: { o: Order; lines: Line[]; a: Addr }) {
  return <div className="hidden text-sm text-foreground print:block">
    <div className="flex items-center gap-3"><img src={logo.url} alt="CenFud" className="h-14 w-14 rounded-full" /><div><p className="text-xl font-black">CenFud — Tax Invoice</p><p>Invoice INV-{o.order_number.slice(4)} · Order {o.order_number}</p><p>{new Date(o.created_at).toLocaleString("en-IN")}</p></div></div>
    <p className="mt-4"><strong>Restaurant:</strong> {o.restaurant_name}</p>
    <p><strong>Bill to:</strong> {a.full_name}, {a.phone}, {[a.address_line, a.apartment, a.area, a.city, a.state].filter(Boolean).join(", ")} – {a.pincode}</p>
    <table className="mt-4 w-full border-collapse"><thead><tr className="border-b border-border text-left"><th className="py-1">Item</th><th>Qty</th><th>Rate</th><th className="text-right">Amount</th></tr></thead><tbody>{lines.map((l) => <tr key={l.id} className="border-b border-border"><td className="py-1">{l.name}</td><td>{l.quantity}</td><td>₹{l.price}</td><td className="text-right">₹{l.price * l.quantity}</td></tr>)}</tbody></table>
    <dl className="ml-auto mt-3 w-64 space-y-1"><R l="Subtotal" v={+o.subtotal} /><R l="Delivery" v={+o.delivery_fee} /><R l="Platform fee" v={+o.platform_fee} /><R l="GST (5%)" v={+o.taxes} />{+o.discount > 0 && <R l="Discount" v={-o.discount} />}<div className="flex justify-between border-t border-border pt-1 font-black"><dt>Total</dt><dd>₹{+o.total}</dd></div></dl>
    <p className="mt-4">Payment: {PAYMENT_LABELS[o.payment_method] ?? o.payment_method} · {o.payment_method === "COD" ? "Due on delivery" : `Paid · ${txnId(o)}`}</p>
    <p className="mt-6 text-xs">Thank you for ordering with CenFud — Your Food. Your Way.</p>
  </div>;
}
