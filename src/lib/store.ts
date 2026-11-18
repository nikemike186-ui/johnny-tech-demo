import { useSyncExternalStore } from "react";

export type Condition = "new" | "preowned";
export interface ProductBase {
  id: string;
  model: string;
  price: number;
  featured: boolean;
  inStock: boolean;
}
export interface Phone extends ProductBase {
  category: "iphone";
  storage: string;
  condition: Condition;
  battery: number;
  colorName: string;
  colorHex: string;
}
export interface Accessory extends ProductBase {
  category: "accessory";
  accessoryType: string;
  description: string;
  compatibleWith: string;
}
export type Product = Phone | Accessory;
export interface Settings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  pin: string;
}
export interface StoreState {
  settings: Settings;
  inventory: Product[];
}

const KEY = "johnny-tech-store-v1";

export function defaultState(): StoreState {
  const p = (
    id: string,
    model: string,
    storage: string,
    condition: Condition,
    battery: number,
    colorName: string,
    colorHex: string,
    price: number,
    featured = false,
  ): Phone => ({
    id,
    model,
    category: "iphone",
    storage,
    condition,
    battery,
    colorName,
    colorHex,
    price,
    featured,
    inStock: true,
  });
  const a = (
    id: string,
    model: string,
    accessoryType: string,
    description: string,
    compatibleWith: string,
    price: number,
    featured = false,
  ): Accessory => ({
    id,
    model,
    category: "accessory",
    accessoryType,
    description,
    compatibleWith,
    price,
    featured,
    inStock: true,
  });
  return {
    settings: {
      storeName: "Johnny Tech",
      tagline: "Your Next iPhone. New or Certified Pre-Owned.",
      whatsapp: "263771234567",
      pin: "1234",
    },
    inventory: [
      p("1", "iPhone 16 Pro Max", "256GB", "new", 100, "Desert Titanium", "#BFA48F", 1199, true),
      p("2", "iPhone 16 Pro", "128GB", "new", 100, "Black Titanium", "#3C3C3D", 999, true),
      p("3", "iPhone 16", "128GB", "new", 100, "Ultramarine", "#9AADF6", 799),
      p(
        "4",
        "iPhone 15 Pro Max",
        "256GB",
        "preowned",
        94,
        "Natural Titanium",
        "#BEB9AE",
        849,
        true,
      ),
      p("5", "iPhone 15 Pro", "128GB", "preowned", 91, "Blue Titanium", "#3F4A58", 699),
      p("6", "iPhone 14 Pro", "256GB", "preowned", 88, "Deep Purple", "#594F63", 579, true),
      p("7", "iPhone 13", "128GB", "preowned", 86, "Midnight", "#232A31", 379),
      p("8", "iPhone 15", "512GB", "new", 100, "Pink", "#F2D8D8", 899),
      a(
        "9",
        "MagSafe Power Pack",
        "Power",
        "Portable magnetic charging for your iPhone on the go.",
        "iPhone 12 and newer",
        79,
        true,
      ),
      a(
        "10",
        "20W USB-C Fast Charger",
        "Charger",
        "Compact fast charger with a USB-C port.",
        "USB-C devices",
        25,
      ),
      a(
        "11",
        "Tempered Glass Screen Guard",
        "Screen Protection",
        "Scratch-resistant tempered glass with an easy-fit applicator.",
        "iPhone 15 Pro",
        12,
      ),
      a(
        "12",
        "Wireless Noise-Cancelling Earbuds",
        "Audio",
        "Wireless audio with a compact charging case.",
        "Bluetooth devices",
        89,
        true,
      ),
    ],
  };
}

let cache: StoreState | null = null;
const listeners = new Set<() => void>();
const serverSnap = defaultState();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type StoredProduct = Product | (Omit<Phone, "category"> & { category?: undefined });

