export const DELIVERY_FEE = 29;
export const PLATFORM_FEE = 10;
export const TAX_RATE = 0.05;

export type CouponResult = { ok: true; code: string; discount: number; freeDelivery: boolean; label: string } | { ok: false; error: string };

export function applyCoupon(raw: string, subtotal: number, now = new Date()): CouponResult {
  const code = raw.trim().toUpperCase();
  switch (code) {
    case "WELCOME100":
      if (subtotal < 299) return { ok: false, error: "WELCOME100 needs a minimum order of ₹299." };
      return { ok: true, code, discount: 100, freeDelivery: false, label: "₹100 off" };
    case "FREEDEL":
      return { ok: true, code, discount: 0, freeDelivery: true, label: "Free delivery" };
    case "CENFUD50":
      return { ok: true, code, discount: Math.min(Math.round(subtotal * 0.5), 120), freeDelivery: false, label: "50% off (up to ₹120)" };
    case "WEEKEND20": {
      const day = now.getDay();
      if (![0, 5, 6].includes(day)) return { ok: false, error: "WEEKEND20 works Friday to Sunday only." };
      if (subtotal < 499) return { ok: false, error: "WEEKEND20 needs a minimum order of ₹499." };
      return { ok: true, code, discount: Math.round(subtotal * 0.2), freeDelivery: false, label: "20% off" };
    }
    default:
      return { ok: false, error: "That coupon code isn't valid." };
  }
}

export function computeTotals(subtotal: number, coupon?: CouponResult | null) {
  const c = coupon && coupon.ok ? coupon : null;
  const delivery = subtotal > 0 && !c?.freeDelivery ? DELIVERY_FEE : 0;
  const platform = subtotal > 0 ? PLATFORM_FEE : 0;
  const taxes = Math.round(subtotal * TAX_RATE);
  const discount = Math.min(c?.discount ?? 0, subtotal);
  return { subtotal, delivery, platform, taxes, discount, total: subtotal + delivery + platform + taxes - discount };
}

export function newOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CFD-${ymd}-${Math.floor(10000 + Math.random() * 90000)}`;
}

export const STATUS_STEPS = [
  { key: "PLACED", label: "Order placed", at: 0 },
  { key: "CONFIRMED", label: "Restaurant confirmed", at: 1 },
  { key: "PREPARING", label: "Preparing your food", at: 3 },
  { key: "READY", label: "Ready for pickup", at: 12 },
  { key: "PICKED_UP", label: "Picked up by rider", at: 15 },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", at: 17 },
  { key: "DELIVERED", label: "Delivered", at: 30 },
] as const;

/** Status is set by restaurant staff in the admin panel. */
export function currentStatusIndex(status: string) {
  if (status === "CANCELLED") return -1;
  return Math.max(0, STATUS_STEPS.findIndex((s) => s.key === status));
}

export const PAYMENT_LABELS: Record<string, string> = { COD: "Cash on delivery", UPI: "UPI (test mode)", CARD: "Card (test mode)" };
