import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  tradeModels,
  bodyConditions,
  batteryConditions,
  tradeCredit,
  waLink,
  conditionLabel,
  type Phone,
} from "@/lib/store";
import { PhoneMockup } from "@/components/Shell";

export const Route = createFileRoute("/trade-in")({
  head: () => ({
    meta: [
      { title: "Trade-In & Swap Estimator — Johnny Tech" },
      {
        name: "description",
        content:
          "Estimate your iPhone trade-in credit and cash top-up instantly, then send the quote on WhatsApp.",
      },
      { property: "og:title", content: "Trade-In & Swap Estimator — Johnny Tech" },
      {
        property: "og:description",
        content: "Instant iPhone trade-in credit and top-up estimate.",
      },
    ],
  }),
  component: TradeIn,
});

function TradeIn() {
  const { inventory, settings } = useStore();
  const avail = inventory.filter(
    (product): product is Phone => product.category === "iphone" && product.inStock,
  );
  const [model, setModel] = useState("iPhone 13");
  const [body, setBody] = useState<keyof typeof bodyConditions>("Good");
  const [battery, setBattery] = useState<keyof typeof batteryConditions>("85–89%");
  const [targetId, setTargetId] = useState("");
  const target = avail.find((p) => p.id === targetId) ?? avail[0];
  const credit = tradeCredit(model, body, battery);
  const topUp = target ? Math.max(0, target.price - credit) : 0;
  const msg = target
    ? `Hi Johnny Tech! Swap quote request:\n\nMy phone: ${model}\n• Body: ${body}\n• Battery: ${battery}\n\nTarget: ${target.model} ${target.storage} (${target.colorName}, ${conditionLabel(target.condition)}, ${target.battery}% battery) — $${target.price}\n\nEstimated trade-in credit: $${credit}\nCash top-up: $${topUp}`
    : "";
  const Opt = <T extends string>({
    label,
    value,
    opts,
    set,
  }: {
    label: string;
    value: T;
    opts: readonly T[];
    set: (v: T) => void;
  }) => (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => set(o)}
            className={value === o ? "pill pill-active" : "pill"}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <main className="mx-auto max-w-3xl px-4 pt-12 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Trade in. Trade up.</h1>
      <p className="mt-3 text-lg text-muted-foreground">Get an instant estimate for your swap.</p>
      <div className="bento-card mt-10 grid gap-8 p-6 text-left sm:p-8 md:grid-cols-5">
        <div className="space-y-7 md:col-span-3">
          <div>
            <p className="mb-2 text-sm font-medium">Your current iPhone</p>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="field w-full"
            >
              {Object.keys(tradeModels).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <Opt
            label="Physical condition"
            value={body}
            opts={Object.keys(bodyConditions) as (keyof typeof bodyConditions)[]}
            set={setBody}
          />
          <Opt
            label="Battery health"
            value={battery}
            opts={Object.keys(batteryConditions) as (keyof typeof batteryConditions)[]}
            set={setBattery}
          />
          <div>
            <p className="mb-2 text-sm font-medium">iPhone you want</p>
            <select
              value={target?.id ?? ""}
              onChange={(e) => setTargetId(e.target.value)}
              className="field w-full"
            >
              {avail.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.model} · {p.storage} · {p.colorName} · ${p.price}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="glass-summary flex flex-col items-center text-center md:col-span-2">
          {target && <PhoneMockup hex={target.colorHex} />}
          <p className="mt-6 text-sm text-muted-foreground">Estimated Trade-In Credit</p>
          <p className="text-4xl font-semibold text-primary">${credit}</p>
          <p className="mt-5 text-sm text-muted-foreground">Cash Top-Up Difference</p>
          <p className="text-5xl font-semibold tracking-tight">${topUp}</p>
          {target && (
            <a
              href={waLink(settings.whatsapp, msg)}
              target="_blank"
              rel="noreferrer"
              className="btn-apple mt-8 w-full"
            >
              Send Quote on WhatsApp
            </a>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Final value confirmed after in-store inspection.
          </p>
        </div>
      </div>
    </main>
  );
}
