import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CreditCard, MapPin, ShieldCheck, Smartphone, Tag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/features/cart-context";
import { supabase } from "@/integrations/supabase/client";
import { applyCoupon, computeTotals, newOrderNumber, type CouponResult } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — CenFud" }, { name: "description", content: "Choose your delivery address and payment method to place your CenFud order." }, { property: "og:title", content: "Checkout — CenFud" }, { property: "og:description", content: "Place your CenFud food order." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CheckoutPage,
});

const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  full_name: z.string().trim().min(2, "Enter the receiver's name").max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address_line: z.string().trim().min(5, "Enter house / street").max(200),
  apartment: z.string().trim().max(100),
  area: z.string().trim().min(2, "Enter area").max(100),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().trim().min(2, "Enter state").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  instructions: z.string().trim().max(200),
});
type Address = z.infer<typeof addressSchema> & { id?: string };

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const addresses = useQuery({ queryKey: ["addresses", user.id], queryFn: async () => { const { data, error } = await supabase.from("addresses").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [payment, setPayment] = useState<"COD" | "UPI" | "CARD">("COD");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const list = addresses.data ?? [];
  const chosenId = selected ?? list[0]?.id ?? null;
  const chosen = list.find((a) => a.id === chosenId);
  const totals = computeTotals(subtotal, coupon);

  if (!items.length) return <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center"><h1 className="font-display text-3xl font-black">Your cart is empty</h1><p className="mt-2 text-muted-foreground">Add dishes before checking out.</p><Button asChild className="mt-6 rounded-full"><Link to="/restaurants" search={{ category: "" }}>Explore restaurants</Link></Button></div>;

  async function saveAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = addressSchema.safeParse({ ...f, label });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check the address");
    const { data, error: err } = await supabase.from("addresses").insert({ ...parsed.data, user_id: user.id, is_default: list.length === 0 }).select().single();
    if (err) return setError("Couldn't save the address. Please try again.");
    await qc.invalidateQueries({ queryKey: ["addresses", user.id] });
    setSelected(data.id); setShowForm(false);
  }

  function useCoupon() { setError(""); const r = applyCoupon(couponInput, subtotal); setCoupon(r); }

  async function placeOrder() {
    setError("");
    if (!chosen) return setError("Add a delivery address first.");
    if (payment === "UPI" && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) return setError("Enter a valid UPI ID, e.g. name@okaxis.");
    if (payment === "CARD") {
      const num = card.number.replace(/\s/g, "");
      if (!/^\d{16}$/.test(num)) return setError("Enter a 16-digit card number (test: 4242 4242 4242 4242).");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return setError("Enter expiry as MM/YY.");
      if (!/^\d{3}$/.test(card.cvv)) return setError("Enter a 3-digit CVV.");
      if (card.name.trim().length < 2) return setError("Enter the name on card.");
    }
    setPlacing(true);
    if (payment !== "COD") await new Promise((r) => setTimeout(r, 1500)); // simulated test payment
    const first = items[0]!;
    const { id: _id, user_id: _u, created_at: _c, is_default: _d, ...addr } = chosen;
    let orderId: string | null = null;
    for (let attempt = 0; attempt < 3 && !orderId; attempt++) {
      const { data, error: err } = await supabase.from("orders").insert({
        order_number: newOrderNumber(), user_id: user.id, restaurant_id: first.restaurantId, restaurant_name: first.restaurant,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        address: addr, payment_method: payment,
        subtotal: totals.subtotal, delivery_fee: totals.delivery, platform_fee: totals.platform, taxes: totals.taxes, discount: totals.discount, total: totals.total,
      }).select("id").single();
      if (data) orderId = data.id; else if (err && err.code !== "23505") break;
    }
    setPlacing(false);
    if (!orderId) return setError("We couldn't place your order. Please try again.");
    clear();
    await qc.invalidateQueries({ queryKey: ["orders"] });
    navigate({ to: "/orders/$id", params: { id: orderId }, search: { placed: true } });
  }

  return <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-28 pt-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-black">Checkout</h1>
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin className="text-primary" />Delivery address</h2>
        {addresses.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading addresses…</p> : <div className="mt-4 grid gap-3">
          {list.map((a) => <label key={a.id} className={`flex cursor-pointer gap-3 rounded-md border p-4 ${a.id === chosenId ? "border-primary bg-primary/5" : "border-border"}`}>
            <input type="radio" name="addr" className="mt-1 accent-primary" checked={a.id === chosenId} onChange={() => setSelected(a.id)} />
            <span className="text-sm"><strong>{a.label}</strong> · {a.full_name} · {a.phone}<br /><span className="text-muted-foreground">{[a.address_line, a.apartment, a.area, a.city, a.state].filter(Boolean).join(", ")} – {a.pincode}</span></span>
          </label>)}
          {!showForm && <Button variant="outline" className="justify-self-start rounded-full" onClick={() => setShowForm(true)}>+ Add new address</Button>}
        </div>}
        {(showForm || (!addresses.isLoading && list.length === 0)) && <form onSubmit={saveAddress} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-2 sm:col-span-2">{(["Home", "Work", "Other"] as const).map((l) => <Button key={l} type="button" size="sm" variant={label === l ? "default" : "outline"} className="rounded-full" onClick={() => setLabel(l)}>{l}</Button>)}</div>
          <Field name="full_name" label="Receiver name" /><Field name="phone" label="Mobile number" type="tel" />
          <Field name="address_line" label="House / street" className="sm:col-span-2" /><Field name="apartment" label="Apartment / landmark (optional)" />
          <Field name="area" label="Area" /><Field name="city" label="City" /><Field name="state" label="State" /><Field name="pincode" label="Pincode" inputMode="numeric" />
          <Field name="instructions" label="Delivery instructions (optional)" />
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" className="rounded-full">Save address</Button>{list.length > 0 && <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>}</div>
        </form>}
      </section>
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Payment method</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PayOption active={payment === "COD"} onClick={() => setPayment("COD")} icon={<Banknote />} title="Cash on delivery" sub="Pay when food arrives" />
          <PayOption active={payment === "UPI"} onClick={() => setPayment("UPI")} icon={<Smartphone />} title="UPI" sub="Test mode" />
          <PayOption active={payment === "CARD"} onClick={() => setPayment("CARD")} icon={<CreditCard />} title="Card" sub="Test mode" />
        </div>
        {payment !== "COD" && <p className="mt-4 rounded-md bg-brand-warm/15 p-3 text-xs font-semibold">Test mode — no real money is charged. Card details are never stored.</p>}
        {payment === "UPI" && <div className="mt-4"><Label htmlFor="upi">UPI ID</Label><Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@okaxis" className="mt-2 h-11" /></div>}
        {payment === "CARD" && <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="cn">Card number</Label><Input id="cn" inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} placeholder="4242 4242 4242 4242" className="mt-2 h-11" /></div>
          <div><Label htmlFor="ex">Expiry</Label><Input id="ex" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.slice(0, 5) })} placeholder="MM/YY" className="mt-2 h-11" /></div>
          <div><Label htmlFor="cvv">CVV</Label><Input id="cvv" type="password" autoComplete="off" inputMode="numeric" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} className="mt-2 h-11" /></div>
          <div className="sm:col-span-2"><Label htmlFor="nm">Name on card</Label><Input id="nm" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="mt-2 h-11" /></div>
        </div>}
      </section>
    </div>
    <aside className="h-fit rounded-lg bg-surface-dark p-6 text-surface-dark-foreground lg:sticky lg:top-28">
      <h2 className="font-display text-2xl font-bold">Order summary</h2>
      <p className="mt-1 text-sm text-surface-dark-muted">From {items[0]?.restaurant}</p>
      <ul className="mt-4 space-y-2 text-sm">{items.map((i) => <li key={i.id} className="flex justify-between gap-3"><span>{i.quantity} × {i.name}</span><span>₹{i.price * i.quantity}</span></li>)}</ul>
      <div className="mt-5 flex gap-2"><div className="relative flex-1"><Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="h-10 bg-background pl-9 text-foreground" /></div><Button variant="secondary" onClick={useCoupon} disabled={!couponInput.trim()}>Apply</Button></div>
      {coupon && (coupon.ok ? <p className="mt-2 text-xs font-semibold text-success">{coupon.code} applied — {coupon.label} <button className="ml-2 underline" onClick={() => { setCoupon(null); setCouponInput(""); }}>Remove</button></p> : <p className="mt-2 text-xs font-semibold text-destructive">{coupon.error}</p>)}
      <dl className="mt-5 space-y-2 border-t border-surface-dark-border pt-4 text-sm text-surface-dark-muted">
        <Row l="Subtotal" v={totals.subtotal} /><Row l="Delivery" v={totals.delivery} /><Row l="Platform fee" v={totals.platform} /><Row l="Taxes (5%)" v={totals.taxes} />{totals.discount > 0 && <Row l="Discount" v={-totals.discount} />}
      </dl>
      <div className="mt-4 flex justify-between border-t border-surface-dark-border pt-4 text-xl font-black"><span>Total</span><span>₹{totals.total}</span></div>
      {error && <p role="alert" className="mt-4 rounded-md bg-destructive/15 p-3 text-sm font-semibold text-destructive">{error}</p>}
      <Button size="lg" className="mt-5 h-12 w-full rounded-full" onClick={placeOrder} disabled={placing}>{placing ? (payment === "COD" ? "Placing order…" : "Processing test payment…") : payment === "COD" ? `Place order · ₹${totals.total}` : `Pay ₹${totals.total} & place order`}</Button>
      <p className="mt-3 flex items-center justify-center gap-1 text-xs text-surface-dark-muted"><ShieldCheck className="h-4 w-4" />Secure checkout</p>
    </aside>
  </div>;
}

function Field({ name, label, className, ...rest }: { name: string; label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className={className}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} className="mt-2 h-11" {...rest} /></div>;
}
function PayOption({ active, onClick, icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex items-center gap-3 rounded-md border p-4 text-left ${active ? "border-primary bg-primary/5" : "border-border"}`}><span className="text-primary">{icon}</span><span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-muted-foreground">{sub}</span></span></button>;
}
function Row({ l, v }: { l: string; v: number }) { return <div className="flex justify-between"><dt>{l}</dt><dd>{v < 0 ? `−₹${-v}` : `₹${v}`}</dd></div>; }
