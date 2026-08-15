import { describe, expect, it } from "vitest";
import { calculateAllocation, parseRate } from "./allocation";

describe("parseRate", () => {
  it("parses Coinbase string rates", () => {
    expect(parseRate("0.00002")).toBe(0.00002);
  });

  it("rejects zero, negative, and non-numeric values", () => {
    expect(parseRate("0")).toBeNull();
    expect(parseRate("-1")).toBeNull();
    expect(parseRate("n/a")).toBeNull();
    expect(parseRate(undefined)).toBeNull();
  });
});

describe("calculateAllocation", () => {
  const rates = { BTC: "0.00002", ETH: "0.0004" };

  it("uses crypto-per-USD (multiply), not USD-per-coin (divide)", () => {
    const { allocated, quantity } = calculateAllocation({
      amount: 10_000,
      percent: 70,
      assetCode: "BTC",
      rates,
    });

    expect(allocated).toBe(7000);
    expect(quantity).toBe(0.14);
    expect(quantity).not.toBe(7000 / 0.00002);
  });

  it("applies the remaining 30% to the second asset", () => {
    const { allocated, quantity } = calculateAllocation({
      amount: 10_000,
      percent: 30,
      assetCode: "ETH",
      rates,
    });

    expect(allocated).toBe(3000);
    expect(quantity).toBe(1.2);
  });

  it("returns null quantity when the asset rate is missing", () => {
    const { rate, quantity, allocated } = calculateAllocation({
      amount: 10_000,
      percent: 70,
      assetCode: "BTC",
      rates: {},
    });

    expect(allocated).toBe(7000);
    expect(rate).toBeNull();
    expect(quantity).toBeNull();
  });
});
