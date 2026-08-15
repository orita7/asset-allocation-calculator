import { config } from "../config";

export function formatBaseAmount(amount, currencyCode) {
  const currency = currencyCode || config.DEFAULT_BASE_CURRENCY;
  if (amount === null) return "N/A";
  return new Intl.NumberFormat(config.DEFAULT_LOCALE, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatQuantity(quantity) {
  if (quantity === null) return "N/A";
  return new Intl.NumberFormat(config.DEFAULT_LOCALE, {
    maximumSignificantDigits: 6,
  }).format(quantity);
}

export function formatUnitPrice(rate) {
  if (rate === null) return "N/A";
  return formatBaseAmount(1 / rate);
}

const MS_PER_MINUTE = 60_000;

export function formatRelativeTime(then, now) {
  if (then === null) return "";
  const minutes = Math.floor((now - then) / MS_PER_MINUTE);
  return minutes < 1 ? "just now" : `${minutes} min ago`;
}

export function currencySymbol(currencyCode) {
  const currency = currencyCode || config.DEFAULT_BASE_CURRENCY;
  try {
    return (
      new Intl.NumberFormat(config.DEFAULT_LOCALE, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
}
