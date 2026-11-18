import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Trash2 } from "lucide-react";
import {
  useStore,
  setStore,
  resetStore,
  type Accessory,
  type Condition,
  type Phone,
  type Product,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Johnny Tech" },
      { name: "description", content: "Manage Johnny Tech store settings and iPhone inventory." },
      { property: "og:title", content: "Admin — Johnny Tech" },
      { property: "og:description", content: "Store management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { settings } = useStore();
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  if (!ok)
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin === settings.pin) setOk(true);
            else {
              setErr(true);
              setPin("");
            }
          }}
          className="bento-card w-full max-w-sm p-8 text-center"
        >
          <Lock className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your PIN</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setErr(false);
            }}
            className="field mt-6 w-full text-center text-2xl tracking-[0.5em]"
            maxLength={8}
            aria-label="PIN"
          />
          {err && <p className="mt-2 text-sm text-destructive">Incorrect PIN</p>}
          <button className="btn-apple mt-5 w-full">Unlock</button>
        </form>
      </main>
    );
  return <Dashboard />;
}

type PhoneDraft = Omit<Phone, "id" | "category" | "inStock">;
type AccessoryDraft = Omit<Accessory, "id" | "category" | "inStock">;
const blankPhone: PhoneDraft = {
  model: "",
  storage: "128GB",
  condition: "new",
  battery: 100,
  colorName: "",
  colorHex: "#3C3C3D",
  price: 0,
  featured: false,
};
const blankAccessory: AccessoryDraft = {
  model: "",
  accessoryType: "Power",
  description: "",
  compatibleWith: "",
  price: 0,
  featured: false,
};

