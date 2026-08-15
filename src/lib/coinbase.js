import { config } from "../config";
import { parseRate } from "./allocation";

export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export async function fetchRates({ base, signal, requiredAssets = [] }) {
  let response;
  try {
    response = await fetch(
      `${config.COINBASE_EXCHANGE_RATES_URL}?currency=${encodeURIComponent(base)}`,
      { signal },
    );
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("offline", "Network request failed");
  }

  if (!response.ok) {
    throw new ApiError("http", `Request failed with status ${response.status}`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("shape", "Response was not valid JSON");
  }

  const rates = body?.data?.rates;
  if (!rates || typeof rates !== "object") {
    throw new ApiError("shape", "Unexpected response shape");
  }

  const missing = requiredAssets.filter((code) => parseRate(rates[code]) === null);
  if (missing.length > 0) {
    throw new ApiError("shape", `Missing usable rate for ${missing.join(", ")}`);
  }

  return rates;
}
