import { describe, it, expect } from "vitest";
import { tradeCredit, defaultState, setStore, buyMessage, waLink } from "./store";
import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    },
  });
});

describe("trade-in", () => {
  it("flawless 90%+ gets full base value", () =>
    expect(tradeCredit("iPhone 13", "Flawless", "90%+")).toBe(300));
  it("applies body and battery multipliers", () =>
    expect(tradeCredit("iPhone 13", "Good", "85–89%")).toBe(Math.round(300 * 0.85 * 0.92)));
  it("default admin PIN is 1234", () => expect(defaultState().settings.pin).toBe("1234"));
});

describe("inventory", () => {
  it("restores accessory inventory from localStorage after a reload", async () => {
    const accessory = defaultState().inventory.find((product) => product.category === "accessory")!;
    setStore((state) => ({ ...state, inventory: [accessory, ...state.inventory] }));
    await vi.resetModules();
    const restoredStore = await import("./store");
    const { result } = renderHook(() => restoredStore.useStore());
    expect(result.current.inventory[0]?.id).toBe(accessory.id);
  });

  it("creates an order summary for phones and accessories", () => {
    const products = defaultState().inventory;
    const phone = products.find((product) => product.category === "iphone")!;
    const accessory = products.find((product) => product.category === "accessory")!;
    expect(buyMessage(phone)).toContain("Battery health: 100%");
    expect(buyMessage(accessory)).toContain("Category: Power");
    expect(decodeURIComponent(waLink("263 77 123 4567", buyMessage(accessory)))).toContain(
      "Please confirm availability",
    );
  });
});