function isProduct(value: unknown): value is StoredProduct {
  if (
    !isRecord(value) ||
    typeof value["id"] !== "string" ||
    typeof value["model"] !== "string" ||
    typeof value["price"] !== "number" ||
    typeof value["featured"] !== "boolean" ||
    typeof value["inStock"] !== "boolean"
  )
    return false;
  if (value["category"] === "accessory") {
    return (
      typeof value["accessoryType"] === "string" &&
      typeof value["description"] === "string" &&
      typeof value["compatibleWith"] === "string"
    );
  }
  return (
    (value["category"] === "iphone" || value["category"] === undefined) &&
    typeof value["storage"] === "string" &&
    (value["condition"] === "new" || value["condition"] === "preowned") &&
    typeof value["battery"] === "number" &&
    typeof value["colorName"] === "string" &&
    typeof value["colorHex"] === "string"
  );
}

function restoreState(value: unknown): StoreState | null {
  if (!isRecord(value) || !isRecord(value["settings"]) || !Array.isArray(value["inventory"]))
    return null;
  const settings = value["settings"];
  const inventory = value["inventory"];
  if (
    typeof settings["storeName"] !== "string" ||
    typeof settings["tagline"] !== "string" ||
    typeof settings["whatsapp"] !== "string" ||
    typeof settings["pin"] !== "string" ||
    !inventory.every(isProduct)
  )
    return null;
  return {
    settings: {
      storeName: settings["storeName"],
      tagline: settings["tagline"],
      whatsapp: settings["whatsapp"],
      pin: settings["pin"],
    },
    inventory: inventory.map((product): Product =>
      product.category === "accessory" ? product : { ...product, category: "iphone" },
    ),
  };
}

function read(): StoreState {
  if (cache) return cache;
  if (typeof window === "undefined") return serverSnap;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    cache = defaultState();
    return cache;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Unable to parse Johnny Tech inventory from localStorage.", error);
    cache = defaultState();
    return cache;
  }
  const restored = restoreState(parsed);
  if (!restored) {
    console.error("Johnny Tech inventory in localStorage has an invalid shape; using defaults.");
    cache = defaultState();
    return cache;
  }
  cache = restored;
  return cache!;
}
export function setStore(fn: (s: StoreState) => StoreState) {
  const next = fn(read());
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}
export function resetStore() {
  setStore(() => defaultState());
}
export function useStore(): StoreState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const h = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          l();
        }
      };
      window.addEventListener("storage", h);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", h);
      };
    },
    read,
    () => serverSnap,
  );
}

export const conditionLabel = (c: Condition) =>
  c === "new" ? "Brand New Sealed" : "Certified Pre-Owned";
export const waLink = (num: string, text: string) =>
  `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
export function buyMessage(product: Product): string {
  const details =
    product.category === "iphone"
      ? `Storage: ${product.storage}\nFinish: ${product.colorName}\nCondition: ${conditionLabel(product.condition)}\nBattery health: ${product.battery}%`
      : `Category: ${product.accessoryType}\nDetails: ${product.description}\nCompatible with: ${product.compatibleWith}`;
  return `Hello Johnny Tech,\n\nI'd like to place an order:\n\nProduct: ${product.model}\n${details}\nPrice: $${product.price.toLocaleString()}\n\nPlease confirm availability and delivery options.\nThank you!`;
}

/* Trade-in */
export const tradeModels: Record<string, number> = {
  "iPhone 11": 140,
  "iPhone 11 Pro": 180,
  "iPhone 12": 220,
  "iPhone 12 Pro": 280,
  "iPhone 13": 300,
  "iPhone 13 Pro": 390,
  "iPhone 14": 380,
  "iPhone 14 Pro": 500,
  "iPhone 15": 480,
  "iPhone 15 Pro": 600,
  "iPhone 15 Pro Max": 700,
  "iPhone 16 Pro": 780,
};
export const bodyConditions = { Flawless: 1, Good: 0.85, Fair: 0.65, Cracked: 0.4 } as const;
export const batteryConditions = {
  "90%+": 1,
  "85–89%": 0.92,
  "80–84%": 0.85,
  "Below 80%": 0.72,
} as const;
export function tradeCredit(
  model: string,
  body: keyof typeof bodyConditions,
  battery: keyof typeof batteryConditions,
) {
  return Math.round((tradeModels[model] ?? 0) * bodyConditions[body] * batteryConditions[battery]);
}
