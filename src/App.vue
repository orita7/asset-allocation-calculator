<script setup>
import { ref, computed } from "vue";
import { config } from "./config";
import { calculateAllocation } from "./lib/allocation";
import { useExchangeRates } from "./composables/useExchangeRates";
import { AppState } from "./lib/appState";
import AllocationCard from "./components/AllocationCard.vue";
import AmountCard from "./components/AmountCard.vue";
import StatusBar from "./components/StatusBar.vue";

const isDev = import.meta.env.DEV;
// Flip to true to bring back the state-override select for debugging.
const showDevOverride = false;

const { rates, fetchedAt, isLoading, error, isStale, refresh } = useExchangeRates();

const realAppState = computed(() => {
  if (isLoading.value) return rates.value ? AppState.REFRESHING : AppState.LOADING;
  if (!rates.value) return error.value ? AppState.ERROR_EMPTY : AppState.LOADING;
  if (error.value) return AppState.ERROR_STALE;
  if (isStale.value) return AppState.STALE;
  return AppState.READY;
});

// DEV override wins over the real state when set, so every state stays previewable
// without needing real network conditions to reach it.
const devOverride = ref(null);
const appState = computed(() => devOverride.value ?? realAppState.value);

const amount = ref(config.DEFAULT_AMOUNT);
const splitPercent = ref(config.DEFAULT_SPLIT_PERCENT);
const otherPercent = computed(() => 100 - splitPercent.value);

const allocationA = computed(() =>
  calculateAllocation({
    amount: amount.value,
    percent: splitPercent.value,
    assetCode: config.DEFAULT_ASSETS[0],
    rates: rates.value,
  }),
);
const allocationB = computed(() =>
  calculateAllocation({
    amount: amount.value,
    percent: otherPercent.value,
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
        v-if="isDev && showDevOverride"
        v-model="devOverride"
        class="dev-override"
        aria-label="Dev: app state override"
      >
        <option :value="null">Auto</option>
        <option v-for="value in Object.values(AppState)" :key="value" :value="value">
          {{ value }}
        </option>
      </select>

      <h1 class="calculator__headline">Build your crypto <em>allocation.</em></h1>

      <AmountCard
        v-model:amount="amount"
        v-model:split-percent="splitPercent"
        :currency="config.DEFAULT_BASE_CURRENCY"
        :asset-a="config.DEFAULT_ASSETS[0]"
        :asset-b="config.DEFAULT_ASSETS[1]"
        :allocated-a="allocationA.allocated"
        :allocated-b="allocationB.allocated"
      />

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

      <StatusBar :status="appState" :fetched-at="fetchedAt" @refresh="refresh" />
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
  --calculator-padding-x: clamp(20px, 4vw, 44px);
  --calculator-padding-bottom: clamp(24px, 3vw, 30px);
  max-width: 1000px;
  width: 100%;
  border-radius: var(--radius-xl);
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
  padding: clamp(24px, 4vw, 34px) var(--calculator-padding-x) var(--calculator-padding-bottom);
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
  margin-bottom: var(--space-6);
}

@media (max-width: 720px) {
  .calculator__assets,
  .calculator__results {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}
</style>
