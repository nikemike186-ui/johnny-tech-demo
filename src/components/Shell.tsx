import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BatteryCharging,
  Cable,
  Headphones,
  MapPin,
  Menu,
  Moon,
  Package,
  ShieldCheck,
  Smartphone,
  Sun,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useStore,
  type Product,
  type Phone,
  conditionLabel,
  waLink,
  buyMessage,
} from "@/lib/store";

export function Navbar() {
  const { settings } = useStore();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("jt-dark") === "1");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("jt-dark", dark ? "1" : "0");
  }, [dark]);
  const links = [
    ["/", "Home"],
    ["/shop", "Shop"],
    ["/trade-in", "Trade-In"],
    ["/admin", "Admin"],
  ] as const;
  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          to="/"
          aria-label={`${settings.storeName} home`}
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-36 truncate text-sm font-semibold tracking-tight sm:max-w-none">
              {settings.storeName}
            </span>
            <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
              <MapPin className="h-3 w-3" />
              Zimbabwe
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(([to, l]) => (
            <Link
              key={to}
              to={to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              activeProps={{ className: "!bg-secondary !text-foreground font-medium" }}
              activeOptions={{ exact: to === "/" }}
            >
              {l}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
            title={`Switch to ${dark ? "light" : "dark"} mode`}
            onClick={() => setDark(!dark)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-b-2xl border-x-0 border-t border-border bg-background/95 p-5 pt-7 shadow-xl backdrop-blur-2xl md:hidden"
            >
              <SheetHeader className="mb-5 pr-10 text-left">
                <SheetTitle>Explore Johnny Tech</SheetTitle>
                <SheetDescription>Shop phones, accessories, and more.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {links.map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "!bg-secondary !text-foreground" }}
                    activeOptions={{ exact: to === "/" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Proudly serving Zimbabwe
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="glass-nav mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {settings.storeName}. iPhones & accessories.
        </p>
        <p>WhatsApp: +{settings.whatsapp}</p>
      </div>
    </footer>
  );
}

export function PhoneMockup({ hex, size = "md" }: { hex: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-80 w-40" : "h-44 w-[5.5rem]";
  return (
    <div
      className={`relative ${dims} rounded-[2rem] p-1.5 shadow-phone`}
      style={{ background: hex }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-screen">
        <div className="absolute left-1/2 top-2 h-3.5 w-1/3 -translate-x-1/2 rounded-full bg-island" />
        <div className="absolute inset-0 bg-screen-glow" />
      </div>
    </div>
  );
}

export function ProductCard({ p: first, variants }: { p: Product; variants?: Phone[] }) {
  const { settings } = useStore();
  const [sel, setSel] = useState(first.id);
  const opts = first.category === "iphone" && variants?.length ? variants : [first];
  const p = opts.find((v) => v.id === sel) ?? first;
  const phone = p.category === "iphone";
  return (
    <div className={`bento-card flex flex-col p-6 ${p.inStock ? "card-lift" : "opacity-60"}`}>
      <div className="flex justify-between">
        {phone ? (
          <span className={p.condition === "new" ? "badge-new" : "badge-cpo"}>
            {conditionLabel(p.condition)}
          </span>
        ) : (
          <span className="badge-glass">{p.accessoryType}</span>
        )}
        {!p.inStock && <span className="badge-sold">Sold Out</span>}
      </div>
      {phone ? (
        <div className="my-6 flex justify-center">
          <PhoneMockup hex={p.colorHex} />
        </div>
      ) : (
        <div className="my-6 flex h-44 items-center justify-center rounded-2xl bg-secondary/60 text-primary">
          <AccessoryIcon type={p.accessoryType} />
        </div>
      )}
      {phone && (
        <div className="mb-3 flex items-center gap-2">
          {opts
            .filter((v): v is Phone => v.category === "iphone")
            .map((v) => (
              <button
                key={v.id}
                aria-label={v.colorName}
                title={v.colorName}
                onClick={() => setSel(v.id)}
                className={`h-4 w-4 rounded-full ring-offset-2 ring-offset-background transition ${v.id === p.id ? "ring-2 ring-primary" : "ring-1 ring-border"}`}
                style={{ background: v.colorHex }}
              />
            ))}
          <span className="text-xs text-muted-foreground">{p.colorName}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{p.model}</h3>
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        {phone ? (
          <>
            <span className="chip">{p.storage}</span>
            <span className="chip">{p.battery}% Battery Health</span>
          </>
        ) : (
          <>
            <span className="chip">{p.compatibleWith}</span>
            <p className="mt-2 w-full text-sm text-muted-foreground">{p.description}</p>
          </>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-xl font-semibold text-primary">${p.price.toLocaleString()}</span>
        {p.inStock ? (
          <a
            href={waLink(settings.whatsapp, buyMessage(p))}
            target="_blank"
            rel="noreferrer"
            className="btn-apple text-sm"
          >
            Buy on WhatsApp
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Unavailable</span>
        )}
      </div>
    </div>
  );
}

function AccessoryIcon({ type }: { type: string }) {
  const name = type.toLowerCase();
  const Icon = name.includes("power")
    ? BatteryCharging
    : name.includes("charger")
      ? Cable
      : name.includes("screen")
        ? ShieldCheck
        : name.includes("audio")
          ? Headphones
          : Package;
  return <Icon aria-hidden="true" className="h-16 w-16 stroke-[1.25]" />;
}
