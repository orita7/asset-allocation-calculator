// A rate of 0 is unusable: it yields a zero quantity and an infinite inverse price.
function parseRate(value) {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function calculateAllocation({ amount, percent, assetCode, rates }) {
  const allocated =
    Number.isFinite(amount) && Number.isFinite(percent) ? (amount * percent) / 100 : null;

  const rate = parseRate(rates?.[assetCode]);
  const quantity = allocated !== null && rate !== null ? allocated * rate : null;

  return { assetCode, percent, allocated, quantity, rate };
}
