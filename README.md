# CoinSplit

Split a USD amount across two crypto assets and see the estimated quantity you'd
get at live Coinbase rates.

Live demo: [https://coinsplit-orita.vercel.app](https://coinsplit-orita.vercel.app)

## Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — dev server with hot reload
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build
- `npm run lint` / `npm run format:check` — same checks CI would run

## What it does

Enter an amount, adjust the split with the slider, and both result cards update
live — allocated USD and estimated quantity per asset, from rates fetched from
Coinbase's public exchange-rates endpoint. Rates refresh every 60 seconds, pause
while the tab is hidden, and catch up immediately when you switch back.
