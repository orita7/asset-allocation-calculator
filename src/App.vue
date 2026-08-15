<script setup>
import { ref, computed } from "vue";
import { config } from "./config";
import { calculateAllocation } from "./lib/allocation";
import { fakeRates } from "./lib/fakeRates";
import { AppState } from "./lib/appState";
import AllocationCard from "./components/AllocationCard.vue";

const isDev = import.meta.env.DEV;

// Locks the shape useExchangeRates will have in Phase 4 (real fetch + refresh).
function useExchangeRates() {
  const rates = ref(fakeRates.data.rates);
  const fetchedAt = ref(Date.now());
  const isLoading = ref(false);
  const error = ref(null);
  const refresh = () => {};
  return { rates, fetchedAt, isLoading, error, refresh };
}

const { rates } = useExchangeRates();

// DEV override; Phase 4 replaces this with a computed derived from rates/isLoading/error.
const appState = ref(AppState.READY);

const splitPercent = config.DEFAULT_SPLIT_PERCENT;
const otherPercent = 100 - splitPercent;

const allocationA = computed(() =>
  calculateAllocation({
    amount: config.DEFAULT_AMOUNT,
    percent: splitPercent,
    assetCode: config.DEFAULT_ASSETS[0],
    rates: rates.value,
  }),
);
const allocationB = computed(() =>
  calculateAllocation({
    amount: config.DEFAULT_AMOUNT,
    percent: otherPercent,
    assetCode: config.DEFAULT_ASSETS[1],
    rates: rates.value,
  }),
);
</script>

<template>
  <main id="main" class="main">
    <section class="calculator">
      <header class="calculator__header">
        <span class="calculator__title">CoinSplit</span>
        <span class="calculator__strategy">{{ splitPercent }} / {{ otherPercent }} strategy</span>
      </header>

      <select
        v-if="isDev"
        v-model="appState"
        class="dev-override"
        aria-label="Dev: app state override"
      >
        <option v-for="value in Object.values(AppState)" :key="value" :value="value">
          {{ value }}
        </option>
      </select>

      <h1 class="calculator__headline">Build your crypto <em>allocation.</em></h1>
      <div class="calculator__results">
        <AllocationCard
          variant="asset-a"
          :status="appState"
          :asset-code="allocationA.assetCode"
          :percent="allocationA.percent"
          :allocated="allocationA.allocated"
          :quantity="allocationA.quantity"
          :rate="allocationA.rate"
        />
        <AllocationCard
          variant="asset-b"
          :status="appState"
          :asset-code="allocationB.assetCode"
          :percent="allocationB.percent"
          :allocated="allocationB.allocated"
          :quantity="allocationB.quantity"
          :rate="allocationB.rate"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 clamp(0px, 4vw, 56px) clamp(0px, 4vw, 56px);
}

.calculator {
  max-width: 1000px;
  width: 100%;
  border-radius: var(--radius-xl);
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-page-start) 0%,
    var(--color-page-mid) 58%,
    var(--color-page-end) 100%
  );
  margin: var(--space-8) 0;
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 4vw, 34px) clamp(20px, 4vw, 44px) clamp(24px, 3vw, 30px);
}

.calculator__header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-6);
}

.calculator__title {
  font-weight: 700;
  font-size: var(--font-size-base);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.calculator__strategy {
  margin-left: auto;
  font-weight: 700;
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-widest);
  text-transform: uppercase;
  color: var(--color-text-dim);
}

.calculator__headline {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  line-height: 1.05;
  color: #fff;
  margin-bottom: var(--space-6);
  text-wrap: pretty;
}

.calculator__headline em {
  font-style: normal;
  color: var(--color-text-accent);
}

.dev-override {
  align-self: flex-end;
  margin-bottom: var(--space-4);
}

.calculator__results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

@media (max-width: 720px) {
  .calculator {
    min-height: 100dvh;
  }
  .calculator__assets,
  .calculator__results {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}
</style>
