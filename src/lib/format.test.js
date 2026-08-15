import { describe, expect, it } from "vitest";
import {
  currencySymbol,
  formatBaseAmount,
  formatQuantity,
  formatRelativeTime,
  formatUnitPrice,
} from "./format";

describe("formatBaseAmount", () => {
  it("returns N/A for null", () => {
    expect(formatBaseAmount(null, "USD")).toBe("N/A");
  });

  it("formats USD with two decimal places", () => {
    expect(formatBaseAmount(7000, "USD")).toBe("$7,000.00");
  });

  it("formats JPY with zero decimal places, not a hardcoded toFixed(2)", () => {
    expect(formatBaseAmount(7000, "JPY")).toBe("¥7,000");
  });
});

describe("formatQuantity", () => {
  it("returns N/A for null", () => {
    expect(formatQuantity(null)).toBe("N/A");
  });

  it("rounds a sub-1 quantity to 6 significant digits", () => {
    expect(formatQuantity(0.123456789)).toBe("0.123457");
  });

  it("rounds a large quantity to 6 significant digits", () => {
    expect(formatQuantity(1234567)).toBe("1,234,570");
  });
});

describe("formatUnitPrice", () => {
  it("returns N/A for null", () => {
    expect(formatUnitPrice(null)).toBe("N/A");
  });

  it("inverts the rate into a base-currency unit price", () => {
    expect(formatUnitPrice(0.00002)).toBe("$50,000.00");
  });
});

describe("currencySymbol", () => {
  it("resolves known currency codes to their symbol", () => {
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("JPY")).toBe("¥");
    expect(currencySymbol("EUR")).toBe("€");
  });

  it("falls back to the raw code when Intl rejects it", () => {
    expect(currencySymbol("NOTREAL")).toBe("NOTREAL");
  });
});

describe("formatRelativeTime", () => {
  it("returns an empty string when there's no timestamp yet", () => {
    expect(formatRelativeTime(null, Date.now())).toBe("");
  });

  it("reads as just now under a minute", () => {
    const then = 1_000_000;
    expect(formatRelativeTime(then, then + 59_999)).toBe("just now");
  });

  it("switches to N min ago at the one-minute boundary", () => {
    const then = 1_000_000;
    expect(formatRelativeTime(then, then + 60_000)).toBe("1 min ago");
    expect(formatRelativeTime(then, then + 5 * 60_000)).toBe("5 min ago");
  });
});