function Dashboard() {
  const { settings, inventory } = useStore();
  const [s, setS] = useState(settings);
  const [kind, setKind] = useState<Product["category"]>("iphone");
  const [phone, setPhone] = useState(blankPhone);
  const [accessory, setAccessory] = useState(blankAccessory);
  const upd = (id: string, patch: Partial<Pick<Product, "price" | "featured" | "inStock">>) =>
    setStore((st) => ({
      ...st,
      inventory: st.inventory.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  const addProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const product: Product =
      kind === "iphone"
        ? { ...phone, id: Date.now().toString(), category: "iphone", inStock: true }
        : { ...accessory, id: Date.now().toString(), category: "accessory", inStock: true };
    if (!product.model.trim()) return;
    setStore((st) => ({ ...st, inventory: [product, ...st.inventory] }));
    setPhone(blankPhone);
    setAccessory(blankAccessory);
  };
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard.</h1>
        <button
          onClick={() => {
            if (confirm("Reset all settings and inventory to defaults?")) {
              resetStore();
              location.reload();
            }
          }}
          className="btn-ghost text-sm"
        >
          Reset to defaults
        </button>
      </div>

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Store Settings</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <L t="Store name">
            <input
              className="field w-full"
              value={s.storeName}
              onChange={(e) => setS({ ...s, storeName: e.target.value })}
            />
          </L>
          <L t="WhatsApp number (with country code)">
            <input
              className="field w-full"
              value={s.whatsapp}
              onChange={(e) => setS({ ...s, whatsapp: e.target.value })}
            />
          </L>
          <L t="Hero tagline" span>
            <input
              className="field w-full"
              value={s.tagline}
              onChange={(e) => setS({ ...s, tagline: e.target.value })}
            />
          </L>
          <L t="Admin PIN">
            <input
              className="field w-full"
              value={s.pin}
              onChange={(e) => setS({ ...s, pin: e.target.value })}
            />
          </L>
        </div>
        <button
          onClick={() => setStore((st) => ({ ...st, settings: s }))}
          className="btn-apple mt-5"
        >
          Save settings
        </button>
      </section>

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Add Product</h2>
        <form onSubmit={addProduct} className="mt-5 grid gap-4 sm:grid-cols-4">
          <L t="Product type">
            <select
              className="field w-full"
              value={kind}
              onChange={(e) => setKind(e.target.value as Product["category"])}
            >
              <option value="iphone">iPhone</option>
              <option value="accessory">Accessory</option>
            </select>
          </L>
          <L t={kind === "iphone" ? "Model" : "Product name"}>
            <input
              required
              className="field w-full"
              placeholder={kind === "iphone" ? "iPhone 16 Pro" : "MagSafe Power Pack"}
              value={kind === "iphone" ? phone.model : accessory.model}
              onChange={(e) =>
                kind === "iphone"
                  ? setPhone({ ...phone, model: e.target.value })
                  : setAccessory({ ...accessory, model: e.target.value })
              }
            />
          </L>
          {kind === "iphone" ? (
            <>
              <L t="Storage">
                <select
                  className="field w-full"
                  value={phone.storage}
                  onChange={(e) => setPhone({ ...phone, storage: e.target.value })}
                >
                  {["128GB", "256GB", "512GB", "1TB"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </L>
              <L t="Condition">
                <select
                  className="field w-full"
                  value={phone.condition}
                  onChange={(e) =>
                    setPhone({
                      ...phone,
                      condition: e.target.value as Condition,
                      battery: e.target.value === "new" ? 100 : phone.battery,
                    })
                  }
                >
                  <option value="new">New</option>
                  <option value="preowned">Pre-Owned</option>
                </select>
              </L>
              <L t="Battery health %">
                <input
                  type="number"
                  min={50}
                  max={100}
                  className="field w-full"
                  value={phone.battery}
                  onChange={(e) => setPhone({ ...phone, battery: +e.target.value })}
                />
              </L>
              <L t="Color name">
                <input
                  className="field w-full"
                  value={phone.colorName}
                  onChange={(e) => setPhone({ ...phone, colorName: e.target.value })}
                />
              </L>
              <L t="Color hex">
                <input
                  type="color"
                  className="field h-10 w-full p-1"
                  value={phone.colorHex}
                  onChange={(e) => setPhone({ ...phone, colorHex: e.target.value })}
                />
              </L>
            </>
          ) : (
            <>
              <L t="Accessory category">
                <select
                  className="field w-full"
                  value={accessory.accessoryType}
                  onChange={(e) => setAccessory({ ...accessory, accessoryType: e.target.value })}
                >
                  {["Power", "Charger", "Screen Protection", "Audio", "Case", "Cable", "Other"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </L>
              <L t="Compatible with">
                <input
                  className="field w-full"
                  placeholder="iPhone 12 and newer"
                  value={accessory.compatibleWith}
                  onChange={(e) => setAccessory({ ...accessory, compatibleWith: e.target.value })}
                />
              </L>
              <L t="Description" span>
                <input
                  className="field w-full"
                  value={accessory.description}
                  onChange={(e) => setAccessory({ ...accessory, description: e.target.value })}
                />
              </L>
            </>
          )}
          <L t="Price (USD)">
            <input
              type="number"
              min={0}
              className="field w-full"
              value={kind === "iphone" ? phone.price : accessory.price}
              onChange={(e) =>
                kind === "iphone"
                  ? setPhone({ ...phone, price: +e.target.value })
                  : setAccessory({ ...accessory, price: +e.target.value })
              }
            />
          </L>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={kind === "iphone" ? phone.featured : accessory.featured}
              onChange={(e) =>
                kind === "iphone"
                  ? setPhone({ ...phone, featured: e.target.checked })
                  : setAccessory({ ...accessory, featured: e.target.checked })
              }
            />{" "}
            Featured
          </label>
          <button className="btn-apple sm:col-span-4">Add to inventory</button>
        </form>
      </section>

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Inventory ({inventory.length})</h2>
        <div className="mt-5 divide-y divide-border">
          {inventory.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              {p.category === "iphone" && (
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-border"
                  style={{ background: p.colorHex }}
                />
              )}
              <div className="min-w-40 flex-1">
                <p className="font-medium">
                  {p.model}
                  {p.category === "iphone" ? ` · ${p.storage}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.category === "iphone"
                    ? `${p.colorName} · ${p.condition === "new" ? "New" : "Pre-Owned"} · ${p.battery}%`
                    : `${p.accessoryType} · ${p.compatibleWith}`}
                </p>
              </div>
              <label className="flex items-center gap-1">
                $
                <input
                  type="number"
                  className="field w-24 py-1"
                  value={p.price}
                  onChange={(e) => upd(p.id, { price: +e.target.value })}
                  aria-label="Price"
                />
              </label>
              <button
                onClick={() => upd(p.id, { featured: !p.featured })}
                className={p.featured ? "pill pill-active" : "pill"}
              >
                ★ Featured
              </button>
              <button
                onClick={() => upd(p.id, { inStock: !p.inStock })}
                className={p.inStock ? "badge-new" : "badge-sold"}
              >
                {p.inStock ? "In Stock" : "Sold Out"}
              </button>
              <button
                aria-label="Delete"
                onClick={() =>
                  setStore((st) => ({
                    ...st,
                    inventory: st.inventory.filter((x) => x.id !== p.id),
                  }))
                }
                className="rounded-full p-2 text-destructive hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function L({ t, children, span }: { t: string; children: React.ReactNode; span?: boolean }) {
  return (
    <label className={`block text-sm ${span ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-muted-foreground">{t}</span>
      {children}
    </label>
  );
}
