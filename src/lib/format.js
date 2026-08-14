import { config } from "../config";

export function formatBaseAmount(amount, currencyCode) {
  const currency = currencyCode || config.DEFAULT_BASE_CURRENCY;
  if (amount === null) return "N/A";
  return new Intl.NumberFormat(config.DEFAULT_LOCALE, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatQuantity(quantity, assetCode) {
  if (quantity === null) return "N/A";
  const formatted = new Intl.NumberFormat(config.DEFAULT_LOCALE, {
    maximumSignificantDigits: 6,
  }).format(quantity);
  return `${formatted} ${assetCode}`;
}
