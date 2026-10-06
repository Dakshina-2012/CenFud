import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_LABELS, STATUS_STEPS } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Manage orders — CenFud Admin" }, { name: "description", content: "Update CenFud order statuses for customers in real time." }, { property: "og:title", content: "Manage orders — CenFud Admin" }, { property: "og:description", content: "CenFud admin order management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

const ALL = [...STATUS_STEPS.map((s) => ({ key: s.key as string, label: s.label })), { key: "CANCELLED", label: "Cancelled" }];
const labelOf = (k: string) => ALL.find((s) => s.key === k)?.label ?? k;
type Line = { name: string; quantity: number };

function AdminOrders() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("ACTIVE");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const role = useQuery({ queryKey: ["is-admin", user.id], queryFn: async () => { const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(); return !!data; } });
  const orders = useQuery({ enabled: role.data === true, queryKey: ["admin-orders"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200); if (error) throw error; return data; } });
  useEffect(() => {
    if (role.data !== true) return;
    const ch = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => qc.invalidateQueries({ queryKey: ["admin-orders"] })).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [role.data, qc]);

  if (role.isLoading) return <p className="px-4 py-16 text-center text-muted-foreground">Checking access…</p>;
  if (!role.data) return <div className="mx-auto max-w-md px-4 py-16 text-center"><ShieldAlert className="mx-auto h-12 w-12 text-destructive" /><h1 className="mt-4 font-display text-3xl font-black">Admins only</h1><p className="mt-2 text-muted-foreground">Your account doesn't have permission to manage orders.</p><Button asChild className="mt-6 rounded-full"><Link to="/">Go home</Link></Button></div>;

  async function update(id: string, status: string) {
    setErr(""); setBusy(id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setBusy(null);
    if (error) setErr("Couldn't update that order. Please try again.");
    else qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  const list = (orders.data ?? []).filter((o) => filter === "ALL" ? true : filter === "ACTIVE" ? !["DELIVERED", "CANCELLED"].includes(o.status) : o.status === filter);
  return <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-primary">Admin</p><h1 className="mt-1 font-display text-4xl font-black">Manage orders</h1></div>
      <div className="flex flex-wrap gap-2">{[["ACTIVE", "Active"], ["ALL", "All"], ["DELIVERED", "Delivered"], ["CANCELLED", "Cancelled"]].map(([k, l]) => <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} className="rounded-full" onClick={() => setFilter(k!)}>{l}</Button>)}</div></div>
    {err && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{err}</p>}
    {orders.isLoading && <p className="mt-6 text-muted-foreground">Loading orders…</p>}
    {orders.data && list.length === 0 && <p className="mt-10 text-center text-muted-foreground">No orders here.</p>}
    <div className="mt-6 grid gap-4">{list.map((o) => {
      const idx = STATUS_STEPS.findIndex((s) => s.key === o.status); const next = STATUS_STEPS[idx + 1];
      const closed = o.status === "DELIVERED" || o.status === "CANCELLED";
      return <div key={o.id} className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{o.order_number} · {o.restaurant_name}</p><p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")} · ₹{+o.total} · {PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${o.status === "CANCELLED" ? "bg-destructive/15 text-destructive" : o.status === "DELIVERED" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>{labelOf(o.status)}</span></div>
        <p className="mt-2 text-sm text-muted-foreground">{(o.items as unknown as Line[]).map((l) => `${l.quantity} × ${l.name}`).join(", ")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!closed && next && <Button size="sm" className="rounded-full" disabled={busy === o.id} onClick={() => update(o.id, next.key)}>Mark as “{next.label}”</Button>}
          <Select value={o.status} onValueChange={(v) => update(o.id, v)} disabled={busy === o.id}><SelectTrigger className="h-9 w-52" aria-label={`Set status for ${o.order_number}`}><SelectValue /></SelectTrigger><SelectContent>{ALL.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select>
          {!closed && <Button size="sm" variant="ghost" className="text-destructive" disabled={busy === o.id} onClick={() => { if (window.confirm(`Cancel ${o.order_number}?`)) update(o.id, "CANCELLED"); }}>Cancel order</Button>}
        </div>
      </div>;
    })}</div>
  </div>;
}
