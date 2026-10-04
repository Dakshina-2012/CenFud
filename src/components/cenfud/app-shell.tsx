import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, MapPin, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/features/cart-context";
import logo from "@/assets/cenfud-logo.png.asset.json";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="CenFud home" className="shrink-0"><img src={logo.url} alt="CenFud" className="h-14 w-14 rounded-full object-cover" /></Link>
        <nav className="hidden items-center gap-7 lg:flex"><Link to="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>Home</Link><Link to="/restaurants" search={{ category: "" }} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>Restaurants</Link><Link to="/offers" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>Offers</Link></nav>
        <button type="button" className="ml-auto hidden min-w-0 items-center gap-2 text-left text-sm lg:flex"><MapPin className="text-primary" /><span className="min-w-0"><span className="block text-xs text-muted-foreground">Deliver to</span><span className="block max-w-40 truncate font-semibold">Add your location</span></span></button>
        <div className="relative hidden w-full max-w-64 xl:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 rounded-full pl-10" placeholder="Search food or restaurants" /></div>
        <Button asChild variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex"><Link to="/favorites" aria-label="Favorites"><Heart /></Link></Button>
        <Button asChild variant="ghost" size="icon" className="relative rounded-full"><Link to="/cart" aria-label={`Cart with ${count} items`}><ShoppingBag />{count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-warm px-1 text-[10px] font-bold text-brand-warm-foreground">{count}</span>}</Link></Button>
        <Button asChild className="hidden rounded-full sm:inline-flex"><Link to="/auth"><UserRound />Sign in</Link></Button>
        <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu"><Menu /></Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Explore CenFud</SheetTitle></SheetHeader><nav className="mt-8 grid gap-2"><Button asChild variant={pathname === "/" ? "secondary" : "ghost"} className="justify-start"><Link to="/">Home</Link></Button><Button asChild variant={pathname === "/restaurants" ? "secondary" : "ghost"} className="justify-start"><Link to="/restaurants" search={{ category: "" }}>Restaurants</Link></Button><Button asChild variant={pathname === "/offers" ? "secondary" : "ghost"} className="justify-start"><Link to="/offers">Offers</Link></Button><Button asChild variant="ghost" className="justify-start"><Link to="/favorites">Favorites</Link></Button><Button asChild className="mt-4"><Link to="/auth">Sign in or join</Link></Button></nav></SheetContent></Sheet>
      </div>
    </header>
    <main>{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <MobileLink to="/" label="Home" icon={<Home />} /><MobileLink to="/restaurants" label="Explore" icon={<Search />} /><MobileLink to="/favorites" label="Saved" icon={<Heart />} /><MobileLink to="/cart" label="Cart" icon={<ShoppingBag />} badge={count} /><MobileLink to="/auth" label="Account" icon={<UserRound />} />
    </nav>
  </div>;
}
function MobileLink({ to, label, icon, badge }: { to: "/" | "/restaurants" | "/favorites" | "/cart" | "/auth"; label: string; icon: ReactNode; badge?: number }) { const content = <>{icon}{label}{badge ? <span className="absolute right-4 top-2 rounded-full bg-brand-warm px-1.5 text-[9px] text-brand-warm-foreground">{badge}</span> : null}</>; const classes = "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground"; if (to === "/restaurants") return <Link to="/restaurants" search={{ category: "" }} className={classes} activeProps={{ className: "text-primary" }}>{content}</Link>; return <Link to={to} className={classes} activeProps={{ className: "text-primary" }}>{content}</Link>; }
