import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchRates } from "./coinbase";
import { config } from "../config";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("fetchRates", () => {
  it("returns rates when required assets are usable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          data: { currency: "USD", rates: { BTC: "0.00002", ETH: "0.0004" } },
        }),
      ),
    );

    const rates = await fetchRates({
      base: "USD",
      requiredAssets: ["BTC", "ETH"],
    });

    expect(rates.BTC).toBe("0.00002");
    expect(fetch).toHaveBeenCalledWith(
      `${config.COINBASE_EXCHANGE_RATES_URL}?currency=USD`,
      expect.objectContaining({ signal: undefined }),
    );
  });

  it("rejects a 200 that is missing a required asset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ data: { rates: { BTC: "0.00002" } } })),
    );

    await expect(fetchRates({ base: "USD", requiredAssets: ["BTC", "ETH"] })).rejects.toMatchObject(
      {
        name: "ApiError",
        kind: "shape",
      },
    );
  });

  it("maps HTTP failures and rethrows abort", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, { ok: false, status: 500 })),
    );
    await expect(fetchRates({ base: "USD" })).rejects.toBeInstanceOf(ApiError);

    const abort = new DOMException("Aborted", "AbortError");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw abort;
      }),
    );
    await expect(fetchRates({ base: "USD" })).rejects.toBe(abort);
  });
});
